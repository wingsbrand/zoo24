import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Container, PageHeader } from "@/components/ui";
import { ArticleGrid, KnowledgeSourceNote, NonPublicBanner, ToolList } from "@/components/portal/portal-blocks";
import { portalVisibility, storeServiceLinks } from "@/lib/portal/queries";
import { groupSections } from "@/lib/portal/visibility";
import { sortArticles } from "@/lib/content/topics";
import { getGroup, groupMetaDescription, isGroupSlug, type GroupSlug } from "@/lib/taxonomy/animals";
import { CATEGORIES, CITIES, IS_PRODUCTION } from "@/lib/site";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ grupa: string }> };

/** Usługi z katalogu pokazujemy tylko w działach, których dotyczą istniejące kategorie (psy, koty). */
const SERVICE_GROUPS: readonly GroupSlug[] = ["psy", "koty"];

function resolve(slug: string) {
  if (!isGroupSlug(slug)) return null;
  const v = portalVisibility().groups[slug];
  if (!v.isPublic && IS_PRODUCTION) return null;
  return v;
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const v = resolve((await params).grupa);
  if (!v) return {};
  const g = v.group;
  return {
    title: `${g.name} — wiedza dla opiekunów`,
    description: groupMetaDescription(g),
    alternates: { canonical: `/zwierzeta/${g.slug}` },
    robots: v.isPublic ? undefined : { index: false, follow: false },
  };
}

export default async function GroupPage({ params }: P) {
  const v = resolve((await params).grupa);
  if (!v) notFound();
  const g = getGroup(v.group.slug);
  const sections = groupSections(sortArticles(v.publishedArticles));
  const services = SERVICE_GROUPS.includes(g.slug) ? storeServiceLinks(g.slug).categories : [];
  const otherSpecies = g.species.length - v.publicSpecies.length;

  return (
    <>
      {!v.isPublic && <NonPublicBanner what="Dział przygotowany w zapleczu — niepubliczny" />}
      <PageHeader title={g.name} lead={g.intro} breadcrumbs={[{ href: "/", label: "ZOO24" }, { href: "/zwierzeta", label: "Zwierzęta" }, { label: g.name }]} />
      <Container className="space-y-12 py-8 sm:py-10">
        {sections.length > 0 && (
          <nav aria-label={`Sekcje działu ${g.name}`}>
            <ul className="flex flex-wrap gap-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-brand no-underline hover:border-brand hover:bg-brand-tint">{s.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {sections.map((s) => (
          <section key={s.id} aria-labelledby={s.id}>
            <h2 id={s.id} className="mb-5 scroll-mt-24 text-2xl font-bold sm:text-3xl">{s.title}</h2>
            <ArticleGrid items={s.items} />
          </section>
        ))}

        {v.publicSpecies.length > 0 && (
          <section aria-labelledby="h-gatunki">
            <h2 id="h-gatunki" className="mb-4 text-2xl font-bold sm:text-3xl">Karty gatunków</h2>
            <ul className="flex flex-wrap gap-2">
              {v.publicSpecies.map((sp) => (
                <li key={sp.slug}>
                  <Link href={`/zwierzeta/${g.slug}/${sp.slug}`} className="inline-flex min-h-11 items-center gap-1 rounded-[var(--radius-md)] border border-line-strong bg-surface px-4 font-semibold text-brand no-underline hover:border-brand hover:bg-brand-tint">
                    {sp.name} <ArrowRight aria-hidden size={16} />
                  </Link>
                </li>
              ))}
            </ul>
            {otherSpecies > 0 && <p className="mt-3 text-sm text-ink-muted">Karty kolejnych gatunków przygotowujemy — publikujemy je po sprawdzeniu źródeł.</p>}
          </section>
        )}

        {v.tools.length > 0 && (
          <section aria-labelledby="h-narzedzia">
            <h2 id="h-narzedzia" className="mb-5 text-2xl font-bold sm:text-3xl">Narzędzia</h2>
            <ToolList tools={v.tools} />
          </section>
        )}

        {services.length > 0 && (
          <section aria-labelledby="h-uslugi">
            <h2 id="h-uslugi" className="mb-2 text-2xl font-bold sm:text-3xl">Usługi w katalogu</h2>
            <p className="mb-4 text-ink-muted">Firmy z podanym źródłem danych. Kontaktujesz się z nimi bezpośrednio.</p>
            <ul className="grid gap-4 md:grid-cols-2">
              {services.map((c) => (
                <li key={c.category} className="rounded-[var(--radius-lg)] border border-line bg-surface p-5">
                  <h3 className="text-lg font-bold"><Link href={`/uslugi/${c.category}`} className="no-underline hover:underline">{CATEGORIES[c.category].plural}</Link></h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {c.cities.map((ci) => (
                      <li key={ci.city}>
                        <Link href={`/uslugi/${c.category}/${ci.city}`} className="inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-line px-3 text-sm font-semibold text-brand no-underline hover:border-brand hover:bg-brand-tint">
                          {CITIES[ci.city].name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        )}

        <KnowledgeSourceNote />
      </Container>
    </>
  );
}
