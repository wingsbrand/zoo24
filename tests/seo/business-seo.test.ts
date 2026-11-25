import { describe, expect, it } from "vitest";
import type { Business } from "@/lib/types";
import { businessLd, businessMetaDescription, isIndexableBusiness } from "@/lib/seo/business-seo";
import { ldGraph } from "@/lib/seo/structured-data";

const biz = (p: Partial<Business> = {}): Business => ({
  id: "x1", slug: "salon-x1", name: "Salon Testowy", category: "groomer", city: "krakow", serviceArea: null,
  websiteUrl: "https://example.org", phonePublic: "+48 600 000 000", description: "d", services: ["strzyżenie", "kąpiel", "trymowanie", "czesanie"],
  petTypes: ["psy", "koty"], addressText: "ul. Prywatna 1", status: "published", demo: false, sourceNote: "s",
  checkedAt: "2026-11-22T12:00:00.000Z", sponsored: false, ...p,
});

describe("A15 opis meta profilu", () => {
  it("jest indywidualny, ≤160 znaków i bez adresu/telefonu", () => {
    const d = businessMetaDescription(biz());
    expect(d).toContain("Salon Testowy");
    expect(d).toContain("w Krakowie");
    expect(d).toContain("strzyżenie");
    expect(d.length).toBeLessThanOrEqual(160);
    expect(d).not.toMatch(/Prywatna|600/);
  });
  it("różne firmy => różne opisy", () => {
    expect(businessMetaDescription(biz())).not.toBe(businessMetaDescription(biz({ name: "Inny", city: "lodz" })));
  });
  it("długa nazwa nie przekracza 160", () => {
    expect(businessMetaDescription(biz({ name: "A".repeat(200) })).length).toBeLessThanOrEqual(160);
  });
});

describe("A08 LocalBusiness", () => {
  it("potwierdzony profil => LocalBusiness bez adresu, telefonu, ocen i godzin", () => {
    const ld = businessLd(biz())!;
    expect(ld["@type"]).toBe("LocalBusiness");
    expect(ld.url).toBe("https://zoo24.pl/firma/salon-x1");
    const json = ldGraph(ld);
    expect(json).not.toMatch(/address|telephone|aggregateRating|review|openingHours|Prywatna|600/i);
  });
  it("DEMO, brak checkedAt lub nieopublikowany => brak JSON-LD", () => {
    for (const p of [{ demo: true }, { checkedAt: null }, { status: "draft" as const }]) {
      expect(isIndexableBusiness(biz(p))).toBe(false);
      expect(businessLd(biz(p))).toBeNull();
    }
  });
  it("www tylko https w sameAs", () => {
    expect(businessLd(biz({ websiteUrl: "http://x.pl" }))!.sameAs).toBeUndefined();
  });
});
