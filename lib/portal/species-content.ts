// Treść kart gatunków (content/species/<slug>.json) — samodzielna orientacja w potrzebach i zobowiązaniach (audyt V4 A03).
// Puste pola i plany redakcyjne nie są publikowane: brak pliku = karta pokazuje tylko materiały.
import fs from "node:fs";
import path from "node:path";

export interface SpeciesContent {
  slug: string;
  group: string;
  name: string;
  scientific: string | null;
  scientificNote: string | null;
  scientificSourceIndex: number | null;
  lead: string;
  sections: { id: string; title: string; points: string[]; sourceIndexes: number[] }[];
  beforeDecision: string[];
  sources: { label: string; url: string; accessedAt: string }[];
  checkedAt: string;
}

export function loadSpeciesContent(slug: string): SpeciesContent | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  try {
    const file = path.join(/*turbopackIgnore: true*/ process.cwd(), "content", "species", `${slug}.json`);
    const c = JSON.parse(fs.readFileSync(file, "utf8")) as SpeciesContent;
    return c.slug === slug && Array.isArray(c.sections) && c.sources?.length ? c : null;
  } catch {
    return null;
  }
}
