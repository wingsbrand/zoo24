// Testy regresyjne dla uwag zoo24-qa (H2, M2, M3, M4, M5, L2, H1/M1).
import { describe, expect, it } from "vitest";
import { tempStore, prepareScheduled } from "../helpers";
import { MockMetaAdapter } from "@/lib/integrations/meta/adapter";
import { runPublishJob, setChannel, setPublishing } from "@/lib/social/publisher";
import { editPost } from "@/lib/social/workflow";
import { isTrustedAdminRequest } from "@/lib/site";

const NOW = new Date("2026-12-08T17:00:30.000Z");
const AT = "2026-12-08T17:00:00.000Z";

describe("QA regressions", () => {
  it("H2: 5xx po którym post faktycznie powstał => rekoncyliacja przed retry, brak duplikatu (adapter bez dedupe)", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, true, "owner");
    const adapter = new MockMetaAdapter().failNext({ code: "HTTP_502", cls: "retryable", landed: true });
    const r1 = await runPublishJob(store, adapter, { now: NOW });
    expect(r1.retried).toEqual(["soc-007"]);
    const r2 = await runPublishJob(store, adapter, { now: new Date(NOW.getTime() + 61_000) });
    expect(r2.published).toEqual(["soc-007"]);
    expect(adapter.createdTotal).toBe(1);
    expect(adapter.calls.length).toBe(1);
  });

  it("dwa crony równolegle przy adapterze BEZ deduplikacji => nadal 1 post (ochrona po stronie publishera)", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, true, "owner");
    const adapter = new MockMetaAdapter();
    await Promise.all([1, 2, 3].map((i) => runPublishJob(store, adapter, { now: NOW, workerId: `cron-${i}` })));
    expect(adapter.createdTotal).toBe(1);
  });

  it("M2: wznowienie publikacji NIE odblokowuje kanału zapauzowanego po błędzie auth", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, true, "owner");
    await runPublishJob(store, new MockMetaAdapter().failNext({ code: "OAUTH_EXPIRED", cls: "auth" }), { now: NOW });
    await setPublishing(store, false, "owner");
    await setPublishing(store, true, "owner");
    expect(store.read().settings.channels.facebook).toBe(false);
    await setChannel(store, "facebook", true, "owner");
    expect(store.read().settings.channels.facebook).toBe(true);
  });

  it("M3: retry spóźniony ponad próg (np. po pauzie) => held, bez catch-upu", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, true, "owner");
    const adapter = new MockMetaAdapter().failNext({ code: "HTTP_500", cls: "retryable" });
    await runPublishJob(store, adapter, { now: NOW });
    const r = await runPublishJob(store, adapter, { now: new Date(NOW.getTime() + 3 * 3600_000) });
    expect(r.held).toEqual(["soc-007"]);
    expect(adapter.calls.length).toBe(1);
  });

  it("M4: post utknięty w 'publishing' po awarii procesu => rekoncyliacja; brak potwierdzenia => held", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await store.transact((s) => {
      s.settings.publishEnabled = true;
      const p = s.socialPosts.find((x) => x.id === "soc-007")!;
      p.status = "publishing"; p.leaseOwner = "dead-worker"; p.leaseUntil = new Date(NOW.getTime() - 1000).toISOString();
    });
    const adapter = new MockMetaAdapter();
    const r = await runPublishJob(store, adapter, { now: NOW });
    expect(r.held).toEqual(["soc-007"]);
    expect(adapter.calls.length).toBe(0);
  });

  it("M5: limit tygodniowy blokuje tylko posty ponad limit (wcześniejsze przechodzą)", async () => {
    const store = tempStore();
    await store.transact((s) => {
      ["soc-001", "soc-003"].forEach((id, i) => {
        const p = s.socialPosts.find((x) => x.id === id)!;
        p.status = "scheduled"; p.scheduledAt = `2026-12-0${8 + i}T10:00:00.000Z`;
      });
    });
    // 3. post w tygodniu — mieści się w limicie 3
    await expect(prepareScheduled(store, "soc-007", "2026-12-10T17:00:00.000Z", NOW)).resolves.toBeUndefined();
    // 4. post (później w tygodniu) — przekracza
    await expect(prepareScheduled(store, "soc-009", "2026-12-11T17:00:00.000Z", NOW)).rejects.toThrow(/WEEKLY_LIMIT_EXCEEDED/);
  });

  it("L2: zmiana oznaczenia sponsorowania unieważnia akceptację", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await store.transact((s) => {
      editPost(s, "soc-007", "editor", { sponsored: true });
      expect(s.socialPosts.find((p) => p.id === "soc-007")!.status).toBe("needs_review");
    });
  });

  it("H1/M1: akcje admina tylko z loopback i same-origin", () => {
    const h = (o: Record<string, string>) => ({ get: (k: string) => o[k] ?? null });
    expect(isTrustedAdminRequest(h({ host: "localhost:3024" }))).toBe(true);
    expect(isTrustedAdminRequest(h({ host: "staging.zoo24.pl" }))).toBe(false);
    expect(isTrustedAdminRequest(h({ host: "localhost:3024", "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(isTrustedAdminRequest(h({ host: "localhost:3024", origin: "https://evil.example" }))).toBe(false);
  });
});
