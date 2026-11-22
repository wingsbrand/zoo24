import Link from "next/link";
import { CATEGORIES, CITIES } from "@/lib/site";
import { Logo } from "./logo";

export function SiteFooter() {
  const col = "space-y-1 text-sm";
  const a = "inline-flex min-h-11 items-center text-ink-muted no-underline hover:text-brand hover:underline";
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[var(--container-page)] gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-ink-muted">Usługi i praktyczna wiedza dla opiekunów zwierząt. Sprawdzamy dane firm i piszemy, skąd je mamy.</p>
          <p className="max-w-xs text-xs text-ink-muted">Nie prowadzimy sprzedaży ani rezerwacji. Nie udzielamy porad weterynaryjnych.</p>
        </div>
        <nav aria-labelledby="f-uslugi">
          <h2 id="f-uslugi" className="mb-2 font-[family-name:var(--font-sans)] text-sm font-bold uppercase tracking-wide text-ink">Usługi</h2>
          <ul className={col}>
            {Object.entries(CATEGORIES).flatMap(([cat, c]) =>
              Object.entries(CITIES).map(([city, ci]) => (
                <li key={cat + city}><Link className={a} href={`/uslugi/${cat}/${city}`}>{c.name} — {ci.name}</Link></li>
              )),
            )}
          </ul>
        </nav>
        <nav aria-labelledby="f-zoo24">
          <h2 id="f-zoo24" className="mb-2 font-[family-name:var(--font-sans)] text-sm font-bold uppercase tracking-wide text-ink">ZOO24</h2>
          <ul className={col}>
            <li><Link className={a} href="/poradniki">Poradniki</Link></li>
            <li><Link className={a} href="/o-nas">O ZOO24</Link></li>
            <li><Link className={a} href="/zasady-redakcyjne">Zasady redakcyjne i dane firm</Link></li>
            <li><Link className={a} href="/reklama-i-wspolprace">Reklama i współprace</Link></li>
            <li><Link className={a} href="/kontakt">Kontakt</Link></li>
          </ul>
        </nav>
        <nav aria-labelledby="f-firmy">
          <h2 id="f-firmy" className="mb-2 font-[family-name:var(--font-sans)] text-sm font-bold uppercase tracking-wide text-ink">Dla firm i pomoc</h2>
          <ul className={col}>
            <li><Link className={a} href="/dla-firm">Obecność w katalogu</Link></li>
            <li><Link className={a} href="/dodaj-firme">Dodaj firmę</Link></li>
            <li><Link className={a} href="/status-zgloszenia">Sprawdź status zgłoszenia</Link></li>
            <li><Link className={a} href="/zglos-blad">Zgłoś błąd w danych</Link></li>
            <li><Link className={a} href="/polityka-prywatnosci">Polityka prywatności</Link></li>
            <li><Link className={a} href="/regulamin">Regulamin</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[var(--container-page)] px-4 py-4 text-xs text-ink-muted sm:px-6">
          Kolejność wyników w katalogu jest neutralna (alfabetyczna lub wg daty sprawdzenia danych). Nie publikujemy ocen ani rankingów. Płatne wyróżnienia — jeśli pojawią się w przyszłości — będą oznaczone jako reklama.
        </p>
      </div>
    </footer>
  );
}
