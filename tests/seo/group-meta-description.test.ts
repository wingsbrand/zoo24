// [ops-seo] Opisy meta hubów /zwierzeta/{grupa}: 110–160 znaków, unikalne, bez roszczeń sprzedażowych.
import { describe, expect, it } from "vitest";
import { GROUPS, groupMetaDescription } from "@/lib/taxonomy/animals";

describe("opisy meta hubów grup zwierząt", () => {
  const descs = GROUPS.map((g) => groupMetaDescription(g));
  it("mają 110–160 znaków", () => {
    for (const d of descs) { expect(d.length).toBeGreaterThanOrEqual(110); expect(d.length).toBeLessThanOrEqual(160); }
  });
  it("są unikalne i zawierają intro grupy", () => {
    expect(new Set(descs).size).toBe(GROUPS.length);
    GROUPS.forEach((g, i) => expect(descs[i].startsWith(g.intro)).toBe(true));
  });
});
