import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage, Todo } from "@/components/forms/info-page";

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
        Treści przygotowujemy według <Link href="/zasady-redakcyjne">zasad redakcyjnych</Link>: korzystamy z wiarygodnych źródeł, a przy każdym artykule piszemy, kto go sprawdził — także gdy była to redakcja z udziałem AI. Tematy zdrowotne, prawne i sponsorowane zawsze zatwierdza człowiek. Błędy poprawiamy — możesz je <Link href="/zglos-blad">zgłosić tutaj</Link>.
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
