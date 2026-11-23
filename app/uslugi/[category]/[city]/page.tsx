import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen, ClipboardList, SearchX, Store } from "lucide-react";
import { getStore } from "@/lib/store/file-store";
import { CATEGORIES, CITIES, isCategory, isCity } from "@/lib/site";
import type { CategorySlug, CitySlug } from "@/lib/types";
import { Alert, ButtonLink, Container, EmptyState, PageHeader } from "@/components/ui";
import { BusinessCard } from "@/components/directory/business-card";
import { ServiceSearch } from "@/components/directory/search-form";
import { ActiveFilters, FilterPanel } from "@/components/directory/filters";
import { Pagination, SortLinks } from "@/components/directory/pagination";
import {
  activeFilterChips, buildListingModel, clearFiltersHref, hasListingParams, publishedListing, toSearchParams,
  type RawSearchParams,
} from "@/lib/directory/query";
import { MIN_REAL_LISTINGS } from "@/lib/directory/stats";
import { emptyListingSuggestions, type EmptyListingSuggestions } from "@/lib/directory/empty-state";
import { capitalize, firmCount } from "@/lib/directory/format";

export const dynamic = "force-dynamic";

type P = { params: Promise<{ category: string; city: string }>; searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const [{ category, city }, sp] = await Promise.all([params, searchParams]);
  if (!isCategory(category) || !isCity(city)) return {};
  const listing = publishedListing(getStore().read().businesses, category, city);
  const real = listing.filter((b) => !b.demo).length;
  const noindex = hasListingParams(sp) || real < MIN_REAL_LISTINGS; // filtry/strona>1 lub < 3 realnych firm
  return {
    title: `${CATEGORIES[category].plural} ${CITIES[city].locative}`,
    description: `Lista: ${CATEGORIES[category].plural.toLowerCase()} ${CITIES[city].locative}. Zakres usług, obszar działania i źródło danych. Bez ocen i płatnych pozycji.`,
    alternates: { canonical: `/uslugi/${category}/${city}` }, // zawsze bazowy URL bez parametrów
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export default async function ListingPage({ params, searchParams }: P) {
  const [{ category, city }, sp] = await Promise.all([params, searchParams]);
  if (!isCategory(category) || !isCity(city)) notFound();

  const state = getStore().read();
  const listing = publishedListing(state.businesses, category, city);
  const base = `/uslugi/${category}/${city}`;
  const { filters, page, facets } = buildListingModel(listing, sp);
  const from = toSearchParams(filters).toString() || undefined;
  const filtered = page.total !== listing.length;
  const anyDemo = listing.some((b) => b.demo);
  const cat = CATEGORIES[category];

  return (
    <>
      <PageHeader
        title={`${cat.plural} ${CITIES[city].locative}`}
        lead="Sprawdź zakres usług, obszar działania i dostępny kontakt. Kontaktujesz się bezpośrednio z firmą."
        breadcrumbs={[
          { href: "/", label: "ZOO24" },
          { href: "/uslugi", label: "Usługi" },
          { href: `/uslugi/${category}`, label: cat.plural },
          { label: CITIES[city].name },
        ]}
      >
        {/* Mobile: wyszukiwarka zwinięta, by pierwsze wyniki były widoczne bez przewijania. Desktop: zawsze widoczna. */}
        <details className="group mt-5 rounded-[var(--radius-md)] border border-line bg-canvas md:hidden">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 font-semibold text-brand [&::-webkit-details-marker]:hidden">
            <span>{CATEGORIES[category].name} · {CITIES[city].name}</span>
            <span className="text-sm font-medium underline group-open:hidden">Zmień</span>
            <span className="hidden text-sm font-medium underline group-open:inline">Zwiń</span>
          </summary>
          <div className="border-t border-line p-3"><ServiceSearch variant="compact" idPrefix="szukaj-mobile" defaultCategory={category} defaultCity={city} /></div>
        </details>
        <div className="mt-6 hidden md:block">
          <ServiceSearch variant="compact" defaultCategory={category} defaultCity={city} />
        </div>
      </PageHeader>

      <Container className="py-8 sm:py-10">
        {listing.length === 0 ? (
          <NoBusinesses category={category} city={city} suggestions={emptyListingSuggestions(state, category, city)} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
            <aside aria-label="Filtry" className="lg:sticky lg:top-24 lg:self-start">
              <FilterPanel base={base} filters={filters} facets={facets} />
            </aside>

            <div className="min-w-0 space-y-4">
              <h2 className="sr-only">Wyniki</h2>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p aria-live="polite" className="text-lg font-semibold text-ink">
                  {firmCount(page.total)}
                  {filtered && <span className="font-normal text-ink-muted"> z {listing.length} w tym mieście</span>}
                </p>
                <SortLinks base={base} filters={filters} />
              </div>
              <ActiveFilters base={base} filters={filters} />
              <p className="text-sm text-ink-muted">
                {filters.sort === "nazwa" ? "Kolejność alfabetyczna, bez płatnych pozycji." : "Kolejność wg daty sprawdzenia danych (najnowsze najpierw), bez płatnych pozycji."}
                {anyDemo && " Profile oznaczone DEMO są fikcyjne."}
              </p>
              {page.clamped && (
                <Alert tone="info">Wybrana strona nie istnieje — pokazujemy ostatnią stronę wyników.</Alert>
              )}

              {page.total === 0 ? (
                <EmptyState
                  headingLevel={3}
                  icon={<SearchX aria-hidden size={24} />}
                  title="Brak firm dla wybranych filtrów"
                  actions={
                    <>
                      {activeFilterChips(base, filters).map((c) => (
                        <ButtonLink key={`${c.key}-${c.value}`} href={c.href} variant="secondary">Usuń filtr: {capitalize(c.label)}</ButtonLink>
                      ))}
                      <ButtonLink href={clearFiltersHref(base, filters)} variant="primary">Wyczyść wszystkie</ButtonLink>
                    </>
                  }
                >
                  W tym mieście jest {firmCount(listing.length)}, ale żadna nie spełnia wszystkich wybranych warunków. Usuń jeden z filtrów albo wyczyść wszystkie.
                </EmptyState>
              ) : (
                <ul className="grid gap-4 md:grid-cols-2">
                  {page.items.map((b) => <BusinessCard key={b.id} b={b} from={from} />)}
                </ul>
              )}

              <Pagination base={base} filters={filters} page={page.page} totalPages={page.totalPages} />
            </div>
          </div>
        )}
      </Container>
    </>
  );
}

function NoBusinesses({ category, city, suggestions: s }: { category: CategorySlug; city: CitySlug; suggestions: EmptyListingSuggestions }) {
  const hasAlternatives = s.guides.length > 0 || s.tools.length > 0;
  return (
    <EmptyState
      icon={<Store aria-hidden size={24} />}
      title={`Nie mamy jeszcze firm w tej kategorii ${CITIES[city].locative}`}
      actions={
        <>
          <ButtonLink href="/polec-miejsce" variant="primary">Poleć znane miejsce</ButtonLink>
          <ButtonLink href="/dodaj-firme" variant="secondary">Prowadzisz firmę? Zgłoś ją</ButtonLink>
        </>
      }
    >
      <p>Katalog dopiero rośnie — nie pokazujemy firm, których nie sprawdziliśmy.</p>

      {hasAlternatives && (
        <div className="mt-4">
          <h3 className="font-semibold text-ink">{s.needLabel} — co możesz zrobić teraz</h3>
          <ul className="mt-2 space-y-2">
            {s.tools.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="inline-flex items-center gap-1.5 font-semibold text-brand underline">
                  <ClipboardList aria-hidden size={18} /> {t.label}
                </Link>
                <span className="block text-sm text-ink-muted">{t.description}</span>
              </li>
            ))}
            {s.guides.map((g) => (
              <li key={g.slug}>
                <Link href={g.href} className="inline-flex items-center gap-1.5 font-semibold text-brand underline">
                  <BookOpen aria-hidden size={18} /> {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(s.otherCities.length > 0 || s.relatedCategories.length > 0) && (
        <div className="mt-4">
          <h3 className="font-semibold text-ink">{CATEGORIES[category].plural} w innych miastach</h3>
          <ul className="mt-2 space-y-1">
            {s.otherCities.map((c) => (
              <li key={c.city}>
                <Link href={c.href} className="font-semibold text-brand underline">
                  {CATEGORIES[category].plural} {CITIES[c.city].locative}
                </Link>{" "}({firmCount(c.real)})
              </li>
            ))}
            {s.relatedCategories.map((c) => (
              <li key={c.category}>
                <Link href={c.href} className="font-semibold text-brand underline">
                  {CATEGORIES[c.category].plural} {CITIES[city].locative}
                </Link>{" "}({firmCount(c.real)})
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4">
        <strong>Znasz dobre miejsce?</strong> Poleć je — redakcja sprawdzi dane w publicznych źródłach, zanim cokolwiek opublikuje.{" "}
        <strong>Prowadzisz taką firmę?</strong> Zgłoś ją jako właściciel lub upoważniony pracownik — obecność w katalogu jest bezpłatna.
      </p>
    </EmptyState>
  );
}
