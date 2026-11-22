import { describe, expect, it } from "vitest";
import { buildSeedState, loadContentArticles } from "@/lib/demo/seed";
import { approveArticle, articleHref, checkArticlePolicy, EditorialError } from "@/lib/content/editorial";
import { buildPageRegistry, createLegacyResolver, sitemapEntries } from "@/lib/seo";

const BLOG = ["kot-brytyjski-n66", "cane-corso-n63", "maltanczyk-n77"];

describe("treści redakcyjne (content/blog)", () => {
  it("poradniki V3 (content/guides): needs_review, przypisanie do zwierzęcia, klasa ryzyka, polityka redakcyjna", () => {
    const guides = loadContentArticles().filter((a) => a.basePath !== "/blog");
    expect(guides.length).toBeGreaterThan(0);
    for (const a of guides) {
      expect(a.status, a.slug).toBe("needs_review");
      expect(a.animal?.group, a.slug).toBeTruthy();
      expect(a.risk, a.slug).toBeTruthy();
      // Recenzja AI dopuszczalna tylko dla klasy standard (V3, ADR-013); pozostałe czekają na człowieka.
      if (a.review?.by) expect([a.risk, a.review.byKind, a.review.by], a.slug).toEqual(["standard", "ai", "claude-ai-editor"]);
      expect(checkArticlePolicy(a), a.slug).toEqual([]);
    }
  });

  it("3 nowe artykuły pod dawnymi adresami z TOP 3 GA4, nie-DEMO, startują jako needs_review", () => {
    const arts = loadContentArticles().filter((a) => a.basePath === "/blog");
    expect(arts.map((a) => a.slug).sort()).toEqual([...BLOG].sort());
    for (const a of arts) {
      expect(a.demo).toBe(false);
      expect(a.status).toBe("needs_review");
      expect(a.publishedAt).toBeNull();
      expect(articleHref(a)).toBe(`/blog/${a.slug}`);
    }
  });

  it("każdy ma weryfikowalne źródła z URL, checklistę i przechodzi politykę redakcyjną", () => {
    for (const a of loadContentArticles().filter((x) => x.basePath === "/blog")) {
      expect(a.sources.filter((s) => s.url).length).toBeGreaterThanOrEqual(2);
      expect(a.checklist.length).toBeGreaterThanOrEqual(5);
      expect(checkArticlePolicy(a)).toEqual([]);
      expect(a.body.join(" ")).toMatch(/nie zastępuje porady/);
    }
  });

  it("nieopublikowany artykuł nie jest stroną publiczną ani w sitemap; po akceptacji jest 200 i indeksowalny (produkcja)", () => {
    const s = buildSeedState();
    expect(buildPageRegistry(s).get("/blog/kot-brytyjski-n66")).toBeNull();
    approveArticle(s, "kot-brytyjski-n66", "redaktor-test", new Date("2026-11-22T12:00:00Z"));
    const reg = buildPageRegistry(s);
    expect(reg.get("/blog/kot-brytyjski-n66")?.indexable).toBe(true);
    expect(sitemapEntries(reg, "https://zoo24.pl", "production").map((e) => e.loc)).toContain("https://zoo24.pl/blog/kot-brytyjski-n66");
    expect(sitemapEntries(reg, "https://zoo24.pl", "local")).toEqual([]);
  });

  it("akceptacja: tylko needs_review; DEMO i brak źródeł blokują publikację", () => {
    const s = buildSeedState();
    approveArticle(s, "cane-corso-n63", "redaktor-test");
    expect(() => approveArticle(s, "cane-corso-n63", "redaktor-test")).toThrow(EditorialError);
    const demo = s.articles.find((a) => a.slug === "pielegnacja-psa-zima")!; // DEMO, needs_review
    expect(() => approveArticle(s, demo.slug, "redaktor-test")).toThrow(/DEMO_ARTICLE/);
    const m = s.articles.find((a) => a.slug === "maltanczyk-n77")!;
    m.sources = [{ label: "bez linku", url: null }];
    expect(() => approveArticle(s, m.slug, "redaktor-test")).toThrow(/NO_VERIFIABLE_SOURCE/);
    expect(s.audit.some((x) => x.action === "article_published" && x.entityId === "cane-corso-n63")).toBe(true);
  });

  it("dawny /blog/* bez nowego artykułu nadal 404 (bez blanket redirect)", () => {
    const s = buildSeedState();
    const r = createLegacyResolver(s.legacyUrls, buildPageRegistry(s)).resolve("/blog/kot-syberyjski-n67");
    expect(r.status).toBe(404);
  });
});
