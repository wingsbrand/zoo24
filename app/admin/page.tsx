import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, CheckCircle2, CirclePause, CirclePlay, History, ListChecks, Activity, TrendingUp } from "lucide-react";
import { getStore } from "@/lib/store/file-store";
import { buildDashboard } from "@/lib/analytics/kpi";
import { getReadSources } from "@/lib/integrations/read-sources";
import { automationStatus, auditLabel, changesSince, pendingDecisions } from "@/lib/admin/overview";
import { OWNER_DECISIONS } from "@/lib/decisions";
import { formatWarsaw } from "@/lib/time";
import { Alert, Badge, Button, Card } from "@/components/ui";
import { Tile } from "@/components/kpi";
import { loadPolicy } from "@/lib/ops/policy";
import { loadScheduleConfig } from "@/lib/ops/schedule";
import { toggleKillSwitch, resetDemo, enableChannel, runOpsShadow } from "./actions";
import { VisitMarker } from "./visit-marker";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

function Q({ n, icon: Icon, title, children, id }: { n: number; icon: typeof ListChecks; title: string; children: React.ReactNode; id: string }) {
  return (
    <Card as="section" className="min-w-0 p-5">
      <h2 id={id} className="mb-4 flex items-center gap-2 text-lg font-bold">
        <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-sm text-brand">{n}</span>
        <Icon aria-hidden size={20} className="text-brand" /> {title}
      </h2>
      {children}
    </Card>
  );
}

export default async function AdminHome() {
  await requireAdmin();
  const s = getStore().read();
  const d = await buildDashboard(s, getReadSources());
  const decisions = pendingDecisions(s);
  const totalDecisions = decisions.reduce((a, x) => a + x.count, 0);
  const auto = automationStatus(s, loadPolicy(), loadScheduleConfig());
  const lastVisit = (await cookies()).get("zoo24_admin_lv")?.value ?? null;
  const changes = changesSince(s, lastVisit);
  const keyTiles = [...d.organic.filter((t) => t.key === "ga4_organic_sessions" || t.key === "gsc_clicks"), ...d.social.filter((t) => t.key === "facebook_followers_total" || t.key === "facebook_engagements"), ...d.directory.slice(0, 2)];

  return (
    <div className="space-y-6">
      <VisitMarker />
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Dzień dobry <span aria-hidden>👋</span></h1>
          <p className="text-ink-muted">Przegląd z {formatWarsaw(new Date().toISOString())} · okres wskaźników {d.period.start} – {d.period.end}</p>
        </div>
        <Badge tone={totalDecisions ? "warn" : "ok"}>{totalDecisions ? `${totalDecisions} spraw czeka na decyzję` : "Nic nie czeka na decyzję"}</Badge>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* 1. Co wymaga mojej decyzji? */}
        <Q n={1} icon={ListChecks} title="Co wymaga mojej decyzji?" id="q1">
          <ul className="divide-y divide-line">
            {decisions.map((x) => (
              <li key={x.key}>
                <Link href={x.href} className="group flex min-h-14 items-center justify-between gap-3 py-2 no-underline">
                  <span>
                    <span className="font-semibold group-hover:underline">{x.label}</span>
                    <span className="block text-xs text-ink-muted">{x.hint}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className={x.count ? "rounded-full bg-accent px-2.5 py-0.5 text-sm font-bold text-white" : "rounded-full bg-ok-soft px-2.5 py-0.5 text-sm font-semibold text-ok"}>{x.count}</span>
                    <ArrowRight aria-hidden size={16} className="text-ink-muted" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <details className="mt-3 rounded-[var(--radius-md)] bg-canvas p-3 text-sm">
            <summary className="cursor-pointer font-semibold">Decyzje strategiczne właściciela (maks. 3)</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-muted">{OWNER_DECISIONS.map((x) => <li key={x}>{x}</li>)}</ol>
          </details>
        </Q>

        {/* 2. Czy publikacje i automatyzacje działają? */}
        <Q n={2} icon={Activity} title="Czy publikacje i automatyzacje działają?" id="q2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={auto.publishEnabled ? "warn" : "danger"} icon={auto.publishEnabled ? <CirclePlay aria-hidden size={14} /> : <CirclePause aria-hidden size={14} />}>
              Publikacje social: {auto.publishEnabled ? "zwolnione (tylko symulacja MOCK)" : "wstrzymane"}
            </Badge>
            <Badge tone="neutral">Tryb {auto.socialMode} · {auto.socialMode === 0 ? "offline / MOCK" : "assisted"}</Badge>
            <Badge tone={auto.schedulerActive ? "ok" : "info"}>{auto.schedulerActive ? "Harmonogram: aktywny — zadania chmurowe 6 ról (shadow)" : "Harmonogram: nieaktywny — joby uruchamiane ręcznie"}</Badge>
          </div>
          <form action={toggleKillSwitch} className="mt-3 flex flex-wrap gap-2">
            {auto.publishEnabled ? (
              <>
                <Button type="submit" name="enable" value="0" variant="danger" size="sm">Wstrzymaj publikacje</Button>
                <Button type="submit" name="cancelFuture" value="1" variant="secondary" size="sm">Wstrzymaj i anuluj zaplanowane</Button>
              </>
            ) : (
              <Button type="submit" name="enable" value="1" variant="secondary" size="sm">Zwolnij publikacje (symulacja MOCK)</Button>
            )}
          </form>
          {(["facebook", "instagram"] as const).filter((c) => !auto.channels[c]).map((c) => (
            <form key={c} action={enableChannel} className="mt-2">
              <input type="hidden" name="platform" value={c} />
              <Alert tone="warn" title={`Kanał ${c} zapauzowany (np. wygasły token)`}>
                <Button type="submit" variant="link" className="text-sm">Odblokuj kanał po odnowieniu dostępu</Button>
              </Alert>
            </form>
          ))}
          <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[22rem] text-sm">
            <caption className="sr-only">Zadania cykliczne</caption>
            <thead className="text-left text-xs uppercase tracking-wide text-ink-muted"><tr><th className="py-1">Zadanie</th><th className="py-1">Plan</th><th className="py-1">Ostatnie uruchomienie</th></tr></thead>
            <tbody className="divide-y divide-line">
              {auto.jobs.map((j) => (
                <tr key={j.id}>
                  <td className="py-2 pr-2 font-mono text-xs">{j.id}</td>
                  <td className="py-2 pr-2 text-xs text-ink-muted">{j.proposedSchedule} <span className="block">(propozycja, nieaktywne)</span></td>
                  <td className="py-2 text-xs">{j.lastRun ? <>{formatWarsaw(j.lastRun.at)}<span className="block text-ink-muted">{String((j.lastRun.meta as { adapter?: string }).adapter ?? "")}</span></> : <span className="text-ink-muted">brak zapisu</span>}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <div className="mt-5 border-t border-line pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Role operacyjne zoo24-ops</h3>
              <span className="flex flex-wrap gap-2">
                <Badge tone="neutral">Tryb: {auto.ops.mode}</Badge>
                <Badge tone={auto.ops.policyApproved ? "ok" : "info"}>Polityka: {auto.ops.policyApproved ? "zatwierdzona" : "nieaktywna — czeka na właściciela"}</Badge>
                {auto.ops.pause !== "running" && <Badge tone="danger">{auto.ops.pause === "paused" ? "Pauza" : "Pauza częściowa"}</Badge>}
              </span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">Runtime: {auto.ops.runtime}. Przebieg shadow czyta stan serwisu i zapisuje wynik roli — nic nie publikuje.</p>
            <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[26rem] text-sm">
              <caption className="sr-only">Role operacyjne i ich ostatnie przebiegi</caption>
              <thead className="text-left text-xs uppercase tracking-wide text-ink-muted"><tr><th className="py-1">Rola</th><th className="py-1">Plan (czas lokalny)</th><th className="py-1">Ostatni przebieg</th></tr></thead>
              <tbody className="divide-y divide-line">
                {auto.ops.roles.map((r) => (
                  <tr key={r.role}>
                    <td className="py-2 pr-2 font-mono text-xs">{r.agent}</td>
                    <td className="py-2 pr-2 text-xs text-ink-muted">{r.plan}<span className="block">{r.enabled ? "zadanie chmurowe aktywne" : "nieaktywne"}</span></td>
                    <td className="py-2 text-xs">{r.last ? <>{formatWarsaw(r.last.at)} · <span className="font-semibold">{r.last.status}</span><span className="block text-ink-muted">{r.last.mode}{r.last.reason ? ` · ${r.last.reason}` : ""}</span></> : <span className="text-ink-muted">brak przebiegu</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <form action={runOpsShadow} className="mt-2"><Button type="submit" variant="secondary" size="sm">Uruchom przebieg shadow 6 ról</Button></form>
          </div>
          {auto.lastErrors.length > 0 && (
            <div className="mt-3 space-y-1 text-xs">
              <p className="font-semibold">Ostatnie blokady i błędy</p>
              {auto.lastErrors.map((e, i) => <p key={i} className="text-ink-muted">{formatWarsaw(e.at)} · {auditLabel(e)} · {e.entityId}</p>)}
            </div>
          )}
        </Q>

        {/* 3. Jak zmieniają się wyniki? */}
        <Q n={3} icon={TrendingUp} title="Jak zmieniają się najważniejsze wyniki?" id="q3">
          <div className="grid gap-3 sm:grid-cols-2">{keyTiles.map((t) => <Tile key={t.key} t={t} />)}</div>
          <p className="mt-3 text-xs text-ink-muted">
            Historia zweryfikowana ({d.historicalVerified.period}): {d.historicalVerified.text} <br />
            Deklaracja właściciela (niezweryfikowana): 100k+ wejść/mies. — nie jest wynikiem i nie wchodzi do obliczeń.
          </p>
          <Link href="/admin/wyniki" className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand">Wszystkie wskaźniki i źródła <ArrowRight aria-hidden size={16} /></Link>
        </Q>

        {/* 4. Co się wydarzyło od ostatniej wizyty? */}
        <Q n={4} icon={History} title="Co się wydarzyło od ostatniej wizyty?" id="q4">
          <p className="mb-2 text-sm text-ink-muted">{changes.since ? `Od ${formatWarsaw(changes.since)}: ${changes.total} zdarzeń.` : "Pierwsza wizyta w panelu — pokazujemy ostatnie zdarzenia."}</p>
          {changes.items.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-ink-muted"><CheckCircle2 aria-hidden size={18} className="text-ok" /> Brak nowych zdarzeń.</p>
          ) : (
            <ol className="space-y-2 text-sm">
              {changes.items.map((e, i) => (
                <li key={i} className="flex gap-3">
                  <time className="w-28 shrink-0 text-xs text-ink-muted" dateTime={e.at}>{formatWarsaw(e.at)}</time>
                  <span><span className="font-medium">{auditLabel(e)}</span>{e.entityId ? <span className="text-ink-muted"> · {e.entityId}</span> : null}</span>
                </li>
              ))}
            </ol>
          )}
        </Q>
      </div>

      <form action={resetDemo} className="text-right"><Button type="submit" variant="link" className="text-xs text-ink-muted">Przywróć dane DEMO (lokalnie)</Button></form>
    </div>
  );
}
