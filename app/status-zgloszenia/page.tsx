import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Clock, SearchX, XCircle } from "lucide-react";
import { getStore } from "@/lib/store/file-store";
import { IS_PRODUCTION } from "@/lib/site";
import { findSubmission, normalizeCode, publicStatus, type PublicSubmissionStatus } from "@/lib/submissions";
import { Badge, Button, ButtonLink, Card, Field, Input, describedBy } from "@/components/ui";
import { InfoPage } from "@/components/forms/info-page";

export const metadata: Metadata = {
  title: "Status zgłoszenia",
  alternates: { canonical: "/status-zgloszenia" },
  robots: { index: false, follow: IS_PRODUCTION },
};

type P = { searchParams: Promise<{ kod?: string | string[] }> };

const fmt = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Warsaw" }).format(new Date(iso));

const NEXT_STEP: Record<PublicSubmissionStatus["status"], Record<PublicSubmissionStatus["kind"], string>> = {
  pending: {
    add_business: "Moderator sprawdzi dane i to, czy reprezentujesz firmę. Do tego czasu nic nie jest publikowane.",
    report_error: "Sprawdzimy zgłoszoną informację w źródle.",
    contact: "Wiadomość czeka na odpowiedź człowieka.",
  },
  approved: {
    add_business: "Zgłoszenie zaakceptowano. Dane w katalogu wprowadza moderator — mogą pojawić się z opóźnieniem.",
    report_error: "Zgłoszenie potwierdzone. Poprawkę wprowadza redakcja.",
    contact: "Wiadomość została rozpatrzona.",
  },
  rejected: {
    add_business: "Możesz wysłać nowe zgłoszenie z uzupełnionymi danymi.",
    report_error: "Jeśli masz dodatkowe informacje, wyślij nowe zgłoszenie.",
    contact: "Jeśli sprawa jest nadal aktualna, napisz ponownie.",
  },
};

function StatusBadge({ s }: { s: PublicSubmissionStatus }) {
  if (s.status === "approved") return <Badge tone="ok" icon={<CircleCheck aria-hidden size={14} />}>{s.statusLabel}</Badge>;
  if (s.status === "rejected") return <Badge tone="danger" icon={<XCircle aria-hidden size={14} />}>{s.statusLabel}</Badge>;
  return <Badge tone="warn" icon={<Clock aria-hidden size={14} />}>{s.statusLabel}</Badge>;
}

export default async function StatusPage({ searchParams }: P) {
  const sp = await searchParams;
  const raw = typeof sp.kod === "string" ? sp.kod.slice(0, 40) : "";
  const code = raw ? normalizeCode(raw) : null;
  const formatError = raw && !code ? "Kod ma postać ZG- i 6 znaków, np. ZG-7K3P9Q. Sprawdź, czy nie brakuje znaku." : null;
  const sub = code ? findSubmission(getStore().read(), code) : null;
  const status = sub ? publicStatus(sub) : null;
  const again = status?.kind === "contact" ? "/kontakt" : status?.kind === "report_error" ? "/zglos-blad" : "/dodaj-firme";

  return (
    <InfoPage prose={false} title="Status zgłoszenia" lead="Wpisz kod otrzymany po wysłaniu formularza. Status nie zawiera żadnych danych osobowych.">
      <div className="space-y-8">
        <form method="get" action="/status-zgloszenia" className="space-y-4" role="search" aria-label="Sprawdź status zgłoszenia">
          <Field id="kod" label="Kod zgłoszenia" required error={formatError} hint="Wielkość liter i myślnik nie mają znaczenia.">
            <Input id="kod" name="kod" defaultValue={raw} placeholder="ZG-XXXXXX" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={40} required aria-required aria-invalid={!!formatError} aria-describedby={describedBy("kod", true, formatError)} className="max-w-xs font-mono uppercase tracking-wider" />
          </Field>
          <Button type="submit" variant="primary">Sprawdź status</Button>
        </form>

        {code && !status && (
          <Card className="p-6" as="section">
            <div role="status" className="flex items-start gap-3">
              <SearchX aria-hidden size={24} className="mt-0.5 shrink-0 text-ink-muted" />
              <div>
                <h2 className="text-xl font-bold">Nie znaleziono zgłoszenia {code}</h2>
                <p className="mt-2 text-ink-muted">Sprawdź, czy kod jest przepisany poprawnie. W prototypie zgłoszenia są zapisywane tylko lokalnie — po wyczyszczeniu danych demonstracyjnych kod przestaje działać.</p>
                <p className="mt-3"><Link href="/kontakt" className="text-brand underline">Napisz do nas</Link>, jeśli problem się powtarza.</p>
              </div>
            </div>
          </Card>
        )}

        {status && (
          <Card className="p-6" as="section">
            <div role="status" className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold">
                  <span className="sr-only">Zgłoszenie </span>
                  <span className="font-mono tracking-wider">{status.code}</span>
                </h2>
                <StatusBadge s={status} />
              </div>
              <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
                <dt className="font-semibold">Rodzaj</dt>
                <dd>{status.kindLabel}</dd>
                <dt className="font-semibold">Wysłano</dt>
                <dd>{fmt(status.createdAt)}</dd>
                <dt className="font-semibold">Rozpatrzono</dt>
                <dd>{status.processedAt ? fmt(status.processedAt) : "jeszcze nie"}</dd>
                {status.reason && (
                  <>
                    <dt className="font-semibold">{status.status === "rejected" ? "Powód odrzucenia" : "Uwagi moderatora"}</dt>
                    <dd className="whitespace-pre-line break-words">{status.reason}</dd>
                  </>
                )}
              </dl>
              <p className="rounded-[var(--radius-md)] bg-canvas p-3 text-sm">{NEXT_STEP[status.status][status.kind]}</p>
              <p className="text-sm text-ink-muted">Moderacja jest ręczna. W prototypie nie wysyłamy powiadomień e-mail — wróć tu, aby sprawdzić zmiany.</p>
              {status.status === "rejected" && <ButtonLink href={again} variant="secondary">Wyślij nowe zgłoszenie</ButtonLink>}
            </div>
          </Card>
        )}
      </div>
    </InfoPage>
  );
}
