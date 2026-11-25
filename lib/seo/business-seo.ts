// SEO profili firm (audyt V4 A08/A15): indywidualny opis meta i JSON-LD LocalBusiness.
// Tylko dla profili opublikowanych, nie-DEMO i z potwierdzoną datą sprawdzenia (checkedAt).
// Bez adresu, telefonu, ocen, godzin i cen — publikujemy wyłącznie to, co pewne i widoczne na stronie.
import type { Business } from "../types";
import { CATEGORIES, CITIES } from "../site";
import { CANONICAL_ORIGIN, type JsonLdObject } from "./structured-data";

export const isIndexableBusiness = (b: Business): boolean => b.status === "published" && !b.demo && !!b.checkedAt;

const PETS = { psy: "psów", koty: "kotów" } as const;

function cut(text: string, max: number): string {
  if (text.length <= max) return text;
  const s = text.slice(0, max - 1);
  return `${s.slice(0, s.lastIndexOf(" ") > 40 ? s.lastIndexOf(" ") : s.length).replace(/[,;:\s-]+$/, "")}…`;
}

/** Opis meta ≤160 znaków z danych profilu; bez superlatywów i ocen. */
export function businessMetaDescription(b: Business): string {
  const cat = CATEGORIES[b.category].name;
  const city = CITIES[b.city];
  const services = b.services.slice(0, 3).join(", ");
  const pets = b.petTypes.map((p) => PETS[p]).join(" i ");
  const parts = [`${b.name} — ${cat.toLowerCase()} ${city.locative}.`];
  if (services) parts.push(`Usługi: ${services}.`);
  if (pets) parts.push(`Dla ${pets}.`);
  parts.push("Dane sprawdzone przez redakcję ZOO24.");
  return cut(parts.join(" "), 160);
}

/** LocalBusiness tylko dla profili z potwierdzonymi danymi; null w pozostałych przypadkach. */
export function businessLd(b: Business): JsonLdObject | null {
  if (!isIndexableBusiness(b)) return null;
  const url = `${CANONICAL_ORIGIN}/firma/${b.slug}`;
  return {
    "@type": "LocalBusiness",
    "@id": `${url}#business`,
    name: b.name,
    url,
    description: businessMetaDescription(b),
    areaServed: { "@type": "City", name: CITIES[b.city].name },
    ...(b.websiteUrl && /^https:\/\//i.test(b.websiteUrl) ? { sameAs: [b.websiteUrl] } : {}),
  };
}
