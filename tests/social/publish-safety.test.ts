import { describe, expect, it } from "vitest";
import { tempStore, prepareScheduled } from "../helpers";
import { MockMetaAdapter, RealMetaAdapter, getMetaAdapter } from "@/lib/integrations/meta/adapter";
import { runPublishJob, setPublishing } from "@/lib/social/publisher";
import { approve, editPost, schedule, submitForReview, WorkflowError } from "@/lib/social/workflow";
import { IntegrationDisabledError } from "@/lib/integrations/errors";

const NOW = new Date("2026-12-08T17:00:30.000Z"); // 18:00:30 Warszawa — soc-007 zaplanowany na 18:00
const AT = "2026-12-08T17:00:00.000Z";

describe("P0 social: brak publikacji bez zgody i praw", () => {
  it("seed: wszystkie posty startują jako draft, wszystkie assety bez zweryfikowanej licencji, publikacja wstrzymana", () => {
    const s = tempStore().read();
    expect(s.socialPosts.length).toBeGreaterThanOrEqual(8);
    expect(s.socialPosts.every((p) => p.status === "draft")).toBe(true);
    expect(s.socialAssets.every((a) => a.licenseType === "unknown")).toBe(true);
    expect(s.settings.publishEnabled).toBe(false);
  });

  it("draft i needs_review nigdy nie trafiają do API, nawet gdy kill switch zwolniony i termin minął", async () => {
    const store = tempStore();
    await store.transact((s) => {
      s.settings.publishEnabled = true;
      for (const p of s.socialPosts) p.scheduledAt = AT;
      submitForReview(s, "soc-001", "t");
    });
    const adapter = new MockMetaAdapter();
    const r = await runPublishJob(store, adapter, { now: NOW });
    expect(adapter.calls.length).toBe(0);
    expect(r.published).toEqual([]);
  });

  it("approve jest blokowany, gdy asset nie ma zweryfikowanej licencji (stan z repo)", () => {
    const store = tempStore();
    return store.transact((s) => {
      submitForReview(s, "soc-007", "t");
      expect(() => approve(s, "soc-007", "owner", NOW)).toThrow(WorkflowError);
      try { approve(s, "soc-007", "owner", NOW); } catch (e) {
        expect((e as WorkflowError).details).toContain("ASSET_LICENSE_UNVERIFIED");
      }
      expect(s.socialPosts.find((p) => p.id === "soc-007")!.status).toBe("needs_review");
    });
  });

  it("schedule bez aktualnej akceptacji jest niemożliwy; ręczne ustawienie 'scheduled' bez akceptacji nie publikuje", async () => {
    const store = tempStore();
    await store.transact((s) => {
      expect(() => schedule(s, "soc-007", "t")).toThrow(WorkflowError);
      const p = s.socialPosts.find((x) => x.id === "soc-007")!;
      p.status = "scheduled"; // obejście state machine (np. błąd w danych)
      p.scheduledAt = AT;
      s.settings.publishEnabled = true;
    });
    const adapter = new MockMetaAdapter();
    const r = await runPublishJob(store, adapter, { now: NOW });
    expect(adapter.calls.length).toBe(0);
    expect(r.blocked[0].errors).toContain("APPROVAL_NOT_CURRENT");
  });

  it("edycja po akceptacji cofa do needs_review i blokuje publikację starej akceptacji", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await store.transact((s) => {
      editPost(s, "soc-007", "editor", { copy: "Zmieniona treść po akceptacji." });
      expect(s.socialPosts.find((p) => p.id === "soc-007")!.status).toBe("needs_review");
      s.settings.publishEnabled = true;
    });
    const adapter = new MockMetaAdapter();
    await runPublishJob(store, adapter, { now: NOW });
    expect(adapter.calls.length).toBe(0);
  });

  it("licencja wygasła po akceptacji => publikacja zablokowana (held), brak wywołania API", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await store.transact((s) => {
      const p = s.socialPosts.find((x) => x.id === "soc-007")!;
      s.socialAssets.find((a) => a.id === p.assetId)!.expiresAt = "2026-12-01T00:00:00Z";
      s.settings.publishEnabled = true;
    });
    const adapter = new MockMetaAdapter();
    const r = await runPublishJob(store, adapter, { now: NOW });
    expect(adapter.calls.length).toBe(0);
    expect(r.blocked[0].errors).toContain("ASSET_LICENSE_EXPIRED");
  });

  it("post zatwierdzony z prawami publikuje się (SYMULACJA MOCK) dokładnie raz", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, true, "owner");
    const adapter = new MockMetaAdapter();
    const r = await runPublishJob(store, adapter, { now: NOW });
    expect(r.published).toEqual(["soc-007"]);
    const p = store.read().socialPosts.find((x) => x.id === "soc-007")!;
    expect(p.status).toBe("published");
    expect(p.externalPostId).toMatch(/^mock_/);
    expect(store.read().audit.some((a) => a.action === "published_SIMULATED_MOCK")).toBe(true);
  });
});

describe("P0 social: idempotency, cron, retry", () => {
  it("dwa jednoczesne uruchomienia crona => jeden post, jedno wywołanie API", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, true, "owner");
    const adapter = new MockMetaAdapter();
    const [a, b] = await Promise.all([
      runPublishJob(store, adapter, { now: NOW, workerId: "cron-A" }),
      runPublishJob(store, adapter, { now: NOW, workerId: "cron-B" }),
    ]);
    expect(adapter.calls.length).toBe(1);
    expect(adapter.publishedCount).toBe(1);
    expect([...a.published, ...b.published]).toEqual(["soc-007"]);
  });

  it("ponowne uruchomienie po publikacji nic nie robi", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, true, "owner");
    const adapter = new MockMetaAdapter();
    await runPublishJob(store, adapter, { now: NOW });
    await runPublishJob(store, adapter, { now: new Date(NOW.getTime() + 60_000) });
    expect(adapter.calls.length).toBe(1);
  });

  it("błąd retryable => retry z backoffem, maks. 3 próby, potem failed", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, true, "owner");
    const adapter = new MockMetaAdapter().failNext(
      { code: "HTTP_500", cls: "retryable" }, { code: "HTTP_500", cls: "retryable" }, { code: "HTTP_500", cls: "retryable" },
    );
    let t = NOW.getTime();
    const r1 = await runPublishJob(store, adapter, { now: new Date(t) });
    expect(r1.retried).toEqual(["soc-007"]);
    const r1b = await runPublishJob(store, adapter, { now: new Date(t + 30_000) }); // przed backoffem
    expect(r1b.claimed).toEqual([]);
    t += 61_000; await runPublishJob(store, adapter, { now: new Date(t) });
    t += 5 * 60_000 + 1000; const r3 = await runPublishJob(store, adapter, { now: new Date(t) });
    expect(r3.failed).toEqual(["soc-007"]);
    expect(adapter.calls.length).toBe(3);
    expect(store.read().attempts.filter((x) => x.postId === "soc-007").length).toBe(3);
  });

  it("timeout po którym post faktycznie powstał => rekoncyliacja, brak duplikatu", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, true, "owner");
    const adapter = new MockMetaAdapter().failNext({ code: "TIMEOUT", cls: "timeout", landed: true });
    const r = await runPublishJob(store, adapter, { now: NOW });
    expect(r.published).toEqual(["soc-007"]);
    expect(adapter.publishedCount).toBe(1);
  });

  it("timeout bez potwierdzenia => held (bez ślepego retry)", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, true, "owner");
    const adapter = new MockMetaAdapter().failNext({ code: "TIMEOUT", cls: "timeout" });
    const r = await runPublishJob(store, adapter, { now: NOW });
    expect(r.held).toEqual(["soc-007"]);
    await runPublishJob(store, adapter, { now: new Date(NOW.getTime() + 10 * 60_000) });
    expect(adapter.calls.length).toBe(1);
  });
});

describe("P0 social: kill switch, brak catch-upu, tokeny", () => {
  it("kill switch => 0 publikacji; wznowienie nie publikuje hurtowo zaległych (held)", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, false, "owner");
    const adapter = new MockMetaAdapter();
    const r = await runPublishJob(store, adapter, { now: NOW });
    expect(r.skippedReason).toBe("KILL_SWITCH");
    expect(adapter.calls.length).toBe(0);
    await setPublishing(store, true, "owner");
    const later = new Date(NOW.getTime() + 2 * 3600_000); // 2 h po terminie
    const r2 = await runPublishJob(store, adapter, { now: later });
    expect(adapter.calls.length).toBe(0);
    expect(r2.held).toEqual(["soc-007"]);
  });

  it("kill switch z anulowaniem przyszłych wpisów", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, false, "owner", true);
    expect(store.read().socialPosts.find((p) => p.id === "soc-007")!.status).toBe("cancelled");
  });

  it("wygasły token: bezpieczny stop, pauza kanału, token NIE trafia do logów ani audytu", async () => {
    const store = tempStore();
    await prepareScheduled(store, "soc-007", AT, NOW);
    await setPublishing(store, true, "owner");
    const token = "EAAFAKEMOCKTOKEN0000000000";
    const adapter = new MockMetaAdapter(token).failNext({ code: "OAUTH_EXPIRED", cls: "auth" });
    const r = await runPublishJob(store, adapter, { now: NOW });
    expect(r.failed).toEqual(["soc-007"]);
    const s = store.read();
    expect(s.settings.channels.facebook).toBe(false);
    const dump = JSON.stringify(s) + r.logs.join("\n");
    expect(dump).not.toContain(token);
    expect(dump).toContain("REDACTED");
  });

  it("Mode 1 / real adapter bez flagi i zgody => IntegrationDisabledError (brak nielegalnego fallbacku)", () => {
    expect(() => new RealMetaAdapter()).toThrow(IntegrationDisabledError);
    expect(() => getMetaAdapter(1)).toThrow(IntegrationDisabledError);
    expect(getMetaAdapter(0).kind).toBe("mock");
  });

  it("limit 3 posty/kanał/tydzień jest egzekwowany przy akceptacji", async () => {
    const store = tempStore();
    // 3 posty FB w tym samym tygodniu co soc-009 jako zaplanowane
    await store.transact((s) => {
      ["soc-001", "soc-003", "soc-005"].forEach((id) => {
        const p = s.socialPosts.find((x) => x.id === id)!;
        p.status = "scheduled"; p.scheduledAt = "2026-12-09T17:00:00.000Z";
      });
    });
    await expect(prepareScheduled(store, "soc-009", "2026-12-11T17:00:00.000Z", NOW)).rejects.toThrow(/WEEKLY_LIMIT_EXCEEDED/);
  });
});
