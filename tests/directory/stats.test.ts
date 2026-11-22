import { describe, expect, it } from "vitest";
import { DEMO_BUSINESSES } from "@/lib/demo/seed";
import { listingCounts, MIN_REAL_LISTINGS } from "@/lib/directory/stats";
import { DEFAULT_MIN_LISTINGS } from "@/lib/seo/page-registry";

describe("listingCounts", () => {
  it("liczy tylko opublikowane i rozróżnia DEMO", () => {
    const c = listingCounts(DEMO_BUSINESSES);
    const expected = DEMO_BUSINESSES.filter((b) => b.status === "published" && b.category === "groomer" && b.city === "bialystok").length;
    expect(c.groomer.bialystok.total).toBe(expected);
    expect(c.groomer.bialystok.real).toBe(0);
    expect(c.groomer.bialystok.demo).toBe(expected);
  });
  it("próg indeksacji zgodny z rejestrem SEO", () => {
    expect(MIN_REAL_LISTINGS).toBe(DEFAULT_MIN_LISTINGS);
  });
});
