// ZOO24 — kanały kontaktu firmy. Reguły zgodne z app/api/out/route.ts (www tylko https, telefon tylko publiczny).
import type { Business } from "../types";

export const hasSite = (b: Pick<Business, "websiteUrl">) => !!b.websiteUrl && /^https:\/\//i.test(b.websiteUrl);
export const hasPhone = (b: Pick<Business, "phonePublic">) => !!b.phonePublic && /\d/.test(b.phonePublic);

/** Link wyjścia przez licznik agregowany (bez danych osobowych). */
export function outHref(b: Pick<Business, "id">, t: "site" | "phone"): string {
  return `/api/out?b=${encodeURIComponent(b.id)}&t=${t}`;
}

export function contactChannels(b: Business): { site: string | null; phone: string | null } {
  return { site: hasSite(b) ? outHref(b, "site") : null, phone: hasPhone(b) ? outHref(b, "phone") : null };
}

/**
 * Lokalizacja publikowana na profilu (ADR-011, decyzja właściciela 2026-11-22):
 * adres pokazujemy wyłącznie jako adres LOKALU USŁUGOWEGO, który firma sama publikuje dla klientów
 * (źródło = strona firmy). Rekordy DEMO nigdy nie pokazują adresu. Brak adresów osób prywatnych.
 */
export function publicLocation(b: Business): { serviceArea: string | null; address: string | null } {
  const address = !b.demo && b.addressText?.trim() ? b.addressText.trim() : null;
  return { serviceArea: b.serviceArea?.trim() || null, address };
}

/** Link „Wyznacz trasę” — tylko do opublikowanego adresu lokalu (zewnętrzny serwis map, bez osadzania). */
export function directionsHref(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}
