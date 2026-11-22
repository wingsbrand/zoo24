// Pełna pauza (R08, R09): blokuje nowe publish/deploy/send (gateway => PAUSED), wstrzymuje lokalną kolejkę social
// i próbuje anulować wpisy zaplanowane już u dostawcy. Niepotwierdzone anulowanie => partially_paused + lista ID.
// Odczyty i role analityczne działają dalej. Wznowienie tylko przez człowieka; bez nadrabiania zaległości.
import type { Store } from "../store/file-store";
import { isAgentIdentity } from "./policy";

export interface ProviderScheduleAdapter {
  readonly kind: "mock" | "real";
  listScheduled(): Promise<{ id: string; platform: "facebook" | "instagram" }[]>;
  cancel(id: string): Promise<"cancelled" | "unsupported" | "unknown">;
}

/** Brak integracji z harmonogramem dostawcy: nie można potwierdzić stanu => pauza częściowa, instrukcja dla operatora. */
export class NoProviderAccess implements ProviderScheduleAdapter {
  readonly kind = "mock" as const;
  async listScheduled(): Promise<never> { throw new Error("NO_PROVIDER_ACCESS"); }
  async cancel(): Promise<"unknown"> { return "unknown"; }
}

export interface PauseReport { state: "paused" | "partially_paused"; cancelledLocal: string[]; cancelledProvider: string[]; remainingProviderIds: string[]; operatorInstruction: string | null }

export async function pauseAll(store: Store, actor: string, provider: ProviderScheduleAdapter, now = new Date()): Promise<PauseReport> {
  const cancelledLocal = await store.transact((s) => {
    s.ops.mode = "paused";
    s.settings.publishEnabled = false;
    const ids: string[] = [];
    for (const p of s.socialPosts) if (p.status === "scheduled") { p.status = "cancelled"; p.leaseUntil = null; ids.push(p.id); }
    return ids;
  });
  const cancelledProvider: string[] = [];
  const remaining: string[] = [];
  let listingFailed = false;
  try {
    for (const item of await provider.listScheduled()) {
      const r = await provider.cancel(item.id).catch(() => "unknown" as const);
      (r === "cancelled" ? cancelledProvider : remaining).push(item.id);
    }
  } catch { listingFailed = true; }
  const partial = listingFailed || remaining.length > 0;
  const report: PauseReport = {
    state: partial ? "partially_paused" : "paused",
    cancelledLocal, cancelledProvider, remainingProviderIds: remaining,
    operatorInstruction: partial
      ? listingFailed
        ? "PILNE: nie można odczytać harmonogramu u dostawcy (brak dostępu). Sprawdź ręcznie Meta Business Suite > Zaplanowane i anuluj wpisy ZOO24."
        : `PILNE: anuluj ręcznie w Meta Business Suite wpisy o ID: ${remaining.join(", ")}`
      : null,
  };
  await store.transact((s) => {
    s.ops.pause = { state: report.state, at: now.toISOString(), remainingProviderIds: remaining };
    s.audit.push({ at: now.toISOString(), actor, entity: "ops", entityId: "pause", action: report.state === "paused" ? "ops_paused" : "ops_partially_paused", meta: { cancelledLocal: cancelledLocal.length, cancelledProvider: cancelledProvider.length, remaining: remaining.length, listingFailed } });
  });
  return report;
}

export async function resumeOps(store: Store, actor: string, to: "design" | "shadow" = "shadow", now = new Date()): Promise<void> {
  if (isAgentIdentity(actor)) throw new Error("RESUME_REQUIRES_HUMAN");
  await store.transact((s) => {
    s.ops.mode = to;
    s.ops.pause = { state: "running", at: now.toISOString(), remainingProviderIds: [] };
    s.audit.push({ at: now.toISOString(), actor, entity: "ops", entityId: "pause", action: "ops_resumed", meta: { to } });
  });
}
