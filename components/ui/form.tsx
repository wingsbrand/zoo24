import type { ComponentProps, ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "./cn";

const control =
  "w-full min-h-11 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 py-2 text-base text-ink placeholder:text-ink-muted " +
  "transition-colors hover:border-brand focus:border-brand focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-muted aria-[invalid=true]:border-danger aria-[invalid=true]:bg-danger-soft/40";

/** Pole formularza: etykieta, podpowiedź i błąd powiązane przez id (aria-describedby). */
export function Field({ id, label, hint, error, required, children, className }: { id: string; label: ReactNode; hint?: ReactNode; error?: string | null; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block font-semibold text-ink">
        {label} {required ? <span className="text-accent-dark" aria-hidden>*</span> : <span className="text-sm font-normal text-ink-muted">(opcjonalnie)</span>}
      </label>
      {hint && <p id={`${id}-hint`} className="text-sm text-ink-muted">{hint}</p>}
      {children}
      {error && (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert aria-hidden size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}

export function describedBy(id: string, hint?: unknown, error?: unknown) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

export function Input({ className, ...p }: ComponentProps<"input">) {
  return <input className={cn(control, className)} {...p} />;
}

export function Textarea({ className, ...p }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-32 leading-relaxed", className)} {...p} />;
}

export function Select({ className, children, ...p }: ComponentProps<"select">) {
  return (
    <select className={cn(control, "appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22none%22%20stroke%3D%22%230e4f5c%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M4%206l4%204%204-4%22/%3E%3C/svg%3E')] bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-9", className)} {...p}>
      {children}
    </select>
  );
}

export function Checkbox({ id, label, className, ...p }: ComponentProps<"input"> & { id: string; label: ReactNode }) {
  return (
    <label htmlFor={id} className={cn("flex min-h-11 cursor-pointer items-start gap-3 py-1.5", className)}>
      <input id={id} type="checkbox" className="mt-1 size-5 shrink-0 accent-[var(--color-brand)]" {...p} />
      <span className="text-[0.95rem] leading-snug">{label}</span>
    </label>
  );
}

/** Polska odmiana: 1 pole, 2–4 pola (poza 12–14), 5+ pól. */
export function plPola(n: number): string {
  if (n === 1) return "1 pole";
  const d = n % 10, h = n % 100;
  return `${n} ${d >= 2 && d <= 4 && (h < 12 || h > 14) ? "pola" : "pól"}`;
}

/** Podsumowanie błędów na górze formularza (fokus po nieudanym wysłaniu). */
export function ErrorSummary({ errors, id = "error-summary" }: { errors: Record<string, string>; id?: string }) {
  const entries = Object.entries(errors);
  if (!entries.length) return null;
  return (
    <div id={id} role="alert" tabIndex={-1} className="rounded-[var(--radius-md)] border border-danger/30 bg-danger-soft p-4">
      <p className="font-semibold text-danger">Popraw {plPola(entries.length)}, aby wysłać formularz:</p>
      <ul className="mt-2 list-disc pl-5 text-sm">
        {entries.map(([field, msg]) => <li key={field}><a href={`#${field}`} className="text-danger underline">{msg}</a></li>)}
      </ul>
    </div>
  );
}

/** Pułapka na boty — pole ukryte dla ludzi i czytników ekranu. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute left-[-10000px] top-auto size-px overflow-hidden">
      <label htmlFor="website_hp">Nie wypełniaj tego pola</label>
      <input id="website_hp" name="website_hp" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
