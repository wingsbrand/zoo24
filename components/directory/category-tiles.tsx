import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CategorySlug, CitySlug } from "@/lib/types";
import { CATEGORIES, CITIES } from "@/lib/site";
import { CATEGORY_DESCRIPTIONS } from "@/lib/directory/search";
import { firmCount } from "@/lib/directory/format";
import { PILOT_CITIES, type listingCounts } from "@/lib/directory/stats";
import { CategoryTile } from "./category-icon";

type Counts = ReturnType<typeof listingCounts>;

function CityLinks({ category, counts }: { category: CategorySlug; counts: Counts }) {
  return (
    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
      {PILOT_CITIES.map((c: CitySlug) => {
        const n = counts[category][c];
        return (
          <li key={c}>
            <Link
              href={`/uslugi/${category}/${c}`}
              className="flex min-h-12 items-center justify-between gap-2 rounded-[var(--radius-md)] border border-line bg-canvas px-4 py-2 no-underline hover:border-brand hover:bg-brand-tint"
            >
              <span className="min-w-0">
                <span className="block font-semibold text-brand-dark">{CITIES[c].name}</span>
                <span className="block text-sm text-ink-muted">
                  {firmCount(n.total)}{n.demo > 0 && n.demo === n.total ? " (DEMO)" : n.demo > 0 ? `, w tym ${n.demo} DEMO` : ""}
                </span>
              </span>
              <ChevronRight aria-hidden size={18} className="shrink-0 text-brand" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Kafel kategorii z liczbą firm per miasto (z danych). */
export function CategoryCard({ category, counts, headingLevel = 2 }: { category: CategorySlug; counts: Counts; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <li className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-4">
        <CategoryTile category={category} />
        <div className="min-w-0">
          <H className="text-xl font-bold">
            <Link href={`/uslugi/${category}`} className="no-underline hover:underline">{CATEGORIES[category].plural}</Link>
          </H>
          <p className="mt-1 text-ink-muted">{CATEGORY_DESCRIPTIONS[category]}</p>
        </div>
      </div>
      <CityLinks category={category} counts={counts} />
    </li>
  );
}

export function CityCards({ category, counts }: { category: CategorySlug; counts: Counts }) {
  return <CityLinks category={category} counts={counts} />;
}
