// Spis treści artykułu: akapit zaczynający się od "## " = śródtytuł h2 ("### " = h3, poza spisem).
// Identyfikatory kotwic: polskie znaki -> ASCII, unikalne w obrębie strony.

export interface TocEntry {
  /** id kotwicy (unikalne) */
  id: string;
  /** tekst śródtytułu (bez "## ") */
  text: string;
  /** indeks akapitu w body[] */
  index: number;
}

export const isH2 = (p: string) => p.startsWith("## ");
export const isH3 = (p: string) => p.startsWith("### ");
export const headingText = (p: string) => p.replace(/^#{2,3} /, "").trim();

const PL_MAP: Record<string, string> = { ł: "l", Ł: "l" };

/** "Pielęgnacja szaty — najważniejsze zadanie" -> "pielegnacja-szaty-najwazniejsze-zadanie" */
export function slugifyHeading(text: string): string {
  const s = text
    .replace(/[łŁ]/g, (c) => PL_MAP[c] ?? c)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return s || "sekcja";
}

/** Id zarezerwowane przez szablon artykułu (nie mogą się powtórzyć w treści). */
export const RESERVED_IDS = ["main", "spis-tresci", "checklista", "znajdz-usluge", "zrodla", "powiazane-poradniki"] as const;

/** Buduje spis treści z akapitów "## ". Duplikaty dostają sufiks -2, -3… */
export function buildToc(body: string[], reserved: readonly string[] = RESERVED_IDS): TocEntry[] {
  const used = new Set<string>(reserved);
  const out: TocEntry[] = [];
  body.forEach((p, index) => {
    if (!isH2(p)) return;
    const text = headingText(p);
    if (!text) return;
    const base = slugifyHeading(text);
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    out.push({ id, text, index });
  });
  return out;
}

/** Spis treści pokazujemy dopiero przy ≥ 3 śródtytułach. */
export const TOC_MIN_HEADINGS = 3;
export const shouldShowToc = (toc: TocEntry[]) => toc.length >= TOC_MIN_HEADINGS;

/**
 * Miejsce kontekstowego bloku usług (~60% treści): przed pierwszym śródtytułem od 60% długości,
 * a gdy go brak — po akapicie na pozycji 60%. null = treść za krótka (< 4 akapity), blok tylko na końcu.
 */
export function midContentInsertIndex(body: string[]): number | null {
  if (body.length < 4) return null;
  const start = Math.floor(body.length * 0.6);
  for (let i = start; i < body.length; i++) if (isH2(body[i])) return i;
  return Math.min(start + 1, body.length - 1);
}
