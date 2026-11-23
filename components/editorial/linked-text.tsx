import Link from "next/link";
import { Fragment } from "react";

// Wewnętrzne ścieżki wpisane w treść poradnika (np. „(/narzedzia/kalkulator-akwarium)”) stają się linkami.
// Tylko znane prefiksy serwisu — bez zewnętrznych adresów i bez HTML z treści.
const INTERNAL = /(\/(?:narzedzia|poradniki|zwierzeta|uslugi|blog|polec-miejsce|dodaj-firme)(?:\/[a-z0-9-]+)*)/g;

export function LinkedText({ text }: { text: string }) {
  const parts = text.split(INTERNAL);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <Link key={i} href={p} className="font-semibold text-brand underline underline-offset-2">{p}</Link>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}
