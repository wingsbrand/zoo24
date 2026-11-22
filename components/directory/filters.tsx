import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui";
import {
  activeFilterChips, activeFilterCount, clearFiltersHref, type Facets, type FacetOption, type ListingFilters,
} from "@/lib/directory/query";
import { capitalize, firmCount } from "@/lib/directory/format";

const optionRow = "flex min-h-11 cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1.5 hover:bg-brand-tint";
const control = "size-5 shrink-0 accent-[var(--color-brand)]";

function Count({ n }: { n: number }) {
  return (
    <span className="ml-auto text-sm tabular-nums text-ink-muted">
      <span aria-hidden>({n})</span>
      <span className="sr-only">, {firmCount(n)}</span>
    </span>
  );
}

function Group({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-1 border-t border-line pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-1 font-semibold text-ink">{legend}</legend>
      {children}
    </fieldset>
  );
}

function CheckboxOptions({ name, options, prefix }: { name: string; options: FacetOption[]; prefix: string }) {
  return (
    <ul className="space-y-0.5">
      {options.map((o, i) => (
        <li key={o.value}>
          <label htmlFor={`${prefix}-${name}-${i}`} className={optionRow}>
            <input id={`${prefix}-${name}-${i}`} type="checkbox" name={name} value={o.value} defaultChecked={o.selected} className={control} />
            <span className="min-w-0 break-words">{capitalize(o.label)}</span>
            <Count n={o.count} />
          </label>
        </li>
      ))}
    </ul>
  );
}

/** Formularz filtrów (GET) — stan w URL. Liczby = ile firm będzie widocznych po wybraniu opcji. */
export function FilterForm({ base, filters, facets, prefix }: { base: string; filters: ListingFilters; facets: Facets; prefix: string }) {
  const empty = !facets.zwierze.length && !facets.uslugi.length && !facets.kontakt.length;
  if (empty) return <p className="text-sm text-ink-muted">Brak danych do filtrowania w tym listingu.</p>;
  const active = activeFilterCount(filters) > 0;
  return (
    <form action={base} method="get" className="space-y-4" aria-label="Filtry wyników">
      {filters.sort !== "nazwa" && <input type="hidden" name="sort" value={filters.sort} />}
      {facets.zwierze.length > 0 && (
        <Group legend="Dla jakich zwierząt">
          <ul className="space-y-0.5">
            <li>
              <label htmlFor={`${prefix}-zw-all`} className={optionRow}>
                <input id={`${prefix}-zw-all`} type="radio" name="zwierze" value="" defaultChecked={!filters.zwierze} className={control} />
                <span>Wszystkie</span>
              </label>
            </li>
            {facets.zwierze.map((o) => (
              <li key={o.value}>
                <label htmlFor={`${prefix}-zw-${o.value}`} className={optionRow}>
                  <input id={`${prefix}-zw-${o.value}`} type="radio" name="zwierze" value={o.value} defaultChecked={o.selected} className={control} />
                  <span>{o.label}</span>
                  <Count n={o.count} />
                </label>
              </li>
            ))}
          </ul>
        </Group>
      )}
      {facets.uslugi.length > 0 && (
        <Group legend="Zakres usług">
          <CheckboxOptions name="usluga" options={facets.uslugi} prefix={prefix} />
        </Group>
      )}
      {facets.kontakt.length > 0 && (
        <Group legend="Dostępny kontakt">
          <CheckboxOptions name="kontakt" options={facets.kontakt} prefix={prefix} />
        </Group>
      )}
      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        <Button type="submit" variant="primary">Pokaż wyniki</Button>
        {active && <Link href={clearFiltersHref(base, filters)} className={buttonClasses("ghost")}>Wyczyść</Link>}
      </div>
    </form>
  );
}

/** Panel: na desktopie kolumna boczna, na telefonie zwijany <details>. */
export function FilterPanel({ base, filters, facets }: { base: string; filters: ListingFilters; facets: Facets }) {
  const n = activeFilterCount(filters);
  return (
    <>
      <details className="rounded-[var(--radius-lg)] border border-line bg-surface lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 font-semibold text-brand-dark [&::-webkit-details-marker]:hidden">
          <SlidersHorizontal aria-hidden size={18} /> Filtry ({n})
          <span aria-hidden className="ml-auto text-sm font-normal text-ink-muted">rozwiń</span>
        </summary>
        <div className="border-t border-line p-4">
          <FilterForm base={base} filters={filters} facets={facets} prefix="fm" />
        </div>
      </details>
      <div className="hidden rounded-[var(--radius-lg)] border border-line bg-surface p-4 lg:block">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><SlidersHorizontal aria-hidden size={18} /> Filtry</h2>
        <FilterForm base={base} filters={filters} facets={facets} prefix="fd" />
      </div>
    </>
  );
}

/** Pasek aktywnych filtrów: każdy z przyciskiem usunięcia + „Wyczyść wszystkie”. */
export function ActiveFilters({ base, filters }: { base: string; filters: ListingFilters }) {
  const chips = activeFilterChips(base, filters);
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-sm font-semibold text-ink">Aktywne filtry:</p>
      <ul className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <li key={`${c.key}-${c.value}`}>
            <Link
              href={c.href}
              aria-label={`Usuń filtr: ${c.label}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft px-3 text-sm font-medium text-brand-dark no-underline hover:border-brand"
            >
              <span className="break-words">{capitalize(c.label)}</span>
              <X aria-hidden size={16} />
            </Link>
          </li>
        ))}
      </ul>
      <Link href={clearFiltersHref(base, filters)} className={buttonClasses("ghost", "md", "text-sm underline underline-offset-4")}>Wyczyść wszystkie</Link>
    </div>
  );
}
