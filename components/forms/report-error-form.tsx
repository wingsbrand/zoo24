"use client";
import { useActionState } from "react";
import type { FormState } from "@/lib/submissions";
import { Field, Honeypot, Input, Textarea, describedBy } from "@/components/ui";
import { FormFeedback, FormSuccess, IDLE, SubmitButton, errorsOf, useSubmitFocus, valuesOf } from "./shared";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

export function ReportErrorForm({ action, profile, initialUrl }: { action: Action; profile?: { slug: string; name: string } | null; initialUrl?: string }) {
  const [state, formAction] = useActionState(action, IDLE);
  useSubmitFocus(state);
  const e = errorsOf(state);
  const v = valuesOf(state, { pageUrl: initialUrl ?? "" });
  const againHref = profile ? `/zglos-blad?firma=${encodeURIComponent(profile.slug)}` : "/zglos-blad";

  if (state.status === "success") {
    return (
      <FormSuccess code={state.code} title="Dziękujemy za zgłoszenie błędu" againHref={againHref}>
        <li>Sprawdzimy informację w źródle (np. na stronie firmy) i poprawimy dane, jeśli zgłoszenie się potwierdzi.</li>
      </FormSuccess>
    );
  }

  return (
    <form action={formAction} noValidate className="relative space-y-6" aria-describedby="form-required-note">
      <FormFeedback state={state} />
      <p id="form-required-note" className="text-sm text-ink-muted">
        Pola oznaczone <span aria-hidden className="text-accent-dark">*</span> są wymagane.
      </p>

      {profile && (
        <div id="firma" tabIndex={-1} className="rounded-[var(--radius-md)] border border-line bg-brand-tint p-4 text-sm">
          <p className="font-semibold">Dotyczy profilu: <span className="break-words">{profile.name}</span></p>
          {e.firma && <p className="mt-1 font-medium text-danger">{e.firma}</p>}
          <input type="hidden" name="firma" value={profile.slug} />
        </div>
      )}

      <Field id="pageUrl" label="Adres strony z błędem" required={!profile} error={e.pageUrl} hint={profile ? "Opcjonalnie, jeśli błąd dotyczy innej podstrony." : "Skopiuj adres z paska przeglądarki, np. https://zoo24.pl/uslugi/groomer/warszawa"}>
        <Input id="pageUrl" name="pageUrl" type="text" inputMode="url" autoComplete="off" spellCheck={false} autoCapitalize="none" maxLength={300} defaultValue={v.pageUrl ?? ""} aria-required={!profile} aria-invalid={!!e.pageUrl} aria-describedby={describedBy("pageUrl", true, e.pageUrl)} />
      </Field>

      <Field id="description" label="Co jest nieprawidłowe?" required error={e.description} hint="Np. nieaktualny telefon, firma zamknięta, błędny zakres usług (10–2000 znaków). Nie wpisuj danych osobowych, adresów ani numerów zamówień.">
        <Textarea id="description" name="description" rows={6} maxLength={2000} defaultValue={v.description ?? ""} required aria-required aria-invalid={!!e.description} aria-describedby={describedBy("description", true, e.description)} />
      </Field>

      <Field id="email" label="Twój e-mail" error={e.email} hint="Tylko jeśli chcesz, abyśmy mogli dopytać o szczegóły. Nie publikujemy go.">
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false} autoCapitalize="none" maxLength={254} defaultValue={v.email ?? ""} aria-invalid={!!e.email} aria-describedby={describedBy("email", true, e.email)} />
      </Field>

      <Honeypot />
      <SubmitButton>Wyślij zgłoszenie błędu</SubmitButton>
    </form>
  );
}
