// Harmonogram sześciu ról (z zoo24-ops/ops/templates/schedule.example.json), w czasie Europe/Warsaw.
// Cron interpretowany lokalnie dla każdego dnia => poprawna obsługa DST (R11): 07:00 to 05:00Z latem
// i 06:00Z zimą; godzina powtórzona jesienią daje jeden run; nieistniejąca wiosną — jeden run godzinę później.
// Brak catch-upu (R10): dispatcher uruchamia tylko najnowszy slot w oknie `graceMinutes`.
import { TZ, warsawLocalToUtcIso } from "../time";
import type { OpsRole } from "./types";

export interface OpsScheduleEntry {
  jobKey: `zoo24-ops-${OpsRole}`;
  role: OpsRole;
  cronLocal: string;
  promptFile: string;
  maxRuntimeSeconds: number;
  maxTurns: number;
  maxAttemptsTotal: number;
  enabled: false; // aktywacja wyłącznie przez zatwierdzoną politykę i wybrany runtime
}

export const OPS_SCHEDULE: OpsScheduleEntry[] = [
  { jobKey: "zoo24-ops-knowledge", role: "knowledge", cronLocal: "0 7 * * *", promptFile: "zoo24-ops/ops/prompts/knowledge.txt", maxRuntimeSeconds: 1200, maxTurns: 30, maxAttemptsTotal: 3, enabled: false },
  { jobKey: "zoo24-ops-seo", role: "seo", cronLocal: "30 7 * * 1-5", promptFile: "zoo24-ops/ops/prompts/seo.txt", maxRuntimeSeconds: 1200, maxTurns: 30, maxAttemptsTotal: 3, enabled: false },
  { jobKey: "zoo24-ops-build", role: "build", cronLocal: "0 8 * * 1-5", promptFile: "zoo24-ops/ops/prompts/build.txt", maxRuntimeSeconds: 2400, maxTurns: 50, maxAttemptsTotal: 3, enabled: false },
  { jobKey: "zoo24-ops-content", role: "content", cronLocal: "0 9 * * 1,3,5", promptFile: "zoo24-ops/ops/prompts/content.txt", maxRuntimeSeconds: 1200, maxTurns: 30, maxAttemptsTotal: 3, enabled: false },
  { jobKey: "zoo24-ops-social", role: "social", cronLocal: "0 9 * * *", promptFile: "zoo24-ops/ops/prompts/social.txt", maxRuntimeSeconds: 1200, maxTurns: 30, maxAttemptsTotal: 3, enabled: false },
  { jobKey: "zoo24-ops-growth", role: "growth", cronLocal: "0 10 * * 2,4", promptFile: "zoo24-ops/ops/prompts/growth.txt", maxRuntimeSeconds: 1200, maxTurns: 30, maxAttemptsTotal: 3, enabled: false },
];

const DOW_PL = ["nd", "pn", "wt", "śr", "cz", "pt", "sb"];

function parseField(f: string, min: number, max: number): number[] {
  const out = new Set<number>();
  for (const part of f.split(",")) {
    if (part === "*") { for (let i = min; i <= max; i++) out.add(i); continue; }
    const r = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!r) throw new Error(`Nieobsługiwane pole cron: ${f}`);
    const a = +r[1], b = r[2] ? +r[2] : a;
    if (a < min || b > max || a > b) throw new Error(`Pole cron poza zakresem: ${f}`);
    for (let i = a; i <= b; i++) out.add(i);
  }
  return [...out].sort((x, y) => x - y);
}

export function parseCron(expr: string) {
  const f = expr.trim().split(/\s+/);
  if (f.length !== 5) throw new Error(`Cron musi mieć 5 pól: ${expr}`);
  return {
    minutes: parseField(f[0], 0, 59), hours: parseField(f[1], 0, 23), dom: parseField(f[2], 1, 31),
    months: parseField(f[3], 1, 12), dow: parseField(f[4], 0, 7).map((d) => d % 7), domAny: f[2] === "*", dowAny: f[4] === "*",
  };
}

function warsawDate(utc: Date): { y: number; m: number; d: number } {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(utc);
  const g = (t: string) => Number(p.find((x) => x.type === t)!.value);
  return { y: g("year"), m: g("month"), d: g("day") };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Wszystkie terminy (UTC) w przedziale (from, to]. */
export function slotsBetween(cron: string, from: Date, to: Date): Date[] {
  const c = parseCron(cron);
  const start = warsawDate(new Date(from.getTime() - 86400_000));
  const endMs = to.getTime() + 86400_000;
  const out = new Map<number, Date>();
  for (let day = Date.UTC(start.y, start.m - 1, start.d); day <= endMs; day += 86400_000) {
    const dt = new Date(day);
    const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate(), wd = dt.getUTCDay();
    if (!c.months.includes(m)) continue;
    const domOk = c.dom.includes(d), dowOk = c.dow.includes(wd);
    const dayOk = c.domAny && c.dowAny ? true : c.domAny ? dowOk : c.dowAny ? domOk : domOk || dowOk;
    if (!dayOk) continue;
    for (const h of c.hours) for (const mi of c.minutes) {
      const t = new Date(warsawLocalToUtcIso(`${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(mi)}`));
      if (t > from && t <= to) out.set(t.getTime(), t);
    }
  }
  return [...out.values()].sort((a, b) => a.getTime() - b.getTime());
}

export function nextSlot(cron: string, after: Date): Date | null {
  return slotsBetween(cron, after, new Date(after.getTime() + 8 * 86400_000))[0] ?? null;
}

/** Najnowszy termin w oknie (now - grace, now]; starsze pominięte (bez nadrabiania zaległości). */
export function latestDueSlot(cron: string, now: Date, graceMinutes = 60): Date | null {
  const s = slotsBetween(cron, new Date(now.getTime() - graceMinutes * 60_000), now);
  return s.length ? s[s.length - 1] : null;
}

/** Opis cron po polsku do panelu, np. "pn–pt 07:30". */
export function describeCron(cron: string): string {
  const c = parseCron(cron);
  const days = c.dowAny ? "codziennie" : c.dow.length === 5 && c.dow.join() === "1,2,3,4,5" ? "pn–pt" : c.dow.map((d) => DOW_PL[d]).join(", ");
  const times = c.hours.flatMap((h) => c.minutes.map((m) => `${pad(h)}:${pad(m)}`)).join(", ");
  return `${days} ${times}`;
}
