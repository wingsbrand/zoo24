import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, CalendarCheck, ListOrdered, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { Alert, ButtonLink, Card, Container, PageHeader, Section, SectionHeading } from "@/components/ui";
import { SITE_IMAGES } from "@/lib/content/images";

export const metadata: Metadata = {
  title: "Dla firm — bezpłatny profil w katalogu usług dla zwierząt",
  description: "Prowadzisz salon pielęgnacji lub hotel dla zwierząt? Zgłoś firmę do katalogu ZOO24 bezpłatnie. Ręczna moderacja, źródło i data sprawdzenia danych, bez ocen.",
  alternates: { canonical: "/dla-firm" },
};

const RULES = [
  { icon: <ShieldCheck aria-hidden size={22} />, title: "Bezpłatny profil", text: "Podstawowa obecność w katalogu nic nie kosztuje i nie wymaga umowy." },
  { icon: <UserCheck aria-hidden size={22} />, title: "Ręczna moderacja", text: "Każde zgłoszenie sprawdza człowiek. Weryfikujemy też, czy zgłaszający reprezentuje firmę." },
  { icon: <CalendarCheck aria-hidden size={22} />, title: "Źródło i data sprawdzenia", text: "Przy danych pokazujemy, skąd pochodzą i kiedy je sprawdziliśmy. „Dane sprawdzone” nie oznacza oceny jakości usług." },
  { icon: <BadgeCheck aria-hidden size={22} />, title: "Bez ocen i opinii", text: "Nie publikujemy gwiazdek ani recenzji, bo nie mamy wiarygodnego sposobu ich weryfikacji." },
  { icon: <ListOrdered aria-hidden size={22} />, title: "Neutralna kolejność", text: "Kolejność firm na liście nie zależy od opłat. Zasady sortowania opisujemy w zasadach redakcyjnych." },
];

const BENEFITS = [
  "Opiekunowie zwierząt szukający usług w Twoim mieście zobaczą aktualne dane: zakres usług, obszar działania, telefon i stronę.",
  "Kliknięcie prowadzi bezpośrednio do Ciebie — nie pośredniczymy w rezerwacjach i nie pobieramy prowizji.",
  "Profil jest powiązany z praktycznymi poradnikami dla opiekunów (np. o czym pamiętać przed pierwszą wizytą u groomera).",
  "Możesz w każdej chwili poprosić o aktualizację lub usunięcie profilu.",
];

const FAQ = [
  { q: "Ile kosztuje profil?", a: "Nic. Podstawowy profil jest bezpłatny. Jeśli kiedyś wprowadzimy płatne wyróżnienia, będą dobrowolne i jawnie oznaczone jako reklama." },
  { q: "Czy możecie zagwarantować klientów lub ruch?", a: "Nie. Nie obiecujemy liczby wyświetleń, telefonów ani klientów. Pokazujemy rzetelne dane firmy osobom, które szukają usług." },
  { q: "Moja firma już jest w katalogu. Jak przejąć lub poprawić profil?", a: "Skorzystaj z formularza zgłoszenia — jeśli przejdziesz do niego z profilu firmy, formularz od razu wskaże właściwy profil. Moderator potwierdzi, że reprezentujesz firmę, zanim wprowadzi zmiany." },
  { q: "Skąd macie dane mojej firmy?", a: "Z informacji publikowanych przez samą firmę (np. strona internetowa) albo ze zgłoszenia. Nie kopiujemy automatycznie baz map ani innych katalogów. Przy profilu pokazujemy źródło i datę sprawdzenia." },
  { q: "Jak usunąć profil?", a: "Napisz przez formularz kontaktowy, wybierając temat „Profil firmy w katalogu”. Prośbę rozpatrzy człowiek." },
  { q: "Czy wyślecie mi oferty handlowe?", a: "Nie. Adres e-mail podany w zgłoszeniu służy wyłącznie do weryfikacji i kontaktu w sprawie tego zgłoszenia. Nie wysyłamy niezamówionych ofert." },
  { q: "Prowadzę gabinet weterynaryjny. Czy mogę się zgłosić?", a: "Na razie katalog obejmuje groomerów i hotele dla zwierząt. Zakłady lecznicze dla zwierząt, jeśli pojawią się w katalogu, będą miały wyłącznie neutralny wpis — bez wyróżnień, reklam i rankingów." },
];

export default function DlaFirm() {
  return (
    <>
      <PageHeader
        title="Dla firm"
        lead="Prowadzisz salon pielęgnacji albo hotel dla zwierząt? Zgłoś firmę do katalogu ZOO24 — bezpłatnie, z ręczną moderacją i jasnymi zasadami."
        breadcrumbs={[{ href: "/", label: "ZOO24" }, { label: "Dla firm" }]}
        image={SITE_IMAGES.dlaFirm}
      >
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <ButtonLink href="/dodaj-firme" variant="accent" size="lg">Zgłoś firmę bezpłatnie</ButtonLink>
          <ButtonLink href="/status-zgloszenia" variant="secondary" size="lg">Sprawdź status zgłoszenia</ButtonLink>
        </div>
      </PageHeader>

      <Section labelledBy="zasady">
        <Container>
          <SectionHeading id="zasady" title="Zasady obecności w katalogu" lead="Te same zasady dla wszystkich firm." />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RULES.map((r) => (
              <Card as="li" key={r.title} className="p-5">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">{r.icon}</div>
                <h3 className="text-lg font-bold">{r.title}</h3>
                <p className="mt-1 text-ink-muted">{r.text}</p>
              </Card>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="surface" labelledBy="korzysci">
        <Container size="prose">
          <SectionHeading id="korzysci" title="Co daje profil" />
          <ul className="list-disc space-y-2 pl-6">
            {BENEFITS.map((b) => <li key={b}>{b}</li>)}
          </ul>
          <p className="mt-4 text-sm text-ink-muted">Nie obiecujemy liczby wyświetleń ani klientów. Mierzymy wyłącznie zbiorcze kliknięcia „Zadzwoń” i „Strona firmy” — bez śledzenia osób.</p>
        </Container>
      </Section>

      <Section labelledBy="wyroznienia">
        <Container size="prose">
          <SectionHeading id="wyroznienia" title="Wyróżnienia" />
          <Alert tone="info" title="Obecnie niedostępne">
            Planujemy w przyszłości jawnie oznaczone płatne wyróżnienia (zawsze z etykietą „Reklama · wyróżnienie płatne”). Dziś nie można ich kupić. Wyróżnienia nie będą dostępne dla zakładów leczniczych dla zwierząt. Bezpłatny profil pozostanie bezpłatny.
          </Alert>
        </Container>
      </Section>

      <Section tone="soft" labelledBy="kroki">
        <Container>
          <SectionHeading id="kroki" title="Jak dodać firmę — 3 kroki" />
          <ol className="grid gap-4 md:grid-cols-3">
            {[
              { t: "Wypełnij formularz", d: "Nazwa, rodzaj usług, miasto, publiczne dane kontaktowe firmy i e-mail do weryfikacji. Zajmie to kilka minut." },
              { t: "Poczekaj na moderację", d: "Dostaniesz kod zgłoszenia. Moderator sprawdzi dane i to, czy reprezentujesz firmę." },
              { t: "Sprawdź status", d: "Na stronie statusu zobaczysz decyzję, a w razie odrzucenia — jej powód." },
            ].map((s, i) => (
              <Card as="li" key={s.t} className="p-5">
                <p aria-hidden className="mb-2 flex size-9 items-center justify-center rounded-full bg-brand font-bold text-white">{i + 1}</p>
                <h3 className="text-lg font-bold"><span className="sr-only">Krok {i + 1}: </span>{s.t}</h3>
                <p className="mt-1 text-ink-muted">{s.d}</p>
              </Card>
            ))}
          </ol>
        </Container>
      </Section>

      <Section labelledBy="faq">
        <Container size="prose">
          <SectionHeading id="faq" title="Najczęstsze pytania" />
          <div className="divide-y divide-line rounded-[var(--radius-lg)] border border-line bg-surface">
            {FAQ.map((f) => (
              <details key={f.q} className="group px-5">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="shrink-0 text-brand transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
                </summary>
                <p className="pb-4 text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 rounded-[var(--radius-lg)] bg-brand-tint p-6 text-center">
            <Sparkles aria-hidden className="mx-auto mb-2 text-brand" />
            <p className="text-lg font-semibold">Gotowe? Zgłoszenie zajmie kilka minut.</p>
            <p className="mt-1 text-sm text-ink-muted">Masz pytanie? <Link href="/kontakt?temat=profil" className="text-brand underline">Napisz do nas</Link>.</p>
            <ButtonLink href="/dodaj-firme" variant="primary" size="lg" className="mt-4">Przejdź do formularza</ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
