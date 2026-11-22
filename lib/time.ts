// Czas: zapis w UTC, wyświetlanie Europe/Warsaw (z obsługą DST przez Intl).
export const TZ = "Europe/Warsaw";

function warsawOffsetMinutes(utc: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).formatToParts(utc);
  const g = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute"), g("second"));
  return Math.round((asUtc - utc.getTime()) / 60000);
}

/** "2026-11-30T18:00" (czas lokalny Warszawa) -> ISO UTC. */
export function warsawLocalToUtcIso(local: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!m) throw new Error(`Nieprawidłowy czas lokalny: ${local}`);
  const naive = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let guess = naive - warsawOffsetMinutes(new Date(naive)) * 60000;
  guess = naive - warsawOffsetMinutes(new Date(guess)) * 60000;
  return new Date(guess).toISOString();
}

export function formatWarsaw(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: TZ, dateStyle: "medium", timeStyle: "short",
  }).format(new Date(iso));
}

/** Poniedziałek tygodnia ISO (wg Warszawy) dla limitu postów/tydzień. */
export function warsawWeekKey(iso: string): string {
  const d = new Date(iso);
  const local = new Date(d.getTime() + warsawOffsetMinutes(d) * 60000);
  const day = (local.getUTCDay() + 6) % 7;
  local.setUTCDate(local.getUTCDate() - day);
  return local.toISOString().slice(0, 10);
}
