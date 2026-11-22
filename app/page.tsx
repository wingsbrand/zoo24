import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, BedDouble, BookOpen, Handshake, PhoneCall, Scissors, ShieldCheck } from "lucide-react";
import { getStore } from "@/lib/store/file-store";
import { CATEGORIES, CITIES } from "@/lib/site";
import { articleHref } from "@/lib/content/editorial";
import { ButtonLink, Container, DemoBadge, Section, SectionHeading } from "@/components/ui";
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
      <section className="paw-pattern relative overflow-hidden border-b border-line bg-brand-tint">
        {/* Dekoracja: motyw łapy z poduszką-sercem (tylko duże ekrany, bez znaczenia dla treści) */}
        <svg aria-hidden viewBox="0 0 96 96" className="pointer-events-none absolute -right-32 top-1/2 hidden h-[26rem] w-[26rem] -translate-y-1/2 lg:block xl:-right-8 xl:h-[32rem] xl:w-[32rem] 2xl:right-[6%]">
          <circle cx="48" cy="48" r="48" fill="#0e4f5c" opacity="0.07" />
          <ellipse cx="25" cy="42" rx="7.5" ry="9.5" fill="#0e4f5c" opacity="0.14" transform="rotate(-22 25 42)" />
          <ellipse cx="38" cy="26" rx="7.5" ry="10" fill="#0e4f5c" opacity="0.14" transform="rotate(-8 38 26)" />
          <ellipse cx="58" cy="26" rx="7.5" ry="10" fill="#0e4f5c" opacity="0.14" transform="rotate(8 58 26)" />
          <ellipse cx="71" cy="42" rx="7.5" ry="9.5" fill="#0e4f5c" opacity="0.14" transform="rotate(22 71 42)" />
          <path d="M48 81C39 74.5 25 65 25 54c0-6.5 5-11 11-11 5 0 9 2.8 12 7 3-4.2 7-7 12-7 6 0 11 4.5 11 11 0 11-14 20.5-23 27z" fill="#ef6c4a" opacity="0.35" />
        </svg>
        <Container className="relative py-12 sm:py-20">
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
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
            <li className="flex items-center gap-1.5"><ShieldCheck aria-hidden size={16} className="text-brand" /> Bez ocen i ukrytych reklam</li>
            <li className="flex items-center gap-1.5"><BadgeCheck aria-hidden size={16} className="text-brand" /> Przy każdej firmie źródło i data sprawdzenia</li>
            <li className="flex items-center gap-1.5"><PhoneCall aria-hidden size={16} className="text-brand" /> Kontakt bezpośrednio z firmą, bez pośrednika</li>
          </ul>
        </Container>
      </section>

      {/* KATEGORIE */}
      <Section labelledBy="h-kategorie">
        <Container>
          <SectionHeading id="h-kategorie" eyebrow="Usługi" title="Czego szukasz?" lead="Zaczynamy od dwóch rodzajów usług i dwóch miast. Rozszerzymy katalog, gdy dane będą sprawdzone." />
          <ul className="grid gap-4 md:grid-cols-2">
            {(Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]).map((cat) => {
              const Icon = CAT_META[cat].icon;
              return (
                <li key={cat} className="flex flex-col rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-[var(--shadow-card)]">
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
            <ul className="grid gap-4 md:grid-cols-3">
              {articles.map((a) => (
                <li key={a.slug} className="group relative flex flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] focus-within:ring-2 focus-within:ring-accent">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-accent-dark">Poradnik</span>
                    <DemoBadge show={a.demo} />
                  </div>
                  <h3 className="text-lg font-bold leading-snug">
                    <Link href={articleHref(a)} className="no-underline after:absolute after:inset-0 after:content-[''] group-hover:underline">{a.title}</Link>
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{a.summary}</p>
                  <p className="mt-auto pt-4 text-xs text-ink-muted">Aktualizacja: {new Date(a.updatedAt).toLocaleDateString("pl-PL")}</p>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </Section>

      {/* NOWA FORMUŁA + DLA FIRM */}
      <Section labelledBy="h-firmy" className="pt-0">
        <Container className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-[var(--radius-xl)] bg-brand p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#ffd9cc]">Dla firm</p>
            <h2 id="h-firmy" className="mt-1 text-3xl font-bold text-white">Prowadzisz salon pielęgnacji lub hotel dla zwierząt?</h2>
            <p className="mt-3 max-w-xl text-white/85">Profil w ZOO24 jest bezpłatny. Każde zgłoszenie sprawdzamy ręcznie, a dane możesz poprawić w każdej chwili.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink href="/dodaj-firme" variant="accent" size="lg" icon={<Handshake aria-hidden size={20} />}>Dodaj firmę</ButtonLink>
              <ButtonLink href="/dla-firm" size="lg" className="border border-white/40 bg-transparent hover:bg-white/10">Jak to działa</ButtonLink>
            </div>
          </div>
          <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-8">
            <h2 className="text-2xl font-bold">ZOO24 w nowej formule</h2>
            <p className="mt-3 text-ink-muted">Wiele osób zna ZOO24 jako sklep zoologiczny. Sklep nie wraca — nie przyjmujemy zamówień i nie obsługujemy dawnych zamówień ani gwarancji. Teraz pomagamy znaleźć firmy ze sprawdzonymi danymi i piszemy praktyczne poradniki.</p>
            <Link href="/o-nas" className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-brand">Więcej o nas <ArrowRight aria-hidden size={18} /></Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
