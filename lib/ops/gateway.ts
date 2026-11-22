// Kontrolowana usługa wykonująca zapisy zewnętrzne (OPERATIONS.md §6). Role NIE dostają surowych
// tokenów ani narzędzia "wyślij dowolny request": tylko typowane operacje z allowlisty, sprawdzane
// po stronie serwera: fencing, pauza, zasób z polityki, aktualna zgoda człowieka, dowody, budżet,
// unikalny klucz operacji i rekoncyliacja. W trybie design/shadow executor NIGDY nie jest wywoływany.
import { createHash } from "node:crypto";
import type { Store } from "../store/file-store";
import type { AppState } from "../types";
import { assertFence, RegistryError } from "./registry";
import { effectiveMode, isAgentIdentity, type ActivationPolicy } from "./policy";
import type { OpsMode, OpsReceipt, OpsRole } from "./types";

export type GatewayOp = "cms.publish_approved_version" | "social.publish_approved_version" | "seo.apply_small_patch" | "deploy.promote_reviewed_sha";
type ResourceKind = "site_origin" | "facebook_page_id" | "instagram_account_id" | "production_environment_id";

const OPS: Record<GatewayOp, { roles: OpsRole[]; resources: ResourceKind[]; autonomy: string; payload: string[] }> = {
  "cms.publish_approved_version": { roles: ["content"], resources: ["site_origin"], autonomy: "publish_human_reviewed_content", payload: ["slug", "publishAtUtc"] },
  "social.publish_approved_version": { roles: ["social"], resources: ["facebook_page_id", "instagram_account_id"], autonomy: "publish_reviewed_social_versions", payload: ["postId", "publishAtUtc"] },
  "seo.apply_small_patch": { roles: ["seo"], resources: ["site_origin"], autonomy: "apply_low_risk_seo_patch", payload: ["path", "field", "patchId"] },
  "deploy.promote_reviewed_sha": { roles: ["build"], resources: ["production_environment_id"], autonomy: "auto_deploy_low_risk_code", payload: ["sha", "previewUrl"] },
};
export const GATEWAY_OPS = Object.keys(OPS) as GatewayOp[];

export interface ActionRequest {
  op: string;
  role: OpsRole;
  jobDedupeKey: string;
  fencingToken: number;
  target: { kind: string; id: string };
  artifact: { id: string; contentHash: string; approvedHash: string | null; authorId: string; reviewedBy: string | null; evidenceIds: string[] };
  flags?: { sponsored?: boolean; health?: boolean; privateMessage?: boolean; email?: boolean; paidMedia?: boolean };
  estimatedCostPln: number;
  payload: Record<string, unknown>;
}

export interface ExecutorError { cls: "timeout" | "retryable" | "permanent" | "auth"; code: string; retryAfterSeconds?: number }
export interface Executor {
  execute(req: ActionRequest, operationKey: string): Promise<{ externalObjectId: string; url: string | null }>;
  /** Odczyt kontrolny po stronie dostawcy: czy operacja o tym kluczu istnieje? */
  lookup(operationKey: string): Promise<{ state: "found"; externalObjectId: string; url: string | null } | { state: "absent" } | { state: "unknown" }>;
}

export type GatewayStatus = "rejected" | "needs_human" | "blocked_access" | "blocked_policy" | "blocked_dependency" |"dry_run" | "executed" | "already_done" | "unknown_outcome" | "retry_wait" | "failed";
export interface GatewayOutcome { status: GatewayStatus; reasons: string[]; mode: OpsMode; operationKey: string | null; receipt: OpsReceipt | null; retryAfterSeconds?: number }

export const operationKey = (r: ActionRequest) =>
  createHash("sha256").update([r.op, r.target.kind, r.target.id, r.artifact.id, r.artifact.contentHash].join("|")).digest("hex");

export function budgetPeriod(now: Date): string { return now.toISOString().slice(0, 7); }

/** Atomowa rezerwacja budżetu (R07). Zwraca false przy braku zatwierdzonego limitu lub jego przekroczeniu. */
export function reserveInState(s: AppState, key: string, amount: number, capPln: number | null, now: Date): "ok" | "BUDGET_NOT_APPROVED" | "BUDGET_CAP" {
  if (capPln === null) return "BUDGET_NOT_APPROVED";
  const b = s.ops.budget;
  if (b.periodKey !== budgetPeriod(now)) { b.periodKey = budgetPeriod(now); b.reserved = []; b.spent = 0; }
  if (b.reserved.some((r) => r.key === key)) return "ok";
  const used = b.spent + b.reserved.reduce((a, r) => a + r.amount, 0);
  if (used + amount > capPln) return "BUDGET_CAP";
  b.reserved.push({ key, amount });
  return "ok";
}
export async function reserveBudget(store: Store, key: string, amount: number, capPln: number | null, now: Date) {
  return store.transact((s) => reserveInState(s, key, amount, capPln, now));
}
/** Próg budżetu: 70% sygnał, 90% wstrzymaj eksperymenty, 100% stop nowych płatnych wywołań. */
export function budgetLevel(used: number, cap: number | null): "n/a" | "ok" | "signal_70" | "defer_90" | "stop_100" {
  if (cap === null || cap <= 0) return "n/a";
  const f = used / cap;
  return f >= 1 ? "stop_100" : f >= 0.9 ? "defer_90" : f >= 0.7 ? "signal_70" : "ok";
}

export async function executeAction(
  req: ActionRequest,
  deps: { store: Store; policy: ActivationPolicy | null; executor: Executor; now: Date },
): Promise<GatewayOutcome> {
  const { store, policy, executor, now } = deps;
  const out = (status: GatewayStatus, reasons: string[], mode: OpsMode, key: string | null = null, receipt: OpsReceipt | null = null): GatewayOutcome => ({ status, reasons, mode, operationKey: key, receipt });
  const spec = OPS[req.op as GatewayOp];
  if (!spec) return out("rejected", ["OP_NOT_ALLOWED"], "design");
  if (!spec.roles.includes(req.role)) return out("rejected", ["ROLE_NOT_ALLOWED"], "design");
  const extra = Object.keys(req.payload).filter((k) => !spec.payload.includes(k));
  if (extra.length) return out("rejected", [`PAYLOAD_NOT_ALLOWED:${extra.join(",")}`], "design");
  const f = req.flags ?? {};
  const human = [f.sponsored && "SPONSORED", f.health && "HEALTH_CLAIM", f.privateMessage && "PRIVATE_MESSAGE", f.email && "EMAIL_CAMPAIGN", f.paidMedia && "PAID_MEDIA"].filter(Boolean) as string[];
  if (human.length) return out("needs_human", human, "design");
  if (!spec.resources.includes(req.target.kind as ResourceKind)) return out("rejected", ["RESOURCE_KIND_NOT_ALLOWED"], "design");
  const key = operationKey(req);

  type Pre = { go: false; o: GatewayOutcome } | { go: true; mode: OpsMode; reconcile: boolean };
  const pre: Pre = await store.transact((s): Pre => {
    const mode = effectiveMode(policy, s.ops.mode);
    try { assertFence(s, req.jobDedupeKey, req.fencingToken); } catch (e) {
      return { go: false, o: out("rejected", [e instanceof RegistryError ? e.code : "FENCE_ERROR"], mode, key) };
    }
    if (mode === "paused") return { go: false, o: out("blocked_policy", ["PAUSED"], mode, key) };
    const reasons: string[] = [];
    const configured = policy?.resources[req.target.kind] ?? null;
    if (configured === null) return { go: false, o: out("blocked_access", [`RESOURCE_NOT_CONFIGURED:${req.target.kind}`], mode, key) };
    if (configured !== req.target.id) reasons.push("RESOURCE_NOT_IN_POLICY");
    const a = req.artifact;
    if (!a.approvedHash || a.approvedHash !== a.contentHash) reasons.push("APPROVAL_NOT_CURRENT");
    if (!a.reviewedBy || isAgentIdentity(a.reviewedBy)) reasons.push("HUMAN_REVIEW_MISSING");
    else if (a.reviewedBy === a.authorId) reasons.push("SELF_APPROVAL");
    if (reasons.length) return { go: false, o: out("rejected", reasons, mode, key) };
    for (const id of a.evidenceIds) {
      const ev = s.ops.evidence.find((e) => e.evidenceId === id);
      if (!ev || ev.status !== "approved" || (ev.validUntil && new Date(ev.validUntil) <= now)) reasons.push(`EVIDENCE_NOT_READY:${id}`);
    }
    if (reasons.length) return { go: false, o: out("blocked_dependency", reasons, mode, key) };
    const prior = s.ops.receipts.filter((r) => r.operationKey === key && r.status !== "dry_run");
    const ok = prior.find((r) => r.status === "succeeded");
    if (ok) return { go: false, o: out("already_done", ["ALREADY_SUCCEEDED"], mode, key, ok) };
    if (prior.some((r) => r.status === "failed")) return { go: false, o: out("needs_human", ["PRIOR_PERMANENT_FAILURE_NO_AUTO_RETRY"], mode, key) };
    const reconcile = prior.some((r) => r.status === "started" || r.status === "unknown" || r.status === "retry_wait");
    if (mode === "design" || mode === "shadow") {
      const r: OpsReceipt = { operationKey: key, op: req.op, role: req.role, jobDedupeKey: req.jobDedupeKey, resource: `${req.target.kind}:${req.target.id}`, artifactId: a.id, artifactHash: a.contentHash, status: "dry_run", externalObjectId: null, url: null, verifiedAt: null, at: now.toISOString() };
      s.ops.receipts.push(r);
      return { go: false, o: out("dry_run", ["SHADOW_NO_EXTERNAL_WRITE"], mode, key, r) };
    }
    if (!policy?.autonomy[spec.autonomy]) return { go: false, o: out("blocked_policy", [`AUTONOMY_NOT_GRANTED:${spec.autonomy}`], mode, key) };
    const b = reserveInState(s, key, req.estimatedCostPln, policy.budgets.approved_monthly_extra_ai_automation, now);
    if (b !== "ok") return { go: false, o: out("blocked_policy", [b], mode, key) };
    if (!reconcile) s.ops.receipts.push({ operationKey: key, op: req.op, role: req.role, jobDedupeKey: req.jobDedupeKey, resource: `${req.target.kind}:${req.target.id}`, artifactId: a.id, artifactHash: a.contentHash, status: "started", externalObjectId: null, url: null, verifiedAt: null, at: now.toISOString() });
    return { go: true, mode, reconcile };
  });
  if (!pre.go) return pre.o;

  const finish = (status: OpsReceipt["status"], ext: { externalObjectId: string; url: string | null } | null, verified: boolean) =>
    store.transact((s) => {
      const r = s.ops.receipts.filter((x) => x.operationKey === key && x.status !== "dry_run").pop()!;
      r.status = status;
      if (ext) { r.externalObjectId = ext.externalObjectId; r.url = ext.url; }
      if (verified) r.verifiedAt = now.toISOString();
      return structuredClone(r);
    });

  // Poprzednia próba bez potwierdzonego skutku: najpierw sprawdź stan u dostawcy (R03/R04).
  if (pre.reconcile) {
    const l = await executor.lookup(key);
    if (l.state === "found") return out("already_done", ["RECONCILED_FOUND"], pre.mode, key, await finish("succeeded", l, true));
    if (l.state === "unknown") return out("unknown_outcome", ["CANNOT_DETERMINE_REMOTE_STATE"], pre.mode, key, await finish("unknown", null, false));
  }
  try {
    const res = await executor.execute(req, key);
    const check = await executor.lookup(key).catch(() => ({ state: "unknown" as const }));
    return out("executed", check.state === "found" ? ["VERIFIED_READBACK"] : ["READBACK_PENDING"], pre.mode, key, await finish("succeeded", res, check.state === "found"));
  } catch (err) {
    const e = err as ExecutorError;
    if (e?.cls === "timeout") {
      const l = await executor.lookup(key).catch(() => ({ state: "unknown" as const }));
      if (l.state === "found") return out("executed", ["RECONCILED_AFTER_TIMEOUT"], pre.mode, key, await finish("succeeded", l, true));
      return out("unknown_outcome", ["TIMEOUT_UNCONFIRMED"], pre.mode, key, await finish("unknown", null, false));
    }
    if (e?.cls === "retryable") {
      const attempts = (await store.transact((s) => s.ops.jobs.find((j) => j.dedupeKey === req.jobDedupeKey)?.attempt ?? 1));
      if (attempts >= 3) return out("failed", [e.code, "MAX_ATTEMPTS"], pre.mode, key, await finish("failed", null, false));
      await finish("retry_wait", null, false);
      return { ...out("retry_wait", [e.code], pre.mode, key), retryAfterSeconds: e.retryAfterSeconds ?? 60 * 2 ** (attempts - 1) };
    }
    return out("failed", [e?.code ?? "UNKNOWN", "NO_AUTOMATIC_RETRY"], pre.mode, key, await finish("failed", null, false));
  }
}
