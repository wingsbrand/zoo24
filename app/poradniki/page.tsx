import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Search, SearchX } from "lucide-react";
import { Alert, ButtonLink, Container, EmptyState, PageHeader, cn } from "@/components/ui";
import { ArticleCard } from "@/components/editorial/article-card";
import { allArticles } from "@/components/editorial/queries";
import { articlesLabel } from "@/components/editorial/format";
import { QUERY_MAX, TOPICS, filterArticles, getTopic, hubHref, parseHubQuery } from "@/lib/content/topics";

export const dynamic = "force-dynamic";

type P = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const TITLE = "Poradniki dla opiekunów zwierząt";
const LEAD = "Praktyczne teksty o rasach, pielęgnacji i wyborze usług. Każdy poradnik ma źródła i przechodzi weryfikację redakcyjną przed publikacją.";
/** Poniżej tej liczby opublikowanych tekstów hub uczciwie informuje, że kolejne są w redakcji. */
const FEW_ARTICLES = 6;

export async function generateMetadata({ searchParams }: P): Promise<Metadata> {
  const { filtered } = parseHubQuery(await searchParams);
  return {
    title: TITLE,
    description: LEAD,
    alternates: { canonical: "/poradniki" },
    // Warianty filtrów/wyszukiwania nie są indeksowane (kanoniczny = /poradniki).
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

const chip = "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold no-underline transition-colors";

export default async function Poradniki({ searchParams }: P) {
  const query = parseHubQuery(await searchParams);
  const { items, counts, countAll, totalPublished } = filterArticles(allArticles(), query);
  const active = query.temat ? getTopic(query.temat) : null;
  const hasFilter = !!(query.temat || query.q);
  const demoShown = items.some((a) => a.demo);

  return (
    <>
      <PageHeader title="Poradniki" lead={LEAD} breadcrumbs={[{ href: "/", label: "ZOO24" }, { label: "Poradniki" }]}>
        <form action="/poradniki" method="get" role="search" className="mt-6 max-w-xl">
          <label htmlFor="q" className="mb-1.5 block font-semibold text-ink">Szukaj w poradnikach</label>
          {query.temat && <input type="hidden" name="temat" value={query.temat} />}
          <div className="flex gap-2">
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query.q}
              maxLength={QUERY_MAX}
              placeholder="np. maltańczyk, groomer"
              className="min-h-11 w-full min-w-0 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-muted/70 hover:border-brand focus:border-brand"
            />
            <button type="submit" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-md)] bg-brand px-4 font-semibold text-white hover:bg-brand-dark">
              <Search aria-hidden size={18} /> Szukaj
            </button>
          </div>
          {active && <p className="mt-1.5 text-sm text-ink-muted">Szukasz w temacie: {active.name}.</p>}
        </form>
      </PageHeader>

      <Container className="py-8 sm:py-10">
        <nav aria-label="Tematy poradników">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link
                href={hubHref({ q: query.q })}
                aria-current={!query.temat ? "page" : undefined}
                className={cn(chip, !query.temat ? "border-brand bg-brand text-white" : "border-line-strong bg-surface text-brand hover:border-brand hover:bg-brand-tint")}
              >
                Wszystkie <span className="tabular-nums opacity-80">({countAll})</span>
              </Link>
            </li>
            {TOPICS.map((t) => {
              const on = query.temat === t.slug;
              return (
                <li key={t.slug}>
                  <Link
                    href={hubHref({ temat: t.slug, q: query.q })}
                    aria-current={on ? "page" : undefined}
                    className={cn(chip, on ? "border-brand bg-brand text-white" : "border-line-strong bg-surface text-brand hover:border-brand hover:bg-brand-tint")}
                  >
                    {t.name} <span className="tabular-nums opacity-80">({counts[t.slug]})</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {totalPublished > 0 && totalPublished < FEW_ARTICLES && (
          <Alert tone="info" title="Kolejne poradniki są w redakcji" className="mt-6">
            <p>
              Na razie publikujemy niewiele tekstów. Każdy artykuł przed publikacją przechodzi sprawdzenie faktów, źródeł i praw do treści.
              {demoShown ? " Teksty oznaczone DEMO to szkice demonstracyjne prototypu, nie porady." : ""}
            </p>
          </Alert>
        )}

        <div className="mt-8">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold sm:text-3xl">{active ? active.name : "Wszystkie poradniki"}</h2>
            <p role="status" className="text-sm text-ink-muted">
              {query.q ? <>Wyniki dla „{query.q}”: </> : null}{articlesLabel(items.length)}
            </p>
          </div>
          {active && <p className="-mt-3 mb-5 text-ink-muted">{active.description}</p>}

          {totalPublished === 0 ? (
            <EmptyState icon={<BookOpen aria-hidden />} title="Pierwsze poradniki są w redakcji" actions={<ButtonLink href="/uslugi" variant="primary">Przejdź do katalogu usług</ButtonLink>}>
              <p>Publikujemy tylko teksty ze sprawdzonymi źródłami i po akceptacji redaktora. Do tego czasu możesz znaleźć groomera lub hotel dla zwierząt w katalogu.</p>
            </EmptyState>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<SearchX aria-hidden />}
              title={query.q ? `Brak poradników pasujących do „${query.q}”` : "Brak poradników w tym temacie"}
              actions={
                <>
                  <ButtonLink href="/poradniki" variant="primary">Wyczyść filtry</ButtonLink>
                  <ButtonLink href="/uslugi" variant="secondary">Katalog usług</ButtonLink>
                </>
              }
            >
              <p>{query.q ? "Spróbuj innego słowa albo krótszej frazy." : "Teksty w tym temacie są w przygotowaniu."} Możesz też przejrzeć wszystkie poradniki.</p>
            </EmptyState>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <li key={a.slug}><ArticleCard a={a} /></li>
              ))}
            </ul>
          )}
        </div>

        {hasFilter && items.length > 0 && (
          <p className="mt-8">
            <Link href="/poradniki" className="inline-flex min-h-11 items-center font-semibold text-brand underline underline-offset-4 hover:text-brand-dark">Wyczyść filtry i pokaż wszystkie</Link>
          </p>
        )}
      </Container>
    </>
  );
}
