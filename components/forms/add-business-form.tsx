"use client";
import { useActionState, useState } from "react";
import type { FormState } from "@/lib/submissions";
import { Checkbox, Field, Honeypot, Input, Select, Textarea, describedBy } from "@/components/ui";
import { FormFeedback, FormSuccess, IDLE, InlineError, SubmitButton, errorsOf, useHydrated, useSubmitFocus, valuesOf, type Option } from "./shared";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

export interface AddBusinessFormProps {
  action: Action;
  categories: Option[];
  cities: Option[];
  roles: Option[];
  /** Tryb aktualizacji/przejęcia istniejącego profilu. */
  profile?: { slug: string; name: string; category: string; city: string } | null;
}

export function AddBusinessForm({ action, categories, cities, roles, profile }: AddBusinessFormProps) {
  const [state, formAction] = useActionState(action, IDLE);
  useSubmitFocus(state);
  const hydrated = useHydrated();
  const e = errorsOf(state);
  const v = valuesOf(state, profile ? { companyName: profile.name, category: profile.category, city: profile.city } : {});
  const [city, setCity] = useState(v.city ?? "");
  const againHref = profile ? `/dodaj-firme?profil=${encodeURIComponent(profile.slug)}` : "/dodaj-firme";

  if (state.status === "success") {
    return (
      <FormSuccess code={state.code} title={profile ? "Dziękujemy — zgłoszenie aktualizacji przyjęte" : "Dziękujemy — zgłoszenie firmy przyjęte"} againHref={againHref}>
        <li>Moderator sprawdzi, czy masz prawo reprezentować firmę (np. kontakt przez oficjalny e-mail lub telefon firmy). Do tego czasu {profile ? "profil pozostaje bez zmian" : "firma nie pojawi się w katalogu"}.</li>
        <li>Jeśli zgłoszenie zostanie odrzucone, przy kodzie zobaczysz powód.</li>
      </FormSuccess>
    );
  }

  const showCityOther = !hydrated || city === "inne" || !!e.cityOther;

  return (
    <form action={formAction} noValidate className="relative space-y-6" aria-describedby="form-required-note">
      <FormFeedback state={state} />
      <p id="form-required-note" className="text-sm text-ink-muted">
        Pola oznaczone <span aria-hidden className="text-accent-dark">*</span> są wymagane. Nie podawaj prywatnego adresu zamieszkania — pytamy wyłącznie o publiczne dane firmy.
      </p>

      {profile && (
        <div id="firma" tabIndex={-1} className="space-y-1 rounded-[var(--radius-md)] border border-line bg-brand-tint p-4 text-sm">
          <p className="font-semibold">
            Rodzaj zgłoszenia: aktualizacja / przejęcie profilu <span className="break-words">{profile.name}</span>
          </p>
          <p className="text-ink-muted">
            Wpisz aktualne dane. Zanim cokolwiek zmienimy, moderator potwierdzi Twoje prawo do reprezentowania firmy — np. kontaktem
            przez oficjalny e-mail lub telefon firmy. Do czasu weryfikacji profil publicznie się nie zmienia.
          </p>
          <p>
            <a href="/dodaj-firme" className="text-brand underline">To nie ta firma? Zgłoś nową</a>
          </p>
          {e.firma && <p className="mt-1 font-medium text-danger">{e.firma}</p>}
          <input type="hidden" name="profil" value={profile.slug} />
        </div>
      )}

      <fieldset className="space-y-5">
        <legend className="mb-1 text-xl font-bold">Dane firmy</legend>
        <Field id="companyName" label="Nazwa firmy" required error={e.companyName} hint="Tak, jak ma się wyświetlać w katalogu (2–120 znaków).">
          <Input id="companyName" name="companyName" defaultValue={v.companyName ?? ""} autoComplete="organization" maxLength={120} required aria-required aria-invalid={!!e.companyName} aria-describedby={describedBy("companyName", true, e.companyName)} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="category" label="Rodzaj usług" required error={e.category}>
            <Select id="category" name="category" defaultValue={v.category ?? ""} required aria-required aria-invalid={!!e.category} aria-describedby={describedBy("category", false, e.category)}>
              <option value="">Wybierz…</option>
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </Field>
          <Field id="city" label="Miasto" required error={e.city} hint="Obecnie prowadzimy pilotaż w tych miastach.">
            <Select id="city" name="city" defaultValue={v.city ?? ""} onChange={(ev) => setCity(ev.target.value)} required aria-required aria-invalid={!!e.city} aria-describedby={describedBy("city", true, e.city)}>
              <option value="">Wybierz…</option>
              {cities.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              <option value="inne">Inna miejscowość</option>
            </Select>
          </Field>
        </div>

        {showCityOther && (
          <Field id="cityOther" label="Nazwa miejscowości" error={e.cityOther} hint="Wypełnij tylko, jeśli wybrano „Inna miejscowość”. Sama nazwa, bez ulicy.">
            <Input id="cityOther" name="cityOther" defaultValue={v.cityOther ?? ""} autoComplete="address-level2" maxLength={80} aria-invalid={!!e.cityOther} aria-describedby={describedBy("cityOther", true, e.cityOther)} />
          </Field>
        )}

        <Field id="website" label="Strona internetowa firmy" error={e.website} hint="Adres zaczynający się od https://, np. https://twojafirma.pl">
          <Input id="website" name="website" type="text" inputMode="url" autoComplete="url" spellCheck={false} autoCapitalize="none" maxLength={200} defaultValue={v.website ?? ""} aria-invalid={!!e.website} aria-describedby={describedBy("website", true, e.website)} />
        </Field>

        <Field id="phone" label="Publiczny telefon firmy" error={e.phone} hint="Numer, który firma sama podaje klientom. Nie podawaj prywatnego numeru.">
          <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} defaultValue={v.phone ?? ""} aria-invalid={!!e.phone} aria-describedby={describedBy("phone", true, e.phone)} />
        </Field>

        <Field id="services" label="Zakres usług" error={e.services} hint="Np. strzyżenie psów, kąpiel, pielęgnacja kotów (do 500 znaków). Bez cen i promocji.">
          <Textarea id="services" name="services" maxLength={500} rows={4} defaultValue={v.services ?? ""} aria-invalid={!!e.services} aria-describedby={describedBy("services", true, e.services)} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-1 text-xl font-bold">Osoba zgłaszająca</legend>
        <Field id="email" label="E-mail do weryfikacji" required error={e.email} hint="Użyjemy go tylko do kontaktu w sprawie tego zgłoszenia. Nie publikujemy go i nie wysyłamy na niego ofert.">
          <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false} autoCapitalize="none" maxLength={254} defaultValue={v.email ?? ""} required aria-required aria-invalid={!!e.email} aria-describedby={describedBy("email", true, e.email)} />
        </Field>

        <fieldset aria-describedby={e.role ? "role-error" : undefined}>
          <legend className="font-semibold">Kim jesteś dla tej firmy? <span className="text-accent-dark" aria-hidden>*</span><span className="sr-only">(wymagane)</span></legend>
          <div className="mt-1.5 space-y-1">
            {roles.map((r, i) => (
              <label key={r.value} htmlFor={i === 0 ? "role" : `role-${r.value}`} className="flex min-h-11 cursor-pointer items-center gap-3">
                <input id={i === 0 ? "role" : `role-${r.value}`} type="radio" name="role" value={r.value} defaultChecked={v.role === r.value} className="size-5 shrink-0 accent-[var(--color-brand)]" />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
          <InlineError id="role" error={e.role} />
        </fieldset>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="mb-1 text-xl font-bold">Zgody</legend>
        <div>
          <Checkbox id="acceptTerms" name="acceptTerms" aria-required="true" defaultChecked={v.acceptTerms === "on"} aria-invalid={!!e.acceptTerms} aria-describedby={e.acceptTerms ? "acceptTerms-error" : undefined}
            label={<>Akceptuję <a href="/regulamin" target="_blank" rel="noopener" className="text-brand underline">regulamin serwisu<span className="sr-only"> (otwiera się w nowej karcie)</span></a> i potwierdzam, że mogę reprezentować tę firmę. <span className="text-accent-dark" aria-hidden>*</span></>} />
          <InlineError id="acceptTerms" error={e.acceptTerms} />
        </div>
        <div>
          <Checkbox id="acceptPrivacy" name="acceptPrivacy" aria-required="true" defaultChecked={v.acceptPrivacy === "on"} aria-invalid={!!e.acceptPrivacy} aria-describedby={e.acceptPrivacy ? "acceptPrivacy-error" : undefined}
            label={<>Zapoznałem(-am) się z <a href="/polityka-prywatnosci" target="_blank" rel="noopener" className="text-brand underline">informacją o prywatności<span className="sr-only"> (otwiera się w nowej karcie)</span></a>. <span className="text-accent-dark" aria-hidden>*</span></>} />
          <InlineError id="acceptPrivacy" error={e.acceptPrivacy} />
        </div>
      </fieldset>

      <Honeypot />
      <SubmitButton>{profile ? "Wyślij zgłoszenie aktualizacji" : "Wyślij zgłoszenie firmy"}</SubmitButton>
    </form>
  );
}
