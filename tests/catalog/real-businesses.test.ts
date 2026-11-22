import { describe, expect, it } from "vitest";
import { loadRealBusinesses } from "@/lib/catalog/real-businesses";
import { CITIES } from "@/lib/site";
import { publicLocation } from "@/lib/directory/contact";

describe("realne firmy (content/businesses)", () => {
  const firms = loadRealBusinesses();

  it("po jednej firmie w każdym z 10 miast, nie-DEMO, opublikowane", () => {
    expect(firms).toHaveLength(10);
    expect(new Set(firms.map((f) => f.city))).toEqual(new Set(Object.keys(CITIES)));
    expect(firms.every((f) => !f.demo && f.status === "published" && !f.sponsored)).toBe(true);
  });

  it("źródłem jest strona firmy (https); adres lokalu jest publikowany", () => {
    for (const f of firms) {
      expect(f.sourceNote).toMatch(/^Strona firmy \(https:\/\//);
      expect(f.websiteUrl).toMatch(/^https:\/\//);
      expect(publicLocation(f).address).toBeTruthy();
    }
  });

  it("data sprawdzenia tylko przy danych potwierdzonych przez człowieka", () => {
    const verified = firms.filter((f) => f.checkedAt);
    expect(verified.map((f) => f.id).sort()).toEqual(["r02", "r04", "r10"]);
    for (const f of firms.filter((x) => !x.checkedAt)) expect(f.sourceNote).toMatch(/oczekuje na potwierdzenie/);
  });

  it("unikalne slugi i id", () => {
    expect(new Set(firms.map((f) => f.slug)).size).toBe(10);
    expect(new Set(firms.map((f) => f.id)).size).toBe(10);
  });
});
