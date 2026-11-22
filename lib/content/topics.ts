// Tematy poradników i przypisanie artykułów (po slugu, potem regułami) — bez zmian w plikach content/*.json.
// Filtrowanie hubu /poradniki (?temat=, ?q=) jako czyste funkcje (testowane).
import type { Article } from "../types";

export type TopicSlug = "rasy-psow" | "rasy-kotow" | "pielegnacja" | "wybor-uslugi" | "zachowanie";

export interface TopicColors {
  /** tło okładki */
  bg: string;
  /** tekst na okładce (kontrast ≥ 4,5:1 do bg) */
  fg: string;
  /** motyw łapki / akcent */
  motif: string;
}

export interface Topic {
  slug: TopicSlug;
  name: string;
  description: string;
  colors: TopicColors;
}

// Kolory = pochodne tokenów: petrol #0e4f5c / #0a3842, koral #d4552d / #a93f1d, kość słoniowa #faf7f2.
export const TOPICS: readonly Topic[] = [
  { slug: "rasy-psow", name: "Rasy psów", description: "Charakter, potrzeby i opieka nad psami różnych ras.", colors: { bg: "#0e4f5c", fg: "#faf7f2", motif: "#ef8a6c" } },
  { slug: "rasy-kotow", name: "Rasy kotów", description: "Wygląd, temperament i codzienna opieka nad kotami.", colors: { bg: "#a93f1d", fg: "#faf7f2", motif: "#f6c3ae" } },
  { slug: "pielegnacja", name: "Pielęgnacja", description: "Szata, pazury, kąpiel i pielęgnacja sezonowa.", colors: { bg: "#e4f0ef", fg: "#0a3842", motif: "#0e4f5c" } },
  { slug: "wybor-uslugi", name: "Wybór usługi", description: "Jak wybrać groomera, hotel lub opiekuna — pytania i checklisty.", colors: { bg: "#fdebe4", fg: "#0a3842", motif: "#d4552d" } },
  { slug: "zachowanie", name: "Zachowanie i wychowanie", description: "Socjalizacja, nauka, zostawanie w domu.", colors: { bg: "#0a3842", fg: "#faf7f2", motif: "#7fb3ad" } },
];

export const DEFAULT_TOPIC: TopicSlug = "pielegnacja";

const BY_SLUG = new Map(TOPICS.map((t) => [t.slug, t]));
export const isTopicSlug = (s: unknown): s is TopicSlug => typeof s === "string" && BY_SLUG.has(s as TopicSlug);
export const getTopic = (slug: TopicSlug): Topic => BY_SLUG.get(slug)!;

/** Przypisania redakcyjne (mają pierwszeństwo przed regułami). */
export const ARTICLE_TOPICS: Readonly<Record<string, TopicSlug>> = {
  "kot-brytyjski-n66": "rasy-kotow",
  "cane-corso-n63": "rasy-psow",
  "maltanczyk-n77": "rasy-psow",
  "jak-wybrac-groomera": "wybor-uslugi",
  "hotel-dla-psa-checklista": "wybor-uslugi",
  "pielegnacja-psa-zima": "pielegnacja",
};

/** Usuwa polskie znaki i wielkość liter — do reguł i wyszukiwania. */
export function normalizeText(s: string): string {
  return s.replace(/[łŁ]/g, "l").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Reguły po znormalizowanym tytule + slugu; kolejność ma znaczenie (pierwsza pasująca wygrywa).
const RULES: { test: RegExp; topic: TopicSlug }[] = [
  { test: /\b(jak wybrac|wybor|groomer\w*|hotel\w*|salon\w*|pet ?sitter\w*|opiekun\w* dla)\b/, topic: "wybor-uslugi" },
  { test: /\b(zachowan\w*|wychowan\w*|szkoleni\w*|socjalizac\w*|behawior\w*|lek separacyjny)\b/, topic: "zachowanie" },
  { test: /\b(pielegnac\w*|czesani\w*|kapiel\w*|strzyzeni\w*|pazur\w*|siersc\w*)\b/, topic: "pielegnacja" },
  { test: /\b(kot|kota|koty|kotow|kocie\w*|kociak\w*)\b/, topic: "rasy-kotow" },
  { test: /\b(rasa|rasy|pies|psa|psy|szczeni\w*|molos\w*)\b/, topic: "rasy-psow" },
];

export function topicSlugForArticle(a: Pick<Article, "slug" | "title">): TopicSlug {
  const fixed = ARTICLE_TOPICS[a.slug];
  if (fixed) return fixed;
  const hay = normalizeText(`${a.title} ${a.slug.replace(/-/g, " ")}`);
  return RULES.find((r) => r.test.test(hay))?.topic ?? DEFAULT_TOPIC;
}

export const topicForArticle = (a: Pick<Article, "slug" | "title">): Topic => getTopic(topicSlugForArticle(a));

// ---------- Hub /poradniki ----------

export const QUERY_MAX = 80;

export interface HubQuery {
  temat: TopicSlug | null;
  q: string;
  /** czy w URL były jakiekolwiek parametry filtra (=> noindex + canonical do /poradniki) */
  filtered: boolean;
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Walidacja parametrów po stronie serwera: nieznany temat = brak filtra, q przycięte. */
export function parseHubQuery(sp: Record<string, string | string[] | undefined>): HubQuery {
  const rawTemat = first(sp.temat);
  const rawQ = first(sp.q);
  const q = (rawQ ?? "").replace(/\s+/g, " ").trim().slice(0, QUERY_MAX);
  return { temat: isTopicSlug(rawTemat) ? rawTemat : null, q, filtered: rawTemat !== undefined || rawQ !== undefined };
}

export const isPublished = (a: Article) => a.status === "published";

/** Proste wyszukiwanie: wszystkie słowa zapytania muszą wystąpić w tytule lub leadzie (bez polskich znaków). */
export function matchesQuery(a: Pick<Article, "title" | "summary">, q: string): boolean {
  const words = normalizeText(q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = normalizeText(`${a.title} ${a.summary}`);
  return words.every((w) => hay.includes(w));
}

/** Najnowsze najpierw (wg daty aktualizacji), potem tytuł — stabilnie. */
export function sortArticles<T extends Pick<Article, "updatedAt" | "title">>(list: T[]): T[] {
  return [...list].sort((x, y) => y.updatedAt.localeCompare(x.updatedAt) || x.title.localeCompare(y.title, "pl"));
}

export interface HubResult {
  /** wszystkie opublikowane (bez filtra) */
  totalPublished: number;
  /** wynik po filtrze tematu i zapytaniu */
  items: Article[];
  /** licznik per temat po zastosowaniu zapytania q (bez filtra tematu) */
  counts: Record<TopicSlug, number>;
  /** liczba wszystkich pasujących do q (pozycja „Wszystkie”) */
  countAll: number;
}

/** Filtrowanie hubu — wyłącznie artykuły opublikowane. */
export function filterArticles(all: Article[], query: Pick<HubQuery, "temat" | "q">): HubResult {
  const published = all.filter(isPublished);
  const byQ = published.filter((a) => matchesQuery(a, query.q));
  const counts = Object.fromEntries(TOPICS.map((t) => [t.slug, 0])) as Record<TopicSlug, number>;
  for (const a of byQ) counts[topicSlugForArticle(a)]++;
  const items = query.temat ? byQ.filter((a) => topicSlugForArticle(a) === query.temat) : byQ;
  return { totalPublished: published.length, items: sortArticles(items), counts, countAll: byQ.length };
}

/** Href hubu z zachowaniem parametrów; pusty filtr = czyste /poradniki. */
export function hubHref(p: { temat?: TopicSlug | null; q?: string }): string {
  const sp = new URLSearchParams();
  if (p.temat) sp.set("temat", p.temat);
  if (p.q) sp.set("q", p.q);
  const s = sp.toString();
  return s ? `/poradniki?${s}` : "/poradniki";
}

/** Powiązane poradniki: opublikowane, ten sam temat, bez bieżącego, max `limit`. */
export function relatedArticles(current: Pick<Article, "slug" | "title">, all: Article[], limit = 3): Article[] {
  const topic = topicSlugForArticle(current);
  return sortArticles(all.filter((a) => isPublished(a) && a.slug !== current.slug && topicSlugForArticle(a) === topic)).slice(0, limit);
}
