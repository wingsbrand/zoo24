// ACCEPTANCE §3–4: uprawnienia, autonomia i niezawodność kontrolowanej usługi wykonującej (lib/ops/gateway.ts).
import { describe, expect, it } from "vitest";
import { tempStore } from "../helpers";
import { leasedJob, socialRequest, SpyExecutor, testPolicy } from "./helpers";
import { executeAction } from "@/lib/ops/gateway";
import { claim } from "@/lib/ops/registry";
import { policyHash } from "@/lib/ops/policy";

const NOW = new Date("2026-12-01T08:00:20Z");

describe("P: uprawnienia i autonomia", () => {
  it("P01 shadow i design: gotowy, zatwierdzony artefakt => dry_run, executor NIE wywołany", async () => {
    for (const mode of ["shadow", "design"] as const) {
      const store = tempStore();
      const { dedupeKey, token } = await leasedJob(store);
      const ex = new SpyExecutor();
      const r = await executeAction(socialRequest(dedupeKey, token), { store, policy: testPolicy(mode), executor: ex, now: NOW });
      expect(r.status).toBe("dry_run");
      expect(ex.calls + ex.lookups).toBe(0);
      expect(store.read().ops.receipts.every((x) => x.status === "dry_run")).toBe(true);
    }
  });

  it("P01b canary/live bez podpisu właściciela => efektywnie shadow (zero zapisów)", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const ex = new SpyExecutor();
    const r = await executeAction(socialRequest(dedupeKey, token), { store, policy: testPolicy("live_scoped", { signed: false }), executor: ex, now: NOW });
    expect(r.mode).toBe("shadow");
    expect(ex.calls).toBe(0);
  });

  it("P02 live_scoped z podpisaną polityką i aktualną zgodą => wykonanie bez nowego pytania + receipt z read-back", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const ex = new SpyExecutor();
    const r = await executeAction(socialRequest(dedupeKey, token), { store, policy: testPolicy("live_scoped", { signed: true }), executor: ex, now: NOW });
    expect(r.status).toBe("executed");
    expect(r.reasons).toContain("VERIFIED_READBACK");
    expect(ex.calls).toBe(1);
    expect(r.receipt?.externalObjectId).toBe("ext-1");
    expect(r.receipt?.verifiedAt).not.toBeNull();
  });

  it("P03 nieznane konto, zmieniony hash treści => odmowa z konkretną przyczyną", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const policy = testPolicy("live_scoped", { signed: true });
    const ex = new SpyExecutor();
    const wrongAcc = await executeAction(socialRequest(dedupeKey, token, { target: { kind: "facebook_page_id", id: "OBCA-STRONA" } }), { store, policy, executor: ex, now: NOW });
    expect(wrongAcc).toMatchObject({ status: "rejected", reasons: ["RESOURCE_NOT_IN_POLICY"] });
    const req = socialRequest(dedupeKey, token);
    req.artifact.contentHash = "h2-po-edycji";
    const changed = await executeAction(req, { store, policy, executor: ex, now: NOW });
    expect(changed.status).toBe("rejected");
    expect(changed.reasons).toContain("APPROVAL_NOT_CURRENT");
    expect(ex.calls).toBe(0);
  });

  it("P05 dowolny request / nieznana operacja / dodatkowe pola payloadu => odmowa gateway", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const deps = { store, policy: testPolicy("live_scoped", { signed: true }), executor: new SpyExecutor(), now: NOW };
    expect((await executeAction(socialRequest(dedupeKey, token, { op: "http.request" }), deps)).reasons).toEqual(["OP_NOT_ALLOWED"]);
    expect((await executeAction(socialRequest(dedupeKey, token, { payload: { postId: "x", url: "https://evil.test", headers: "Authorization" } }), deps)).reasons[0]).toMatch(/^PAYLOAD_NOT_ALLOWED/);
    expect((await executeAction(socialRequest(dedupeKey, token, { role: "seo" }), deps)).reasons).toEqual(["ROLE_NOT_ALLOWED"]);
    expect(deps.executor.calls).toBe(0);
  });

  it("P07 / S08 sponsor, porada medyczna, DM, e-mail, płatna kampania => needs_human, zero zapisu", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const ex = new SpyExecutor();
    for (const flags of [{ sponsored: true }, { health: true }, { privateMessage: true }, { email: true }, { paidMedia: true }]) {
      const r = await executeAction(socialRequest(dedupeKey, token, { flags }), { store, policy: testPolicy("live_scoped", { signed: true }), executor: ex, now: NOW });
      expect(r.status).toBe("needs_human");
    }
    expect(ex.calls).toBe(0);
  });

  it("P08 akceptacja od procesu agenta/AI lub autora => odrzucona", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const deps = { store, policy: testPolicy("live_scoped", { signed: true }), executor: new SpyExecutor(), now: NOW };
    for (const reviewer of ["zoo24-ops-content", "agent:reviewer", "claude-opus", "ai:llm-judge", null]) {
      const req = socialRequest(dedupeKey, token);
      req.artifact.reviewedBy = reviewer;
      expect((await executeAction(req, deps)).reasons).toContain("HUMAN_REVIEW_MISSING");
    }
    const self = socialRequest(dedupeKey, token);
    self.artifact.reviewedBy = self.artifact.authorId = "editor-anna";
    expect((await executeAction(self, deps)).reasons).toContain("SELF_APPROVAL");
    expect(deps.executor.calls).toBe(0);
  });

  it("P06 brak skonfigurowanego zasobu (np. konto IG) => blocked_access tylko tej akcji", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const policy = testPolicy("live_scoped", { signed: true });
    policy.resources.instagram_account_id = null;
    const r = await executeAction(socialRequest(dedupeKey, token, { target: { kind: "instagram_account_id", id: "x" } }), { store, policy, executor: new SpyExecutor(), now: NOW });
    expect(r.status).toBe("blocked_access");
  });

  it("brak przyznanej autonomii lub budżetu => blocked_policy", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const noAuto = await executeAction(socialRequest(dedupeKey, token), { store, policy: testPolicy("live_scoped", { signed: true, autonomy: { publish_reviewed_social_versions: false } }), executor: new SpyExecutor(), now: NOW });
    expect(noAuto.reasons[0]).toMatch(/^AUTONOMY_NOT_GRANTED/);
    const noBudget = await executeAction(socialRequest(dedupeKey, token), { store, policy: testPolicy("live_scoped", { signed: true, budget: null }), executor: new SpyExecutor(), now: NOW });
    expect(noBudget.reasons).toEqual(["BUDGET_NOT_APPROVED"]);
  });
});

describe("polityka podpisana w repo (pilot shadow tylko do odczytu)", () => {
  it("podpisana polityka z repo: każda operacja zapisu kończy się dry_run, executor nie jest wywoływany", async () => {
    const { loadPolicy } = await import("@/lib/ops/policy");
    const policy = loadPolicy()!;
    policy.resources = { ...policy.resources, facebook_page_id: "TEST-PAGE-1" }; // edycja unieważnia podpis => nadal shadow
    for (const p of [loadPolicy()!, policy]) {
      const store = tempStore();
      const { dedupeKey, token } = await leasedJob(store);
      const ex = new SpyExecutor();
      const r = await executeAction(socialRequest(dedupeKey, token), { store, policy: p, executor: ex, now: NOW });
      expect(["dry_run", "blocked_access"]).toContain(r.status);
      expect(r.mode).toBe("shadow");
      expect(ex.calls + ex.lookups).toBe(0);
    }
  });
});

describe("redaktor-AI (decyzja właściciela 2026-11-22)", () => {
  const aiPolicy = () => {
    const p = testPolicy("live_scoped", { signed: false, budget: 0 });
    p.review = { ...p.review, editor_id: "claude-ai-editor", ai_editor_allowed: true, ai_editor_id: "claude-ai-editor" };
    p.enabled = true;
    p.owner_approval = { approved: true, approved_by: "owner-test", approved_at: "2026-11-22T15:00:00Z", policy_hash: null };
    p.owner_approval.policy_hash = policyHash(p);
    return p;
  };
  const cmsReq = (key: string, token: number, reviewedBy: string, flags = {}) => ({
    op: "cms.publish_approved_version", role: "content" as const, jobDedupeKey: key, fencingToken: token,
    target: { kind: "site_origin", id: "https://zoo24.pl" },
    artifact: { id: "article:kot-brytyjski-n66", contentHash: "a1", approvedHash: "a1", authorId: "zoo24-ops-content", reviewedBy, evidenceIds: [] },
    flags, estimatedCostPln: 0, payload: { slug: "kot-brytyjski-n66" },
  });

  it("wskazany redaktor-AI zatwierdza artykuł => publikacja (live), koszt 0 zł mieści się w limicie 0 ponad subskrypcję", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const ex = new SpyExecutor();
    const r = await executeAction(cmsReq(dedupeKey, token, "claude-ai-editor"), { store, policy: aiPolicy(), executor: ex, now: NOW });
    expect(r.status).toBe("executed");
    expect(ex.calls).toBe(1);
  });
  it("inny proces AI niż wskazany redaktor => odrzucony; zdrowie/prawo/ceny/sponsor => needs_human", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const ex = new SpyExecutor();
    const deps = { store, policy: aiPolicy(), executor: ex, now: NOW };
    expect((await executeAction(cmsReq(dedupeKey, token, "zoo24-ops-content"), deps)).status).toBe("rejected"); // autor-agent nie zatwierdza sam siebie
    expect((await executeAction(cmsReq(dedupeKey, token, "agent:inny"), deps)).reasons).toContain("HUMAN_REVIEW_MISSING");
    for (const flags of [{ health: true }, { legal: true }, { prices: true }, { sponsored: true }]) {
      expect((await executeAction(cmsReq(dedupeKey, token, "claude-ai-editor", flags), deps)).status).toBe("needs_human");
    }
    expect(ex.calls).toBe(0);
  });
  it("koszt > 0 przy limicie 0 zł ponad subskrypcję => blocked_policy BUDGET_CAP", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const r = await executeAction({ ...cmsReq(dedupeKey, token, "claude-ai-editor"), estimatedCostPln: 5 }, { store, policy: aiPolicy(), executor: new SpyExecutor(), now: NOW });
    expect(r.reasons).toEqual(["BUDGET_CAP"]);
  });
});

describe("R: niezawodność", () => {
  it("R02 spóźniony worker ze starym fencing tokenem => odmowa przed wywołaniem", async () => {
    const store = tempStore();
    const { dedupeKey, token: old } = await leasedJob(store);
    const later = new Date(NOW.getTime() + 30 * 60_000); // lease wygasł, inny worker przejmuje
    const fresh = await claim(store, dedupeKey, "w2", later);
    expect(fresh).toBeGreaterThan(old);
    const ex = new SpyExecutor();
    const r = await executeAction(socialRequest(dedupeKey, old), { store, policy: testPolicy("live_scoped", { signed: true }), executor: ex, now: later });
    expect(r).toMatchObject({ status: "rejected", reasons: ["STALE_FENCING_TOKEN"] });
    expect(ex.calls).toBe(0);
  });

  it("R03 timeout po skutecznej publikacji => rekoncyliacja znajduje post, brak duplikatu przy ponownym wywołaniu", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const ex = new SpyExecutor([{ cls: "timeout", code: "ETIMEDOUT", landed: true }]);
    const deps = { store, policy: testPolicy("live_scoped", { signed: true }), executor: ex, now: NOW };
    const r1 = await executeAction(socialRequest(dedupeKey, token), deps);
    expect(r1).toMatchObject({ status: "executed", reasons: ["RECONCILED_AFTER_TIMEOUT"] });
    const r2 = await executeAction(socialRequest(dedupeKey, token), deps);
    expect(r2.status).toBe("already_done");
    expect(ex.calls).toBe(1);
    expect(ex.remote.size).toBe(1);
  });

  it("R04 wynik nieustalony => unknown_outcome, kolejne wywołanie NIE ponawia zapisu", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const ex = new SpyExecutor([{ cls: "timeout", code: "ETIMEDOUT" }], true);
    const deps = { store, policy: testPolicy("live_scoped", { signed: true }), executor: ex, now: NOW };
    expect((await executeAction(socialRequest(dedupeKey, token), deps)).status).toBe("unknown_outcome");
    expect((await executeAction(socialRequest(dedupeKey, token), deps)).status).toBe("unknown_outcome");
    expect(ex.calls).toBe(1);
    expect(store.read().ops.receipts.filter((r) => r.status === "unknown")).toHaveLength(1);
  });

  it("R05 błąd przejściowy 429 => retry_wait z Retry-After; kolejna próba sprawdza stan i publikuje raz", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const ex = new SpyExecutor([{ cls: "retryable", code: "HTTP_429", retryAfterSeconds: 120 }]);
    const deps = { store, policy: testPolicy("live_scoped", { signed: true }), executor: ex, now: NOW };
    const r1 = await executeAction(socialRequest(dedupeKey, token), deps);
    expect(r1).toMatchObject({ status: "retry_wait", retryAfterSeconds: 120 });
    const r2 = await executeAction(socialRequest(dedupeKey, token), deps);
    expect(r2.status).toBe("executed");
    expect(ex.lookups).toBeGreaterThanOrEqual(2); // lookup przed retry + read-back
    expect(ex.remote.size).toBe(1);
  });

  it("R06 odmowa uprawnień/walidacji => failed, brak automatycznego retry", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    const ex = new SpyExecutor([{ cls: "permanent", code: "PERMISSION_DENIED" }]);
    const deps = { store, policy: testPolicy("live_scoped", { signed: true }), executor: ex, now: NOW };
    expect((await executeAction(socialRequest(dedupeKey, token), deps)).status).toBe("failed");
    const again = await executeAction(socialRequest(dedupeKey, token), deps);
    expect(again).toMatchObject({ status: "needs_human", reasons: ["PRIOR_PERMANENT_FAILURE_NO_AUTO_RETRY"] });
    expect(ex.calls).toBe(1);
  });

  it("R08 pauza w stanie => blocked_policy PAUSED, nawet przy podpisanej polityce", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    await store.transact((s) => { s.ops.mode = "paused"; });
    const ex = new SpyExecutor();
    const r = await executeAction(socialRequest(dedupeKey, token), { store, policy: testPolicy("live_scoped", { signed: true }), executor: ex, now: NOW });
    expect(r).toMatchObject({ status: "blocked_policy", reasons: ["PAUSED"] });
    expect(ex.calls).toBe(0);
  });

  it("C01 dowód brakujący/candidate/przeterminowany => blocked_dependency", async () => {
    const store = tempStore();
    const { dedupeKey, token } = await leasedJob(store);
    await store.transact((s) => {
      s.ops.evidence.push({ evidenceId: "ev-old", sourceUrl: "https://example.test", publisher: "T", title: "T", retrievedAtUtc: "2026-01-01T00:00:00Z", claimText: "x", licenseBasis: "quote_summary", status: "approved", reviewerId: "editor", reviewedAt: "2026-01-02T00:00:00Z", validUntil: "2026-06-01T00:00:00Z", usedByArtifacts: [] });
    });
    const req = socialRequest(dedupeKey, token);
    req.artifact.evidenceIds = ["ev-old", "ev-missing"];
    const r = await executeAction(req, { store, policy: testPolicy("live_scoped", { signed: true }), executor: new SpyExecutor(), now: NOW });
    expect(r.status).toBe("blocked_dependency");
    expect(r.reasons).toEqual(["EVIDENCE_NOT_READY:ev-old", "EVIDENCE_NOT_READY:ev-missing"]);
  });
});
