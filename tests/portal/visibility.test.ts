import { describe, expect, it } from "vitest";
import type { Article, Business } from "@/lib/types";
import {
  TOOLS, computeVisibility, groupSections, isPublicArticle, isSpeciesPublic, latestUpdate, speciesArticles, speciesCoverage,
} from "@/lib/portal/visibility";
import { serviceLinks } from "@/lib/portal/services";
import { AI_REVIEW_LABEL, reviewStatus } from "@/lib/portal/labels";
import { GROUPS } from "@/lib/taxonomy/animals";
import { filterArticles, hubHref, parsePortalHubQuery } from "@/lib/content/topics";
import { buildPageRegistry, TOOL_PATHS } from "@/lib/seo/page-registry";
import { sitemapEntries } from "@/lib/seo/indexing";
import { SITE, demoState } from "../seo/fixtures";

const art = (p: Partial<Article> & Pick<Article, "slug">): Article => ({
  title: p.slug, summary: "", body: [], checklist: [], sources: [{ label: "Źródło", url: "https://example.org/a" }], authorDisplay: "Redakcja",
  status: "published", demo: false, publishedAt: "2026-11-01T00:00:00.000Z", updatedAt: "2026-11-01T00:00:00.000Z",
  relatedServicePaths: [], disclosure: null, ...p,
});

const rabbitGuide = art({ slug: "krolik-start", animal: { group: "kroliki", species: "krolik-domowy" }, needs: ["wybor-zwierzecia"], updatedAt: "2026-11-10T00:00:00.000Z" });
const rabbitHome = art({ slug: "krolik-dom", animal: { group: "kroliki" }, needs: ["przygotowanie-domu", "srodowisko"], updatedAt: "2026-11-12T00:00:00.000Z" });
const fishDraft = art({ slug: "akwarium-szkic", animal: { group: "akwarystyka" }, status: "needs_review" });
const fishDemo = art({ slug: "akwarium-demo", animal: { group: "akwarystyka" }, demo: true });
const noAnimal = art({ slug: "ogolny", needs: ["wyjazdy"] });
const unknownSpecies = art({ slug: "gryzon-x", animal: { group: "gryzonie", species: "nie-ma-takiego" }, needs: ["codzienna-opieka"] });

describe("lib/portal/visibility", () => {
  const all = [rabbitGuide, rabbitHome, fishDraft, fishDemo, noAnimal, unknownSpecies];
  const v = computeVisibility(all);

  it("publiczne są tylko opublikowane, nie-DEMO materiały", () => {
    expect(isPublicArticle(rabbitGuide)).toBe(true);
    expect(isPublicArticle(fishDraft)).toBe(false);
    expect(isPublicArticle(fishDemo)).toBe(false);
    expect(v.totalPublished).toBe(4);
  });

  it("grupa publiczna tylko z ≥1 opublikowanym materiałem; narzędzia same nie wystarczą", () => {
    expect(v.groups.kroliki.isPublic).toBe(true);
    expect(v.groups.kroliki.publishedArticles.map((a) => a.slug)).toEqual(["krolik-start", "krolik-dom"]);
    // akwarystyka ma narzędzie (kalkulator), ale tylko szkic i DEMO -> niepubliczna
    expect(v.groups.akwarystyka.tools.map((t) => t.path)).toContain("/narzedzia/kalkulator-akwarium");
    expect(v.groups.akwarystyka.isPublic).toBe(false);
    expect(v.publicGroups.map((g) => g.group.slug)).toEqual(["kroliki", "gryzonie"]);
  });

  it("publiczne gatunki: tylko z taksonomii i z ≥1 materiałem", () => {
    expect(v.groups.kroliki.publicSpecies.map((s) => s.slug)).toEqual(["krolik-domowy"]);
    expect(v.groups.gryzonie.publicSpecies).toEqual([]); // nieznany slug gatunku nie tworzy karty
    expect(isSpeciesPublic(v, "kroliki", "krolik-domowy")).toBe(true);
    expect(isSpeciesPublic(v, "gryzonie", "chomik")).toBe(false);
    expect(speciesArticles(v, "kroliki", "krolik-domowy").map((a) => a.slug)).toEqual(["krolik-start"]);
  });

  it("liczniki potrzeb: per grupa i globalnie (także materiały bez zwierzęcia)", () => {
    expect(v.groups.kroliki.needCounts["wybor-zwierzecia"]).toBe(1);
    expect(v.groups.kroliki.needCounts.srodowisko).toBe(1);
    expect(v.needCounts.wyjazdy).toBe(1);
    expect(v.needCounts.zywienie).toBe(0);
  });

  it("narzędzia: lista dla opiekuna dla wszystkich grup, kalkulator tylko akwarystyka", () => {
    const list = TOOLS.find((t) => t.path === "/narzedzia/lista-dla-opiekuna")!;
    expect([...list.groups].sort()).toEqual(GROUPS.map((g) => g.slug).sort());
    expect(TOOLS.find((t) => t.path === "/narzedzia/kalkulator-akwarium")!.groups).toEqual(["akwarystyka"]);
    for (const g of GROUPS) expect(v.groups[g.slug].tools.length).toBe(g.slug === "akwarystyka" ? 2 : 1);
  });

  it("brak opublikowanych materiałów -> brak publicznych grup", () => {
    const empty = computeVisibility([fishDraft, fishDemo]);
    expect(empty.publicGroups).toEqual([]);
    expect(empty.totalPublished).toBe(0);
  });

  it("sekcje hubu grupy: każdy materiał raz, w pierwszej pasującej sekcji; puste sekcje pominięte", () => {
    const sections = groupSections([rabbitGuide, rabbitHome, art({ slug: "x", needs: ["koszty"] })]);
    expect(sections.map((s) => [s.id, s.items.map((a) => a.slug)])).toEqual([
      ["start", ["krolik-start", "krolik-dom"]],
      ["inne", ["x"]],
    ]);
  });

  it("karta gatunku: nazwa naukowa null i brak obszarów -> „niepotwierdzone”; bez ocen", () => {
    const c = speciesCoverage({ scientific: null }, [rabbitHome]);
    expect(c.missing[0]).toMatch(/Nazwa naukowa/);
    expect(c.covered).toContain("Środowisko i warunki utrzymania");
    expect(c.missing).toContain("Żywienie");
    expect(speciesCoverage({ scientific: "Oryctolagus cuniculus" }, []).missing.some((m) => /naukowa/.test(m))).toBe(false);
    expect(JSON.stringify(c)).not.toMatch(/łatw|idealn|dla dziecka/i);
  });

  it("latestUpdate: najnowsza data treści albo null", () => {
    expect(latestUpdate([rabbitGuide, rabbitHome])).toBe("2026-11-12T00:00:00.000Z");
    expect(latestUpdate([])).toBeNull();
  });
});

describe("lib/portal/services — tylko niepuste kombinacje", () => {
  const base = demoState().businesses[0];
  const b = (p: Partial<Business>): Business => ({ ...base, status: "published", demo: false, ...p });
  it("pomija DEMO, nieopublikowane i puste miasta; filtr grupy zwierząt", () => {
    const list = [
      b({ id: "1", category: "groomer", city: "krakow", petTypes: ["psy"] }),
      b({ id: "2", category: "groomer", city: "krakow", petTypes: [] }),
      b({ id: "3", category: "groomer", city: "lodz", demo: true }),
      b({ id: "4", category: "hotel-dla-zwierzat", city: "lodz", status: "draft" }),
      b({ id: "5", category: "groomer", city: "gdansk", petTypes: ["koty"] }),
    ];
    expect(serviceLinks(list).categories).toEqual([
      { category: "groomer", real: 3, cities: [{ city: "krakow", real: 2 }, { city: "gdansk", real: 1 }] },
    ]);
    expect(serviceLinks(list, "psy").categories[0].cities).toEqual([{ city: "krakow", real: 2 }]);
    expect(serviceLinks([]).categories).toEqual([]);
  });
});

describe("lib/portal/labels — status przeglądu", () => {
  it("AI nigdy nie jest przedstawiane jako człowiek (także przy błędnej deklaracji byKind)", () => {
    const ai = reviewStatus(art({ slug: "a", review: { required: "editor", by: "claude-ai-editor", byKind: "human", at: "2026-11-20T00:00:00.000Z" } }));
    expect(ai.reviewerKind).toBe("ai");
    expect(ai.reviewerLabel).toBe(AI_REVIEW_LABEL);
    const legacy = reviewStatus(art({ slug: "b", reviewedBy: "agent:zoo24-ops-content" }));
    expect(legacy.reviewerLabel).toBe(AI_REVIEW_LABEL);
  });

  it("wymagana rola wg efektywnej klasy ryzyka; brak przeglądu człowieka przy welfare = oczekuje", () => {
    const s = reviewStatus(art({ slug: "c", risk: "standard", needs: ["zywienie"], review: { required: "species_specialist", by: "claude-ai-editor", byKind: "ai", at: null } }));
    expect(s.risk).toBe("welfare");
    expect(s.requiredRole).toBe("species_specialist");
    expect(s.requiredRolePending).toBe(true);
    const human = reviewStatus(art({ slug: "d", risk: "health", review: { required: "veterinarian", by: "Anna Nowak", byKind: "human", at: "2026-11-20T00:00:00.000Z" }, reviewDueAt: "2027-05-20T00:00:00.000Z" }));
    expect(human).toMatchObject({ requiredRole: "veterinarian", reviewerKind: "human", reviewerLabel: "Anna Nowak", requiredRolePending: false, reviewDueAt: "2027-05-20T00:00:00.000Z" });
    expect(reviewStatus(art({ slug: "e" }))).toMatchObject({ reviewerLabel: null, requiredRole: "editor", requiredRolePending: false });
  });
});

describe("hub /poradniki — osie zwierzę i potrzeba", () => {
  it("parsePortalHubQuery: walidacja, filtr => noindex", () => {
    expect(parsePortalHubQuery({})).toMatchObject({ zwierze: null, potrzeba: null, filtered: false });
    expect(parsePortalHubQuery({ zwierze: "kroliki", potrzeba: "zywienie" })).toMatchObject({ zwierze: "kroliki", potrzeba: "zywienie", filtered: true });
    expect(parsePortalHubQuery({ zwierze: "dinozaury", potrzeba: "<x>" })).toMatchObject({ zwierze: null, potrzeba: null, filtered: true });
  });

  it("filterArticles: filtr zwierzęcia/potrzeby i liczniki fasetowe", () => {
    const all = [rabbitGuide, rabbitHome, fishDraft, noAnimal];
    const r = filterArticles(all, { temat: null, q: "", zwierze: "kroliki" });
    expect(r.items.map((a) => a.slug).sort()).toEqual(["krolik-dom", "krolik-start"]);
    expect(r.countsByGroup.kroliki).toBe(2);
    expect(r.countsByGroup.akwarystyka).toBe(0); // szkic się nie liczy
    expect(r.countsByNeed["wybor-zwierzecia"]).toBe(1);
    expect(r.countsByNeed.wyjazdy).toBe(0); // materiał bez zwierzęcia nie pasuje do filtra królików
    const n = filterArticles(all, { temat: null, q: "", potrzeba: "wyjazdy" });
    expect(n.items.map((a) => a.slug)).toEqual(["ogolny"]);
    expect(n.countsByGroup.kroliki).toBe(0);
    expect(filterArticles(all, { temat: null, q: "" }).countAll).toBe(3); // zgodność wstecz
  });

  it("hubHref z nowymi parametrami", () => {
    expect(hubHref({ potrzeba: "wybor-zwierzecia" })).toBe("/poradniki?potrzeba=wybor-zwierzecia");
    expect(hubHref({ temat: "pielegnacja", zwierze: "psy" })).toBe("/poradniki?temat=pielegnacja&zwierze=psy");
  });
});

describe("rejestr stron — portal", () => {
  it("bez publicznych działów: /zwierzeta noindex, brak stron grup/gatunków; narzędzia indeksowalne", () => {
    const reg = buildPageRegistry(demoState());
    expect(reg.get("/zwierzeta")!.indexable).toBe(false);
    expect(reg.all().filter((p) => p.path.startsWith("/zwierzeta/"))).toEqual([]);
    for (const p of TOOL_PATHS) expect(reg.get(p)?.indexable, p).toBe(true);
    expect(TOOL_PATHS).toEqual(["/narzedzia", "/narzedzia/lista-dla-opiekuna", "/narzedzia/kalkulator-akwarium"]);
  });

  it("publiczna grupa i gatunek indeksowalne z lastmod treści; niepubliczne pominięte", () => {
    const reg = buildPageRegistry(demoState({ articles: [rabbitGuide, rabbitHome, fishDraft, fishDemo] }));
    expect(reg.get("/zwierzeta")).toMatchObject({ indexable: true, lastmod: "2026-11-12T00:00:00.000Z" });
    expect(reg.get("/zwierzeta/kroliki")).toMatchObject({ indexable: true, kind: "animal", lastmod: "2026-11-12T00:00:00.000Z" });
    expect(reg.get("/zwierzeta/kroliki/krolik-domowy")).toMatchObject({ indexable: true, lastmod: "2026-11-10T00:00:00.000Z" });
    expect(reg.get("/zwierzeta/akwarystyka")).toBeNull();
    expect(reg.get("/zwierzeta/gryzonie/chomik")).toBeNull();
    const locs = sitemapEntries(reg, SITE, "production").map((e) => e.loc);
    expect(locs).toContain(`${SITE}/zwierzeta/kroliki`);
    expect(locs).not.toContain(`${SITE}/zwierzeta/akwarystyka`);
    expect(sitemapEntries(reg, SITE, "staging")).toEqual([]);
  });
});
