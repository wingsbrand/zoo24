import { getStore } from "@/lib/store/file-store";
import { formatWarsaw } from "@/lib/time";
import { checkPublishPolicy } from "@/lib/social/policy";
import { isApprovalCurrent, policyContext } from "@/lib/social/workflow";
import { buildUtmUrl } from "@/lib/analytics/utm";
import { SITE_URL } from "@/lib/site";
import { postAction, runMockPublishJob } from "../actions";
import type { SocialPost } from "@/lib/types";

export const dynamic = "force-dynamic";

const NEXT_OPS: Partial<Record<SocialPost["status"], [string, string][]>> = {
  draft: [["submit", "Do akceptacji"], ["cancel", "Anuluj"]],
  needs_review: [["approve", "Zatwierdź"], ["reject", "Odrzuć"]],
  approved: [["schedule", "Zaplanuj"], ["cancel", "Anuluj"]],
  scheduled: [["cancel", "Anuluj"]],
};

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-canvas", needs_review: "bg-amber-200", approved: "bg-sky-200", scheduled: "bg-indigo-200",
  publishing: "bg-indigo-300", published: "bg-emerald-200", failed: "bg-red-200", held: "bg-orange-200", rejected: "bg-red-100", cancelled: "bg-line",
};

export default function SocialAdmin() {
  const s = getStore().read();
  const ctx = policyContext(s, new Date());
  const posts = [...s.socialPosts].sort((a, b) => (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? ""));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold">Social Operations — kalendarz 14 dni</h1>
        <form action={runMockPublishJob}><button className="rounded bg-brand px-3 py-1.5 text-sm text-white">Uruchom job publikacji (MOCK)</button></form>
        <a href="/api/admin/social-export" className="rounded-[var(--radius-sm)] border border-line px-3 py-1.5 text-sm no-underline">Eksport CSV (Meta Business Suite)</a>
      </div>
      <p className="text-sm text-ink-muted">Kolejka: draft → needs_review → approved → scheduled → published/failed. Zatwierdzenie wymaga praw do grafiki, źródeł, opublikowanej strony docelowej i braku placeholderów. Publikacja w F1 to wyłącznie <strong>symulacja MOCK</strong> — nic nie trafia na Facebook ani Instagram. Kill switch: {s.settings.publishEnabled ? "zwolniony" : "aktywny (wstrzymane)"}.</p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm border-collapse">
          <thead className="bg-canvas text-left">
            <tr><th className="p-2">Termin (Warszawa)</th><th className="p-2">Kanał</th><th className="p-2">Treść</th><th className="p-2">Status</th><th className="p-2">Blokady polityki</th><th className="p-2">Akcje</th></tr>
          </thead>
          <tbody>
            {posts.map((p) => {
              const issues = checkPublishPolicy(p, ctx);
              return (
                <tr key={p.id} className="border-t border-line align-top">
                  <td className="p-2 whitespace-nowrap">{formatWarsaw(p.scheduledAt)}<br /><span className="text-xs text-ink-muted">{p.id} · filar {p.pillar}</span></td>
                  <td className="p-2">{p.platform === "facebook" ? "Facebook" : "Instagram"}</td>
                  <td className="p-2 max-w-md">
                    <p className="font-medium">{p.topic}</p>
                    <details><summary className="cursor-pointer text-xs text-brand">copy, CTA, alt, link</summary>
                      <p className="whitespace-pre-line mt-1">{p.copy}</p>
                      <p className="mt-1"><strong>CTA:</strong> {p.cta}</p>
                      <p className="mt-1"><strong>Alt:</strong> {p.altText}</p>
                      <p className="mt-1 break-all"><strong>URL:</strong> {buildUtmUrl(SITE_URL, p.targetPath, p.utm)}</p>
                      <p className="mt-1"><strong>Źródła:</strong> {p.sourceRefs.join("; ")}</p>
                      <p className="mt-1"><strong>Asset:</strong> {p.assetId} · <strong>Disclosure:</strong> {p.disclosure ?? "brak (nie sponsorowany)"}</p>
                    </details>
                  </td>
                  <td className="p-2">
                    <span className={`rounded px-2 py-0.5 text-xs ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                    {p.demo && <span className="ml-1 text-xs text-warn">DEMO</span>}
                    {isApprovalCurrent(p) && <p className="text-xs text-ink-muted mt-1">zatw. v{p.approvedVersion}</p>}
                    {p.externalPostId && <p className="text-xs mt-1">{p.externalPostId}</p>}
                    {p.lastError && <p className="text-xs text-danger mt-1 break-words">{p.lastError}</p>}
                  </td>
                  <td className="p-2 text-xs">{issues.length ? <ul className="text-danger">{issues.map((i) => <li key={i}>{i}</li>)}</ul> : <span className="text-ok">OK</span>}</td>
                  <td className="p-2">
                    <form action={postAction} className="flex flex-col gap-1">
                      <input type="hidden" name="id" value={p.id} />
                      {(NEXT_OPS[p.status] ?? []).map(([op, label]) => (
                        <button key={op} name="op" value={op} className="rounded-[var(--radius-sm)] border border-line min-h-10 px-3 text-xs hover:bg-canvas">{label}</button>
                      ))}
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section>
        <h2 className="font-semibold mb-2">Rejestr assetów i licencji</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-canvas text-left"><tr><th className="p-2">ID</th><th className="p-2">Opis</th><th className="p-2">Licencja</th><th className="p-2">Dowód</th><th className="p-2">Sprawdzono</th><th className="p-2">Wygasa</th></tr></thead>
          <tbody>{s.socialAssets.map((a) => (
            <tr key={a.id} className="border-t border-line"><td className="p-2">{a.id}</td><td className="p-2">{a.description}</td>
              <td className={`p-2 ${a.licenseType === "unknown" ? "text-danger font-medium" : ""}`}>{a.licenseType}</td>
              <td className="p-2">{a.licenseProof ?? "—"}</td><td className="p-2">{a.rightsCheckedAt ?? "—"}</td><td className="p-2">{a.expiresAt ?? "—"}</td></tr>
          ))}</tbody>
        </table></div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Audit log (ostatnie 15)</h2>
        <ul className="text-xs font-mono space-y-0.5 break-all">{s.audit.slice(-15).reverse().map((a, i) => <li key={i}>{a.at} · {a.actor} · {a.action} · {a.entityId ?? ""} {Object.keys(a.meta).length ? JSON.stringify(a.meta) : ""}</li>)}</ul>
      </section>
    </div>
  );
}
