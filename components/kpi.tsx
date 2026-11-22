import type { KpiTile } from "@/lib/analytics/kpi";
import { cn } from "@/components/ui/cn";

const STATUS_LABEL: Record<string, string> = {
  connected: "podłączone", export_manual: "eksport ręczny", no_access: "brak dostępu", not_implemented: "nie wdrożone",
  api_metric_unavailable: "metryka niedostępna w API", demo: "DEMO",
};

/** Kafel wskaźnika: wartość, okres, źródło, aktualność. Rzeczywiste 0 ≠ brak danych (N/A). */
export function Tile({ t }: { t: KpiTile }) {
  const na = t.value === null;
  return (
    <div className={cn("flex min-h-32 flex-col rounded-[var(--radius-lg)] border p-4", na ? "border-dashed border-line-strong bg-canvas" : "border-line bg-surface shadow-[var(--shadow-card)]")}>
      <p className="text-sm font-medium text-ink-muted">{t.label}</p>
      {na ? (
        <p className="mt-1 text-base font-semibold text-ink-muted"><span className="mr-1 font-mono text-lg">N/A</span><span className="text-sm font-normal">{t.display.replace(/^N\/A — /, "— ")}</span></p>
      ) : (
        <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-brand-dark">{t.display}</p>
      )}
      <p className="mt-auto pt-2 text-xs text-ink-muted">
        {t.periodStart}–{t.periodEnd} · {t.dataSource} · {STATUS_LABEL[t.accessStatus] ?? t.accessStatus}
        {t.lastVerifiedAt ? ` · stan z ${t.lastVerifiedAt.slice(0, 10)}` : ""}
      </p>
    </div>
  );
}

export function TileRow({ title, tiles, id }: { title: string; tiles: KpiTile[]; id?: string }) {
  return (
    <section aria-labelledby={id}>
      <h3 id={id} className="mb-2 font-[family-name:var(--font-sans)] text-sm font-bold uppercase tracking-wide text-ink-muted">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{tiles.map((t) => <Tile key={t.key} t={t} />)}</div>
    </section>
  );
}
