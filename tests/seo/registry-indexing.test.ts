import { describe, expect, it } from "vitest";
import { buildPageRegistry, HUB_PATHS } from "@/lib/seo/page-registry";
import { canonicalFor, robotsMetaFor, robotsTxt, sitemapEntries } from "@/lib/seo/indexing";
import { DEMO_LEGACY_URLS } from "@/lib/demo/seed";
import { SITE, demoState, testOnlyRealBusinesses } from "./fixtures";

describe("buildPageRegistry", () => {
  const reg = buildPageRegistry(demoState());

  it("zawiera trasy publiczne, huby i strony statyczne jako indeksowalne", () => {
    for (const p of ["/", "/uslugi", "/uslugi/groomer", "/uslugi/hotel-dla-zwierzat", "/poradniki", "/o-nas", "/dla-firm"]) {
      expect(reg.get(p), p).not.toBeNull();
      expect(reg.get(p)!.indexable, p).toBe(true);
    }
    expect(HUB_PATHS).toContain("/poradniki");
  });

  it("firmy i poradniki DEMO: obecne, ale noindex i demo", () => {
    const firma = reg.all().filter((p) => p.kind === "business");
    // tylko opublikowane firmy mają trasę (d06 jest draftem)
    expect(firma.length).toBe(demoState().businesses.filter((b) => b.status === "published").length);
    expect(firma.some((p) => p.path.includes("salon-szkic"))).toBe(false);
    expect(firma.every((p) => p.demo && !p.indexable)).toBe(true);
    expect(reg.get("/poradniki/jak-wybrac-groomera")!.demo).toBe(true);
    expect(reg.get("/poradniki/jak-wybrac-groomera")!.indexable).toBe(false);
  });

  it("draft/needs_review nie mają trasy", () => {
    expect(reg.get("/poradniki/pielegnacja-psa-zima")).toBeNull();
    expect(reg.all().some((p) => p.path.includes("salon-szkic"))).toBe(false);
  });

  it("N4: listing < minListings realnych firm -> noindex; >= próg -> index", () => {
    expect(reg.get("/uslugi/groomer/warszawa")!.indexable).toBe(false);
    const withReal = buildPageRegistry(demoState({ businesses: testOnlyRealBusinesses(3) }));
    expect(withReal.get("/uslugi/groomer/warszawa")!.indexable).toBe(true);
    const strict = buildPageRegistry(demoState({ businesses: testOnlyRealBusinesses(3) }), { minListings: 4 });
    expect(strict.get("/uslugi/groomer/warszawa")!.indexable).toBe(false);
  });

  it("get normalizuje ścieżkę", () => {
    expect(reg.get("https://zoo24.pl/USLUGI/?utm_source=x")!.path).toBe("/uslugi");
  });
});

describe("indexing", () => {
  const reg = buildPageRegistry(demoState());

  it("robots.txt poza produkcją = Disallow: /", () => {
    for (const env of ["local", "staging", "preview", "", "Production"]) {
      expect(robotsTxt(env, SITE)).toMatch(/^Disallow: \/$/m);
    }
  });

  it("robots.txt w produkcji nie blokuje stron publicznych i podaje sitemap", () => {
    const txt = robotsTxt("production", SITE);
    expect(txt).not.toMatch(/^Disallow: \/$/m);
    expect(txt).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  it("sitemap: local/staging -> []", () => {
    expect(sitemapEntries(reg, SITE, "local")).toEqual([]);
    expect(sitemapEntries(reg, SITE, "staging")).toEqual([]);
  });

  it("sitemap produkcyjna nie zawiera DEMO, draftów, noindex ani redirectów", () => {
    const locs = sitemapEntries(reg, SITE, "production").map((e) => e.loc);
    expect(locs).toContain(`${SITE}/`);
    expect(locs.some((l) => l.includes("/firma/"))).toBe(false);
    expect(locs.some((l) => l.includes("/poradniki/"))).toBe(false);
    expect(locs.some((l) => /\/uslugi\/[^/]+\/[^/]+$/.test(l))).toBe(false); // listingi poniżej progu
    expect(locs.some((l) => l.includes("demo-legacy"))).toBe(false);
    const excl = sitemapEntries(reg, SITE, "production", { excludePaths: ["/o-nas"] }).map((e) => e.loc);
    expect(excl).not.toContain(`${SITE}/o-nas`);
    for (const r of DEMO_LEGACY_URLS) expect(locs).not.toContain(`${SITE}${r.oldPath}`);
  });

  it("sitemap: lastmod tylko z realnej daty treści", () => {
    const real = buildPageRegistry(demoState({ businesses: testOnlyRealBusinesses(3), articles: [] }));
    const home = sitemapEntries(real, SITE, "production").find((e) => e.loc === `${SITE}/`)!;
    expect(home.lastmod).toBeUndefined();
  });

  it("canonical absolutny bez query", () => {
    expect(canonicalFor("/uslugi/groomer/?sort=asc&utm_source=x", SITE + "/")).toBe(`${SITE}/uslugi/groomer`);
    expect(canonicalFor("/", SITE)).toBe(`${SITE}/`);
  });

  it("robotsMetaFor: staging zawsze noindex; DEMO/draft/null noindex; indeksowalna -> index", () => {
    const home = reg.get("/")!;
    expect(robotsMetaFor(home, "staging")).toBe("noindex, nofollow");
    expect(robotsMetaFor(home, "production")).toBe("index, follow");
    expect(robotsMetaFor(reg.get("/poradniki/jak-wybrac-groomera"), "production")).toBe("noindex, nofollow");
    expect(robotsMetaFor(null, "production")).toBe("noindex, nofollow");
    expect(robotsMetaFor({ ...home, draft: true }, "production")).toBe("noindex, nofollow");
  });
});
