// Polityka aktywacji (ops/config/activation.json). Plik chroniony: role zoo24-ops-* nie mogą go zmieniać
// (P04) — zmiana tylko przez człowieka-właściciela, z nowym hashem i ADR. Brak/nieważna polityka => design.
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import type { OpsMode } from "./types";

export interface ActivationPolicy {
  schema_version: "zoo24.ops.policy.v1";
  status: string; // "INACTIVE_PENDING_OWNER_APPROVAL" dopóki brak zgody
  mode: OpsMode;
  enabled: boolean;
  owner_approval: { approved: boolean; approved_by: string | null; approved_at: string | null; policy_hash: string | null };
  resources: Record<string, string | null>;
  budgets: { currency: "PLN"; approved_monthly_extra_ai_automation: number | null; approved_per_run: number | null; paid_advertising_monthly: number };
  autonomy: Record<string, boolean>;
  caps: Record<string, number>;
  review: { editor_id: string | null; backup_editor_id: string | null; new_factual_content_requires_human_review: boolean };
  alerts: { operator_id: string | null; approved_destination: string | null; critical_delivery_verified: boolean };
  capabilities_by_channel: Record<string, { can_publish: boolean; can_edit_caption: boolean | null; can_delete_media: boolean | null; can_cancel_schedule: boolean | null }>;
  [k: string]: unknown;
}

export const POLICY_PATH = path.join("ops", "config", "activation.json");

/** Tożsamość procesu agenta/AI — nigdy nie może pełnić roli redaktora ani zmieniać polityki (P04, P08). */
export function isAgentIdentity(actor: string | null | undefined): boolean {
  if (!actor) return true; // brak tożsamości traktujemy jak niezaufany proces
  return /^(agent:|ai:|claude|zoo24-ops-|zoo24-(product|seo|social|analytics|architect|builder|qa|growth|compliance)\b|job:|worker-|dispatcher)/i.test(actor.trim());
}

export function policyHash(p: ActivationPolicy): string {
  const { owner_approval: _a, ...rest } = p;
  return createHash("sha256").update(JSON.stringify(rest)).digest("hex");
}

/** Tryb efektywny: live wymaga zatwierdzenia przez człowieka i zgodnego hasha; inaczej najwyżej shadow. */
export function effectiveMode(p: ActivationPolicy | null, stateMode: OpsMode): OpsMode {
  if (stateMode === "paused" || p?.mode === "paused") return "paused";
  if (!p) return "design";
  if (p.mode === "canary" || p.mode === "live_scoped") return isPolicyApproved(p) ? p.mode : "shadow";
  return p.mode;
}

export function isPolicyApproved(p: ActivationPolicy | null): boolean {
  return !!p && p.enabled && p.owner_approval.approved && !isAgentIdentity(p.owner_approval.approved_by) &&
    p.owner_approval.policy_hash === policyHash(p);
}

export function loadPolicy(root = process.cwd()): ActivationPolicy | null {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(root, POLICY_PATH), "utf8")) as ActivationPolicy;
    return raw.schema_version === "zoo24.ops.policy.v1" ? raw : null;
  } catch {
    return null;
  }
}

export class PolicyError extends Error {
  constructor(public code: string) { super(code); this.name = "PolicyError"; }
}

/**
 * Jedyna ścieżka zapisu polityki w kodzie. Odrzuca procesy agentów/jobów (techniczna blokada, nie ostrzeżenie).
 * Zapis przez człowieka wymaga jawnego potwierdzenia i aktualizuje policy_hash.
 */
export function writePolicy(root: string, actor: string, next: ActivationPolicy, opts: { ownerConfirmed: boolean }): void {
  if (isAgentIdentity(actor)) throw new PolicyError("POLICY_WRITE_FORBIDDEN_FOR_AGENT");
  if (!opts.ownerConfirmed) throw new PolicyError("OWNER_CONFIRMATION_REQUIRED");
  const prev = loadPolicy(root);
  const raisedBudget =
    (next.budgets.approved_monthly_extra_ai_automation ?? 0) > (prev?.budgets.approved_monthly_extra_ai_automation ?? 0);
  if (raisedBudget && next.owner_approval.approved_by !== actor) throw new PolicyError("BUDGET_CHANGE_REQUIRES_OWNER_SIGNATURE");
  const signed: ActivationPolicy = { ...next, owner_approval: { ...next.owner_approval, policy_hash: policyHash(next) } };
  fs.mkdirSync(path.join(root, "ops", "config"), { recursive: true });
  fs.writeFileSync(path.join(root, POLICY_PATH), JSON.stringify(signed, null, 2) + "\n", "utf8");
}
