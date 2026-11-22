import Link from "next/link";
import { Inbox } from "lucide-react";
import { getStore } from "@/lib/store/file-store";
import { CONTACT_TOPICS, KIND_LABELS, ROLE_OPTIONS, STATUS_LABELS } from "@/lib/submissions";
import { CATEGORIES, CITIES } from "@/lib/site";
import { formatWarsaw } from "@/lib/time";
import { Alert, Badge, Breadcrumbs, Card, EmptyState } from "@/components/ui";
import { DecisionForm } from "./decision-form";

export const dynamic = "force-dynamic";

const FIELD_LABELS: Record<string, string> = {
  businessName: "Nazwa firmy", name: "Nazwa firmy", category: "Kategoria", city: "Miasto", cityOther: "Inne miasto", website: "Strona www", phone: "Telefon firmy",
  email: "E-mail do weryfikacji", role: "Rola zgłaszającego", services: "Usługi", firma: "Profil (przejęcie/aktualizacja)", target: "Dotyczy", description: "Opis",
  topic: "Temat", message: "Wiadomość", consent: "Zgoda", url: "Adres strony",
  companyName: "Nazwa firmy", acceptTerms: "Akceptacja regulaminu", acceptPrivacy: "Informacja o prywatności", mode: "Rodzaj zgłoszenia",
  businessSlug: "Profil (przejęcie/aktualizacja)", page: "Dotyczy strony",
};

function label(k: string) { return FIELD_LABELS[k] ?? k; }
function value(k: string, v: string) {
  if (k === "category") return CATEGORIES[v as keyof typeof CATEGORIES]?.name ?? v;
  if (k === "city") return CITIES[v as keyof typeof CITIES]?.name ?? v;
  if (k === "role") return ROLE_OPTIONS[v as keyof typeof ROLE_OPTIONS] ?? v;
  if (k === "topic") return CONTACT_TOPICS[v as keyof typeof CONTACT_TOPICS] ?? v;
  if (k === "mode") return v === "new" ? "nowa firma" : (v === "claim" || v === "update") ? "przejęcie / aktualizacja profilu" : v;
  if (v === "yes") return "tak";
  return v;
}

export default async function Moderacja({ searchParams }: { searchParams: Promise<{ widok?: string }> }) {
  const { widok } = await searchParams;
  const all = [...(getStore().read().submissions ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const showDone = widok === "rozpatrzone";
  const list = all.filter((x) => (showDone ? x.status !== "pending" : x.status === "pending"));
  const pendingCount = all.filter((x) => x.status === "pending").length;
  // Potwierdzenie ostatniej decyzji (karta znika z listy oczekujących, więc komunikat jest na poziomie strony).
  const lastDecision = [...getStore().read().audit].reverse().find((a) => a.action === "submission_approved" || a.action === "submission_rejected");
  const recent = lastDecision && Date.now() - new Date(lastDecision.at).getTime() < 120_000 ? lastDecision : null;

  return (
    <div className="space-y-5">
      <Breadcrumbs items={[{ href: "/admin", label: "Przegląd" }, { label: "Moderacja" }]} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold">Moderacja zgłoszeń</h1>
        <nav aria-label="Filtr zgłoszeń" className="flex gap-1 rounded-[var(--radius-md)] bg-canvas p-1 text-sm">
          <Link href="/admin/moderacja" aria-current={!showDone ? "page" : undefined} className={`flex min-h-10 items-center rounded-[var(--radius-sm)] px-3 font-semibold no-underline ${!showDone ? "bg-surface shadow-[var(--shadow-card)]" : "text-ink-muted"}`}>Oczekujące ({pendingCount})</Link>
          <Link href="/admin/moderacja?widok=rozpatrzone" aria-current={showDone ? "page" : undefined} className={`flex min-h-10 items-center rounded-[var(--radius-sm)] px-3 font-semibold no-underline ${showDone ? "bg-surface shadow-[var(--shadow-card)]" : "text-ink-muted"}`}>Rozpatrzone ({all.length - pendingCount})</Link>
        </nav>
      </div>
      {recent && (
        <Alert live tone="ok" title={recent.action === "submission_approved" ? "Zgłoszenie zaakceptowane" : "Zgłoszenie odrzucone"}>
          {recent.entityId} · {formatWarsaw(recent.at)}. Status jest już widoczny dla zgłaszającego na stronie <Link href={`/status-zgloszenia?kod=${recent.entityId}`}>statusu zgłoszenia</Link>. <Link href="/admin/moderacja?widok=rozpatrzone">Zobacz rozpatrzone</Link>.
        </Alert>
      )}
      <Alert tone="info">Zaakceptowanie zgłoszenia firmy <strong>nie publikuje profilu automatycznie</strong> — w F1 profil dodaje się ręcznie po sprawdzeniu, czy zgłaszający reprezentuje firmę. E-mail zgłaszającego służy tylko do weryfikacji; nie jest publikowany.</Alert>

      {list.length === 0 ? (
        <EmptyState icon={<Inbox aria-hidden />} title={showDone ? "Brak rozpatrzonych zgłoszeń" : "Brak zgłoszeń do moderacji"}>
          {showDone ? "Tu pojawią się zgłoszenia po decyzji." : "Nowe zgłoszenia z formularzy „Dodaj firmę”, „Zgłoś błąd” i „Kontakt” pojawią się tutaj."}
        </EmptyState>
      ) : (
        <ul className="space-y-4">
          {list.map((sub) => (
            <Card as="li" key={sub.code} className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold">{sub.code}</span>
                <Badge tone="brand">{KIND_LABELS[sub.kind]}</Badge>
                <Badge tone={sub.status === "pending" ? "warn" : sub.status === "approved" ? "ok" : "danger"}>{STATUS_LABELS[sub.status]}</Badge>
                <span className="text-xs text-ink-muted">wpłynęło {formatWarsaw(sub.createdAt)}{sub.processedAt ? ` · rozpatrzone ${formatWarsaw(sub.processedAt)}` : ""}</span>
              </div>
              <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[12rem_1fr]">
                {Object.entries(sub.payload).filter(([k]) => k !== "consent").map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-ink-muted">{label(k)}</dt>
                    <dd className="break-words">{value(k, v)}</dd>
                  </div>
                ))}
              </dl>
              {sub.reason && <p className="mt-2 text-sm"><span className="text-ink-muted">Powód decyzji:</span> {sub.reason}</p>}
              {sub.status === "pending" && <div className="mt-4 border-t border-line pt-4"><DecisionForm code={sub.code} /></div>}
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
