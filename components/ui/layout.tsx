import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "./cn";

export function Container({ children, className, size = "page" }: { children: ReactNode; className?: string; size?: "page" | "prose" | "wide" }) {
  const max = size === "prose" ? "max-w-[var(--container-prose)]" : size === "wide" ? "max-w-[88rem]" : "max-w-[var(--container-page)]";
  return <div className={cn("mx-auto w-full px-4 sm:px-6", max, className)}>{children}</div>;
}

export function Section({ children, className, tone = "default", id, labelledBy }: { children: ReactNode; className?: string; tone?: "default" | "soft" | "surface"; id?: string; labelledBy?: string }) {
  const bg = tone === "soft" ? "bg-brand-tint" : tone === "surface" ? "bg-surface" : "";
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-12 sm:py-16", bg, className)}>
      {children}
    </section>
  );
}

export function SectionHeading({ id, eyebrow, title, lead, action }: { id?: string; eyebrow?: string; title: ReactNode; lead?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-accent-dark">{eyebrow}</p>}
        <h2 id={id} className="text-2xl sm:text-3xl font-bold">{title}</h2>
        {lead && <p className="mt-2 text-ink-muted">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, lead, breadcrumbs, meta, children }: { title: ReactNode; lead?: ReactNode; breadcrumbs?: Crumb[]; meta?: ReactNode; children?: ReactNode }) {
  return (
    <header className="border-b border-line bg-surface">
      <Container className="py-8 sm:py-10">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <h1 className="text-3xl sm:text-4xl font-bold">{title}</h1>
        {lead && <p className="mt-3 max-w-2xl text-lg text-ink-muted">{lead}</p>}
        {meta && <div className="mt-4 flex flex-wrap items-center gap-2">{meta}</div>}
        {children}
      </Container>
    </header>
  );
}

export type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Ścieżka nawigacji" className="mb-4 text-sm text-ink-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight aria-hidden size={14} className="shrink-0" />}
            {it.href ? (
              <Link href={it.href} className="inline-flex min-h-6 items-center rounded truncate hover:text-brand hover:underline">{it.label}</Link>
            ) : (
              <span aria-current="page" className="truncate font-medium text-ink">{it.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Card({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "li" | "article" | "section" }) {
  return <Tag className={cn("rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-card)]", className)}>{children}</Tag>;
}
