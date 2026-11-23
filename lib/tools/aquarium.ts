// Kalkulator objętości akwarium — czyste funkcje (bez React, bez DOM).
// Wynik jest ORIENTACYJNY: narzędzie nie określa obsady ani parametrów wody.

export type AquariumShape = "box" | "cylinder";
export type LengthUnit = "cm" | "in";
export type DimensionMode = "internal" | "external";

/** Surowe dane z formularza (tekst lub liczba). Puste pola opcjonalne = 0. */
export interface AquariumInput {
  shape: AquariumShape;
  unit: LengthUnit;
  mode: DimensionMode;
  length?: string | number;
  width?: string | number;
  height?: string | number;
  diameter?: string | number;
  /** Grubość szkła w mm (tylko wymiary zewnętrzne). */
  glassMm?: string | number;
  /** Odstęp lustra wody od górnej krawędzi, w cm. */
  waterGapCm?: string | number;
  /** Procent objętości wody zajęty przez podłoże i dekoracje (ustawia użytkownik). */
  displacementPct?: string | number;
}

export type AquariumField = "length" | "width" | "height" | "diameter" | "glassMm" | "waterGapCm" | "displacementPct";
export type AquariumErrors = Partial<Record<AquariumField, string>>;

export interface AquariumResult {
  shape: AquariumShape;
  /** Wymiary wewnętrzne w cm (po odjęciu szkła, jeśli podano zewnętrzne). */
  inner: { length?: number; width?: number; diameter?: number; height: number };
  waterHeightCm: number;
  nominalLiters: number;
  nominalGallons: number;
  waterLiters: number;
  waterGallons: number;
  estimatedLiters: number;
  estimatedGallons: number;
  glassMm: number;
  waterGapCm: number;
  displacementPct: number;
}

export type AquariumOutcome = { ok: true; result: AquariumResult } | { ok: false; errors: AquariumErrors };

export const CM_PER_INCH = 2.54;
export const LITERS_PER_US_GALLON = 3.785411784;
export const MAX_DIMENSION_CM = 1000;
export const MAX_GLASS_MM = 50;
export const MAX_DISPLACEMENT_PCT = 50;

export const round1 = (n: number): number => Math.round((n + Number.EPSILON) * 10) / 10;
export const toCm = (value: number, unit: LengthUnit): number => (unit === "in" ? value * CM_PER_INCH : value);
export const cm3ToLiters = (cm3: number): number => cm3 / 1000;
export const litersToUsGallons = (l: number): number => l / LITERS_PER_US_GALLON;

/** Parsuje liczbę z pola tekstowego (akceptuje przecinek dziesiętny). null = puste, NaN = niepoprawne. */
export function parseNumber(raw: string | number | undefined | null): number | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : NaN;
  const s = raw.trim().replace(/\s+/g, "").replace(",", ".");
  if (s === "") return null;
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)) return NaN;
  return Number(s);
}

const DIM_LABEL: Record<"length" | "width" | "height" | "diameter", string> = {
  length: "długość",
  width: "szerokość",
  height: "wysokość",
  diameter: "średnicę",
};

/** Waliduje wymiar wymagany; zwraca wartość w cm albo komunikat błędu. */
function requiredDimension(field: keyof typeof DIM_LABEL, raw: AquariumInput[keyof typeof DIM_LABEL], unit: LengthUnit): number | string {
  const n = parseNumber(raw);
  if (n === null) return `Podaj ${DIM_LABEL[field]}.`;
  if (Number.isNaN(n)) return "Wpisz liczbę, np. 60 albo 60,5.";
  if (n <= 0) return "Wartość musi być większa od zera.";
  const cm = toCm(n, unit);
  if (cm > MAX_DIMENSION_CM) return `Wartość jest zbyt duża (maksymalnie ${MAX_DIMENSION_CM} cm${unit === "in" ? ", ok. 393,7 in" : ""}).`;
  return cm;
}

/** Pole opcjonalne: puste = 0; musi być ≥ 0 i ≤ max. */
function optionalNonNegative(raw: string | number | undefined, max: number, unitLabel: string): number | string {
  const n = parseNumber(raw);
  if (n === null) return 0;
  if (Number.isNaN(n)) return "Wpisz liczbę albo zostaw 0.";
  if (n < 0) return "Wartość nie może być ujemna.";
  if (n > max) return `Wartość jest zbyt duża (maksymalnie ${max} ${unitLabel}).`;
  return n;
}

export function calculateAquarium(input: AquariumInput): AquariumOutcome {
  const errors: AquariumErrors = {};
  const dims: Partial<Record<keyof typeof DIM_LABEL, number>> = {};
  const fields: (keyof typeof DIM_LABEL)[] = input.shape === "cylinder" ? ["diameter", "height"] : ["length", "width", "height"];
  for (const f of fields) {
    const v = requiredDimension(f, input[f], input.unit);
    if (typeof v === "string") errors[f] = v;
    else dims[f] = v;
  }

  let glassMm = 0;
  if (input.mode === "external") {
    const g = optionalNonNegative(input.glassMm, MAX_GLASS_MM, "mm");
    if (typeof g === "string") errors.glassMm = g;
    else glassMm = g;
  }
  const gapV = optionalNonNegative(input.waterGapCm, MAX_DIMENSION_CM, "cm");
  if (typeof gapV === "string") errors.waterGapCm = gapV;
  const dispV = optionalNonNegative(input.displacementPct, MAX_DISPLACEMENT_PCT, "%");
  if (typeof dispV === "string") errors.displacementPct = dispV;

  if (Object.keys(errors).length) return { ok: false, errors };

  const t = glassMm / 10; // cm
  const innerH = dims.height! - t; // tylko dno
  let baseAreaCm2: number;
  let inner: AquariumResult["inner"];
  if (input.shape === "cylinder") {
    const d = dims.diameter! - 2 * t;
    if (d <= 0) errors.glassMm = "Przy tej grubości szkła średnica wewnętrzna byłaby ≤ 0. Sprawdź wymiary lub grubość.";
    baseAreaCm2 = Math.PI * (d / 2) ** 2;
    inner = { diameter: d, height: innerH };
  } else {
    const l = dims.length! - 2 * t;
    const w = dims.width! - 2 * t;
    if (l <= 0 || w <= 0) errors.glassMm = "Przy tej grubości szkła wymiary wewnętrzne byłyby ≤ 0. Sprawdź wymiary lub grubość.";
    baseAreaCm2 = l * w;
    inner = { length: l, width: w, height: innerH };
  }
  if (innerH <= 0 && !errors.glassMm) errors.glassMm = "Przy tej grubości dna wysokość wewnętrzna byłaby ≤ 0.";
  if (Object.keys(errors).length) return { ok: false, errors };

  const gap = gapV as number;
  if (gap >= innerH) {
    return { ok: false, errors: { waterGapCm: `Odstęp musi być mniejszy niż wysokość wewnętrzna (${round1(innerH)} cm).` } };
  }
  const disp = dispV as number;
  const waterH = innerH - gap;
  const nominalLiters = cm3ToLiters(baseAreaCm2 * innerH);
  const waterLiters = cm3ToLiters(baseAreaCm2 * waterH);
  const estimatedLiters = waterLiters * (1 - disp / 100);

  return {
    ok: true,
    result: {
      shape: input.shape,
      inner,
      waterHeightCm: waterH,
      nominalLiters,
      nominalGallons: litersToUsGallons(nominalLiters),
      waterLiters,
      waterGallons: litersToUsGallons(waterLiters),
      estimatedLiters,
      estimatedGallons: litersToUsGallons(estimatedLiters),
      glassMm,
      waterGapCm: gap,
      displacementPct: disp,
    },
  };
}

/** Polski zapis liczby z 1 miejscem po przecinku. */
export function formatPl(n: number): string {
  return round1(n).toLocaleString("pl-PL", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
