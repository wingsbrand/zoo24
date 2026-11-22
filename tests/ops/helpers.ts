import fs from "node:fs";
import path from "node:path";
import type { FileStore } from "@/lib/store/file-store";
import { policyHash, type ActivationPolicy } from "@/lib/ops/policy";
import type { ActionRequest, Executor } from "@/lib/ops/gateway";
import { claim, enqueue } from "@/lib/ops/registry";
import type { OpsMode } from "@/lib/ops/types";

const BASE = JSON.parse(fs.readFileSync(path.join(process.cwd(), "ops", "config", "activation.json"), "utf8")) as ActivationPolicy;

/** Polityka testowa. `signed` = podpisana przez człowieka z poprawnym hashem (tylko w testach). */
export function testPolicy(mode: OpsMode, opts: { signed?: boolean; budget?: number | null; autonomy?: Record<string, boolean> } = {}): ActivationPolicy {
  const p: ActivationPolicy = structuredClone(BASE);
  p.mode = mode;
  p.enabled = !!opts.signed;
  p.resources = { ...p.resources, facebook_page_id: "TEST-PAGE-1", instagram_account_id: "TEST-IG-1", production_environment_id: "TEST-ENV" };
  p.budgets.approved_monthly_extra_ai_automation = opts.budget === undefined ? 600 : opts.budget;
  p.autonomy = { ...p.autonomy, publish_reviewed_social_versions: true, publish_human_reviewed_content: true, ...opts.autonomy };
  p.owner_approval = { approved: false, approved_by: null, approved_at: null, policy_hash: null };
  if (opts.signed) {
    p.owner_approval = { approved: true, approved_by: "owner-test", approved_at: "2026-11-22T10:00:00Z", policy_hash: null };
    p.owner_approval.policy_hash = policyHash(p);
  }
  return p;
}

export function socialRequest(dedupeKey: string, token: number, over: Partial<ActionRequest> = {}): ActionRequest {
  return {
    op: "social.publish_approved_version", role: "social", jobDedupeKey: dedupeKey, fencingToken: token,
    target: { kind: "facebook_page_id", id: "TEST-PAGE-1" },
    artifact: { id: "post:soc-007", contentHash: "h1", approvedHash: "h1", authorId: "zoo24-ops-social", reviewedBy: "editor-anna", evidenceIds: [] },
    estimatedCostPln: 1, payload: { postId: "soc-007" },
    ...over,
  };
}

export async function leasedJob(store: FileStore, dedupeKey = "social:2026-12-01T08:00:00.000Z", worker = "w1", now = new Date("2026-12-01T08:00:10Z")) {
  await store.transact((s) => { enqueue(s, { dedupeKey, role: "social", scheduledAtUtc: "2026-12-01T08:00:00.000Z" }, now); });
  const token = await claim(store, dedupeKey, worker, now);
  return { dedupeKey, token: token! };
}

/** Executor-spy: liczy wywołania; scenariusze błędów kolejno z `script`. */
export class SpyExecutor implements Executor {
  calls = 0;
  lookups = 0;
  remote = new Map<string, string>();
  constructor(public script: ({ cls: "timeout" | "retryable" | "permanent" | "auth"; code: string; landed?: boolean; retryAfterSeconds?: number })[] = [], public lookupUnknown = false) {}
  async execute(_req: ActionRequest, key: string) {
    this.calls++;
    const f = this.script.shift();
    if (f) { if (f.landed) this.remote.set(key, `ext-${this.calls}`); throw f; }
    this.remote.set(key, `ext-${this.calls}`);
    return { externalObjectId: `ext-${this.calls}`, url: `https://example.test/p/${this.calls}` };
  }
  async lookup(key: string) {
    this.lookups++;
    if (this.lookupUnknown) return { state: "unknown" as const };
    const id = this.remote.get(key);
    return id ? { state: "found" as const, externalObjectId: id, url: null } : { state: "absent" as const };
  }
}
