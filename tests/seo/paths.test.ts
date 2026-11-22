import { describe, expect, it } from "vitest";
import { normalizePath, pathOnly } from "@/lib/seo/paths";

describe("normalizePath", () => {
  it("usuwa host, schemat, fragment i końcowy slash", () => {
    expect(normalizePath("https://WWW.Zoo24.pl/Poradniki/Groomer/#sekcja")).toBe("/poradniki/groomer");
    expect(normalizePath("//zoo24.pl/abc/")).toBe("/abc");
  });

  it("zachowuje / dla strony głównej", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("https://zoo24.pl")).toBe("/");
    expect(normalizePath("")).toBe("/");
    expect(normalizePath(null)).toBe("/");
  });

  it("usuwa utm_*, gclid, fbclid, a inne parametry zostawia", () => {
    expect(normalizePath("/a?utm_source=fb&utm_campaign=x&gclid=1&fbclid=2")).toBe("/a");
    expect(normalizePath("/a/?q=kot&utm_medium=x")).toBe("/a?q=kot");
  });

  it("scala wielokrotne slashe i dodaje wiodący slash", () => {
    expect(normalizePath("a//b///c/")).toBe("/a/b/c");
  });

  it("pathOnly obcina query", () => {
    expect(pathOnly("/Uslugi/?sort=asc")).toBe("/uslugi");
  });
});
