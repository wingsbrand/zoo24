import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, PlugZap, TriangleAlert } from "lucide-react";
import { cn } from "./cn";

type AlertTone = "info" | "ok" | "warn" | "danger" | "unavailable";

const styles: Record<AlertTone, { box: string; icon: ReactNode; role?: "status" | "alert" }> = {
  info: { box: "bg-info-soft text-ink border-brand/20", icon: <Info aria-hidden className="text-info" size={20} />, role: "status" },
  ok: { box: "bg-ok-soft text-ink border-ok/25", icon: <CircleCheck aria-hidden className="text-ok" size={20} />, role: "status" },
  warn: { box: "bg-warn-soft text-ink border-warn/25", icon: <TriangleAlert aria-hidden className="text-warn" size={20} />, role: "status" },
  danger: { box: "bg-danger-soft text-ink border-danger/25", icon: <CircleAlert aria-hidden className="text-danger" size={20} />, role: "alert" },
  unavailable: { box: "bg-canvas text-ink border-line-strong border-dashed", icon: <PlugZap aria-hidden className="text-ink-muted" size={20} />, role: "status" },
};

/** Komunikat. tone="unavailable" = integracja/funkcja niedostępna (np. brak połączenia ze źródłem). */
export function Alert({ tone = "info", title, children, className, live = false }: { tone?: AlertTone; title?: ReactNode; children?: ReactNode; className?: string; live?: boolean }) {
  const s = styles[tone];
  return (
    <div role={live ? s.role : undefined} className={cn("flex gap-3 rounded-[var(--radius-md)] border p-4 text-sm", s.box, className)}>
      <span className="mt-0.5 shrink-0">{s.icon}</span>
      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-ink-muted [&_a]:text-brand [&_a]:underline">{children}</div>}
      </div>
    </div>
  );
}

/** Pusty stan z pomocą: co się stało i co można zrobić dalej. */
export function EmptyState({ icon, title, children, actions, headingLevel = 2 }: { icon?: ReactNode; title: ReactNode; children?: ReactNode; actions?: ReactNode; headingLevel?: 2 | 3 }) {
  const H = headingLevel === 3 ? "h3" : "h2";
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-line-strong bg-surface px-6 py-10 text-center">
      {icon && <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">{icon}</div>}
      <H className="text-xl font-bold">{title}</H>
      {children && <div className="mx-auto mt-2 max-w-md text-ink-muted">{children}</div>}
      {actions && <div className="mt-5 flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}

/** Szkielet ładowania (rezerwuje miejsce — bez przesunięć układu). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-[var(--radius-sm)] bg-line/70", className)} />;
}

export function LoadingRegion({ label = "Ładowanie…", children }: { label?: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
