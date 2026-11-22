import type { Metadata } from "next";
import Link from "next/link";
import { IS_PRODUCTION } from "@/lib/site";
import { InfoPage, Todo } from "@/components/forms/info-page";

export const metadata: Metadata = {
  title: "Regulamin (szkic)",
  alternates: { canonical: "/regulamin" },
  // Szkic prawny: nieindeksowany do czasu akceptacji prawnika.
  robots: { index: false, follow: IS_PRODUCTION },
};

export default function Regulamin() {
  return (
    <InfoPage title="Regulamin serwisu ZOO24" crumb="Regulamin" draft updated="szkic z 22.11.2026 — nieobowiązujący">
      <h2>§1. Postanowienia ogólne</h2>
      <p>Usługodawca: <Todo>dane operatora do uzupełnienia przez prawnika</Todo>. Serwis ZOO24 udostępnia bezpłatnie poradniki dla opiekunów zwierząt oraz katalog usług (m.in. groomerzy i hotele dla zwierząt). Serwis nie prowadzi sprzedaży, nie pośredniczy w rezerwacjach i nie udziela porad weterynaryjnych.</p>

      <h2>§2. Definicje</h2>
      <p><Todo>Użytkownik, Firma, Profil, Zgłoszenie, Moderator, Treść sponsorowana</Todo></p>

      <h2>§3. Korzystanie z serwisu</h2>
      <p><Todo>wymagania techniczne, zakaz treści bezprawnych, zasady korzystania z formularzy</Todo></p>

      <h2>§4. Profile firm</h2>
      <ul>
        <li>Profil podstawowy jest bezpłatny.</li>
        <li>Zgłoszenie może wysłać właściciel firmy lub upoważniony pracownik. Moderator może poprosić o potwierdzenie uprawnień.</li>
        <li>Zgłaszający odpowiada za prawdziwość podanych danych i podaje wyłącznie publiczne dane firmy.</li>
        <li>Serwis nie publikuje ocen ani opinii. Kolejność wyników nie zależy od opłat. <Todo>opis głównych parametrów kolejności</Todo></li>
        <li>Płatne wyróżnienia są obecnie niedostępne. <Todo>przyszłe warunki — odrębny dokument przed uruchomieniem płatności</Todo></li>
      </ul>

      <h2>§5. Moderacja i zgłaszanie treści</h2>
      <p>Każde zgłoszenie rozpatruje człowiek. O decyzji informujemy na stronie <Link href="/status-zgloszenia">Status zgłoszenia</Link>; przy odrzuceniu podajemy uzasadnienie. Nielegalne lub nieprawdziwe treści można zgłosić przez <Link href="/zglos-blad">formularz zgłoszenia błędu</Link>. <Todo>procedura zgłoszeń i odwołań zgodnie z DSA, punkt kontaktowy</Todo></p>

      <h2>§6. Odpowiedzialność</h2>
      <p><Todo>zakres odpowiedzialności za dane firm i treści poradników; brak porad weterynaryjnych</Todo></p>

      <h2>§7. Reklamacje dotyczące serwisu</h2>
      <p>Uwagi dotyczące działania serwisu można zgłaszać przez <Link href="/kontakt">formularz kontaktowy</Link>. Serwis nie rozpatruje reklamacji produktów kupionych w dawnym sklepie ZOO24. <Todo>tryb i terminy</Todo></p>

      <h2>§8. Dane osobowe</h2>
      <p>Zasady przetwarzania danych opisuje <Link href="/polityka-prywatnosci">polityka prywatności</Link>.</p>

      <h2>§9. Postanowienia końcowe</h2>
      <p><Todo>zmiany regulaminu, prawo właściwe, data wejścia w życie</Todo></p>
    </InfoPage>
  );
}
