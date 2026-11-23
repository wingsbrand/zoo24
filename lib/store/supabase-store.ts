// Magazyn stanu w Supabase (PostgREST, bez dodatkowych zależności). Jeden wiersz `app_state.id = 'main'` (JSONB + wersja).
// - read(): synchroniczny odczyt kopii w pamięci (hydratowanej przy starcie modułu), odświeżanej w tle (stale-while-revalidate).
// - transact(): zawsze na ŚWIEŻYM stanie z bazy; zapis warunkowy `version=eq.N` (optymistyczna współbieżność) + ponowienie.
//   Zachowuje semantykę lease/idempotencji publishera (konkurencyjny zapis = ponowne wykonanie fn na nowym stanie).
// Klucz sekretny tylko z env serwera (`ZOO24_SUPABASE_SECRET_KEY`); nigdy w repo, logach ani przeglądarce.
import type { AppState } from "../types";
import type { Store } from "./file-store";
import { redactString } from "../security/redact";

const ROW_ID = "main";

/** Usuwa białe znaki; odrzuca znaki niedozwolone w nagłówku HTTP. Komunikat błędu NIE zawiera wartości klucza. */
export function normalizeSecretKey(raw: string): string {
  const key = (raw ?? "").replace(/\s+/g, "");
  if (!key || !/^[\x21-\x7e]+$/.test(key)) {
    throw new Error("SUPABASE_KEY_INVALID_FORMAT: klucz pusty lub z niedozwolonymi znakami — wklej go ponownie jedną linią");
  }
  return key;
}
const REFRESH_MS = 5_000;
const MAX_RETRIES = 6;

export class SupabaseStore implements Store {
  private cache: AppState | null = null;
  private version = 0;
  private fetchedAt = 0;
  private refreshing: Promise<void> | null = null;

  private key: string;

  constructor(private url: string, rawKey: string, private seed: () => AppState) {
    // Klucze Supabase nigdy nie zawierają białych znaków — usuwamy np. złamanie wiersza z wklejania w panelu.
    this.key = normalizeSecretKey(rawKey);
  }

  /** Każdy fetch przez tę metodę: błąd sieci/nagłówków nigdy nie przenosi wartości klucza (ani `cause`). */
  private async call(url: string, init: RequestInit): Promise<Response> {
    try {
      return await fetch(url, init);
    } catch (e) {
      throw new Error(`SUPABASE_FETCH_FAILED: ${redactString(e instanceof Error ? e.message : String(e)).slice(0, 160)}`);
    }
  }

  private headers(extra: Record<string, string> = {}): Record<string, string> {
    const h: Record<string, string> = { apikey: this.key, "Content-Type": "application/json", ...extra };
    if (this.key.split(".").length === 3) h.Authorization = `Bearer ${this.key}`; // klucz JWT (starszy format)
    return h;
  }

  private endpoint(query = "") {
    return `${this.url.replace(/\/$/, "")}/rest/v1/app_state${query}`;
  }

  private async fetchRow(): Promise<{ data: AppState; version: number } | null> {
    const r = await this.call(this.endpoint(`?id=eq.${ROW_ID}&select=data,version`), { headers: this.headers(), cache: "no-store" });
    if (!r.ok) throw new Error(`SUPABASE_READ_${r.status}: ${redactString(await r.text()).slice(0, 200)}`);
    const rows = (await r.json()) as { data: AppState; version: number }[];
    return rows[0] ?? null;
  }

  /** Wczytuje stan; jeśli wiersza nie ma — tworzy go z seeda (DEMO + treści z repo). */
  async hydrate(): Promise<void> {
    let row = await this.fetchRow();
    if (!row) {
      const data = this.seed();
      const r = await this.call(this.endpoint(), {
        method: "POST",
        headers: this.headers({ Prefer: "resolution=ignore-duplicates,return=minimal" }),
        body: JSON.stringify({ id: ROW_ID, version: 1, data }),
      });
      if (!r.ok && r.status !== 409) throw new Error(`SUPABASE_INIT_${r.status}`);
      row = (await this.fetchRow()) ?? { data, version: 1 };
    }
    this.cache = row.data;
    this.version = row.version;
    this.fetchedAt = Date.now();
  }

  read(): AppState {
    if (!this.cache) throw new Error("SUPABASE_STORE_NOT_HYDRATED");
    if (Date.now() - this.fetchedAt > REFRESH_MS && !this.refreshing) {
      this.refreshing = this.hydrate().catch(() => undefined).finally(() => { this.refreshing = null; });
    }
    return structuredClone(this.cache);
  }

  async transact<T>(fn: (state: AppState) => T | Promise<T>): Promise<T> {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const row = (await this.fetchRow()) ?? (await this.hydrate(), { data: this.cache!, version: this.version });
      const state = structuredClone(row.data);
      const result = await fn(state);
      const r = await this.call(this.endpoint(`?id=eq.${ROW_ID}&version=eq.${row.version}`), {
        method: "PATCH",
        headers: this.headers({ Prefer: "return=representation" }),
        body: JSON.stringify({ data: state, version: row.version + 1, updated_at: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error(`SUPABASE_WRITE_${r.status}: ${redactString(await r.text()).slice(0, 200)}`);
      const updated = (await r.json()) as unknown[];
      if (updated.length === 1) {
        this.cache = state;
        this.version = row.version + 1;
        this.fetchedAt = Date.now();
        return result;
      }
      await new Promise((res) => setTimeout(res, 20 + Math.random() * 60 * (attempt + 1))); // konflikt wersji => ponów
    }
    throw new Error("SUPABASE_WRITE_CONFLICT");
  }
}
