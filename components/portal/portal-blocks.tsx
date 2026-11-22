// Bloki portalu V3 (serwerowe): karty grup, narzędzia, listy materiałów, baner działu niepublicznego, nota o źródłach wiedzy.
import Link from "next/link";
import { ArrowRight, Calculator, ClipboardList, EyeOff, Info, PawPrint } from "lucide-react";
import type { Article } from "@/lib/types";
import type { GroupVisibility, ToolRef } from "@/lib/portal/visibility";
import { articlesLabel, plPlural } from "@/components/editorial/format";
import { ArticleCard } from "@/components/editorial/article-card";
import { cn } from "@/components/ui";

export function GroupCard({ v, headingLevel = 3 }: { v: GroupVisibility; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  const n = v.publishedArticles.length;
  return (
    <article className="group relative flex h-full flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-raised)] has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-accent">
      <span aria-hidden className="mb-3 flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-brand-soft text-brand"><PawPrint size={24} /></span>
      <H className="text-xl font-bold">
        <Link href={`/zwierzeta/${v.group.slug}`} className="no-underline after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none">
          {v.group.name}
        </Link>
      </H>
      <p className="mt-1 text-ink-muted">{v.group.intro}</p>
      <p className="mt-auto flex items-center justify-between gap-2 pt-4 text-sm font-semibold text-brand">
        <span>{articlesLabel(n)}{v.publicSpecies.length > 0 ? ` · ${v.publicSpecies.length} ${plPlural(v.publicSpecies.length, "gatunek", "gatunki", "gatunków")}` : ""}</span>
        <ArrowRight aria-hidden size={18} className="transition-transform group-hover:translate-x-0.5" />
      </p>
    </article>
  );
}

const TOOL_ICON: Record<string, typeof ClipboardList> = {
  "/narzedzia/kalkulator-akwarium": Calculator,
};

export function ToolList({ tools, headingLevel = 3, className }: { tools: readonly ToolRef[]; headingLevel?: 2 | 3; className?: string }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <ul className={cn("grid gap-4 md:grid-cols-2", className)}>
      {tools.map((t) => {
        const Icon = TOOL_ICON[t.path] ?? ClipboardList;
        return (
          <li key={t.path} className="relative flex gap-4 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-accent">
            <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-accent-soft text-accent-dark"><Icon size={24} /></span>
            <div className="min-w-0">
              <H className="text-lg font-bold">
                <Link href={t.path} className="no-underline after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none">{t.title}</Link>
              </H>
              <p className="mt-1 text-ink-muted">{t.description}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ArticleGrid({ items }: { items: readonly Article[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => <li key={a.slug}><ArticleCard a={a} /></li>)}
    </ul>
  );
}

/** Podgląd zaplecza poza produkcją (w produkcji takie strony zwracają 404). */
export function NonPublicBanner({ what }: { what: string }) {
  return (
    <div role="note" className="border-b border-warn/30 bg-warn-soft">
      <p className="mx-auto flex max-w-[var(--container-page)] items-start gap-2 px-4 py-3 text-sm font-semibold text-ink sm:px-6">
        <EyeOff aria-hidden size={18} className="mt-0.5 shrink-0 text-warn" />
        <span>{what}. Brak opublikowanych materiałów; strona jest nieindeksowana i w produkcji zwraca 404.</span>
      </p>
    </div>
  );
}

export function KnowledgeSourceNote({ className }: { className?: string }) {
  return (
    <aside aria-labelledby="skad-wiedza" className={cn("rounded-[var(--radius-lg)] border border-line bg-surface p-6", className)}>
      <h2 id="skad-wiedza" className="flex items-center gap-2 text-xl font-bold"><Info aria-hidden size={22} className="text-brand" /> Skąd bierzemy wiedzę</h2>
      <p className="mt-2 text-ink-muted">
        Każdy materiał ma listę źródeł, a kluczowe informacje są powiązane z konkretnym źródłem. Treści o żywieniu, warunkach utrzymania i transporcie wymagają przeglądu osoby z wiedzą o danym gatunku, a tematy zdrowotne — lekarza weterynarii. Udział AI w redakcji oznaczamy jawnie. Nie udzielamy porad weterynaryjnych.
      </p>
      <Link href="/zasady-redakcyjne" className="mt-3 inline-flex min-h-11 items-center gap-1 font-semibold text-brand">Zasady redakcyjne <ArrowRight aria-hidden size={18} /></Link>
    </aside>
  );
}
