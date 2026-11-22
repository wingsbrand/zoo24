"use client";
// Lista informacji dla opiekuna zwierzęcia. Dane zostają WYŁĄCZNIE w przeglądarce (localStorage);
// komponent nie wysyła niczego na serwer ZOO24.
import { useEffect, useRef, useState } from "react";
import { Download, Plus, Printer, Trash2, X } from "lucide-react";
import { Alert, Button, Card, Field, Input, Textarea } from "@/components/ui";
import {
  ANIMAL_LABELS,
  CARETAKER_STORAGE_KEY,
  SHEET_LABELS,
  canAddAnimal,
  emptyAnimal,
  emptySheet,
  isSheetEmpty,
  parseStoredSheet,
  sheetToText,
  textFileName,
  type AnimalField,
  type CaretakerAnimal,
  type CaretakerSheet,
  type SheetField,
} from "@/lib/tools/caretaker";

type Status = { tone: "ok" | "info" | "warn"; text: string } | null;

const AREA = "min-h-24";

/** Druk: ukrywa nagłówek i stopkę serwisu oraz formularz; drukuje tylko czysty układ listy. */
const PRINT_CSS = `@media print {
  body > *:not(main) { display: none !important; }
  .zoo24-screen-only { display: none !important; }
  main { padding: 0 !important; margin: 0 !important; }
  @page { margin: 15mm; }
}`;

function loadSheet(): CaretakerSheet | null {
  try {
    return parseStoredSheet(window.localStorage.getItem(CARETAKER_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function CaretakerSheetTool() {
  // Stałe id pierwszego wpisu => identyczny HTML na serwerze i po hydratacji.
  const [sheet, setSheet] = useState<CaretakerSheet>(() => emptySheet("zwierze-1"));
  const [loaded, setLoaded] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [restored, setRestored] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const focusTarget = useRef<string | null>(null);

  useEffect(() => {
    const stored = loadSheet();
    if (stored && !isSheetEmpty(stored)) {
      setSheet(stored);
      setRestored(true);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      if (isSheetEmpty(sheet)) window.localStorage.removeItem(CARETAKER_STORAGE_KEY);
      else window.localStorage.setItem(CARETAKER_STORAGE_KEY, JSON.stringify(sheet));
      setStorageOk(true);
    } catch {
      setStorageOk(false);
    }
  }, [sheet, loaded]);

  useEffect(() => {
    if (!focusTarget.current) return;
    document.getElementById(focusTarget.current)?.focus();
    focusTarget.current = null;
  });

  const empty = isSheetEmpty(sheet);

  const setAnimal = (id: string, field: AnimalField, value: string) =>
    setSheet((s) => ({ ...s, animals: s.animals.map((a) => (a.id === id ? { ...a, [field]: value } : a)) }));
  const setField = (field: SheetField, value: string) => setSheet((s) => ({ ...s, [field]: value }));

  const addAnimal = () => {
    if (!canAddAnimal(sheet)) return;
    const a = emptyAnimal();
    focusTarget.current = `${a.id}-name`;
    setSheet((s) => ({ ...s, animals: [...s.animals, a] }));
    setStatus({ tone: "info", text: `Dodano zwierzę nr ${sheet.animals.length + 1}.` });
  };

  const removeAnimal = (a: CaretakerAnimal, index: number) => {
    const label = a.name.trim() || `zwierzę nr ${index + 1}`;
    if (!window.confirm(`Usunąć dane: ${label}? Tej operacji nie można cofnąć.`)) return;
    focusTarget.current = "dodaj-zwierze";
    setSheet((s) => ({ ...s, animals: s.animals.filter((x) => x.id !== a.id) }));
    setStatus({ tone: "info", text: `Usunięto: ${label}.` });
  };

  const requireContent = () => {
    if (!empty) return true;
    setStatus({ tone: "warn", text: "Lista jest pusta. Uzupełnij przynajmniej jedno pole, aby ją wydrukować lub pobrać." });
    return false;
  };

  const print = () => {
    if (!requireContent()) return;
    window.print();
  };

  const download = () => {
    if (!requireContent()) return;
    try {
      const blob = new Blob([sheetToText(sheet)], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = textFileName(sheet);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus({ tone: "ok", text: `Plik ${textFileName(sheet)} został przygotowany do pobrania.` });
    } catch {
      setStatus({ tone: "warn", text: "Nie udało się przygotować pliku. Spróbuj opcji „Drukuj / zapisz jako PDF”." });
    }
  };

  const clearAll = () => {
    if (empty) {
      setStatus({ tone: "info", text: "Lista jest już pusta." });
      return;
    }
    if (!window.confirm("Wyczyścić całą listę? Dane zostaną usunięte z tej przeglądarki i nie da się ich przywrócić.")) return;
    try {
      window.localStorage.removeItem(CARETAKER_STORAGE_KEY);
    } catch {
      /* brak dostępu do pamięci przeglądarki — czyścimy tylko formularz */
    }
    focusTarget.current = "zwierze-1-name";
    setSheet(emptySheet("zwierze-1"));
    setRestored(false);
    setStatus({ tone: "ok", text: "Lista została wyczyszczona." });
  };

  const actions = (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button variant="accent" onClick={print} icon={<Printer aria-hidden size={18} />}>Drukuj / zapisz jako PDF</Button>
      <Button variant="secondary" onClick={download} icon={<Download aria-hidden size={18} />}>Pobierz jako plik tekstowy</Button>
      <Button variant="ghost" onClick={clearAll} icon={<Trash2 aria-hidden size={18} />}>Wyczyść</Button>
    </div>
  );

  return (
    <>
      <style>{PRINT_CSS}</style>

      <div className="zoo24-screen-only space-y-6">
        <Alert tone="info" title="Dane zostają na Twoim urządzeniu">
          Nic z tego formularza nie jest wysyłane do ZOO24. Lista zapisuje się automatycznie w pamięci tej przeglądarki, dopóki jej nie wyczyścisz.
          Na wspólnym komputerze użyj przycisku „Wyczyść” po zakończeniu.
        </Alert>
        {loaded && !storageOk && (
          <Alert tone="warn" title="Autozapis niedostępny">
            Przeglądarka blokuje zapis danych (np. tryb prywatny). Lista działa, ale zniknie po zamknięciu strony — pobierz ją lub wydrukuj przed wyjściem.
          </Alert>
        )}
        {restored && (
          <Alert tone="ok" title="Przywrócono zapisaną listę">Wczytaliśmy dane zapisane wcześniej w tej przeglądarce.</Alert>
        )}

        <div aria-live="polite" role="status" className="min-h-0">
          {status && <Alert tone={status.tone}>{status.text}</Alert>}
        </div>

        <form onSubmit={(e) => e.preventDefault()} aria-label="Lista informacji dla opiekuna" className="space-y-6" noValidate>
          {sheet.animals.map((a, i) => (
            <AnimalCard
              key={a.id}
              animal={a}
              index={i}
              canRemove={sheet.animals.length > 1}
              onChange={(f, v) => setAnimal(a.id, f, v)}
              onRemove={() => removeAnimal(a, i)}
            />
          ))}

          <div>
            <Button id="dodaj-zwierze" variant="secondary" onClick={addAnimal} disabled={!canAddAnimal(sheet)} icon={<Plus aria-hidden size={18} />}>
              Dodaj kolejne zwierzę
            </Button>
            {!canAddAnimal(sheet) && <p className="mt-2 text-sm text-ink-muted">Osiągnięto limit 10 zwierząt na jednej liście.</p>}
          </div>

          <Card as="section" className="p-4 sm:p-6">
            <fieldset className="space-y-5">
              <legend className="font-display text-xl font-bold text-brand-dark">Kontakty</legend>
              <p className="text-sm text-ink-muted">Numery i adresy wpisujesz samodzielnie. ZOO24 nie podpowiada ani nie przechowuje kontaktów.</p>
              <Field id="ownerContact" label={SHEET_LABELS.ownerContact} hint="Np. imię, telefon, kiedy najlepiej dzwonić.">
                <Textarea id="ownerContact" aria-describedby="ownerContact-hint" className={AREA} value={sheet.ownerContact} onChange={(e) => setField("ownerContact", e.target.value)} />
              </Field>
              <Field id="vetContact" label={SHEET_LABELS.vetContact} hint="Nazwa przychodni, telefon, godziny pracy, ewentualnie dyżur całodobowy, z którego korzystasz.">
                <Textarea id="vetContact" aria-describedby="vetContact-hint" className={AREA} value={sheet.vetContact} onChange={(e) => setField("vetContact", e.target.value)} />
              </Field>
              <Field id="otherContacts" label={SHEET_LABELS.otherContacts} hint="Np. sąsiad z zapasowym kluczem, osoba zastępcza.">
                <Textarea id="otherContacts" aria-describedby="otherContacts-hint" className={AREA} value={sheet.otherContacts} onChange={(e) => setField("otherContacts", e.target.value)} />
              </Field>
            </fieldset>
          </Card>

          <Card as="section" className="p-4 sm:p-6">
            <fieldset className="space-y-5">
              <legend className="font-display text-xl font-bold text-brand-dark">Wizyty, plan dnia i sytuacje awaryjne</legend>
              <Field id="schedule" label={SHEET_LABELS.schedule} hint="Np. godziny wizyt, spacery, sprzątanie kuwety, wyjazd i powrót.">
                <Textarea id="schedule" aria-describedby="schedule-hint" value={sheet.schedule} onChange={(e) => setField("schedule", e.target.value)} />
              </Field>
              <Field id="emergency" label={SHEET_LABELS.emergency} hint="Co zrobić, gdy coś pójdzie nie tak: kogo powiadomić najpierw, gdzie są dokumenty i transporter, kto podejmuje decyzje.">
                <Textarea id="emergency" aria-describedby="emergency-hint" value={sheet.emergency} onChange={(e) => setField("emergency", e.target.value)} />
              </Field>
            </fieldset>
          </Card>
        </form>

        <Card className="p-4 sm:p-6">
          <h2 className="text-xl font-bold">Zapisz lub przekaż listę</h2>
          <p className="mt-1 mb-4 text-sm text-ink-muted">
            {empty ? "Lista jest jeszcze pusta — uzupełnij pola powyżej." : "Lista jest zapisana w tej przeglądarce. Wydrukuj ją lub pobierz, aby przekazać opiekunowi."}
          </p>
          {actions}
        </Card>
      </div>

      <PrintView sheet={sheet} />
    </>
  );
}

function AnimalCard({ animal: a, index, canRemove, onChange, onRemove }: { animal: CaretakerAnimal; index: number; canRemove: boolean; onChange: (f: AnimalField, v: string) => void; onRemove: () => void }) {
  const id = (f: AnimalField) => `${a.id}-${f}`;
  const title = a.name.trim() || `Zwierzę ${index + 1}`;
  const text = (f: AnimalField, hint?: string, area = true) => (
    <Field id={id(f)} label={ANIMAL_LABELS[f]} hint={hint}>
      {area ? (
        <Textarea id={id(f)} aria-describedby={hint ? `${id(f)}-hint` : undefined} className={AREA} value={a[f]} onChange={(e) => onChange(f, e.target.value)} />
      ) : (
        <Input id={id(f)} aria-describedby={hint ? `${id(f)}-hint` : undefined} value={a[f]} onChange={(e) => onChange(f, e.target.value)} />
      )}
    </Field>
  );

  return (
    <Card as="section" className="relative p-4 sm:p-6">
      {canRemove && (
        <Button variant="ghost" size="sm" onClick={onRemove} icon={<X aria-hidden size={16} />} aria-label={`Usuń: ${title}`} className="absolute right-2 top-2 sm:right-4 sm:top-4">
          Usuń
        </Button>
      )}
      <fieldset className="min-w-0 space-y-5">
        <legend className={`font-display text-xl font-bold text-brand-dark break-words ${canRemove ? "pr-24" : ""}`}>{title}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          {text("name", undefined, false)}
          {text("species", "Wpisz własnymi słowami, np. pies, kot, królik, papużka falista.", false)}
          {text("age", undefined, false)}
          {text("weight", undefined, false)}
        </div>
        {text("feeding", "Przepisz to, co podajesz na co dzień: rodzaj karmy, ilość, pory. Narzędzie niczego nie zaleca.")}
        {text("waterEnvironment", "Np. gdzie stoi miska z wodą i jak często ją zmieniać, temperatura w pomieszczeniu, sprzątanie klatki lub kuwety.")}
        <Field id={id("medication")} label={ANIMAL_LABELS.medication} hint="Przepisz dokładnie z zaleceń lekarza weterynarii (nazwa, dawka, pora, sposób podania). Narzędzie nie dobiera dawek.">
          <Textarea id={id("medication")} aria-describedby={`${id("medication")}-hint`} className={AREA} value={a.medication} onChange={(e) => onChange("medication", e.target.value)} />
        </Field>
        {text("behavior", "Np. jak reaguje na obcych, ulubione zabawy, gdzie lubi spać, sygnały stresu.")}
        {text("avoid", "Np. czego nie wolno podawać, sytuacje lub miejsca, których zwierzę się boi.")}
      </fieldset>
    </Card>
  );
}

function PrintRow({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <div className="break-inside-avoid border-b border-line py-1.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="whitespace-pre-wrap">{value}</dd>
    </div>
  );
}

/** Układ wyłącznie do druku (na ekranie ukryty). */
function PrintView({ sheet }: { sheet: CaretakerSheet }) {
  const generated = new Date().toLocaleDateString("pl-PL");
  return (
    <div className="hidden text-[11pt] leading-snug text-black print:block" aria-hidden>
      <h1 className="text-2xl font-bold text-black">Informacje dla opiekuna zwierzęcia</h1>
      <p className="mb-4 text-sm">Przygotowano: {generated}</p>
      {sheet.animals.map((a, i) => (
        <section key={a.id} className="mb-5 break-inside-avoid-page">
          <h2 className="mb-1 text-xl font-bold text-black">{a.name.trim() || `Zwierzę ${i + 1}`}</h2>
          <dl>
            {(["species", "age", "weight", "feeding", "waterEnvironment", "medication", "behavior", "avoid"] as AnimalField[]).map((f) => (
              <PrintRow key={f} label={ANIMAL_LABELS[f]} value={a[f]} />
            ))}
          </dl>
        </section>
      ))}
      <section className="mb-5 break-inside-avoid">
        <h2 className="mb-1 text-xl font-bold text-black">Kontakty</h2>
        <dl>
          <PrintRow label={SHEET_LABELS.ownerContact} value={sheet.ownerContact} />
          <PrintRow label={SHEET_LABELS.vetContact} value={sheet.vetContact} />
          <PrintRow label={SHEET_LABELS.otherContacts} value={sheet.otherContacts} />
        </dl>
      </section>
      {(sheet.schedule.trim() || sheet.emergency.trim()) && (
        <section className="mb-5">
          <h2 className="mb-1 text-xl font-bold text-black">Plan i sytuacje awaryjne</h2>
          <dl>
            <PrintRow label={SHEET_LABELS.schedule} value={sheet.schedule} />
            <PrintRow label={SHEET_LABELS.emergency} value={sheet.emergency} />
          </dl>
        </section>
      )}
      <p className="mt-6 text-xs">Leki podawaj wyłącznie zgodnie z zaleceniami lekarza weterynarii. W razie niepokojących objawów skontaktuj się z lekarzem weterynarii.</p>
    </div>
  );
}
