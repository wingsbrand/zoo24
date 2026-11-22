import { afterEach, describe, expect, it, vi } from "vitest";
import { SupabaseStore } from "@/lib/store/supabase-store";
import { buildSeedState } from "@/lib/demo/seed";
import { MockMetaAdapter } from "@/lib/integrations/meta/adapter";
import { runPublishJob, setPublishing } from "@/lib/social/publisher";
import { approve, editPost, schedule, submitForReview } from "@/lib/social/workflow";
import type { AppState } from "@/lib/types";

/** Atrapa PostgREST z jednym wierszem i warunkowym PATCH po wersji (z opóźnieniem, by wymusić wyścigi). */
function fakePostgrest() {
  let row: { id: string; version: number; data: AppState } | null = null;
  const calls: string[] = [];
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const u = new URL(url);
    const method = init?.method ?? "GET";
    calls.push(method);
    await new Promise((r) => setTimeout(r, Math.random() * 5));
    expect((init?.headers as Record<string, string>).apikey).toBe("sb_secret_TEST");
    if (method === "GET") return new Response(JSON.stringify(row ? [{ data: structuredClone(row.data), version: row.version }] : []), { status: 200 });
    if (method === "POST") {
      const body = JSON.parse(String(init!.body));
      if (!row) row = body;
      return new Response(null, { status: 201 });
    }
    if (method === "PATCH") {
      const want = Number(u.searchParams.get("version")!.replace("eq.", ""));
      if (!row || row.version !== want) return new Response("[]", { status: 200 });
      const body = JSON.parse(String(init!.body));
      row = { id: "main", version: body.version, data: body.data };
      return new Response(JSON.stringify([row]), { status: 200 });
    }
    return new Response(null, { status: 405 });
  });
  return { fetchMock, getRow: () => row, calls };
}

afterEach(() => vi.unstubAllGlobals());

describe("SupabaseStore (PostgREST, optymistyczna współbieżność)", () => {
  it("hydrate tworzy wiersz z seeda; read() zwraca kopię", async () => {
    const pg = fakePostgrest();
    vi.stubGlobal("fetch", pg.fetchMock);
    const s = new SupabaseStore("https://x.supabase.co", "sb_secret_TEST", buildSeedState);
    await s.hydrate();
    expect(pg.getRow()?.version).toBe(1);
    const a = s.read();
    a.businesses = [];
    expect(s.read().businesses.length).toBeGreaterThan(0);
  });

  it("10 równoległych transakcji => wszystkie zapisane (konflikty ponawiane), wersja +10", async () => {
    const pg = fakePostgrest();
    vi.stubGlobal("fetch", pg.fetchMock);
    const s = new SupabaseStore("https://x.supabase.co", "sb_secret_TEST", buildSeedState);
    await s.hydrate();
    await Promise.all(Array.from({ length: 10 }, (_, i) => s.transact((st) => { st.events.push({ day: "2026-11-22", type: "article_to_directory", ref: `r${i}`, count: 1, demo: true }); })));
    expect(pg.getRow()!.version).toBe(11);
    expect(pg.getRow()!.data.events).toHaveLength(10);
  });

  it("dwa równoległe joby publikacji na Supabase => jedna publikacja (lease przez warunkowy zapis)", async () => {
    const pg = fakePostgrest();
    vi.stubGlobal("fetch", pg.fetchMock);
    const s = new SupabaseStore("https://x.supabase.co", "sb_secret_TEST", buildSeedState);
    await s.hydrate();
    const now = new Date("2026-12-08T17:00:30.000Z");
    await s.transact((st) => {
      st.socialAssets.push({ id: "ast-t", description: "t", licenseType: "own", licenseProof: "p", altText: "a", rightsCheckedAt: "2026-11-20T00:00:00Z", expiresAt: null, demo: true });
      const post = st.socialPosts.find((p) => p.id === "soc-007")!;
      editPost(st, "soc-007", "t", { assetId: "ast-t", scheduledAt: "2026-12-08T17:00:00.000Z", copy: post.copy.replace(/\[UZUPE[ŁL]NIA[^\]]*\]/g, "Kontakt: strona O nas.") });
      submitForReview(st, "soc-007", "t");
      approve(st, "soc-007", "owner", now);
      schedule(st, "soc-007", "owner");
    });
    await setPublishing(s, true, "owner");
    const adapter = new MockMetaAdapter();
    await Promise.all([runPublishJob(s, adapter, { now, workerId: "A" }), runPublishJob(s, adapter, { now, workerId: "B" })]);
    expect(adapter.createdTotal).toBe(1);
    expect(pg.getRow()!.data.socialPosts.find((p) => p.id === "soc-007")!.status).toBe("published");
  });

  it("błąd zapisu nie ujawnia klucza", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("apikey=sb_secret_TEST invalid", { status: 401 })));
    const s = new SupabaseStore("https://x.supabase.co", "sb_secret_TEST", buildSeedState);
    await expect(s.hydrate()).rejects.toThrow(/SUPABASE_READ_401/);
    await s.hydrate().catch((e: Error) => expect(e.message).not.toContain("sb_secret_TEST"));
  });
});
