// ZOO24 — zgłoszenia z formularzy publicznych (F1, lokalna kolejka moderacji).
// Zasady: walidacja wyłącznie po stronie serwera; e-mail zgłaszającego służy tylko do weryfikacji
// i nigdy nie jest wyświetlany publicznie; nie zbieramy adresów osób prywatnych; audyt bez PII (redact).
import { createHash, randomInt } from "node:crypto";
import type { AppState, Submission, SubmissionKind } from "./types";
import type { Store } from "./store/file-store";
import { CATEGORIES, CITIES, isCategory, isCity } from "./site";
import { redact, redactString, safeLog } from "./security/redact";
import { GROUPS, isGroupSlug } from "./taxonomy/animals";

// ---------- Typy ----------
/**
 * Rodzaje zgłoszeń obsługiwane przez formularze. `recommend_place` (A08: polecenie miejsca przez użytkownika,
 * który NIE reprezentuje firmy) — docelowo do dopisania w `SubmissionKind` w lib/types.ts; do tego czasu
 * poszerzamy typ tutaj, a przy zapisie rzutujemy (wartość jest walidowana i zapisywana jak pozostałe).
 */
export type FormKind = SubmissionKind | "recommend_place";
export const FORM_KINDS: readonly FormKind[] = ["add_business", "report_error", "contact", "recommend_place"];

export type FieldErrors = Record<string, string>;
export type ValidationResult = { ok: true; data: Record<string, string> } | { ok: false; errors: FieldErrors };

/** Stan formularza zwracany przez server action (useActionState). */
export type FormState =
  | { status: "idle" }
  | { status: "error"; errors: FieldErrors; values: Record<string, string>; message?: string }
  | { status: "success"; code: string; kind: FormKind };

export const INITIAL_FORM_STATE: FormState = { status: "idle" };

export class SubmissionError extends Error {
  constructor(public code: "not_found" | "not_pending" | "reason_required" | "invalid" | "rate_limited", message: string) {
    super(message);
    this.name = "SubmissionError";
  }
}

// ---------- Słowniki ----------
export const ROLE_OPTIONS = { owner: "Właściciel / współwłaściciel", employee: "Pracownik upoważniony przez firmę" } as const;
export type RoleOption = keyof typeof ROLE_OPTIONS;

export const CONTACT_TOPICS = {
  pytanie: "Pytanie o serwis",
  profil: "Profil firmy w katalogu",
  wspolpraca: "Reklama i współprace",
  dane_osobowe: "Dane osobowe (RODO)",
  inne: "Inne",
} as const;
export type ContactTopic = keyof typeof CONTACT_TOPICS;

export const OTHER_CITY = "inne";

export const KIND_LABELS: Record<FormKind, string> = {
  add_business: "Zgłoszenie firmy",
  report_error: "Zgłoszenie błędu",
  contact: "Wiadomość z formularza kontaktowego",
  recommend_place: "Polecenie miejsca",
};

/** Etykieta rodzaju zgłoszenia (odporna na nieznane wartości w starym stanie). */
export const kindLabel = (kind: string): string => (KIND_LABELS as Record<string, string>)[kind] ?? kind;

/** „Poleć miejsce”: rodzaj usługi spoza katalogu. */
export const OTHER_CATEGORY = "inna";

export const STATUS_LABELS: Record<Submission["status"], string> = {
  pending: "Oczekuje na moderację",
  approved: "Zaakceptowane",
  rejected: "Odrzucone",
};

// ---------- Pomocnicze ----------
const clean = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "");
/** Jak clean, ale zachowuje podziały wierszy (pola opisowe). */
const cleanMultiline = (v: unknown) =>
  typeof v === "string" ? v.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim() : "";
const isChecked = (v: unknown) => v === "on" || v === "true" || v === "1" || v === "yes";
const len = (s: string) => [...s].length;

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CITY_NAME_RE = /^[\p{L}][\p{L} .'-]*$/u;

function checkEmail(raw: unknown, required: boolean, errors: FieldErrors, field = "email"): string {
  const v = clean(raw).toLowerCase();
  if (!v) {
    if (required) errors[field] = "Podaj adres e-mail — użyjemy go wyłącznie do kontaktu w sprawie zgłoszenia.";
    return "";
  }
  if (v.length > 254 || !EMAIL_RE.test(v)) errors[field] = "Podaj poprawny adres e-mail, np. kontakt@firma.pl.";
  return v;
}

/** Telefon publiczny firmy (PL): 9 cyfr, opcjonalny prefiks +48/0048. Zwraca format "+48 123 456 789". */
export function normalizePolishPhone(raw: string): string | null {
  let d = raw.replace(/[\s\-().]/g, "");
  if (d.startsWith("+48")) d = d.slice(3);
  else if (d.startsWith("0048")) d = d.slice(4);
  if (!/^[1-9]\d{8}$/.test(d)) return null;
  return `+48 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/** Strona www firmy: wymagane https; brak schematu => dopisujemy https://. Zwraca znormalizowany URL albo komunikat błędu. */
export function normalizeHttpsUrl(raw: string): { url: string } | { error: string } {
  let v = raw.trim();
  if (/^http:\/\//i.test(v)) return { error: "Adres strony musi zaczynać się od https:// (bezpieczne połączenie)." };
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = `https://${v}`;
  let u: URL;
  try {
    u = new URL(v);
  } catch {
    return { error: "Podaj poprawny adres strony, np. https://twojafirma.pl." };
  }
  if (u.protocol !== "https:") return { error: "Adres strony musi zaczynać się od https:// (bezpieczne połączenie)." };
  if (u.username || u.password || !u.hostname.includes(".") || /\s/.test(raw.trim())) {
    return { error: "Podaj poprawny adres strony, np. https://twojafirma.pl." };
  }
  if (u.href.length > 200) return { error: "Adres strony może mieć najwyżej 200 znaków." };
  return { url: u.href };
}

// ---------- Walidatory ----------
export interface ValidationContext {
  /** Czy istnieje profil o danym slugu (przejęcie/aktualizacja). Brak = sprawdzany tylko format. */
  businessExists?: (slug: string) => boolean;
  /** Id opublikowanego profilu po slugu (zapis celu przejęcia/aktualizacji). Wyznaczane na serwerze, nigdy z formularza. */
  businessIdBySlug?: (slug: string) => string | null;
}

export function validateAddBusiness(input: Record<string, unknown>, ctx: ValidationContext = {}): ValidationResult {
  const errors: FieldErrors = {};
  const data: Record<string, string> = {};

  // Przejęcie/aktualizacja istniejącego profilu: `profil` (nowy parametr) albo `firma` (zgodność wstecz).
  const firma = (clean(input.profil) || clean(input.firma)).toLowerCase();
  if (firma) {
    if (!SLUG_RE.test(firma) || firma.length > 160) errors.firma = "Nieprawidłowy adres profilu firmy.";
    else if (ctx.businessExists && !ctx.businessExists(firma)) errors.firma = "Nie znaleziono profilu, którego dotyczy zgłoszenie. Zgłoś firmę jako nową.";
    else {
      data.firma = firma;
      const id = ctx.businessIdBySlug?.(firma);
      if (id) data.targetBusinessId = id;
    }
  }

  const companyName = clean(input.companyName);
  if (!companyName) errors.companyName = "Podaj nazwę firmy.";
  else if (len(companyName) < 2) errors.companyName = "Nazwa firmy musi mieć co najmniej 2 znaki.";
  else if (len(companyName) > 120) errors.companyName = "Nazwa firmy może mieć najwyżej 120 znaków.";
  else data.companyName = companyName;

  const category = clean(input.category);
  if (!category) errors.category = "Wybierz rodzaj usług.";
  else if (!Object.hasOwn(CATEGORIES, category) || !isCategory(category)) errors.category = "Wybierz rodzaj usług z listy.";
  else data.category = category;

  const city = clean(input.city);
  if (!city) errors.city = "Wybierz miasto.";
  else if (city === OTHER_CITY) {
    const other = clean(input.cityOther);
    if (!other) errors.cityOther = "Wpisz nazwę miejscowości.";
    else if (len(other) < 2 || len(other) > 80 || !CITY_NAME_RE.test(other)) errors.cityOther = "Wpisz samą nazwę miejscowości (2–80 liter), bez adresu.";
    else {
      data.city = OTHER_CITY;
      data.cityOther = other;
    }
  } else if (!Object.hasOwn(CITIES, city) || !isCity(city)) errors.city = "Wybierz miasto z listy albo „Inna miejscowość”.";
  else data.city = city;

  const website = clean(input.website);
  if (website) {
    const r = normalizeHttpsUrl(website);
    if ("error" in r) errors.website = r.error;
    else data.website = r.url;
  }

  const phone = clean(input.phone);
  if (phone) {
    const p = normalizePolishPhone(phone);
    if (!p) errors.phone = "Podaj polski numer telefonu firmy: 9 cyfr, np. 22 123 45 67 lub +48 600 100 200.";
    else data.phone = p;
  }

  const email = checkEmail(input.email, true, errors);
  if (email && !errors.email) data.email = email;

  const role = clean(input.role);
  if (!role) errors.role = "Wskaż, kim jesteś dla zgłaszanej firmy.";
  else if (!Object.hasOwn(ROLE_OPTIONS, role)) errors.role = "Wybierz jedną z dostępnych ról.";
  else data.role = role;

  const services = cleanMultiline(input.services);
  if (services) {
    if (len(services) > 500) errors.services = "Opis zakresu usług może mieć najwyżej 500 znaków.";
    else data.services = services;
  }

  if (!isChecked(input.acceptTerms)) errors.acceptTerms = "Zaakceptuj regulamin, aby wysłać zgłoszenie.";
  else data.acceptTerms = "yes";
  if (!isChecked(input.acceptPrivacy)) errors.acceptPrivacy = "Potwierdź, że zapoznałeś(-aś) się z informacją o prywatności.";
  else data.acceptPrivacy = "yes";

  data.mode = data.firma ? "update" : "new";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

export function validateReportError(input: Record<string, unknown>, ctx: ValidationContext = {}): ValidationResult {
  const errors: FieldErrors = {};
  const data: Record<string, string> = {};

  const firma = clean(input.firma).toLowerCase();
  const pageUrl = clean(input.pageUrl);
  if (!firma && !pageUrl) errors.pageUrl = "Podaj adres strony z błędem (albo wejdź tu z profilu firmy).";
  if (firma) {
    if (!SLUG_RE.test(firma) || firma.length > 160) errors.firma = "Nieprawidłowy adres profilu firmy.";
    else if (ctx.businessExists && !ctx.businessExists(firma)) errors.firma = "Nie znaleziono profilu firmy. Podaj adres strony z błędem.";
    else data.firma = firma;
  }
  if (pageUrl) {
    let ok = false;
    if (pageUrl.length <= 300) {
      if (/^\/(?!\/)\S*$/.test(pageUrl)) ok = true;
      else {
        try {
          const u = new URL(pageUrl);
          ok = (u.protocol === "https:" || u.protocol === "http:") && !u.username && !u.password;
        } catch {
          ok = false;
        }
      }
    }
    if (!ok) errors.pageUrl = "Podaj adres strony, np. https://zoo24.pl/uslugi/groomer/warszawa albo /uslugi/groomer.";
    else data.pageUrl = pageUrl;
  }

  const description = cleanMultiline(input.description);
  if (!description) errors.description = "Opisz, co jest nieprawidłowe.";
  else if (len(description) < 10) errors.description = "Opis musi mieć co najmniej 10 znaków.";
  else if (len(description) > 2000) errors.description = "Opis może mieć najwyżej 2000 znaków.";
  else data.description = description;

  const email = checkEmail(input.email, false, errors);
  if (email && !errors.email) data.email = email;

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

export function validateContact(input: Record<string, unknown>): ValidationResult {
  const errors: FieldErrors = {};
  const data: Record<string, string> = {};

  const topic = clean(input.topic);
  if (!topic) errors.topic = "Wybierz temat wiadomości.";
  else if (!Object.hasOwn(CONTACT_TOPICS, topic)) errors.topic = "Wybierz temat z listy.";
  else data.topic = topic;

  const message = cleanMultiline(input.message);
  if (!message) errors.message = "Wpisz treść wiadomości.";
  else if (len(message) < 10) errors.message = "Wiadomość musi mieć co najmniej 10 znaków.";
  else if (len(message) > 2000) errors.message = "Wiadomość może mieć najwyżej 2000 znaków.";
  else data.message = message;

  const email = checkEmail(input.email, true, errors);
  if (email && !errors.email) data.email = email;

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

/** Nazwa pola checkboxa grupy zwierząt w formularzu „Poleć miejsce”. */
export const animalField = (slug: string) => `zw_${slug}`;

/**
 * „Poleć miejsce” (A08). Osoba polecająca NIE reprezentuje firmy: walidator przyjmuje wyłącznie pola z białej listy —
 * rola, profil (`firma`/`profil`), id celu i tryb są ignorowane, więc polecenie nie może przejąć ani zmienić profilu.
 * Nie pytamy o adres (tylko miejscowość); e-mail opcjonalny, wyłącznie do kontaktu w sprawie polecenia, nigdy publikowany.
 */
export function validateRecommendPlace(input: Record<string, unknown>): ValidationResult {
  const errors: FieldErrors = {};
  const data: Record<string, string> = {};

  const placeName = clean(input.placeName);
  if (!placeName) errors.placeName = "Podaj nazwę firmy lub miejsca.";
  else if (len(placeName) < 2) errors.placeName = "Nazwa musi mieć co najmniej 2 znaki.";
  else if (len(placeName) > 120) errors.placeName = "Nazwa może mieć najwyżej 120 znaków.";
  else data.placeName = placeName;

  const city = clean(input.city);
  if (!city) errors.city = "Wybierz miasto.";
  else if (city === OTHER_CITY) {
    const other = clean(input.cityOther);
    if (!other) errors.cityOther = "Wpisz nazwę miejscowości.";
    else if (len(other) < 2 || len(other) > 80 || !CITY_NAME_RE.test(other)) errors.cityOther = "Wpisz samą nazwę miejscowości (2–80 liter), bez adresu.";
    else {
      data.city = OTHER_CITY;
      data.cityOther = other;
    }
  } else if (!Object.hasOwn(CITIES, city) || !isCity(city)) errors.city = "Wybierz miasto z listy albo „Inna miejscowość”.";
  else data.city = city;

  const category = clean(input.category);
  if (!category) errors.category = "Wybierz rodzaj usługi.";
  else if (category === OTHER_CATEGORY) {
    const other = clean(input.categoryOther);
    if (!other) errors.categoryOther = "Napisz krótko, jaka to usługa.";
    else if (len(other) < 3 || len(other) > 80) errors.categoryOther = "Opis usługi: 3–80 znaków.";
    else {
      data.category = OTHER_CATEGORY;
      data.categoryOther = other;
    }
  } else if (!Object.hasOwn(CATEGORIES, category) || !isCategory(category)) errors.category = "Wybierz rodzaj usługi z listy albo „Inna usługa”.";
  else data.category = category;

  // Grupy zwierząt: checkboxy `zw_<grupa>` (formularz) albo lista po przecinku `animals` (np. testy).
  const fromList = typeof input.animals === "string" ? input.animals.split(",").map((x) => x.trim()).filter(Boolean) : [];
  const animals = GROUPS.map((g) => g.slug).filter((g) => isChecked(input[animalField(g)]) || fromList.includes(g));
  if (fromList.some((x) => !isGroupSlug(x))) errors.animals = "Wybierz zwierzęta z listy.";
  else if (!animals.length) errors.animals = "Zaznacz co najmniej jedną grupę zwierząt, którymi według Ciebie zajmuje się to miejsce.";
  else data.animals = animals.join(",");

  const website = clean(input.website);
  if (website) {
    const r = normalizeHttpsUrl(website);
    if ("error" in r) errors.website = r.error;
    else data.website = r.url;
  }

  const source = cleanMultiline(input.source);
  if (!source) errors.source = "Napisz krótko, skąd znasz to miejsce (np. korzystam z usług od roku).";
  else if (len(source) < 3) errors.source = "Odpowiedź musi mieć co najmniej 3 znaki.";
  else if (len(source) > 300) errors.source = "Odpowiedź może mieć najwyżej 300 znaków.";
  else data.source = source;

  const email = checkEmail(input.email, false, errors);
  if (email && !errors.email) data.email = email;

  data.relation = "recommender";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

export function validateSubmission(kind: FormKind, input: Record<string, unknown>, ctx: ValidationContext = {}): ValidationResult {
  if (kind === "add_business") return validateAddBusiness(input, ctx);
  if (kind === "report_error") return validateReportError(input, ctx);
  if (kind === "recommend_place") return validateRecommendPlace(input);
  return validateContact(input);
}

/** Honeypot: wypełnione pole `website_hp` => bot. */
export function isHoneypotTripped(input: Record<string, unknown>): boolean {
  return clean(input.website_hp) !== "";
}

/** FormData -> zwykły obiekt (tylko wartości tekstowe, bez pól wewnętrznych Next, z limitem długości). */
export function formDataToRecord(fd: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v !== "string" || k.startsWith("$ACTION")) continue;
    out[k] = v.slice(0, 5000);
  }
  return out;
}

// ---------- Kod zgłoszenia ----------
/** Bez znaków mylących: 0/O, 1/I. */
export const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CODE_RE = new RegExp(`^ZG-[${CODE_ALPHABET}]{6}$`);

export function generateSubmissionCode(rand: (max: number) => number = randomInt): string {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_ALPHABET[rand(CODE_ALPHABET.length)];
  return `ZG-${s}`;
}

/** Normalizuje wpisany kod: wielkość liter, spacje, brak myślnika/prefiksu. Zwraca null, jeśli format jest nieprawidłowy. */
export function normalizeCode(raw: string): string | null {
  const s = raw.toUpperCase().replace(/[\s_–—]/g, "").replace(/-/g, "");
  const body = s.length === 8 && s.startsWith("ZG") ? s.slice(2) : s;
  const code = `ZG-${body}`;
  return CODE_RE.test(code) ? code : null;
}

export const isValidCode = (raw: string) => normalizeCode(raw) !== null;

// ---------- Operacje na stanie ----------
/** Zgłoszenia aktualizacji/błędu mogą dotyczyć wyłącznie profili widocznych publicznie. */
export function isPublishedBusiness(state: AppState, slug: string): boolean {
  return state.businesses.some((b) => b.slug === slug && b.status === "published");
}

/** Publiczny profil po slugu (do prefill formularzy) — tylko pola publiczne. */
export function findPublicBusiness(state: AppState, slug: string | undefined | null) {
  if (!slug) return null;
  const s = slug.toLowerCase().slice(0, 160);
  const b = state.businesses.find((x) => x.slug === s && x.status === "published");
  return b ? { slug: b.slug, name: b.name, category: b.category, city: b.city, demo: b.demo } : null;
}

/** Id opublikowanego profilu po slugu (cel przejęcia/aktualizacji). */
export function publishedBusinessId(state: AppState, slug: string): string | null {
  return state.businesses.find((b) => b.slug === slug && b.status === "published")?.id ?? null;
}

const contextFor = (state: AppState): ValidationContext => ({
  businessExists: (slug) => isPublishedBusiness(state, slug),
  businessIdBySlug: (slug) => publishedBusinessId(state, slug),
});

export function createSubmission(
  state: AppState,
  kind: FormKind,
  data: Record<string, unknown>,
  opts: { now?: Date; rand?: (max: number) => number } = {},
): Submission {
  if (!FORM_KINDS.includes(kind)) throw new SubmissionError("invalid", "Nieznany rodzaj zgłoszenia.");
  const v = validateSubmission(kind, data, contextFor(state));
  if (!v.ok) throw new SubmissionError("invalid", "Zgłoszenie zawiera nieprawidłowe dane.");
  if (!Array.isArray(state.submissions)) state.submissions = [];

  let code = generateSubmissionCode(opts.rand);
  for (let i = 0; state.submissions.some((s) => s.code === code); i++) {
    if (i > 50) throw new Error("SUBMISSION_CODE_EXHAUSTED");
    code = generateSubmissionCode(opts.rand);
  }
  const at = (opts.now ?? new Date()).toISOString();
  // `recommend_place` jest spoza SubmissionKind (lib/types.ts) — patrz FormKind.
  const sub: Submission = { code, kind: kind as Submission["kind"], status: "pending", createdAt: at, processedAt: null, reason: null, payload: v.data };
  state.submissions.push(sub);
  state.audit.push({
    at,
    actor: "public-form",
    entity: "submission",
    entityId: code,
    action: "submission_created",
    meta: redact({ kind, mode: v.data.mode ?? null, category: v.data.category ?? null, topic: v.data.topic ?? null }),
  });
  return sub;
}

export function findSubmission(state: AppState, code: string): Submission | null {
  const norm = normalizeCode(code);
  if (!norm) return null;
  return (state.submissions ?? []).find((s) => s.code.toUpperCase() === norm) ?? null;
}

/** Decyzja moderatora. Tylko zgłoszenia `pending`; odrzucenie wymaga powodu (widocznego dla zgłaszającego, bez danych osobowych). */
export function moderateSubmission(
  state: AppState,
  code: string,
  decision: "approved" | "rejected",
  actor: string,
  reason?: string,
  now: Date = new Date(),
): Submission {
  const sub = findSubmission(state, code);
  if (!sub) throw new SubmissionError("not_found", "Nie znaleziono zgłoszenia o podanym kodzie.");
  if (sub.status !== "pending") throw new SubmissionError("not_pending", "To zgłoszenie zostało już rozpatrzone.");
  const why = cleanMultiline(reason ?? "");
  if (decision === "rejected" && len(why) < 5) throw new SubmissionError("reason_required", "Podaj powód odrzucenia (co najmniej 5 znaków) — zobaczy go zgłaszający.");
  if (len(why) > 500) throw new SubmissionError("invalid", "Powód może mieć najwyżej 500 znaków.");
  const at = now.toISOString();
  sub.status = decision;
  sub.processedAt = at;
  // Powód jest publiczny (status po kodzie) — usuwamy z niego e-maile i telefony.
  sub.reason = why ? redactString(why) : null;
  state.audit.push({
    at,
    actor: redactString(actor),
    entity: "submission",
    entityId: sub.code,
    action: decision === "approved" ? "submission_approved" : "submission_rejected",
    meta: redact({ kind: sub.kind, reason: sub.reason }),
  });
  return sub;
}

export interface PublicSubmissionStatus {
  code: string;
  /** Typ z lib/types.ts (strona statusu indeksuje po nim słowniki); w praktyce może to być także `recommend_place`. */
  kind: SubmissionKind;
  kindLabel: string;
  status: Submission["status"];
  statusLabel: string;
  createdAt: string;
  processedAt: string | null;
  reason: string | null;
}

/** Widok publiczny statusu — bez payloadu (żadnych e-maili, telefonów, treści). */
export function publicStatus(sub: Submission): PublicSubmissionStatus {
  return {
    code: sub.code,
    kind: sub.kind,
    kindLabel: kindLabel(sub.kind),
    status: sub.status,
    statusLabel: STATUS_LABELS[sub.status],
    createdAt: sub.createdAt,
    processedAt: sub.processedAt,
    reason: sub.status === "pending" ? null : sub.reason,
  };
}

// ---------- Rate limit ----------
/**
 * Prosty limiter w pamięci procesu (okno przesuwne).
 * OGRANICZENIA (F1): działa tylko w jednym procesie Node (nie współdzieli stanu między instancjami/serverless),
 * zeruje się po restarcie, a „odcisk” bez IP (user-agent + accept-language) jest wspólny dla osób z tą samą
 * przeglądarką i językiem — możliwe fałszywe blokady przy dużym ruchu i łatwe obejście przez zmianę nagłówków.
 * W F2: limiter po stronie bazy/edge (np. Supabase + hash IP z solą i retencją 24 h) po ocenie RODO.
 */
export function createRateLimiter({ limit = 5, windowMs = 10 * 60_000, maxKeys = 5000 } = {}) {
  const hits = new Map<string, number[]>();
  const prune = (key: string, now: number) => {
    const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (list.length) hits.set(key, list);
    else hits.delete(key);
    return list;
  };
  return {
    /** Czy kolejna próba jest dozwolona (bez zapisu). */
    allowed(key: string, now = Date.now()): boolean {
      return prune(key, now).length < limit;
    },
    /** Rejestruje próbę. */
    record(key: string, now = Date.now()): void {
      const list = prune(key, now);
      list.push(now);
      hits.set(key, list);
      if (hits.size > maxKeys) {
        for (const k of hits.keys()) {
          prune(k, now);
          if (hits.size <= maxKeys) break;
        }
        if (hits.size > maxKeys) hits.delete(hits.keys().next().value as string);
      }
    },
    reset(): void {
      hits.clear();
    },
  };
}
export type RateLimiter = ReturnType<typeof createRateLimiter>;

/** Domyślny limiter formularzy: 5 zapisanych zgłoszeń / 10 min na odcisk. */
export const submissionRateLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

/** Odcisk bez IP: skrót SHA-256 z user-agent + accept-language (nie przechowujemy surowych nagłówków). */
export function fingerprint(userAgent: string | null, acceptLanguage: string | null): string {
  return createHash("sha256").update(`${userAgent ?? ""}|${acceptLanguage ?? ""}`).digest("hex").slice(0, 24);
}

// ---------- Obsługa formularza (wywoływana przez server actions) ----------
export async function processFormSubmission(
  kind: FormKind,
  input: Record<string, string>,
  opts: { store: Store; fingerprint: string; limiter?: RateLimiter; now?: Date },
): Promise<FormState> {
  const limiter = opts.limiter ?? submissionRateLimiter;
  const values: Record<string, string> = { ...input };
  delete values.website_hp;

  // Bot: udajemy sukces, nic nie zapisujemy.
  if (isHoneypotTripped(input)) return { status: "success", code: generateSubmissionCode(), kind };

  const v = validateSubmission(kind, input, contextFor(opts.store.read()));
  if (!v.ok) return { status: "error", errors: v.errors, values };

  const nowMs = (opts.now ?? new Date()).getTime();
  if (!limiter.allowed(opts.fingerprint, nowMs)) {
    return { status: "error", errors: {}, values, message: "Wysłano zbyt wiele zgłoszeń w krótkim czasie. Spróbuj ponownie za około 10 minut." };
  }
  try {
    const sub = await opts.store.transact((s) => createSubmission(s, kind, input, { now: opts.now }));
    limiter.record(opts.fingerprint, nowMs);
    return { status: "success", code: sub.code, kind };
  } catch (e) {
    safeLog("error", "submission_save_failed", { kind, error: e instanceof Error ? e : String(e) });
    return { status: "error", errors: {}, values, message: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie za chwilę." };
  }
}

/** Opcje list wyboru dla formularzy (przekazywane z komponentów serwerowych do klienta). */
export function categoryOptions() {
  return Object.entries(CATEGORIES).map(([value, c]) => ({ value, label: c.name }));
}
export function cityOptions() {
  return Object.entries(CITIES).map(([value, c]) => ({ value, label: c.name }));
}
/** Grupy zwierząt (lib/taxonomy/animals.ts) dla formularza „Poleć miejsce”. */
export function animalGroupOptions() {
  return GROUPS.map((g) => ({ value: g.slug, label: g.name }));
}
