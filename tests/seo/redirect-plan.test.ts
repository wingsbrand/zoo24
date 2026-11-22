import { describe, expect, it } from "vitest";
import { activeRedirects, validateRedirectMap } from "@/lib/seo/redirect-plan";
import { row, testRegistry } from "./fixtures";

const reg = testRegistry();
const errorsOf = (rows: Parameters<typeof validateRedirectMap>[0], path: string, opts?: Parameters<typeof validateRedirectMap>[2]) =>
  validateRedirectMap(rows, reg, opts).entries.find((e) => e.oldPath === path)!.errors;

describe("R1–R12 (policy §2)", () => {
  it("poprawny rekord B -> poradnik przechodzi", () => {
    const res = validateRedirectMap([row({ oldPath: "/demo-legacy/ok" })], reg);
    expect(res.entries[0]!.ok).toBe(true);
    expect(res.entries[0]!.errors).toEqual([]);
    expect(activeRedirects(res)).toEqual([{ oldPath: "/demo-legacy/ok", status: 301, targetPath: "/poradniki/demo-artykul-a" }]);
  });

  it("§6.1 R1: bez approved -> NOT_APPROVED (także brak reviewer/approved_at)", () => {
    expect(errorsOf([row({ oldPath: "/x", status: "needs_review" })], "/x")).toContain("NOT_APPROVED");
    expect(errorsOf([row({ oldPath: "/x", status: "draft" })], "/x")).toContain("NOT_APPROVED");
    expect(errorsOf([row({ oldPath: "/x", reviewer: null })], "/x")).toContain("NOT_APPROVED");
    expect(errorsOf([row({ oldPath: "/x", approvedAt: "" })], "/x")).toContain("NOT_APPROVED");
  });

  it("R2: brak targetu / self-redirect (po normalizacji)", () => {
    expect(errorsOf([row({ oldPath: "/x", targetPath: null })], "/x")).toContain("MISSING_TARGET");
    expect(errorsOf([row({ oldPath: "/X/", targetPath: "https://zoo24.pl/x?utm_source=a" })], "/x")).toContain("SELF_REDIRECT");
  });

  it("§6.2 R3: target 404 / 410 / 3xx -> TARGET_NOT_200", () => {
    expect(errorsOf([row({ oldPath: "/x", targetPath: "/poradniki/nie-istnieje" })], "/x")).toContain("TARGET_NOT_200");
    const gone = [row({ oldPath: "/x", targetPath: "/stare-gone" }), row({ oldPath: "/stare-gone", segment: "E", proposedAction: "gone_410", targetPath: null })];
    expect(errorsOf(gone, "/x")).toContain("TARGET_NOT_200");
    const redir = [row({ oldPath: "/x", targetPath: "/y" }), row({ oldPath: "/y", targetPath: "/poradniki/demo-artykul-a" })];
    expect(errorsOf(redir, "/x")).toContain("TARGET_NOT_200");
  });

  it("§6.2 R9: łańcuch A->B->C -> CHAIN", () => {
    const rows = [
      row({ oldPath: "/a", targetPath: "/b" }),
      row({ oldPath: "/b", targetPath: "/poradniki/demo-artykul-b" }),
    ];
    const res = validateRedirectMap(rows, reg);
    expect(res.entries[0]!.errors).toContain("CHAIN");
    expect(res.entries[0]!.ok).toBe(false);
    expect(res.entries[1]!.ok).toBe(true);
  });

  it("§6.2 R10: pętla A->B->A -> LOOP", () => {
    const rows = [row({ oldPath: "/a", targetPath: "/b" }), row({ oldPath: "/b", targetPath: "/a" })];
    const res = validateRedirectMap(rows, reg);
    expect(res.entries[0]!.errors).toContain("LOOP");
    expect(res.entries[1]!.errors).toContain("LOOP");
    expect(activeRedirects(res)).toEqual([]);
  });

  it("R4: target DEMO (dla rekordu nie-demo), draft lub noindex -> TARGET_NOT_INDEXABLE", () => {
    expect(errorsOf([row({ oldPath: "/x", demo: false, targetPath: "/poradniki/demo-strona-demo" })], "/x")).toContain("TARGET_NOT_INDEXABLE");
    expect(errorsOf([row({ oldPath: "/x", targetPath: "/poradniki/demo-szkic" })], "/x")).toContain("TARGET_NOT_INDEXABLE");
    // tryb ścisły: również rekord DEMO nie może wskazywać na DEMO
    expect(
      errorsOf([row({ oldPath: "/x", targetPath: "/poradniki/demo-strona-demo" })], "/x", { allowDemoTargetsForDemoRows: false }),
    ).toContain("TARGET_NOT_INDEXABLE");
    // F1: rekord DEMO -> strona DEMO dopuszczalny
    expect(errorsOf([row({ oldPath: "/x", targetPath: "/poradniki/demo-strona-demo" })], "/x")).toEqual([]);
  });

  it("R5: target / poza segmentem A -> TARGET_IS_HOME; segment A -> / dozwolony", () => {
    for (const segment of ["B", "C", "D"] as const) {
      expect(errorsOf([row({ oldPath: "/x", segment, targetPath: "/" })], "/x")).toContain("TARGET_IS_HOME");
    }
    expect(errorsOf([row({ oldPath: "/stara-glowna", segment: "A", targetPath: "/" })], "/stara-glowna")).toEqual([]);
  });

  it("§6.3 R6: karta C -> /, /poradniki, /uslugi/groomer/warszawa, /firma/* -> PRODUCT_TO_HUB", () => {
    for (const t of ["/", "/poradniki", "/uslugi/groomer/warszawa", "/uslugi", "/firma/demo-firma-x"]) {
      expect(errorsOf([row({ oldPath: "/demo-legacy/produkt/p", segment: "C", targetPath: t })], "/demo-legacy/produkt/p"), t).toContain("PRODUCT_TO_HUB");
    }
    // karta C -> autorski poradnik: OK
    expect(errorsOf([row({ oldPath: "/demo-legacy/produkt/p", segment: "C", targetPath: "/poradniki/demo-artykul-a" })], "/demo-legacy/produkt/p")).toEqual([]);
  });

  it("R6: lista hubów konfigurowalna", () => {
    expect(
      errorsOf([row({ oldPath: "/p", segment: "C", targetPath: "/poradniki/demo-artykul-c" })], "/p", { hubPaths: ["/poradniki/demo-artykul-c"] }),
    ).toContain("PRODUCT_TO_HUB");
  });

  it("R7: segment B/D -> listing lub firma -> INTENT_SHIFT", () => {
    expect(errorsOf([row({ oldPath: "/x", segment: "B", targetPath: "/uslugi/groomer" })], "/x")).toContain("INTENT_SHIFT");
    expect(errorsOf([row({ oldPath: "/x", segment: "D", targetPath: "/firma/demo-firma-x" })], "/x")).toContain("INTENT_SHIFT");
  });

  it("§6.8 R8: brak lub zbyt krótki semantic_match_explanation -> INTENT_NOT_DOCUMENTED", () => {
    expect(errorsOf([row({ oldPath: "/x", semanticMatchExplanation: null })], "/x")).toContain("INTENT_NOT_DOCUMENTED");
    expect(errorsOf([row({ oldPath: "/x", semanticMatchExplanation: "za krótkie" })], "/x")).toContain("INTENT_NOT_DOCUMENTED");
  });

  it("R11: segment E nie może być redirectem", () => {
    expect(errorsOf([row({ oldPath: "/x", segment: "E" })], "/x")).toContain("EXPIRED_REDIRECT");
  });

  it("R12: duplikat źródła (po normalizacji) -> DUPLICATE_SOURCE dla obu", () => {
    const res = validateRedirectMap([row({ oldPath: "/x" }), row({ oldPath: "/X/?utm_source=fb", targetPath: "/poradniki/demo-artykul-b" })], reg);
    expect(res.entries.every((e) => e.errors.includes("DUPLICATE_SOURCE"))).toBe(true);
    expect(activeRedirects(res)).toEqual([]);
  });

  it("redirect_308 podlega tym samym regułom", () => {
    const res = validateRedirectMap([row({ oldPath: "/x", proposedAction: "redirect_308" }), row({ oldPath: "/y", proposedAction: "redirect_308", targetPath: "/" })], reg);
    expect(activeRedirects(res)).toEqual([{ oldPath: "/x", status: 308, targetPath: "/poradniki/demo-artykul-a" }]);
  });
});

describe("§3: 200 / 404 / 410 / brak decyzji", () => {
  it("keep_200 bez praw -> RIGHTS_UNVERIFIED; segment E -> SEGMENT_NOT_ALLOWED; C -> alarm PSEUDO_SHOP", () => {
    expect(errorsOf([row({ oldPath: "/x", proposedAction: "keep_200", targetPath: null, contentRightsVerified: "unknown" })], "/x")).toContain("RIGHTS_UNVERIFIED");
    expect(errorsOf([row({ oldPath: "/x", segment: "E", proposedAction: "edit_200", targetPath: null })], "/x")).toContain("SEGMENT_NOT_ALLOWED");
    const res = validateRedirectMap([row({ oldPath: "/x", segment: "C", proposedAction: "keep_200", targetPath: null })], reg);
    expect(res.alarms.map((a) => a.code)).toContain("WARN_PSEUDO_SHOP_REVIEW");
  });

  it("gone_410 wymaga akceptacji; not_found_404 zawsze bezpieczne; brak decyzji -> NO_DECISION", () => {
    expect(errorsOf([row({ oldPath: "/x", segment: "E", proposedAction: "gone_410", status: "needs_review" })], "/x")).toContain("NOT_APPROVED");
    const res = validateRedirectMap(
      [
        row({ oldPath: "/g", segment: "E", proposedAction: "gone_410", targetPath: null }),
        row({ oldPath: "/n", segment: "C", proposedAction: "not_found_404", targetPath: null, status: "draft" }),
        row({ oldPath: "/none", segment: "C", proposedAction: null, targetPath: null }),
      ],
      reg,
    );
    expect(activeRedirects(res)).toEqual([
      { oldPath: "/g", status: 410, targetPath: null },
      { oldPath: "/n", status: 404, targetPath: null },
    ]);
    expect(res.entries[2]!.errors).toEqual(["NO_DECISION"]);
  });
});

describe("M1–M6 (policy §4)", () => {
  it("§6.4 M2: 25 kart C -> ten sam poradnik -> BLOCK_PRODUCT_FANIN, mapa zablokowana, 0 aktywnych", () => {
    const rows = Array.from({ length: 25 }, (_, i) => row({ oldPath: `/demo-legacy/produkt/k-${i}`, segment: "C", targetPath: "/poradniki/demo-artykul-a" }));
    const res = validateRedirectMap(rows, reg);
    expect(res.blocked).toBe(true);
    expect(res.alarms.find((a) => a.code === "BLOCK_PRODUCT_FANIN")?.severity).toBe("BLOCK");
    expect(res.entries.every((e) => e.errors.includes("PRODUCT_FANIN"))).toBe(true);
    expect(activeRedirects(res)).toEqual([]);
  });

  it("M2: 20 kart C (na progu) nie blokuje, ale M1/M3 ostrzegają", () => {
    const rows = Array.from({ length: 20 }, (_, i) => row({ oldPath: `/demo-legacy/produkt/k-${i}`, segment: "C", targetPath: "/poradniki/demo-artykul-a" }));
    const res = validateRedirectMap(rows, reg);
    expect(res.blocked).toBe(false);
    const codes = res.alarms.map((a) => a.code);
    expect(codes).toContain("WARN_TARGET_CONCENTRATION");
    expect(codes).toContain("WARN_REDIRECT_RATIO");
    expect(activeRedirects(res)).toHaveLength(20);
  });

  it("M3: brak ostrzeżenia gdy redirecty <= 60% mapy", () => {
    const rows = [
      row({ oldPath: "/r1" }),
      row({ oldPath: "/n1", proposedAction: "not_found_404", targetPath: null }),
      row({ oldPath: "/n2", proposedAction: "not_found_404", targetPath: null }),
    ];
    expect(validateRedirectMap(rows, reg).alarms.map((a) => a.code)).not.toContain("WARN_REDIRECT_RATIO");
  });

  it("M4: redirect na / z segmentu != A -> BLOCK_REDIRECT_TO_HOME", () => {
    const res = validateRedirectMap([row({ oldPath: "/x", segment: "D", targetPath: "/" })], reg);
    expect(res.blocked).toBe(true);
    expect(res.alarms.map((a) => a.code)).toContain("BLOCK_REDIRECT_TO_HOME");
  });

  it("M5: partia > 50 wierszy -> WARN_BATCH_SIZE", () => {
    const rows = Array.from({ length: 51 }, (_, i) => row({ oldPath: `/n-${i}`, proposedAction: "not_found_404", targetPath: null }));
    expect(validateRedirectMap(rows, reg).alarms.map((a) => a.code)).toContain("WARN_BATCH_SIZE");
  });

  it("M6: zmiana > 20% względem poprzedniej wersji -> WARN_VERSION_CHANGE", () => {
    const prev = Array.from({ length: 10 }, (_, i) => row({ oldPath: `/n-${i}`, proposedAction: "not_found_404", targetPath: null }));
    const cur = prev.map((r, i) => (i < 3 ? { ...r, proposedAction: "gone_410" as const, segment: "E" as const } : r));
    expect(validateRedirectMap(cur, reg, { previousRows: prev }).alarms.map((a) => a.code)).toContain("WARN_VERSION_CHANGE");
    expect(validateRedirectMap(prev, reg, { previousRows: prev }).alarms.map((a) => a.code)).not.toContain("WARN_VERSION_CHANGE");
  });

  it("versionHash deterministyczny, niezależny od kolejności, zmienia się przy zmianie decyzji", () => {
    const a = [row({ oldPath: "/a" }), row({ oldPath: "/b", targetPath: "/poradniki/demo-artykul-b" })];
    const h1 = validateRedirectMap(a, reg).versionHash;
    expect(validateRedirectMap([...a].reverse(), reg).versionHash).toBe(h1);
    expect(validateRedirectMap([a[0]!, { ...a[1]!, status: "rejected" }], reg).versionHash).not.toBe(h1);
    expect(h1).toMatch(/^[0-9a-f]{16}$/);
  });

  it("summary liczy per akcja i per segment", () => {
    const res = validateRedirectMap(
      [row({ oldPath: "/a" }), row({ oldPath: "/b", segment: "E", proposedAction: "gone_410", targetPath: null }), row({ oldPath: "/c", segment: "C", proposedAction: null })],
      reg,
    );
    expect(res.summary.byAction.redirect_301).toBe(1);
    expect(res.summary.byAction.gone_410).toBe(1);
    expect(res.summary.byAction.none).toBe(1);
    expect(res.summary.bySegment).toEqual({ A: 0, B: 1, C: 1, D: 0, E: 1 });
    expect(res.summary.ok).toBe(2);
    expect(res.summary.rejected).toBe(1);
  });
});
