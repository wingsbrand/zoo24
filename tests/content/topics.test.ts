import { describe, expect, it } from "vitest";
import type { Article } from "@/lib/types";
import { buildSeedState, loadContentArticles } from "@/lib/demo/seed";
import {
  ARTICLE_TOPICS, TOPICS, filterArticles, hubHref, isTopicSlug, matchesQuery, parseHubQuery, relatedArticles, topicSlugForArticle,
} from "@/lib/content/topics";
import { articlesLabel, formatDatePl, plPlural } from "@/components/editorial/format";

const art = (p: Partial<Article> & Pick<Article, "slug" | "title">): Article => ({
  summary: "", body: [], checklist: [], sources: [], authorDisplay: "Redakcja", status: "published", demo: false,
  publishedAt: "2026-11-01T00:00:00.000Z", updatedAt: "2026-11-01T00:00:00.000Z", relatedServicePaths: [], disclosure: null, ...p,
});

describe("tematy poradników (lib/content/topics)", () => {
  it("5 tematów z unikalnymi slugami i kolorami okładek", () => {
    expect(TOPICS.map((t) => t.name)).toEqual(["Rasy psów", "Rasy kotów", "Pielęgnacja", "Wybór usługi", "Zachowanie i wychowanie"]);
    expect(new Set(TOPICS.map((t) => t.slug)).size).toBe(5);
    for (const t of TOPICS) for (const c of Object.values(t.colors)) expect(c).toMatch(/^#[0-9a-f]{6}$/);
    expect(isTopicSlug("rasy-psow")).toBe(true);
    expect(isTopicSlug("nieznany")).toBe(false);
    expect(isTopicSlug(undefined)).toBe(false);
  });

  it("prawdziwe szkice i DEMO mają przypisania redakcyjne (bez zmiany JSON)", () => {
    const bySlug = Object.fromEntries(loadContentArticles().filter((a) => a.basePath === "/blog").map((a) => [a.slug, topicSlugForArticle(a)]));
    expect(bySlug).toEqual({ "kot-brytyjski-n66": "rasy-kotow", "cane-corso-n63": "rasy-psow", "maltanczyk-n77": "rasy-psow" });
    for (const a of buildSeedState().articles.filter((x) => x.demo || x.basePath === "/blog")) expect(ARTICLE_TOPICS[a.slug]).toBeDefined();
  });

  it("reguły dla artykułów bez przypisania (polskie znaki ignorowane)", () => {
    expect(topicSlugForArticle({ slug: "x1", title: "Jak wybrać hotel dla kota" })).toBe("wybor-uslugi");
    expect(topicSlugForArticle({ slug: "x2", title: "Socjalizacja szczeniaka krok po kroku" })).toBe("zachowanie");
    expect(topicSlugForArticle({ slug: "x3", title: "Kąpiel i czesanie psa długowłosego" })).toBe("pielegnacja");
    expect(topicSlugForArticle({ slug: "x4", title: "Kot syberyjski — charakter" })).toBe("rasy-kotow");
    expect(topicSlugForArticle({ slug: "x5", title: "Beagle — rasa dla aktywnych" })).toBe("rasy-psow");
    expect(topicSlugForArticle({ slug: "x6", title: "Coś zupełnie innego" })).toBe("pielegnacja"); // domyślny
  });
});

describe("hub /poradniki — parametry i filtrowanie", () => {
  it("parseHubQuery: walidacja tematu, przycinanie q, flaga filtra dla noindex", () => {
    expect(parseHubQuery({})).toEqual({ temat: null, q: "", filtered: false });
    expect(parseHubQuery({ temat: "rasy-psow" })).toEqual({ temat: "rasy-psow", q: "", filtered: true });
    expect(parseHubQuery({ temat: "<script>", q: "  mal   tańczyk " })).toEqual({ temat: null, q: "mal tańczyk", filtered: true });
    expect(parseHubQuery({ q: ["a", "b"] }).q).toBe("a");
    expect(parseHubQuery({ q: "x".repeat(500) }).q.length).toBe(80);
    expect(parseHubQuery({ q: "" }).filtered).toBe(true);
  });

  it("matchesQuery: tytuł/lead, bez polskich znaków, wszystkie słowa", () => {
    const a = { title: "Maltańczyk — pielęgnacja", summary: "Długa, biała sierść" };
    expect(matchesQuery(a, "maltanczyk")).toBe(true);
    expect(matchesQuery(a, "MALTAŃCZYK siersc")).toBe(true);
    expect(matchesQuery(a, "maltańczyk kot")).toBe(false);
    expect(matchesQuery(a, "")).toBe(true);
  });

  it("filterArticles: tylko opublikowane, liczniki per temat, filtr tematu, sortowanie po aktualizacji", () => {
    const all = [
      art({ slug: "a", title: "Cane corso", updatedAt: "2026-11-10T00:00:00.000Z" }),
      art({ slug: "b", title: "Beagle rasa psa", updatedAt: "2026-11-12T00:00:00.000Z" }),
      art({ slug: "c", title: "Jak wybrać groomera", summary: "pytania do salonu" }),
      art({ slug: "d", title: "Szkic rasy psa", status: "needs_review" }),
      art({ slug: "e", title: "Kot brytyjski szkic", status: "draft" }),
    ];
    const r = filterArticles(all, { temat: null, q: "" });
    expect(r.totalPublished).toBe(3);
    expect(r.countAll).toBe(3);
    expect(r.items.map((x) => x.slug)).toEqual(["b", "a", "c"]);
    expect(r.counts["rasy-psow"]).toBe(1); // "Beagle rasa psa"; "Cane corso" -> domyślny temat
    expect(r.counts["wybor-uslugi"]).toBe(1);
    expect(r.counts["rasy-kotow"]).toBe(0); // szkic kota nie jest liczony

    const t = filterArticles(all, { temat: "wybor-uslugi", q: "" });
    expect(t.items.map((x) => x.slug)).toEqual(["c"]);

    const q = filterArticles(all, { temat: null, q: "salonu" });
    expect(q.items.map((x) => x.slug)).toEqual(["c"]);
    expect(q.countAll).toBe(1);
    expect(q.counts["rasy-psow"]).toBe(0);

    const empty = filterArticles(all, { temat: "zachowanie", q: "" });
    expect(empty.items).toEqual([]);
    expect(empty.totalPublished).toBe(3);
  });

  it("stan lokalny (seed): publicznie tylko 2 DEMO; 3 prawdziwe szkice needs_review niewidoczne", () => {
    const r = filterArticles(buildSeedState().articles, { temat: null, q: "" });
    expect(r.items.every((a) => a.status === "published")).toBe(true);
    expect(r.items.map((a) => a.slug).sort()).toEqual(["hotel-dla-psa-checklista", "jak-wybrac-groomera"]);
    expect(r.counts["wybor-uslugi"]).toBe(2);
    expect(filterArticles(buildSeedState().articles, { temat: "rasy-psow", q: "" }).items).toEqual([]);
  });

  it("hubHref zachowuje parametry; pusty filtr = /poradniki", () => {
    expect(hubHref({})).toBe("/poradniki");
    expect(hubHref({ temat: "rasy-kotow" })).toBe("/poradniki?temat=rasy-kotow");
    expect(hubHref({ temat: "pielegnacja", q: "zima pies" })).toBe("/poradniki?temat=pielegnacja&q=zima+pies");
  });

  it("powiązane: ten sam temat, opublikowane, bez bieżącego, max 3", () => {
    const all = Array.from({ length: 6 }, (_, i) => art({ slug: `g${i}`, title: `Jak wybrać groomera ${i}`, updatedAt: `2026-11-0${i + 1}T00:00:00.000Z` }));
    all.push(art({ slug: "draft", title: "Jak wybrać hotel", status: "needs_review", updatedAt: "2026-12-01T00:00:00.000Z" }));
    all.push(art({ slug: "kot", title: "Kot perski" }));
    const rel = relatedArticles(all[0], all);
    expect(rel.map((a) => a.slug)).toEqual(["g5", "g4", "g3"]);
  });
});

describe("formatowanie pl-PL", () => {
  it("odmiana i daty", () => {
    expect([0, 1, 2, 4, 5, 12, 14, 22, 25].map((n) => plPlural(n, "poradnik", "poradniki", "poradników")))
      .toEqual(["poradników", "poradnik", "poradniki", "poradniki", "poradników", "poradników", "poradników", "poradniki", "poradników"]);
    expect(articlesLabel(3)).toBe("3 poradniki");
    expect(formatDatePl("2026-11-22T12:00:00.000Z")).toBe("22 listopada 2026");
    expect(formatDatePl(null)).toBeNull();
    expect(formatDatePl("nie-data")).toBeNull();
  });
});
