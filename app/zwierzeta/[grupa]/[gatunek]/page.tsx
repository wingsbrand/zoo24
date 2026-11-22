import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CircleCheck, CircleDashed } from "lucide-react";
import { Container, PageHeader } from "@/components/ui";
import { ArticleGrid, KnowledgeSourceNote, NonPublicBanner } from "@/components/portal/portal-blocks";
import { portalVisibility } from "@/lib/portal/queries";
import { isSpeciesPublic, speciesArticles, speciesCoverage } from "@/lib/portal/visibility";
import { needName } from "@/lib/portal/labels";
import { sortArticles } from "@/lib/content/topics";
import { findSpecies, getGroup, isGroupSlug, NEEDS, type NeedSlug } from "@/lib/taxonomy/animals";
import { IS_PRODUCTION } from "@/lib/site";
import type { Article } from "@/lib/types";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ grupa: string; gatunek: string }> };

function resolve(grupa: string, gatunek: string) {
  if (!isGroupSlug(grupa)) return null;
  const species = findSpecies(grupa, gatunek);
  if (!species) return null;
  const v = portalVisibility();
  const isPublic = isSpeciesPublic(v, grupa, gatunek);
  if (!isPublic && IS_PRODUCTION) return null;
  return { group: getGroup(grupa), species, isPublic, articles: sortArticles(speciesArticles(v, grupa, gatunek)) };
}

/** Materiały pogrupowane wg pierwszej (głównej) potrzeby, w kolejności osi potrzeb. */
function byPrimaryNeed(list: Article[]): { need: NeedSlug | null; items: Article[] }[] {
  const order = [...NEEDS.map((n) => n.slug), null] as (NeedSlug | null)[];
  return order
    .map((need) => ({ need, items: list.filter((a) => (a.needs?.[0] ?? null) === need) }))
    .filter((g) => g.items.length > 0);
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await params;
  const r = resolve(p.grupa, p.gatunek);
  if (!r) return {};
  return {
    title: `${r.species.name} — karta gatunku`,
    description: `Opublikowane materiały ZOO24 o gatunku: ${r.species.name}. Ze źródłami i jawnym zakresem przeglądu; brakujące dane oznaczamy wprost.`,
    alternates: { canonical: `/zwierzeta/${r.group.slug}/${r.species.slug}` },
    robots: r.isPublic ? undefined : { index: false, follow: false },
  };
}

export default async function SpeciesPage({ params }: P) {
  const p = await params;
  const r = resolve(p.grupa, p.gatunek);
  if (!r) notFound();
  const { group, species, articles } = r;
  const coverage = speciesCoverage(species, articles);
  const groups = byPrimaryNeed(articles);

  return (
    <>
      {!r.isPublic && <NonPublicBanner what="Karta gatunku przygotowana w zapleczu — niepubliczna" />}
      <PageHeader
        title={species.name}
        breadcrumbs={[{ href: "/", label: "ZOO24" }, { href: "/zwierzeta", label: "Zwierzęta" }, { href: `/zwierzeta/${group.slug}`, label: group.name }, { label: species.name }]}
      >
        <dl className="mt-4 grid max-w-xl gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="font-semibold text-ink">Nazwa naukowa</dt>
          <dd className="text-ink-muted">{species.scientific ? <i>{species.scientific}</i> : "brak potwierdzonych danych"}</dd>
          <dt className="font-semibold text-ink">Dział</dt>
          <dd className="text-ink-muted">{group.name}</dd>
        </dl>
      </PageHeader>

      <Container className="space-y-12 py-8 sm:py-10">
        {groups.map((g) => {
          const id = `potrzeba-${g.need ?? "inne"}`;
          return (
            <section key={id} aria-labelledby={id}>
              <h2 id={id} className="mb-5 text-2xl font-bold sm:text-3xl">{g.need ? needName(g.need) : "Pozostałe materiały"}</h2>
              <ArticleGrid items={g.items} />
            </section>
          );
        })}

        <section aria-labelledby="h-zakres" className="grid gap-4 md:grid-cols-2">
          <h2 id="h-zakres" className="text-2xl font-bold sm:text-3xl md:col-span-2">Zakres karty</h2>
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
            <h3 className="text-lg font-bold">Opracowane w opublikowanych materiałach</h3>
            {coverage.covered.length ? (
              <ul className="mt-3 space-y-2">
                {coverage.covered.map((c) => <li key={c} className="flex gap-2"><CircleCheck aria-hidden size={18} className="mt-0.5 shrink-0 text-ok" />{c}</li>)}
              </ul>
            ) : <p className="mt-2 text-ink-muted">Żaden z obszarów karty nie jest jeszcze opracowany.</p>}
          </div>
          <div className="rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-surface p-5">
            <h3 className="text-lg font-bold">Dane, których jeszcze nie potwierdziliśmy</h3>
            {coverage.missing.length ? (
              <ul className="mt-3 space-y-2">
                {coverage.missing.map((c) => <li key={c} className="flex gap-2"><CircleDashed aria-hidden size={18} className="mt-0.5 shrink-0 text-ink-muted" />{c}</li>)}
              </ul>
            ) : <p className="mt-2 text-ink-muted">Wszystkie obszary karty mają opublikowane materiały.</p>}
            <p className="mt-3 text-sm text-ink-muted">Nie uzupełniamy tych pól domysłami. Nie oceniamy gatunków etykietami typu „łatwy” czy „dla dziecka” — opisujemy wymagania, aby można było ocenić je samodzielnie.</p>
          </div>
        </section>

        <KnowledgeSourceNote />
      </Container>
    </>
  );
}
