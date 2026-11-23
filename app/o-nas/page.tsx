import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Todo } from "@/components/forms/info-page";
import { OPERATOR } from "@/lib/legal/operator";

export const metadata: Metadata = {
  title: "O nas",
  description: "ZOO24 to poradniki dla opiekunów zwierząt i katalog usług (groomerzy, hotele dla zwierząt) w największych miastach Polski.",
  alternates: { canonical: "/o-nas" },
};

export default function ONas() {
  return (
    <InfoPage
      title="O ZOO24"
      crumb="O nas"
      lead="Praktyczne poradniki dla opiekunów zwierząt i katalog usług w Twoim mieście. Bez sprzedaży, bez rezerwacji, bez ukrytych reklam."
    >
      <h2>Co robimy</h2>
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
        Treści przygotowujemy według <Link href="/zasady-redakcyjne">zasad redakcyjnych</Link>: korzystamy z wiarygodnych źródeł i podajemy je przy każdym artykule. Tematy zdrowotne, warunki utrzymania, prawo i treści sponsorowane publikujemy dopiero po sprawdzeniu przez człowieka z odpowiednią wiedzą. Błędy poprawiamy — możesz je <Link href="/zglos-blad">zgłosić tutaj</Link>.
      </p>

      <h2>Kto prowadzi ZOO24</h2>
      <p>
        Operator serwisu:{" "}
        {OPERATOR.legalName ?? <>{OPERATOR.shortName} <Todo>pełna nazwa spółki z formą prawną</Todo></>}, z siedzibą:{" "}
        {OPERATOR.registeredAddress ?? <Todo>adres siedziby</Todo>}, NIP: {OPERATOR.nip ?? <Todo>NIP</Todo>}
        {OPERATOR.krs ? <>, KRS: {OPERATOR.krs}</> : null}.
      </p>
      <p>
        Kontakt z redakcją: <Link href="/kontakt">formularz kontaktowy</Link> lub e-mail:{" "}
        {OPERATOR.contactEmail ? <a href={`mailto:${OPERATOR.contactEmail}`}>{OPERATOR.contactEmail}</a> : <Todo>adres e-mail usługodawcy</Todo>}.
        Zasady korzystania z serwisu: <Link href="/regulamin">regulamin</Link> i <Link href="/polityka-prywatnosci">polityka prywatności</Link>.
      </p>
    </InfoPage>
  );
}
