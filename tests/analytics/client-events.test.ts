import { describe, expect, it } from "vitest";
import { bumpEvent, isClientEventType, isKnownEventRef } from "../../lib/analytics/events";
import type { DirectoryEvent } from "../../lib/types";

const state = { articles: [{ slug: "jak-wybrac-akwarium", status: "published" }, { slug: "szkic", status: "draft" }] } as never;

describe("zdarzenia klienta: narzędzia i wyszukiwania bez wyników", () => {
  it("akceptuje tylko znane typy", () => {
    for (const t of ["tool_result", "tool_export", "search_no_results", "article_to_directory"]) expect(isClientEventType(t)).toBe(true);
    expect(isClientEventType("business_site_outbound")).toBe(false);
    expect(isClientEventType("dowolny")).toBe(false);
  });
  it("ref tylko ze skończonej listy — żadnego tekstu użytkownika", () => {
    expect(isKnownEventRef("tool_result", "kalkulator-akwarium", state)).toBe(true);
    expect(isKnownEventRef("tool_result", "120x40x50", state)).toBe(false);
    expect(isKnownEventRef("tool_export", "lista-dla-opiekuna-druk", state)).toBe(true);
    expect(isKnownEventRef("tool_export", "jan-kowalski", state)).toBe(false);
    expect(isKnownEventRef("search_no_results", "groomer", state)).toBe(true);
    expect(isKnownEventRef("search_no_results", "any", state)).toBe(true);
    expect(isKnownEventRef("search_no_results", "wolsztyn", state)).toBe(false); // fraza miasta nie jest utrwalana
    expect(isKnownEventRef("article_to_directory", "jak-wybrac-akwarium", state)).toBe(true);
    expect(isKnownEventRef("article_to_directory", "szkic", state)).toBe(false);
  });
  it("agreguje licznik dziennie, osobno dla demo", () => {
    const ev: DirectoryEvent[] = [];
    bumpEvent(ev, "2026-11-26", "tool_result", "kalkulator-akwarium", false);
    bumpEvent(ev, "2026-11-26", "tool_result", "kalkulator-akwarium", false);
    bumpEvent(ev, "2026-11-26", "tool_result", "kalkulator-akwarium", true);
    expect(ev).toHaveLength(2);
    expect(ev.find((e) => !e.demo)?.count).toBe(2);
  });
});
