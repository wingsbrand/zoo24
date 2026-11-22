import { describe, expect, it } from "vitest";
import { buildToc, headingText, midContentInsertIndex, RESERVED_IDS, shouldShowToc, slugifyHeading } from "@/lib/content/toc";
import { loadContentArticles } from "@/lib/demo/seed";

describe("spis treści (lib/content/toc)", () => {
  it("slug: polskie znaki -> ASCII, interpunkcja -> myślniki", () => {
    expect(slugifyHeading("Pielęgnacja szaty — najważniejsze zadanie opiekuna")).toBe("pielegnacja-szaty-najwazniejsze-zadanie-opiekuna");
    expect(slugifyHeading("Żółć, łoś i źdźbło: ĄĘŁŃÓŚŹŻ ąęłńóśźż ć")).toBe("zolc-los-i-zdzblo-aelnoszz-aelnoszz-c");
    expect(slugifyHeading("Oczy, uszy i pazury")).toBe("oczy-uszy-i-pazury");
    expect(slugifyHeading("  —  ")).toBe("sekcja");
    expect(slugifyHeading("x".repeat(100)).length).toBeLessThanOrEqual(60);
  });

  it("tylko akapity '## ' trafiają do spisu; '### ' i zwykłe akapity nie", () => {
    const toc = buildToc(["Wstęp", "## Wygląd", "tekst", "### Szczegół", "## Charakter"]);
    expect(toc.map((t) => [t.id, t.text, t.index])).toEqual([["wyglad", "Wygląd", 1], ["charakter", "Charakter", 4]]);
    expect(headingText("### Szczegół")).toBe("Szczegół");
  });

  it("duplikaty dostają unikalne sufiksy, także kolidujące z istniejącymi", () => {
    const toc = buildToc(["## Zdrowie", "## Zdrowie", "## Zdrowie-2", "## Zdrowie", "## Źródła"]);
    const ids = toc.map((t) => t.id);
    expect(ids).toEqual(["zdrowie", "zdrowie-2", "zdrowie-2-2", "zdrowie-3", "zrodla-2"]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of RESERVED_IDS) expect(ids).not.toContain(r);
  });

  it("spis od 3 śródtytułów; prawdziwe szkice mają spis z unikalnymi id", () => {
    expect(shouldShowToc(buildToc(["## A", "## B"]))).toBe(false);
    expect(shouldShowToc(buildToc(["## A", "## B", "## C"]))).toBe(true);
    for (const a of loadContentArticles()) {
      const toc = buildToc(a.body);
      expect(shouldShowToc(toc)).toBe(true);
      expect(new Set(toc.map((t) => t.id)).size).toBe(toc.length);
      for (const t of toc) expect(t.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("blok usług ~60%: przed śródtytułem, nie na początku; krótka treść => brak bloku w środku", () => {
    expect(midContentInsertIndex(["a", "b", "c"])).toBeNull();
    const body = ["p", "## A", "p", "## B", "p", "p", "## C", "p", "## D", "p"];
    expect(midContentInsertIndex(body)).toBe(6);
    expect(midContentInsertIndex(["p", "p", "p", "p", "p"])).toBe(4);
    for (const a of loadContentArticles()) {
      const i = midContentInsertIndex(a.body)!;
      expect(i).toBeGreaterThan(a.body.length / 2);
      expect(i).toBeLessThan(a.body.length);
    }
  });
});
