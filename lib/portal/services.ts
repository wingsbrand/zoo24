// Linki do katalogu usług: tylko niepuste kombinacje (≥1 opublikowana, realna firma). Czyste funkcje.
import type { Business, CategorySlug, CitySlug } from "../types";
import type { GroupSlug } from "../taxonomy/animals";
import { listingCounts, PILOT_CATEGORIES, PILOT_CITIES } from "../directory/stats";

export interface ServiceLinks {
  /** Kategorie z ≥1 opublikowaną, realną (nie-DEMO) firmą i ich niepuste miasta. */
  categories: { category: CategorySlug; real: number; cities: { city: CitySlug; real: number }[] }[];
}

/** Bez linków do pustych stron miasto×usługa. `petGroup` zawęża do firm z tą grupą lub bez informacji o zwierzętach. */
export function serviceLinks(businesses: readonly Business[], petGroup?: GroupSlug): ServiceLinks {
  const list = petGroup
    ? businesses.filter((b) => b.petTypes.length === 0 || (b.petTypes as string[]).includes(petGroup))
    : businesses;
  const counts = listingCounts(list);
  return {
    categories: PILOT_CATEGORIES.map((category) => {
      const cities = PILOT_CITIES.map((city) => ({ city, real: counts[category][city].real })).filter((c) => c.real > 0);
      return { category, real: cities.reduce((s, c) => s + c.real, 0), cities };
    }).filter((c) => c.real > 0),
  };
}
