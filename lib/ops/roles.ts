// Integracja sześciu ról zoo24-ops-* z istniejącym kodem. Każdy handler w trybie design/shadow tylko CZYTA
// stan aplikacji (lib/content, lib/social, lib/seo) i zwraca wynik zgodny z job-result.v1 — zero zapisów
// zewnętrznych. Prawdziwą pracę modelu wykonuje agent `.claude/agents/zoo24-ops-<rola>.md` uruchomiony przez
// wybrany runtime; ten kod daje mu trwały kontekst, kontrakt wyniku i bramki (gateway).
import type { AppState } from "../types";
import type { AccessStatus, SourceId } from "../integrations/read-sources";
import { checkArticlePolicy } from "../content/editorial";
import { evaluateExperiment } from "./guards";
import { isAgentIdentity } from "./policy";
import type { OpsCheck, OpsJobResult, OpsMetric, OpsMode, OpsRole } from "./types";

export interface OpsEnv {
  now: Date;
  mode: OpsMode;
  policyVersion: string | null;
  sources: Record<SourceId, AccessStatus>;
  vcs: boolean; // czy repo jest pod kontrolą wersji (branch/PR dla roli build)
  editorId: string | null;
  /** Polityka dopuszcza redaktora-AI (decyzja właściciela) poza kategoriami wrażliwymi. */
  aiEditorAllowed?: boolean;
}

type Draft = Omit<OpsJobResult, "schema_version" | "job_id" | "role" | "mode" | "policy_version" | "finished_at" | "cost" | "external_actions">;

const na = (name: string, unit: string, source: string | null, note: string): OpsMetric =>
  ({ name, value: null, unit, source, period_start: null, period_end: null, data_status: "unavailable", note });

function build(s: AppState, env: OpsEnv): Draft {
  const checks: OpsCheck[] = [
    { name: "vcs_branch_pr_flow", status: env.vcs ? "pass" : "blocked", detail: env.vcs ? "repo pod kontrolą wersji" : "folder bez git — branch/PR/SHA niemożliwe; release niekwalifikowalny" },
    { name: "independent_review", status: "n/a", detail: "zoo24-qa dostępny jako niezależny reviewer; brak diffu w tym przebiegu" },
    { name: "deploy_gateway", status: "blocked", detail: "brak hostingu/CI (production_environment_id = null)" },
  ];
  return {
    status: env.vcs ? "produced" : "blocked", reason: env.vcs ? null : "blocked_dependency: no_version_control",
    artifacts: [{ id: "backlog:P0", type: "task_list", version: null, note: "P0 przed pierwszą produkcją wg docs/STATUS.md" }],
    checks, metrics: [na("production_errors", "count", null, "N/A — brak produkcji i monitoringu")],
    next_tasks: [
      ...(env.vcs ? [] : ["Założyć repozytorium git (prywatne) — warunek branch/PR/review/rollback i cloud runtime"]),
      "Supabase + Auth + RLS lokalnie z testami (zastąpienie .data/state.json)",
      "Staging z ochroną hasłem i noindex",
    ].slice(0, 3),
    human_decisions_required: env.vcs ? [] : ["Zgoda na repozytorium (GitHub prywatne) dla kodu ZOO24"],
  };
}

function content(s: AppState, env: OpsEnv): Draft {
  const queue = s.articles.filter((a) => !a.demo && a.status === "needs_review");
  const artifacts = queue.map((a) => {
    const errs = checkArticlePolicy(a);
    return { id: `article:${a.slug}`, type: "article", version: a.updatedAt, note: errs.length ? `blokady: ${errs.join(", ")}` : "polityka maszynowa PASS — czeka na redaktora" };
  });
  const ready = s.articles.filter((a) => !a.demo && a.status === "published").length;
  const aiEditor = !!env.editorId && isAgentIdentity(env.editorId);
  const checks: OpsCheck[] = [
    {
      name: "editor_assigned",
      status: env.editorId && (!aiEditor || env.aiEditorAllowed) ? "pass" : "blocked",
      detail: !env.editorId ? "brak redaktora w polityce — nowe treści pozostają niepubliczne"
        : aiEditor && env.aiEditorAllowed ? "redaktor = AI (decyzja właściciela): zatwierdza poza zdrowiem/prawem/cenami/sponsorowanymi; właściciel przegląda po publikacji"
        : aiEditor ? "redaktor = AI (redaguje szkice); zatwierdzenie publikacji faktów wymaga człowieka — publikacja zablokowana"
        : "redaktor (człowiek) przypisany",
    },
    { name: "approved_buffer_items", status: ready >= 3 ? "pass" : "fail", detail: `${ready} opublikowanych/zatwierdzonych (próg ryzyka przerwy: 3)` },
  ];
  return {
    status: queue.length ? "needs_human" : "produced", reason: queue.length ? "editorial_review_required" : null,
    artifacts, checks, metrics: [na("article_to_directory", "clicks", "own_events", "N/A — serwis nie jest publiczny")],
    next_tasks: ["Brief: kot syberyjski (n67) pod dawnym URL — z kart faktów Knowledge", "Brief: kot bengalski (n65)", "Komunikat nowej formuły ZOO24 (strona wyjaśniająca)"],
    human_decisions_required: queue.length
      ? [aiEditor && env.aiEditorAllowed ? `Redaktor-AI: review ${queue.length} artykułów (poza kategoriami wrażliwymi); właściciel — przegląd po publikacji` : `Redaktor: review ${queue.length} artykułów w /admin/content`]
      : [],
  };
}

function knowledge(s: AppState, env: OpsEnv): Draft {
  const real = s.articles.filter((a) => !a.demo);
  const srcs = real.flatMap((a) => a.sources);
  const withUrl = srcs.filter((x) => !!x.url).length;
  const ev = s.ops.evidence;
  const expired = ev.filter((e) => e.status === "approved" && e.validUntil && new Date(e.validUntil) <= env.now).length;
  return {
    status: "produced", reason: null,
    artifacts: [{ id: "source-register", type: "register", version: String(ev.length), note: `${ev.length} kart faktów w rejestrze (${ev.filter((e) => e.status === "approved").length} zatwierdzonych, ${ev.filter((e) => e.status === "candidate").length} w kwarantannie)` }],
    checks: [
      { name: "article_sources_have_url", status: withUrl === srcs.length ? "pass" : "fail", detail: `${withUrl}/${srcs.length} źródeł artykułów ma URL` },
      { name: "evidence_ttl", status: expired ? "fail" : "pass", detail: `${expired} przeterminowanych zatwierdzonych faktów` },
      { name: "corrections_open", status: s.ops.correctionTasks.length ? "fail" : "pass", detail: `${s.ops.correctionTasks.length} zadań korekty` },
    ],
    metrics: [],
    next_tasks: ["Karty faktów (claim->źródło) dla 3 artykułów needs_review", "Mapa praw do historycznych tekstów bloga (brak archiwum = jawna luka)"],
    human_decisions_required: [],
  };
}

function social(s: AppState, env: OpsEnv): Draft {
  const horizon = env.now.getTime() + 14 * 86400_000;
  const open = s.socialPosts.filter((p) => !["published", "cancelled", "rejected"].includes(p.status));
  const in14 = open.filter((p) => p.scheduledAt && new Date(p.scheduledAt).getTime() <= horizon);
  const noRights = open.filter((p) => { const a = s.socialAssets.find((x) => x.id === p.assetId); return !a || a.licenseType === "unknown" || !a.rightsCheckedAt; });
  const metaRead = env.sources.meta_fb;
  return {
    status: noRights.length === open.length && open.length ? "blocked" : "produced",
    reason: noRights.length === open.length && open.length ? "blocked_dependency: asset_rights_unverified" : null,
    artifacts: [{ id: "social-queue-14d", type: "calendar", version: null, note: `${open.length} otwartych postów, ${in14.length} w horyzoncie 14 dni` }],
    checks: [
      { name: "asset_rights", status: noRights.length ? "fail" : "pass", detail: `${noRights.length}/${open.length} postów bez zweryfikowanej licencji grafiki` },
      { name: "kill_switch", status: s.settings.publishEnabled ? "fail" : "pass", detail: s.settings.publishEnabled ? "publikacje zwolnione (MOCK)" : "publikacje wstrzymane" },
      { name: "meta_publish_access", status: "blocked", detail: "brak facebook_page_id/instagram_account_id i uprawnień publikacji — tryb asystowany (eksport CSV)" },
      { name: "meta_insights_read", status: metaRead === "no_access" ? "blocked" : "pass", detail: `FB: ${metaRead}, IG: ${env.sources.meta_ig}` },
    ],
    metrics: [na("instagram_reach", "accounts", null, "N/A — konektor IG niepodłączony")],
    next_tasks: ["Grafiki z licencją do rejestru assetów", "Finalne copy relaunchu do review redaktora"],
    human_decisions_required: noRights.length ? ["Źródło grafik z prawami (np. własne zdjęcia / licencja stockowa)"] : [],
  };
}

function seo(s: AppState, env: OpsEnv): Draft {
  const pending = s.legacyUrls.filter((l) => !l.demo && (l.status === "draft" || l.status === "needs_review")).length;
  const gsc = env.sources.gsc;
  return {
    status: "produced", reason: gsc === "no_access" ? "partial: gsc blocked_access" : null,
    artifacts: [{ id: "legacy-url-map", type: "redirect_plan", version: null, note: `${pending} dawnych URL czeka na decyzję 200/301/404/410` }],
    checks: [
      { name: "gsc_read", status: gsc === "no_access" ? "blocked" : "pass", detail: gsc === "no_access" ? "blocked_access — GSC do założenia po uruchomieniu serwera" : gsc },
      { name: "ga4_read", status: env.sources.ga4 === "no_access" ? "blocked" : "pass", detail: `GA4: ${env.sources.ga4}` },
      { name: "indexing_api_forbidden", status: "pass", detail: "Indexing API nieużywane dla poradników/katalogu" },
    ],
    metrics: [na("gsc_clicks", "clicks", "gsc", "N/A — brak property GSC (nie 0)")],
    next_tasks: ["Decyzje dla TOP 100 GA4 (kolejność wg historycznych sesji)", "Po GSC: TOP 100 wg linków"],
    human_decisions_required: [],
  };
}

function growth(s: AppState, env: OpsEnv): Draft {
  const exps = [
    { id: "exp:nowa-formula", hypothesis: "dawni odbiorcy FB nadal chcą praktycznej wiedzy" },
    { id: "exp:checklista-katalog", hypothesis: "czytelnik poradnika szuka usługi w mieście" },
    { id: "exp:to-twoja-firma", hypothesis: "usługodawca uzupełni własne dane" },
  ];
  return {
    status: "produced", reason: null,
    artifacts: exps.map((e) => ({ id: e.id, type: "experiment_design", version: null, note: `${e.hypothesis} — wynik: ${evaluateExperiment(null).verdict}` })),
    checks: [
      { name: "active_experiments_cap", status: "pass", detail: "0 aktywnych (limit 2) — serwis niepubliczny" },
      { name: "paid_spend", status: "pass", detail: "0 zł; płatne kampanie poza zakresem" },
      { name: "outreach_messages", status: "pass", detail: "0 wysłanych e-mail/DM — poza zakresem" },
    ],
    metrics: [na("qualified_actions", "count", null, "N/A — brak publicznego serwisu i pomiaru")],
    next_tasks: ["Baseline 28 dni po starcie serwisu", "Przygotować wariant CTA checklista->katalog dla 2 artykułów"],
    human_decisions_required: [],
  };
}

const HANDLERS: Record<OpsRole, (s: AppState, env: OpsEnv) => Draft> = { build, content, growth, knowledge, social, seo };

export function runRoleShadow(role: OpsRole, jobId: string, s: AppState, env: OpsEnv): OpsJobResult {
  const d = HANDLERS[role](s, env);
  return {
    schema_version: "zoo24.ops.job-result.v1", job_id: jobId, role, mode: env.mode, policy_version: env.policyVersion,
    ...d, external_actions: [], cost: { value: null, currency: null, status: "none" }, finished_at: env.now.toISOString(),
  };
}
