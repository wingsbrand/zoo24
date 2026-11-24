import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Search, SearchX } from "lucide-react";
import { Alert, ButtonLink, Container, EmptyState, PageHeader, cn } from "@/components/ui";
import { ArticleCard } from "@/components/editorial/article-card";
import { allArticles } from "@/components/editorial/queries";
import { articlesLabel } from "@/components/editorial/format";
import { QUERY_MAX, TOPICS, filterArticles, getTopic, hubHref, parsePortalHubQuery, type PortalHubQuery } from "@/lib/content/topics";
import { GROUPS, NEEDS, getGroup } from "@/lib/taxonomy/animals";
import { needName } from "@/lib/portal/labels";
import { searchSite } from "@/lib/portal/site-search";
import { computeVisibility, TOOLS } from "@/lib/portal/visibility";

export const dynamic = "force-dynamic";

type P = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const TITLE = "Poradniki dla opiekunów zwierząt";
const LEAD = "Praktyczna wiedza o zwierzętach towarzyszących: wybór zwierzęcia, przygotowanie domu, codzienna opieka, wyjazdy i wybór usług. Każdy poradnik ma listę źródeł.";
/** Poniżej tej liczby opublikowanych tekstów hub uczciwie informuje, że kolejne są w redakcji. */
const FEW_ARTICLES = 6;

export async function generateMetadata({ searchParams }: P): Promise<Metadata> {
  const { filtered } = parsePortalHubQuery(await searchParams);
  return {
    title: TITLE,
    description: LEAD,
    alternates: { canonical: "/poradniki" },
    // Warianty filtrów/wyszukiwania nie są indeksowane (kanoniczny = /poradniki).
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

const chip = "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold no-underline transition-colors";
const chipOn = "border-brand bg-brand text-white";
const chipOff = "border-line-strong bg-surface text-brand hover:border-brand hover:bg-brand-tint";

/** Rząd filtrów: „Wszystkie” + tylko opcje z ≥1 opublikowanym poradnikiem (przy pozostałych filtrach). */
function ChipRow({ label, allHref, allCount, allOn, options }: {
  label: string; allHref: string; allCount: number; allOn: boolean;
  options: { key: string; name: string; href: string; count: number; on: boolean }[];
}) {
  return (
    <nav aria-label={label}>
      <p className="mb-2 text-sm font-semibold text-ink-muted">{label}</p>
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link href={allHref} aria-current={allOn ? "page" : undefined} className={cn(chip, allOn ? chipOn : chipOff)}>
            Wszystkie <span className="tabular-nums opacity-80">({allCount})</span>
          </Link>
        </li>
        {options.filter((o) => o.count > 0 || o.on).map((o) => (
          <li key={o.key}>
            <Link href={o.href} aria-current={o.on ? "page" : undefined} className={cn(chip, o.on ? chipOn : chipOff)}>
              {o.name} <span className="tabular-nums opacity-80">({o.count})</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const keep = (q: PortalHubQuery) => ({ temat: q.temat, q: q.q, zwierze: q.zwierze, potrzeba: q.potrzeba });

export default async function Poradniki({ searchParams }: P) {
  const query = parsePortalHubQuery(await searchParams);
  const { items, counts, countAll, totalPublished, countsByGroup, countsByNeed } = filterArticles(allArticles(), query);
  const allGroups = filterArticles(allArticles(), { ...query, zwierze: null });
  const allNeeds = filterArticles(allArticles(), { ...query, potrzeba: null });
  const active = query.temat ? getTopic(query.temat) : null;
  const activeGroup = query.zwierze ? getGroup(query.zwierze) : null;
  const hasFilter = !!(query.temat || query.q || query.zwierze || query.potrzeba);
  const heading = [activeGroup?.name, query.potrzeba ? needName(query.potrzeba) : null, active?.name].filter(Boolean).join(" · ") || "Wszystkie poradniki";
  const groupOptions = GROUPS.map((g) => ({ key: g.slug, name: g.name, href: hubHref({ ...keep(query), zwierze: g.slug }), count: countsByGroup[g.slug], on: query.zwierze === g.slug }));
  const needOptions = NEEDS.map((n) => ({ key: n.slug, name: n.name, href: hubHref({ ...keep(query), potrzeba: n.slug }), count: countsByNeed[n.slug], on: query.potrzeba === n.slug }));
  const demoShown = items.some((a) => a.demo);
  const vis = computeVisibility(allArticles());
  const site = searchSite(query.q, vis);

  return (
    <>
      <PageHeader title="Poradniki" lead={LEAD} breadcrumbs={[{ href: "/", label: "ZOO24" }, { label: "Poradniki" }]}>
        <form action="/poradniki" method="get" role="search" className="mt-6 max-w-xl">
          <label htmlFor="q" className="mb-1.5 block font-semibold text-ink">Szukaj w poradnikach, działach i narzędziach</label>
          {query.temat && <input type="hidden" name="temat" value={query.temat} />}
          {query.zwierze && <input type="hidden" name="zwierze" value={query.zwierze} />}
          {query.potrzeba && <input type="hidden" name="potrzeba" value={query.potrzeba} />}
          <div className="flex gap-2">
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query.q}
              maxLength={QUERY_MAX}
              placeholder="np. nazwa zwierzęcia lub temat"
              className="min-h-11 w-full min-w-0 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-muted/70 hover:border-brand focus:border-brand"
            />
            <button type="submit" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-md)] bg-brand px-4 font-semibold text-white hover:bg-brand-dark">
              <Search aria-hidden size={18} /> Szukaj
            </button>
          </div>
          {hasFilter && heading !== "Wszystkie poradniki" && <p className="mt-1.5 text-sm text-ink-muted">Szukasz w: {heading}.</p>}
        </form>
      </PageHeader>

      <Container className="py-8 sm:py-10">
        <div className="space-y-5">
          {(allGroups.items.length > 0 && groupOptions.some((o) => o.count > 0 || o.on)) && (
            <ChipRow label="Zwierzę" allHref={hubHref({ ...keep(query), zwierze: null })} allCount={allGroups.items.length} allOn={!query.zwierze} options={groupOptions} />
          )}
          {(allNeeds.items.length > 0 && needOptions.some((o) => o.count > 0 || o.on)) && (
            <ChipRow label="Potrzeba" allHref={hubHref({ ...keep(query), potrzeba: null })} allCount={allNeeds.items.length} allOn={!query.potrzeba} options={needOptions} />
          )}
          <ChipRow
            label="Temat"
            allHref={hubHref({ ...keep(query), temat: null })}
            allCount={countAll}
            allOn={!query.temat}
            options={TOPICS.map((t) => ({ key: t.slug, name: t.name, href: hubHref({ ...keep(query), temat: t.slug }), count: counts[t.slug], on: query.temat === t.slug }))}
          />
        </div>

        {totalPublished > 0 && totalPublished < FEW_ARTICLES && (
          <Alert tone="info" title="Kolejne poradniki są w redakcji" className="mt-6">
            <p>
              Na razie publikujemy niewiele tekstów. Każdy artykuł przed publikacją przechodzi sprawdzenie faktów, źródeł i praw do treści.
              {demoShown ? " Teksty oznaczone DEMO to szkice demonstracyjne prototypu, nie porady." : ""}
            </p>
          </Alert>
        )}

        {site.results.length > 0 && (
          <section aria-labelledby="h-inne-wyniki" className="mt-8">
            <h2 id="h-inne-wyniki" className="mb-4 text-xl font-bold">Działy i narzędzia</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {site.results.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="flex h-full min-h-11 flex-col gap-1 rounded-[var(--radius-md)] border border-line bg-surface p-4 no-underline hover:border-brand hover:bg-brand-tint">
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent-dark">{r.type}</span>
                    <span className="font-semibold text-brand-dark">{r.title}</span>
                    <span className="text-sm text-ink-muted">{r.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        {site.upcomingGroups.length > 0 && (
          <Alert tone="info" title={`Dział ${site.upcomingGroups.map((g) => g.name).join(", ")} jest w przygotowaniu`} className="mt-6">
            <p>Materiały o tych zwierzętach czekają na sprawdzenie przez osobę z wiedzą o danym gatunku. Publikujemy je dopiero po takim przeglądzie.</p>
          </Alert>
        )}

        <div className="mt-8">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold sm:text-3xl">{heading}</h2>
            <p role="status" className="text-sm text-ink-muted">
              {query.q ? <>Wyniki dla „{query.q}”: </> : null}{articlesLabel(items.length)}
            </p>
          </div>
          {active && !activeGroup && !query.potrzeba && <p className="-mt-3 mb-5 text-ink-muted">{active.description}</p>}

          {totalPublished === 0 ? (
            <EmptyState icon={<BookOpen aria-hidden />} title="Pierwsze poradniki są w redakcji" actions={<ButtonLink href="/uslugi" variant="primary">Przejdź do katalogu usług</ButtonLink>}>
              <p>Publikujemy tylko teksty ze sprawdzonymi źródłami i po akceptacji redaktora. Do tego czasu możesz znaleźć groomera lub hotel dla zwierząt w katalogu.</p>
            </EmptyState>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<SearchX aria-hidden />}
              title={query.q ? `Brak poradników pasujących do „${query.q}”` : "Brak poradników dla wybranych filtrów"}
              actions={
                <>
                  <ButtonLink href="/poradniki" variant="primary">Wyczyść filtry</ButtonLink>
                  <ButtonLink href="/uslugi" variant="secondary">Katalog usług</ButtonLink>
                </>
              }
            >
              <p>{query.q ? "Spróbuj innego słowa albo krótszej frazy. Nie generujemy odpowiedzi automatycznie — pokazujemy tylko opublikowane materiały." : "Teksty dla tych filtrów są w przygotowaniu."}</p>
              <p className="mt-3 font-semibold text-ink">Dostępne działy i narzędzia:</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {vis.publicGroups.map((g) => <li key={g.group.slug}><Link href={`/zwierzeta/${g.group.slug}`} className="font-semibold text-brand">{g.group.name}</Link></li>)}
                {TOOLS.map((t) => <li key={t.path}><Link href={t.path} className="font-semibold text-brand">{t.title}</Link></li>)}
              </ul>
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
