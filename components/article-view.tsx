import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, ClipboardCheck, ExternalLink, ListTree } from "lucide-react";
import type { Article } from "@/lib/types";
import { isAgentIdentity } from "@/lib/ops/identity";
import { Alert, Badge, Breadcrumbs, Container, DemoBadge } from "@/components/ui";
import { buildToc, headingText, isH2, isH3, midContentInsertIndex, shouldShowToc, type TocEntry } from "@/lib/content/toc";
import { hubHref, relatedArticles, topicForArticle } from "@/lib/content/topics";
import { Cover } from "@/components/editorial/cover";
import { ArticleCard } from "@/components/editorial/article-card";
import { ServiceInline, ServiceSection } from "@/components/editorial/service-links";
import { formatDatePl, readingMinutes } from "@/components/editorial/format";
import { allArticles } from "@/components/editorial/queries";

function TocList({ toc }: { toc: TocEntry[] }) {
  return (
    <ol className="space-y-1 text-[0.95rem]">
      {toc.map((t) => (
        <li key={t.id}>
          <a href={`#${t.id}`} className="flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 py-1.5 text-ink no-underline hover:bg-brand-soft hover:text-brand-dark">
            {t.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

/**
 * Wspólny widok artykułu: /poradniki/*, /blog/* i podgląd redakcyjny w panelu (`preview`).
 * Akapit zaczynający się od "## " = śródtytuł h2 ("### " = h3). Jeden h1 (tytuł).
 * `related` — opcjonalnie; domyślnie wyliczane z magazynu (ten sam temat, tylko opublikowane, max 3).
 */
export function ArticleView({ a, preview = false, related }: { a: Article; preview?: boolean; related?: Article[] }) {
  const topic = topicForArticle(a);
  const toc = buildToc(a.body);
  const idByIndex = new Map(toc.map((t) => [t.index, t.id]));
  const showToc = shouldShowToc(toc);
  const midAt = a.relatedServicePaths.length ? midContentInsertIndex(a.body) : null;
  const rel = related ?? relatedArticles(a, allArticles(), 3);
  const updated = formatDatePl(a.updatedAt);
  const published = formatDatePl(a.publishedAt);
  const minutes = readingMinutes([a.summary, ...a.body]);

  return (
    <article>
      {preview && (
        <Container className="pt-6">
          <Alert tone="warn" title="Podgląd redakcyjny — niewidoczne publicznie do akceptacji">
            <p>Status: <strong>{a.status}</strong>{a.demo ? " · DEMO (nie może zostać opublikowany)" : ""}.</p>
            {a.reviewNotes?.length ? <ul className="mt-2 list-disc space-y-1 pl-5">{a.reviewNotes.map((n) => <li key={n}>{n}</li>)}</ul> : null}
          </Alert>
        </Container>
      )}

      {/* HERO */}
      <header className="border-b border-line bg-surface">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs items={[{ href: "/", label: "ZOO24" }, { href: "/poradniki", label: "Poradniki" }, { href: hubHref({ temat: topic.slug }), label: topic.name }]} />
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Link href={hubHref({ temat: topic.slug })} className="inline-flex min-h-11 items-center rounded-full bg-accent-soft px-3 text-sm font-semibold text-accent-dark no-underline hover:underline">
                  {topic.name}
                </Link>
                <DemoBadge show={a.demo} />
              </div>
              <h1 className="text-3xl font-bold sm:text-4xl">{a.title}</h1>
              <p className="mt-4 max-w-[var(--container-prose)] text-lg text-ink-muted">{a.summary}</p>
              <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
                <div className="flex gap-1"><dt className="sr-only">Autor</dt><dd className="font-medium text-ink">{a.authorDisplay}</dd></div>
                {updated && <div className="flex gap-1"><dt>Zaktualizowano</dt><dd><time dateTime={a.updatedAt}>{updated}</time></dd></div>}
                {published ? (
                  <div className="flex gap-1"><dt>Opublikowano</dt><dd><time dateTime={a.publishedAt!}>{published}</time></dd></div>
                ) : (
                  <div className="flex gap-1"><dt className="sr-only">Status</dt><dd><Badge tone="warn">Nieopublikowany</Badge></dd></div>
                )}
                {a.reviewedBy ? (
                  <div className="flex gap-1"><dt>Sprawdzone przez:</dt><dd className="font-medium text-ink">
                    {/* Jawność: akceptacja redaktora-AI nie jest przedstawiana jako przegląd człowieka. */}
                    {isAgentIdentity(a.reviewedBy) ? "redakcję ZOO24 z udziałem AI" : a.reviewedBy}
                  </dd></div>
                ) : null}
                <div className="flex items-center gap-1"><dt className="sr-only">Czas czytania</dt><dd className="flex items-center gap-1"><BookOpen aria-hidden size={16} /> ok. {minutes} min czytania</dd></div>
              </dl>
            </div>
            <Cover topic={topic} variant="hero" className="rounded-[var(--radius-xl)]" />
          </div>
        </Container>
      </header>

      <Container className="py-10">
        <div className="lg:grid lg:grid-cols-[minmax(0,var(--container-prose))_16rem] lg:justify-between lg:gap-12">
          <div className="min-w-0 max-w-[var(--container-prose)] space-y-8">
            {a.disclosure && (
              <div role="note" className="rounded-[var(--radius-md)] border-2 border-accent bg-accent-soft p-4">
                <p className="font-semibold text-accent-dark">Reklama · współpraca komercyjna</p>
                <p className="mt-1 text-ink">{a.disclosure}</p>
              </div>
            )}

            {showToc && (
              <details className="rounded-[var(--radius-md)] border border-line bg-surface lg:hidden">
                <summary className="flex min-h-12 cursor-pointer items-center gap-2 px-4 font-semibold text-brand-dark">
                  <ListTree aria-hidden size={18} /> Spis treści
                </summary>
                <nav aria-label="Spis treści" className="border-t border-line p-2">
                  <TocList toc={toc} />
                </nav>
              </details>
            )}

            <div className="prose-zoo">
              {a.body.map((p, i) => (
                <FragmentWithInsert key={i} insert={midAt === i ? <ServiceInline paths={a.relatedServicePaths} slug={a.slug} preview={preview} /> : null}>
                  {isH2(p) ? (
                    <h2 id={idByIndex.get(i)}>{headingText(p)}</h2>
                  ) : isH3(p) ? (
                    <h3>{headingText(p)}</h3>
                  ) : (
                    <p>{p}</p>
                  )}
                </FragmentWithInsert>
              ))}
            </div>

            {a.checklist.length > 0 && (
              <section aria-labelledby="checklista" className="rounded-[var(--radius-lg)] border border-accent/30 bg-accent-soft/60 p-6">
                <h2 id="checklista" className="flex items-center gap-2 text-2xl font-bold">
                  <ClipboardCheck aria-hidden className="text-accent-dark" size={26} /> Checklista
                </h2>
                <ul className="mt-4 space-y-3">
                  {a.checklist.map((c) => (
                    <li key={c} className="flex gap-3 leading-relaxed">
                      <span aria-hidden className="mt-1 size-5 shrink-0 rounded-[6px] border-2 border-accent-dark bg-surface" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <ServiceSection paths={a.relatedServicePaths} slug={a.slug} preview={preview} />

            <section aria-labelledby="zrodla">
              <h2 id="zrodla" className="text-2xl font-bold">Źródła</h2>
              {a.sources.length ? (
                <ol className="mt-3 list-decimal space-y-2 pl-6 text-[0.95rem]">
                  {a.sources.map((s, i) => (
                    <li key={i}>
                      {s.url ? (
                        <a href={s.url} rel="noopener noreferrer" target="_blank" className="inline-flex items-center gap-1 text-brand underline underline-offset-3 hover:text-brand-dark">
                          {s.label} <ExternalLink aria-hidden size={14} /><span className="sr-only">(otwiera się w nowej karcie)</span>
                        </a>
                      ) : (
                        <span>{s.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2 text-ink-muted">Brak źródeł.</p>
              )}
            </section>

            <Alert tone="info" title="To nie jest porada weterynaryjna">
              <p>
                Ten artykuł ma charakter informacyjny i nie zastępuje porady lekarza weterynarii. W sprawach zdrowia zwierzęcia skontaktuj się z lekarzem.
              </p>
            </Alert>
          </div>

          {showToc && (
            <aside className="hidden lg:block">
              <nav aria-label="Spis treści" className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[var(--radius-lg)] border border-line bg-surface p-3">
                <p className="mb-1 px-3 pt-1 text-sm font-semibold uppercase tracking-wide text-ink-muted">Spis treści</p>
                <TocList toc={toc} />
              </nav>
            </aside>
          )}
        </div>
      </Container>

      {rel.length > 0 && (
        <section aria-labelledby="powiazane-poradniki" className="border-t border-line bg-brand-tint py-12">
          <Container>
            <h2 id="powiazane-poradniki" className="text-2xl font-bold sm:text-3xl">Powiązane poradniki</h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rel.map((r) => <li key={r.slug}><ArticleCard a={r} /></li>)}
            </ul>
          </Container>
        </section>
      )}
    </article>
  );
}

function FragmentWithInsert({ insert, children }: { insert: ReactNode; children: ReactNode }) {
  return <>{insert}{children}</>;
}
