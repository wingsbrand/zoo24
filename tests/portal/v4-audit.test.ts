// Audyt V4 (23.11.2026): autorstwo, ujawnienie AI, daty, JSON-LD, następny krok, wyszukiwanie, synchronizacja taksonomii.
import { describe, expect, it } from "vitest";
import type { Article } from "@/lib/types";
import { aiDisclosure, articleDates, hasHumanReview, publicAuthor } from "@/lib/content/presentation";
import { articleLd, breadcrumbLd, ldGraph, organizationLd } from "@/lib/seo/structured-data";
import { nextSteps, toolsForArticle } from "@/lib/portal/next-steps";
import { computeVisibility } from "@/lib/portal/visibility";
import { searchSite } from "@/lib/portal/site-search";
import { syncState } from "@/lib/store/sync";
import { buildSeedState, loadContentArticles } from "@/lib/demo/seed";
import { loadSpeciesContent } from "@/lib/portal/species-content";

const art = (p: Partial<Article> & Pick<Article, "slug">): Article => ({
  title: "T", summary: "S", body: ["a", "b", "c"], checklist: [], sources: [{ label: "x", url: "https://example.org" }], authorDisplay: "Redakcja ZOO24 (szkic przygotowany z pomocą AI)",
  status: "published", demo: false, publishedAt: "2026-11-23T01:45:00.000Z", updatedAt: "2026-11-22T20:04:17.544Z", relatedServicePaths: [], disclosure: null, ...p,
});
const aiDecision = { decision: "approved" as const, by: "claude-ai-editor", byKind: "ai" as const, at: "2026-11-22T21:00:00.000Z", contentHash: "x", evidenceRef: null, excludedCategoriesChecked: [], notes: [], publishAfter: "2026-11-22T21:00:00.000Z" };

describe("A09 daty: modified nigdy przed published, bez odmładzania", () => {
  it("treść sprzed publikacji => modified = published, bez „Zaktualizowano”", () => {
    const d = articleDates(art({ slug: "a" }));
    expect(d).toEqual({ published: "2026-11-23T01:45:00.000Z", modified: "2026-11-23T01:45:00.000Z", showUpdated: false });
  });
  it("zmiana treści po publikacji => modified = data zmiany", () => {
    const d = articleDates(art({ slug: "a", updatedAt: "2026-11-24T10:00:00.000Z" }));
    expect(d.modified).toBe("2026-11-24T10:00:00.000Z");
    expect(d.showUpdated).toBe(true);
  });
  it("nieopublikowany => brak daty publikacji", () => {
    expect(articleDates(art({ slug: "a", publishedAt: null })).published).toBeNull();
  });
});

describe("A01/A10 autorstwo i ujawnienie AI", () => {
  it("autor publiczny bez dopisku o szkicu AI", () => {
    expect(publicAuthor(art({ slug: "a" }))).toBe("Redakcja ZOO24");
  });
  it("akceptacja redaktora-AI nie jest przeglądem człowieka => ujawnienie zostaje", () => {
    const a = art({ slug: "a", editorialDecision: aiDecision, reviewedBy: "claude-ai-editor" });
    expect(hasHumanReview(a)).toBe(false);
    // D-01: decyzja właściciela — bez dopisku o AI przy materiałach (SHOW_AI_DISCLOSURE = false).
    expect(aiDisclosure(a)).toBeNull();
  });
  it("udokumentowany przegląd człowieka => bez ujawnienia; deklaracja „human” przy tożsamości agenta nie wystarcza", () => {
    expect(aiDisclosure(art({ slug: "a", editorialDecision: { ...aiDecision, by: "Anna Kowalska", byKind: "human" } }))).toBeNull();
    expect(hasHumanReview(art({ slug: "a", editorialDecision: { ...aiDecision, byKind: "human" } }))).toBe(false);
  });
  it("pliki treści nie mają już dopisku o szkicu AI w autorze", () => {
    expect(loadContentArticles().every((a) => a.authorDisplay === "Redakcja ZOO24")).toBe(true);
  });
});

describe("A08 JSON-LD zgodny z widoczną treścią", () => {
  it("Article: organizacja jako autor, daty zgodne z UI, bez ocen", () => {
    const ld = articleLd(art({ slug: "border-collie-n61", basePath: "/blog" }));
    expect(ld).toMatchObject({ "@type": "Article", url: "https://zoo24.pl/blog/border-collie-n61", datePublished: "2026-11-23T01:45:00.000Z", dateModified: "2026-11-23T01:45:00.000Z", author: { "@type": "Organization", name: "Redakcja ZOO24" } });
    expect(JSON.stringify(ld)).not.toMatch(/aggregateRating|review"|claude/);
  });
  it("Organization z prawdziwym wydawcą; graf bez znaku < (XSS)", () => {
    expect(organizationLd()).toMatchObject({ legalName: "WINGS RETAIL sp. z o.o.", url: "https://zoo24.pl/" });
    expect(ldGraph({ "@type": "Thing", name: "</script>" })).not.toContain("</script>");
  });
  it("BreadcrumbList: ostatni element bez item", () => {
    const b = breadcrumbLd([{ href: "/", label: "ZOO24" }, { label: "Poradniki" }]) as { itemListElement: Record<string, unknown>[] };
    expect(b.itemListElement[0]).toMatchObject({ position: 1, item: "https://zoo24.pl/" });
    expect(b.itemListElement[1].item).toBeUndefined();
  });
});

describe("A07/A13 następny krok według zwierzęcia i zadania", () => {
  const pub = loadContentArticles().filter((a) => a.editorialDecision?.byKind === "ai").map((a) => ({ ...a, status: "published" as const }));
  const vis = computeVisibility(pub);
  it("akwarium => kalkulator; wyjazd => lista dla opiekuna", () => {
    expect(toolsForArticle({ animal: { group: "akwarystyka" }, needs: ["wyposazenie"] })).toEqual(["/narzedzia/kalkulator-akwarium"]);
    expect(toolsForArticle({ animal: { group: "ptaki" }, needs: ["wyjazdy"] })).toEqual(["/narzedzia/lista-dla-opiekuna"]);
  });
  it("profil rasy => karta gatunku i dział; bez narzędzi", () => {
    const steps = nextSteps({ animal: { group: "psy", species: "pies-domowy", breed: "border collie" }, needs: ["wybor-zwierzecia"] }, vis);
    expect(steps.map((s) => s.href)).toEqual(["/zwierzeta/psy/pies-domowy", "/zwierzeta/psy"]);
  });
});

describe("A11–A12 wyszukiwarka: działy i narzędzia z typem; niepubliczny dział uczciwie", () => {
  const pub = loadContentArticles().filter((a) => a.editorialDecision?.byKind === "ai").map((a) => ({ ...a, status: "published" as const }));
  const vis = computeVisibility(pub);
  it("„królik” => brak fikcyjnych trafień, dział w przygotowaniu", () => {
    const r = searchSite("królik", vis);
    expect(r.results).toEqual([]);
    expect(r.upcomingGroups.map((g) => g.slug)).toEqual(["kroliki"]);
  });
  it("„akwarium” => dział i kalkulator", () => {
    const r = searchSite("akwarium", vis);
    expect(r.results.map((x) => x.type)).toEqual(expect.arrayContaining(["Dział", "Narzędzie"]));
    expect(r.results.some((x) => x.href === "/narzedzia/kalkulator-akwarium")).toBe(true);
  });
});

describe("A05 synchronizacja taksonomii z repo do bazy (także dla opublikowanych)", () => {
  it("opublikowany artykuł bez grupy dostaje animal/needs/format z repo; treść i status bez zmian", () => {
    const state = buildSeedState({ production: true });
    const a = state.articles.find((x) => x.slug === "cane-corso-n63")!;
    a.status = "published";
    delete a.animal; delete a.needs; a.format = undefined; a.authorDisplay = "Redakcja ZOO24 (szkic przygotowany z pomocą AI)";
    const body = JSON.stringify(a.body);
    expect(syncState(state, { production: true })).toBe(true);
    expect(a.animal).toMatchObject({ group: "psy", breed: "cane corso" });
    expect(a.format).toBe("breed_profile");
    expect(a.authorDisplay).toBe("Redakcja ZOO24");
    expect(a.status).toBe("published");
    expect(JSON.stringify(a.body)).toBe(body);
    expect(syncState(state, { production: true })).toBe(false); // idempotentne
  });
});

describe("A03 karty psa i kota", () => {
  it("treść kart ma nazwę naukową, sekcje i źródła z URL", () => {
    for (const slug of ["pies-domowy", "kot-domowy"]) {
      const c = loadSpeciesContent(slug)!;
      expect(c, slug).not.toBeNull();
      expect(c.scientific).toBeTruthy();
      expect(c.sections.length).toBeGreaterThanOrEqual(4);
      expect(c.sources.every((s) => s.url.startsWith("https://"))).toBe(true);
      for (const sec of c.sections) for (const i of sec.sourceIndexes) expect(c.sources[i], `${slug}/${sec.id}`).toBeDefined();
    }
    expect(loadSpeciesContent("../etc")).toBeNull();
  });
});
