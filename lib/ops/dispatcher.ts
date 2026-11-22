// Jeden dispatcher (lease w rejestrze) uruchamia przebiegi shadow sześciu ról wg OPS_SCHEDULE.
// Nie jest cronem: musi go wywołać runtime (dziś: ręcznie / panel / test). Tylko design/shadow/paused —
// w canary/live odmawia (tam działają zatwierdzone zadania runtime + gateway). Bez catch-upu (R10).
import type { Store } from "../store/file-store";
import { claim, complete, enqueue } from "./registry";
import { effectiveMode, type ActivationPolicy } from "./policy";
import { latestDueSlot, OPS_SCHEDULE, slotsBetween } from "./schedule";
import { runRoleShadow, type OpsEnv } from "./roles";
import type { OpsJobResult, OpsRole } from "./types";

const DISPATCHER_LEASE_MS = 10 * 60_000;

export interface TickReport {
  dispatcherId: string;
  refused: string | null;
  mode: string;
  ran: { role: OpsRole; dedupeKey: string; status: OpsJobResult["status"]; reason: string | null }[];
  skipped: { role: OpsRole; reason: string }[];
  missedSlotsNotCaughtUp: number;
}

export async function runShadowTick(
  store: Store,
  opts: { now: Date; dispatcherId: string; policy: ActivationPolicy | null; env: Omit<OpsEnv, "now" | "mode" | "policyVersion">; graceMinutes?: number; manual?: boolean; roles?: OpsRole[] },
): Promise<TickReport> {
  const { now, dispatcherId } = opts;
  const report: TickReport = { dispatcherId, refused: null, mode: "design", ran: [], skipped: [], missedSlotsNotCaughtUp: 0 };

  const gate = await store.transact((s) => {
    const mode = effectiveMode(opts.policy, s.ops.mode);
    report.mode = mode;
    if (mode === "canary" || mode === "live_scoped") return "NOT_SHADOW_MODE";
    const d = s.ops.dispatcher;
    if (d && d.id !== dispatcherId && new Date(d.leaseUntil) > now) return "DISPATCHER_ALREADY_ACTIVE";
    s.ops.dispatcher = { id: dispatcherId, leaseUntil: new Date(now.getTime() + DISPATCHER_LEASE_MS).toISOString() };
    return null;
  });
  if (gate) { report.refused = gate; return report; }

  try {
    const grace = opts.graceMinutes ?? 60;
    const lastTick = store.read().audit.filter((a) => a.entityId === "ops_shadow_tick" && a.action === "job_run").pop()?.at ?? null;
    for (const e of OPS_SCHEDULE) {
      if (opts.roles && !opts.roles.includes(e.role)) continue;
      if (lastTick && !opts.manual) report.missedSlotsNotCaughtUp += slotsBetween(e.cronLocal, new Date(lastTick), new Date(now.getTime() - grace * 60_000)).length;
      const slot = opts.manual ? new Date(Math.floor(now.getTime() / 60_000) * 60_000) : latestDueSlot(e.cronLocal, now, grace);
      if (!slot) { report.skipped.push({ role: e.role, reason: "not_due" }); continue; }
      const dedupeKey = `${e.role}:${opts.manual ? "manual:" : ""}${slot.toISOString()}`;
      const job = await store.transact((s) => structuredClone(enqueue(s, { dedupeKey, role: e.role, scheduledAtUtc: slot.toISOString() }, now)));
      const token = await claim(store, dedupeKey, dispatcherId, now, e.maxRuntimeSeconds * 1000);
      if (token === null) { report.skipped.push({ role: e.role, reason: "already_done_or_leased" }); continue; }
      const result = runRoleShadow(e.role, job.jobId, store.read(), {
        ...opts.env, now, mode: report.mode as OpsEnv["mode"], policyVersion: opts.policy ? opts.policy.owner_approval.policy_hash ?? "unsigned" : null,
      });
      await complete(store, dedupeKey, token, result, now);
      report.ran.push({ role: e.role, dedupeKey, status: result.status, reason: result.reason });
    }
  } finally {
    await store.transact((s) => {
      if (s.ops.dispatcher?.id === dispatcherId) s.ops.dispatcher = null;
      s.audit.push({ at: now.toISOString(), actor: dispatcherId, entity: "job", entityId: "ops_shadow_tick", action: "job_run",
        meta: { adapter: "shadow (bez zapisów zewnętrznych)", mode: report.mode, ran: report.ran.length, skipped: report.skipped.length, missedSlotsNotCaughtUp: report.missedSlotsNotCaughtUp } });
    });
  }
  return report;
}
