import type { Metadata } from "next";
import { BookOpen, Wrench } from "lucide-react";
import { ButtonLink, Container, PageHeader } from "@/components/ui";
import { GroupCard, KnowledgeSourceNote } from "@/components/portal/portal-blocks";
import { portalVisibility } from "@/lib/portal/queries";
import { GROUPS } from "@/lib/taxonomy/animals";

export const dynamic = "force-dynamic";

const LEAD = "Wiedza uporządkowana według zwierząt: przygotowanie domu, codzienna opieka, warunki i organizacja opieki. Pokazujemy tylko działy z opublikowanymi materiałami.";

export async function generateMetadata(): Promise<Metadata> {
  const v = portalVisibility();
  return {
    title: "Zwierzęta — atlas wiedzy dla opiekunów",
    description: LEAD,
    alternates: { canonical: "/zwierzeta" },
    // Atlas bez żadnego publicznego działu nie jest indeksowany (zgodnie z lib/seo/page-registry.ts).
    robots: v.publicGroups.length === 0 ? { index: false, follow: true } : undefined,
  };
}

export default function Zwierzeta() {
  const v = portalVisibility();
  const pending = GROUPS.length - v.publicGroups.length;
  return (
    <>
      <PageHeader title="Zwierzęta" lead={LEAD} breadcrumbs={[{ href: "/", label: "ZOO24" }, { label: "Zwierzęta" }]} />
      <Container className="space-y-10 py-8 sm:py-10">
        <section aria-labelledby="h-dzialy">
          <h2 id="h-dzialy" className="mb-5 text-2xl font-bold sm:text-3xl">Działy z opublikowaną wiedzą</h2>
          {v.publicGroups.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {v.publicGroups.map((g) => <li key={g.group.slug}><GroupCard v={g} /></li>)}
            </ul>
          ) : (
            <p className="rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-surface p-6 text-ink-muted">
              Pierwsze działy są w redakcji. Publikujemy je dopiero wtedy, gdy mają sprawdzone materiały ze źródłami — nie chcemy pokazywać pustych stron z zapowiedziami.
            </p>
          )}
          {pending > 0 && v.publicGroups.length > 0 && (
            <p className="mt-5 text-ink-muted">Pozostałe działy przygotowujemy — pojawią się tutaj, gdy będą miały opublikowane, sprawdzone materiały.</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/poradniki" variant="secondary" icon={<BookOpen aria-hidden size={18} />}>Wszystkie poradniki</ButtonLink>
            <ButtonLink href="/narzedzia" variant="secondary" icon={<Wrench aria-hidden size={18} />}>Narzędzia dla opiekunów</ButtonLink>
          </div>
        </section>
        <KnowledgeSourceNote />
      </Container>
    </>
  );
}
