// Portal V3 — co jest publicznie dostępne w działach „Zwierzęta” (czyste funkcje, testowane).
// Zasada (V3 §7): dział grupy jest publiczny tylko wtedy, gdy ma ≥1 opublikowany, prawdziwy (nie-DEMO) materiał.
// Same narzędzia NIE czynią grupy publiczną — strona grupy nie może być wyłącznie tytułem i listą zapowiedzi.
import type { Article } from "../types";
import { GROUPS, NEEDS, type AnimalGroup, type GroupSlug, type NeedSlug, type Species } from "../taxonomy/animals";

export interface ToolRef {
  path: string;
  title: string;
  description: string;
  /** Grupy, dla których narzędzie jest odpowiednie. */
  groups: readonly GroupSlug[];
}

const ALL_GROUPS: readonly GroupSlug[] = GROUPS.map((g) => g.slug);

/** Narzędzia etapu 1 (V3 §9 D). Strony budowane osobno pod /narzedzia/*. */
export const TOOLS: readonly ToolRef[] = [
  {
    path: "/narzedzia/lista-dla-opiekuna",
    title: "Lista informacji dla opiekuna na czas wyjazdu",
    description: "Zbierz w jednym miejscu informacje dla osoby, która zajmie się zwierzęciem. Wydrukuj lub zapisz — dane zostają w Twojej przeglądarce.",
    groups: ALL_GROUPS,
  },
  {
    path: "/narzedzia/kalkulator-akwarium",
    title: "Kalkulator objętości akwarium",
    description: "Oblicz orientacyjną objętość z wymiarów wewnętrznych lub zewnętrznych. Nie wyznacza dopuszczalnej obsady akwarium.",
    groups: ["akwarystyka"],
  },
];

/** Materiał widoczny publicznie w portalu: opublikowany i nie-DEMO. */
export const isPublicArticle = (a: Pick<Article, "status" | "demo">): boolean => a.status === "published" && !a.demo;

export interface GroupVisibility {
  group: AnimalGroup;
  publishedArticles: Article[];
  /** Gatunki z taksonomii z ≥1 opublikowanym materiałem (kolejność wg priorytetu). */
  publicSpecies: Species[];
  isPublic: boolean;
  tools: ToolRef[];
  needCounts: Record<NeedSlug, number>;
}

export interface PortalVisibility {
  groups: Record<GroupSlug, GroupVisibility>;
  /** Tylko grupy publiczne, w kolejności nawigacyjnej (V3 §7). */
  publicGroups: GroupVisibility[];
  /** Liczba opublikowanych materiałów per potrzeba (wszystkie grupy i materiały bez przypisania zwierzęcia). */
  needCounts: Record<NeedSlug, number>;
  totalPublished: number;
}

const emptyNeedCounts = () => Object.fromEntries(NEEDS.map((n) => [n.slug, 0])) as Record<NeedSlug, number>;

function countNeeds(list: readonly Article[]): Record<NeedSlug, number> {
  const out = emptyNeedCounts();
  for (const a of list) for (const n of new Set(a.needs ?? [])) if (n in out) out[n]++;
  return out;
}

export function computeVisibility(articles: readonly Article[], tools: readonly ToolRef[] = TOOLS): PortalVisibility {
  const pub = articles.filter(isPublicArticle);
  const groups = {} as Record<GroupSlug, GroupVisibility>;
  for (const g of GROUPS) {
    const list = pub.filter((a) => a.animal?.group === g.slug);
    const speciesWith = new Set(list.map((a) => a.animal?.species).filter((s): s is string => !!s));
    groups[g.slug] = {
      group: g,
      publishedArticles: list,
      publicSpecies: g.species.filter((s) => speciesWith.has(s.slug)).sort((x, y) => x.priority - y.priority),
      isPublic: list.length > 0,
      tools: tools.filter((t) => t.groups.includes(g.slug)),
      needCounts: countNeeds(list),
    };
  }
  return {
    groups,
    publicGroups: GROUPS.map((g) => groups[g.slug]).filter((v) => v.isPublic),
    needCounts: countNeeds(pub),
    totalPublished: pub.length,
  };
}

/** Opublikowane materiały konkretnego gatunku (pusta lista = karta niepubliczna). */
export function speciesArticles(v: PortalVisibility, group: GroupSlug, species: string): Article[] {
  return v.groups[group].publishedArticles.filter((a) => a.animal?.species === species);
}

export function isSpeciesPublic(v: PortalVisibility, group: GroupSlug, species: string): boolean {
  return v.groups[group].publicSpecies.some((s) => s.slug === species);
}

/** Sekcje hubu grupy (szablon A). Każdy materiał trafia do pierwszej pasującej sekcji — bez duplikatów. */
export const GROUP_SECTIONS: readonly { id: string; title: string; needs: readonly NeedSlug[] | null }[] = [
  { id: "start", title: "Start dla początkującego", needs: ["wybor-zwierzecia", "przygotowanie-domu"] },
  { id: "codzienna-opieka", title: "Codzienna opieka i warunki", needs: ["codzienna-opieka", "srodowisko", "zywienie", "zachowanie", "wyposazenie"] },
  { id: "wyjazdy", title: "Wyjazdy, transport i opieka zastępcza", needs: ["wyjazdy", "transport"] },
  { id: "inne", title: "Pozostałe materiały", needs: null },
];

export function groupSections(list: readonly Article[]): { id: string; title: string; items: Article[] }[] {
  const used = new Set<string>();
  return GROUP_SECTIONS.map((s) => {
    const items = list.filter((a) => {
      if (used.has(a.slug)) return false;
      const ok = s.needs === null || (a.needs ?? []).some((n) => s.needs!.includes(n));
      if (ok) used.add(a.slug);
      return ok;
    });
    return { id: s.id, title: s.title, items };
  }).filter((s) => s.items.length > 0);
}

/**
 * Karta gatunku (szablon B): które obszary są opracowane w opublikowanych materiałach, a których jeszcze nie potwierdziliśmy.
 * Bez ocen typu „łatwy” / „idealny dla dziecka”.
 */
export const SPECIES_AREAS: readonly { id: string; label: string; needs: readonly NeedSlug[] }[] = [
  { id: "potrzeby", label: "Podstawowe potrzeby i codzienna opieka", needs: ["codzienna-opieka"] },
  { id: "zobowiazania", label: "Zobowiązania opiekuna przed decyzją", needs: ["wybor-zwierzecia", "przygotowanie-domu"] },
  { id: "srodowisko", label: "Środowisko i warunki utrzymania", needs: ["srodowisko"] },
  { id: "zywienie", label: "Żywienie", needs: ["zywienie"] },
  { id: "aktywnosc", label: "Zachowanie i aktywność", needs: ["zachowanie"] },
  { id: "wyposazenie", label: "Wyposażenie", needs: ["wyposazenie"] },
  { id: "koszty", label: "Koszty (jako jawne założenia)", needs: ["koszty"] },
];

export function speciesCoverage(species: Pick<Species, "scientific">, list: readonly Article[]): { covered: string[]; missing: string[] } {
  const needs = new Set(list.flatMap((a) => a.needs ?? []));
  const covered: string[] = [];
  const missing: string[] = [];
  if (!species.scientific) missing.push("Nazwa naukowa (identyfikacja gatunku)");
  for (const area of SPECIES_AREAS) (area.needs.some((n) => needs.has(n)) ? covered : missing).push(area.label);
  return { covered, missing };
}

/** Najnowsza realna data zmiany treści z listy materiałów (do lastmod); null = brak. */
export function latestUpdate(list: readonly Pick<Article, "updatedAt">[]): string | null {
  return list.reduce<string | null>((m, a) => (!m || a.updatedAt > m ? a.updatedAt : m), null);
}
