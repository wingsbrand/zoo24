// Formatowanie pl-PL dla widoków redakcyjnych (deterministyczne na serwerze: strefa UTC).

export function formatDatePl(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** Polska odmiana: 1 poradnik, 2–4 poradniki, 5+ poradników (12–14 -> poradników). */
export function plPlural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  const d = n % 10;
  const h = n % 100;
  return d >= 2 && d <= 4 && !(h >= 12 && h <= 14) ? few : many;
}

export const articlesLabel = (n: number) => `${n} ${plPlural(n, "poradnik", "poradniki", "poradników")}`;

/** Szacowany czas czytania (≈ 200 słów/min), min. 1. */
export function readingMinutes(paragraphs: string[]): number {
  const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
