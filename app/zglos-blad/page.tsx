import type { Metadata } from "next";
import Link from "next/link";
import { getStore } from "@/lib/store/file-store";
import { findPublicBusiness } from "@/lib/submissions";
import { Alert, Card } from "@/components/ui";
import { ReportErrorForm } from "@/components/forms/report-error-form";
import { InfoPage } from "@/components/forms/info-page";
import { submitReportError } from "./actions";

export const metadata: Metadata = {
  title: "Zgłoś błąd w danych",
  description: "Zauważyłeś nieaktualny telefon, zamkniętą firmę lub błąd w poradniku? Daj nam znać — każde zgłoszenie sprawdzamy ręcznie.",
  alternates: { canonical: "/zglos-blad" },
};

type P = { searchParams: Promise<{ firma?: string | string[]; url?: string | string[] }> };

export default async function ReportErrorPage({ searchParams }: P) {
  const sp = await searchParams;
  const requested = typeof sp.firma === "string" ? sp.firma : null;
  const profile = requested ? findPublicBusiness(getStore().read(), requested) : null;
  // Prefill adresu tylko dla ścieżek względnych tego serwisu (bez otwartego przekierowania/wstrzyknięcia).
  const initialUrl = typeof sp.url === "string" && /^\/(?!\/)\S{0,299}$/.test(sp.url) ? sp.url : undefined;

  return (
    <InfoPage
      prose={false}
      title="Zgłoś błąd w danych"
      lead="Dane firm pochodzą ze źródeł publicznych lub od samych firm i mogą się zdezaktualizować. Pomóż nam je poprawić."
      aside={
        <Card className="p-5 text-sm">
          <h2 className="text-lg font-bold">Dobrze wiedzieć</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Poprawiamy dane, nie oceniamy usług. Nie publikujemy opinii.</li>
            <li>Jeśli reprezentujesz firmę, szybciej będzie <Link href={profile ? `/dodaj-firme?firma=${encodeURIComponent(profile.slug)}` : "/dodaj-firme"} className="text-brand underline">zgłosić aktualizację profilu</Link>.</li>
            <li>Sprawy zdrowia zwierzęcia: skontaktuj się z lekarzem weterynarii.</li>
          </ul>
        </Card>
      }
    >
      <div className="space-y-6">
        {requested && !profile && (
          <Alert tone="warn" title="Nie znaleziono wskazanego profilu">
            Podaj adres strony, na której widzisz błąd.
          </Alert>
        )}
        <ReportErrorForm action={submitReportError} profile={profile ? { slug: profile.slug, name: profile.name } : null} initialUrl={initialUrl} />
      </div>
    </InfoPage>
  );
}
