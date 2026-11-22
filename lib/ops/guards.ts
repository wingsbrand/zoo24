// Strażnicy Growth/Analytics: brak historycznego „100k” jako aktualnego zasięgu (S06), brak ogłaszania
// sukcesu z małej próby (S07), brak łączenia organic i UTM bez metody (S09).

const REACH_CLAIM = /(100\s?(000|tys\.?|k)\b|ponad\s+100\s*(tys|000)|kilkana[śs]cie\s+tys)/i;

/** Tekst sprzedażowy z historycznym wolumenem bez świeżego (≤ 35 dni) pomiaru => odrzucony. */
export function checkReachClaim(text: string, freshMeasurementAt: string | null, now: Date): string[] {
  if (!REACH_CLAIM.test(text)) return [];
  const fresh = freshMeasurementAt && now.getTime() - new Date(freshMeasurementAt).getTime() <= 35 * 86400_000;
  return fresh ? [] : ["HISTORICAL_REACH_AS_CURRENT"];
}

export interface ExperimentInput { control: { visits: number; conversions: number }; variant: { visits: number; conversions: number }; minVisitsPerArm?: number }
export type ExperimentVerdict = { verdict: "inconclusive" | "variant_better" | "no_difference" | "variant_worse" | "n/a"; reason: string };

/** Ocena z minimalną próbą i testem dwóch proporcji (|z| ≥ 1,96). Mała próba => inconclusive, brak pomiaru => N/A. */
export function evaluateExperiment(x: ExperimentInput | null): ExperimentVerdict {
  if (!x) return { verdict: "n/a", reason: "brak pomiaru" };
  const min = x.minVisitsPerArm ?? 300;
  if (x.control.visits < min || x.variant.visits < min) return { verdict: "inconclusive", reason: `próba < ${min} wejść na wariant` };
  const p1 = x.control.conversions / x.control.visits, p2 = x.variant.conversions / x.variant.visits;
  const p = (x.control.conversions + x.variant.conversions) / (x.control.visits + x.variant.visits);
  const se = Math.sqrt(p * (1 - p) * (1 / x.control.visits + 1 / x.variant.visits));
  if (se === 0) return { verdict: "inconclusive", reason: "brak konwersji" };
  const z = (p2 - p1) / se;
  if (Math.abs(z) < 1.96) return { verdict: "no_difference", reason: `z=${z.toFixed(2)}` };
  return { verdict: z > 0 ? "variant_better" : "variant_worse", reason: `z=${z.toFixed(2)}` };
}

/** Łączenie kanałów: bez jawnej metody deduplikacji wynik jest oznaczony jako niepełna atrybucja. */
export function combineChannels(parts: { channel: string; sessions: number | null }[], method: "utm_first" | "ga4_default_channel" | null) {
  if (parts.some((p) => p.sessions === null)) return { total: null, attribution: "incomplete" as const, note: "brak danych części kanałów (N/A)" };
  if (!method) return { total: null, attribution: "incomplete" as const, note: "brak metody — kanały raportowane osobno" };
  return { total: parts.reduce((a, p) => a + (p.sessions ?? 0), 0), attribution: method, note: "" };
}
