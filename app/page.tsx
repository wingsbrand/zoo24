import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SITE_IMAGES, CATEGORY_IMAGES } from "@/lib/content/images";
import { ArrowRight, BadgeCheck, BedDouble, BookOpen, Bot, Compass, Handshake, Scissors, Search, ShieldCheck, Wrench } from "lucide-react";
import { getStore } from "@/lib/store/file-store";
import { CATEGORIES, CITIES } from "@/lib/site";
import { AiBadge, ButtonLink, Container, Section, SectionHeading } from "@/components/ui";
import { ServiceSearch } from "@/components/directory/search-form";
import { firmCount } from "@/lib/directory/format";
import { computeVisibility, isPublicArticle, TOOLS } from "@/lib/portal/visibility";
import { serviceLinks } from "@/lib/portal/services";
import { QUERY_MAX, hubHref, sortArticles } from "@/lib/content/topics";
import { articlesLabel } from "@/components/editorial/format";
import { ArticleGrid, GroupCard, ToolList } from "@/components/portal/portal-blocks";

export const dynamic = "force-dynamic";

const TITLE = "ZOO24 — wiedza o zwierzętach, poradniki i usługi dla opiekunów";
const DESCRIPTION = "Praktyczna wiedza o zwierzętach towarzyszących: poradniki ze źródłami i jawnym przeglądem, narzędzia dla opiekunów oraz katalog usług z podanym źródłem danych.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
};

const CAT_META = {
  groomer: { icon: Scissors, text: "Kąpiel, strzyżenie, trymowanie i pielęgnacja pazurów — dla psów i kotów." },
  "hotel-dla-zwierzat": { icon: BedDouble, text: "Opieka dzienna i nocna, gdy wyjeżdżasz. Sprawdź warunki pobytu, zanim zarezerwujesz." },
} as const;

export default function Home() {
  const s = getStore().read();
  const vis = computeVisibility(s.articles);
  // Tylko prawdziwe, opublikowane poradniki (bez DEMO).
  const guides = sortArticles(s.articles.filter(isPublicArticle)).slice(0, 3);
  const planning = vis.needCounts["wybor-zwierzecia"];
  // Tylko niepuste kombinacje usługa × miasto (≥1 realna firma).
  const services = serviceLinks(s.businesses);
  const realByCat = new Map(services.categories.map((c) => [c.category, c]));

  return (
    <>
      {/* 1. HERO — wartość + jedna wyszukiwarka wiedzy */}
      <section className="relative overflow-hidden border-b border-line bg-brand-tint">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9] xl:hidden">
          <Image src={SITE_IMAGES.hero.src} alt={SITE_IMAGES.hero.alt} fill sizes="100vw" className="object-cover object-[25%_center]" />
          <AiBadge />
        </div>
        <div className="absolute inset-y-0 right-0 hidden w-[42%] xl:block">
          <Image src={SITE_IMAGES.hero.src} alt="" fill priority sizes="42vw" className="object-cover object-[18%_center]" />
          <div aria-hidden className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-brand-tint to-transparent" />
          <AiBadge className="bottom-3 right-3" />
        </div>
        <Container className="relative py-10 sm:py-14 xl:py-24">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-sm font-semibold text-brand shadow-[var(--shadow-card)]">
            <BadgeCheck aria-hidden size={16} /> Wiedza o zwierzętach towarzyszących · ze źródłami
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold sm:text-5xl lg:text-6xl">
            Zrozum swojego zwierzaka. <span className="text-accent-dark">Zadbaj o niego lepiej</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted sm:text-xl">
            Praktyczne poradniki o przygotowaniu domu, codziennej opiece i warunkach — z podanymi źródłami i jawnym zakresem przeglądu.
          </p>
          <form action="/poradniki" method="get" role="search" aria-label="Szukaj wiedzy o zwierzętach" className="mt-8 max-w-2xl rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-[var(--shadow-raised)] sm:p-6">
            <label htmlFor="home-q" className="mb-1.5 block font-semibold text-ink">Szukaj w poradnikach i działach o zwierzętach</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                id="home-q"
                name="q"
                type="search"
                maxLength={QUERY_MAX}
                placeholder="np. nazwa zwierzęcia lub temat"
                aria-describedby="home-q-hint"
                className="min-h-12 w-full min-w-0 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 text-base text-ink placeholder:text-ink-muted/70 hover:border-brand focus:border-brand"
              />
              <button type="submit" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-5 font-semibold text-white hover:bg-accent-dark">
                <Search aria-hidden size={18} /> Szukaj
              </button>
            </div>
            <p id="home-q-hint" className="mt-2 text-sm text-ink-muted">Przeszukujemy opublikowane poradniki. Firm szukasz niżej, w module usług.</p>
          </form>
        </Container>
      </section>

      {/* 2. WYBÓR GRUPY ZWIERZĄT — tylko działy publiczne */}
      <Section labelledBy="h-zwierzeta">
        <Container>
          <SectionHeading id="h-zwierzeta" eyebrow="Zwierzęta" title="Wybierz zwierzę"
            action={vis.publicGroups.length > 0 ? <ButtonLink href="/zwierzeta" variant="secondary" icon={<Compass aria-hidden size={18} />}>Atlas zwierząt</ButtonLink> : undefined} />
          {vis.publicGroups.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vis.publicGroups.map((g) => <li key={g.group.slug}><GroupCard v={g} /></li>)}
            </ul>
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-surface p-6">
              <p className="text-ink-muted">Działy o poszczególnych zwierzętach są w redakcji — udostępniamy je dopiero wtedy, gdy mają sprawdzone materiały. Do tego czasu zajrzyj do poradników i narzędzi.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <ButtonLink href="/poradniki" variant="secondary" icon={<BookOpen aria-hidden size={18} />}>Poradniki</ButtonLink>
                <ButtonLink href="/narzedzia" variant="secondary" icon={<Wrench aria-hidden size={18} />}>Narzędzia</ButtonLink>
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* 3. DOPIERO PLANUJESZ ZWIERZĘ? — tylko gdy są materiały */}
      {planning > 0 && (
        <Section labelledBy="h-planujesz" className="pt-0">
          <Container>
            <div className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <h2 id="h-planujesz" className="text-2xl font-bold sm:text-3xl">Dopiero planujesz zwierzę?</h2>
                <p className="mt-2 max-w-2xl text-ink-muted">Zanim zdecydujesz, sprawdź wymagania, zobowiązania i przygotowanie domu. {articlesLabel(planning)} o wyborze zwierzęcia.</p>
              </div>
              <ButtonLink href={hubHref({ potrzeba: "wybor-zwierzecia" })} variant="primary" icon={<ArrowRight aria-hidden size={18} />}>Zacznij od wyboru</ButtonLink>
            </div>
          </Container>
        </Section>
      )}

      {/* 4. WYBRANE OPUBLIKOWANE PORADNIKI */}
      <Section tone="surface" labelledBy="h-poradniki" className="border-y border-line">
        <Container>
          <SectionHeading id="h-poradniki" eyebrow="Poradniki" title="Najnowsze poradniki"
            action={<ButtonLink href="/poradniki" variant="secondary" icon={<BookOpen aria-hidden size={18} />}>Wszystkie poradniki</ButtonLink>} />
          {guides.length === 0 ? (
            <p className="rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-canvas p-6 text-ink-muted">Pierwsze poradniki są w redakcji — publikujemy je po sprawdzeniu faktów i źródeł.</p>
          ) : (
            <ArticleGrid items={guides} />
          )}
        </Container>
      </Section>

      {/* 5. NARZĘDZIA */}
      <Section labelledBy="h-narzedzia">
        <Container>
          <SectionHeading id="h-narzedzia" eyebrow="Narzędzia" title="Praktyczne narzędzia dla opiekunów"
            lead="Działają w przeglądarce, bez konta. Pokazują założenia obliczeń i nie zastępują porady specjalisty."
            action={<ButtonLink href="/narzedzia" variant="secondary" icon={<Wrench aria-hidden size={18} />}>Wszystkie narzędzia</ButtonLink>} />
          <ToolList tools={TOOLS} />
        </Container>
      </Section>

      {/* 6. USŁUGI — osobny moduł */}
      <Section tone="soft" labelledBy="h-uslugi" className="border-y border-line">
        <Container>
          <SectionHeading id="h-uslugi" eyebrow="Usługi" title="Szukasz usługi dla zwierzęcia?"
            lead="Katalog groomerów i hoteli dla zwierząt w 10 największych miastach. Przy każdej firmie podajemy źródło danych; kontaktujesz się z nią bezpośrednio." />
          <div className="mb-8 max-w-3xl">
            <ServiceSearch variant="compact" idPrefix="home-uslugi" />
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {(Object.keys(CATEGORIES) as (keyof typeof CATEGORIES)[]).map((cat) => {
              const Icon = CAT_META[cat].icon;
              const real = realByCat.get(cat);
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
                  {real ? (
                    <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                      {real.cities.map((ci) => (
                        <li key={ci.city}>
                          <Link href={`/uslugi/${cat}/${ci.city}`} className="group flex min-h-12 items-center justify-between rounded-[var(--radius-md)] border border-line px-4 font-semibold text-brand no-underline hover:border-brand hover:bg-brand-tint">
                            <span>{CITIES[ci.city].name} <span className="font-normal text-ink-muted">· {firmCount(ci.real)}</span></span>
                            <ArrowRight aria-hidden size={18} className="transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-5 text-sm text-ink-muted">Zbieramy i sprawdzamy dane firm w tej kategorii. Użyj wyszukiwarki powyżej, aby sprawdzić swoje miasto.</p>
                  )}
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* 7. JAK PRACUJEMY */}
      <Section labelledBy="h-zasady">
        <Container>
          <SectionHeading id="h-zasady" eyebrow="Jak pracujemy" title="Wiedza ze źródłami, przegląd dopasowany do tematu"
            action={<ButtonLink href="/zasady-redakcyjne" variant="secondary">Zasady redakcyjne</ButtonLink>} />
          <ol className="grid gap-6 md:grid-cols-3">
            {[
              { icon: BookOpen, t: "Źródła przy kluczowych informacjach", d: "Każdy poradnik ma listę źródeł, a najważniejsze informacje wskazują konkretne źródło. Brakujących danych nie zgadujemy — piszemy wprost, czego jeszcze nie potwierdziliśmy." },
              { icon: ShieldCheck, t: "Przegląd zależny od tematu", d: "Żywienie, warunki utrzymania i transport sprawdza osoba z wiedzą o danym gatunku, a tematy zdrowotne — lekarz weterynarii. Przy artykule widać, kto go sprawdził i kiedy kolejny przegląd." },
              { icon: Bot, t: "Udział AI oznaczony jawnie", d: "Asystent AI pomaga w redakcji. Taki przegląd oznaczamy jako „redakcja ZOO24 z udziałem AI” — nigdy nie przedstawiamy go jako przeglądu człowieka. Nie udzielamy porad weterynaryjnych." },
            ].map((x, i) => (
              <li key={x.t} className="relative rounded-[var(--radius-lg)] border border-line bg-surface p-6">
                <span className="absolute right-5 top-4 font-[family-name:var(--font-display)] text-4xl font-extrabold text-line-strong" aria-hidden>{i + 1}</span>
                <x.icon aria-hidden size={28} className="text-accent-dark" />
                <h3 className="mt-3 text-lg font-bold">{x.t}</h3>
                <p className="mt-1 text-ink-muted">{x.d}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      {/* 9. DLA FIRM (sekcja social pominięta: brak potwierdzonych adresów profili w dokumentacji) */}
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
            <p className="mt-3 text-ink-muted">Portal wiedzy dla opiekunów zwierząt towarzyszących: poradniki ze źródłami, narzędzia i katalog usług z podanym źródłem danych. Nie prowadzimy sprzedaży ani rezerwacji.</p>
            <Link href="/o-nas" className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-brand">Więcej o nas <ArrowRight aria-hidden size={18} /></Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
