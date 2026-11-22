// Job `social_publish_approved` (MOCK w F1). Bezpieczeństwo:
// kill switch -> lease (claim w transakcji pod lockiem) -> re-check kill switch -> akceptacja bieżącej wersji
// -> policy (prawa, źródła, UTM, limit) -> idempotency -> wywołanie adaptera -> zapis wyniku + audit.
// Brak catch-upu: post spóźniony > staleAfterMinutes => held (wymaga ponownej decyzji człowieka).
import { randomUUID } from "node:crypto";
import type { AppState, PublishAttempt, SocialPost } from "../types";
import type { Store } from "../store/file-store";
import type { MetaAdapter } from "../integrations/meta/adapter";
import { MetaApiError } from "../integrations/errors";
import { idempotencyKey } from "./hash";
import { checkPublishPolicy } from "./policy";
import { audit, isApprovalCurrent, policyContext } from "./workflow";
import { redactString, safeLog } from "../security/redact";

export const MAX_ATTEMPTS = 3;
export const BACKOFF_MINUTES = [1, 5, 15];
const LEASE_MS = 2 * 60_000;

export interface JobResult {
  runId: string;
  skippedReason: string | null;
  claimed: string[];
  published: string[];
  held: string[];
  failed: string[];
  retried: string[];
  blocked: { id: string; errors: string[] }[];
  logs: string[];
}

function attemptsFor(state: AppState, key: string): PublishAttempt[] {
  return state.attempts.filter((a) => a.idempotencyKey === key);
}

export async function runPublishJob(
  store: Store,
  adapter: MetaAdapter,
  opts: { now?: Date; workerId?: string; maxPerRun?: number } = {},
): Promise<JobResult> {
  const now = opts.now ?? new Date();
  const worker = opts.workerId ?? `worker-${randomUUID().slice(0, 8)}`;
  const res: JobResult = { runId: randomUUID(), skippedReason: null, claimed: [], published: [], held: [], failed: [], retried: [], blocked: [], logs: [] };
  const log = (lvl: "info" | "warn" | "error", m: string, meta?: unknown) => res.logs.push(safeLog(lvl, m, meta));

  // 1) Claim w transakcji (lock pliku = odpowiednik SELECT ... FOR UPDATE SKIP LOCKED)
  const orphans: SocialPost[] = [];
  const claimed: SocialPost[] = await store.transact((s) => {
    if (!s.settings.publishEnabled) {
      res.skippedReason = "KILL_SWITCH";
      return [];
    }
    if (s.settings.socialMode === 0 && adapter.kind !== "mock") {
      res.skippedReason = "MODE0_REQUIRES_MOCK";
      return [];
    }
    // Sweep: rekordy po awarii procesu (status publishing z wygasłym lease) => rekoncyliacja, nigdy ślepy retry.
    for (const p of s.socialPosts) {
      if (p.status === "publishing" && p.leaseUntil && new Date(p.leaseUntil) <= now) {
        p.leaseOwner = worker;
        p.leaseUntil = new Date(now.getTime() + LEASE_MS).toISOString();
        orphans.push(structuredClone(p));
      }
    }
    const out: SocialPost[] = [];
    const due = s.socialPosts
      .filter((p) => p.status === "scheduled" && p.scheduledAt && new Date(p.scheduledAt) <= now)
      .filter((p) => !p.leaseUntil || new Date(p.leaseUntil) <= now)
      .sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!));
    for (const p of due) {
      if (!s.settings.channels[p.platform]) continue;
      const lateMin = (now.getTime() - new Date(p.scheduledAt!).getTime()) / 60000;
      // Reguła stale obowiązuje również retry — po pauzie/awarii nie ma catch-upu.
      if (lateMin > s.settings.staleAfterMinutes) {
        p.status = "held";
        p.lastError = "STALE_NO_CATCHUP";
        res.held.push(p.id);
        audit(s, worker, "hold_stale", p.id, { lateMin: Math.round(lateMin) });
        continue;
      }
      if (out.length >= (opts.maxPerRun ?? 5)) break;
      p.status = "publishing";
      p.leaseOwner = worker;
      p.leaseUntil = new Date(now.getTime() + LEASE_MS).toISOString();
      out.push(structuredClone(p));
    }
    return out;
  });
  res.claimed = claimed.map((p) => p.id);

  for (const o of orphans) {
    const key = idempotencyKey(o.id, o.version);
    let found: string | null = null;
    try { found = await adapter.findByIdempotencyKey(key); } catch { found = null; }
    await store.transact((s) => {
      const p = s.socialPosts.find((x) => x.id === o.id)!;
      if (p.leaseOwner !== worker) return;
      p.leaseOwner = null; p.leaseUntil = null;
      if (found) {
        p.status = "published"; p.externalPostId = found; p.publishedAt = now.toISOString();
        res.published.push(p.id);
        audit(s, worker, "published_reconciled_after_crash", p.id, { externalPostId: found });
      } else {
        p.status = "held"; p.lastError = "ORPHAN_LEASE_UNCONFIRMED";
        res.held.push(p.id);
        audit(s, worker, "held_orphan_lease", p.id);
      }
    });
  }

  // 2) Publikacja każdego zajętego rekordu
  for (const snapshot of claimed) {
    const key = idempotencyKey(snapshot.id, snapshot.version);
    const pre = await store.transact((s) => {
      const p = s.socialPosts.find((x) => x.id === snapshot.id)!;
      const release = (status: SocialPost["status"], err: string) => {
        p.status = status; p.lastError = err; p.leaseOwner = null; p.leaseUntil = null;
      };
      if (p.leaseOwner !== worker || p.status !== "publishing") return { go: false };
      if (!s.settings.publishEnabled || !s.settings.channels[p.platform]) {
        release("scheduled", "KILL_SWITCH_DURING_RUN");
        return { go: false, reason: "kill" };
      }
      if (!isApprovalCurrent(p)) {
        release("needs_review", "APPROVAL_NOT_CURRENT");
        res.blocked.push({ id: p.id, errors: ["APPROVAL_NOT_CURRENT"] });
        return { go: false };
      }
      // Ponowna, pełna kontrola polityki tuż przed wywołaniem API (limit tygodniowy liczony bez bieżącego posta).
      const errors = checkPublishPolicy(p, policyContext(s, now, adapter.kind));
      if (errors.length) {
        release("held", `POLICY:${errors.join("|")}`);
        res.blocked.push({ id: p.id, errors });
        audit(s, worker, "publish_blocked", p.id, { errors });
        return { go: false };
      }
      const prior = attemptsFor(s, key);
      const success = prior.find((a) => a.status === "succeeded");
      if (success) {
        p.status = "published"; p.externalPostId = success.externalPostId; p.leaseOwner = null; p.leaseUntil = null;
        s.attempts.push({ id: randomUUID(), postId: p.id, attempt: prior.length + 1, idempotencyKey: key, status: "skipped", errorCode: "ALREADY_PUBLISHED", externalPostId: success.externalPostId, mock: adapter.kind === "mock", at: now.toISOString() });
        return { go: false };
      }
      const attemptNo = prior.length + 1;
      s.attempts.push({ id: randomUUID(), postId: p.id, attempt: attemptNo, idempotencyKey: key, status: "started", errorCode: null, externalPostId: null, mock: adapter.kind === "mock", at: now.toISOString() });
      return { go: true, attemptNo, post: structuredClone(p) };
    });
    if (!pre.go || !pre.post) continue;

    let outcome: { ok: true; externalPostId: string } | { ok: false; code: string; cls: string; msg: string };
    try {
      // Graph API nie ma idempotency key: przed KAŻDYM retry sprawdź, czy poprzednia próba nie utworzyła posta.
      const already = (pre.attemptNo ?? 1) > 1 ? await adapter.findByIdempotencyKey(key) : null;
      if (already) outcome = { ok: true, externalPostId: already };
      else {
        const r = await adapter.publish({ post: pre.post, idempotencyKey: key });
        outcome = { ok: true, externalPostId: r.externalPostId };
      }
    } catch (err) {
      const e = err instanceof MetaApiError ? err : new MetaApiError("UNKNOWN", "retryable", String((err as Error)?.message ?? err));
      outcome = { ok: false, code: e.code, cls: e.errorClass, msg: redactString(e.message) };
      log("warn", `Publikacja ${snapshot.id} nieudana: ${e.message}`, { code: e.code, cls: e.errorClass });
    }

    // Rekoncyliacja po timeout — przed jakimkolwiek retry
    if (!outcome.ok && outcome.cls === "timeout") {
      const found = await adapter.findByIdempotencyKey(key);
      if (found) outcome = { ok: true, externalPostId: found };
    }

    await store.transact((s) => {
      const p = s.socialPosts.find((x) => x.id === snapshot.id)!;
      const att = s.attempts.filter((a) => a.idempotencyKey === key && a.status === "started").pop()!;
      p.leaseOwner = null;
      if (outcome.ok) {
        att.status = "succeeded"; att.externalPostId = outcome.externalPostId;
        p.status = "published"; p.externalPostId = outcome.externalPostId; p.publishedAt = now.toISOString();
        p.leaseUntil = null; p.lastError = null;
        res.published.push(p.id);
        audit(s, worker, adapter.kind === "mock" ? "published_SIMULATED_MOCK" : "published", p.id, { externalPostId: outcome.externalPostId });
        return;
      }
      att.errorCode = outcome.code;
      p.lastError = `${outcome.code}: ${outcome.msg}`;
      if (outcome.cls === "timeout") {
        att.status = "unknown"; p.status = "held"; p.leaseUntil = null;
        res.held.push(p.id);
        audit(s, worker, "held_unknown_after_timeout", p.id, { code: outcome.code });
      } else if (outcome.cls === "auth" || outcome.cls === "permanent") {
        att.status = "failed_permanent"; p.status = "failed"; p.leaseUntil = null;
        if (outcome.cls === "auth") s.settings.channels[p.platform] = false; // wygasły token => pauza kanału
        res.failed.push(p.id);
        audit(s, worker, "publish_failed_permanent", p.id, { code: outcome.code, channelPaused: outcome.cls === "auth" });
      } else if ((pre.attemptNo ?? 1) >= MAX_ATTEMPTS) {
        att.status = "failed_retryable"; p.status = "failed"; p.leaseUntil = null;
        res.failed.push(p.id);
        audit(s, worker, "publish_failed_max_attempts", p.id, { code: outcome.code });
      } else {
        att.status = "failed_retryable"; p.status = "scheduled";
        const backoff = BACKOFF_MINUTES[(pre.attemptNo ?? 1) - 1] ?? 15;
        p.leaseUntil = new Date(now.getTime() + backoff * 60_000).toISOString(); // not-before
        res.retried.push(p.id);
        audit(s, worker, "publish_retry_scheduled", p.id, { code: outcome.code, backoffMin: backoff });
      }
    });
  }
  // Ślad każdego uruchomienia (panel pokazuje prawdziwy stan automatyzacji, nie deklarację).
  await store.transact((s) => {
    s.audit.push({
      at: now.toISOString(), actor: worker, entity: "job", entityId: "social_publish_approved", action: "job_run",
      meta: { adapter: adapter.kind, skipped: res.skippedReason, claimed: res.claimed.length, published: res.published.length, held: res.held.length, failed: res.failed.length, retried: res.retried.length, blocked: res.blocked.length },
    });
  });
  return res;
}

/** Kill switch (admin): natychmiast blokuje nowe publikacje i retry; opcjonalnie anuluje przyszłe wpisy. */
export async function setPublishing(store: Store, enabled: boolean, actor: string, cancelFuture = false): Promise<void> {
  await store.transact((s) => {
    s.settings.publishEnabled = enabled; // wznowienie NIE odblokowuje kanałów zapauzowanych po błędzie auth (setChannel)
    if (!enabled && cancelFuture) {
      for (const p of s.socialPosts) if (p.status === "scheduled") { p.status = "cancelled"; p.leaseUntil = null; }
    }
    s.audit.push({ at: new Date().toISOString(), actor, entity: "ops_settings", entityId: "kill_switch", action: enabled ? "publishing_resumed" : "publishing_paused", meta: { cancelFuture } });
  });
}

/** Ręczne (osobne dla kanału) włączenie/wyłączenie — np. po odnowieniu tokenu. */
export async function setChannel(store: Store, platform: SocialPost["platform"], enabled: boolean, actor: string): Promise<void> {
  await store.transact((s) => {
    s.settings.channels[platform] = enabled;
    s.audit.push({ at: new Date().toISOString(), actor, entity: "ops_settings", entityId: `channel:${platform}`, action: enabled ? "channel_enabled" : "channel_paused", meta: {} });
  });
}
