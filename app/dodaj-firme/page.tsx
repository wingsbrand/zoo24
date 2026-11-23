import type { Metadata } from "next";
import Link from "next/link";
import { getStore } from "@/lib/store/file-store";
import { IS_PRODUCTION } from "@/lib/site";
import { ROLE_OPTIONS, categoryOptions, cityOptions, findPublicBusiness } from "@/lib/submissions";
import { Alert, Card } from "@/components/ui";
import { AddBusinessForm } from "@/components/forms/add-business-form";
import { InfoPage } from "@/components/forms/info-page";
import { submitAddBusiness } from "./actions";

export const metadata: Metadata = {
  title: "Zgłoś firmę lub zaktualizuj profil",
  description: "Bezpłatne zgłoszenie firmy usługowej dla zwierząt do katalogu ZOO24. Każde zgłoszenie sprawdza moderator.",
  alternates: { canonical: "/dodaj-firme" },
  robots: { index: false, follow: IS_PRODUCTION },
};

type P = { searchParams: Promise<{ profil?: string | string[]; firma?: string | string[] }> };

export default async function AddBusinessPage({ searchParams }: P) {
  const sp = await searchParams;
  // ?profil=<slug> (aktualizacja/przejęcie istniejącego profilu); ?firma= — dawny parametr, zgodność wstecz.
  const requested = typeof sp.profil === "string" ? sp.profil : typeof sp.firma === "string" ? sp.firma : null;
  const profile = requested ? findPublicBusiness(getStore().read(), requested) : null;

  return (
    <InfoPage
      prose={false}
      title={profile ? "Zaktualizuj lub przejmij profil firmy" : "Zgłoś firmę do katalogu"}
      crumb={profile ? "Aktualizacja profilu" : "Zgłoś firmę"}
      lead="Formularz dla właściciela lub upoważnionego pracownika firmy. Obecność w katalogu jest bezpłatna. Zgłoszenie trafia do ręcznej moderacji — po weryfikacji dane pojawią się w katalogu z informacją o źródle i dacie sprawdzenia."
      aside={
        <Card className="p-5 text-sm">
          <h2 className="text-lg font-bold">Jak to działa</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>Wysyłasz formularz i dostajesz kod zgłoszenia.</li>
            <li>
              Moderator sprawdza dane i Twoje prawo do reprezentowania firmy — np. kontaktem przez oficjalny e-mail lub telefon
              firmy podany na jej stronie.
            </li>
            <li>Do czasu weryfikacji nic nie zmienia się publicznie{profile ? " — profil pozostaje w obecnej wersji" : ""}.</li>
            <li>Status sprawdzasz kodem na stronie <Link href="/status-zgloszenia" className="text-brand underline">Status zgłoszenia</Link>.</li>
          </ol>
          <p className="mt-4 text-ink-muted">Szczegóły: <Link href="/dla-firm" className="text-brand underline">zasady dla firm</Link>.</p>
        </Card>
      }
    >
      <div className="space-y-6">
        <Alert tone="info" title="Nie prowadzisz tej firmy?">
          Jeśli znasz dobre miejsce jako klient, <Link href="/polec-miejsce" className="font-semibold underline">poleć je w osobnym formularzu</Link>.
          Polecenie nie wymaga reprezentowania firmy i nie daje prawa do zarządzania profilem.
        </Alert>
        {requested && !profile && (
          <Alert tone="warn" title="Nie znaleziono wskazanego profilu">
            Profil mógł zostać usunięty albo adres jest nieprawidłowy. Możesz zgłosić firmę jako nową poniżej.
          </Alert>
        )}
        {profile?.demo && (
          <Alert tone="warn" title="To przykładowy profil DEMO">
            Ten profil jest fikcyjny i służy wyłącznie do testów prototypu. Zgłoszenie zostanie zapisane tylko lokalnie.
          </Alert>
        )}
        <AddBusinessForm
          action={submitAddBusiness}
          categories={categoryOptions()}
          cities={cityOptions()}
          roles={Object.entries(ROLE_OPTIONS).map(([value, label]) => ({ value, label }))}
          profile={profile}
        />
      </div>
    </InfoPage>
  );
}
