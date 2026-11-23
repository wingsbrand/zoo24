import { describe, expect, it } from "vitest";
import { calculateAquarium, formatPl, parseNumber, round1, type AquariumInput } from "@/lib/tools/aquarium";

const box = (p: Partial<AquariumInput> = {}): AquariumInput => ({ shape: "box", unit: "cm", mode: "internal", length: "100", width: "40", height: "50", ...p });

function ok(input: AquariumInput) {
  const out = calculateAquarium(input);
  if (!out.ok) throw new Error(`Oczekiwano wyniku, otrzymano błędy: ${JSON.stringify(out.errors)}`);
  return out.result;
}
function errs(input: AquariumInput) {
  const out = calculateAquarium(input);
  if (out.ok) throw new Error("Oczekiwano błędów walidacji");
  return out.errors;
}

describe("calculateAquarium — wartości znane", () => {
  it("100×40×50 cm (wewnętrzne) = 200,0 L i ok. 52,8 US gal", () => {
    const r = ok(box());
    expect(round1(r.nominalLiters)).toBe(200);
    expect(round1(r.waterLiters)).toBe(200);
    expect(round1(r.estimatedLiters)).toBe(200);
    expect(round1(r.nominalGallons)).toBe(52.8);
  });

  it("przelicza cale: 24×12×16 in = 4608 in³ ≈ 75,5 L ≈ 19,9 US gal", () => {
    const r = ok(box({ unit: "in", length: "24", width: "12", height: "16" }));
    expect(round1(r.nominalLiters)).toBe(75.5);
    expect(round1(r.nominalGallons)).toBe(19.9);
    expect(r.inner.length).toBeCloseTo(60.96, 6);
  });

  it("wymiary zewnętrzne ze szkłem 8 mm: 98,4×38,4×49,2 cm ≈ 185,9 L", () => {
    const r = ok(box({ mode: "external", glassMm: "8" }));
    expect(r.inner.length).toBeCloseTo(98.4, 6);
    expect(r.inner.width).toBeCloseTo(38.4, 6);
    expect(r.inner.height).toBeCloseTo(49.2, 6);
    expect(round1(r.nominalLiters)).toBe(185.9);
  });

  it("grubość szkła jest ignorowana przy wymiarach wewnętrznych", () => {
    const r = ok(box({ mode: "internal", glassMm: "8" }));
    expect(round1(r.nominalLiters)).toBe(200);
    expect(r.glassMm).toBe(0);
  });

  it("odstęp lustra wody 5 cm: 100×40×45 = 180,0 L wody, nominalnie nadal 200,0 L", () => {
    const r = ok(box({ waterGapCm: "5" }));
    expect(r.waterHeightCm).toBe(45);
    expect(round1(r.waterLiters)).toBe(180);
    expect(round1(r.nominalLiters)).toBe(200);
  });

  it("wypieranie 10% przez podłoże i dekoracje: 180 L -> 162,0 L", () => {
    const r = ok(box({ waterGapCm: "5", displacementPct: "10" }));
    expect(round1(r.estimatedLiters)).toBe(162);
    expect(round1(r.estimatedGallons)).toBe(42.8);
  });

  it("walec Ø30×50 cm ≈ 35,3 L", () => {
    const r = ok({ shape: "cylinder", unit: "cm", mode: "internal", diameter: "30", height: "50" });
    expect(round1(r.nominalLiters)).toBe(35.3);
  });

  it("walec z wymiarami zewnętrznymi (szkło 5 mm): Ø29×49,5 cm ≈ 32,7 L", () => {
    const r = ok({ shape: "cylinder", unit: "cm", mode: "external", diameter: "30", height: "50", glassMm: "5" });
    expect(r.inner.diameter).toBeCloseTo(29, 6);
    expect(round1(r.nominalLiters)).toBe(32.7);
  });

  it("akceptuje przecinek dziesiętny i puste pola opcjonalne (= 0)", () => {
    const r = ok(box({ length: "100,0", glassMm: "", waterGapCm: "", displacementPct: "" }));
    expect(round1(r.estimatedLiters)).toBe(200);
  });
});

describe("calculateAquarium — walidacja", () => {
  it("brak wymiarów wymaganych", () => {
    const e = errs(box({ length: "", width: " ", height: undefined }));
    expect(e.length).toMatch(/Podaj długość/);
    expect(e.width).toMatch(/Podaj szerokość/);
    expect(e.height).toMatch(/Podaj wysokość/);
  });

  it("walec wymaga średnicy (długość/szerokość nieistotne)", () => {
    const e = errs({ shape: "cylinder", unit: "cm", mode: "internal", height: "50" });
    expect(e.diameter).toMatch(/Podaj średnicę/);
    expect(e.length).toBeUndefined();
  });

  it("odrzuca wartości nieliczbowe", () => {
    expect(errs(box({ length: "abc" })).length).toMatch(/Wpisz liczbę/);
    expect(errs(box({ width: "12cm" })).width).toMatch(/Wpisz liczbę/);
    expect(errs(box({ height: Number.NaN })).height).toMatch(/Wpisz liczbę/);
  });

  it("odrzuca wartości ≤ 0", () => {
    expect(errs(box({ length: "0" })).length).toMatch(/większa od zera/);
    expect(errs(box({ height: "-10" })).height).toMatch(/większa od zera/);
  });

  it("odrzuca wymiary absurdalnie duże (> 1000 cm, także po przeliczeniu z cali)", () => {
    expect(errs(box({ length: "1000.1" })).length).toMatch(/zbyt duża/);
    expect(errs(box({ unit: "in", length: "400" })).length).toMatch(/zbyt duża/);
    expect(calculateAquarium(box({ length: "1000" })).ok).toBe(true);
  });

  it("grubość szkła: nie liczba, ujemna, zbyt duża", () => {
    expect(errs(box({ mode: "external", glassMm: "x" })).glassMm).toMatch(/Wpisz liczbę/);
    expect(errs(box({ mode: "external", glassMm: "-1" })).glassMm).toMatch(/ujemna/);
    expect(errs(box({ mode: "external", glassMm: "51" })).glassMm).toMatch(/zbyt duża/);
  });

  it("grubość szkła dająca wymiary wewnętrzne ≤ 0", () => {
    expect(errs(box({ mode: "external", width: "2", glassMm: "10" })).glassMm).toMatch(/wewnętrzne byłyby ≤ 0/);
    expect(errs({ shape: "cylinder", unit: "cm", mode: "external", diameter: "1", height: "50", glassMm: "5" }).glassMm).toMatch(/średnica wewnętrzna/);
    expect(errs(box({ mode: "external", height: "0.5", glassMm: "5" })).glassMm).toMatch(/wysokość wewnętrzna/);
  });

  it("odstęp lustra wody ≥ wysokości wewnętrznej", () => {
    expect(errs(box({ waterGapCm: "50" })).waterGapCm).toMatch(/mniejszy niż wysokość/);
    expect(errs(box({ mode: "external", glassMm: "10", waterGapCm: "49.5" })).waterGapCm).toMatch(/49 cm/);
    expect(errs(box({ waterGapCm: "-1" })).waterGapCm).toMatch(/ujemna/);
    expect(errs(box({ waterGapCm: "pięć" })).waterGapCm).toMatch(/Wpisz liczbę/);
  });

  it("procent wypierania: nie liczba, ujemny, powyżej 50%", () => {
    expect(errs(box({ displacementPct: "dużo" })).displacementPct).toMatch(/Wpisz liczbę/);
    expect(errs(box({ displacementPct: "-5" })).displacementPct).toMatch(/ujemna/);
    expect(errs(box({ displacementPct: "60" })).displacementPct).toMatch(/zbyt duża/);
  });

  it("zbiera błędy wielu pól jednocześnie", () => {
    const e = errs(box({ length: "a", width: "0", displacementPct: "99" }));
    expect(Object.keys(e).sort()).toEqual(["displacementPct", "length", "width"]);
  });
});

describe("pomocnicze", () => {
  it("parseNumber", () => {
    expect(parseNumber("")).toBeNull();
    expect(parseNumber(undefined)).toBeNull();
    expect(parseNumber("12,5")).toBe(12.5);
    expect(parseNumber(" 7 ")).toBe(7);
    expect(parseNumber("1e3")).toBeNaN();
    expect(parseNumber("1.2.3")).toBeNaN();
  });

  it("round1 i formatPl zaokrąglają do 1 miejsca", () => {
    expect(round1(185.905152)).toBe(185.9);
    expect(round1(0.05)).toBe(0.1);
    expect(formatPl(200)).toBe("200,0");
  });
});
