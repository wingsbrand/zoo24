// ZOO24 — rozstrzyganie wyszukiwania /szukaj?usluga=&miasto= (czyste funkcje).
import type { CategorySlug, CitySlug } from "../types";
import { normalizePl, resolveCityInput } from "./geo";
import type { RawSearchParams } from "./query";

/** Krótkie opisy kategorii (1 zdanie) — używane w hubach i podpowiedziach. */
export const CATEGORY_DESCRIPTIONS: Record<CategorySlug, string> = {
  groomer: "Kąpiel, strzyżenie, trymowanie i pielęgnacja pazurów — w salonie lub z dojazdem.",
  "hotel-dla-zwierzat": "Opieka nad psem lub kotem podczas Twojej nieobecności — pobyty dzienne i nocne.",
};

const CATEGORY_KEYWORDS: Record<CategorySlug, readonly string[]> = {
  groomer: ["groomer", "grooming", "groomera", "groomerzy", "fryzjer", "strzyzenie", "pielegnacja", "salon"],
  "hotel-dla-zwierzat": ["hotel", "hotel-dla-zwierzat", "hotele", "pensjonat", "przechowalnia", "opieka", "pobyt"],
};

/** Slug kategorii albo rozpoznane słowo kluczowe; inaczej null. */
export function resolveCategoryInput(text: string | null | undefined): CategorySlug | null {
  if (typeof text !== "string" || text.length > 80) return null;
  const n = normalizePl(text);
  if (!n) return null;
  if (n === "groomer" || n === "hotel-dla-zwierzat") return n;
  const tokens = n.split(/[\s,-]+/);
  for (const slug of Object.keys(CATEGORY_KEYWORDS) as CategorySlug[]) {
    if (tokens.some((t) => CATEGORY_KEYWORDS[slug].includes(t))) return slug;
  }
  return null;
}

export type SearchResolution =
  | { kind: "redirect"; href: string }
  | { kind: "outside_pilot"; category: CategorySlug | null; cityText: string }
  | { kind: "need_category"; city: CitySlug }
  | { kind: "empty"; category: CategorySlug | null };

const firstStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

/** Decyzja dla /szukaj. Echo wpisu użytkownika jest skracane (render i tak escapuje React). */
export function resolveSearch(sp: RawSearchParams): SearchResolution {
  const category = resolveCategoryInput(firstStr(sp.usluga));
  const cityText = firstStr(sp.miasto).trim().slice(0, 60);
  const city = resolveCityInput(cityText);
  if (category && city) return { kind: "redirect", href: `/uslugi/${category}/${city}` };
  if (cityText && !city) return { kind: "outside_pilot", category, cityText };
  if (city) return { kind: "need_category", city };
  if (category) return { kind: "redirect", href: `/uslugi/${category}` };
  return { kind: "empty", category: null };
}
