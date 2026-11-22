import type { Metadata } from "next";
import Link from "next/link";
import { IS_PRODUCTION } from "@/lib/site";
import { animalGroupOptions, categoryOptions, cityOptions } from "@/lib/submissions";
import { Alert, Card } from "@/components/ui";
import { RecommendPlaceForm } from "@/components/forms/recommend-place-form";
import { InfoPage } from "@/components/forms/info-page";
import { submitRecommendPlace } from "./actions";

export const metadata: Metadata = {
  title: "Poleć miejsce",
  description: "Znasz dobrą firmę usługową dla zwierząt? Poleć ją — redakcja ZOO24 sprawdzi dane w publicznych źródłach przed publikacją.",
  alternates: { canonical: "/polec-miejsce" },
  robots: { index: false, follow: IS_PRODUCTION },
};

export default function RecommendPlacePage() {
  return (
    <InfoPage
      prose={false}
      title="Poleć miejsce"
      lead="Znasz dobrego groomera, hotel dla zwierząt albo inną usługę? Daj nam znać — sprawdzimy ją, zanim cokolwiek pokażemy w katalogu."
      aside={
        <Card className="p-5 text-sm">
          <h2 className="text-lg font-bold">Co dzieje się z poleceniem</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Polecenie <strong>nie tworzy profilu automatycznie</strong>.</li>
            <li>Redakcja sprawdza dane miejsca w publicznych źródłach, np. na stronie firmy.</li>
            <li>Profil pojawia się tylko wtedy, gdy dane da się potwierdzić. Firma może go później przejąć.</li>
            <li>Status sprawdzisz kodem na stronie <Link href="/status-zgloszenia" className="text-brand underline">Status zgłoszenia</Link>.</li>
          </ol>
        </Card>
      }
    >
      <div className="space-y-6">
        <Alert tone="info" title="Polecasz jako klient">
          Polecenie nie daje prawa do zarządzania profilem firmy. Jeśli prowadzisz tę firmę albo jesteś jej upoważnionym pracownikiem,
          skorzystaj z formularza <Link href="/dodaj-firme" className="font-semibold underline">Zgłoś firmę</Link>.
        </Alert>
        <RecommendPlaceForm
          action={submitRecommendPlace}
          categories={categoryOptions()}
          cities={cityOptions()}
          animals={animalGroupOptions()}
        />
      </div>
    </InfoPage>
  );
}
