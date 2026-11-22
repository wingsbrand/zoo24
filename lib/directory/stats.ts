// ZOO24 — liczby firm per kategoria × miasto (tylko opublikowane), z rozróżnieniem DEMO.
import type { Business, CategorySlug, CitySlug } from "../types";

export interface ListingCount { total: number; real: number; demo: number }

export const PILOT_CATEGORIES: readonly CategorySlug[] = ["groomer", "hotel-dla-zwierzat"];
export const PILOT_CITIES: readonly CitySlug[] = ["warszawa", "krakow", "lodz", "wroclaw", "poznan", "gdansk", "szczecin", "bydgoszcz", "lublin", "bialystok"];

export function listingCounts(businesses: readonly Business[]): Record<CategorySlug, Record<CitySlug, ListingCount>> {
  const out = Object.fromEntries(
    PILOT_CATEGORIES.map((c) => [c, Object.fromEntries(PILOT_CITIES.map((ci) => [ci, { total: 0, real: 0, demo: 0 }]))]),
  ) as Record<CategorySlug, Record<CitySlug, ListingCount>>;
  for (const b of businesses) {
    if (b.status !== "published") continue;
    const cell = out[b.category]?.[b.city];
    if (!cell) continue;
    cell.total += 1;
    if (b.demo) cell.demo += 1;
    else cell.real += 1;
  }
  return out;
}

/** Minimalna liczba realnych (nie-DEMO) firm, aby listing był indeksowalny (zgodnie z lib/seo/page-registry.ts). */
export const MIN_REAL_LISTINGS = 3;
