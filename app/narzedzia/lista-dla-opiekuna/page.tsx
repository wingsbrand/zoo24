import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader, Section } from "@/components/ui";
import { CaretakerSheetTool } from "@/components/tools/caretaker-sheet";

export const metadata: Metadata = {
  title: "Lista informacji dla opiekuna zwierzęcia podczas wyjazdu",
  description: "Przygotuj listę dla osoby, która zaopiekuje się Twoim zwierzęciem: karmienie, leki z zaleceń lekarza weterynarii, zwyczaje, kontakty i plan dnia. Druk, PDF lub plik tekstowy. Dane zostają w przeglądarce.",
  alternates: { canonical: "/narzedzia/lista-dla-opiekuna" },
};

export default function ListaDlaOpiekunaPage() {
  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title="Lista informacji dla opiekuna zwierzęcia podczas wyjazdu"
          lead="Zbierz w jednym miejscu wszystko, co powinna wiedzieć osoba opiekująca się Twoim zwierzęciem, i przekaż jej wydruk lub plik."
          breadcrumbs={[{ href: "/", label: "ZOO24" }, { href: "/narzedzia", label: "Narzędzia" }, { label: "Lista dla opiekuna" }]}
        />
      </div>

      <Section className="print:py-0">
        <Container size="prose">
          <CaretakerSheetTool />
        </Container>
      </Section>

      <Section tone="surface" labelledBy="jak-korzystac" className="print:hidden">
        <Container size="prose">
          <h2 id="jak-korzystac" className="text-2xl font-bold">Jak korzystać</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-6">
            <li>Wypełnij tylko te pola, które są potrzebne. Puste pola nie pojawią się na wydruku ani w pliku.</li>
            <li>Masz więcej zwierząt? Użyj przycisku „Dodaj kolejne zwierzę”.</li>
            <li>Wybierz „Drukuj / zapisz jako PDF” (w oknie drukowania możesz wybrać zapis do PDF) albo pobierz plik tekstowy.</li>
            <li>Po przekazaniu listy na wspólnym urządzeniu kliknij „Wyczyść”.</li>
          </ol>

          <h2 id="ograniczenia" className="mt-10 text-2xl font-bold">Ograniczenia</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Narzędzie niczego nie zaleca: nie dobiera karmy, porcji ani dawek leków. Leki przepisz dokładnie z zaleceń lekarza weterynarii.</li>
            <li>Lista nie zastępuje kontaktu z lekarzem weterynarii. W razie niepokojących objawów opiekun powinien się z nim skontaktować.</li>
            <li>Dane są zapisywane tylko w tej przeglądarce. Wyczyszczenie danych przeglądarki lub tryb prywatny usuwa listę — zachowaj wydruk lub plik.</li>
          </ul>
          <h2 id="przed-wyjazdem" className="mt-10 text-2xl font-bold">Zanim wypełnisz listę</h2>
          <ul className="mt-3 space-y-3">
            <li><Link href="/poradniki/jak-wybrac-opieke-dla-psa-na-czas-wyjazdu" className="font-semibold text-brand underline">Jak wybrać opiekę dla psa na czas wyjazdu</Link> — porównanie form opieki i lista ustaleń z opiekunem.</li>
            <li><Link href="/poradniki/informacje-dla-opiekuna-kota" className="font-semibold text-brand underline">Informacje dla opiekuna kota</Link> — co spisać i pokazać przed wyjazdem.</li>
            <li><Link href="/poradniki/ptaki-opieka-na-czas-wyjazdu" className="font-semibold text-brand underline">Ptaki: opieka na czas wyjazdu</Link> — na co zwrócić uwagę przy ptakach.</li>
          </ul>
        </Container>
      </Section>
    </>
  );
}
