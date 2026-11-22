// Harmonogram MOCK. NIE jest to działający cron: Claude Code nie pracuje w tle po sesji.
// Joby uruchamia się ręcznie (`npm run jobs:run -- <job>`) lub z panelu. Produkcyjny scheduler
// (np. cron hostingu + chroniony endpoint) wymaga osobnej zgody właściciela (OPS-SEO-SOC-02).
import type { Store } from "../store/file-store";
import type { MetaAdapter } from "../integrations/meta/adapter";
import { runPublishJob, type JobResult } from "./publisher";
import { runShadowTick, type TickReport } from "../ops/dispatcher";
import { loadPolicy } from "../ops/policy";
import { buildOpsEnv } from "../ops/env";

export interface JobDef {
  id: string;
  proposedSchedule: string; // Europe/Warsaw — propozycja z AUTOMATION_RUNBOOK, nie aktywna automatyzacja
  description: string;
  live: false;
}

export const JOBS: JobDef[] = [
  { id: "seo_health_daily", proposedSchedule: "codziennie 07:00", description: "statusy URL, canonical, robots/sitemap (mock checker)", live: false },
  { id: "social_queue_daily", proposedSchedule: "codziennie 08:00", description: "plan 7 dni, prawa assetów, brakujące akceptacje", live: false },
  { id: "social_publish_approved", proposedSchedule: "co 5 min (w oknach publikacji)", description: "publikacja zatwierdzonych (MOCK adapter)", live: false },
  { id: "weekly_kpi_report", proposedSchedule: "poniedziałek 08:00", description: "raport 28d/7d z N/A przy brakach", live: false },
  { id: "ops_shadow_tick", proposedSchedule: "ręcznie (shadow 6 ról zoo24-ops)", description: "przebieg shadow ról build/content/growth/knowledge/social/seo — tylko odczyt", live: false },
];

export interface QueueReport {
  next7days: number;
  missingApproval: string[];
  missingRights: string[];
}

export async function socialQueueDaily(store: Store, now = new Date()): Promise<QueueReport> {
  const s = store.read();
  const horizon = now.getTime() + 7 * 86400_000;
  const upcoming = s.socialPosts.filter((p) => p.scheduledAt && new Date(p.scheduledAt).getTime() <= horizon && !["published", "cancelled", "rejected"].includes(p.status));
  return {
    next7days: upcoming.length,
    missingApproval: upcoming.filter((p) => !["approved", "scheduled"].includes(p.status)).map((p) => p.id),
    missingRights: upcoming.filter((p) => {
      const a = s.socialAssets.find((x) => x.id === p.assetId);
      return !a || a.licenseType === "unknown" || !a.rightsCheckedAt;
    }).map((p) => p.id),
  };
}

export async function runJobOnce(id: string, deps: { store: Store; adapter: MetaAdapter; now?: Date }): Promise<JobResult | QueueReport | TickReport | { note: string }> {
  switch (id) {
    case "ops_shadow_tick": {
      // Ręczny przebieg shadow sześciu ról zoo24-ops (tylko odczyt stanu, zero zapisów zewnętrznych).
      const policy = loadPolicy();
      return runShadowTick(deps.store, { now: deps.now ?? new Date(), dispatcherId: "dispatcher:panel", policy, env: await buildOpsEnv(policy), manual: true });
    }
    case "social_publish_approved":
      return runPublishJob(deps.store, deps.adapter, { now: deps.now });
    case "social_queue_daily":
      return socialQueueDaily(deps.store, deps.now);
    default:
      return { note: `Job ${id} — uruchom przez panel /admin (SEO checker / raport). Brak aktywnego crona.` };
  }
}
