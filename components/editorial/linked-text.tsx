import Link from "next/link";
import { Fragment } from "react";

// Linki wewnętrzne w treści poradnika (tylko znane prefiksy serwisu — bez adresów zewnętrznych i bez HTML z treści):
//  - „[Lista informacji dla opiekuna](/narzedzia/lista-dla-opiekuna)” => link z opisową etykietą,
//  - surowa ścieżka „/narzedzia/kalkulator-akwarium” => link z etykietą ze słownika (audyt V4 A13: bez surowych URL).
const PATH = String.raw`\/(?:narzedzia|poradniki|zwierzeta|uslugi|blog|polec-miejsce|dodaj-firme)(?:\/[a-z0-9-]+)*`;
const TOKEN = new RegExp(String.raw`\[([^\]\n]{1,120})\]\((${PATH})\)|\(?(${PATH})\)?`, "g");

const LABELS: Record<string, string> = {
  "/narzedzia/lista-dla-opiekuna": "lista informacji dla opiekuna",
  "/narzedzia/kalkulator-akwarium": "kalkulator objętości akwarium",
  "/narzedzia": "narzędzia ZOO24",
  "/poradniki": "wszystkie poradniki",
  "/zwierzeta": "atlas zwierząt",
  "/uslugi": "katalog usług",
  "/uslugi/groomer": "katalog groomerów",
  "/polec-miejsce": "formularz polecenia miejsca",
  "/dodaj-firme": "formularz zgłoszenia firmy",
};

export const labelForPath = (p: string): string => LABELS[p] ?? p;

export function LinkedText({ text }: { text: string }) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(<Fragment key={`t${i}`}>{text.slice(last, start)}</Fragment>);
    const href = m[2] ?? m[3]!;
    const label = m[1] ?? labelForPath(href);
    out.push(<Link key={`l${i}`} href={href} className="font-semibold text-brand underline underline-offset-2">{label}</Link>);
    last = start + m[0].length;
    i++;
  }
  if (last < text.length) out.push(<Fragment key="end">{text.slice(last)}</Fragment>);
  return <>{out}</>;
}
