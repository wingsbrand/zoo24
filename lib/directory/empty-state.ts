// ZOO24 — pusta strona miasto × usługa (A07) i kafle miast w hubie kategorii.
// Zasady: podpowiedzi muszą odpowiadać potrzebie (hotel = opieka podczas wyjazdu, nie groomer);
// inne miasta tylko tam, gdzie kategoria ma ≥ 1 realną (nie-DEMO) opublikowaną firmę;
// poradniki tylko opublikowane i nie-DEMO. Strona pozostaje 200 przy wejściu bezpośrednim (reguły noindex bez zmian).
import type { Article, Business, CategorySlug, CitySlug } from "../types";
import { articleHref } from "../content/editorial";
import { listingCounts, PILOT_CITIES, type ListingCount } from "./stats";

type Counts = ReturnType<typeof listingCounts>;

/**
 * Kategorie odpowiadające tej samej potrzebie. Groomer (pielęgnacja) i hotel (opieka podczas wyjazdu)
 * to różne potrzeby — celowo nie podpowiadamy jednej zamiast drugiej.
 */
export const RELATED_CATEGORIES: Readonly<Record<CategorySlug, readonly CategorySlug[]>> = {
  groomer: [],
  "hotel-dla-zwierzat": [],
};

/** Fragmenty slugów poradników pasujących do potrzeby danej kategorii. */
export const NEED_GUIDE_SLUG_KEYWORDS: Readonly<Record<CategorySlug, readonly string[]>> = {
  "hotel-dla-zwierzat": ["wyjazd"],
  groomer: ["groomer", "pielegnac"],
};

/** Narzędzia pasujące do potrzeby (strona narzędzia budowana osobno). */
export const NEED_TOOLS: Readonly<Record<CategorySlug, readonly { href: string; label: string; description: string }[]>> = {
  "hotel-dla-zwierzat": [
    {
      href: "/narzedzia/lista-dla-opiekuna",
      label: "Lista dla opiekuna zwierzęcia",
      description: "Przygotuj informacje dla osoby, która zaopiekuje się zwierzęciem podczas Twojego wyjazdu.",
    },
  ],
  groomer: [],
};

/** Nagłówek sekcji alternatyw wg potrzeby. */
export const NEED_LABELS: Readonly<Record<CategorySlug, string>> = {
  "hotel-dla-zwierzat": "Opieka nad zwierzęciem podczas wyjazdu",
  groomer: "Pielęgnacja zwierzęcia",
};

export interface EmptyListingSuggestions {
  needLabel: string;
  otherCities: { city: CitySlug; real: number; href: string }[];
  relatedCategories: { category: CategorySlug; real: number; href: string }[];
  guides: { slug: string; title: string; href: string }[];
  tools: { href: string; label: string; description: string }[];
}

/** Poradnik nadaje się do podpowiedzi: opublikowany i nie-DEMO. */
const isLiveArticle = (a: Article) => a.status === "published" && !a.demo;

export function emptyListingSuggestions(
  data: { businesses: readonly Business[]; articles: readonly Article[] },
  category: CategorySlug,
  city: CitySlug,
  opts: { maxGuides?: number } = {},
): EmptyListingSuggestions {
  const counts = listingCounts(data.businesses);
  const otherCities = PILOT_CITIES.filter((c) => c !== city && counts[category][c].real > 0).map((c) => ({
    city: c,
    real: counts[category][c].real,
    href: `/uslugi/${category}/${c}`,
  }));
  const relatedCategories = RELATED_CATEGORIES[category]
    .filter((c) => counts[c]?.[city]?.real > 0)
    .map((c) => ({ category: c, real: counts[c][city].real, href: `/uslugi/${c}/${city}` }));
  const keywords = NEED_GUIDE_SLUG_KEYWORDS[category];
  const guides = data.articles
    .filter((a) => isLiveArticle(a) && keywords.some((k) => a.slug.includes(k)))
    .slice(0, opts.maxGuides ?? 4)
    .map((a) => ({ slug: a.slug, title: a.title, href: articleHref(a) }));
  return { needLabel: NEED_LABELS[category], otherCities, relatedCategories, guides, tools: [...NEED_TOOLS[category]] };
}

export interface CityTile {
  city: CitySlug;
  count: ListingCount;
  /** Link tylko dla miast z ≥ 1 opublikowaną firmą; puste miasta pokazujemy z liczbą, bez linku (URL nadal działa). */
  linked: boolean;
  href: string;
}

export function cityTiles(category: CategorySlug, counts: Counts): CityTile[] {
  return PILOT_CITIES.map((c) => {
    const count = counts[category][c];
    return { city: c, count, linked: count.total > 0, href: `/uslugi/${category}/${c}` };
  });
}
