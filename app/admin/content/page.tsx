import Link from "next/link";
import { getStore } from "@/lib/store/file-store";
import { articleHref, checkArticlePolicy, requiredReviewRole, reviewBlockers } from "@/lib/content/editorial";
import { effectiveRisk } from "@/lib/taxonomy/animals";

const ROLE_PL: Record<string, string> = { editor: "redaktor", species_specialist: "specjalista gatunkowy (człowiek)", veterinarian: "lekarz weterynarii", legal: "weryfikacja prawna" };
const RISK_PL: Record<string, string> = { standard: "standard", welfare: "dobrostan", health: "zdrowie", legal: "prawo" };
import { articleAction } from "../actions";
import { requireAdmin } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

export default async function ContentAdmin() {
  await requireAdmin();
  const s = getStore().read();
  const items = [...s.articles].sort((a, b) => Number(a.demo) - Number(b.demo) || a.status.localeCompare(b.status));
  const lastErrors = s.audit.filter((x) => x.entity === "article" && (x.action.endsWith("failed") || x.action === "approve_blocked")).slice(-3).reverse();
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Treści — kolejka redakcyjna</h1>
      <p className="text-sm text-ink-muted">Artykuły przygotowane z pomocą AI startują jako <strong>needs_review</strong> i są niewidoczne publicznie. Publikacja wymaga sprawdzenia faktów i źródeł przez redaktora oraz kliknięcia „Zatwierdź”. Publikacja = widoczność w lokalnym prototypie, nie na zoo24.pl.</p>
      {(() => {
        const last = [...s.audit].reverse().find((x) => x.entity === "article");
        if (!last || Date.now() - new Date(last.at).getTime() > 60_000) return null;
        const ok = /published|submitted|to_draft/.test(last.action);
        return (
          <p role="status" className={`rounded-[var(--radius-md)] p-3 text-sm font-medium ${ok ? "bg-ok-soft text-ok" : "bg-danger-soft text-danger"}`}>
            {ok ? "Wykonano: " : "Nie wykonano: "}{last.action === "article_published" ? "artykuł opublikowany (lokalnie)" : last.action === "article_submitted" ? "zgłoszono do akceptacji" : last.action === "article_to_draft" ? "cofnięto do szkicu" : "operacja zablokowana — szczegóły poniżej"} · {last.entityId}
          </p>
        );
      })()}
      {lastErrors.length > 0 && (
        <ul className="rounded-[var(--radius-sm)] border border-line bg-danger-soft p-2 text-xs text-danger">{lastErrors.map((e, i) => <li key={i}>{e.at.slice(11, 19)} {e.entityId}: {JSON.stringify(e.meta)}</li>)}</ul>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-canvas text-left"><tr><th className="p-2">Artykuł / adres</th><th className="p-2">Status</th><th className="p-2">Źródła</th><th className="p-2">Przegląd i blokady</th><th className="p-2">Akcje</th></tr></thead>
          <tbody>
            {items.map((a) => {
              const issues = checkArticlePolicy(a);
              const role = requiredReviewRole(a);
              const roleBlock = reviewBlockers(a, { id: "owner", kind: "human", roles: ["editor"] });
              return (
                <tr key={a.slug} className="border-t border-line align-top">
                  <td className="p-2"><p className="font-medium">{a.title}</p><p className="font-mono text-xs text-ink-muted">{articleHref(a)}{a.demo ? " · DEMO" : ""}</p></td>
                  <td className="p-2">{a.status}{a.reviewedBy ? <p className="text-xs text-ink-muted">zatw.: {a.reviewedBy}</p> : null}</td>
                  <td className="p-2">{a.sources.filter((x) => x.url).length}</td>
                  <td className="p-2 text-xs">
                    <p>Klasa: <strong>{RISK_PL[effectiveRisk(a.risk ?? "standard", a.needs ?? [])]}</strong> · wymagany: <strong>{ROLE_PL[role]}</strong></p>
                    {a.review?.waitingReason && a.status !== "published" ? <p className="mt-1 text-warn">Czeka: {a.review.waitingReason}</p> : null}
                    {roleBlock.length && a.status === "needs_review" ? <p className="mt-1 text-danger">Panel właściciela nie może zatwierdzić — potrzebny {ROLE_PL[role]}.</p> : null}
                    {issues.length ? <p className="mt-1 text-danger">{issues.join(", ")}</p> : <p className="mt-1 text-ok">Polityka treści: OK</p>}
                  </td>
                  <td className="p-2">
                    <div className="flex flex-col gap-1">
                      <Link href={`/admin/content/${a.slug}`} className="rounded-[var(--radius-sm)] border border-line px-2 py-1 text-center text-xs no-underline">Podgląd</Link>
                      <form action={articleAction} className="flex flex-col gap-1">
                        <input type="hidden" name="slug" value={a.slug} />
                        {a.status === "needs_review" && roleBlock.length === 0 && <button name="op" value="approve" className="rounded-[var(--radius-sm)] bg-brand min-h-10 px-3 text-xs text-white">Zatwierdź</button>}
                        {a.status === "draft" && <button name="op" value="submit" className="rounded-[var(--radius-sm)] border border-line min-h-10 px-3 text-xs">Do akceptacji</button>}
                        {a.status !== "draft" && <button name="op" value="draft" className="rounded-[var(--radius-sm)] border border-line min-h-10 px-3 text-xs">Cofnij do draftu</button>}
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
