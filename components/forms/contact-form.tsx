"use client";
import { useActionState, useState } from "react";
import type { FormState } from "@/lib/submissions";
import { Alert, Field, Honeypot, Input, Select, Textarea, describedBy } from "@/components/ui";
import { FormFeedback, FormSuccess, IDLE, SubmitButton, errorsOf, useSubmitFocus, valuesOf, type Option } from "./shared";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

export function ContactForm({ action, topics, initialTopic }: { action: Action; topics: Option[]; initialTopic?: string }) {
  const [state, formAction] = useActionState(action, IDLE);
  useSubmitFocus(state);
  const e = errorsOf(state);
  const v = valuesOf(state, { topic: initialTopic ?? "" });
  const [topic, setTopic] = useState(v.topic ?? "");

  if (state.status === "success") {
    return (
      <FormSuccess code={state.code} title="Dziękujemy za wiadomość" againHref="/kontakt">
        <li>Odpowiedź przygotuje człowiek — odpowiadamy indywidualnie, bez automatycznych wiadomości.</li>
      </FormSuccess>
    );
  }

  return (
    <form action={formAction} noValidate className="relative space-y-6" aria-describedby="form-required-note">
      <FormFeedback state={state} />
      <p id="form-required-note" className="text-sm text-ink-muted">
        Wszystkie pola są wymagane. Nie podawaj adresu zamieszkania, numerów zamówień ani danych innych osób.
      </p>

      <Field id="topic" label="Temat" required error={e.topic}>
        <Select id="topic" name="topic" defaultValue={v.topic ?? ""} onChange={(ev) => setTopic(ev.target.value)} required aria-required aria-invalid={!!e.topic} aria-describedby={describedBy("topic", false, e.topic)}>
          <option value="">Wybierz…</option>
          {topics.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
      </Field>

      <Field id="message" label="Wiadomość" required error={e.message} hint="10–2000 znaków.">
        <Textarea id="message" name="message" rows={7} maxLength={2000} defaultValue={v.message ?? ""} required aria-required aria-invalid={!!e.message} aria-describedby={describedBy("message", true, e.message)} />
      </Field>

      <Field id="email" label="Twój e-mail" required error={e.email} hint="Wyłącznie do odpowiedzi na tę wiadomość. Nie zapisujemy go na żadną listę mailingową.">
        <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false} autoCapitalize="none" maxLength={254} defaultValue={v.email ?? ""} required aria-required aria-invalid={!!e.email} aria-describedby={describedBy("email", true, e.email)} />
      </Field>

      <Honeypot />
      <SubmitButton>Wyślij wiadomość</SubmitButton>
    </form>
  );
}
