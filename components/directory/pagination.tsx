import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/components/ui";
import { pageHref, pageList, sortHref, SORT_LABELS, type ListingFilters, type SortKey } from "@/lib/directory/query";

const item = "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-[var(--radius-md)] px-3 text-sm font-semibold no-underline";

export function Pagination({ base, filters, page, totalPages }: { base: string; filters: ListingFilters; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Stronicowanie wyników" className="mt-8">
      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          {page > 1 ? (
            <Link href={pageHref(base, filters, page - 1)} rel="prev" className={cn(item, "text-brand hover:bg-brand-soft")}>
              <ChevronLeft aria-hidden size={18} /> Poprzednia
            </Link>
          ) : (
            <span aria-disabled="true" className={cn(item, "text-ink-muted/60")}><ChevronLeft aria-hidden size={18} /> Poprzednia</span>
          )}
        </li>
        {pageList(page, totalPages).map((n, i) => (
          <li key={n ?? `gap-${i}`}>
            {n === null ? (
              <span aria-hidden className="px-1 text-ink-muted">…</span>
            ) : n === page ? (
              <span aria-current="page" className={cn(item, "bg-brand text-white")}><span className="sr-only">Strona </span>{n}</span>
            ) : (
              <Link href={pageHref(base, filters, n)} aria-label={`Strona ${n}`} className={cn(item, "border border-line bg-surface text-brand hover:border-brand")}>{n}</Link>
            )}
          </li>
        ))}
        <li>
          {page < totalPages ? (
            <Link href={pageHref(base, filters, page + 1)} rel="next" className={cn(item, "text-brand hover:bg-brand-soft")}>
              Następna <ChevronRight aria-hidden size={18} />
            </Link>
          ) : (
            <span aria-disabled="true" className={cn(item, "text-ink-muted/60")}>Następna <ChevronRight aria-hidden size={18} /></span>
          )}
        </li>
      </ul>
    </nav>
  );
}

/** Sortowanie jako linki (działa bez JS, stan w URL). Tylko kryteria neutralne — bez płatnych pozycji. */
export function SortLinks({ base, filters }: { base: string; filters: ListingFilters }) {
  return (
    <nav aria-label="Sortowanie" className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-semibold text-ink">Sortuj:</span>
      <ul className="flex flex-wrap gap-1">
        {(Object.keys(SORT_LABELS) as SortKey[]).map((s) => (
          <li key={s}>
            <Link
              href={sortHref(base, filters, s)}
              aria-current={filters.sort === s ? "true" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-[var(--radius-md)] px-3 no-underline",
                filters.sort === s ? "bg-brand-soft font-semibold text-brand-dark" : "text-brand hover:bg-brand-tint",
              )}
            >
              {SORT_LABELS[s]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
