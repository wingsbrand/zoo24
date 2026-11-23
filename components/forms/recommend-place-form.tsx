"use client";
// „Poleć miejsce” (A08) — dla osób, które znają firmę jako klienci. Nie tworzy profilu i nie daje prawa do zarządzania nim.
import { useActionState, useState } from "react";
import type { FormState } from "@/lib/submissions";
import { Checkbox, Field, Honeypot, Input, Select, Textarea, describedBy } from "@/components/ui";
import { FormFeedback, FormSuccess, IDLE, InlineError, SubmitButton, errorsOf, useHydrated, useSubmitFocus, valuesOf, type Option } from "./shared";

type Action = (prev: FormState, fd: FormData) => Promise<FormState>;

export interface RecommendPlaceFormProps {
  action: Action;
  categories: Option[];
  cities: Option[];
  animals: Option[];
}

/** Musi odpowiadać `animalField` z lib/submissions (moduł serwerowy — nie importujemy go do klienta). */
const animalField = (slug: string) => `zw_${slug}`;

export function RecommendPlaceForm({ action, categories, cities, animals }: RecommendPlaceFormProps) {
  const [state, formAction] = useActionState(action, IDLE);
  useSubmitFocus(state);
  const hydrated = useHydrated();
  const e = errorsOf(state);
  const v = valuesOf(state);
  const [city, setCity] = useState(v.city ?? "");
  const [category, setCategory] = useState(v.category ?? "");

  if (state.status === "success") {
    return (
      <FormSuccess code={state.code} title="Dziękujemy za polecenie" againHref="/polec-miejsce">
        <li>Polecenie nie tworzy profilu automatycznie. Redakcja sprawdzi dane miejsca w publicznych źródłach (np. na stronie firmy).</li>
        <li>Profil pojawi się w katalogu dopiero po weryfikacji — albo wcale, jeśli danych nie da się potwierdzić.</li>
        <li>Polecenie nie daje prawa do zarządzania profilem. Twojego e-maila (jeśli go podasz) nie publikujemy.</li>
      </FormSuccess>
    );
  }

  const showCityOther = !hydrated || city === "inne" || !!e.cityOther;
  const showCategoryOther = !hydrated || category === "inna" || !!e.categoryOther;

  return (
    <form action={formAction} noValidate className="relative space-y-6" aria-describedby="form-required-note">
      <FormFeedback state={state} />
      <p id="form-required-note" className="text-sm text-ink-muted">
        Pola oznaczone <span aria-hidden className="text-accent-dark">*</span> są wymagane. Nie podawaj adresu ani danych osób prywatnych —
        wystarczy nazwa miejsca i miejscowość.
      </p>

      <fieldset className="space-y-5">
        <legend className="mb-1 text-xl font-bold">Polecane miejsce</legend>
        <Field id="placeName" label="Nazwa firmy" required error={e.placeName} hint="Tak, jak firma sama się przedstawia (2–120 znaków).">
          <Input id="placeName" name="placeName" defaultValue={v.placeName ?? ""} maxLength={120} required aria-required aria-invalid={!!e.placeName} aria-describedby={describedBy("placeName", true, e.placeName)} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="city" label="Miasto" required error={e.city}>
            <Select id="city" name="city" defaultValue={v.city ?? ""} onChange={(ev) => setCity(ev.target.value)} required aria-required aria-invalid={!!e.city} aria-describedby={describedBy("city", false, e.city)}>
              <option value="">Wybierz…</option>
              {cities.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              <option value="inne">Inna miejscowość</option>
            </Select>
          </Field>
          <Field id="category" label="Rodzaj usługi" required error={e.category}>
            <Select id="category" name="category" defaultValue={v.category ?? ""} onChange={(ev) => setCategory(ev.target.value)} required aria-required aria-invalid={!!e.category} aria-describedby={describedBy("category", false, e.category)}>
              <option value="">Wybierz…</option>
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              <option value="inna">Inna usługa</option>
            </Select>
          </Field>
        </div>

        {showCityOther && (
          <Field id="cityOther" label="Nazwa miejscowości" error={e.cityOther} hint="Wypełnij tylko, jeśli wybrano „Inna miejscowość”. Sama nazwa, bez ulicy.">
            <Input id="cityOther" name="cityOther" defaultValue={v.cityOther ?? ""} maxLength={80} aria-invalid={!!e.cityOther} aria-describedby={describedBy("cityOther", true, e.cityOther)} />
          </Field>
        )}
        {showCategoryOther && (
          <Field id="categoryOther" label="Jaka to usługa?" error={e.categoryOther} hint="Wypełnij tylko, jeśli wybrano „Inna usługa”, np. pet sitter, szkolenie psów (3–80 znaków).">
            <Input id="categoryOther" name="categoryOther" defaultValue={v.categoryOther ?? ""} maxLength={80} aria-invalid={!!e.categoryOther} aria-describedby={describedBy("categoryOther", true, e.categoryOther)} />
          </Field>
        )}

        <fieldset id="animals" tabIndex={-1} aria-describedby={["animals-hint", e.animals ? "animals-error" : null].filter(Boolean).join(" ")}>
          <legend className="font-semibold">
            Obsługiwane zwierzęta <span className="text-accent-dark" aria-hidden>*</span><span className="sr-only">(wymagane)</span>
          </legend>
          <p id="animals-hint" className="text-sm text-ink-muted">Według Twojej wiedzy — redakcja potwierdzi to u źródła, zanim pokaże to w profilu.</p>
          <div className="mt-1.5 grid gap-x-4 sm:grid-cols-2">
            {animals.map((a) => (
              <Checkbox key={a.value} id={animalField(a.value)} name={animalField(a.value)} defaultChecked={v[animalField(a.value)] === "on"} label={a.label} />
            ))}
          </div>
          <InlineError id="animals" error={e.animals} />
        </fieldset>

        <Field id="website" label="Strona www lub profil firmy" error={e.website} hint="Adres https://, np. strona firmy albo jej profil w serwisie społecznościowym.">
          <Input id="website" name="website" type="text" inputMode="url" spellCheck={false} autoCapitalize="none" maxLength={200} defaultValue={v.website ?? ""} aria-invalid={!!e.website} aria-describedby={describedBy("website", true, e.website)} />
        </Field>

        <Field id="source" label="Skąd znasz to miejsce?" required error={e.source} hint="Krótko, np. „korzystam z ich usług od dwóch lat” (do 300 znaków). Bez danych osobowych.">
          <Textarea id="source" name="source" maxLength={300} rows={3} defaultValue={v.source ?? ""} required aria-required aria-invalid={!!e.source} aria-describedby={describedBy("source", true, e.source)} />
        </Field>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className="mb-1 text-xl font-bold">Kontakt do Ciebie</legend>
        <Field id="email" label="E-mail" error={e.email} hint="Tylko jeśli chcesz, żebyśmy mogli dopytać o szczegóły. Nie publikujemy go i nie wysyłamy na niego ofert.">
          <Input id="email" name="email" type="email" inputMode="email" autoComplete="email" spellCheck={false} autoCapitalize="none" maxLength={254} defaultValue={v.email ?? ""} aria-invalid={!!e.email} aria-describedby={describedBy("email", true, e.email)} />
        </Field>
        <p className="text-sm text-ink-muted">
          Wysyłając polecenie, przyjmujesz do wiadomości <a href="/polityka-prywatnosci" target="_blank" rel="noopener" className="text-brand underline">informację o prywatności<span className="sr-only"> (otwiera się w nowej karcie)</span></a>.
        </p>
      </fieldset>

      <Honeypot />
      <SubmitButton>Wyślij polecenie</SubmitButton>
    </form>
  );
}
