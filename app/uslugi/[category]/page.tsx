import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStore } from "@/lib/store/file-store";
import { buildPageRegistry } from "@/lib/seo";
import { CATEGORIES, isCategory } from "@/lib/site";
import { Container, PageHeader } from "@/components/ui";
import { CATEGORY_IMAGES } from "@/lib/content/images";
import { ServiceSearch } from "@/components/directory/search-form";
import { CategoryCard, CityCards } from "@/components/directory/category-tiles";
import { CATEGORY_DESCRIPTIONS } from "@/lib/directory/search";
import { listingCounts, PILOT_CATEGORIES } from "@/lib/directory/stats";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return {};
  return {
    title: CATEGORIES[category].plural,
    description: `${CATEGORIES[category].plural} w największych miastach Polski. ${CATEGORY_DESCRIPTIONS[category]}`,
    alternates: { canonical: `/uslugi/${category}` },
    // N5: kategoria bez żadnej opublikowanej realnej firmy — noindex (spójnie z rejestrem stron i sitemap).
    robots: buildPageRegistry(getStore().read()).get(`/uslugi/${category}`)?.indexable ? undefined : { index: false, follow: true },
  };
}

export default async function CategoryPage({ params }: P) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  const c = CATEGORIES[category];
  const counts = listingCounts(getStore().read().businesses);
  const others = PILOT_CATEGORIES.filter((x) => x !== category);
  return (
    <>
      <PageHeader
        title={c.plural}
        lead={CATEGORY_DESCRIPTIONS[category]}
        image={CATEGORY_IMAGES[category]}
        breadcrumbs={[{ href: "/", label: "ZOO24" }, { href: "/uslugi", label: "Usługi" }, { label: c.plural }]}
      >
        <div className="mt-6">
          <ServiceSearch variant="compact" defaultCategory={category} />
        </div>
      </PageHeader>
      <Container className="space-y-10 py-8 sm:py-10">
        <section aria-labelledby="miasta">
          <h2 id="miasta" className="text-2xl font-bold">Wybierz miasto</h2>
          <CityCards category={category} counts={counts} />
          <p className="mt-3 text-sm text-ink-muted">
            Nie ma Twojego miasta? Na razie działamy w 10 największych miastach. <Link href="/dodaj-firme" className="text-brand underline">Zgłoś firmę</Link> — zgłoszenia z innych miast pomagają nam zdecydować o rozszerzeniu katalogu.
          </p>
        </section>
        {others.length > 0 && (
          <section aria-labelledby="inne">
            <h2 id="inne" className="mb-4 text-2xl font-bold">Inne usługi</h2>
            <ul className="grid gap-5 md:grid-cols-2">
              {others.map((o) => <CategoryCard key={o} category={o} counts={counts} headingLevel={3} />)}
            </ul>
          </section>
        )}
      </Container>
    </>
  );
}
