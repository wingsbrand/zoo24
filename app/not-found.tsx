import Link from "next/link";
import { BookOpen, Building2, Search } from "lucide-react";
import { CATEGORIES, CITIES } from "@/lib/site";
import { Alert, Button, Card, Container } from "@/components/ui";

// 404: Next.js automatycznie dodaje noindex. Wyszukiwarka to zwykły formularz GET (działa bez JS).
export default function NotFound() {
  return (
    <Container size="prose" className="py-12 sm:py-16">
      <p className="text-sm font-semibold uppercase tracking-wide text-accent-dark">Błąd 404</p>
      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Nie znaleźliśmy tej strony</h1>
      <p className="mt-3 text-lg text-ink-muted">Adres mógł się zmienić albo strona została usunięta. Spróbuj znaleźć usługę lub przejdź do poradników.</p>

      <Alert tone="info" title="Szukasz produktu z dawnego sklepu ZOO24?" className="mt-6">
        Sklep ZOO24 nie wraca — nie przyjmujemy zamówień. Dziś publikujemy poradniki i pomagamy znaleźć usługi dla zwierząt. <Link href="/o-nas">Więcej o nowej formule</Link>.
      </Alert>

      <Card as="section" className="mt-8 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-xl font-bold"><Search aria-hidden size={20} className="text-brand" /> Znajdź usługę</h2>
        <form method="get" action="/szukaj" role="search" aria-label="Wyszukaj usługę" className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div className="space-y-1.5">
            <label htmlFor="nf-usluga" className="block font-semibold">Rodzaj usługi</label>
            <select id="nf-usluga" name="usluga" className="min-h-11 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 py-2 text-base">
              {Object.entries(CATEGORIES).map(([slug, c]) => <option key={slug} value={slug}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="nf-miasto" className="block font-semibold">Miasto</label>
            <select id="nf-miasto" name="miasto" className="min-h-11 w-full rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 py-2 text-base">
              {Object.entries(CITIES).map(([slug, c]) => <option key={slug} value={slug}>{c.name}</option>)}
            </select>
          </div>
          <Button type="submit" variant="primary">Szukaj</Button>
        </form>
      </Card>

      <nav aria-label="Przydatne strony" className="mt-8">
        <ul className="grid gap-3 sm:grid-cols-2">
          <li>
            <Link href="/poradniki" className="flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-4 font-semibold text-brand hover:border-brand">
              <BookOpen aria-hidden size={20} /> Poradniki dla opiekunów
            </Link>
          </li>
          <li>
            <Link href="/uslugi" className="flex min-h-11 items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-4 font-semibold text-brand hover:border-brand">
              <Building2 aria-hidden size={20} /> Wszystkie usługi
            </Link>
          </li>
        </ul>
        <p className="mt-4 text-sm text-ink-muted">Uważasz, że link powinien działać? <Link href="/zglos-blad" className="text-brand underline">Zgłoś błąd</Link>.</p>
      </nav>
    </Container>
  );
}
