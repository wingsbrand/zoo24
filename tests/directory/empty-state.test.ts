import { describe, expect, it } from "vitest";
import type { Article, Business, CategorySlug, CitySlug } from "@/lib/types";
import { cityTiles, emptyListingSuggestions } from "@/lib/directory/empty-state";
import { listingCounts } from "@/lib/directory/stats";

let n = 0;
function biz(category: CategorySlug, city: CitySlug, over: Partial<Business> = {}): Business {
  n += 1;
  return {
    id: `b${n}`, slug: `firma-${n}`, name: `Firma ${n}`, category, city, serviceArea: null, websiteUrl: null, phonePublic: null,
    description: "", services: [], petTypes: [], addressText: null, status: "published", demo: false, sourceNote: "test",
    checkedAt: null, sponsored: false, ...over,
  };
}
function art(slug: string, over: Partial<Article> = {}): Article {
  return {
    slug, title: `Tytuł ${slug}`, summary: "", body: [], checklist: [], sources: [], authorDisplay: "Redakcja",
    status: "published", demo: false, publishedAt: "2026-11-01T00:00:00Z", updatedAt: "2026-11-01T00:00:00Z",
    relatedServicePaths: [], disclosure: null, ...over,
  };
}

describe("A07: pusta strona miasto × usługa", () => {
  const businesses = [
    biz("groomer", "warszawa"), // groomer w tym samym mieście — NIE może być podpowiedzią dla hotelu
    biz("groomer", "warszawa"),
    biz("hotel-dla-zwierzat", "krakow"), // realny hotel w innym mieście
    biz("hotel-dla-zwierzat", "gdansk", { demo: true }), // tylko DEMO — nie podpowiadamy
    biz("hotel-dla-zwierzat", "lodz", { status: "hidden" }), // nieopublikowany
  ];
  const articles = [
    art("opieka-nad-psem-podczas-wyjazdu"),
    art("wyjazd-z-kotem-szkic", { status: "draft" }),
    art("wyjazd-demo", { demo: true }),
    art("jak-wybrac-groomera"),
    art("stary-wpis-wyjazdowy", { basePath: "/blog" }),
  ];

  it("hotel: brak groomerów w podpowiedziach, tylko alternatywy dla opieki podczas wyjazdu", () => {
    const s = emptyListingSuggestions({ businesses, articles }, "hotel-dla-zwierzat", "warszawa");
    expect(s.relatedCategories.map((c) => c.category)).not.toContain("groomer");
    expect(JSON.stringify(s)).not.toContain("/uslugi/groomer");
    expect(s.guides.map((g) => g.slug)).toEqual(["opieka-nad-psem-podczas-wyjazdu", "stary-wpis-wyjazdowy"]);
    expect(s.guides[1].href).toBe("/blog/stary-wpis-wyjazdowy");
    expect(s.guides.map((g) => g.slug)).not.toContain("jak-wybrac-groomera");
    expect(s.tools.map((t) => t.href)).toContain("/narzedzia/lista-dla-opiekuna");
    expect(s.needLabel).toMatch(/wyjazd/i);
  });

  it("inne miasta tylko z ≥1 realną opublikowaną firmą danej kategorii (bez DEMO i ukrytych)", () => {
    const s = emptyListingSuggestions({ businesses, articles }, "hotel-dla-zwierzat", "warszawa");
    expect(s.otherCities.map((c) => c.city)).toEqual(["krakow"]);
    expect(s.otherCities[0]).toMatchObject({ real: 1, href: "/uslugi/hotel-dla-zwierzat/krakow" });
  });

  it("groomer: nie podpowiada hoteli ani narzędzia wyjazdowego", () => {
    const s = emptyListingSuggestions({ businesses, articles }, "groomer", "krakow");
    expect(JSON.stringify(s)).not.toContain("hotel-dla-zwierzat");
    expect(s.tools).toEqual([]);
    expect(s.otherCities.map((c) => c.city)).toEqual(["warszawa"]);
  });

  it("brak opublikowanych poradników = brak linków do pustych poradników", () => {
    const s = emptyListingSuggestions({ businesses, articles: [art("wyjazd-szkic", { status: "needs_review" })] }, "hotel-dla-zwierzat", "warszawa");
    expect(s.guides).toEqual([]);
  });
});

describe("A07: kafle miast w hubie kategorii", () => {
  it("miasta z 0 firm pokazują liczbę, ale bez linku; z firmami — z linkiem", () => {
    const counts = listingCounts([biz("groomer", "warszawa"), biz("groomer", "krakow", { demo: true })]);
    const tiles = cityTiles("groomer", counts);
    expect(tiles).toHaveLength(10);
    const by = Object.fromEntries(tiles.map((t) => [t.city, t]));
    expect(by.warszawa).toMatchObject({ linked: true, href: "/uslugi/groomer/warszawa" });
    expect(by.warszawa.count.total).toBe(1);
    expect(by.krakow.linked).toBe(true); // DEMO liczone i oznaczane jak dotąd
    expect(by.lodz.linked).toBe(false);
    expect(by.lodz.count.total).toBe(0);
    expect(by.lodz.href).toBe("/uslugi/groomer/lodz"); // strona nadal dostępna po URL
  });
});
