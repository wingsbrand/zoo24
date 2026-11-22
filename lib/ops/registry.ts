// Trwały rejestr zadań: deduplikacja po dedupe_key, atomowy lease (transakcja store), monotoniczny
// fencing token. Spóźniony worker (stary token) nie może zapisać wyniku ani zlecić operacji (R01, R02).
import { randomUUID } from "node:crypto";
import type { AppState } from "../types";
import type { Store } from "../store/file-store";
import type { OpsJob, OpsJobResult, OpsJobStatus, OpsRole } from "./types";

export const DEFAULT_LEASE_MS = 20 * 60_000; // ≥ max_runtime_seconds ról redakcyjnych (1200 s)

export class RegistryError extends Error {
  constructor(public code: string, public detail = "") { super(detail ? `${code}: ${detail}` : code); this.name = "RegistryError"; }
}

/** Dodaje job, jeśli nie istnieje job o tym samym dedupe_key; zwraca istniejący lub nowy. */
export function enqueue(s: AppState, input: { dedupeKey: string; role: OpsRole; scheduledAtUtc: string; parentId?: string | null }, now: Date): OpsJob {
  const existing = s.ops.jobs.find((j) => j.dedupeKey === input.dedupeKey);
  if (existing) return existing;
  const job: OpsJob = {
    jobId: randomUUID(), dedupeKey: input.dedupeKey, ownerRole: input.role, status: "queued",
    scheduledAtUtc: input.scheduledAtUtc, leaseOwner: null, leaseUntil: null, fencingToken: null,
    attempt: 0, parentId: input.parentId ?? null, lastError: null, createdAt: now.toISOString(), updatedAt: now.toISOString(),
  };
  s.ops.jobs.push(job);
  return job;
}

const CLAIMABLE: OpsJobStatus[] = ["queued", "retry_wait", "leased", "running"];

/** Atomowe przejęcie lease. Zwraca token albo null, gdy job ma aktywny lease innego właściciela lub jest zakończony. */
export async function claim(store: Store, dedupeKey: string, worker: string, now: Date, leaseMs = DEFAULT_LEASE_MS): Promise<number | null> {
  return store.transact((s) => {
    const j = s.ops.jobs.find((x) => x.dedupeKey === dedupeKey);
    if (!j || !CLAIMABLE.includes(j.status)) return null;
    if (j.leaseUntil && new Date(j.leaseUntil) > now && j.leaseOwner !== worker) return null;
    s.ops.fencingSeq += 1;
    j.fencingToken = s.ops.fencingSeq;
    j.leaseOwner = worker;
    j.leaseUntil = new Date(now.getTime() + leaseMs).toISOString();
    j.status = "running";
    j.attempt += 1;
    j.updatedAt = now.toISOString();
    return j.fencingToken;
  });
}

/** Sprawdzenie tokenu przed każdym zapisem zewnętrznym i przed zapisem wyniku. */
export function assertFence(s: AppState, dedupeKey: string, token: number): OpsJob {
  const j = s.ops.jobs.find((x) => x.dedupeKey === dedupeKey);
  if (!j) throw new RegistryError("JOB_NOT_FOUND", dedupeKey);
  if (j.fencingToken !== token) throw new RegistryError("STALE_FENCING_TOKEN", `${token} != ${j.fencingToken}`);
  return j;
}

export async function heartbeat(store: Store, dedupeKey: string, token: number, now: Date, leaseMs = DEFAULT_LEASE_MS): Promise<void> {
  await store.transact((s) => {
    const j = assertFence(s, dedupeKey, token);
    j.leaseUntil = new Date(now.getTime() + leaseMs).toISOString();
    j.updatedAt = now.toISOString();
  });
}

const RESULT_TO_JOB: Record<OpsJobResult["status"], OpsJobStatus> = {
  done: "done", produced: "produced", blocked: "blocked_access", needs_human: "needs_human", failed: "failed",
};

/** Zapis wyniku z kontrolą fencing; wynik trafia do trwałego rejestru (ostatnie 200). */
export async function complete(store: Store, dedupeKey: string, token: number, result: OpsJobResult, now: Date): Promise<void> {
  await store.transact((s) => {
    const j = assertFence(s, dedupeKey, token);
    j.status = result.status === "blocked" && /policy/i.test(result.reason ?? "") ? "blocked_policy"
      : result.status === "blocked" && /dependency/i.test(result.reason ?? "") ? "blocked_dependency"
      : RESULT_TO_JOB[result.status];
    j.leaseOwner = null;
    j.leaseUntil = null;
    j.lastError = result.status === "failed" ? result.reason : null;
    j.updatedAt = now.toISOString();
    s.ops.results.push(result);
    if (s.ops.results.length > 200) s.ops.results.splice(0, s.ops.results.length - 200);
  });
}
