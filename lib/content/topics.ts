// Tematy poradników i przypisanie artykułów (po slugu, potem regułami) — bez zmian w plikach content/*.json.
// Filtrowanie hubu /poradniki (?temat=, ?q=, ?zwierze=, ?potrzeba=) jako czyste funkcje (testowane).
import type { Article } from "../types";
import { GROUPS, NEEDS, isGroupSlug, isNeedSlug, type GroupSlug, type NeedSlug } from "../taxonomy/animals";

export type TopicSlug = "rasy-psow" | "rasy-kotow" | "przygotowanie-i-opieka" | "wyjazdy" | "wybor-uslugi" | "zachowanie" | "pielegnacja";

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
  { slug: "przygotowanie-i-opieka", name: "Przygotowanie i opieka", description: "Przygotowanie domu, wyposażenie i codzienna opieka.", colors: { bg: "#e4f0ef", fg: "#0a3842", motif: "#0e4f5c" } },
  { slug: "wyjazdy", name: "Wyjazdy i opieka zastępcza", description: "Jak zorganizować opiekę nad zwierzęciem, gdy wyjeżdżasz.", colors: { bg: "#fdebe4", fg: "#0a3842", motif: "#d4552d" } },
  { slug: "pielegnacja", name: "Pielęgnacja", description: "Szata, pazury, kąpiel i pielęgnacja sezonowa.", colors: { bg: "#e4f0ef", fg: "#0a3842", motif: "#0e4f5c" } },
  { slug: "wybor-uslugi", name: "Wybór usługi", description: "Jak wybrać groomera, hotel lub opiekuna — pytania i checklisty.", colors: { bg: "#fdebe4", fg: "#0a3842", motif: "#d4552d" } },
  { slug: "zachowanie", name: "Zachowanie i wychowanie", description: "Socjalizacja, nauka, zostawanie w domu.", colors: { bg: "#0a3842", fg: "#faf7f2", motif: "#7fb3ad" } },
];

export const DEFAULT_TOPIC: TopicSlug = "przygotowanie-i-opieka";

const BY_SLUG = new Map(TOPICS.map((t) => [t.slug, t]));
export const isTopicSlug = (s: unknown): s is TopicSlug => typeof s === "string" && BY_SLUG.has(s as TopicSlug);
export const getTopic = (slug: TopicSlug): Topic => BY_SLUG.get(slug)!;

/** Przypisania redakcyjne (mają pierwszeństwo przed regułami). */
export const ARTICLE_TOPICS: Readonly<Record<string, TopicSlug>> = {
  "kot-brytyjski-n66": "rasy-kotow",
  "cane-corso-n63": "rasy-psow",
  "maltanczyk-n77": "rasy-psow",
  "kot-syberyjski-n67": "rasy-kotow",
  "kot-bengalski-n65": "rasy-kotow",
  "maine-coon--n124": "rasy-kotow",
  "ragdoll-n116": "rasy-kotow",
  "kot-syjamski-n69": "rasy-kotow",
  "shih-tzu-n62": "rasy-psow",
  "border-collie-n61": "rasy-psow",
  "doberman-n60": "rasy-psow",
  "basenji-n78": "rasy-psow",
  "west-highland-white-terrier-n79": "rasy-psow",
  "corgi-n107": "rasy-psow",
  "jamnik-n112": "rasy-psow",
  "owczarek-niemiecki-n96": "rasy-psow",
  "dalmatynczyk-n76": "rasy-psow",
  "chihuahua-n99": "rasy-psow",
  "jack-russell-terrier-n95": "rasy-psow",
  "shiba-inu--n100": "rasy-psow",
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

/**
 * Temat (sekcja prezentacji) wyliczany z danych, w tej kolejności (audyt V4 A05–A07):
 * rasa → „Rasy psów/kotów”; wyjazdy → „Wyjazdy”; wybór usługi → „Wybór usługi”; zachowanie; reszta → „Przygotowanie i opieka”.
 * Ręczne przypisania i reguły tytułowe zostają tylko dla materiałów bez klasyfikacji (np. DEMO).
 */
export function topicSlugForArticle(a: Pick<Article, "slug" | "title"> & Partial<Pick<Article, "animal" | "needs">>): TopicSlug {
  if (a.animal?.breed) return a.animal.group === "koty" ? "rasy-kotow" : "rasy-psow";
  const needs = a.needs ?? [];
  if (a.animal || needs.length) {
    if (needs.includes("wyjazdy")) return "wyjazdy";
    if (needs.includes("profesjonalna-pomoc")) return "wybor-uslugi";
    if (needs[0] === "zachowanie") return "zachowanie";
    return "przygotowanie-i-opieka";
  }
  const fixed = ARTICLE_TOPICS[a.slug];
  if (fixed) return fixed;
  const hay = normalizeText(`${a.title} ${a.slug.replace(/-/g, " ")}`);
  return RULES.find((r) => r.test.test(hay))?.topic ?? DEFAULT_TOPIC;
}

export const topicForArticle = (a: Pick<Article, "slug" | "title"> & Partial<Pick<Article, "animal" | "needs">>): Topic => getTopic(topicSlugForArticle(a));

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

/** Portal V3: dodatkowe osie hubu — ?zwierze=<grupa> i ?potrzeba=<potrzeba>. Nieznane wartości = brak filtra. */
export interface PortalHubQuery extends HubQuery {
  zwierze: GroupSlug | null;
  potrzeba: NeedSlug | null;
}

export function parsePortalHubQuery(sp: Record<string, string | string[] | undefined>): PortalHubQuery {
  const base = parseHubQuery(sp);
  const rawZ = first(sp.zwierze);
  const rawP = first(sp.potrzeba);
  return {
    ...base,
    zwierze: isGroupSlug(rawZ) ? rawZ : null,
    potrzeba: isNeedSlug(rawP) ? rawP : null,
    filtered: base.filtered || rawZ !== undefined || rawP !== undefined,
  };
}

export const isPublished = (a: Article) => a.status === "published";

/** Proste synonimy potoczne → słowa występujące w nazwach działów/gatunków/tytułach (po normalizacji). */
const SYNONYMS: Record<string, string[]> = {
  pies: ["psy", "pies", "psa"], psa: ["psy", "pies", "psa"], piesek: ["psy", "pies", "psa"], szczeniak: ["psy", "pies", "szczeni"],
  kot: ["koty", "kot"], kota: ["koty", "kot"], kotek: ["koty", "kot"], kociak: ["koty", "kot"],
  krolik: ["kroliki", "krolik"], krolika: ["kroliki", "krolik"],
  swinka: ["kawia", "gryzonie"], chomika: ["chomik"],
  papuga: ["papuzka", "ptaki", "nimfa"], papuzka: ["papuzka", "ptaki"], ptak: ["ptaki", "ptak"],
  ryba: ["ryby", "akwarystyka"], rybki: ["ryby", "akwarystyka"], akwarium: ["akwarystyka", "akwarium", "ryby"],
  gad: ["gady", "gad"], gekon: ["gekon", "gady"], jaszczurka: ["gady"], terrarium: ["gady", "terrarium"],
  wyjazd: ["wyjazd", "opiekuna"], urlop: ["wyjazd", "opiekuna"], wakacje: ["wyjazd", "opiekuna"],
};

/** Każde słowo zapytania (lub jego synonim) musi wystąpić w tekście (bez polskich znaków). */
export function matchesWithSynonyms(haystack: string, q: string): boolean {
  const hay = normalizeText(haystack);
  const words = normalizeText(q).split(/\s+/).filter(Boolean);
  if (!words.length) return false;
  return words.every((w) => [w, ...(SYNONYMS[w] ?? [])].some((v) => hay.includes(v)));
}

/** Wyszukiwanie artykułów: każde słowo (lub synonim) w tytule, leadzie, rasie albo nazwie działu. */
export function matchesQuery(a: Pick<Article, "title" | "summary"> & Partial<Pick<Article, "animal">>, q: string): boolean {
  if (!normalizeText(q).trim()) return true;
  const group = a.animal?.group ? GROUPS.find((g) => g.slug === a.animal!.group) : null;
  return matchesWithSynonyms(`${a.title} ${a.summary} ${a.animal?.breed ?? ""} ${group?.name ?? ""}`, q);
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
  /** liczba wszystkich pasujących do q i osi zwierzę/potrzeba (pozycja „Wszystkie” w tematach) */
  countAll: number;
  /** licznik per grupa zwierząt (po q, temacie i potrzebie — bez filtra zwierzęcia) */
  countsByGroup: Record<GroupSlug, number>;
  /** licznik per potrzeba (po q, temacie i zwierzęciu — bez filtra potrzeby) */
  countsByNeed: Record<NeedSlug, number>;
}

export interface HubFilter {
  temat: TopicSlug | null;
  q: string;
  zwierze?: GroupSlug | null;
  potrzeba?: NeedSlug | null;
}

/** Filtrowanie hubu — wyłącznie artykuły opublikowane. */
export function filterArticles(all: Article[], query: HubFilter): HubResult {
  const published = all.filter(isPublished);
  const byQ = published.filter((a) => matchesQuery(a, query.q));
  const okTopic = (a: Article) => !query.temat || topicSlugForArticle(a) === query.temat;
  const okGroup = (a: Article) => !query.zwierze || a.animal?.group === query.zwierze;
  const okNeed = (a: Article) => !query.potrzeba || (a.needs ?? []).includes(query.potrzeba);
  // Liczniki fasetowe: każda oś liczona z pozostałymi filtrami (bez własnego).
  const forTopics = byQ.filter((a) => okGroup(a) && okNeed(a));
  const counts = Object.fromEntries(TOPICS.map((t) => [t.slug, 0])) as Record<TopicSlug, number>;
  for (const a of forTopics) counts[topicSlugForArticle(a)]++;
  const countsByGroup = Object.fromEntries(GROUPS.map((g) => [g.slug, 0])) as Record<GroupSlug, number>;
  for (const a of byQ) if (okTopic(a) && okNeed(a) && a.animal && a.animal.group in countsByGroup) countsByGroup[a.animal.group]++;
  const countsByNeed = Object.fromEntries(NEEDS.map((n) => [n.slug, 0])) as Record<NeedSlug, number>;
  for (const a of byQ) if (okTopic(a) && okGroup(a)) for (const n of new Set(a.needs ?? [])) if (n in countsByNeed) countsByNeed[n]++;
  const items = forTopics.filter(okTopic);
  return { totalPublished: published.length, items: sortArticles(items), counts, countAll: forTopics.length, countsByGroup, countsByNeed };
}

/** Href hubu z zachowaniem parametrów; pusty filtr = czyste /poradniki. */
export function hubHref(p: { temat?: TopicSlug | null; q?: string; zwierze?: GroupSlug | null; potrzeba?: NeedSlug | null }): string {
  const sp = new URLSearchParams();
  if (p.temat) sp.set("temat", p.temat);
  if (p.q) sp.set("q", p.q);
  if (p.zwierze) sp.set("zwierze", p.zwierze);
  if (p.potrzeba) sp.set("potrzeba", p.potrzeba);
  const s = sp.toString();
  return s ? `/poradniki?${s}` : "/poradniki";
}

/** Potrzeby-zadania wspólne dla różnych zwierząt (dopuszczają rekomendację między grupami). */
const CROSS_GROUP_NEEDS: readonly NeedSlug[] = ["wyjazdy", "profesjonalna-pomoc", "transport"];

/**
 * Powiązane materiały (audyt V4 A07): najpierw ręczne nadpisanie (`related`), potem punktacja według
 * tego samego zwierzęcia (gatunek > grupa), wspólnej potrzeby i rodzaju materiału. Bez dopełniania losowymi
 * kategoriami — materiał bez wspólnego zwierzęcia ani potrzeby nie jest polecany.
 */
export function relatedArticles(current: Pick<Article, "slug" | "title"> & Partial<Pick<Article, "animal" | "needs" | "related">>, all: Article[], limit = 3): Article[] {
  const pool = all.filter((a) => isPublished(a) && a.slug !== current.slug);
  const manual = (current.related ?? []).map((s) => pool.find((a) => a.slug === s)).filter((a): a is Article => !!a);
  const curNeeds = new Set(current.needs ?? []);
  const curBreed = !!current.animal?.breed;
  const scored = pool
    .filter((a) => !manual.includes(a))
    .map((a) => {
      let score = 0;
      const sameGroup = !!current.animal && a.animal?.group === current.animal.group;
      if (sameGroup) score += 4;
      if (sameGroup && current.animal?.species && a.animal?.species === current.animal.species) score += 2;
      const shared = (a.needs ?? []).filter((n) => curNeeds.has(n)).length;
      score += shared * 2;
      // Profile ras polecają przede wszystkim profile ras tej samej grupy; poradniki — poradniki.
      if (sameGroup && curBreed === !!a.animal?.breed) score += 1;
      // Poradnik zadaniowy nie poleca profili ras ponad poradniki o tym samym zadaniu.
      if (sameGroup && !curBreed && a.animal?.breed && shared === 0) score -= 3;
      // Inna grupa zwierząt: tylko gdy łączy je zadanie przekrojowe (wyjazd, wybór usługi) — nie np. „wyposażenie” akwarium i terrarium.
      if (current.animal && a.animal && !sameGroup) {
        const crossTask = (a.needs ?? []).filter((n) => curNeeds.has(n) && CROSS_GROUP_NEEDS.includes(n)).length;
        score = crossTask > 0 && !curBreed ? crossTask * 3 : 0;
      }
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score || y.a.updatedAt.localeCompare(x.a.updatedAt) || x.a.title.localeCompare(y.a.title, "pl"))
    .map((x) => x.a);
  return [...manual, ...scored].slice(0, limit);
}
