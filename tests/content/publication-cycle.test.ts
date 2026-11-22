// Portal V3 §11: pełny cykl jednego materiału na stagingu — źródła → szkic → przegląd → zatwierdzenie konkretnej wersji
// → publikacja → widoczność na liście i w wyszukiwaniu → korekta. Oraz blokada materiałów dobrostanowych bez specjalisty.
import { describe, expect, it } from "vitest";
import { buildSeedState } from "@/lib/demo/seed";
import { approveArticle, approveCorrection, EditorialError, proposeCorrection, requiredReviewRole, submitArticle } from "@/lib/content/editorial";
import { filterArticles, parseHubQuery } from "@/lib/content/topics";
import { articleContentHash, isEditorialApprovalCurrent } from "@/lib/ops/article-review";
import { buildPageRegistry } from "@/lib/seo";
import type { Article } from "@/lib/types";

const base = (over: Partial<Article>): Article => ({
  slug: "test-opieka-na-wyjazd", title: "Jak wybrać opiekę dla psa na czas wyjazdu", summary: "Porównanie form opieki.",
  body: ["Krótka odpowiedź.", "## Kroki", "Krok pierwszy.", "## Typowe błędy", "Błąd."], checklist: ["Zapisz kontakty"],
  sources: [{ label: "RSPCA", url: "https://www.rspca.org.uk/adviceandwelfare/pets" }],
  claims: [{ text: "Planuj opiekę z wyprzedzeniem", sourceIndex: 0, evidence: "Organizacja zaleca planowanie opieki", appliesTo: "psy", accessedAt: "2026-11-22" }],
  authorDisplay: "Redakcja ZOO24", status: "draft", demo: false, publishedAt: null, updatedAt: "2026-11-22T00:00:00.000Z",
  relatedServicePaths: [], disclosure: null, basePath: "/poradniki",
  animal: { group: "psy", species: "pies-domowy", breed: null }, needs: ["wyjazdy"], format: "guide", risk: "standard",
  ...over,
});

const NOW = new Date("2026-11-22T21:00:00.000Z");
const publishedList = (s: ReturnType<typeof buildSeedState>, q: Record<string, string> = {}) =>
  filterArticles(s.articles.filter((a) => a.status === "published" && !a.demo), parseHubQuery(q)).items.map((a) => a.slug);

describe("cykl publikacji materiału (staging)", () => {
  it("szkic → przegląd → zatwierdzenie wersji → lista, wyszukiwanie, sitemap → korekta", () => {
    const s = buildSeedState({ production: true });
    s.articles.push(base({}));
    // szkic nie jest publiczny
    expect(publishedList(s)).not.toContain("test-opieka-na-wyjazd");
    submitArticle(s, "test-opieka-na-wyjazd", "redakcja");
    expect(requiredReviewRole(s.articles.at(-1)!)).toBe("editor");
    // zatwierdzenie przez redaktora-AI (klasa standard) — jawnie AI
    const a = approveArticle(s, "test-opieka-na-wyjazd", "claude-ai-editor", NOW, { id: "claude-ai-editor", kind: "ai", roles: ["editor"] });
    expect(a.status).toBe("published");
    expect(a.review?.byKind).toBe("ai");
    expect(a.editorialDecision?.contentHash).toBe(articleContentHash(a));
    expect(isEditorialApprovalCurrent(a, "claude-ai-editor")).toBe(true);
    // widoczność: lista, wyszukiwanie, sitemap
    expect(publishedList(s)).toContain("test-opieka-na-wyjazd");
    expect(publishedList(s, { q: "wyjazdu" })).toContain("test-opieka-na-wyjazd");
    const reg = buildPageRegistry(s);
    expect(reg.get("/poradniki/test-opieka-na-wyjazd")?.indexable).toBe(true);
    expect(reg.get("/poradniki")?.indexable).toBe(true);
    // korekta: publicznie zostaje stara wersja do zatwierdzenia
    proposeCorrection(s, "test-opieka-na-wyjazd", "redakcja", { summary: "Porównanie form opieki i pytania do opiekuna." }, "uzupełnienie leadu", NOW);
    expect(s.articles.at(-1)!.summary).toBe("Porównanie form opieki.");
    const fixed = approveCorrection(s, "test-opieka-na-wyjazd", "claude-ai-editor", new Date("2026-11-23T08:00:00.000Z"), { id: "claude-ai-editor", kind: "ai", roles: ["editor"] });
    expect(fixed.summary).toContain("pytania do opiekuna");
    expect(fixed.updatedAt).toBe("2026-11-23T08:00:00.000Z");
    expect(isEditorialApprovalCurrent(fixed, "claude-ai-editor")).toBe(true);
    expect(s.audit.map((x) => x.action)).toEqual(expect.arrayContaining(["article_submitted", "article_published", "article_correction_proposed", "article_correction_published"]));
  });

  it("materiał dobrostanowy (środowisko/żywienie) — AI i właściciel bez kwalifikacji nie mogą zatwierdzić; specjalista tak", () => {
    const s = buildSeedState({ production: true });
    // tytuł „dla początkującego” i deklaracja standard nie obniżają klasy: potrzeba „środowisko” => welfare
    s.articles.push(base({ slug: "krolik-przestrzen", title: "Przestrzeń dla królika — dla początkujących", needs: ["srodowisko"], risk: "standard", status: "needs_review" }));
    expect(requiredReviewRole(s.articles.at(-1)!)).toBe("species_specialist");
    expect(() => approveArticle(s, "krolik-przestrzen", "claude-ai-editor", NOW)).toThrow(/HUMAN_SPECIES_SPECIALIST_REQUIRED/);
    expect(() => approveArticle(s, "krolik-przestrzen", "owner", NOW)).toThrow(/ROLE_SPECIES_SPECIALIST_REQUIRED/);
    expect(s.articles.at(-1)!.review?.waitingReason).toMatch(/SPECIES_SPECIALIST/);
    expect(publishedList(s)).not.toContain("krolik-przestrzen");
    const ok = approveArticle(s, "krolik-przestrzen", "specjalista-1", NOW, { id: "specjalista-1", kind: "human", roles: ["species_specialist"] });
    expect(ok.status).toBe("published");
  });

  it("twierdzenie bez istniejącego źródła blokuje publikację", () => {
    const s = buildSeedState({ production: true });
    s.articles.push(base({ slug: "bez-zrodla", status: "needs_review", claims: [{ text: "x", sourceIndex: 3, evidence: "y", accessedAt: "2026-11-22" }] }));
    expect(() => approveArticle(s, "bez-zrodla", "claude-ai-editor", NOW)).toThrow(EditorialError);
    expect(() => approveArticle(s, "bez-zrodla", "claude-ai-editor", NOW)).toThrow(/CLAIM_WITHOUT_SOURCE/);
  });
});
