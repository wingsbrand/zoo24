import type { ReactNode } from "react";
import { BadgeCheck, CircleAlert, CircleCheck, CircleDashed, Clock, FlaskConical, Info, Megaphone, XCircle } from "lucide-react";
import { cn } from "./cn";

export type Tone = "neutral" | "brand" | "ok" | "warn" | "danger" | "info" | "demo" | "sponsored";

const tones: Record<Tone, string> = {
  neutral: "bg-canvas text-ink-muted border-line",
  brand: "bg-brand-soft text-brand-dark border-transparent",
  ok: "bg-ok-soft text-ok border-transparent",
  warn: "bg-warn-soft text-warn border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
  info: "bg-info-soft text-info border-transparent",
  demo: "bg-demo-soft text-demo border-transparent",
  sponsored: "bg-accent-soft text-accent-dark border-transparent",
};

const icons: Partial<Record<Tone, ReactNode>> = {
  ok: <CircleCheck aria-hidden size={14} />,
  warn: <CircleAlert aria-hidden size={14} />,
  danger: <XCircle aria-hidden size={14} />,
  info: <Info aria-hidden size={14} />,
  demo: <FlaskConical aria-hidden size={14} />,
  sponsored: <Megaphone aria-hidden size={14} />,
};

/** Etykieta statusu. Zawsze z tekstem (informacja nie tylko kolorem). */
export function Badge({ tone = "neutral", icon, children, className }: { tone?: Tone; icon?: ReactNode | false; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex max-w-full items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>
      {icon === false ? null : icon ?? icons[tone]}
      {children}
    </span>
  );
}

export function DemoBadge({ show = true }: { show?: boolean }) {
  if (!show) return null;
  return <Badge tone="demo">DEMO</Badge>;
}

/** Sprawdzenie DANYCH firmy (źródło + data) — to nie jest ocena jakości usług. */
export function DataCheckedBadge({ checkedAt }: { checkedAt: string | null }) {
  return checkedAt ? (
    <Badge tone="ok" icon={<BadgeCheck aria-hidden size={14} />}>Dane sprawdzone {new Date(checkedAt).toLocaleDateString("pl-PL")}</Badge>
  ) : (
    <Badge tone="neutral" icon={<CircleDashed aria-hidden size={14} />}>Dane niepotwierdzone</Badge>
  );
}

/** Płatne wyróżnienie — P1. Etykieta musi być jednoznaczna. */
export function SponsoredBadge() {
  return <Badge tone="sponsored">Reklama · wyróżnienie płatne</Badge>;
}

export function PendingBadge({ children = "Oczekuje na weryfikację" }: { children?: ReactNode }) {
  return <Badge tone="warn" icon={<Clock aria-hidden size={14} />}>{children}</Badge>;
}
