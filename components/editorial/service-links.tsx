// Kontekstowy most poradnik -> katalog (relatedServicePaths). Pomiar: article_to_directory (agregat, bez cookies).
// W podglądzie redakcyjnym zwykłe linki — podgląd nie może zawyżać metryk.
import Link from "next/link";
import { MapPin } from "lucide-react";
import { TrackLink } from "@/components/track-link";
import { buttonClasses, type ButtonSize } from "@/components/ui";
import { CATEGORIES, CITIES, isCategory, isCity } from "@/lib/site";
import type { CategorySlug } from "@/lib/types";

export interface ServiceLink {
  href: string;
  label: string;
  category: CategorySlug | null;
}

/** "/uslugi/groomer/warszawa" -> { label: "Groomer — Warszawa" }; ścieżki spoza /uslugi/ są pomijane. */
export function parseServicePaths(paths: string[]): ServiceLink[] {
  const out: ServiceLink[] = [];
  for (const href of paths) {
    const m = /^\/uslugi\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?\/?$/.exec(href);
    if (!m) continue;
    const [, cat, city] = m;
    const category = isCategory(cat) ? cat : null;
    const catName = category ? CATEGORIES[category].name : cat;
    const cityName = city ? (isCity(city) ? CITIES[city].name : city) : null;
    out.push({ href, label: cityName ? `${catName} — ${cityName}` : catName, category });
  }
  return out;
}

export function serviceHeading(links: ServiceLink[]): string {
  const cats = new Set(links.map((l) => l.category));
  if (cats.size === 1 && cats.has("groomer")) return "Znajdź groomera w swoim mieście";
  if (cats.size === 1 && cats.has("hotel-dla-zwierzat")) return "Znajdź hotel dla zwierząt w swoim mieście";
  return "Znajdź usługę w swoim mieście";
}

function Links({ links, slug, preview, size }: { links: ServiceLink[]; slug: string; preview: boolean; size: ButtonSize }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {links.map((l) => {
        const cls = buttonClasses("secondary", size, "w-full sm:w-auto");
        const content = <><MapPin aria-hidden size={18} />{l.label}</>;
        return (
          <li key={l.href} className="w-full sm:w-auto">
            {preview ? (
              <Link href={l.href} className={cls}>{content}</Link>
            ) : (
              <TrackLink href={l.href} event="article_to_directory" eventRef={slug} className={cls}>{content}</TrackLink>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Kompaktowy blok w treści (~60%) — bez nagłówka, żeby nie zaburzać struktury h2. */
export function ServiceInline({ paths, slug, preview = false }: { paths: string[]; slug: string; preview?: boolean }) {
  const links = parseServicePaths(paths);
  if (!links.length) return null;
  const heading = serviceHeading(links);
  return (
    <aside aria-label={heading} className="my-8 rounded-[var(--radius-lg)] border border-brand/15 bg-brand-tint p-5">
      <p className="mb-0 text-lg font-semibold text-brand-dark [font-family:var(--font-display)]">{heading}</p>
      <p className="mb-0 mt-1 text-base text-ink-muted">Sprawdź firmy w katalogu ZOO24 — z zakresem usług i źródłem danych.</p>
      <Links links={links} slug={slug} preview={preview} size="md" />
    </aside>
  );
}

/** Pełny blok na końcu artykułu. */
export function ServiceSection({ paths, slug, preview = false }: { paths: string[]; slug: string; preview?: boolean }) {
  const links = parseServicePaths(paths);
  if (!links.length) return null;
  return (
    <section aria-labelledby="znajdz-usluge" className="rounded-[var(--radius-lg)] bg-brand p-6 text-white sm:p-8">
      <h2 id="znajdz-usluge" className="text-2xl font-bold text-white">{serviceHeading(links)}</h2>
      <p className="mt-2 text-white/85">Katalog pokazuje zakres usług, obszar działania i dostępne kanały kontaktu. Nie publikujemy ocen ani ukrytych reklam.</p>
      <Links links={links} slug={slug} preview={preview} size="lg" />
    </section>
  );
}
