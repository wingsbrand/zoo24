// Lista informacji dla opiekuna zwierzęcia — model danych i eksport tekstowy (czyste funkcje).
// Dane zostają w przeglądarce użytkownika; nic nie jest wysyłane do ZOO24.

export const CARETAKER_STORAGE_KEY = "zoo24.narzedzia.lista-dla-opiekuna.v1";

export interface CaretakerAnimal {
  id: string;
  name: string;
  species: string;
  age: string;
  weight: string;
  feeding: string;
  waterEnvironment: string;
  medication: string;
  behavior: string;
  avoid: string;
}

export interface CaretakerSheet {
  animals: CaretakerAnimal[];
  ownerContact: string;
  vetContact: string;
  otherContacts: string;
  schedule: string;
  emergency: string;
}

export type AnimalField = Exclude<keyof CaretakerAnimal, "id">;
export type SheetField = Exclude<keyof CaretakerSheet, "animals">;

export const ANIMAL_FIELDS: AnimalField[] = ["name", "species", "age", "weight", "feeding", "waterEnvironment", "medication", "behavior", "avoid"];
export const SHEET_FIELDS: SheetField[] = ["ownerContact", "vetContact", "otherContacts", "schedule", "emergency"];

export const ANIMAL_LABELS: Record<AnimalField, string> = {
  name: "Imię",
  species: "Gatunek",
  age: "Wiek",
  weight: "Waga",
  feeding: "Karmienie (co, ile, kiedy)",
  waterEnvironment: "Woda i środowisko",
  medication: "Leki",
  behavior: "Zachowanie i zwyczaje",
  avoid: "Czego unikać",
};

export const SHEET_LABELS: Record<SheetField, string> = {
  ownerContact: "Kontakt do właściciela",
  vetContact: "Lekarz weterynarii",
  otherContacts: "Inne kontakty",
  schedule: "Wizyty i plan dnia",
  emergency: "Uwagi awaryjne",
};

const MAX_ANIMALS = 10;
const MAX_FIELD_LENGTH = 4000;

let counter = 0;
export function newId(): string {
  counter += 1;
  return `a${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyAnimal(id: string = newId()): CaretakerAnimal {
  return { id, name: "", species: "", age: "", weight: "", feeding: "", waterEnvironment: "", medication: "", behavior: "", avoid: "" };
}

export function emptySheet(firstId?: string): CaretakerSheet {
  return { animals: [emptyAnimal(firstId)], ownerContact: "", vetContact: "", otherContacts: "", schedule: "", emergency: "" };
}

export function canAddAnimal(sheet: CaretakerSheet): boolean {
  return sheet.animals.length < MAX_ANIMALS;
}

export function isSheetEmpty(sheet: CaretakerSheet): boolean {
  return SHEET_FIELDS.every((f) => !sheet[f].trim()) && sheet.animals.every((a) => ANIMAL_FIELDS.every((f) => !a[f].trim()));
}

const str = (v: unknown): string => (typeof v === "string" ? v.slice(0, MAX_FIELD_LENGTH) : "");

/** Bezpiecznie odczytuje dane z localStorage (uszkodzone/obce dane -> null). */
export function parseStoredSheet(raw: string | null): CaretakerSheet | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.animals)) return null;
  const animals = o.animals.slice(0, MAX_ANIMALS).filter((a): a is Record<string, unknown> => !!a && typeof a === "object").map((a) => {
    const animal = emptyAnimal(typeof a.id === "string" && a.id ? a.id.slice(0, 64) : newId());
    for (const f of ANIMAL_FIELDS) animal[f] = str(a[f]);
    return animal;
  });
  const sheet: CaretakerSheet = { ...emptySheet(), animals: animals.length ? animals : [emptyAnimal()] };
  for (const f of SHEET_FIELDS) sheet[f] = str(o[f]);
  return sheet;
}

/** Eksport do zwykłego tekstu (plik .txt). Pomija puste pola. */
export function sheetToText(sheet: CaretakerSheet, generatedAt: Date = new Date()): string {
  const lines: string[] = ["LISTA INFORMACJI DLA OPIEKUNA ZWIERZĘCIA", `Przygotowano: ${generatedAt.toLocaleDateString("pl-PL")}`, ""];
  const block = (label: string, value: string) => {
    const v = value.trim();
    if (!v) return;
    if (v.includes("\n")) lines.push(`${label}:`, ...v.split(/\r?\n/).map((l) => `  ${l}`));
    else lines.push(`${label}: ${v}`);
  };
  sheet.animals.forEach((a, i) => {
    const title = a.name.trim() || `Zwierzę ${i + 1}`;
    lines.push(`=== ${title.toUpperCase()} ===`);
    for (const f of ANIMAL_FIELDS) if (f !== "name") block(ANIMAL_LABELS[f], a[f]);
    lines.push("");
  });
  lines.push("=== KONTAKTY ===");
  block(SHEET_LABELS.ownerContact, sheet.ownerContact);
  block(SHEET_LABELS.vetContact, sheet.vetContact);
  block(SHEET_LABELS.otherContacts, sheet.otherContacts);
  lines.push("");
  if (sheet.schedule.trim()) {
    lines.push("=== WIZYTY I PLAN DNIA ===");
    block("Plan", sheet.schedule);
    lines.push("");
  }
  if (sheet.emergency.trim()) {
    lines.push("=== UWAGI AWARYJNE ===");
    block("Uwagi", sheet.emergency);
    lines.push("");
  }
  lines.push("Leki podawaj wyłącznie zgodnie z zaleceniami lekarza weterynarii. W razie niepokojących objawów skontaktuj się z lekarzem weterynarii.");
  return lines.join("\n");
}

/** Nazwa pliku do pobrania, np. lista-dla-opiekuna-burek.txt */
export function textFileName(sheet: CaretakerSheet): string {
  const name = sheet.animals.map((a) => a.name.trim()).filter(Boolean).join("-");
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `lista-dla-opiekuna${slug ? `-${slug}` : ""}.txt`;
}
