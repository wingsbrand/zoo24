import { describe, expect, it } from "vitest";
import { DEMO_LEGACY_URLS } from "@/lib/demo/seed";
import { buildPageRegistry } from "@/lib/seo/page-registry";
import { createLegacyResolver, resolveLegacyPath } from "@/lib/seo/legacy-router";
import { activeRedirects, validateRedirectMap } from "@/lib/seo/redirect-plan";
import { demoState, prng, row, testRegistry } from "./fixtures";

const seedReg = buildPageRegistry(demoState());
const rows = DEMO_LEGACY_URLS;
const resolve = (p: string) => resolveLegacyPath(p, rows, seedReg);
const entry = (p: string) => validateRedirectMap(rows, seedReg).entries.find((e) => e.oldPath === p)!;

describe("seed DEMO_LEGACY_URLS", () => {
  it("żaden wynik nie jest redirectem na / ani statusem 200", () => {
    for (const r of rows) {
      const res = resolve(r.oldPath);
      expect([301, 308, 404, 410], r.oldPath).toContain(res.status);
      if (res.status === 301 || res.status === 308) expect(res.location, r.oldPath).not.toBe("/");
    }
  });

  it("karma -> / : 404, walidacja TARGET_IS_HOME (+ PRODUCT_TO_HUB)", () => {
    expect(resolve("/demo-legacy/produkt/karma-xyz-12kg").status).toBe(404);
    expect(entry("/demo-legacy/produkt/karma-xyz-12kg").errors).toEqual(expect.arrayContaining(["TARGET_IS_HOME", "PRODUCT_TO_HUB"]));
  });

  it("szelki -> listing: 404, PRODUCT_TO_HUB", () => {
    expect(resolve("/demo-legacy/produkt/szelki-abc").status).toBe(404);
    expect(entry("/demo-legacy/produkt/szelki-abc").errors).toContain("PRODUCT_TO_HUB");
  });

  it("needs_review -> 404", () => {
    const res = resolve("/demo-legacy/hotel-dla-psa-poradnik");
    expect(res.status).toBe(404);
    expect(res.reason).toContain("NOT_APPROVED");
  });

  it("§6.6 gone_410 zatwierdzony -> 410", () => {
    expect(resolve("/demo-legacy/promocja-black-friday-2023")).toEqual({ status: 410, reason: "GONE_APPROVED" });
  });

  it("§6.5 brak decyzji -> 404 (nie 200, nie redirect)", () => {
    const res = resolve("/demo-legacy/kategoria/akwarystyka");
    expect(res.status).toBe(404);
    expect(res.location).toBeUndefined();
    expect(res.reason).toBe("NO_DECISION");
  });

  it("not_found_404 -> 404", () => {
    expect(resolve("/demo-legacy/produkt/obroza-niedostepna").status).toBe(404);
  });

  it("zatwierdzony poradnik -> 301 na /poradniki/jak-wybrac-groomera (normalizacja wejścia)", () => {
    const res = resolve("https://zoo24.pl/Demo-Legacy/Poradnik-Wybor-Groomera/?utm_source=fb#x");
    expect(res.status).toBe(301);
    expect(res.location).toBe("/poradniki/jak-wybrac-groomera");
  });

  it("mapa seed ma alarm BLOCK (M4); requireUnblocked -> wszystko 404", () => {
    const { resolve: strict, validation } = createLegacyResolver(rows, seedReg, { requireUnblocked: true });
    expect(validation.blocked).toBe(true);
    for (const r of rows) expect(strict(r.oldPath).status).toBe(404);
  });

  it("niezwiązany URL /cokolwiek -> 404", () => {
    expect(resolve("/cokolwiek")).toEqual({ status: 404, reason: "NO_RECORD" });
  });
});

describe("masowe karty C na /", () => {
  it("100 losowych kart C z targetem / -> 0 aktywnych redirectów, blocked, każda 404", () => {
    const rand = prng(20261122);
    const many = Array.from({ length: 100 }, (_, i) =>
      row({
        oldPath: `/demo-legacy/produkt/${Math.floor(rand() * 1e9).toString(36)}-${i}`,
        segment: "C",
        targetPath: rand() < 0.5 ? "/" : "https://zoo24.pl/?utm_source=x",
      }),
    );
    const reg = testRegistry();
    const res = validateRedirectMap(many, reg);
    expect(res.blocked).toBe(true);
    expect(activeRedirects(res).filter((a) => a.status === 301 || a.status === 308)).toHaveLength(0);
    expect(res.alarms.map((a) => a.code)).toEqual(expect.arrayContaining(["BLOCK_REDIRECT_TO_HOME", "BLOCK_PRODUCT_FANIN", "WARN_REDIRECT_RATIO"]));
    const { resolve: r } = createLegacyResolver(many, reg);
    for (const m of many) expect(r(m.oldPath).status).toBe(404);
  });
});

describe("router — inne przypadki", () => {
  const reg = testRegistry();

  it("§6.1 redirect bez approved -> 404", () => {
    expect(resolveLegacyPath("/x", [row({ oldPath: "/x", status: "needs_review" })], reg).status).toBe(404);
  });

  it("redirect_308 zatwierdzony -> 308", () => {
    expect(resolveLegacyPath("/x", [row({ oldPath: "/x", proposedAction: "redirect_308" })], reg)).toEqual({
      status: 308,
      location: "/poradniki/demo-artykul-a",
      reason: "REDIRECT_APPROVED",
    });
  });

  it("segment A -> / dozwolony (stara strona główna)", () => {
    const res = resolveLegacyPath("/index.php", [row({ oldPath: "/index.php", segment: "A", targetPath: "/" })], reg);
    expect(res).toMatchObject({ status: 301, location: "/" });
  });

  it("gone_410 niezatwierdzony -> 404; keep_200 -> 404 z routera (obsługa w aplikacji)", () => {
    expect(resolveLegacyPath("/g", [row({ oldPath: "/g", segment: "E", proposedAction: "gone_410", status: "draft" })], reg).status).toBe(404);
    expect(resolveLegacyPath("/k", [row({ oldPath: "/k", proposedAction: "keep_200", targetPath: null })], reg).status).toBe(404);
  });

  it("łańcuch i pętla -> 404 dla źródła z błędem", () => {
    const chain = [row({ oldPath: "/a", targetPath: "/b" }), row({ oldPath: "/b", targetPath: "/poradniki/demo-artykul-b" })];
    expect(resolveLegacyPath("/a", chain, reg).status).toBe(404);
    expect(resolveLegacyPath("/b", chain, reg).status).toBe(301);
    const loop = [row({ oldPath: "/a", targetPath: "/b" }), row({ oldPath: "/b", targetPath: "/a" })];
    expect(resolveLegacyPath("/a", loop, reg).status).toBe(404);
    expect(resolveLegacyPath("/b", loop, reg).status).toBe(404);
  });
});
