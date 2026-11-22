import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Ruler } from "lucide-react";
import { Card, Container, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Narzędzia dla opiekunów zwierząt",
  description: "Bezpłatne narzędzia ZOO24: lista informacji dla opiekuna zwierzęcia na czas wyjazdu oraz orientacyjny kalkulator objętości akwarium. Bez konta, dane zostają w przeglądarce.",
  alternates: { canonical: "/narzedzia" },
};

const TOOLS = [
  {
    href: "/narzedzia/lista-dla-opiekuna",
    icon: <ClipboardList aria-hidden size={22} />,
    title: "Lista informacji dla opiekuna zwierzęcia",
    text: "Spisz karmienie, leki z zaleceń lekarza weterynarii, zwyczaje i kontakty, a potem wydrukuj lub pobierz listę dla osoby, która zaopiekuje się zwierzęciem podczas Twojego wyjazdu.",
  },
  {
    href: "/narzedzia/kalkulator-akwarium",
    icon: <Ruler aria-hidden size={22} />,
    title: "Kalkulator objętości akwarium",
    text: "Oblicz orientacyjną objętość akwarium prostopadłościennego lub walcowego — w litrach i galonach, z uwzględnieniem grubości szkła, poziomu wody i podłoża.",
  },
];

export default function NarzedziaPage() {
  return (
    <>
      <PageHeader
        title="Narzędzia"
        lead="Proste narzędzia dla opiekunów zwierząt. Działają bez konta, a wpisane dane nie są wysyłane do ZOO24."
        breadcrumbs={[{ href: "/", label: "ZOO24" }, { label: "Narzędzia" }]}
      />
      <Section labelledBy="lista-narzedzi">
        <Container>
          <h2 id="lista-narzedzi" className="sr-only">Lista narzędzi</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {TOOLS.map((t) => (
              <Card as="li" key={t.href} className="relative p-5 transition-colors focus-within:border-brand hover:border-brand">
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-brand-soft text-brand">{t.icon}</div>
                <h3 className="text-lg font-bold">
                  <Link href={t.href} className="after:absolute after:inset-0 after:content-[''] hover:underline">{t.title}</Link>
                </h3>
                <p className="mt-1 text-ink-muted">{t.text}</p>
              </Card>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ink-muted">
            Szukasz wiedzy o opiece nad zwierzętami? Zajrzyj do <Link href="/poradniki" className="text-brand underline">poradników</Link>.
          </p>
        </Container>
      </Section>
    </>
  );
}
