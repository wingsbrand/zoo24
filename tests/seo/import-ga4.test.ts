import { describe, expect, it } from "vitest";
// @ts-expect-error — moduł .mjs bez deklaracji typów
import { pageType, proposeSegment, intentNote, mergeGa4 } from "../../scripts/import-ga4-landing.mjs";

describe("import GA4 landing -> inwentarz (klasyfikacja z URL, bez decyzji)", () => {
  it("rozpoznaje typy stron dawnego sklepu", () => {
    expect(pageType("/")).toBe("home");
    expect(pageType("/blog/kot-brytyjski-n66")).toBe("blog");
    expect(pageType("/brand/360-pan-miesko")).toBe("brand");
    expect(pageType("/118-legowiska-dla-psa")).toBe("category");
    expect(pageType("/smycze-dla-psa/10793-mocna-smycz-5904139121689.html")).toBe("product");
    expect(pageType("/koszyk")).toBe("account_cart_search");
    expect(pageType("/historia-zamowien")).toBe("account_cart_search");
  });

  it("proponuje segmenty i oznacza tematy zdrowotne", () => {
    expect(proposeSegment("/blog/maltanczyk-n77")).toBe("B");
    expect(proposeSegment("/14-karma-sucha-dla-psa")).toBe("C");
    expect(proposeSegment("/logowanie")).toBe("E");
    expect(intentNote("/blog/borelioza-u-psow-przyczyny-objawy-leczenie-i-profilaktyka-n90")).toMatch(/ZDROWIE/);
    expect(intentNote("/blog/cane-corso-n63")).toBe("informacyjna");
  });

  it("merge: żadnej automatycznej decyzji 200/301/404/410, zachowanie decyzji ludzi", () => {
    const existing = [{ old_path: "/blog/cane-corso-n63", segment: "B", proposed_action: "keep_200", status: "approved", reviewer: "redaktor" }];
    const rows = mergeGa4([{ path: "/blog/cane-corso-n63", sessions: 11812 }, { path: "/koszyk", sessions: 1177 }], existing, "2026-11-22");
    const cane = rows.find((r: Record<string, unknown>) => r.old_path === "/blog/cane-corso-n63");
    expect([cane.proposed_action, cane.status, cane.reviewer, cane.historical_ga4_organic_sessions]).toEqual(["keep_200", "approved", "redaktor", 11812]);
    const cart = rows.find((r: Record<string, unknown>) => r.old_path === "/koszyk");
    expect(cart.proposed_action).toBeUndefined();
    expect(cart.status).toBe("draft");
    expect(cart.historical_gsc_clicks).toBeUndefined(); // GA4 sesje ≠ kliknięcia GSC
  });
});
