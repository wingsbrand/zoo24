// ZOO24 — rejestr publicznych stron (200) z flagami indeksacji. Czyste funkcje, dane tylko z pamięci.
import type { AppState, CategorySlug, CitySlug } from "../types";
import { pathOnly } from "./paths";
import { computeVisibility, latestUpdate, speciesArticles, TOOLS } from "../portal/visibility";

export type PageKind = "home" | "hub" | "listing" | "business" | "article" | "static" | "animal";

export interface PageInfo {
  path: string;
  status: 200;
  indexable: boolean;
  demo: boolean;
  draft: boolean;
  kind: PageKind;
  /** S3: data realnej zmiany treści (nigdy data generacji); null/undefined = brak. */
  lastmod?: string | null;
  /** Tylko listing: liczba opublikowanych firm (łącznie z DEMO) — do wykrywania pustych kombinacji. */
  listingCount?: number;
  /** Tylko listing: liczba opublikowanych firm NIE-DEMO (próg N4). */
  realListingCount?: number;
}

export interface PageRegistry {
  get(path: string): PageInfo | null;
  all(): PageInfo[];
}

export const CATEGORIES: readonly CategorySlug[] = ["groomer", "hotel-dla-zwierzat"];
export const CITIES: readonly CitySlug[] = ["warszawa", "krakow", "lodz", "wroclaw", "poznan", "gdansk", "szczecin", "bydgoszcz", "lublin", "bialystok"];

/** Huby (R6: karty produktowe C nie mogą być na nie przekierowane). Konfigurowalne w validateRedirectMap. */
export const HUB_PATHS: readonly string[] = [
  "/",
  "/uslugi",
  ...CATEGORIES.map((c) => `/uslugi/${c}`),
  "/poradniki",
];

export const STATIC_PATHS: readonly string[] = ["/o-nas", "/dla-firm"];

/** Narzędzia (V3 §9 D): strony samodzielnie użyteczne, indeksowalne niezależnie od liczby artykułów. */
export const TOOL_PATHS: readonly string[] = ["/narzedzia", ...TOOLS.map((t) => t.path)];

export const DEFAULT_MIN_LISTINGS = 3;

/** Tworzy rejestr z gotowej listy stron (np. w testach). Ścieżki są normalizowane. */
export function createRegistry(pages: PageInfo[]): PageRegistry {
  const map = new Map<string, PageInfo>();
  for (const p of pages) {
    const path = pathOnly(p.path);
    if (!map.has(path)) map.set(path, { ...p, path });
  }
  const list = [...map.values()];
  return {
    get: (path: string) => map.get(pathOnly(path)) ?? null,
    all: () => list.map((p) => ({ ...p })),
  };
}

export function buildPageRegistry(state: AppState, opts?: { minListings?: number }): PageRegistry {
  const minListings = opts?.minListings ?? DEFAULT_MIN_LISTINGS;
  const pages: PageInfo[] = [];
  const base = { status: 200 as const, demo: false, draft: false };

  const published = state.businesses.filter((b) => b.status === "published");
  const hasRealArticles = state.articles.some((a) => a.status === "published" && !a.demo);

  pages.push({ ...base, path: "/", kind: "home", indexable: true });
  pages.push({ ...base, path: "/uslugi", kind: "hub", indexable: true });
  // N5: hub bez realnej treści (0 opublikowanych artykułów) nie jest indeksowany — brak cienkich stron w sitemap.
  pages.push({ ...base, path: "/poradniki", kind: "hub", indexable: hasRealArticles });
  for (const s of STATIC_PATHS) pages.push({ ...base, path: s, kind: "static", indexable: true });
  for (const s of TOOL_PATHS) pages.push({ ...base, path: s, kind: "static", indexable: true });

  // Portal V3: atlas /zwierzeta indeksowany tylko przy ≥1 publicznym dziale; strony niepubliczne (0 opublikowanych,
  // realnych materiałów) nie trafiają do rejestru — w produkcji zwracają 404, poza nią są podglądem z noindex.
  const vis = computeVisibility(state.articles);
  pages.push({ ...base, path: "/zwierzeta", kind: "hub", indexable: vis.publicGroups.length > 0, lastmod: latestUpdate(vis.publicGroups.flatMap((g) => g.publishedArticles)) });
  for (const g of vis.publicGroups) {
    pages.push({ ...base, path: `/zwierzeta/${g.group.slug}`, kind: "animal", indexable: true, lastmod: latestUpdate(g.publishedArticles) });
    for (const sp of g.publicSpecies) {
      pages.push({ ...base, path: `/zwierzeta/${g.group.slug}/${sp.slug}`, kind: "animal", indexable: true, lastmod: latestUpdate(speciesArticles(vis, g.group.slug, sp.slug)) });
    }
  }

  for (const cat of CATEGORIES) {
    const realInCategory = published.some((b) => b.category === cat && !b.demo);
    pages.push({ ...base, path: `/uslugi/${cat}`, kind: "hub", indexable: realInCategory });
    for (const city of CITIES) {
      const inListing = published.filter((b) => b.category === cat && b.city === city);
      const real = inListing.filter((b) => !b.demo).length;
      pages.push({
        ...base,
        path: `/uslugi/${cat}/${city}`,
        kind: "listing",
        indexable: real >= minListings, // N4
        listingCount: inListing.length,
        realListingCount: real,
      });
    }
  }

  for (const b of published) {
    pages.push({
      ...base,
      path: `/firma/${b.slug}`,
      kind: "business",
      demo: b.demo,
      // N1: DEMO nigdy; N6: tylko firmy z potwierdzonymi danymi (checkedAt ustawiane po weryfikacji redakcji).
      indexable: !b.demo && !!b.checkedAt,
      lastmod: b.checkedAt,
    });
  }

  for (const a of state.articles) {
    if (a.status !== "published") continue;
    pages.push({
      ...base,
      path: `${a.basePath ?? "/poradniki"}/${a.slug}`, // /blog/* = dawne URL zachowane jako 200
      kind: "article",
      demo: a.demo,
      indexable: !a.demo,
      lastmod: a.updatedAt,
    });
  }

  return createRegistry(pages);
}
