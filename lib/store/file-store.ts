// Lokalny store JSON (F1). Jeden plik stanu, zapis atomowy (tmp -> rename),
// blokada międzyprocesowa przez katalog-lock (mkdir jest atomowe).
// Interfejs jest wąski, aby później podmienić implementację na Supabase/Postgres.
import fs from "node:fs";
import path from "node:path";
import type { AppState } from "../types";
import { buildSeedState } from "../demo/seed";
import { SupabaseStore } from "./supabase-store";
import { syncState } from "./sync";
import { IS_PRODUCTION } from "../site";

export interface Store {
  read(): AppState;
  transact<T>(fn: (state: AppState) => T | Promise<T>): Promise<T>;
}

const LOCK_STALE_MS = 10_000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export class FileStore implements Store {
  private file: string;
  private lockDir: string;

  constructor(private dir: string) {
    this.file = path.join(dir, "state.json");
    this.lockDir = path.join(dir, "state.lock");
  }

  private synced = false;

  private ensure(): void {
    fs.mkdirSync(this.dir, { recursive: true });
    if (!fs.existsSync(this.file)) { this.write(buildSeedState()); this.synced = true; return; }
    if (!this.synced) {
      // Treści z repo dopisywane do istniejącego stanu, migracje; w produkcji usunięcie publicznych rekordów DEMO.
      this.synced = true;
      const state = JSON.parse(fs.readFileSync(this.file, "utf8")) as AppState;
      if (syncState(state, { production: IS_PRODUCTION })) this.write(state);
    }
  }

  private write(state: AppState): void {
    const tmp = `${this.file}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), "utf8");
    fs.renameSync(tmp, this.file);
  }

  read(): AppState {
    this.ensure();
    return JSON.parse(fs.readFileSync(this.file, "utf8")) as AppState;
  }


  private async acquire(): Promise<string> {
    fs.mkdirSync(this.dir, { recursive: true });
    for (let i = 0; i < 500; i++) {
      try {
        fs.mkdirSync(this.lockDir);
        const token = `${process.pid}-${Date.now()}-${Math.random()}`;
        fs.writeFileSync(path.join(this.lockDir, "owner"), token);
        return token;
      } catch {
        try {
          const age = Date.now() - fs.statSync(this.lockDir).mtimeMs;
          if (age > LOCK_STALE_MS) fs.rmSync(this.lockDir, { recursive: true, force: true });
        } catch {
          /* lock zniknął w międzyczasie */
        }
        await sleep(5 + Math.random() * 10);
      }
    }
    throw new Error("STORE_LOCK_TIMEOUT");
  }

  /** Zwalnia lock tylko, jeśli nadal należy do tego wywołania (ochrona przed usunięciem cudzego locka). */
  private release(token: string): void {
    try {
      if (fs.readFileSync(path.join(this.lockDir, "owner"), "utf8") === token) {
        fs.rmSync(this.lockDir, { recursive: true, force: true });
      }
    } catch {
      /* lock już nie istnieje */
    }
  }

  async transact<T>(fn: (state: AppState) => T | Promise<T>): Promise<T> {
    this.ensure();
    const token = await this.acquire();
    try {
      const state = this.read();
      const result = await fn(state);
      this.write(state);
      return result;
    } finally {
      this.release(token);
    }
  }

  reset(): void {
    fs.mkdirSync(this.dir, { recursive: true });
    this.write(buildSeedState());
  }
}

/** Magazyn aplikacji: lokalny plik (dev/testy) albo Supabase (gdy ustawione ZOO24_SUPABASE_URL + ZOO24_SUPABASE_SECRET_KEY). */
export interface AppStore extends Store {
  reset(): void | Promise<void>;
}

class SupabaseAppStore extends SupabaseStore implements AppStore {
  /** Reset współdzielonej bazy (produkcja) jest zablokowany — wymazałby zgłoszenia, decyzje i audit log. */
  async reset(): Promise<void> {
    throw new Error("RESET_DISABLED_ON_SHARED_STORE");
  }

  /** Jednorazowa synchronizacja po starcie (treści z repo, migracje, w produkcji usunięcie DEMO). */
  async syncOnce(): Promise<void> {
    const probe = this.read();
    if (syncState(probe, { production: IS_PRODUCTION })) {
      await this.transact((s) => { syncState(s, { production: IS_PRODUCTION }); });
    }
    // Publikacja artykułów zaakceptowanych przez redaktora-AI — tylko na działającym serwerze (nie w `next build`)
    // i tylko gdy podpisana polityka daje tryb live_scoped. Idempotentne (dedupe/lease w rejestrze ops).
    if (IS_PRODUCTION && process.env.NEXT_PHASE !== "phase-production-build") {
      const { loadPolicy, effectiveMode } = await import("../ops/policy");
      const p = loadPolicy();
      if (effectiveMode(p, this.read().ops.mode) === "live_scoped") {
        const { publishApprovedArticles } = await import("../ops/cms-publish");
        void publishApprovedArticles(this, p).catch(() => undefined);
      }
    }
  }
}

const SUPABASE_URL = process.env.ZOO24_SUPABASE_URL;
const SUPABASE_KEY = process.env.ZOO24_SUPABASE_SECRET_KEY;
export const STORE_BACKEND: "supabase" | "file" = SUPABASE_URL && SUPABASE_KEY ? "supabase" : "file";

let defaultStore: AppStore | null = null;
export function getStore(): AppStore {
  if (!defaultStore) {
    if (STORE_BACKEND === "supabase") {
      defaultStore = new SupabaseAppStore(SUPABASE_URL!, SUPABASE_KEY!, buildSeedState);
    } else {
      const dir = process.env.ZOO24_DATA_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), ".data");
      defaultStore = new FileStore(path.resolve(/*turbopackIgnore: true*/ dir));
    }
  }
  return defaultStore;
}

// Supabase: kopia stanu musi być wczytana, zanim pierwsza strona wywoła synchroniczne read().
if (STORE_BACKEND === "supabase") {
  const s = getStore() as SupabaseAppStore;
  await s.hydrate();
  await s.syncOnce();
}
