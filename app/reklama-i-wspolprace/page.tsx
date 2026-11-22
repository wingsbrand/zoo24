import type { Metadata } from "next";
import Link from "next/link";
import { SponsoredBadge } from "@/components/ui";
import { InfoPage } from "@/components/forms/info-page";

export const metadata: Metadata = {
  title: "Reklama i współprace",
  description: "Zasady reklamy, afiliacji i współprac w ZOO24: jawne oznaczenia, brak sponsoringu weterynarii, brak wpływu opłat na treść poradników.",
  alternates: { canonical: "/reklama-i-wspolprace" },
};

export default function ReklamaIWspolprace() {
  return (
    <InfoPage
      title="Reklama i współprace"
      lead="Zarabiać chcemy uczciwie: każda płatna treść jest oznaczona, a opłaty nie wpływają na rzetelność poradników ani kolejność firm."
    >
      <h2>Stan obecny</h2>
      <p>
        Obecnie nie sprzedajemy reklam ani wyróżnień i nie publikujemy linków afiliacyjnych. Poniższe zasady obowiązują od chwili, gdy takie formy współpracy się pojawią.
      </p>

      <h2>Jak oznaczamy reklamy</h2>
      <ul>
        <li>Płatne wyróżnienie firmy zawsze ma widoczną etykietę: <SponsoredBadge />.</li>
        <li>Artykuł sponsorowany ma oznaczenie „Reklama” na początku treści oraz nazwę partnera.</li>
        <li>Link afiliacyjny jest opisany jako „Link afiliacyjny” — jeśli kupisz coś przez taki link, możemy otrzymać prowizję. Nie zmienia to ceny dla Ciebie.</li>
        <li>Posty sponsorowane w mediach społecznościowych oznaczamy zgodnie z zasadami platformy.</li>
      </ul>

      <h2>Czego nie robimy</h2>
      <ul>
        <li><strong>Nie przyjmujemy sponsoringu, reklam ani płatnych wyróżnień od zakładów leczniczych dla zwierząt</strong> (gabinetów, przychodni, klinik weterynaryjnych).</li>
        <li>Nie sprzedajemy pozycji w rankingach i nie publikujemy płatnych opinii.</li>
        <li>Partner nie zatwierdza treści poradników i nie wpływa na wnioski.</li>
        <li>Nie promujemy porad zdrowotnych ani produktów leczniczych.</li>
        <li>Nie wysyłamy niezamówionych ofert handlowych e-mailem, SMS-em ani w wiadomościach prywatnych.</li>
      </ul>

      <h2>Propozycje współpracy</h2>
      <p>
        Masz propozycję? <Link href="/kontakt?temat=wspolpraca">Napisz przez formularz kontaktowy</Link>, wybierając temat „Reklama i współprace”. Każdą propozycję oceniamy pod kątem zgodności z tymi zasadami i <Link href="/zasady-redakcyjne">zasadami redakcyjnymi</Link>.
      </p>
    </InfoPage>
  );
}
