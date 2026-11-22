import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BookOpen, SearchX, Store } from "lucide-react";
import { getStore } from "@/lib/store/file-store";
import { CATEGORIES, CITIES, isCategory, isCity } from "@/lib/site";
import type { CategorySlug, CitySlug } from "@/lib/types";
import { Alert, ButtonLink, Container, EmptyState, PageHeader, buttonClasses } from "@/components/ui";
import { BusinessCard } from "@/components/directory/business-card";
import { ServiceSearch } from "@/components/directory/search-form";
import { ActiveFilters, FilterPanel } from "@/components/directory/filters";
import { Pagination, SortLinks } from "@/components/directory/pagination";
import {
  activeFilterChips, buildListingModel, clearFiltersHref, hasListingParams, publishedListing, toSearchParams,
  type RawSearchParams,
} from "@/lib/directory/query";
import { listingCounts, MIN_REAL_LISTINGS, PILOT_CATEGORIES, PILOT_CITIES } from "@/lib/directory/stats";
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

  const all = getStore().read().businesses;
  const listing = publishedListing(all, category, city);
  const base = `/uslugi/${category}/${city}`;
  const { filters, page, facets } = buildListingModel(listing, sp);
  const from = toSearchParams(filters).toString() || undefined;
  const filtered = page.total !== listing.length;
  const anyDemo = listing.some((b) => b.demo);
  const cat = CATEGORIES[category];
  const counts = listingCounts(all);

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
          <NoBusinesses category={category} city={city} counts={counts} />
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

function NoBusinesses({ category, city, counts }: { category: CategorySlug; city: CitySlug; counts: ReturnType<typeof listingCounts> }) {
  const otherCities = PILOT_CITIES.filter((c) => c !== city && counts[category][c].total > 0);
  const otherCats = PILOT_CATEGORIES.filter((c) => c !== category && counts[c][city].total > 0);
  return (
    <EmptyState
      icon={<Store aria-hidden size={24} />}
      title={`Nie mamy jeszcze firm w tej kategorii ${CITIES[city].locative}`}
      actions={
        <>
          <ButtonLink href="/dodaj-firme" variant="primary">Zgłoś firmę</ButtonLink>
          <Link href="/poradniki" className={buttonClasses("secondary")}><BookOpen aria-hidden size={18} /> Przeczytaj poradniki</Link>
        </>
      }
    >
      <p>Katalog dopiero rośnie. Możesz sprawdzić:</p>
      {(otherCities.length > 0 || otherCats.length > 0) && (
        <ul className="mt-3 space-y-1">
          {otherCities.map((c) => (
            <li key={c}>
              <Link href={`/uslugi/${category}/${c}`} className="font-semibold text-brand underline">
                {CATEGORIES[category].plural} {CITIES[c].locative}
              </Link>{" "}({firmCount(counts[category][c].total)})
            </li>
          ))}
          {otherCats.map((c) => (
            <li key={c}>
              <Link href={`/uslugi/${c}/${city}`} className="font-semibold text-brand underline">
                {CATEGORIES[c].plural} {CITIES[city].locative}
              </Link>{" "}({firmCount(counts[c][city].total)})
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3">Prowadzisz taką firmę lub znasz sprawdzoną? Zgłoś ją — po moderacji pojawi się w katalogu bezpłatnie.</p>
    </EmptyState>
  );
}
