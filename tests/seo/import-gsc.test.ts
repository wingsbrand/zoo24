// Fixtures są syntetyczne (ścieżki /test-*), nie są danymi zoo24.pl.
import { describe, expect, it } from "vitest";
// @ts-expect-error — moduł .mjs bez deklaracji typów
import { aggregate, buildInventory, inventoryToCsv, readInventory, renderReport, urlToPath, detectKind, parseCsv } from "../../scripts/import-gsc.mjs";

const PAGES_PL = `﻿Najczęstsze strony,Kliknięcia,Wyświetlenia,CTR,Pozycja
https://zoo24.pl/test-poradnik-a/,"1 200",50000,2.4%,8.1
https://www.zoo24.pl/test-produkt-b?utm_source=x,300,9000,3.3%,5
https://zoo24.pl/test-produkt-c,0,120,0%,40
https://obca-domena.test/x,999,1,1%,1
`;
const PAGES_EN_OTHER_PERIOD = `Top pages,Clicks,Impressions,CTR,Position
https://zoo24.pl/test-poradnik-a,800,30000,2.6%,7
`;
const LINKS = `Strona docelowa,Linki przychodzące,Witryny z linkami
https://zoo24.pl/test-produkt-c,40,12
https://zoo24.pl/test-tylko-linki,5,3
`;
const files = [
  { name: "Strony.csv", text: PAGES_PL, exportedAt: "2026-11-23" },
  { name: "pages-12m.csv", text: PAGES_EN_OTHER_PERIOD, exportedAt: "2026-11-23" },
  { name: "Linki.csv", text: LINKS, exportedAt: "2026-11-23" },
];

describe("import GSC -> inwentarz URL", () => {
  it("rozpoznaje nagłówki PL/EN i normalizuje URL (bez obcych domen i parametrów śledzących)", () => {
    expect(detectKind(parseCsv(PAGES_PL)[0]).kind).toBe("pages");
    expect(detectKind(parseCsv(LINKS)[0]).kind).toBe("links");
    expect(urlToPath("https://www.zoo24.pl/a/?gclid=1&page=2")).toBe("/a?page=2");
    expect(urlToPath("https://obca-domena.test/x")).toBeNull();
  });

  it("kliknięcia z różnych okresów: maksimum, nie suma; rankingi klików i linków osobno", () => {
    const agg = aggregate(files);
    const a = agg.entries.find((e: { path: string }) => e.path === "/test-poradnik-a");
    expect(a.clicks).toBe(1200);
    expect(agg.byClicks.map((e: { path: string }) => e.path)).toEqual(["/test-poradnik-a", "/test-produkt-b", "/test-produkt-c"]);
    expect(agg.byLinks[0].path).toBe("/test-produkt-c");
    expect(agg.skipped.foreignHost).toBe(1);
  });

  it("brak danych = puste pole (N/A), zero z eksportu = 0; wszystkie nowe wiersze to draft bez decyzji", () => {
    const rows = buildInventory(aggregate(files), []);
    const onlyLinks = rows.find((r: Record<string, string>) => r.old_path === "/test-tylko-linki");
    expect(onlyLinks.historical_gsc_clicks).toBe("");
    expect(rows.find((r: Record<string, string>) => r.old_path === "/test-produkt-c").historical_gsc_clicks).toBe(0);
    for (const r of rows) {
      expect(r.status).toBe("draft");
      expect(r.proposed_action).toBe("");
      expect(r.target_path).toBe("");
      expect(r.content_rights_verified).toBe("unknown");
    }
  });

  it("ponowny import zachowuje decyzje ludzi i wiersze ręczne", () => {
    const first = buildInventory(aggregate(files), []);
    first[0].segment = "B"; first[0].proposed_action = "keep_200"; first[0].status = "approved"; first[0].reviewer = "redaktor";
    const manual = { old_path: "/test-reczny", status: "draft" };
    const reread = readInventory(inventoryToCsv([...first, manual]));
    const second = buildInventory(aggregate(files), reread);
    const a = second.find((r: Record<string, string>) => r.old_path === first[0].old_path);
    expect([a.segment, a.proposed_action, a.status, a.reviewer]).toEqual(["B", "keep_200", "approved", "redaktor"]);
    expect(second.some((r: Record<string, string>) => r.old_path === "/test-reczny")).toBe(true);
  });

  it("raport TOP 100: deduplikacja kolejki P0 i jawne zastrzeżenia", () => {
    const agg = aggregate(files);
    const md = renderReport(agg, buildInventory(agg, []), new Date("2026-11-23T00:00:00Z"));
    expect(md).toContain("TOP 100 klików ∪ TOP 100 linków, deduplikacja): 4");
    expect(md).toContain("zapytania NIE były czytane");
    expect(md).toContain("nie bieżący baseline");
  });
});
