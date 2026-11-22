import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_TOPICS } from "@/lib/submissions";
import { Card } from "@/components/ui";
import { ContactForm } from "@/components/forms/contact-form";
import { InfoPage } from "@/components/forms/info-page";
import { submitContact } from "./actions";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Napisz do redakcji ZOO24 przez formularz kontaktowy. Odpowiadamy indywidualnie.",
  alternates: { canonical: "/kontakt" },
};

type P = { searchParams: Promise<{ temat?: string | string[] }> };

export default async function ContactPage({ searchParams }: P) {
  const sp = await searchParams;
  const initialTopic = typeof sp.temat === "string" && Object.hasOwn(CONTACT_TOPICS, sp.temat) ? sp.temat : undefined;

  return (
    <InfoPage
      prose={false}
      title="Kontakt"
      lead="Masz pytanie o serwis, profil firmy albo współpracę? Napisz przez formularz — wiadomości czyta i odpowiada na nie człowiek."
      aside={
        <Card className="p-5 text-sm">
          <h2 className="text-lg font-bold">Zanim napiszesz</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>ZOO24 nie prowadzi sprzedaży ani rezerwacji — w sprawie terminu lub ceny skontaktuj się bezpośrednio z firmą.</li>
            <li>Nie udzielamy porad weterynaryjnych — w sprawie zdrowia zwierzęcia skontaktuj się z lekarzem weterynarii.</li>
            <li>Błąd w danych firmy? Użyj formularza <Link href="/zglos-blad" className="text-brand underline">Zgłoś błąd</Link>.</li>
            <li>Chcesz dodać firmę? <Link href="/dodaj-firme" className="text-brand underline">Zgłoś firmę</Link>.</li>
          </ul>
        </Card>
      }
    >
      <ContactForm action={submitContact} topics={Object.entries(CONTACT_TOPICS).map(([value, label]) => ({ value, label }))} initialTopic={initialTopic} />
    </InfoPage>
  );
}
