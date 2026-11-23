import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { CircleHelp, ExternalLink } from "lucide-react";
import { loadSpeciesContent } from "@/lib/portal/species-content";
import { formatDatePl } from "@/components/editorial/format";
import { Container, PageHeader } from "@/components/ui";
import { ArticleGrid, KnowledgeSourceNote, NonPublicBanner } from "@/components/portal/portal-blocks";
import { portalVisibility } from "@/lib/portal/queries";
import { isSpeciesPublic, speciesArticles } from "@/lib/portal/visibility";
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
  return { group: getGroup(grupa), species, isPublic, articles: sortArticles(speciesArticles(v, grupa, gatunek)), content: loadSpeciesContent(gatunek) };
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
    title: `${r.species.name} — potrzeby i zobowiązania opiekuna`,
    description: r.content?.lead.slice(0, 158) ?? `Materiały ZOO24 o gatunku: ${r.species.name}. Potrzeby, zobowiązania opiekuna i źródła.`,
    alternates: { canonical: `/zwierzeta/${r.group.slug}/${r.species.slug}` },
    robots: r.isPublic ? undefined : { index: false, follow: false },
  };
}

export default async function SpeciesPage({ params }: P) {
  const p = await params;
  const r = resolve(p.grupa, p.gatunek);
  if (!r) notFound();
  const { group, species, content } = r;
  // Relacja karta ↔ hub: karta = orientacja w gatunku + profile ras i poradniki tego gatunku; hub grupy = wszystkie materiały działu.
  const breeds = r.articles.filter((a) => a.animal?.breed);
  const guides = r.articles.filter((a) => !a.animal?.breed);
  const groups = byPrimaryNeed(guides);
  const scientific = content?.scientific ?? species.scientific;

  return (
    <>
      {!r.isPublic && <NonPublicBanner what="Karta gatunku przygotowana w zapleczu — niepubliczna" />}
      <PageHeader
        title={species.name}
        breadcrumbs={[{ href: "/", label: "ZOO24" }, { href: "/zwierzeta", label: "Zwierzęta" }, { href: `/zwierzeta/${group.slug}`, label: group.name }, { label: species.name }]}
      >
        {content && <p className="mt-3 max-w-[var(--container-prose)] text-lg text-ink-muted">{content.lead}</p>}
        <dl className="mt-4 grid max-w-xl gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          {scientific && <><dt className="font-semibold text-ink">Nazwa naukowa</dt><dd className="text-ink-muted"><i>{scientific}</i>{content?.scientificNote ? <> — <a href="#nazwa-naukowa" className="text-brand">o nazwie</a></> : null}</dd></>}
          <dt className="font-semibold text-ink">Dział</dt>
          <dd className="text-ink-muted"><Link href={`/zwierzeta/${group.slug}`} className="text-brand">{group.name}</Link> — wszystkie materiały działu</dd>
        </dl>
      </PageHeader>

      <Container className="space-y-12 py-8 sm:py-10">
        {content && (
          <div className="grid gap-6 lg:grid-cols-2">
            {content.sections.map((sec) => (
              <section key={sec.id} aria-labelledby={`s-${sec.id}`} className="rounded-[var(--radius-lg)] border border-line bg-surface p-6">
                <h2 id={`s-${sec.id}`} className="text-xl font-bold sm:text-2xl">{sec.title}</h2>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-ink">
                  {sec.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
                {sec.sourceIndexes.length > 0 && (
                  <p className="mt-3 text-sm text-ink-muted">Źródła: {sec.sourceIndexes.map((i) => <a key={i} href={`#zrodlo-${i + 1}`} className="mr-1 text-brand">[{i + 1}]</a>)}</p>
                )}
              </section>
            ))}
          </div>
        )}

        {content && content.beforeDecision.length > 0 && (
          <section aria-labelledby="h-przed-decyzja" className="rounded-[var(--radius-lg)] border border-accent/30 bg-accent-soft/60 p-6">
            <h2 id="h-przed-decyzja" className="flex items-center gap-2 text-2xl font-bold"><CircleHelp aria-hidden size={24} className="text-accent-dark" /> Zanim zdecydujesz — odpowiedz sobie na te pytania</h2>
            <ul className="mt-4 space-y-2">
              {content.beforeDecision.map((q) => <li key={q} className="flex gap-3"><span aria-hidden className="mt-1 size-5 shrink-0 rounded-[6px] border-2 border-accent-dark bg-surface" /><span>{q}</span></li>)}
            </ul>
          </section>
        )}

        {breeds.length > 0 && (
          <section aria-labelledby="h-rasy">
            <h2 id="h-rasy" className="mb-5 text-2xl font-bold sm:text-3xl">Profile ras</h2>
            <ArticleGrid items={breeds} />
          </section>
        )}

        {groups.map((g) => {
          const id = `potrzeba-${g.need ?? "inne"}`;
          return (
            <section key={id} aria-labelledby={id}>
              <h2 id={id} className="mb-5 text-2xl font-bold sm:text-3xl">{g.need ? needName(g.need) : "Pozostałe materiały"}</h2>
              <ArticleGrid items={g.items} />
            </section>
          );
        })}

        {content && (
          <section aria-labelledby="h-zrodla" className="space-y-3">
            <h2 id="h-zrodla" className="text-2xl font-bold">Źródła</h2>
            {content.scientificNote && <p id="nazwa-naukowa" className="max-w-[var(--container-prose)] text-[0.95rem] text-ink-muted"><span className="font-semibold text-ink">O nazwie naukowej:</span> {content.scientificNote}</p>}
            <ol className="list-decimal space-y-2 pl-6 text-[0.95rem]">
              {content.sources.map((src, i) => (
                <li key={src.url + i} id={`zrodlo-${i + 1}`} className="scroll-mt-24">
                  <a href={src.url} rel="noopener noreferrer" target="_blank" className="inline-flex items-center gap-1 text-brand underline underline-offset-3">{src.label} <ExternalLink aria-hidden size={14} /><span className="sr-only">(otwiera się w nowej karcie)</span></a>
                </li>
              ))}
            </ol>
            <p className="text-sm text-ink-muted">Redakcja ZOO24 · źródła sprawdzone {formatDatePl(content.checkedAt)}. Tekst przygotowany z użyciem narzędzi AI na podstawie wskazanych źródeł. Nie był konsultowany ze specjalistą. <Link href="/zglos-blad" className="font-semibold text-brand">Zgłoś błąd</Link></p>
          </section>
        )}

        <KnowledgeSourceNote />
      </Container>
    </>
  );
}
