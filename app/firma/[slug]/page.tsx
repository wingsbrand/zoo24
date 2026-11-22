import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Cat, Dog, FlaskConical, Flag, Globe, MapPin, Phone, PhoneOff, Store } from "lucide-react";
import { getStore } from "@/lib/store/file-store";
import { CATEGORIES, CITIES } from "@/lib/site";
import type { Business } from "@/lib/types";
import { Alert, Breadcrumbs, Card, Container, DataCheckedBadge, DemoBadge, buttonClasses, cn } from "@/components/ui";
import { CategoryTile } from "@/components/directory/category-icon";
import { contactChannels, directionsHref, publicLocation } from "@/lib/directory/contact";
import { listingOptions, publishedListing, sanitizeReturnQuery, type RawSearchParams } from "@/lib/directory/query";
import { capitalize, formatDatePl } from "@/lib/directory/format";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }>; searchParams: Promise<RawSearchParams> };

const find = (slug: string) => getStore().read().businesses.find((b) => b.slug === slug && b.status === "published");

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const b = find((await params).slug);
  if (!b) return {};
  return {
    title: `${b.name} — ${CATEGORIES[b.category].name}, ${CITIES[b.city].name}`,
    description: b.description.slice(0, 160),
    alternates: { canonical: `/firma/${b.slug}` }, // także dla ?z= (powrót do filtrów)
    // N1: DEMO nigdy nie jest indeksowane; N6: firma bez potwierdzenia danych przez redakcję — noindex do weryfikacji.
    robots: b.demo ? { index: false, follow: false } : !b.checkedAt ? { index: false, follow: true } : undefined,
  };
  // JSON-LD celowo pominięty: brak potwierdzonych danych realnych firm.
}

const PET = { psy: { Icon: Dog, label: "Psy" }, koty: { Icon: Cat, label: "Koty" } } as const;

// Mobile: miejsce na przyklejony pasek kontaktu (treść i stopka nie są zasłonięte; fokus przewijany nad pasek).
const STICKY_BAR_CSS =
  "@media (max-width: 63.999rem){body{padding-bottom:calc(5.25rem + env(safe-area-inset-bottom))}html{scroll-padding-bottom:6.5rem}}";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <h2 id={id} className="mb-3 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

function ContactButtons({ b, layout }: { b: Business; layout: "card" | "bar" }) {
  const ch = contactChannels(b);
  const bar = layout === "bar";
  const cls = (primary: boolean) => buttonClasses(primary ? "accent" : "secondary", bar ? "md" : "lg", bar ? "flex-1 min-w-0" : "w-full");
  return (
    <>
      {ch.phone && (
        <a href={ch.phone} rel="nofollow" className={cls(true)}>
          <Phone aria-hidden size={18} /> Zadzwoń
        </a>
      )}
      {ch.site && (
        <a href={ch.site} rel="nofollow noopener" className={cls(!ch.phone)}>
          <Globe aria-hidden size={18} /> Strona firmy
        </a>
      )}
    </>
  );
}

export default async function BusinessPage({ params, searchParams }: P) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const b = find(slug);
  if (!b) notFound(); // usunięty / nieopublikowany => prawdziwe 404

  const cat = CATEGORIES[b.category];
  const city = CITIES[b.city];
  const listing = publishedListing(getStore().read().businesses, b.category, b.city);
  const back = sanitizeReturnQuery(sp.z, listingOptions(listing));
  const listingHref = `/uslugi/${b.category}/${b.city}${back ? `?${back}` : ""}`;
  const ch = contactChannels(b);
  const hasContact = !!(ch.site || ch.phone);
  const { serviceArea, address } = publicLocation(b);
  const checked = formatDatePl(b.checkedAt);

  return (
    <>
      <header className="border-b border-line bg-surface">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs
            items={[
              { href: "/", label: "ZOO24" },
              { href: "/uslugi", label: "Usługi" },
              { href: listingHref, label: `${cat.plural} — ${city.name}` },
              { label: b.name },
            ]}
          />
          {b.demo && (
            <div role="note" className="mb-6 flex gap-3 rounded-[var(--radius-md)] border-2 border-demo bg-demo-soft p-4 text-sm text-ink">
              <FlaskConical aria-hidden size={20} className="mt-0.5 shrink-0 text-demo" />
              <div>
                <p className="font-semibold">Profil demonstracyjny</p>
                <p>To fikcyjny rekord do testów układu strony — firma nie istnieje. Strona nie jest indeksowana przez wyszukiwarki.</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-4">
            <CategoryTile category={b.category} size="lg" />
            <div className="min-w-0">
              <h1 className="break-words hyphens-auto text-2xl font-bold sm:text-4xl">{b.name}</h1>
              <p className="mt-1 text-ink-muted">
                <Link href={`/uslugi/${b.category}`} className="hover:text-brand hover:underline">{cat.name}</Link> ·{" "}
                <Link href={`/uslugi/${b.category}/${b.city}`} className="hover:text-brand hover:underline">{city.name}</Link>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <DataCheckedBadge checkedAt={b.checkedAt} />
                <DemoBadge show={b.demo} />
              </div>
            </div>
          </div>
          {b.description && <p className="mt-5 max-w-[var(--container-prose)] break-words text-lg text-ink-muted">{b.description}</p>}
        </Container>
      </header>

      <Container className="py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <aside aria-labelledby="kontakt" className="lg:order-2">
            <Card className="space-y-4 p-5 lg:sticky lg:top-24">
              <h2 id="kontakt" className="text-xl font-bold">Kontakt</h2>
              {hasContact ? (
                <div className="flex flex-col gap-2"><ContactButtons b={b} layout="card" /></div>
              ) : (
                <Alert tone="unavailable" title="Brak potwierdzonego kontaktu">
                  Nie mamy sprawdzonego telefonu ani strony www tej firmy.
                </Alert>
              )}
              <ul className="space-y-1 text-sm text-ink-muted">
                {!ch.phone && <li className="flex items-center gap-1.5"><PhoneOff aria-hidden size={16} /> Telefon: brak potwierdzonych danych</li>}
                {!ch.site && <li className="flex items-center gap-1.5"><Globe aria-hidden size={16} /> Strona www: brak potwierdzonych danych</li>}
              </ul>
              <p className="text-xs text-ink-muted">
                Kontaktujesz się bezpośrednio z firmą — ZOO24 nie pośredniczy w rezerwacjach. Kliknięcia liczymy zbiorczo, bez danych osobowych.
              </p>
            </Card>
          </aside>

          <div className="min-w-0 space-y-6 lg:order-1">
            <Section id="uslugi" title="Usługi">
              {b.services.length ? (
                <ul className="flex flex-wrap gap-2">
                  {b.services.map((s) => (
                    <li key={s} className="max-w-full break-words rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand-dark">{capitalize(s)}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-ink-muted">Firma nie podała jeszcze zakresu usług.</p>
              )}
              <p className="mt-2 text-sm text-ink-muted">Zakres wg źródła danych. Ceny i terminy ustalasz bezpośrednio z firmą.</p>
            </Section>

            <Section id="zwierzeta" title="Dla jakich zwierząt">
              {b.petTypes.length ? (
                <ul className="flex flex-wrap gap-4">
                  {b.petTypes.map((p) => {
                    const { Icon, label } = PET[p];
                    return (
                      <li key={p} className="inline-flex items-center gap-2 font-medium">
                        <Icon aria-hidden size={22} className="text-brand" /> {label}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-ink-muted">Brak potwierdzonej informacji — zapytaj firmę przed wizytą.</p>
              )}
            </Section>

            <Section id="obszar" title={address ? "Adres salonu" : "Obszar działania"}>
              <p className="flex items-start gap-2 break-words">
                <MapPin aria-hidden size={20} className="mt-0.5 shrink-0 text-brand" />
                <span>{address ?? serviceArea ?? `${city.name} — dokładny obszar działania nie został potwierdzony.`}</span>
              </p>
              {address && serviceArea && <p className="mt-1 pl-7 text-sm text-ink-muted">{serviceArea}</p>}
              {address ? (
                <>
                  <a href={directionsHref(address)} target="_blank" rel="noopener nofollow" className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-semibold text-brand underline">
                    Wyznacz trasę <span className="sr-only">(otwiera Mapy Google w nowej karcie)</span>
                  </a>
                  <p className="mt-2 text-sm text-ink-muted">Adres lokalu według strony firmy. Przed wizytą potwierdź godziny i termin bezpośrednio z salonem.</p>
                </>
              ) : (
                <p className="mt-2 text-sm text-ink-muted">Firma nie publikuje adresu lokalu albo nie został on potwierdzony. Szczegóły potwierdź bezpośrednio z firmą.</p>
              )}
            </Section>

            <Section id="zrodlo" title="Skąd mamy te dane">
              <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
                <dt className="font-semibold">Źródło</dt>
                <dd className="break-words text-ink-muted">{b.sourceNote}</dd>
                <dt className="font-semibold">Data sprawdzenia</dt>
                <dd className="text-ink-muted">{checked ?? "brak potwierdzenia"}</dd>
              </dl>
              <p className="mt-3 text-sm text-ink-muted">„Dane sprawdzone” oznacza weryfikację informacji o firmie, nie ocenę jakości usług. Nie publikujemy ocen.</p>
              <Link href={`/zglos-blad?firma=${encodeURIComponent(b.slug)}`} className={cn(buttonClasses("ghost", "md", "-ml-4 mt-2"))}>
                <Flag aria-hidden size={18} /> Zgłoś błąd w danych
              </Link>
            </Section>

            <Section id="wlasciciel" title="Prowadzisz tę firmę?">
              <p className="text-ink-muted">Zaktualizuj dane lub przejmij profil — bezpłatnie, po weryfikacji przez moderatora.</p>
              <Link href={`/dodaj-firme?firma=${encodeURIComponent(b.slug)}`} className={buttonClasses("secondary", "md", "mt-3")}>
                <Store aria-hidden size={18} /> Zaktualizuj profil firmy
              </Link>
            </Section>
          </div>
        </div>
      </Container>

      {hasContact && (
        <>
          <style>{STICKY_BAR_CSS}</style>
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-raised)] backdrop-blur lg:hidden">
            <nav aria-label="Szybki kontakt z firmą" className="mx-auto flex max-w-[var(--container-page)] gap-2">
              <ContactButtons b={b} layout="bar" />
            </nav>
          </div>
        </>
      )}
    </>
  );
}
