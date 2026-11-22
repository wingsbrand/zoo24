import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SITE_IMAGES, CATEGORY_IMAGES } from "@/lib/content/images";
import { ArticleCard } from "@/components/editorial/article-card";
import { ArrowRight, BadgeCheck, BedDouble, BookOpen, Handshake, PhoneCall, Scissors, ShieldCheck } from "lucide-react";
import { getStore } from "@/lib/store/file-store";
import { CATEGORIES, CITIES } from "@/lib/site";
import { AiBadge, ButtonLink, Container, Section, SectionHeading } from "@/components/ui";
import { ServiceSearch } from "@/components/directory/search-form";
import { firmCount } from "@/lib/directory/format";
import { listingCounts } from "@/lib/directory/stats";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { alternates: { canonical: "/" } };

const CAT_META = {
  groomer: { icon: Scissors, text: "Kąpiel, strzyżenie, trymowanie i pielęgnacja pazurów — dla psów i kotów." },
  "hotel-dla-zwierzat": { icon: BedDouble, text: "Opieka dzienna i nocna, gdy wyjeżdżasz. Sprawdź warunki pobytu, zanim zarezerwujesz." },
} as const;

export default function Home() {
  const s = getStore().read();
  const articles = s.articles.filter((a) => a.status === "published").slice(0, 3);
  const counts = listingCounts(s.businesses);
  const countLabel = (cat: keyof typeof CATEGORIES, city: keyof typeof CITIES) => {
    const n = counts[cat][city];
    return `${firmCount(n.total)}${n.demo > 0 && n.demo === n.total ? " (DEMO)" : n.demo > 0 ? `, w tym ${n.demo} DEMO` : ""}`;
  };

  return (
    <>
      {/* HERO — h1, wyszukiwarka: rodzaj usługi + miasto */}
      <section className="relative overflow-hidden border-b border-line bg-brand-tint">
        {/* Mobile/tablet: zdjęcie jako baner nad treścią */}
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] xl:hidden">
          <Image src={SITE_IMAGES.hero.src} alt={SITE_IMAGES.hero.alt} fill sizes="100vw" className="object-cover object-[25%_center]" />
          <AiBadge />
        </div>
        {/* Desktop: zdjęcie w prawej kolumnie, łagodne przejście w tło; tekst zawsze na jednolitym tle */}
        <div className="absolute inset-y-0 right-0 hidden w-[42%] xl:block">
          <Image src={SITE_IMAGES.hero.src} alt="" fill priority sizes="42vw" className="object-cover object-[18%_center]" />
          <div aria-hidden className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-brand-tint to-transparent" />
          <AiBadge className="bottom-3 right-3" />
        </div>
        <Container className="relative py-10 sm:py-14 xl:py-24">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-sm font-semibold text-brand shadow-[var(--shadow-card)]">
            <BadgeCheck aria-hidden size={16} /> Groomerzy i hotele dla zwierząt · 10 największych miast Polski
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Dobra opieka dla Twojego zwierzaka — <span className="text-accent-dark">blisko domu</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted sm:text-xl">
            Znajdź usługę w swoim mieście, sprawdź, co oferuje, i skontaktuj się bezpośrednio z firmą. Przeczytaj też, jak wybrać świadomie.
          </p>
          <div className="mt-8 max-w-3xl">
            <ServiceSearch variant="hero" />
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted xl:max-w-2xl">
            <li className="flex items-center gap-1.5"><ShieldCheck aria-hidden size={16} className="text-brand" /> Bez ocen i ukrytych reklam</li>
            <li className="flex items-center gap-1.5"><BadgeCheck aria-hidden size={16} className="text-brand" /> Przy każdej firmie źródło i data sprawdzenia</li>
            <li className="flex items-center gap-1.5"><PhoneCall aria-hidden size={16} className="text-brand" /> Kontakt bezpośrednio z firmą, bez pośrednika</li>
          </ul>
        </Container>
      </section>

      {/* KATEGORIE */}
      <Section labelledBy="h-kategorie">
        <Container>
          <SectionHeading id="h-kategorie" eyebrow="Usługi" title="Czego szukasz?" lead="Zaczynamy od dwóch rodzajów usług w 10 największych miastach Polski. Rozszerzymy katalog, gdy dane będą sprawdzone." />
          <ul className="grid gap-4 md:grid-cols-2">
            {(Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]).map((cat) => {
              const Icon = CAT_META[cat].icon;
              return (
                <li key={cat} className="flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
                  <div className="relative -mx-6 -mt-6 mb-5 aspect-[16/7] overflow-hidden bg-brand-soft">
                    <Image src={CATEGORY_IMAGES[cat].src} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
                    <AiBadge />
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-brand-soft text-brand"><Icon aria-hidden size={28} /></span>
                    <div>
                      <h3 className="text-xl font-bold"><Link href={`/uslugi/${cat}`} className="no-underline hover:underline">{CATEGORIES[cat].plural}</Link></h3>
                      <p className="mt-1 text-ink-muted">{CAT_META[cat].text}</p>
                    </div>
                  </div>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {Object.entries(CITIES).map(([city, ci]) => (
                      <li key={city}>
                        <Link href={`/uslugi/${cat}/${city}`} className="group flex min-h-12 items-center justify-between rounded-[var(--radius-md)] border border-line px-4 font-semibold text-brand no-underline hover:border-brand hover:bg-brand-tint">
                          <span>{ci.name} <span className="font-normal text-ink-muted">· {countLabel(cat, city as keyof typeof CITIES)}</span></span>
                          <ArrowRight aria-hidden size={18} className="transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* JAK DZIAŁA / ZAUFANIE */}
      <Section tone="surface" labelledBy="h-zasady" className="border-y border-line">
        <Container>
          <SectionHeading id="h-zasady" eyebrow="Jak działa ZOO24" title="Uczciwy katalog, praktyczna wiedza" />
          <ol className="grid gap-6 md:grid-cols-3">
            {[
              { icon: BadgeCheck, t: "Sprawdzamy dane i piszemy skąd", d: "Przy każdej firmie widzisz źródło informacji i datę sprawdzenia. Gdy czegoś nie potwierdziliśmy, mówimy to wprost." },
              { icon: PhoneCall, t: "Kontaktujesz się bezpośrednio", d: "Nie pośredniczymy w rezerwacjach i nie zbieramy Twoich danych. Dzwonisz lub piszesz prosto do firmy." },
              { icon: ShieldCheck, t: "Bez ocen i ukrytych reklam", d: "Kolejność wyników jest neutralna. Jeśli kiedyś pojawią się płatne wyróżnienia, zawsze będą oznaczone jako reklama." },
            ].map((x, i) => (
              <li key={x.t} className="relative rounded-[var(--radius-lg)] bg-canvas p-6">
                <span className="absolute right-5 top-4 font-[family-name:var(--font-display)] text-4xl font-extrabold text-line-strong" aria-hidden>{i + 1}</span>
                <x.icon aria-hidden size={28} className="text-accent-dark" />
                <h3 className="mt-3 text-lg font-bold">{x.t}</h3>
                <p className="mt-1 text-ink-muted">{x.d}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* PORADNIKI */}
      <Section labelledBy="h-poradniki">
        <Container>
          <SectionHeading id="h-poradniki" eyebrow="Poradniki" title="Wiedza, która pomaga wybrać"
            action={<ButtonLink href="/poradniki" variant="secondary" icon={<BookOpen aria-hidden size={18} />}>Wszystkie poradniki</ButtonLink>} />
          {articles.length === 0 ? (
            <p className="rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-surface p-6 text-ink-muted">Pierwsze poradniki są w redakcji — publikujemy je po sprawdzeniu faktów i źródeł.</p>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <li key={a.slug}><ArticleCard a={a} /></li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      {/* NOWA FORMUŁA + DLA FIRM */}
      <Section labelledBy="h-firmy" className="pt-0">
        <Container className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="grid overflow-hidden rounded-[var(--radius-xl)] bg-brand text-white md:grid-cols-[1.3fr_1fr]">
           <div className="p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#ffd9cc]">Dla firm</p>
            <h2 id="h-firmy" className="mt-1 text-3xl font-bold text-white">Prowadzisz salon pielęgnacji lub hotel dla zwierząt?</h2>
            <p className="mt-3 max-w-xl text-white/85">Profil w ZOO24 jest bezpłatny. Każde zgłoszenie sprawdzamy ręcznie, a dane możesz poprawić w każdej chwili.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/dodaj-firme" variant="accent" size="lg" icon={<Handshake aria-hidden size={20} />}>Dodaj firmę</ButtonLink>
              <ButtonLink href="/dla-firm" size="lg" className="border border-white/40 bg-transparent hover:bg-white/10">Jak to działa</ButtonLink>
            </div>
           </div>
           <div className="relative min-h-56 md:min-h-full">
            <Image src={SITE_IMAGES.dlaFirm.src} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 40vw, 100vw" className="object-cover object-[60%_center]" />
            <AiBadge />
           </div>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-8">
            <h2 className="text-2xl font-bold">Czym jest ZOO24</h2>
            <p className="mt-3 text-ink-muted">Pomagamy opiekunom psów i kotów znaleźć dobrą opiekę w swoim mieście — firmy ze sprawdzonymi danymi i źródłem informacji — oraz piszemy praktyczne poradniki o codziennej pielęgnacji.</p>
            <Link href="/o-nas" className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-brand">Więcej o nas <ArrowRight aria-hidden size={18} /></Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
