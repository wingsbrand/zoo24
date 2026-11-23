import Link from "next/link";
import { CATEGORIES, CITIES } from "@/lib/site";
import { TOOLS, type GroupVisibility } from "@/lib/portal/visibility";
import type { ServiceLinks } from "@/lib/portal/services";
import { portalVisibility, storeServiceLinks } from "@/lib/portal/queries";
import { Logo } from "./logo";

/** Dane stopki z magazynu; przy błędzie odczytu — tylko stałe linki (bez pustych stron). */
function footerData(): { groups: GroupVisibility[]; services: ServiceLinks } {
  try {
    return { groups: portalVisibility().publicGroups, services: storeServiceLinks() };
  } catch {
    return { groups: [], services: { categories: [] } };
  }
}

export function SiteFooter() {
  const { groups, services } = footerData();
  const col = "space-y-1 text-sm";
  const a = "inline-flex min-h-11 items-center text-ink-muted no-underline hover:text-brand hover:underline";
  const h = "mb-2 font-[family-name:var(--font-sans)] text-sm font-bold uppercase tracking-wide text-ink";
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[var(--container-page)] gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-[1.3fr_repeat(5,1fr)]">
        <div className="space-y-3 sm:col-span-2 lg:col-span-3 xl:col-span-1">
          <Logo />
          <p className="max-w-xs text-sm text-ink-muted">Praktyczna wiedza o zwierzętach towarzyszących, poradniki ze źródłami i katalog usług. Piszemy, skąd mamy informacje.</p>
          <p className="max-w-xs text-xs text-ink-muted">Nie prowadzimy sprzedaży ani rezerwacji. Nie udzielamy porad weterynaryjnych.</p>
        </div>
        <nav aria-labelledby="f-zwierzeta">
          <h2 id="f-zwierzeta" className={h}>Zwierzęta</h2>
          <ul className={col}>
            <li><Link className={a} href="/zwierzeta">Atlas zwierząt</Link></li>
            {groups.map((g) => (
              <li key={g.group.slug}><Link className={a} href={`/zwierzeta/${g.group.slug}`}>{g.group.name}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="f-poradniki">
          <h2 id="f-poradniki" className={h}>Poradniki</h2>
          <ul className={col}>
            <li><Link className={a} href="/poradniki">Wszystkie poradniki</Link></li>
            <li><Link className={a} href="/zasady-redakcyjne">Zasady redakcyjne</Link></li>
            <li><Link className={a} href="/zglos-blad">Zgłoś błąd w treści</Link></li>
          </ul>
        </nav>
        <nav aria-labelledby="f-narzedzia">
          <h2 id="f-narzedzia" className={h}>Narzędzia</h2>
          <ul className={col}>
            <li><Link className={a} href="/narzedzia">Wszystkie narzędzia</Link></li>
            {TOOLS.map((t) => (
              <li key={t.path}><Link className={a} href={t.path}>{t.title}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="f-uslugi">
          <h2 id="f-uslugi" className={h}>Usługi</h2>
          <ul className={col}>
            <li><Link className={a} href="/uslugi">Katalog usług</Link></li>
            {services.categories.map((c) => (
              <li key={c.category}>
                <Link className={a} href={`/uslugi/${c.category}`}>{CATEGORIES[c.category].plural}</Link>
                {c.cities.length > 0 && (
                  <ul className="ml-3 border-l border-line pl-3">
                    {c.cities.map((ci) => (
                      <li key={ci.city}><Link className={a} href={`/uslugi/${c.category}/${ci.city}`}>{CITIES[ci.city].name}</Link></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-6">
          <nav aria-labelledby="f-firmy">
            <h2 id="f-firmy" className={h}>Dla firm</h2>
            <ul className={col}>
              <li><Link className={a} href="/dla-firm">Obecność w katalogu</Link></li>
              <li><Link className={a} href="/dodaj-firme">Dodaj firmę</Link></li>
              <li><Link className={a} href="/status-zgloszenia">Status zgłoszenia</Link></li>
              <li><Link className={a} href="/reklama-i-wspolprace">Reklama i współprace</Link></li>
            </ul>
          </nav>
          <nav aria-labelledby="f-zoo24">
            <h2 id="f-zoo24" className={h}>O ZOO24</h2>
            <ul className={col}>
              <li><Link className={a} href="/o-nas">O nas</Link></li>
              <li><Link className={a} href="/kontakt">Kontakt</Link></li>
              <li><Link className={a} href="/polityka-prywatnosci">Polityka prywatności</Link></li>
              <li><Link className={a} href="/regulamin">Regulamin</Link></li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[var(--container-page)] px-4 py-4 text-xs text-ink-muted sm:px-6">
          Kolejność wyników w katalogu jest neutralna (alfabetyczna lub wg daty sprawdzenia danych). Nie publikujemy ocen ani rankingów. Płatne wyróżnienia — jeśli pojawią się w przyszłości — będą oznaczone jako reklama.
        </p>
      </div>
    </footer>
  );
}
