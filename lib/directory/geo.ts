// ZOO24 — dopasowanie miasta z tekstu i najbliższe miasto pilotażu. Czyste funkcje, bezpieczne w przeglądarce
// (bez importów serwerowych i process.env). Współrzędne nigdy nie są wysyłane na serwer.
import type { CitySlug } from "../types";

/** Przybliżone centra miast pilotażu (WGS84). */
export const CITY_COORDS: Record<CitySlug, { lat: number; lng: number }> = {
  warszawa: { lat: 52.2297, lng: 21.0122 },
  krakow: { lat: 50.0647, lng: 19.945 },
  lodz: { lat: 51.7592, lng: 19.456 },
  wroclaw: { lat: 51.1079, lng: 17.0385 },
  poznan: { lat: 52.4064, lng: 16.9252 },
  gdansk: { lat: 54.352, lng: 18.6466 },
  szczecin: { lat: 53.4285, lng: 14.5528 },
  bydgoszcz: { lat: 53.1235, lng: 18.0084 },
  lublin: { lat: 51.2465, lng: 22.5684 },
  bialystok: { lat: 53.1325, lng: 23.1688 },
};

// Formy po normalizacji (małe litery, bez polskich znaków). Odmiana przez przypadki + potoczne skróty.
const CITY_ALIASES: Record<CitySlug, readonly string[]> = {
  warszawa: ["warszawa", "warszawie", "warszawy", "warszawe", "warszawka", "warszawce", "wawa", "wawie", "waw", "warsaw", "stolica", "stolicy"],
  krakow: ["krakow", "krakowie", "krakowa", "krakowem", "cracow", "krk"],
  lodz: ["lodz", "lodzi", "lodzia"],
  wroclaw: ["wroclaw", "wroclawiu", "wroclawia", "wroclawiem", "wro"],
  poznan: ["poznan", "poznaniu", "poznania", "poznaniem", "pzn"],
  gdansk: ["gdansk", "gdansku", "gdanska", "gdanskiem", "trojmiasto", "trojmiescie"],
  szczecin: ["szczecin", "szczecinie", "szczecina", "szczecinem"],
  bydgoszcz: ["bydgoszcz", "bydgoszczy", "bydgoszcza", "bdg"],
  lublin: ["lublin", "lublinie", "lublina", "lublinem"],
  bialystok: ["bialystok", "bialymstoku", "bialegostoku", "bialystoku", "bialystokiem", "bstok", "bialystock"],
};

/** Normalizacja do porównań: małe litery, bez diakrytyków (ł → l), bez znaków specjalnych. */
export function normalizePl(text: string): string {
  return text
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s,-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * „Białystok”, „bialystok”, „w Białymstoku”, „Warszawa, Mokotów”, „wawa” → slug miasta pilotażu; inaczej null.
 * Miasta spoza pilotażu (np. „Biała Podlaska”) zwracają null — nie zgadujemy.
 */
export function resolveCityInput(text: string | null | undefined): CitySlug | null {
  if (typeof text !== "string" || text.length > 80) return null;
  let n = normalizePl(text);
  if (!n) return null;
  n = n.replace(/^(w|we|z|ze)\s+/, "");
  const tokens = n.split(/[\s,-]+/).filter(Boolean);
  const candidates = [n, n.replace(/[\s,-]+/g, ""), tokens[0] ?? ""];
  for (const slug of Object.keys(CITY_ALIASES) as CitySlug[]) {
    if (candidates.some((c) => c && CITY_ALIASES[slug].includes(c))) return slug;
  }
  return null;
}

const toRad = (d: number) => (d * Math.PI) / 180;

/** Odległość po kole wielkim (km). */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Próg, powyżej którego informujemy, że użytkownik jest daleko od pilotażu. */
export const FAR_FROM_PILOT_KM = 80;

/** Najbliższe miasto pilotażu dla współrzędnych; null dla nieprawidłowych danych. */
export function nearestCity(lat: number, lng: number): { city: CitySlug; distanceKm: number } | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  let best: { city: CitySlug; distanceKm: number } | null = null;
  for (const city of Object.keys(CITY_COORDS) as CitySlug[]) {
    const d = haversineKm({ lat, lng }, CITY_COORDS[city]);
    if (!best || d < best.distanceKm) best = { city, distanceKm: d };
  }
  return best && { city: best.city, distanceKm: Math.round(best.distanceKm) };
}
