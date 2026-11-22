// Portal V3 — model zwierząt: GRUPA (nawigacyjna) → GATUNEK → RASA (opcjonalnie).
// Grupy to wejścia nawigacyjne, nie jeden poziom klasyfikacji biologicznej (króliki ≠ gryzonie; aksolotl = płazy).
// Lista gatunków to szkielet redakcyjny: nazwy łacińskie do potwierdzenia przez bazę wiedzy przed publikacją karty.

export type GroupSlug =
  | "psy" | "koty" | "kroliki" | "gryzonie" | "male-ssaki" | "ptaki" | "akwarystyka" | "gady" | "plazy" | "bezkregowce";

export interface Species {
  slug: string;
  name: string;
  /** Nazwa naukowa — wypełniana tylko po potwierdzeniu w źródle (null = brak danych). */
  scientific: string | null;
  group: GroupSlug;
  /** Kolejność uzupełniania w grupie (1 = pierwsza karta do przygotowania). */
  priority: number;
}

export interface AnimalGroup {
  slug: GroupSlug;
  name: string;
  /** Odmiana w dopełniaczu do nagłówków, np. „opiekunów królików”. */
  genitive: string;
  intro: string;
  /** Kolejność uzupełniania grup (plan pakietów). */
  fillOrder: number;
  species: Species[];
}

const sp = (group: GroupSlug, items: [string, string, number][]): Species[] =>
  items.map(([slug, name, priority]) => ({ slug, name, scientific: null, group, priority }));

export const GROUPS: readonly AnimalGroup[] = [
  { slug: "psy", name: "Psy", genitive: "psów", fillOrder: 1, intro: "Przygotowanie domu, codzienna opieka, zachowanie i organizacja opieki podczas nieobecności.", species: sp("psy", [["pies-domowy", "Pies domowy", 1]]) },
  { slug: "koty", name: "Koty", genitive: "kotów", fillOrder: 2, intro: "Przygotowanie mieszkania, codzienna opieka, transport i opieka podczas wyjazdu.", species: sp("koty", [["kot-domowy", "Kot domowy", 1]]) },
  { slug: "kroliki", name: "Króliki", genitive: "królików", fillOrder: 3, intro: "Króliki nie są gryzoniami — mają własne potrzeby przestrzeni, towarzystwa i opieki.", species: sp("kroliki", [["krolik-domowy", "Królik domowy", 1]]) },
  {
    slug: "gryzonie", name: "Gryzonie", genitive: "gryzoni", fillOrder: 4,
    intro: "Każdy gatunek gryzonia ma inne wymagania — porównuj gatunki, zanim wybierzesz.",
    species: sp("gryzonie", [["kawia-domowa", "Kawia domowa (świnka morska)", 1], ["chomik", "Chomik", 2], ["szczur", "Szczur", 3], ["mysz", "Mysz", 4], ["szynszyla", "Szynszyla", 5], ["koszatniczka", "Koszatniczka", 6], ["myszoskoczek", "Myszoskoczek", 7]]),
  },
  { slug: "male-ssaki", name: "Fretki i inne małe ssaki", genitive: "fretek i innych małych ssaków", fillOrder: 6, intro: "Fretki i inne małe ssaki towarzyszące — decyzja o opiece wymaga dobrego rozpoznania potrzeb.", species: sp("male-ssaki", [["fretka", "Fretka", 1]]) },
  { slug: "ptaki", name: "Ptaki", genitive: "ptaków", fillOrder: 5, intro: "Potrzeby ptaków różnią się między gatunkami — treści przypisujemy do konkretnego gatunku.", species: sp("ptaki", [["papuga-falista", "Papużka falista", 1], ["nimfa", "Nimfa (nimfa australijska)", 2], ["kanarek", "Kanarek", 3]]) },
  { slug: "akwarystyka", name: "Ryby i akwarystyka", genitive: "akwarystów", fillOrder: 3, intro: "Planowanie akwarium, objętość, opieka i organizacja podczas wyjazdu.", species: sp("akwarystyka", [["ryby-akwariowe", "Ryby akwariowe (ogólnie)", 1]]) },
  { slug: "gady", name: "Gady", genitive: "gadów", fillOrder: 7, intro: "Wymagania gadów zależą od gatunku — najpierw rozpoznanie gatunku, potem wyposażenie.", species: sp("gady", [["gekon-lamparci", "Gekon lamparci", 1], ["agama-brodata", "Agama brodata", 2]]) },
  { slug: "plazy", name: "Płazy", genitive: "płazów", fillOrder: 8, intro: "Płazy, w tym aksolotl, wymagają starannie dobranych warunków — sprawdzaj źródła dla gatunku.", species: sp("plazy", [["aksolotl", "Aksolotl", 1]]) },
  { slug: "bezkregowce", name: "Bezkręgowce", genitive: "opiekunów bezkręgowców", fillOrder: 9, intro: "Rozpoznanie gatunku to pierwszy krok — wymagania bezkręgowców bardzo się różnią.", species: sp("bezkregowce", [["patyczak", "Patyczak", 1], ["slimak-afrykanski", "Ślimak afrykański (achatina)", 2]]) },
];

const GROUP_BY_SLUG = new Map(GROUPS.map((g) => [g.slug, g]));
export const isGroupSlug = (s: unknown): s is GroupSlug => typeof s === "string" && GROUP_BY_SLUG.has(s as GroupSlug);
export const getGroup = (slug: GroupSlug): AnimalGroup => GROUP_BY_SLUG.get(slug)!;
export function findSpecies(group: GroupSlug, slug: string): Species | null {
  return getGroup(group).species.find((s) => s.slug === slug) ?? null;
}
export function speciesBySlug(slug: string): Species | null {
  for (const g of GROUPS) { const s = g.species.find((x) => x.slug === slug); if (s) return s; }
  return null;
}

// ---------- Druga oś: potrzeby opiekuna ----------
export type NeedSlug =
  | "wybor-zwierzecia" | "przygotowanie-domu" | "srodowisko" | "codzienna-opieka" | "zywienie" | "zachowanie"
  | "wyposazenie" | "transport" | "wyjazdy" | "koszty" | "profesjonalna-pomoc";

export const NEEDS: readonly { slug: NeedSlug; name: string }[] = [
  { slug: "wybor-zwierzecia", name: "Wybór zwierzęcia" },
  { slug: "przygotowanie-domu", name: "Przygotowanie domu" },
  { slug: "srodowisko", name: "Środowisko i warunki" },
  { slug: "codzienna-opieka", name: "Codzienna opieka" },
  { slug: "zywienie", name: "Żywienie" },
  { slug: "zachowanie", name: "Zachowanie" },
  { slug: "wyposazenie", name: "Wyposażenie" },
  { slug: "transport", name: "Transport" },
  { slug: "wyjazdy", name: "Wyjazdy i opieka zastępcza" },
  { slug: "koszty", name: "Koszty" },
  { slug: "profesjonalna-pomoc", name: "Profesjonalna pomoc" },
];
export const isNeedSlug = (s: unknown): s is NeedSlug => typeof s === "string" && NEEDS.some((n) => n.slug === s);

// ---------- Format i ryzyko treści ----------
export type ContentFormat = "hub" | "species_card" | "guide" | "checklist";

/**
 * Klasa ryzyka decyduje o wymaganym przeglądzie (V3 §10):
 * - standard: organizacja, wybór usługi, informacje praktyczne — redaktor (może być redaktor-AI, jawnie oznaczony, ADR-013);
 * - welfare: żywienie, środowisko, temperatury, wilgotność, oświetlenie, łączenie zwierząt, transport — osoba z wiedzą gatunkową;
 * - health: objawy, leki, leczenie — lekarz weterynarii;
 * - legal: prawo, handel — właściwa weryfikacja prawna.
 */
export type RiskClass = "standard" | "welfare" | "health" | "legal";
export type ReviewerRole = "editor" | "species_specialist" | "veterinarian" | "legal";

export const REQUIRED_REVIEW: Record<RiskClass, ReviewerRole> = {
  standard: "editor",
  welfare: "species_specialist",
  health: "veterinarian",
  legal: "legal",
};

/** Potrzeby, których treść z definicji wpływa na dobrostan (minimalna klasa: welfare). */
export const WELFARE_NEEDS: readonly NeedSlug[] = ["srodowisko", "zywienie", "transport"];

/** Klasa efektywna: deklarowana, ale nigdy niższa niż wynikająca z potrzeb (tytuł „dla początkującego” jej nie obniża). */
export function effectiveRisk(declared: RiskClass, needs: readonly NeedSlug[]): RiskClass {
  if (declared !== "standard") return declared;
  return needs.some((n) => WELFARE_NEEDS.includes(n)) ? "welfare" : "standard";
}

/** Czy redaktor-AI może zatwierdzić materiał (tylko klasa standard; nigdy jako recenzja człowieka). */
export function aiEditorMayApprove(declared: RiskClass, needs: readonly NeedSlug[]): boolean {
  return effectiveRisk(declared, needs) === "standard";
}
