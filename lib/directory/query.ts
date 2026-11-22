// ZOO24 — filtry, facety, sortowanie i stronicowanie listingu katalogu. Czyste funkcje (stan wyłącznie w URL).
//
// Decyzja: strona > liczby stron => renderujemy OSTATNIĄ stronę (clamp), nie 404.
// Uzasadnienie: nieaktualne linki (np. po ukryciu firmy lub z zakładek) nadal dają użyteczne wyniki zamiast
// ślepego zaułka; ryzyko SEO jest zerowe, bo każdy URL ze `strona` ma noindex + canonical do bazowego listingu.
import type { Business, CategorySlug, CitySlug, PetType } from "../types";
import { hasPhone, hasSite } from "./contact";

export { resolveCityInput, nearestCity } from "./geo";

export const PAGE_SIZE = 9;
export const FILTER_KEYS = ["zwierze", "usluga", "kontakt", "sort", "strona"] as const;

export type RawSearchParams = Record<string, string | string[] | undefined>;
export type ContactKey = "www" | "telefon";
export type SortKey = "nazwa" | "sprawdzone";

export interface ListingFilters {
  zwierze: PetType | null;
  uslugi: string[];
  kontakt: ContactKey[];
  sort: SortKey;
  strona: number;
}

export interface ListingOptions {
  pets: PetType[];
  services: string[];
  contacts: ContactKey[];
}

export const PET_ORDER: readonly PetType[] = ["psy", "koty"];
export const CONTACT_ORDER: readonly ContactKey[] = ["www", "telefon"];
export const PET_LABELS: Record<PetType, string> = { psy: "Psy", koty: "Koty" };
export const CONTACT_LABELS: Record<ContactKey, string> = { www: "Ma stronę www", telefon: "Ma publiczny telefon" };
export const SORT_LABELS: Record<SortKey, string> = { nazwa: "Alfabetycznie", sprawdzone: "Ostatnio sprawdzone dane" };

export const DEFAULT_FILTERS: ListingFilters = { zwierze: null, uslugi: [], kontakt: [], sort: "nazwa", strona: 1 };

const collator = new Intl.Collator("pl", { sensitivity: "base" });
const all = (v: string | string[] | undefined): string[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const first = (v: string | string[] | undefined) => all(v)[0];
const norm = (s: string) => s.normalize("NFC").trim().toLocaleLowerCase("pl-PL");

/** Opublikowane firmy danej kategorii i miasta (draft/hidden/removed nigdy nie trafiają na listing). */
export function publishedListing(businesses: readonly Business[], category: CategorySlug, city: CitySlug): Business[] {
  return businesses.filter((b) => b.status === "published" && b.category === category && b.city === city);
}

/** Opcje filtrów występujące w RZECZYWISTYCH danych listingu. */
export function listingOptions(items: readonly Business[]): ListingOptions {
  const services = new Set<string>();
  const pets = new Set<PetType>();
  let www = false;
  let tel = false;
  for (const b of items) {
    b.services.forEach((s) => s.trim() && services.add(s.trim()));
    b.petTypes.forEach((p) => pets.add(p));
    www ||= hasSite(b);
    tel ||= hasPhone(b);
  }
  return {
    pets: PET_ORDER.filter((p) => pets.has(p)),
    services: [...services].sort(collator.compare),
    contacts: CONTACT_ORDER.filter((c) => (c === "www" ? www : tel)),
  };
}

/** Parsowanie i walidacja searchParams. Nieznane lub niewystępujące w danych wartości są ignorowane. */
export function parseFilters(sp: RawSearchParams, opts: ListingOptions): ListingFilters {
  const pet = first(sp.zwierze);
  const zwierze = opts.pets.find((p) => p === pet) ?? null;

  const byNorm = new Map(opts.services.map((s) => [norm(s), s]));
  const picked = new Set<string>();
  for (const v of all(sp.usluga).slice(0, 20)) {
    const hit = typeof v === "string" && v.length <= 60 ? byNorm.get(norm(v)) : undefined;
    if (hit) picked.add(hit);
  }
  const uslugi = opts.services.filter((s) => picked.has(s));

  const kontaktRaw = new Set(all(sp.kontakt));
  const kontakt = opts.contacts.filter((c) => kontaktRaw.has(c));

  const sort: SortKey = first(sp.sort) === "sprawdzone" ? "sprawdzone" : "nazwa";
  const p = first(sp.strona);
  const strona = p && /^\d{1,4}$/.test(p) && Number(p) >= 1 ? Number(p) : 1;
  return { zwierze, uslugi, kontakt, sort, strona };
}

type FacetKey = "zwierze" | "uslugi" | "kontakt";

function matches(b: Business, f: ListingFilters, skip?: FacetKey): boolean {
  if (skip !== "zwierze" && f.zwierze && !b.petTypes.includes(f.zwierze)) return false;
  if (skip !== "uslugi" && !f.uslugi.every((s) => b.services.includes(s))) return false;
  if (skip !== "kontakt" && !f.kontakt.every((c) => (c === "www" ? hasSite(b) : hasPhone(b)))) return false;
  return true;
}

/** Filtrowanie: zwierzę (jedno), usługi (wszystkie zaznaczone — zawężanie), kontakt (wszystkie zaznaczone). */
export function applyFilters(items: readonly Business[], f: ListingFilters): Business[] {
  return items.filter((b) => b.status === "published" && matches(b, f));
}

/** Neutralne sortowanie: alfabetycznie (pl) lub wg daty sprawdzenia danych (najnowsze, brak daty na końcu). */
export function sortBusinesses(items: readonly Business[], sort: SortKey): Business[] {
  const byName = (a: Business, b: Business) => collator.compare(a.name, b.name) || a.id.localeCompare(b.id);
  const copy = [...items];
  if (sort === "nazwa") return copy.sort(byName);
  const t = (b: Business) => {
    const v = b.checkedAt ? Date.parse(b.checkedAt) : NaN;
    return Number.isNaN(v) ? null : v;
  };
  return copy.sort((a, b) => {
    const ta = t(a);
    const tb = t(b);
    if (ta === null && tb === null) return byName(a, b);
    if (ta === null) return 1;
    if (tb === null) return -1;
    return tb - ta || byName(a, b);
  });
}

export interface Page<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  /** true, gdy żądana strona przekraczała zakres i pokazano ostatnią. */
  clamped: boolean;
}

export function paginate<T>(items: readonly T[], page: number, size = PAGE_SIZE): Page<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const requested = Number.isInteger(page) && page >= 1 ? page : 1;
  const p = Math.min(requested, totalPages);
  return { items: items.slice((p - 1) * size, p * size), page: p, totalPages, total, clamped: requested > totalPages };
}

export interface FacetOption<V extends string = string> {
  value: V;
  label: string;
  count: number;
  selected: boolean;
}

export interface Facets {
  zwierze: FacetOption<PetType>[];
  uslugi: FacetOption[];
  kontakt: FacetOption<ContactKey>[];
}

/**
 * Facety z liczbami: ile firm byłoby widocznych po wybraniu opcji przy pozostałych aktywnych filtrach.
 * Pokazujemy wyłącznie opcje występujące w danych listingu.
 */
export function computeFacets(items: readonly Business[], f: ListingFilters, opts: ListingOptions = listingOptions(items)): Facets {
  const pub = items.filter((b) => b.status === "published");
  const noPet = pub.filter((b) => matches(b, f, "zwierze"));
  const current = pub.filter((b) => matches(b, f));
  return {
    zwierze: opts.pets.map((p) => ({ value: p, label: PET_LABELS[p], count: noPet.filter((b) => b.petTypes.includes(p)).length, selected: f.zwierze === p })),
    uslugi: opts.services.map((s) => ({ value: s, label: s, count: current.filter((b) => b.services.includes(s)).length, selected: f.uslugi.includes(s) })),
    kontakt: opts.contacts.map((c) => ({
      value: c, label: CONTACT_LABELS[c],
      count: current.filter((b) => (c === "www" ? hasSite(b) : hasPhone(b))).length,
      selected: f.kontakt.includes(c),
    })),
  };
}

// ---------- URL ----------

export function toSearchParams(f: ListingFilters): URLSearchParams {
  const q = new URLSearchParams();
  if (f.zwierze) q.append("zwierze", f.zwierze);
  f.uslugi.forEach((s) => q.append("usluga", s));
  f.kontakt.forEach((c) => q.append("kontakt", c));
  if (f.sort !== "nazwa") q.append("sort", f.sort);
  if (f.strona > 1) q.append("strona", String(f.strona));
  return q;
}

export function buildListingHref(base: string, f: ListingFilters, patch: Partial<ListingFilters> = {}): string {
  const qs = toSearchParams({ ...f, ...patch }).toString();
  return qs ? `${base}?${qs}` : base;
}

export type ChipKey = "zwierze" | "usluga" | "kontakt";

/** URL bez jednego filtra (strona resetowana do 1). */
export function removeFilterHref(base: string, f: ListingFilters, key: ChipKey, value?: string): string {
  if (key === "zwierze") return buildListingHref(base, f, { zwierze: null, strona: 1 });
  if (key === "usluga") return buildListingHref(base, f, { uslugi: f.uslugi.filter((s) => s !== value), strona: 1 });
  return buildListingHref(base, f, { kontakt: f.kontakt.filter((c) => c !== value), strona: 1 });
}

/** „Wyczyść wszystkie”: usuwa filtry i stronę, zachowuje wybrane sortowanie (to nie jest filtr). */
export function clearFiltersHref(base: string, f: ListingFilters): string {
  return buildListingHref(base, { ...DEFAULT_FILTERS, sort: f.sort });
}

export const pageHref = (base: string, f: ListingFilters, n: number) => buildListingHref(base, f, { strona: n });
export const sortHref = (base: string, f: ListingFilters, s: SortKey) => buildListingHref(base, f, { sort: s, strona: 1 });

export interface Chip {
  key: ChipKey;
  value: string;
  label: string;
  href: string;
}

export function activeFilterChips(base: string, f: ListingFilters): Chip[] {
  const chips: Chip[] = [];
  if (f.zwierze) chips.push({ key: "zwierze", value: f.zwierze, label: PET_LABELS[f.zwierze], href: removeFilterHref(base, f, "zwierze") });
  f.uslugi.forEach((s) => chips.push({ key: "usluga", value: s, label: s, href: removeFilterHref(base, f, "usluga", s) }));
  f.kontakt.forEach((c) => chips.push({ key: "kontakt", value: c, label: CONTACT_LABELS[c], href: removeFilterHref(base, f, "kontakt", c) }));
  return chips;
}

export const activeFilterCount = (f: ListingFilters) => (f.zwierze ? 1 : 0) + f.uslugi.length + f.kontakt.length;

/** Czy URL zawiera parametry filtra/sortowania/strony (=> noindex,follow; canonical zawsze do bazy). Parametry spoza listy, np. UTM, nie liczą się. */
export function hasListingParams(sp: RawSearchParams): boolean {
  return FILTER_KEYS.some((k) => all(sp[k]).some((v) => v !== ""));
}

/** Numery stron do wyświetlenia (null = wielokropek). Do 7 stron — wszystkie. */
export function pageList(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1].filter((n) => n >= 1 && n <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
}

/** Bezpieczne odtworzenie query listingu z parametru `?z=` profilu (tylko znane klucze i wartości z danych). */
export function sanitizeReturnQuery(z: string | string[] | undefined, opts: ListingOptions): string {
  const raw = first(z);
  if (!raw || raw.length > 500) return "";
  const sp: RawSearchParams = {};
  for (const [k, v] of new URLSearchParams(raw)) {
    if (!(FILTER_KEYS as readonly string[]).includes(k)) continue;
    sp[k] = [...all(sp[k]), v];
  }
  return toSearchParams(parseFilters(sp, opts)).toString();
}

/** Pełny model listingu dla strony. */
export function buildListingModel(listing: readonly Business[], sp: RawSearchParams) {
  const opts = listingOptions(listing);
  const filters = parseFilters(sp, opts);
  const filtered = sortBusinesses(applyFilters(listing, filters), filters.sort);
  const page = paginate(filtered, filters.strona);
  return { opts, filters: { ...filters, strona: page.page }, page, facets: computeFacets(listing, filters, opts) };
}
