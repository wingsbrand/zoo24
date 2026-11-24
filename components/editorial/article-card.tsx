// Karta poradnika: okładka 16:9, grupa zwierząt (jeśli przypisana), temat, tytuł (line-clamp), lead, data aktualizacji, DEMO. Cała karta klikalna (rozciągnięty link).
import Link from "next/link";
import type { Article } from "@/lib/types";
import { articleHref } from "@/lib/content/editorial";
import { topicForArticle } from "@/lib/content/topics";
import { articleImage } from "@/lib/content/images";
import { groupName } from "@/lib/portal/labels";
import { NEEDS } from "@/lib/taxonomy/animals";
import { DemoBadge, cn } from "@/components/ui";
import { Cover } from "./cover";
import { formatDatePl } from "./format";
import { articleDates } from "@/lib/content/presentation";

export function ArticleCard({ a, headingLevel = 3, className }: { a: Article; headingLevel?: 2 | 3; className?: string }) {
  const topic = topicForArticle(a);
  const H = headingLevel === 2 ? "h2" : "h3";
  const dates = articleDates(a);
  const shown = dates.published ? dates.modified : null;
  const updated = formatDatePl(shown);
  const animal = groupName(a);
  // V3: dla materiałów z osią potrzeb pokazujemy potrzebę opiekuna zamiast starego tematu (psy/koty).
  const label = a.needs?.length ? (NEEDS.find((n) => n.slug === a.needs![0])?.name ?? topic.name) : topic.name;
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-card)]",
        "transition-shadow duration-150 hover:shadow-[var(--shadow-raised)] has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-accent",
        className,
      )}
    >
      <Cover topic={topic} image={articleImage(a.slug)} />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-sm font-semibold text-accent-dark">
          {animal ? <><span className="text-brand">{animal}</span><span aria-hidden> · </span><span className="sr-only">, temat: </span></> : null}
          {label}
        </p>
        <H className="text-xl font-bold leading-snug">
          <Link
            href={articleHref(a)}
            className="line-clamp-3 rounded no-underline after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none"
          >
            {a.title}
          </Link>
        </H>
        <p className="line-clamp-3 text-ink-muted">{a.summary}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3 text-sm text-ink-muted">
          {updated ? (
            <span>
              {dates.showUpdated ? "Zaktualizowano" : "Opublikowano"} <time dateTime={shown!}>{updated}</time>
            </span>
          ) : <span />}
          <span className="relative z-10"><DemoBadge show={a.demo} /></span>
        </div>
      </div>
    </article>
  );
}
