import { describe, expect, it } from "vitest";
import { buildSeedState } from "@/lib/demo/seed";
import { syncState } from "@/lib/store/sync";

describe("syncState / seed w produkcji", () => {
  it("seed produkcyjny nie zawiera publicznych rekordów DEMO; szkice social zostają", () => {
    const s = buildSeedState({ production: true });
    expect(s.businesses.length).toBeGreaterThan(0);
    expect(s.businesses.every((b) => !b.demo)).toBe(true);
    expect(s.articles.every((a) => !a.demo)).toBe(true);
    expect(s.legacyUrls).toEqual([]);
    expect(s.socialPosts.length).toBeGreaterThan(0);
  });

  it("sync w produkcji usuwa DEMO ze stanu zapisanego wcześniej w trybie staging", () => {
    const s = buildSeedState({ production: false });
    expect(s.businesses.some((b) => b.demo)).toBe(true);
    expect(syncState(s, { production: true })).toBe(true);
    expect(s.businesses.some((b) => b.demo)).toBe(false);
    expect(s.articles.some((a) => a.demo)).toBe(false);
    expect(s.legacyUrls.some((u) => u.demo)).toBe(false);
    // drugi przebieg bez zmian (idempotencja)
    expect(syncState(s, { production: true })).toBe(false);
  });

  it("poza produkcją sync nie usuwa DEMO", () => {
    const s = buildSeedState({ production: false });
    const n = s.businesses.length;
    expect(syncState(s, { production: false })).toBe(false);
    expect(s.businesses.length).toBe(n);
  });
});
