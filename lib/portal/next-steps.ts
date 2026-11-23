// Następny krok pod materiałem (audyt V4 A07, A13): narzędzie i dział dobrane do zwierzęcia i zadania,
// a nie losowe kategorie. Czyste funkcje — testowane w tests/portal/next-steps.test.ts.
import type { Article } from "../types";
import { getGroup, isGroupSlug } from "../taxonomy/animals";
import { TOOLS, type PortalVisibility } from "./visibility";

export interface NextStep {
  href: string;
  title: string;
  description: string;
  kind: "tool" | "group" | "species";
}

const TOOL_BY_PATH = new Map(TOOLS.map((t) => [t.path, t]));

/** Narzędzia właściwe dla zadania: wyjazd => lista dla opiekuna; akwarystyka => kalkulator. */
export function toolsForArticle(a: Pick<Article, "animal" | "needs">): string[] {
  const out: string[] = [];
  const needs = a.needs ?? [];
  if (a.animal?.group === "akwarystyka" && !needs.includes("wyjazdy")) out.push("/narzedzia/kalkulator-akwarium");
  if (needs.includes("wyjazdy")) out.push("/narzedzia/lista-dla-opiekuna");
  return out;
}

const TOOL_CTA: Record<string, string> = {
  "/narzedzia/kalkulator-akwarium": "Wpisz wymiary swojego zbiornika i sprawdź, ile wody faktycznie mieści.",
  "/narzedzia/lista-dla-opiekuna": "Wypełnij listę dla osoby, która zajmie się zwierzęciem — wydrukuj ją lub zapisz jako plik.",
};

export function nextSteps(a: Pick<Article, "animal" | "needs">, vis: PortalVisibility): NextStep[] {
  const steps: NextStep[] = [];
  for (const path of toolsForArticle(a)) {
    const t = TOOL_BY_PATH.get(path);
    if (t) steps.push({ href: t.path, title: t.title, description: TOOL_CTA[path] ?? t.description, kind: "tool" });
  }
  const g = a.animal?.group;
  if (g && isGroupSlug(g) && vis.groups[g].isPublic) {
    const group = getGroup(g);
    const sp = a.animal?.species ? vis.groups[g].publicSpecies.find((s) => s.slug === a.animal!.species) : null;
    if (sp) steps.push({ href: `/zwierzeta/${g}/${sp.slug}`, title: `${sp.name}: potrzeby i zobowiązania`, description: "Najważniejsze informacje o gatunku i kolejne materiały w jednym miejscu.", kind: "species" });
    steps.push({ href: `/zwierzeta/${g}`, title: `Dział: ${group.name}`, description: `Wszystkie materiały i narzędzia dla ${group.genitive}.`, kind: "group" });
  }
  return steps.slice(0, 3);
}
