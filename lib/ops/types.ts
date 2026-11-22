// ZOO24 — etap operacyjny (zoo24-ops v1.0). Trwały rejestr zadań sześciu ról, receipts, dowody i pauza.
// Stan trzymany w tym samym store co aplikacja (`AppState.ops`); polityka aktywacji — osobny plik
// `ops/config/activation.json`, którego role nie mogą zapisywać (lib/ops/policy.ts).

export type OpsMode = "design" | "shadow" | "canary" | "live_scoped" | "paused";
export type OpsRole = "build" | "content" | "growth" | "knowledge" | "social" | "seo";
export const OPS_ROLES: OpsRole[] = ["build", "content", "growth", "knowledge", "social", "seo"];

export type OpsJobStatus =
  | "queued" | "leased" | "running" | "produced" | "validated" | "ready" | "executing" | "verified" | "done"
  | "blocked_access" | "blocked_policy" | "blocked_dependency" | "needs_human" | "retry_wait"
  | "reconciling_unknown_outcome" | "failed" | "cancelled" | "quarantined" | "skipped_stale";

export interface OpsJob {
  jobId: string;
  dedupeKey: string; // np. "seo:2026-11-23T06:30:00.000Z" — jeden slot harmonogramu = jeden job
  ownerRole: OpsRole;
  status: OpsJobStatus;
  scheduledAtUtc: string;
  leaseOwner: string | null;
  leaseUntil: string | null;
  fencingToken: number | null; // monotoniczny w całym rejestrze
  attempt: number;
  parentId: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpsCheck { name: string; status: "pass" | "fail" | "blocked" | "n/a"; detail: string }
export interface OpsMetric {
  name: string; value: number | null; unit: string; source: string | null;
  period_start: string | null; period_end: string | null;
  data_status: "available" | "export_manual" | "unavailable"; note: string;
}

/** Kontrakt wyniku roli — zgodny z zoo24-ops/ops/templates/job-result.example.json. */
export interface OpsJobResult {
  schema_version: "zoo24.ops.job-result.v1";
  job_id: string;
  role: OpsRole;
  mode: OpsMode;
  policy_version: string | null;
  status: "done" | "produced" | "blocked" | "needs_human" | "failed";
  reason: string | null;
  artifacts: { id: string; type: string; version: string | null; note: string }[];
  checks: OpsCheck[];
  external_actions: { op: string; outcome: string; receipt_id: string | null }[];
  metrics: OpsMetric[];
  cost: { value: number | null; currency: string | null; status: "measured" | "unknown" | "none" };
  next_tasks: string[];
  human_decisions_required: string[];
  finished_at: string;
}

export interface OpsReceipt {
  operationKey: string; // unikalny klucz operacji (dedupe)
  op: string;
  role: OpsRole;
  jobDedupeKey: string;
  resource: string;
  artifactId: string;
  artifactHash: string;
  status: "started" | "succeeded" | "unknown" | "retry_wait" | "failed" | "dry_run";
  externalObjectId: string | null;
  url: string | null;
  verifiedAt: string | null;
  at: string;
}

export type EvidenceStatus = "candidate" | "approved" | "stale" | "disputed" | "revoked";
export interface OpsEvidence {
  evidenceId: string;
  sourceUrl: string;
  publisher: string;
  title: string;
  retrievedAtUtc: string;
  claimText: string;
  licenseBasis: "own" | "quote_summary" | "licensed" | "public_domain" | "unknown";
  status: EvidenceStatus;
  reviewerId: string | null;
  reviewedAt: string | null;
  validUntil: string | null;
  usedByArtifacts: string[];
}

export interface OpsState {
  mode: OpsMode;
  fencingSeq: number;
  jobs: OpsJob[];
  results: OpsJobResult[];
  receipts: OpsReceipt[];
  evidence: OpsEvidence[];
  budget: { periodKey: string; currency: "PLN"; reserved: { key: string; amount: number }[]; spent: number };
  dispatcher: { id: string; leaseUntil: string } | null;
  pause: { state: "running" | "paused" | "partially_paused"; at: string | null; remainingProviderIds: string[] };
  correctionTasks: { artifactId: string; reason: string; createdAt: string }[];
}

export function emptyOpsState(): OpsState {
  return {
    mode: "design",
    fencingSeq: 0,
    jobs: [],
    results: [],
    receipts: [],
    evidence: [],
    budget: { periodKey: "", currency: "PLN", reserved: [], spent: 0 },
    dispatcher: null,
    pause: { state: "running", at: null, remainingProviderIds: [] },
    correctionTasks: [],
  };
}
