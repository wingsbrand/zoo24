// Szablon stron informacyjnych i formularzy (serwerowy): PageHeader + kolumna treści.
import type { ReactNode } from "react";
import { Alert, Container, PageHeader } from "@/components/ui";

export function InfoPage({ title, lead, crumb, updated, draft, children, aside, prose = true }: {
  title: string;
  /** false = bez typografii artykułowej (formularze). */
  prose?: boolean;
  lead?: ReactNode;
  crumb?: string;
  updated?: string;
  /** Szkic dokumentu prawnego — wyraźne ostrzeżenie. */
  draft?: boolean;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <>
      <PageHeader title={title} lead={lead} breadcrumbs={[{ href: "/", label: "ZOO24" }, { label: crumb ?? title }]}
        meta={updated ? <p className="text-sm text-ink-muted">Ostatnia aktualizacja: {updated}</p> : undefined} />
      <Container className="py-10 sm:py-12">
        <div className={aside ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]" : undefined}>
          <div className="min-w-0">
            {draft && (
              <Alert tone="warn" title="SZKIC — dokument do uzupełnienia przez prawnika" className="mb-8 max-w-[var(--container-prose)]">
                Ten tekst jest roboczą strukturą przygotowaną w prototypie. Nie jest obowiązującym dokumentem ani poradą prawną. Fragmenty w nawiasach kwadratowych wymagają uzupełnienia i akceptacji prawnika przed uruchomieniem serwisu.
              </Alert>
            )}
            {prose ? (
              <div className="prose-zoo break-words [&_li]:mb-1.5 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-6">{children}</div>
            ) : (
              <div className="max-w-2xl break-words">{children}</div>
            )}
          </div>
          {aside && <aside className="space-y-4 lg:pt-1">{aside}</aside>}
        </div>
      </Container>
    </>
  );
}

/** Wyróżniony placeholder do uzupełnienia (widoczny, nie tylko kolorem). */
export function Todo({ children }: { children: ReactNode }) {
  return <mark className="rounded bg-warn-soft px-1 font-medium text-ink">[{children}]</mark>;
}
