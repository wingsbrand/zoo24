// ACCEPTANCE: rejestr (R01/R02), budżet (R07), harmonogram (R10/R11), pauza (R08/R09), polityka (P04),
// dispatcher shadow (I04-shadow, P06, O1: dwa uruchomienia nie dublują efektu).
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { tempStore } from "../helpers";
import { testPolicy } from "./helpers";
import { assertFence, claim, complete, enqueue, RegistryError } from "@/lib/ops/registry";
import { budgetLevel, reserveBudget } from "@/lib/ops/gateway";
import { latestDueSlot, nextSlot, OPS_SCHEDULE, slotsBetween } from "@/lib/ops/schedule";
import { pauseAll, resumeOps, type ProviderScheduleAdapter, NoProviderAccess } from "@/lib/ops/pause";
import { effectiveMode, isAgentIdentity, isPolicyApproved, loadPolicy, PolicyError, writePolicy } from "@/lib/ops/policy";
import { runShadowTick } from "@/lib/ops/dispatcher";
import { runRoleShadow } from "@/lib/ops/roles";
import { MockMetaAdapter } from "@/lib/integrations/meta/adapter";
import { OPS_ROLES } from "@/lib/ops/types";

const NOW = new Date("2026-12-01T08:00:10Z");
const ENV = { sources: { gsc: "no_access", ga4: "export_manual", meta_fb: "export_manual", meta_ig: "no_access" } as const, vcs: false, editorId: null };

describe("R01/R02 lease i fencing", () => {
  it("R01 dwa równoległe claim tego samego job_key => dokładnie jeden lease", async () => {
    const store = tempStore();
    await store.transact((s) => { enqueue(s, { dedupeKey: "seo:x", role: "seo", scheduledAtUtc: NOW.toISOString() }, NOW); });
    const tokens = await Promise.all(Array.from({ length: 8 }, (_, i) => claim(store, "seo:x", `w${i}`, NOW)));
    expect(tokens.filter((t) => t !== null)).toHaveLength(1);
  });

  it("enqueue z tym samym dedupe_key zwraca istniejący job (brak duplikatu)", async () => {
    const store = tempStore();
    await store.transact((s) => { enqueue(s, { dedupeKey: "k", role: "seo", scheduledAtUtc: "a" }, NOW); enqueue(s, { dedupeKey: "k", role: "seo", scheduledAtUtc: "a" }, NOW); });
    expect(store.read().ops.jobs).toHaveLength(1);
  });

  it("R02 po przejęciu lease stary token nie zapisze wyniku", async () => {
    const store = tempStore();
    await store.transact((s) => { enqueue(s, { dedupeKey: "k", role: "content", scheduledAtUtc: "a" }, NOW); });
    const t1 = (await claim(store, "k", "w1", NOW, 1000))!;
    const t2 = (await claim(store, "k", "w2", new Date(NOW.getTime() + 5000)))!;
    expect(t2).toBeGreaterThan(t1);
    const res = runRoleShadow("content", "j", store.read(), { ...ENV, now: NOW, mode: "shadow", policyVersion: null } as never);
    await expect(complete(store, "k", t1, res, NOW)).rejects.toThrow(RegistryError);
    await complete(store, "k", t2, res, NOW);
    expect(() => assertFence(store.read(), "k", t1)).toThrow(/STALE_FENCING_TOKEN/);
  });
});

describe("R07 budżet", () => {
  it("równoległe rezerwacje blisko limitu nie przekraczają cap", async () => {
    const store = tempStore();
    const res = await Promise.all(Array.from({ length: 10 }, (_, i) => reserveBudget(store, `job-${i}`, 100, 600, NOW)));
    expect(res.filter((r) => r === "ok")).toHaveLength(6);
    const b = store.read().ops.budget;
    expect(b.reserved.reduce((a, r) => a + r.amount, 0)).toBe(600);
  });
  it("brak zatwierdzonego budżetu => brak rezerwacji; progi 70/90/100%", async () => {
    expect(await reserveBudget(tempStore(), "j", 1, null, NOW)).toBe("BUDGET_NOT_APPROVED");
    expect([budgetLevel(100, 600), budgetLevel(420, 600), budgetLevel(540, 600), budgetLevel(600, 600), budgetLevel(1, null)]).toEqual(["ok", "signal_70", "defer_90", "stop_100", "n/a"]);
  });
});

describe("R10/R11 harmonogram Europe/Warsaw", () => {
  it("R11 07:00 lokalnie = 06:00Z zimą i 05:00Z latem (przejście 28.03.2027)", () => {
    const slots = slotsBetween("0 7 * * *", new Date("2027-03-26T00:00:00Z"), new Date("2027-03-30T00:00:00Z")).map((d) => d.toISOString());
    expect(slots).toEqual(["2027-03-26T06:00:00.000Z", "2027-03-27T06:00:00.000Z", "2027-03-28T05:00:00.000Z", "2027-03-29T05:00:00.000Z"]);
  });
  it("R11 godzina powtórzona jesienią (31.10.2027 02:30) => dokładnie jeden run; nieistniejąca wiosną => jeden run", () => {
    expect(slotsBetween("30 2 * * *", new Date("2027-10-30T12:00:00Z"), new Date("2027-10-31T12:00:00Z"))).toHaveLength(1);
    expect(slotsBetween("30 2 * * *", new Date("2027-03-27T12:00:00Z"), new Date("2027-03-28T12:00:00Z"))).toHaveLength(1);
  });
  it("dni tygodnia: SEO pn–pt 07:30, content pn/śr/pt", () => {
    const seo = slotsBetween("30 7 * * 1-5", new Date("2026-11-22T00:00:00Z"), new Date("2026-11-29T00:00:00Z"));
    expect(seo).toHaveLength(5);
    const content = slotsBetween("0 9 * * 1,3,5", new Date("2026-11-22T00:00:00Z"), new Date("2026-11-29T00:00:00Z"));
    expect(content.map((d) => d.toISOString())).toEqual(["2026-11-23T08:00:00.000Z", "2026-11-25T08:00:00.000Z", "2026-11-27T08:00:00.000Z"]);
    expect(nextSlot("0 10 * * 2,4", new Date("2026-11-22T12:00:00Z"))?.toISOString()).toBe("2026-11-24T09:00:00.000Z");
  });
  it("R10 po tygodniu przerwy: tylko najnowszy slot w oknie, bez nadrabiania", async () => {
    expect(latestDueSlot("0 7 * * *", new Date("2026-12-08T06:20:00Z"), 60)?.toISOString()).toBe("2026-12-08T06:00:00.000Z");
    expect(latestDueSlot("0 7 * * *", new Date("2026-12-08T09:00:00Z"), 60)).toBeNull();
    const store = tempStore();
    await store.transact((s) => { s.audit.push({ at: "2026-12-01T06:00:00Z", actor: "d", entity: "job", entityId: "ops_shadow_tick", action: "job_run", meta: {} }); });
    const r = await runShadowTick(store, { now: new Date("2026-12-08T06:20:00Z"), dispatcherId: "d1", policy: testPolicy("shadow"), env: ENV });
    expect(r.ran.map((x) => x.role)).toEqual(["knowledge"]); // tylko slot 07:00 z dziś
    expect(r.missedSlotsNotCaughtUp).toBeGreaterThan(20);
    expect(store.read().ops.jobs).toHaveLength(1);
  });
  it("ops/config/schedule.json: zgodny z OPS_SCHEDULE, jeden dispatcher na zadanie (lokalne live dla content/build/seo, chmura shadow dla reszty), cron UTC = czas lokalny zimą, usługi publikacji wyłączone", () => {
    const cfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "ops", "config", "schedule.json"), "utf8"));
    type Job = { job_key: string; cron_local: string; cron_utc: string; routine_id?: string; scheduled_task_id?: string; dispatcher: string; enabled: boolean };
    expect(cfg.jobs.map((j: Job) => [j.job_key, j.cron_local])).toEqual(OPS_SCHEDULE.map((e) => [e.jobKey, e.cronLocal]));
    expect(cfg.dispatcher).toBe("hybrid");
    // Każde zadanie ma dokładnie jeden dispatcher: albo lokalne zadanie zaplanowane, albo rutynę chmurową (nigdy oba).
    for (const j of cfg.jobs as Job[]) expect(!!j.scheduled_task_id !== !!j.routine_id, j.job_key).toBe(true);
    expect((cfg.jobs as Job[]).filter((j) => j.scheduled_task_id).map((j) => j.job_key).sort()).toEqual(["zoo24-ops-build", "zoo24-ops-content", "zoo24-ops-seo"]);
    // cron_utc musi trafiać w ten sam slot co cron_local w tygodniu zimowym (CET)
    const from = new Date("2026-11-30T00:00:00Z"), to = new Date("2026-12-07T00:00:00Z");
    for (const j of cfg.jobs as Job[]) {
      const local = slotsBetween(j.cron_local, from, to).map((d) => d.toISOString());
      const [m, h, , , dow] = j.cron_utc.split(" ");
      const utc = local.map((iso) => new Date(iso)).every((d) => d.getUTCMinutes() === +m && d.getUTCHours() === +h);
      expect(utc, j.job_key).toBe(true);
      expect(local.length, `${j.job_key} dow ${dow}`).toBeGreaterThan(0);
    }
    expect(cfg.non_agent_services.every((j: { enabled: boolean }) => j.enabled === false)).toBe(true);
  });
});

describe("R08/R09 pauza", () => {
  class Provider implements ProviderScheduleAdapter {
    readonly kind = "mock" as const;
    constructor(private items: { id: string; platform: "facebook" | "instagram" }[], private unsupported: string[]) {}
    async listScheduled() { return this.items; }
    async cancel(id: string) { return this.unsupported.includes(id) ? ("unsupported" as const) : ("cancelled" as const); }
  }
  it("R09 post zaplanowany u dostawcy, anulowanie niepotwierdzone => partially_paused z listą ID", async () => {
    const store = tempStore();
    const r = await pauseAll(store, "owner", new Provider([{ id: "fb_1", platform: "facebook" }, { id: "ig_9", platform: "instagram" }], ["ig_9"]));
    expect(r.state).toBe("partially_paused");
    expect(r.cancelledProvider).toEqual(["fb_1"]);
    expect(r.remainingProviderIds).toEqual(["ig_9"]);
    expect(r.operatorInstruction).toMatch(/ig_9/);
  });
  it("R09 brak dostępu do harmonogramu dostawcy => partially_paused, nigdy fałszywe „wstrzymano wszystko”", async () => {
    const r = await pauseAll(tempStore(), "owner", new NoProviderAccess());
    expect(r.state).toBe("partially_paused");
    expect(r.operatorInstruction).toMatch(/PILNE/);
  });
  it("R08 pełna pauza: kill switch, kolejka anulowana, publisher MOCK nic nie wysyła; role read-only działają; wznowienie tylko człowiek", async () => {
    const store = tempStore();
    const r = await pauseAll(store, "owner", new Provider([], []));
    expect(r.state).toBe("paused");
    const s = store.read();
    expect(s.settings.publishEnabled).toBe(false);
    expect(s.ops.mode).toBe("paused");
    const tick = await runShadowTick(store, { now: NOW, dispatcherId: "d", policy: testPolicy("shadow"), env: ENV, manual: true });
    expect(tick.ran).toHaveLength(6); // odczyt/monitoring dalej pracuje
    expect(tick.mode).toBe("paused");
    await expect(resumeOps(store, "zoo24-ops-social")).rejects.toThrow("RESUME_REQUIRES_HUMAN");
    await resumeOps(store, "owner");
    expect(store.read().ops.mode).toBe("shadow");
  });
});

describe("P04 polityka chroniona", () => {
  it("agent nie może zapisać polityki ani podnieść budżetu; polityka w repo podpisana live_scoped v4 (CMS, build, SEO, social po podłączeniu Meta)", () => {
    const dir = fs.mkdtempSync(path.join(process.cwd(), ".data", "policy-test-"));
    try {
      const p = testPolicy("live_scoped");
      p.budgets.approved_monthly_extra_ai_automation = 5000;
      for (const actor of ["zoo24-ops-growth", "agent:x", "worker-1", "dispatcher:panel", "claude"]) {
        expect(() => writePolicy(dir, actor, p, { ownerConfirmed: true })).toThrow(PolicyError);
      }
      expect(() => writePolicy(dir, "owner", p, { ownerConfirmed: false })).toThrow("OWNER_CONFIRMATION_REQUIRED");
      expect(() => writePolicy(dir, "owner", p, { ownerConfirmed: true })).toThrow("BUDGET_CHANGE_REQUIRES_OWNER_SIGNATURE");
      expect(fs.existsSync(path.join(dir, "ops", "config", "activation.json"))).toBe(false);
    } finally { fs.rmSync(dir, { recursive: true, force: true }); }
    // Polityka w repo v4 (decyzja właściciela 2026-11-25): live_scoped dla CMS, wdrożeń kodu, poprawek SEO i social.
    const repo = loadPolicy()!;
    expect(repo.status).toBe("LIVE_SCOPED_OPS_V4");
    expect(isPolicyApproved(repo)).toBe(true);
    expect(repo.mode).toBe("live_scoped");
    expect(repo.review.ai_editor_excluded_categories).toEqual(expect.arrayContaining(["welfare", "nutrition", "environment", "transport"]));
    expect(Object.entries(repo.autonomy).filter(([, v]) => v).map(([k]) => k).sort()).toEqual(["apply_low_risk_seo_patch", "auto_deploy_low_risk_code", "create_drafts", "publish_human_reviewed_content", "publish_reviewed_social_versions", "read_approved_sources"]);
    // Nadal wyłączone: e-mail, DM, reklamy, FAQ, zmiana konfiguracji chronionej.
    for (const k of ["send_email_campaigns", "send_private_messages", "activate_paid_ads", "reply_exact_public_faq", "change_protected_configuration"] as const) expect(repo.autonomy[k], k).toBe(false);
    expect(repo.review.ai_editor_allowed).toBe(true);
    expect(repo.review.ai_editor_excluded_categories).toEqual(expect.arrayContaining(["health", "legal", "sponsored"]));
    expect(repo.budgets.paid_advertising_monthly).toBe(0);
    expect(repo.budgets.approved_monthly_extra_ai_automation).toBe(0); // tylko w limicie subskrypcji
    expect(effectiveMode(repo, "design")).toBe("live_scoped");
    // Social: dozwolone, ale bez ID strony/konta Meta gateway nie ma zasobu docelowego (blokada do D-03/D-11).
    expect(repo.resources.facebook_page_id).toBeNull();
    expect(repo.resources.instagram_account_id).toBeNull();
    expect(effectiveMode(repo, "paused")).toBe("paused");
    expect(isAgentIdentity("owner-local")).toBe(false);
  });
  it("podpis właściciela niezgodny z treścią (edytowana polityka) => najwyżej shadow", () => {
    const p = testPolicy("live_scoped", { signed: true });
    expect(effectiveMode(p, "design")).toBe("live_scoped");
    p.caps.facebook_posts_per_week = 50;
    expect(effectiveMode(p, "design")).toBe("shadow");
  });
});

describe("dispatcher shadow sześciu ról", () => {
  it("przebieg: 6 ról, wyniki job-result.v1 w rejestrze, zero wywołań adaptera, drugi przebieg nie dubluje", async () => {
    const store = tempStore();
    const adapter = new MockMetaAdapter();
    const r1 = await runShadowTick(store, { now: NOW, dispatcherId: "d1", policy: testPolicy("shadow"), env: ENV, manual: true });
    expect(r1.refused).toBeNull();
    expect(r1.ran.map((x) => x.role).sort()).toEqual([...OPS_ROLES].sort());
    const r2 = await runShadowTick(store, { now: NOW, dispatcherId: "d1", policy: testPolicy("shadow"), env: ENV, manual: true });
    expect(r2.ran).toHaveLength(0);
    expect(r2.skipped.every((x) => x.reason === "already_done_or_leased")).toBe(true);
    const s = store.read();
    expect(s.ops.results).toHaveLength(6);
    expect(s.ops.results.every((x) => x.schema_version === "zoo24.ops.job-result.v1" && x.external_actions.length === 0 && x.mode === "shadow")).toBe(true);
    expect(s.ops.receipts).toHaveLength(0);
    expect(adapter.calls).toHaveLength(0);
    expect(s.socialPosts.some((p) => p.status === "published")).toBe(false);
  });
  it("P06 brak GSC => SEO raportuje blocked_access dla odczytu, metryka N/A (nie 0); pozostałe role pracują", async () => {
    const store = tempStore();
    await runShadowTick(store, { now: NOW, dispatcherId: "d1", policy: testPolicy("shadow"), env: ENV, manual: true });
    const seo = store.read().ops.results.find((x) => x.role === "seo")!;
    expect(seo.checks.find((c) => c.name === "gsc_read")?.status).toBe("blocked");
    expect(seo.metrics.find((m) => m.name === "gsc_clicks")?.value).toBeNull();
    const content = store.read().ops.results.find((x) => x.role === "content")!;
    expect(content.status).toBe("needs_human"); // 3 artykuły czekają na redaktora
    expect(content.human_decisions_required[0]).toMatch(/Redaktor/);
  });
  it("redaktor-AI z polityki (claude-ai-editor) nie odblokowuje publikacji: check editor_assigned = blocked", async () => {
    const store = tempStore();
    await runShadowTick(store, { now: NOW, dispatcherId: "d1", policy: testPolicy("shadow"), env: { ...ENV, editorId: "claude-ai-editor" }, manual: true });
    const content = store.read().ops.results.find((x) => x.role === "content")!;
    expect(content.checks.find((c) => c.name === "editor_assigned")).toMatchObject({ status: "blocked" });
  });
  it("tylko jeden dispatcher naraz; w canary/live dispatcher shadow odmawia", async () => {
    const store = tempStore();
    await store.transact((s) => { s.ops.dispatcher = { id: "inny", leaseUntil: new Date(NOW.getTime() + 60_000).toISOString() }; });
    expect((await runShadowTick(store, { now: NOW, dispatcherId: "d1", policy: testPolicy("shadow"), env: ENV, manual: true })).refused).toBe("DISPATCHER_ALREADY_ACTIVE");
    const live = await runShadowTick(tempStore(), { now: NOW, dispatcherId: "d1", policy: testPolicy("live_scoped", { signed: true }), env: ENV, manual: true });
    expect(live.refused).toBe("NOT_SHADOW_MODE");
  });
});
