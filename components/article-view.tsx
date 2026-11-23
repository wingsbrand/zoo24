import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, ClipboardCheck, ExternalLink, ListTree, ShieldCheck } from "lucide-react";
import type { Article } from "@/lib/types";
import { isAgentIdentity } from "@/lib/ops/identity";
import { Alert, Badge, Breadcrumbs, Container, DemoBadge } from "@/components/ui";
import { buildToc, headingText, isH2, isH3, midContentInsertIndex, shouldShowToc, type TocEntry } from "@/lib/content/toc";
import { hubHref, relatedArticles, topicForArticle } from "@/lib/content/topics";
import { Cover } from "@/components/editorial/cover";
import { articleImage } from "@/lib/content/images";
import { ArticleCard } from "@/components/editorial/article-card";
import { LinkedText } from "@/components/editorial/linked-text";
import { ServiceInline, ServiceSection } from "@/components/editorial/service-links";
import { formatDatePl, readingMinutes } from "@/components/editorial/format";
import { allArticles } from "@/components/editorial/queries";
import { computeVisibility, isSpeciesPublic } from "@/lib/portal/visibility";
import { storeServiceLinks } from "@/lib/portal/queries";
import { FORMAT_LABEL, RISK_LABEL, ROLE_LABEL, needName, reviewStatus } from "@/lib/portal/labels";
import { findSpecies, getGroup, isGroupSlug } from "@/lib/taxonomy/animals";

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
  // Tylko usługi z ≥1 realną opublikowaną firmą (bez linków do pustych kategorii, QA D-06).
  const liveCategories = new Set(storeServiceLinks().categories.map((c) => c.category as string));
  const servicePaths = a.relatedServicePaths.filter((p) => liveCategories.has(p.split("/")[2] ?? ""));
  const midAt = servicePaths.length ? midContentInsertIndex(a.body) : null;
  const rel = related ?? relatedArticles(a, allArticles(), 3);
  const updated = formatDatePl(a.updatedAt);
  const published = formatDatePl(a.publishedAt);
  const minutes = readingMinutes([a.summary, ...a.body]);
  const vis = computeVisibility(allArticles());
  const group = a.animal && isGroupSlug(a.animal.group) ? getGroup(a.animal.group) : null;
  const species = group && a.animal?.species ? findSpecies(group.slug, a.animal.species) : null;
  // Linki tylko do publicznych działów/kart (>=1 opublikowany materiał); inaczej sama nazwa.
  const groupHref = group && vis.groups[group.slug].isPublic ? `/zwierzeta/${group.slug}` : null;
  const speciesHref = group && species && isSpeciesPublic(vis, group.slug, species.slug) ? `/zwierzeta/${group.slug}/${species.slug}` : null;
  const needs = [...new Set(a.needs ?? [])];
  const review = reviewStatus(a);
  const reviewedAt = formatDatePl(review.reviewedAt);
  const dueAt = formatDatePl(review.reviewDueAt);
  const claims = a.claims ?? [];

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
                  <div className="flex gap-1"><dt>Zatwierdzone przez:</dt><dd className="font-medium text-ink">
                    {/* Jawność: akceptacja redaktora-AI nie jest przedstawiana jako przegląd człowieka. */}
                    {isAgentIdentity(a.reviewedBy) ? "redaktora AI ZOO24 (bez przeglądu człowieka)" : a.reviewedBy}
                  </dd></div>
                ) : null}
                <div className="flex items-center gap-1"><dt className="sr-only">Czas czytania</dt><dd className="flex items-center gap-1"><BookOpen aria-hidden size={16} /> ok. {minutes} min czytania</dd></div>
              </dl>
              {(group || needs.length > 0 || a.format) && (
                <dl className="mt-4 space-y-2 text-sm">
                  {group && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <dt className="font-semibold text-ink">Zwierzę:</dt>
                      <dd className="flex flex-wrap items-center gap-1">
                        {groupHref ? <Link href={groupHref} className="inline-flex min-h-11 items-center font-semibold text-brand">{group.name}</Link> : <span>{group.name}</span>}
                        {species && (
                          <>
                            <span aria-hidden>›</span>
                            {speciesHref ? <Link href={speciesHref} className="inline-flex min-h-11 items-center font-semibold text-brand">{species.name}</Link> : <span>{species.name}</span>}
                          </>
                        )}
                      </dd>
                    </div>
                  )}
                  {needs.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <dt className="font-semibold text-ink">Potrzeby:</dt>
                      <dd>
                        <ul className="flex flex-wrap gap-2">
                          {needs.map((n) => (
                            <li key={n}>
                              <Link href={hubHref({ potrzeba: n })} className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-canvas px-3 font-semibold text-brand no-underline hover:border-brand hover:bg-brand-tint">{needName(n)}</Link>
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  )}
                  {a.format && (
                    <div className="flex flex-wrap items-center gap-x-2"><dt className="font-semibold text-ink">Format:</dt><dd>{FORMAT_LABEL[a.format]}</dd></div>
                  )}
                </dl>
              )}
            </div>
            <Cover topic={topic} variant="hero" image={articleImage(a.slug)} className="rounded-[var(--radius-xl)]" />
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
                <FragmentWithInsert key={i} insert={midAt === i ? <ServiceInline paths={servicePaths} slug={a.slug} preview={preview} /> : null}>
                  {isH2(p) ? (
                    <h2 id={idByIndex.get(i)}>{headingText(p)}</h2>
                  ) : isH3(p) ? (
                    <h3>{headingText(p)}</h3>
                  ) : (
                    <p><LinkedText text={p} /></p>
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

            <ServiceSection paths={servicePaths} slug={a.slug} preview={preview} />

            {claims.length > 0 && (
              <section aria-labelledby="kluczowe-informacje">
                <h2 id="kluczowe-informacje" className="text-2xl font-bold">Kluczowe informacje i źródła</h2>
                <ul className="mt-3 space-y-3 text-[0.95rem]">
                  {claims.map((c, i) => {
                    const src = a.sources[c.sourceIndex];
                    const accessed = formatDatePl(c.accessedAt);
                    return (
                      <li key={i} className="rounded-[var(--radius-md)] border border-line bg-surface p-4">
                        <p className="font-semibold text-ink">{c.text}</p>
                        <p className="mt-1 text-ink-muted">{c.evidence}</p>
                        {c.appliesTo && <p className="mt-1 text-ink-muted"><span className="font-semibold text-ink">Dotyczy:</span> {c.appliesTo}</p>}
                        <p className="mt-1 text-sm text-ink-muted">
                          Źródło:{" "}
                          {src ? <a href={`#zrodlo-${c.sourceIndex + 1}`} className="text-brand underline underline-offset-3">[{c.sourceIndex + 1}] {src.label}</a> : <span>brak wskazanego źródła</span>}
                          {accessed ? <> · dostęp {accessed}</> : null}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            <section aria-labelledby="zrodla">
              <h2 id="zrodla" className="text-2xl font-bold">Źródła</h2>
              {a.sources.length ? (
                <ol className="mt-3 list-decimal space-y-2 pl-6 text-[0.95rem]">
                  {a.sources.map((s, i) => (
                    <li key={i} id={`zrodlo-${i + 1}`} className="scroll-mt-24">
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

            <section aria-labelledby="status-przegladu" className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
              <h2 id="status-przegladu" className="flex items-center gap-2 text-xl font-bold"><ShieldCheck aria-hidden size={22} className="text-brand" /> Status przeglądu</h2>
              <dl className="mt-3 grid gap-x-4 gap-y-2 text-[0.95rem] sm:grid-cols-[auto_1fr]">
                <dt className="font-semibold text-ink">Kto sprawdził</dt>
                <dd className="text-ink-muted">
                  {review.reviewerLabel
                    ? <>{review.reviewerLabel}{review.reviewerKind === "ai" ? " (przegląd z udziałem AI, nie przegląd człowieka)" : " (człowiek)"}</>
                    : "oczekuje na przegląd"}
                </dd>
                {reviewedAt && <><dt className="font-semibold text-ink">Data przeglądu</dt><dd className="text-ink-muted"><time dateTime={review.reviewedAt!}>{reviewedAt}</time></dd></>}
                <dt className="font-semibold text-ink">Klasa treści</dt>
                <dd className="text-ink-muted">{RISK_LABEL[review.risk]}</dd>
                <dt className="font-semibold text-ink">Wymagany przegląd</dt>
                <dd className="text-ink-muted">{ROLE_LABEL[review.requiredRole]}{review.requiredRolePending ? " — jeszcze niepotwierdzony przeglądem człowieka" : ""}</dd>
                <dt className="font-semibold text-ink">Następny przegląd</dt>
                <dd className="text-ink-muted">{dueAt ? <time dateTime={review.reviewDueAt!}>{dueAt}</time> : "termin nie został wyznaczony"}</dd>
              </dl>
              {a.revision && <p className="mt-3 text-sm text-ink-muted">Zgłoszona korekta tego materiału oczekuje na przegląd. Do czasu zatwierdzenia widzisz ostatnią zatwierdzoną wersję.</p>}
              <p className="mt-3 text-sm"><Link href="/zasady-redakcyjne" className="inline-flex min-h-11 items-center font-semibold text-brand">Jak sprawdzamy treści</Link></p>
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
