import type { Metadata } from "next";
import Link from "next/link";
import { IS_PRODUCTION } from "@/lib/site";
import { InfoPage, Todo } from "@/components/forms/info-page";

export const metadata: Metadata = {
  title: "Polityka prywatności (szkic)",
  alternates: { canonical: "/polityka-prywatnosci" },
  // Szkic prawny: nieindeksowany do czasu akceptacji prawnika.
  robots: { index: false, follow: IS_PRODUCTION },
};

export default function PolitykaPrywatnosci() {
  return (
    <InfoPage title="Polityka prywatności" crumb="Polityka prywatności" draft updated="szkic z 22.11.2026 — nieobowiązujący">
      <h2>1. Administrator danych</h2>
      <p>Administratorem danych osobowych jest <Todo>nazwa, adres siedziby, NIP/KRS operatora — do uzupełnienia przez prawnika</Todo>. Kontakt w sprawach danych osobowych: <Link href="/kontakt?temat=dane_osobowe">formularz kontaktowy, temat „Dane osobowe (RODO)”</Link> <Todo>ew. dedykowany kanał / IOD</Todo>.</p>

      <h2>2. Jakie dane zbieramy i po co</h2>
      <ul>
        <li><strong>Zgłoszenie firmy:</strong> publiczne dane firmy (nazwa, rodzaj usług, miejscowość, strona www, telefon firmowy, zakres usług) oraz e-mail osoby zgłaszającej i jej rola — w celu weryfikacji i moderacji zgłoszenia. <Todo>podstawa prawna</Todo></li>
        <li><strong>Zgłoszenie błędu:</strong> treść zgłoszenia i — opcjonalnie — e-mail, aby dopytać o szczegóły. <Todo>podstawa prawna</Todo></li>
        <li><strong>Formularz kontaktowy:</strong> temat, treść wiadomości i e-mail — w celu udzielenia odpowiedzi. <Todo>podstawa prawna</Todo></li>
        <li><strong>Pomiar zbiorczy:</strong> zliczamy kliknięcia „Zadzwoń”/„Strona firmy” i przejścia z poradników do katalogu jako dzienne sumy, bez cookies i bez identyfikowania osób. <Todo>ocena podstawy i zakresu</Todo></li>
      </ul>
      <p>Nie zbieramy adresów zamieszkania osób prywatnych. Nie publikujemy e-maili osób zgłaszających. Nie przenosimy do serwisu danych klientów, zamówień ani list mailingowych dawnego sklepu ZOO24.</p>

      <h2>3. Ochrona przed nadużyciami</h2>
      <p>Formularze chroni ukryte pole antyspamowe i limit liczby zgłoszeń. Do limitu używamy skrótu (hash) technicznych nagłówków przeglądarki, przechowywanego krótko w pamięci serwera; nie zapisujemy adresu IP. <Todo>ocena prawnika</Todo></p>

      <h2>4. Odbiorcy danych</h2>
      <p><Todo>dostawcy hostingu, bazy danych, poczty — lista podmiotów przetwarzających i umowy powierzenia</Todo></p>

      <h2>5. Okres przechowywania</h2>
      <p><Todo>np. zgłoszenia: do czasu rozpatrzenia + okres na ewentualne roszczenia; wiadomości: X miesięcy</Todo></p>

      <h2>6. Twoje prawa</h2>
      <p>Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, sprzeciwu oraz wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych. <Todo>doprecyzowanie praw zależnie od podstawy prawnej</Todo></p>

      <h2>7. Cookies i analityka</h2>
      <p>Prototyp nie używa cookies analitycznych ani marketingowych. <Todo>przed włączeniem analityki niekoniecznej: zgoda (CMP) i opis narzędzi</Todo></p>

      <h2>8. Media społecznościowe</h2>
      <p><Todo>wspólne administrowanie danymi statystyk stron (Page Insights) — opis po ocenie prawnika</Todo></p>

      <h2>9. Zmiany polityki</h2>
      <p><Todo>zasady informowania o zmianach</Todo></p>
    </InfoPage>
  );
}
