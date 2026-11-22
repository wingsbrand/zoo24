// Dane pierwszego ekranu panelu: 4 pytania właściciela. Tylko odczyt stanu — bez efektów ubocznych.
import type { AppState, AuditEntry } from "../types";
import { JOBS } from "../social/scheduler";
import { effectiveMode, isPolicyApproved, type ActivationPolicy } from "../ops/policy";
import { describeCron, nextSlot, OPS_SCHEDULE } from "../ops/schedule";
import { formatWarsaw } from "../time";
import type { OpsJobResult, OpsMode, OpsRole } from "../ops/types";

export interface DecisionItem { key: string; label: string; count: number; href: string; hint: string }

export function pendingDecisions(s: AppState): DecisionItem[] {
  const subs = (s.submissions ?? []).filter((x) => x.status === "pending");
  return [
    { key: "firms", label: "Zgłoszenia firm i błędów do moderacji", count: subs.length, href: "/admin/moderacja", hint: "zgłoszenia, przejęcia profili, zgłoszone błędy" },
    { key: "articles", label: "Artykuły do akceptacji", count: s.articles.filter((a) => a.status === "needs_review" && !a.demo).length, href: "/admin/content", hint: "szkicy sprawdzone przez redaktora czekają na decyzję" },
    { key: "posts", label: "Posty social do akceptacji", count: s.socialPosts.filter((p) => p.status === "needs_review").length, href: "/admin/social", hint: "kalendarz 14 dni" },
    { key: "drafts", label: "Posty w szkicu (bez zgłoszenia do akceptacji)", count: s.socialPosts.filter((p) => p.status === "draft").length, href: "/admin/social", hint: "wymagają praw do grafik i uzupełnień" },
    { key: "urls", label: "Mapowania starych URL do decyzji", count: s.legacyUrls.filter((l) => l.status === "needs_review" || l.status === "draft").length, href: "/admin/seo", hint: "200 / 301 / 404 / 410" },
  ];
}

export interface AutomationStatus {
  publishEnabled: boolean;
  socialMode: 0 | 1;
  channels: Record<string, boolean>;
  schedulerActive: false;
  jobs: { id: string; proposedSchedule: string; description: string; lastRun: AuditEntry | null }[];
  lastErrors: AuditEntry[];
  ops: OpsOverview;
}

export interface OpsRoleRow {
  role: OpsRole; agent: string; plan: string; enabled: false; nextLocal: string | null;
  last: { at: string; status: OpsJobResult["status"]; reason: string | null; mode: string } | null;
}
export interface OpsOverview {
  mode: OpsMode;
  policyStatus: string; // np. INACTIVE_PENDING_OWNER_APPROVAL / BRAK
  policyApproved: boolean;
  runtime: string; // wybrany runtime (dziś: brak)
  pause: AppState["ops"]["pause"]["state"];
  roles: OpsRoleRow[];
  openCorrections: number;
  unknownOutcomes: number;
}

export function opsOverview(s: AppState, policy: ActivationPolicy | null, now = new Date()): OpsOverview {
  return {
    mode: effectiveMode(policy, s.ops.mode),
    policyStatus: policy?.status ?? "BRAK",
    policyApproved: isPolicyApproved(policy),
    runtime: (policy?.runtime as { selected?: string | null } | undefined)?.selected ?? "brak — harmonogram nieaktywny",
    pause: s.ops.pause.state,
    roles: OPS_SCHEDULE.map((e) => {
      const r = [...s.ops.results].reverse().find((x) => x.role === e.role);
      const next = nextSlot(e.cronLocal, now);
      return {
        role: e.role, agent: e.jobKey, plan: describeCron(e.cronLocal), enabled: false,
        nextLocal: next ? formatWarsaw(next.toISOString()) : null,
        last: r ? { at: r.finished_at, status: r.status, reason: r.reason, mode: r.mode } : null,
      };
    }),
    openCorrections: s.ops.correctionTasks.length,
    unknownOutcomes: s.ops.receipts.filter((r) => r.status === "unknown").length,
  };
}

export function automationStatus(s: AppState, policy: ActivationPolicy | null = null): AutomationStatus {
  const runs = s.audit.filter((a) => a.action === "job_run");
  return {
    publishEnabled: s.settings.publishEnabled,
    socialMode: s.settings.socialMode,
    channels: s.settings.channels,
    schedulerActive: false, // runtime harmonogramu nie jest wybrany ani aktywny (ops/runtime/ADR-RUNTIME.md)
    jobs: JOBS.map((j) => ({ ...j, lastRun: [...runs].reverse().find((r) => r.entityId === j.id) ?? null })),
    lastErrors: s.audit.filter((a) => /failed|blocked|held/.test(a.action)).slice(-3).reverse(),
    ops: opsOverview(s, policy),
  };
}

const LABELS: Record<string, string> = {
  article_published: "Opublikowano artykuł", approve_blocked: "Zablokowano akceptację (polityka)", article_submitted: "Artykuł zgłoszony do akceptacji",
  article_to_draft: "Artykuł cofnięty do szkicu", approve: "Zatwierdzono post", schedule: "Zaplanowano post", reject: "Odrzucono", edit: "Zmieniono treść posta",
  publishing_paused: "Wstrzymano publikacje", publishing_resumed: "Wznowiono publikacje (MOCK)", published_SIMULATED_MOCK: "Symulacja publikacji (MOCK)",
  job_run: "Uruchomienie joba", submission_created: "Nowe zgłoszenie", submission_approved: "Zaakceptowano zgłoszenie", submission_rejected: "Odrzucono zgłoszenie", hold_stale: "Wstrzymano spóźniony post",
  publish_blocked: "Zablokowano publikację (polityka)", channel_enabled: "Odblokowano kanał", channel_paused: "Zapauzowano kanał",
  ops_paused: "Pełna pauza operacji", ops_partially_paused: "Pauza częściowa — sprawdź harmonogram dostawcy", ops_resumed: "Wznowiono operacje (shadow)",
  evidence_revoked: "Wycofano źródło (blokada zależnych treści)", evidence_disputed: "Sporny fakt (blokada zależnych treści)", evidence_stale: "Fakt przeterminowany",
};
export const auditLabel = (a: AuditEntry) => LABELS[a.action] ?? a.action;

export function changesSince(s: AppState, sinceIso: string | null, limit = 8): { since: string | null; items: AuditEntry[]; total: number } {
  const all = s.audit.filter((a) => !sinceIso || a.at > sinceIso);
  return { since: sinceIso, items: all.slice(-limit).reverse(), total: all.length };
}
