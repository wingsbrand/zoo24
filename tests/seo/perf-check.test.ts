import { describe, expect, it } from "vitest";
// @ts-expect-error moduł .mjs bez typów
import { analyzeHtml, summarizePsi } from "../../scripts/perf-check.mjs";

describe("perf-check: analiza HTML i PSI (lab ≠ field)", () => {
  it("liczy obrazy bez wymiarów, ale nie karze trybu fill", () => {
    const html = '<img alt="a" loading="lazy" width="10" height="10"/><img alt="b" data-nimg="fill" loading="lazy"/><img src="x"/><script></script><link rel="stylesheet" href="a.css"/>';
    const r = analyzeHtml(html);
    expect(r.images).toBe(3);
    expect(r.imagesLazy).toBe(2);
    expect(r.imagesWithoutDimensions).toBe(1);
    expect(r.imagesWithoutAlt).toBe(1);
    expect(r.scripts).toBe(1);
    expect(r.renderBlockingStylesheets).toBe(1);
  });
  it("brak danych PSI → null, nie wartości zmyślone", () => {
    expect(summarizePsi({})).toEqual({ lab: null, field: null });
    expect(summarizePsi(null)).toEqual({ lab: null, field: null });
  });
  it("rozdziela lab i field", () => {
    const s = summarizePsi({ lighthouseResult: { audits: { "largest-contentful-paint": { numericValue: 2400.4 } }, categories: { performance: { score: 0.9 } } }, loadingExperience: { metrics: { LARGEST_CONTENTFUL_PAINT_MS: { percentile: 2100 } }, overall_category: "FAST" } });
    expect(s.lab?.lcpMs).toBe(2400);
    expect(s.field?.lcpMs).toBe(2100);
    expect(s.field?.inpMs).toBeNull();
  });
});
