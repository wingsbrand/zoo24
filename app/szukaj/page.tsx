import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MapPinOff } from "lucide-react";
import { getStore } from "@/lib/store/file-store";
import { CATEGORIES, CITIES } from "@/lib/site";
import type { CategorySlug } from "@/lib/types";
import { Alert, ButtonLink, Container, PageHeader } from "@/components/ui";
import { EventBeacon } from "@/components/event-beacon";
import { ServiceSearch } from "@/components/directory/search-form";
import { resolveSearch } from "@/lib/directory/search";
import { listingCounts, PILOT_CATEGORIES, PILOT_CITIES } from "@/lib/directory/stats";
import { firmCount } from "@/lib/directory/format";
import type { RawSearchParams } from "@/lib/directory/query";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wyszukiwanie usług",
  robots: { index: false, follow: true }, // strona wyników wyszukiwania — nigdy indeksowana
  alternates: { canonical: "/uslugi" },
};

type P = { searchParams: Promise<RawSearchParams> };

function Suggestions({ categories }: { categories: readonly CategorySlug[] }) {
  const counts = listingCounts(getStore().read().businesses);
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {categories.flatMap((cat) =>
        PILOT_CITIES.map((city) => (
          <li key={`${cat}-${city}`}>
            <Link
              href={`/uslugi/${cat}/${city}`}
              className="flex min-h-12 flex-col justify-center rounded-[var(--radius-md)] border border-line bg-surface px-4 py-2 no-underline hover:border-brand hover:bg-brand-tint"
            >
              <span className="font-semibold text-brand-dark">{CATEGORIES[cat].plural} {CITIES[city].locative}</span>
              <span className="text-sm text-ink-muted">{firmCount(counts[cat][city].total)}</span>
            </Link>
          </li>
        )),
      )}
    </ul>
  );
}

export default async function SearchPage({ searchParams }: P) {
  const r = resolveSearch(await searchParams);
  if (r.kind === "redirect") redirect(r.href); // GET => 307 do listingu (stan w URL, bez zapisu)

  if (r.kind === "outside_pilot") {
    return (
      <>
        <EventBeacon type="search_no_results" eventRef={r.category ?? "any"} />
        <PageHeader title="Na razie działamy w 10 największych miastach" breadcrumbs={[{ href: "/", label: "ZOO24" }, { href: "/uslugi", label: "Usługi" }, { label: "Wyszukiwanie" }]}>
          <div className="mt-6">
            <ServiceSearch variant="compact" defaultCategory={r.category ?? undefined} />
          </div>
        </PageHeader>
        <Container className="space-y-6 py-8 sm:py-10">
          <Alert tone="info" title={`Nie mamy jeszcze firm w miejscowości „${r.cityText}”`} live>
            Katalog jest w fazie pilotażu. Jeśli to literówka, popraw nazwę miasta powyżej.
          </Alert>
          <section aria-labelledby="propozycje" className="space-y-3">
            <h2 id="propozycje" className="text-2xl font-bold">Zobacz w miastach pilotażu</h2>
            <Suggestions categories={r.category ? [r.category] : PILOT_CATEGORIES} />
          </section>
          <section aria-labelledby="zglos" className="space-y-3">
            <h2 id="zglos" className="text-xl font-bold">Znasz dobrą firmę w swojej okolicy?</h2>
            <p className="text-ink-muted">Zgłoś ją — zgłoszenia z innych miast pomagają nam zdecydować, gdzie rozszerzyć katalog.</p>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/dodaj-firme" variant="primary">Zgłoś firmę</ButtonLink>
              <ButtonLink href="/poradniki" variant="secondary">Przeczytaj poradniki</ButtonLink>
            </div>
          </section>
        </Container>
      </>
    );
  }

  const title = r.kind === "need_category" ? `Jakiej usługi szukasz ${CITIES[r.city].locative}?` : "Znajdź usługę dla swojego zwierzęcia";
  return (
    <>
      <PageHeader title={title} breadcrumbs={[{ href: "/", label: "ZOO24" }, { href: "/uslugi", label: "Usługi" }, { label: "Wyszukiwanie" }]}>
        <div className="mt-6">
          <ServiceSearch variant="compact" defaultCity={r.kind === "need_category" ? r.city : undefined} />
        </div>
      </PageHeader>
      <Container className="space-y-4 py-8 sm:py-10">
        {r.kind === "need_category" ? (
          <>
            <h2 className="text-2xl font-bold">Wybierz rodzaj usługi</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {PILOT_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link href={`/uslugi/${cat}/${r.city}`} className="flex min-h-12 items-center rounded-[var(--radius-md)] border border-line bg-surface px-4 py-2 font-semibold text-brand-dark no-underline hover:border-brand hover:bg-brand-tint">
                    {CATEGORIES[cat].plural} {CITIES[r.city].locative}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 text-ink-muted"><MapPinOff aria-hidden size={18} /> Wybierz rodzaj usługi i wpisz miasto, aby zobaczyć listę firm.</p>
            <h2 className="text-2xl font-bold">Albo przejdź od razu</h2>
            <Suggestions categories={PILOT_CATEGORIES} />
          </>
        )}
      </Container>
    </>
  );
}
