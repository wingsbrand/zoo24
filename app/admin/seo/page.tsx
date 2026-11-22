import { getStore } from "@/lib/store/file-store";
import { buildPageRegistry, createLegacyResolver, runSeoChecks, robotsTxt } from "@/lib/seo";
import { SITE_ENV, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function SeoAdmin() {
  const s = getStore().read();
  const registry = buildPageRegistry(s);
  const { resolve, validation } = createLegacyResolver(s.legacyUrls, registry);
  const checks = runSeoChecks(s, registry, s.legacyUrls, { env: SITE_ENV, siteUrl: SITE_URL });
  const indexable = registry.all().filter((p) => p.indexable && !p.demo && !p.draft);
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">SEO Operations</h1>
      <div className="rounded-lg border border-warn/30 bg-warn-soft p-3 text-sm">
        Inwentarz realnych starych URL: <strong>N/A — brak eksportu GSC/sitemap/backupu</strong> (<code>docs/audits/old-url-inventory.csv</code> ma tylko nagłówek). Poniżej wyłącznie fikcyjne rekordy <code>/demo-legacy/*</code> pokazujące reguły. Żadna mapa nie jest wdrożona na zoo24.pl.
      </div>

      <section>
        <h2 className="font-semibold mb-2">Kolejka akceptacji mapy URL (walidacja R1–R12)</h2>
        <p className="text-xs text-ink-muted mb-2">Wersja mapy: {validation.versionHash} · OK: {validation.summary.ok} · odrzucone: {validation.summary.rejected} · blokada mapy: {validation.blocked ? "TAK" : "nie"}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-canvas text-left"><tr><th className="p-2">Stary URL</th><th className="p-2">Seg.</th><th className="p-2">Decyzja → cel</th><th className="p-2">Status review</th><th className="p-2">Walidacja</th><th className="p-2">Odpowiedź lokalna</th></tr></thead>
            <tbody>
              {s.legacyUrls.map((l) => {
                const e = validation.entries.find((x) => x.oldPath === l.oldPath);
                const r = resolve(l.oldPath);
                return (
                  <tr key={l.oldPath} className="border-t border-line align-top">
                    <td className="p-2 font-mono text-xs">{l.oldPath}</td>
                    <td className="p-2">{l.segment}</td>
                    <td className="p-2">{l.proposedAction ?? "brak decyzji"}{l.targetPath ? ` → ${l.targetPath}` : ""}</td>
                    <td className="p-2">{l.status}</td>
                    <td className="p-2 text-xs">{e?.ok ? <span className="text-ok">OK</span> : <span className="text-danger">{e?.errors.join(", ") || "—"}</span>}</td>
                    <td className="p-2 font-mono text-xs">{r.status}{r.location ? ` → ${r.location}` : ""}<br /><span className="text-ink-muted">{r.reason}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {validation.alarms.length > 0 && (
          <ul className="mt-2 text-sm">{validation.alarms.map((a, i) => <li key={i} className={a.severity === "BLOCK" ? "text-danger" : "text-warn"}>{a.severity} {a.code}: {a.detail}</li>)}</ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Checker (MOCK, bez żądań HTTP) — środowisko: {checks.env}</h2>
        {checks.issues.length === 0 ? <p className="text-sm text-ok">Brak problemów w danych lokalnych.</p> : (
          <ul className="text-sm space-y-1">{checks.issues.map((i, k) => <li key={k}><span className="font-mono text-xs">{i.severity.toUpperCase()}</span> {i.issue} — {i.path}: {i.detail}</li>)}</ul>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="font-semibold mb-2">robots.txt ({SITE_ENV})</h2>
          <pre className="rounded bg-ink text-canvas p-3 text-xs">{robotsTxt(SITE_ENV, SITE_URL)}</pre>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Indeksowalne strony (gdyby env=production)</h2>
          <ul className="text-xs font-mono">{indexable.map((p) => <li key={p.path}>{p.path}</li>)}</ul>
          <p className="text-xs text-ink-muted mt-1">Profile i poradniki DEMO oraz listingi z mniej niż 3 realnymi firmami są wykluczone.</p>
        </div>
      </section>
    </div>
  );
}
