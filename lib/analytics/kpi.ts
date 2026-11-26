// Dashboard 28 dni (spec: docs/analytics/dashboard-28d-spec.md). Brak źródła => "N/A" + powód, nigdy 0.
import type { AppState, DirectoryEvent } from "../types";
import type { AccessStatus, AggregateResult, ReadSource, SourceId } from "../integrations/read-sources";

export interface KpiTile {
  key: string;
  label: string;
  value: number | null;
  display: string; // "N/A — powód" albo sformatowana wartość
  unit: string;
  dataSource: SourceId | "internal" | "manual";
  accessStatus: AccessStatus;
  periodStart: string;
  periodEnd: string;
  lastVerifiedAt: string | null;
  historicalOrCurrent: "current";
  demo: boolean;
}

export const HISTORICAL_OWNER_CLAIM = {
  key: "historical_owner_claim",
  text: "Historycznie 100 000+ wejść organicznych/mies. i kilkanaście tys. obserwujących FB/IG — deklaracja właściciela, NIEZWERYFIKOWANA. Benchmark, nie wynik; nie uczestniczy w obliczeniach.",
  historicalOrCurrent: "historical" as const,
  verified: false,
};

/** Historia potwierdzona eksportem GA4 (docs/audits/ga4-monthly-sessions.csv). Nie uczestniczy w deltach. */
export const HISTORICAL_VERIFIED_GA4 = {
  key: "historical_verified_ga4",
  source: "GA4 zoo24.pl (301981165) i Facebook Organic ZOO24.PL przez Windsor.ai, pobrano 2026-11-22",
  period: "2022-02 – 2024-11",
  text: "GA4: szczyt ruchu organicznego 33 702 sesji/mies. (01.2024), średnio 28 542/mies. w ostatnich 12 mies. przed zamknięciem; ruch łączny (głównie płatny) >100 tys. w 9 miesiącach, szczyt 175 820 (01.2023). Zbieranie danych zakończone 12.2024. Facebook ZOO24.PL: 44 662 obserwujących (11.2024) → 43 506 (11.2026), interakcje ~0 od 01.2025.",
  historicalOrCurrent: "historical" as const,
  verified: true,
};

const REASON: Record<AccessStatus, string> = {
  connected: "",
  export_manual: "",
  demo: "",
  no_access: "brak dostępu do źródła",
  not_implemented: "pomiar nie wdrożony",
  api_metric_unavailable: "metryka niedostępna w API",
};

/** Okres: 28 pełnych dni kończących się na D-3 (opóźnienie GSC). */
export function period28d(now: Date): { start: string; end: string } {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 3));
  const start = new Date(end.getTime() - 27 * 86400_000);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export function tileFromSource(key: string, label: string, unit: string, r: AggregateResult): KpiTile {
  const raw = r.metrics[key];
  const has = (r.accessStatus === "connected" || r.accessStatus === "export_manual" || r.accessStatus === "demo") && raw !== undefined && raw !== null;
  const status: AccessStatus = has ? r.accessStatus : raw === null ? "api_metric_unavailable" : r.accessStatus === "connected" ? "api_metric_unavailable" : r.accessStatus;
  return {
    key, label, unit,
    value: has ? (raw as number) : null,
    display: has ? `${(raw as number).toLocaleString("pl-PL")}${r.accessStatus === "demo" ? " (DEMO)" : ""}` : `N/A — ${REASON[status] || "brak danych"}`,
    dataSource: r.source, accessStatus: status,
    periodStart: r.periodStart, periodEnd: r.periodEnd,
    lastVerifiedAt: r.lastSyncAt, historicalOrCurrent: "current", demo: r.accessStatus === "demo",
  };
}

function naTile(key: string, label: string, unit: string, source: KpiTile["dataSource"], status: AccessStatus, p: { start: string; end: string }, reason?: string): KpiTile {
  return { key, label, unit, value: null, display: `N/A — ${reason ?? REASON[status]}`, dataSource: source, accessStatus: status, periodStart: p.start, periodEnd: p.end, lastVerifiedAt: null, historicalOrCurrent: "current", demo: false };
}

function internalTile(key: string, label: string, unit: string, value: number, p: { start: string; end: string }, now: Date): KpiTile {
  return { key, label, unit, value, display: value.toLocaleString("pl-PL"), dataSource: "internal", accessStatus: "connected", periodStart: p.start, periodEnd: p.end, lastVerifiedAt: now.toISOString(), historicalOrCurrent: "current", demo: false };
}

export interface Dashboard {
  period: { start: string; end: string };
  claim: typeof HISTORICAL_OWNER_CLAIM;
  historicalVerified: typeof HISTORICAL_VERIFIED_GA4;
  connections: { source: SourceId; accessStatus: AccessStatus; lastSyncAt: string | null }[];
  organic: KpiTile[];
  social: KpiTile[];
  directory: KpiTile[];
  money: KpiTile[];
  ops: KpiTile[];
  legacyTop5: { path: string; decision: string; clicks: string }[];
}

export async function buildDashboard(state: AppState, sources: Record<SourceId, ReadSource>, now = new Date()): Promise<Dashboard> {
  const p = period28d(now);
  const [gsc, ga4, fb, ig] = await Promise.all([
    sources.gsc.fetch28d(p.start, p.end), sources.ga4.fetch28d(p.start, p.end),
    sources.meta_fb.fetch28d(p.start, p.end), sources.meta_ig.fetch28d(p.start, p.end),
  ]);

  // Zdarzenia katalogu: liczymy tylko rekordy nie-DEMO z okresu. Brak produkcyjnego pomiaru => N/A.
  const liveEvents = state.events.filter((e) => !e.demo && e.day >= p.start && e.day <= p.end);
  const eventTile = (type: DirectoryEvent["type"], label: string) =>
    liveEvents.length === 0
      ? naTile(type, label, "kliknięcia", "internal", "not_implemented", p, "brak produkcyjnego pomiaru (F1: tylko DEMO)")
      : internalTile(type, label, "kliknięcia", liveEvents.filter((e) => e.type === type).reduce((a, e) => a + e.count, 0), p, now);

  const posts = state.socialPosts;
  const approvedOrLater = posts.filter((x) => ["approved", "scheduled", "publishing", "published"].includes(x.status)).length;
  const publishedReal = posts.filter((x) => x.status === "published" && !x.demo).length;

  return {
    period: p,
    claim: HISTORICAL_OWNER_CLAIM,
    historicalVerified: HISTORICAL_VERIFIED_GA4,
    connections: [gsc, ga4, fb, ig].map((r) => ({ source: r.source, accessStatus: r.accessStatus, lastSyncAt: r.lastSyncAt })),
    organic: [
      tileFromSource("gsc_clicks", "GSC kliknięcia (28 dni)", "kliknięcia", gsc),
      tileFromSource("ga4_organic_sessions", "GA4 sesje organiczne", "sesje", ga4),
      tileFromSource("legacy_url_landing_sessions", "Sesje na odzyskiwanych URL", "sesje", ga4),
      tileFromSource("new_content_landing_sessions", "Sesje na nowych treściach", "sesje", ga4),
    ],
    social: [
      tileFromSource("facebook_followers_total", "Facebook obserwujący (≠ aktywni odbiorcy)", "osoby", fb),
      tileFromSource("facebook_engagements", "Facebook interakcje", "interakcje", fb),
      tileFromSource("facebook_reach", "Facebook zasięg", "konta", fb),
      tileFromSource("facebook_link_clicks", "Facebook kliknięcia linku", "kliknięcia", fb),
      tileFromSource("facebook_sessions", "Sesje z Facebooka (UTM)", "sesje", ga4),
      tileFromSource("instagram_followers_total", "Instagram obserwujący", "osoby", ig),
      tileFromSource("instagram_reach", "Instagram zasięg", "konta", ig),
      tileFromSource("instagram_link_clicks", "Instagram kliknięcia linku", "kliknięcia", ig),
      tileFromSource("instagram_sessions", "Sesje z Instagrama (UTM)", "sesje", ga4),
    ],
    directory: [
      eventTile("business_site_outbound", "Wyjścia na strony firm"),
      eventTile("business_phone_outbound", "Kliknięcia tel:"),
      eventTile("article_to_directory", "Poradnik → katalog"),
      eventTile("tool_result", "Narzędzia: pokazany wynik kalkulatora"),
      eventTile("tool_export", "Narzędzia: wydruk/pobranie listy"),
      eventTile("search_no_results", "Wyszukiwania miast spoza pilotażu"),
      naTile("affiliate_outbound", "Kliknięcia afiliacyjne", "kliknięcia", "internal", "not_implemented", p, "afiliacja nieuruchomiona"),
    ],
    money: [
      naTile("affiliate_revenue_approved", "Prowizje rozliczone", "PLN netto", "manual", "no_access", p, "brak programów/raportu"),
      naTile("premium_mrr_net", "MRR premium", "PLN netto", "internal", "not_implemented", p, "płatności poza F1"),
      naTile("costs_month", "Koszty miesiąca", "PLN netto", "manual", "no_access", p, "brak zestawienia kosztów"),
      naTile("owner_minutes", "Czas właściciela", "min", "manual", "no_access", p, "brak wpisu ręcznego"),
    ],
    ops: [
      internalTile("redirects_pending_approval", "Mapowania URL do akceptacji", "szt.", state.legacyUrls.filter((l) => l.status === "needs_review" || l.status === "draft").length, p, now),
      internalTile("social_needs_review", "Posty do akceptacji", "szt.", posts.filter((x) => x.status === "needs_review" || x.status === "draft").length, p, now),
      internalTile("social_approved_pipeline", "Posty zatwierdzone/zaplanowane", "szt.", approvedOrLater, p, now),
      internalTile("social_published_real", "Opublikowane realnie", "szt.", publishedReal, p, now),
    ],
    legacyTop5: state.legacyUrls
      .filter((l) => l.historicalClicks !== null && !l.demo)
      .sort((a, b) => (b.historicalClicks ?? 0) - (a.historicalClicks ?? 0))
      .slice(0, 5)
      .map((l) => ({ path: l.oldPath, decision: l.proposedAction ?? "pending", clicks: String(l.historicalClicks) })),
  };
}

/** Raport tygodniowy (format AUTOMATION_RUNBOOK §6) — każde KPI ze źródłem; N/A przy brakach. */
export function renderWeeklyReport(d: Dashboard, weekLabel: string, decisions: string[]): string {
  const line = (t: KpiTile) => `${t.label}: ${t.display} [źródło: ${t.dataSource}, status: ${t.accessStatus}, okres ${t.periodStart}–${t.periodEnd}]`;
  return [
    `[ZOO24] TYDZIEŃ ${weekLabel} — dane rzeczywiste lub N/A (F1: brak podłączonych źródeł)`,
    `Benchmark historyczny (deklaracja): ${d.claim.text}`,
    `Historia zweryfikowana: ${d.historicalVerified.text} [źródło: ${d.historicalVerified.source}]`,
    "", "SEO:", ...d.organic.map(line),
    `Top odzyskiwane URL: ${d.legacyTop5.length ? d.legacyTop5.map((x) => x.path).join(", ") : "N/A — brak eksportu GSC"}`,
    "", "Social:", ...d.social.map(line),
    "", "Katalog:", ...d.directory.map(line),
    "", "Pieniądze i czas:", ...d.money.map(line),
    "", "Operacje:", ...d.ops.map(line),
    "", `AKCEPTACJE (maks. 3): ${decisions.slice(0, 3).map((x, i) => `${i + 1}) ${x}`).join(" ")}`,
    "Ograniczenia: in-app browsery FB/IG gubią referrer; GSC clicks ≠ GA4 sessions; outbound ≠ rezerwacja.",
  ].join("\n");
}
