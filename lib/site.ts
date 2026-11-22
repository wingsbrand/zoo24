import type { CategorySlug, CitySlug } from "./types";

export const SITE_ENV = process.env.ZOO24_ENV ?? "local"; // bezpieczny default: nie-produkcja => noindex
export const SITE_URL = process.env.ZOO24_SITE_URL ?? "http://localhost:3024";
export const IS_PRODUCTION = SITE_ENV === "production";

export const CATEGORIES: Record<CategorySlug, { name: string; plural: string }> = {
  groomer: { name: "Groomer", plural: "Groomerzy i salony pielęgnacji" },
  "hotel-dla-zwierzat": { name: "Hotel dla zwierząt", plural: "Hotele dla psów i kotów" },
};

export const CITIES: Record<CitySlug, { name: string; locative: string }> = {
  warszawa: { name: "Warszawa", locative: "w Warszawie" },
  krakow: { name: "Kraków", locative: "w Krakowie" },
  lodz: { name: "Łódź", locative: "w Łodzi" },
  wroclaw: { name: "Wrocław", locative: "we Wrocławiu" },
  poznan: { name: "Poznań", locative: "w Poznaniu" },
  gdansk: { name: "Gdańsk", locative: "w Gdańsku" },
  szczecin: { name: "Szczecin", locative: "w Szczecinie" },
  bydgoszcz: { name: "Bydgoszcz", locative: "w Bydgoszczy" },
  lublin: { name: "Lublin", locative: "w Lublinie" },
  bialystok: { name: "Białystok", locative: "w Białymstoku" },
};

export const isCategory = (s: string): s is CategorySlug => s in CATEGORIES;
export const isCity = (s: string): s is CitySlug => s in CITIES;

/**
 * Panel admina F1: WYŁĄCZNIE środowisko `local` (staging/produkcja => 404 do czasu Supabase Auth, ADR-003)
 * i wyłącznie żądania z hosta loopback.
 */
export const adminEnabled = () => SITE_ENV === "local" && process.env.ZOO24_ADMIN_LOCAL_ONLY !== "false";

const LOOPBACK = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;
export function isLoopbackHost(host: string | null): boolean {
  return !!host && LOOPBACK.test(host);
}

/** Ochrona POST przed CSRF: tylko same-origin z hosta loopback. */
export function isTrustedAdminRequest(h: { get(name: string): string | null }): boolean {
  if (!adminEnabled() || !isLoopbackHost(h.get("host"))) return false;
  const site = h.get("sec-fetch-site");
  if (site && !["same-origin", "none"].includes(site)) return false;
  const origin = h.get("origin");
  if (origin) {
    try { if (!isLoopbackHost(new URL(origin).host)) return false; } catch { return false; }
  }
  return true;
}
