"use client";
// Wspólne elementy formularzy publicznych (klient). Importujemy z lib/submissions WYŁĄCZNIE typy —
// moduł korzysta z node:crypto i nie może trafić do paczki przeglądarki.
import { useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CircleCheck, Loader2, Send } from "lucide-react";
import type { FormState } from "@/lib/submissions";
import { Alert, ButtonLink, ErrorSummary, buttonClasses } from "@/components/ui";

export type Option = { value: string; label: string };
export const IDLE: FormState = { status: "idle" };

export function errorsOf(state: FormState): Record<string, string> {
  return state.status === "error" ? state.errors : {};
}
export function valuesOf(state: FormState, defaults: Record<string, string> = {}): Record<string, string> {
  return state.status === "error" ? state.values : defaults;
}

/** Fokus po wysłaniu: podsumowanie błędów, komunikat ogólny albo potwierdzenie sukcesu. */
export function useSubmitFocus(state: FormState) {
  useEffect(() => {
    if (state.status === "idle") return;
    const id = state.status === "success" ? "form-success" : Object.keys(state.errors).length ? "error-summary" : "form-message";
    const el = document.getElementById(id);
    if (el) {
      el.focus();
      el.scrollIntoView({ block: "start", behavior: "auto" });
    }
  }, [state]);
}

/** true po hydratacji — do progresywnego ulepszania (bez JS wszystko jest widoczne). */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function FormFeedback({ state }: { state: FormState }) {
  if (state.status !== "error") return null;
  return (
    <>
      <ErrorSummary errors={state.errors} />
      {state.message && (
        <div id="form-message" tabIndex={-1} role="alert" className="focus:outline-none">
          <Alert tone="danger" title="Nie wysłano formularza">{state.message}</Alert>
        </div>
      )}
    </>
  );
}

export function SubmitButton({ children = "Wyślij zgłoszenie" }: { children?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" aria-disabled={pending} disabled={pending} className={buttonClasses("accent", "lg", "w-full sm:w-auto")}>
      {pending ? <Loader2 aria-hidden size={18} className="animate-spin motion-reduce:animate-none" /> : <Send aria-hidden size={18} />}
      {pending ? "Wysyłanie…" : children}
      <span className="sr-only" aria-live="polite">{pending ? "Trwa wysyłanie formularza" : ""}</span>
    </button>
  );
}

/** Błąd pola, które nie jest opakowane w <Field> (checkbox, grupa radio). */
export function InlineError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="mt-1 text-sm font-medium text-danger">
      <span aria-hidden>! </span>
      {error}
    </p>
  );
}

export function FormSuccess({ code, title, children, againHref }: { code: string; title: string; children?: ReactNode; againHref: string }) {
  return (
    <div id="form-success" tabIndex={-1} role="status" className="space-y-5 rounded-[var(--radius-lg)] border border-ok/30 bg-ok-soft p-5 focus:outline-none sm:p-7">
      <div className="flex items-start gap-3">
        <CircleCheck aria-hidden className="mt-1 shrink-0 text-ok" size={28} />
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="mt-2">
            Twój kod zgłoszenia: <strong className="break-all font-mono text-xl tracking-wider">{code}</strong>
          </p>
          <p className="text-sm text-ink-muted">Zapisz go — tylko na jego podstawie sprawdzisz status. Kod nie zawiera Twoich danych.</p>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Co dalej?</h3>
        <ul className="list-disc space-y-1 pl-5 text-[0.95rem]">
          <li>Zgłoszenie trafiło do kolejki moderacji. Każde zgłoszenie sprawdza człowiek — nic nie jest publikowane automatycznie.</li>
          {children}
          <li>
            <strong>Nie wysyłamy automatycznych e-maili.</strong> To lokalny prototyp — potwierdzenia ani powiadomienia nie przyjdą na skrzynkę. Status sprawdzisz kodem.
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <ButtonLink href={`/status-zgloszenia?kod=${encodeURIComponent(code)}`} variant="primary">Sprawdź status zgłoszenia</ButtonLink>
        <a href={againHref} className={buttonClasses("secondary")}>Wyślij kolejne zgłoszenie</a>
      </div>
    </div>
  );
}
