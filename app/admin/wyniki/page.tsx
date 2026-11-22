import { getStore } from "@/lib/store/file-store";
import { buildDashboard } from "@/lib/analytics/kpi";
import { getReadSources } from "@/lib/integrations/read-sources";
import { Alert, Breadcrumbs } from "@/components/ui";
import { TileRow } from "@/components/kpi";

export const dynamic = "force-dynamic";

export default async function Wyniki() {
  const d = await buildDashboard(getStore().read(), getReadSources());
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ href: "/admin", label: "Przegląd" }, { label: "Wskaźniki" }]} />
      <h1 className="text-3xl font-bold">Wskaźniki — 28 dni ({d.period.start} – {d.period.end})</h1>
      <div className="flex flex-wrap gap-2 text-xs">
        {d.connections.map((c) => (
          <span key={c.source} className="rounded-full border border-line bg-surface px-3 py-1">{c.source}: {c.accessStatus} · synchronizacja: {c.lastSyncAt ?? "nigdy"}</span>
        ))}
      </div>
      <Alert tone="info" title="Jak czytać">„0” oznacza prawdziwe zero z podłączonego źródła. „N/A” oznacza brak danych (np. brak dostępu) — to nie jest zero. Historia i deklaracje właściciela nie są porównywane z bieżącymi danymi.</Alert>
      <TileRow id="r-org" title="Ruch z wyszukiwarek" tiles={d.organic} />
      <TileRow id="r-soc" title="Social media (FB / IG osobno)" tiles={d.social} />
      <TileRow id="r-dir" title="Katalog — kliknięcia do firm (kliknięcie ≠ pozyskany klient)" tiles={d.directory} />
      <TileRow id="r-money" title="Przychody, koszty, czas" tiles={d.money} />
      <TileRow id="r-ops" title="Operacje (dane wewnętrzne)" tiles={d.ops} />
      <p className="text-xs text-ink-muted">Ograniczenia atrybucji: przeglądarki w aplikacjach FB/IG gubią źródło ruchu; kliknięcia GSC ≠ sesje GA4; Meta link clicks ≠ sesje. Raport tygodniowy: <code>npm run jobs:run -- weekly_kpi_report</code>.</p>
    </div>
  );
}
