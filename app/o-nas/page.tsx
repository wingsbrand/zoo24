import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui";
import { InfoPage, Todo } from "@/components/forms/info-page";

export const metadata: Metadata = {
  title: "O nas — ZOO24 w nowej formule",
  description: "ZOO24 to dziś poradniki dla opiekunów zwierząt i katalog usług (groomerzy, hotele dla zwierząt). Sklep ZOO24 nie wraca.",
  alternates: { canonical: "/o-nas" },
};

export default function ONas() {
  return (
    <InfoPage
      title="ZOO24 w nowej formule"
      crumb="O nas"
      lead="Praktyczne poradniki dla opiekunów zwierząt i katalog usług w Twoim mieście. Bez sprzedaży, bez rezerwacji, bez ukrytych reklam."
    >
      <h2>Sklep ZOO24 nie wraca</h2>
      <p>
        Przez lata część z Was znała ZOO24 jako sklep zoologiczny online. Mówimy wprost: <strong>ZOO24 nie jest już sklepem</strong>. Nie przyjmujemy zamówień, nie prowadzimy sprzedaży, nie obowiązują dawne promocje, kody rabatowe ani programy lojalnościowe.
      </p>
      <Alert tone="warn" title="Dawne zamówienia, zwroty i gwarancje" className="mb-6 not-italic">
        ZOO24 działa w nowej formule. Nie mamy wglądu w dawne zamówienia i nie realizujemy dawnych zamówień, zwrotów ani gwarancji. Sprawy dawnego sklepu: <Todo>podmiot i kanał kontaktu do uzupełnienia przez właściciela</Todo>. Prosimy nie podawać numerów zamówień, adresów ani telefonów w komentarzach w mediach społecznościowych.
      </Alert>

      <h2>Co robimy teraz</h2>
      <ul>
        <li><strong>Poradniki</strong> — praktyczne teksty i checklisty o codziennej opiece nad zwierzętami, ze źródłami i datą aktualizacji.</li>
        <li><strong>Katalog usług</strong> — groomerzy i hotele dla zwierząt w wybranych miastach. Pokazujemy dane firm ze źródłem i datą sprawdzenia. Kliknięcie prowadzi bezpośrednio do firmy.</li>
      </ul>

      <h2>Czego nie robimy</h2>
      <ul>
        <li>Nie sprzedajemy produktów ani usług i nie rezerwujemy terminów.</li>
        <li>Nie publikujemy ocen ani opinii o firmach.</li>
        <li>Nie udzielamy porad weterynaryjnych — w sprawach zdrowia zwierzęcia skontaktuj się z lekarzem weterynarii.</li>
        <li>Nie ukrywamy reklam: każda współpraca płatna lub afiliacyjna jest oznaczona (<Link href="/reklama-i-wspolprace">zasady reklamy i współprac</Link>).</li>
      </ul>

      <h2>Jak pracujemy</h2>
      <p>
        Treści przygotowujemy według <Link href="/zasady-redakcyjne">zasad redakcyjnych</Link>: korzystamy z wiarygodnych źródeł, a szkice przygotowane z pomocą narzędzi AI zawsze sprawdza i zatwierdza człowiek. Błędy poprawiamy — możesz je <Link href="/zglos-blad">zgłosić tutaj</Link>.
      </p>

      <h2>Kto prowadzi ZOO24</h2>
      <p>
        Operator serwisu: <Todo>dane operatora do uzupełnienia przez prawnika</Todo>.
      </p>
      <p>
        Kontakt z redakcją: <Link href="/kontakt">formularz kontaktowy</Link>.
      </p>
    </InfoPage>
  );
}
