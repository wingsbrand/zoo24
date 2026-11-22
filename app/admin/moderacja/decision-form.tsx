"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, Button, Field, Textarea } from "@/components/ui";
import { moderateAction, type ModerationResult } from "../actions";

function Submit({ decision, children }: { decision: "approved" | "rejected"; children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" name="decision" value={decision} size="sm" variant={decision === "approved" ? "primary" : "secondary"} disabled={pending}>
      {pending ? "Zapisywanie…" : children}
    </Button>
  );
}

/** Decyzja moderatora z czytelnym potwierdzeniem wyniku (z serwera, nie optymistycznie). */
export function DecisionForm({ code }: { code: string }) {
  const [state, action] = useActionState<ModerationResult, FormData>(moderateAction, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="code" value={code} />
      <Field id={`reason-${code}`} label="Powód decyzji" hint="Wymagany przy odrzuceniu. Zgłaszający zobaczy go na stronie statusu — nie wpisuj danych osobowych.">
        <Textarea id={`reason-${code}`} name="reason" rows={2} className="min-h-20" />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Submit decision="approved">Zaakceptuj</Submit>
        <Submit decision="rejected">Odrzuć</Submit>
      </div>
      {state && <Alert live tone={state.ok ? "ok" : "danger"} title={state.ok ? "Zapisano decyzję" : "Nie zapisano"}>{state.message}</Alert>}
    </form>
  );
}
