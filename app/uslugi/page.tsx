import type { Metadata } from "next";
import { getStore } from "@/lib/store/file-store";
import { Container, PageHeader } from "@/components/ui";
import { ServiceSearch } from "@/components/directory/search-form";
import { CategoryCard } from "@/components/directory/category-tiles";
import { listingCounts, PILOT_CATEGORIES } from "@/lib/directory/stats";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Usługi dla zwierząt",
  description: "Groomerzy i hotele dla psów i kotów w największych miastach Polski. Zakres usług, obszar działania i źródło danych — bez ocen i płatnych pozycji.",
  alternates: { canonical: "/uslugi" },
};

export default function Uslugi() {
  const counts = listingCounts(getStore().read().businesses);
  const anyDemo = PILOT_CATEGORIES.some((c) => Object.values(counts[c]).some((n) => n.demo > 0));
  return (
    <>
      <PageHeader
        title="Usługi dla zwierząt"
        lead="Wybierz rodzaj usługi i miasto. Kontaktujesz się bezpośrednio z firmą — bez pośredników i płatnych pozycji."
        breadcrumbs={[{ href: "/", label: "ZOO24" }, { label: "Usługi" }]}
      >
        <div className="mt-6">
          <ServiceSearch variant="compact" />
        </div>
      </PageHeader>
      <Container className="py-8 sm:py-10">
        <ul className="grid gap-5 md:grid-cols-2">
          {PILOT_CATEGORIES.map((c) => <CategoryCard key={c} category={c} counts={counts} />)}
        </ul>
        {anyDemo && <p className="mt-4 text-sm text-ink-muted">Liczby obejmują fikcyjne profile oznaczone DEMO (prototyp).</p>}
      </Container>
    </>
  );
}
