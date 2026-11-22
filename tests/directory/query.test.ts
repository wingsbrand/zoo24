import { describe, expect, it } from "vitest";
import type { Business } from "@/lib/types";
import { DEMO_BUSINESSES } from "@/lib/demo/seed";
import {
  activeFilterChips, activeFilterCount, applyFilters, buildListingHref, buildListingModel, clearFiltersHref, computeFacets,
  DEFAULT_FILTERS, hasListingParams, listingOptions, nearestCity, pageHref, pageList, paginate, parseFilters, publishedListing,
  removeFilterHref, resolveCityInput, sanitizeReturnQuery, sortBusinesses, sortHref,
} from "@/lib/directory/query";
import { resolveCategoryInput, resolveSearch } from "@/lib/directory/search";
import { contactChannels, hasSite, publicLocation } from "@/lib/directory/contact";
import { firmCount, pluralPl } from "@/lib/directory/format";

const mk = (id: string, p: Partial<Business> = {}): Business => ({
  id, slug: `firma-${id}`, name: `Firma ${id}`, category: "groomer", city: "warszawa", serviceArea: null,
  websiteUrl: null, phonePublic: null, description: "", services: [], petTypes: [], addressText: null,
  status: "published", demo: true, sourceNote: "test", checkedAt: null, sponsored: false, ...p,
});

const BASE = "/uslugi/groomer/warszawa";
const items: Business[] = [
  mk("a", { name: "Żbik", services: ["kąpiel", "strzyżenie"], petTypes: ["psy"], websiteUrl: "https://example.com/a", checkedAt: "2026-10-01T00:00:00Z" }),
  mk("b", { name: "Azor", services: ["kąpiel"], petTypes: ["koty"], phonePublic: "+48 000 000 000" }),
  mk("c", { name: "Łapka", services: ["trymowanie"], petTypes: ["psy", "koty"], websiteUrl: "http://example.com/insecure", checkedAt: "2026-11-01T00:00:00Z" }),
  mk("d", { name: "Bury", services: ["kąpiel"], petTypes: ["psy"], status: "draft" }),
];

describe("publishedListing / listingOptions", () => {
  it("bierze tylko opublikowane z danej kategorii i miasta", () => {
    const l = publishedListing(DEMO_BUSINESSES, "groomer", "bialystok");
    expect(l.every((b) => b.status === "published" && b.category === "groomer" && b.city === "bialystok")).toBe(true);
    expect(l.find((b) => b.id === "d06")).toBeUndefined(); // draft
  });
  it("opcje tylko z danych (http nie liczy się jako www)", () => {
    const o = listingOptions(items.filter((b) => b.status === "published"));
    expect(o.pets).toEqual(["psy", "koty"]);
    expect(o.services).toEqual(["kąpiel", "strzyżenie", "trymowanie"]);
    expect(o.contacts).toEqual(["www", "telefon"]);
    expect(listingOptions([items[2]]).contacts).toEqual([]);
  });
});

describe("parseFilters", () => {
  const opts = listingOptions(items.filter((b) => b.status === "published"));
  it("parsuje poprawne wartości, wielokrotne usługi i normalizuje wielkość liter", () => {
    const f = parseFilters({ zwierze: "koty", usluga: ["Strzyżenie", "kąpiel", "kąpiel"], kontakt: ["telefon", "www"], sort: "sprawdzone", strona: "2" }, opts);
    expect(f).toEqual({ zwierze: "koty", uslugi: ["kąpiel", "strzyżenie"], kontakt: ["www", "telefon"], sort: "sprawdzone", strona: 2 });
  });
  it("ignoruje nieznane wartości", () => {
    const f = parseFilters({ zwierze: "chomiki", usluga: ["<script>", "laser"], kontakt: "fax", sort: "cena", strona: "-3" }, opts);
    expect(f).toEqual(DEFAULT_FILTERS);
    expect(parseFilters({ strona: "abc" }, opts).strona).toBe(1);
    expect(parseFilters({ strona: "0" }, opts).strona).toBe(1);
  });
  it("ignoruje opcje niewystępujące w danych", () => {
    const o = listingOptions([items[0]]);
    expect(parseFilters({ zwierze: "koty", kontakt: "telefon" }, o)).toMatchObject({ zwierze: null, kontakt: [] });
  });
});

describe("filtrowanie, facety, sortowanie, stronicowanie", () => {
  const f = (p: Partial<typeof DEFAULT_FILTERS>) => ({ ...DEFAULT_FILTERS, ...p });
  it("pomija nieopublikowane i stosuje AND dla usług i kontaktu", () => {
    expect(applyFilters(items, DEFAULT_FILTERS).map((b) => b.id).sort()).toEqual(["a", "b", "c"]);
    expect(applyFilters(items, f({ uslugi: ["kąpiel", "strzyżenie"] })).map((b) => b.id)).toEqual(["a"]);
    expect(applyFilters(items, f({ zwierze: "koty" })).map((b) => b.id).sort()).toEqual(["b", "c"]);
    expect(applyFilters(items, f({ kontakt: ["www"] })).map((b) => b.id)).toEqual(["a"]);
  });
  it("facety liczą z rzeczywistych danych (zwierzę niezależnie od własnego wyboru)", () => {
    const fc = computeFacets(items, f({ zwierze: "koty" }));
    expect(fc.zwierze).toEqual([
      { value: "psy", label: "Psy", count: 2, selected: false },
      { value: "koty", label: "Koty", count: 2, selected: true },
    ]);
    expect(fc.uslugi.find((o) => o.value === "kąpiel")?.count).toBe(1);
    expect(fc.uslugi.map((o) => o.value)).not.toContain("laser");
  });
  it("sortuje alfabetycznie po polsku", () => {
    expect(sortBusinesses(items.slice(0, 3), "nazwa").map((b) => b.name)).toEqual(["Azor", "Łapka", "Żbik"]);
  });
  it("sortuje wg daty sprawdzenia, brak daty na końcu", () => {
    expect(sortBusinesses(items.slice(0, 3), "sprawdzone").map((b) => b.id)).toEqual(["c", "a", "b"]);
  });
  it("stronicuje po 9 i przycina zbyt dużą stronę do ostatniej", () => {
    const list = Array.from({ length: 20 }, (_, i) => i);
    expect(paginate(list, 1).items).toHaveLength(9);
    expect(paginate(list, 3)).toMatchObject({ page: 3, totalPages: 3, total: 20, clamped: false });
    expect(paginate(list, 3).items).toEqual([18, 19]);
    expect(paginate(list, 99)).toMatchObject({ page: 3, clamped: true });
    expect(paginate([], 5)).toMatchObject({ page: 1, totalPages: 1, total: 0 });
  });
  it("model listingu DEMO: zbyt duża strona => ostatnia; opcje kontaktu z danych", () => {
    const l = publishedListing(DEMO_BUSINESSES, "groomer", "warszawa");
    const m = buildListingModel(l, { strona: "7" });
    expect(m.page.totalPages).toBe(Math.ceil(l.length / 9));
    expect(m.filters.strona).toBe(m.page.totalPages);
    expect(m.opts.contacts).toEqual(["www"]); // DEMO nie ma telefonów => brak opcji „telefon”
  });
});

describe("URL builders", () => {
  const f = { zwierze: "koty" as const, uslugi: ["kąpiel", "strzyżenie"], kontakt: ["www" as const], sort: "sprawdzone" as const, strona: 2 };
  it("buduje stabilny URL, pomija wartości domyślne", () => {
    expect(buildListingHref(BASE, DEFAULT_FILTERS)).toBe(BASE);
    const href = buildListingHref(BASE, f);
    const q = new URL(href, "http://x").searchParams;
    expect(q.get("zwierze")).toBe("koty");
    expect(q.getAll("usluga")).toEqual(["kąpiel", "strzyżenie"]);
    expect(q.get("sort")).toBe("sprawdzone");
    expect(q.get("strona")).toBe("2");
  });
  it("usuwa jeden filtr i resetuje stronę", () => {
    const q = new URL(removeFilterHref(BASE, f, "usluga", "kąpiel"), "http://x").searchParams;
    expect(q.getAll("usluga")).toEqual(["strzyżenie"]);
    expect(q.get("strona")).toBeNull();
    expect(q.get("zwierze")).toBe("koty");
    expect(new URL(removeFilterHref(BASE, f, "zwierze"), "http://x").searchParams.get("zwierze")).toBeNull();
  });
  it("„Wyczyść wszystkie” zostawia tylko sortowanie", () => {
    expect(clearFiltersHref(BASE, f)).toBe(`${BASE}?sort=sprawdzone`);
    expect(clearFiltersHref(BASE, { ...f, sort: "nazwa" })).toBe(BASE);
  });
  it("strona i sortowanie", () => {
    expect(pageHref(BASE, DEFAULT_FILTERS, 1)).toBe(BASE);
    expect(pageHref(BASE, DEFAULT_FILTERS, 2)).toBe(`${BASE}?strona=2`);
    expect(sortHref(BASE, { ...DEFAULT_FILTERS, strona: 3 }, "sprawdzone")).toBe(`${BASE}?sort=sprawdzone`);
  });
  it("chipy aktywnych filtrów", () => {
    const chips = activeFilterChips(BASE, f);
    expect(chips.map((c) => c.label)).toEqual(["Koty", "kąpiel", "strzyżenie", "Ma stronę www"]);
    expect(activeFilterCount(f)).toBe(4);
  });
  it("noindex tylko dla parametrów listingu (UTM się nie liczy)", () => {
    expect(hasListingParams({})).toBe(false);
    expect(hasListingParams({ utm_source: "facebook" })).toBe(false);
    expect(hasListingParams({ strona: "2" })).toBe(true);
    expect(hasListingParams({ usluga: [] })).toBe(false);
    expect(hasListingParams({ zwierze: "" })).toBe(false); // radio „Wszystkie” bez JS
  });
  it("lista numerów stron z wielokropkiem", () => {
    expect(pageList(1, 3)).toEqual([1, 2, 3]);
    expect(pageList(5, 10)).toEqual([1, null, 4, 5, 6, null, 10]);
    expect(pageList(1, 10)).toEqual([1, 2, null, 10]);
  });
  it("sanityzuje query powrotu z profilu", () => {
    const opts = listingOptions(items.filter((b) => b.status === "published"));
    expect(sanitizeReturnQuery("zwierze=koty&evil=1&usluga=k%C4%85piel&strona=2", opts)).toBe("zwierze=koty&usluga=k%C4%85piel&strona=2");
    expect(sanitizeReturnQuery("javascript:alert(1)", opts)).toBe("");
    expect(sanitizeReturnQuery(undefined, opts)).toBe("");
    expect(sanitizeReturnQuery("x".repeat(600), opts)).toBe("");
  });
});

describe("resolveCityInput", () => {
  it.each([
    ["Białystok", "bialystok"], ["bialystok", "bialystok"], ["BIAŁYSTOK", "bialystok"], ["białymstoku", "bialystok"],
    ["w Białymstoku", "bialystok"], ["Warszawa", "warszawa"], ["wawa", "warszawa"], ["  warszawie ", "warszawa"],
    ["Warszawa, Mokotów", "warszawa"], ["Warszawa-Wola", "warszawa"], ["Kraków", "krakow"], ["we Wrocławiu", "wroclaw"], ["Łódź", "lodz"], ["w Poznaniu", "poznan"],
  ])("%s → %s", (input, slug) => expect(resolveCityInput(input)).toBe(slug));
  it.each(["Biała Podlaska", "Zielona Góra", "", "   ", "x".repeat(100)])("%s → null", (input) => expect(resolveCityInput(input)).toBeNull());
  it("odporna na brak wartości", () => {
    expect(resolveCityInput(null)).toBeNull();
    expect(resolveCityInput(undefined)).toBeNull();
  });
});

describe("nearestCity", () => {
  it("wybiera bliższe miasto pilotażu", () => {
    expect(nearestCity(52.23, 21.0)?.city).toBe("warszawa");
    expect(nearestCity(53.13, 23.15)).toMatchObject({ city: "bialystok" });
    expect(nearestCity(53.13, 23.15)!.distanceKm).toBeLessThan(3);
    expect(nearestCity(50.06, 19.94)?.city).toBe("krakow");
    const zielonaGora = nearestCity(51.94, 15.5)!; // poza listą miast — najbliższe obsługiwane
    expect(["poznan", "wroclaw"]).toContain(zielonaGora.city);
    expect(zielonaGora.distanceKm).toBeGreaterThan(80);
  });
  it("odrzuca nieprawidłowe współrzędne", () => {
    expect(nearestCity(NaN, 21)).toBeNull();
    expect(nearestCity(91, 21)).toBeNull();
    expect(nearestCity(52, 181)).toBeNull();
  });
});

describe("resolveSearch / resolveCategoryInput", () => {
  it("rozpoznana usługa + miasto => przekierowanie do listingu", () => {
    expect(resolveSearch({ usluga: "groomer", miasto: "Białystok" })).toEqual({ kind: "redirect", href: "/uslugi/groomer/bialystok" });
    expect(resolveSearch({ usluga: "hotel-dla-zwierzat", miasto: "wawa" })).toEqual({ kind: "redirect", href: "/uslugi/hotel-dla-zwierzat/warszawa" });
  });
  it("miasto spoza pilotażu", () => {
    expect(resolveSearch({ usluga: "groomer", miasto: "Kraków" })).toEqual({ kind: "redirect", href: "/uslugi/groomer/krakow" });
    expect(resolveSearch({ usluga: "groomer", miasto: "Zielona Góra" })).toEqual({ kind: "outside_pilot", category: "groomer", cityText: "Zielona Góra" });
  });
  it("brak usługi lub miasta", () => {
    expect(resolveSearch({ miasto: "Warszawa" })).toEqual({ kind: "need_category", city: "warszawa" });
    expect(resolveSearch({ usluga: "groomer" })).toEqual({ kind: "redirect", href: "/uslugi/groomer" });
    expect(resolveSearch({})).toEqual({ kind: "empty", category: null });
  });
  it("słowa kluczowe kategorii", () => {
    expect(resolveCategoryInput("Fryzjer dla psa")).toBe("groomer");
    expect(resolveCategoryInput("pensjonat")).toBe("hotel-dla-zwierzat");
    expect(resolveCategoryInput("weterynarz")).toBeNull();
  });
});

describe("kontakt i format", () => {
  it("www tylko https, link przez /api/out", () => {
    expect(hasSite({ websiteUrl: "http://example.com" })).toBe(false);
    expect(contactChannels(items[0])).toEqual({ site: "/api/out?b=a&t=site", phone: null });
    expect(contactChannels(items[1])).toEqual({ site: null, phone: "/api/out?b=b&t=phone" });
  });
  it("adres lokalu tylko dla realnych firm (ADR-011); DEMO nigdy nie pokazuje adresu", () => {
    expect(publicLocation(mk("z", { addressText: "ul. Testowa 1", serviceArea: "Wola", demo: false }))).toEqual({ serviceArea: "Wola", address: "ul. Testowa 1" });
    expect(publicLocation(mk("y", { addressText: "ul. Testowa 1", serviceArea: "Wola", demo: true }))).toEqual({ serviceArea: "Wola", address: null });
  });
  it("odmienia „firma”", () => {
    expect([0, 1, 2, 4, 5, 12, 14, 22, 25, 112].map(firmCount)).toEqual([
      "0 firm", "1 firma", "2 firmy", "4 firmy", "5 firm", "12 firm", "14 firm", "22 firmy", "25 firm", "112 firm",
    ]);
    expect(pluralPl(3, "a", "b", "c")).toBe("b");
  });
});
