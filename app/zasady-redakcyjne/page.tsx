import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/forms/info-page";

export const metadata: Metadata = {
  title: "Zasady redakcyjne",
  description: "Jak ZOO24 przygotowuje poradniki i sprawdza dane firm: źródła, weryfikacja przez człowieka, korekty, brak ocen i porad weterynaryjnych.",
  alternates: { canonical: "/zasady-redakcyjne" },
};

export default function ZasadyRedakcyjne() {
  return (
    <InfoPage
      title="Zasady redakcyjne"
      lead="Jak przygotowujemy poradniki, skąd bierzemy dane firm i co robimy, gdy popełnimy błąd."
    >
      <h2>1. Źródła</h2>
      <p>
        Każdy poradnik ma listę źródeł. Korzystamy przede wszystkim z publikacji instytucji, organizacji branżowych i specjalistów. Przy artykule podajemy datę ostatniej aktualizacji oraz informację, kto go sprawdził.
      </p>

      <h2>2. Szkice z pomocą AI zawsze sprawdza człowiek</h2>
      <p>
        Niektóre szkice przygotowujemy z pomocą narzędzi AI. Żaden tekst nie jest publikowany automatycznie: przed publikacją redaktor sprawdza fakty ze źródłami, poprawia treść i zatwierdza ją. Nie publikujemy hurtowo tekstów generowanych maszynowo.
      </p>

      <h2>3. Bez porad weterynaryjnych</h2>
      <p>
        Poradniki dotyczą codziennej opieki i przygotowania do usług (np. pielęgnacji czy pobytu w hotelu). Nie diagnozujemy, nie zalecamy leków ani dawek. W sprawach zdrowia zwierzęcia zawsze odsyłamy do lekarza weterynarii.
      </p>

      <h2>4. Dane firm: weryfikacja to nie ocena</h2>
      <ul>
        <li>Dane firm pochodzą z informacji publikowanych przez same firmy (np. ich strony internetowe) albo ze zgłoszeń firm, sprawdzonych przez moderatora.</li>
        <li>Nie kopiujemy automatycznie baz map ani innych katalogów.</li>
        <li>Przy profilu pokazujemy źródło danych i datę sprawdzenia. Oznaczenie „Dane sprawdzone” dotyczy wyłącznie zgodności danych ze źródłem — <strong>nie jest oceną jakości usług</strong>.</li>
        <li>Nie publikujemy ocen, gwiazdek ani opinii.</li>
        <li>Brakujące informacje oznaczamy wprost (np. „brak potwierdzonych danych”), zamiast je zgadywać.</li>
      </ul>

      <h2>5. Kolejność wyników</h2>
      <p>
        Kolejność firm w katalogu jest neutralna i nie zależy od opłat. Ewentualne przyszłe płatne wyróżnienia będą zawsze oznaczone etykietą „Reklama · wyróżnienie płatne” i nie obejmą zakładów leczniczych dla zwierząt.
      </p>

      <h2>6. Reklama i afiliacja</h2>
      <p>
        Treści sponsorowane i linki afiliacyjne oznaczamy wyraźnie przy treści. Szczegóły: <Link href="/reklama-i-wspolprace">reklama i współprace</Link>.
      </p>

      <h2>7. Korekty</h2>
      <p>
        Jeśli znajdziesz błąd, <Link href="/zglos-blad">zgłoś go</Link>. Każde zgłoszenie sprawdza człowiek. Istotne poprawki w poradnikach odnotowujemy przy dacie aktualizacji.
      </p>

      <h2>8. Prywatność w treściach</h2>
      <p>
        Nie publikujemy danych osobowych opiekunów zwierząt ani dawnych klientów sklepu. Nie kopiujemy komentarzy ani wiadomości prywatnych do naszych materiałów.
      </p>
    </InfoPage>
  );
}
