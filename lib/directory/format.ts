// ZOO24 — formatowanie pl-PL dla katalogu.

/** Polska odmiana liczebnika: 1 firma, 2–4 firmy, 5+ firm (12–14 firm, 22–24 firmy). */
export function pluralPl(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(Math.trunc(n));
  if (abs === 1) return one;
  const d = abs % 10;
  const t = abs % 100;
  if (d >= 2 && d <= 4 && !(t >= 12 && t <= 14)) return few;
  return many;
}

export const firmCount = (n: number) => `${n} ${pluralPl(n, "firma", "firmy", "firm")}`;

export const capitalize = (s: string) => (s ? s.charAt(0).toLocaleUpperCase("pl-PL") + s.slice(1) : s);

export function formatDatePl(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Warsaw" });
}
