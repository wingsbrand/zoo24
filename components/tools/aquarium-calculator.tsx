"use client";
// Orientacyjny kalkulator objętości akwarium — liczy wyłącznie w przeglądarce.
import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { sendEvent } from "@/lib/analytics/beacon";
import { Alert, Card, Field, Input, cn, describedBy } from "@/components/ui";
import {
  CM_PER_INCH,
  LITERS_PER_US_GALLON,
  MAX_DISPLACEMENT_PCT,
  calculateAquarium,
  formatPl,
  parseNumber,
  type AquariumField,
  type AquariumInput,
  type AquariumShape,
  type DimensionMode,
  type LengthUnit,
} from "@/lib/tools/aquarium";

type Values = Record<AquariumField, string>;

const INITIAL: Values = { length: "", width: "", height: "", diameter: "", glassMm: "0", waterGapCm: "0", displacementPct: "0" };

function Choice<T extends string>({ name, legend, value, options, onChange }: { name: string; legend: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 font-semibold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={cn(
              "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2 text-[0.95rem] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent",
              value === o.value ? "border-brand bg-brand-soft font-semibold text-brand-dark" : "border-line-strong bg-surface hover:border-brand",
            )}
          >
            <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} className="size-4 accent-[var(--color-brand)]" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function AquariumCalculator() {
  const uid = useId().replace(/:/g, "");
  const [shape, setShape] = useState<AquariumShape>("box");
  const [unit, setUnit] = useState<LengthUnit>("cm");
  const [mode, setMode] = useState<DimensionMode>("internal");
  const [values, setValues] = useState<Values>(INITIAL);
  const [touched, setTouched] = useState<Partial<Record<AquariumField, boolean>>>({});

  const input: AquariumInput = { shape, unit, mode, ...values };
  const outcome = useMemo(() => calculateAquarium(input), [shape, unit, mode, values]); // eslint-disable-line react-hooks/exhaustive-deps
  const errors = outcome.ok ? {} : outcome.errors;

  const required: AquariumField[] = shape === "cylinder" ? ["diameter", "height"] : ["length", "width", "height"];
  const allRequiredEmpty = required.every((f) => parseNumber(values[f]) === null);
  // Błąd pokazujemy po opuszczeniu pola albo gdy pole ma treść (nie krzyczymy na pusty formularz).
  const visibleError = (f: AquariumField) => (touched[f] || values[f].trim() !== "" ? errors[f] ?? null : null);

  const set = (f: AquariumField) => (e: ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [f]: e.target.value }));
  const blur = (f: AquariumField) => () => setTouched((t) => ({ ...t, [f]: true }));

  const numberField = (f: AquariumField, label: ReactNode, suffix: string, hint?: ReactNode, isRequired = true) => {
    const id = `${uid}-${f}`;
    const err = visibleError(f);
    return (
      <Field id={id} label={label} hint={hint} error={err} required={isRequired}>
        <div className="flex items-stretch gap-2">
          <Input
            id={id}
            inputMode="decimal"
            autoComplete="off"
            value={values[f]}
            onChange={set(f)}
            onBlur={blur(f)}
            aria-invalid={err ? true : undefined}
            aria-describedby={describedBy(id, hint, err)}
            aria-required={isRequired || undefined}
          />
          <span className="inline-flex min-w-12 items-center justify-center rounded-[var(--radius-md)] bg-canvas px-2 text-sm font-semibold text-ink-muted" aria-hidden>{suffix}</span>
        </div>
      </Field>
    );
  };

  const u = unit === "in" ? "in" : "cm";
  const r = outcome.ok ? outcome.result : null;
  // Pomiar: jeden agregat na wizytę, gdy narzędzie pierwszy raz pokaże wynik. Wymiary i wartości nie są wysyłane.
  const resultSent = useRef(false);
  useEffect(() => {
    if (r && !resultSent.current) { resultSent.current = true; sendEvent("tool_result", "kalkulator-akwarium"); }
  }, [r]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start">
      <Card className="p-4 sm:p-6">
        <form onSubmit={(e) => e.preventDefault()} noValidate aria-label="Wymiary akwarium" className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Choice name={`${uid}-shape`} legend="Kształt" value={shape} onChange={setShape} options={[{ value: "box", label: "Prostopadłościan" }, { value: "cylinder", label: "Walec" }]} />
            <Choice name={`${uid}-unit`} legend="Jednostka wymiarów" value={unit} onChange={setUnit} options={[{ value: "cm", label: "centymetry (cm)" }, { value: "in", label: "cale (in)" }]} />
          </div>
          <Choice
            name={`${uid}-mode`}
            legend="Które wymiary podajesz?"
            value={mode}
            onChange={setMode}
            options={[{ value: "internal", label: "Wewnętrzne (od szkła do szkła w środku)" }, { value: "external", label: "Zewnętrzne (z grubością szkła)" }]}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            {shape === "box" ? (
              <>
                {numberField("length", "Długość", u)}
                {numberField("width", "Szerokość (głębokość)", u)}
              </>
            ) : (
              numberField("diameter", "Średnica", u)
            )}
            {numberField("height", "Wysokość", u)}
          </div>

          {mode === "external" &&
            numberField(
              "glassMm",
              "Grubość szkła",
              "mm",
              "Zmierz na krawędzi szyby. Odejmujemy 2× grubość od długości i szerokości (średnicy) oraz 1× od wysokości (dno). Domyślnie 0 — wtedy wynik równa się objętości zewnętrznej.",
              false,
            )}

          <div className="grid gap-5 sm:grid-cols-2">
            {numberField("waterGapCm", "Odstęp lustra wody od górnej krawędzi", "cm", "Akwarium zwykle nie jest napełnione do pełna. Wpisz 0, jeśli liczysz pełną objętość.", false)}
            {numberField(
              "displacementPct",
              "Podłoże i dekoracje zajmują",
              "%",
              `Twój szacunek (0–${MAX_DISPLACEMENT_PCT}%). Nie zakładamy żadnej wartości — domyślnie 0.`,
              false,
            )}
          </div>
          <div>
            <label htmlFor={`${uid}-dispRange`} className="sr-only">Suwak: procent objętości zajęty przez podłoże i dekoracje</label>
            <input
              id={`${uid}-dispRange`}
              type="range"
              min={0}
              max={MAX_DISPLACEMENT_PCT}
              step={1}
              value={Math.min(MAX_DISPLACEMENT_PCT, Math.max(0, parseNumber(values.displacementPct) || 0))}
              onChange={(e) => setValues((v) => ({ ...v, displacementPct: e.target.value }))}
              className="w-full accent-[var(--color-brand)]"
            />
          </div>
        </form>
      </Card>

      <div className="space-y-4 lg:sticky lg:top-24">
        <Card className="p-4 sm:p-6" as="section">
          <h2 className="text-xl font-bold">Wynik (orientacyjny)</h2>
          <div aria-live="polite" className="mt-3">
            {r ? (
              <dl className="space-y-3">
                <Result label="Szacowana objętość wody" liters={r.estimatedLiters} gallons={r.estimatedGallons} strong note={r.displacementPct > 0 || r.waterGapCm > 0 ? "po uwzględnieniu odstępu i podłoża" : undefined} />
                <Result label="Woda do zadanego poziomu" liters={r.waterLiters} gallons={r.waterGallons} />
                <Result label="Objętość nominalna (wnętrze do krawędzi)" liters={r.nominalLiters} gallons={r.nominalGallons} />
              </dl>
            ) : allRequiredEmpty ? (
              <p className="text-ink-muted">Wpisz wymiary, aby zobaczyć wynik. Liczymy na bieżąco w Twojej przeglądarce.</p>
            ) : (
              <p className="text-ink-muted">Popraw zaznaczone pola, aby zobaczyć wynik.</p>
            )}
          </div>
        </Card>
        {r && (
          <Card className="p-4 sm:p-6 text-sm" as="section">
            <h2 className="text-lg font-bold">Założenia i obliczenia</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-muted">
              {unit === "in" && <li>1 in = {CM_PER_INCH} cm.</li>}
              {mode === "external" ? (
                <li>Szkło {formatPl(r.glassMm)} mm: {shape === "box" ? "długość i szerokość" : "średnica"} − 2 × {formatPl(r.glassMm / 10)} cm, wysokość − 1 × {formatPl(r.glassMm / 10)} cm (dno).</li>
              ) : (
                <li>Podano wymiary wewnętrzne — bez odejmowania szkła.</li>
              )}
              <li>
                Wnętrze:{" "}
                {shape === "box"
                  ? `${formatPl(r.inner.length!)} × ${formatPl(r.inner.width!)} × ${formatPl(r.inner.height)} cm`
                  : `Ø ${formatPl(r.inner.diameter!)} cm, wysokość ${formatPl(r.inner.height)} cm`}
                .
              </li>
              <li>
                {shape === "box" ? "V = długość × szerokość × wysokość ÷ 1000" : "V = π × (średnica ÷ 2)² × wysokość ÷ 1000"} (cm³ → litry).
              </li>
              <li>Poziom wody: {formatPl(r.inner.height)} − {formatPl(r.waterGapCm)} = {formatPl(r.waterHeightCm)} cm.</li>
              <li>Podłoże i dekoracje: woda × (1 − {formatPl(r.displacementPct)}%).</li>
              <li>1 galon amerykański (US gal) = {LITERS_PER_US_GALLON} L. Wyniki zaokrąglone do 0,1.</li>
            </ul>
          </Card>
        )}
        <Alert tone="warn" title="Ograniczenia">
          Kalkulator nie określa dopuszczalnej obsady ani parametrów wody. Wynik jest orientacyjny — rzeczywista ilość wody zależy m.in. od kształtu szyb, podłoża, wyposażenia i poziomu napełnienia.
        </Alert>
      </div>
    </div>
  );
}

function Result({ label, liters, gallons, strong, note }: { label: string; liters: number; gallons: number; strong?: boolean; note?: string }) {
  return (
    <div className={cn("rounded-[var(--radius-md)] p-3", strong ? "bg-brand-soft" : "bg-canvas")}>
      <dt className="text-sm font-semibold text-ink-muted">{label}</dt>
      <dd>
        <span className={cn("font-display font-bold text-brand-dark", strong ? "text-3xl" : "text-xl")}>{formatPl(liters)} L</span>
        <span className="ml-2 text-ink-muted">≈ {formatPl(gallons)} US gal</span>
        {note && <span className="block text-xs text-ink-muted">{note}</span>}
      </dd>
    </div>
  );
}
