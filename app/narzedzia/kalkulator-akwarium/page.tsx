import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader, Section } from "@/components/ui";
import { AquariumCalculator } from "@/components/tools/aquarium-calculator";

export const metadata: Metadata = {
  title: "Kalkulator objętości akwarium (litry i galony)",
  description: "Oblicz orientacyjną objętość akwarium prostopadłościennego lub walcowego w litrach i galonach US. Wymiary w cm lub calach, grubość szkła, poziom wody i podłoże. Widoczne wzory i założenia.",
  alternates: { canonical: "/narzedzia/kalkulator-akwarium" },
};

export default function KalkulatorAkwariumPage() {
  return (
    <>
      <PageHeader
        title="Kalkulator objętości akwarium"
        lead="Orientacyjna objętość akwarium w litrach i galonach — z uwzględnieniem grubości szkła, poziomu wody i miejsca zajętego przez podłoże."
        breadcrumbs={[{ href: "/", label: "ZOO24" }, { href: "/narzedzia", label: "Narzędzia" }, { label: "Kalkulator akwarium" }]}
      />

      <Section>
        <Container>
          <AquariumCalculator />
          <p className="mt-4 text-sm text-ink-muted">Obliczenia wykonuje Twoja przeglądarka. Wpisane wymiary nie są wysyłane do ZOO24.</p>
        </Container>
      </Section>

      <Section tone="surface" labelledBy="jak-korzystac">
        <Container size="prose">
          <h2 id="jak-korzystac" className="text-2xl font-bold">Jak korzystać</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6">
            <li>Wybierz kształt zbiornika i jednostkę (centymetry lub cale).</li>
            <li>Zaznacz, czy mierzysz wymiary wewnętrzne, czy zewnętrzne. Przy zewnętrznych wpisz grubość szkła w milimetrach.</li>
            <li>Podaj, o ile centymetrów lustro wody jest poniżej górnej krawędzi, i — jeśli chcesz — własny szacunek, jaką część objętości zajmują podłoże i dekoracje.</li>
            <li>Wynik i wszystkie użyte wzory pojawią się obok formularza.</li>
          </ol>

          <h2 id="ograniczenia" className="mt-10 text-2xl font-bold">Ograniczenia</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Kalkulator nie określa dopuszczalnej obsady ani parametrów wody. Wynik jest orientacyjny.</li>
            <li>Zakładamy idealny kształt: proste ściany, płaskie dno i jednakową grubość szkła. Zbiorniki gięte, panoramiczne lub z zaokrąglonymi narożnikami mają inną objętość.</li>
            <li>Procent zajęty przez podłoże i dekoracje to Twój szacunek — nie przyjmujemy ukrytych wartości domyślnych.</li>
          </ul>
          <p className="mt-6 text-sm text-ink-muted">
            Więcej wiedzy znajdziesz w <Link href="/poradniki" className="text-brand underline">poradnikach ZOO24</Link>.
          </p>
        </Container>
      </Section>
    </>
  );
}
