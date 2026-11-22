// Karta poradnika: okładka 16:9, temat, tytuł (line-clamp), lead, data aktualizacji, DEMO. Cała karta klikalna (rozciągnięty link).
import Link from "next/link";
import type { Article } from "@/lib/types";
import { articleHref } from "@/lib/content/editorial";
import { topicForArticle } from "@/lib/content/topics";
import { DemoBadge, cn } from "@/components/ui";
import { Cover } from "./cover";
import { formatDatePl } from "./format";

export function ArticleCard({ a, headingLevel = 3, className }: { a: Article; headingLevel?: 2 | 3; className?: string }) {
  const topic = topicForArticle(a);
  const H = headingLevel === 2 ? "h2" : "h3";
  const updated = formatDatePl(a.updatedAt);
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-card)]",
        "transition-shadow duration-150 hover:shadow-[var(--shadow-raised)] has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-accent",
        className,
      )}
    >
      <Cover topic={topic} />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-sm font-semibold text-accent-dark">{topic.name}</p>
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
              Zaktualizowano <time dateTime={a.updatedAt}>{updated}</time>
            </span>
          ) : <span />}
          <span className="relative z-10"><DemoBadge show={a.demo} /></span>
        </div>
      </div>
    </article>
  );
}
