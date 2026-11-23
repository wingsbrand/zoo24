// Wyszukiwanie w opublikowanych zasobach portalu (audyt V4 A11–A12): działy, karty gatunków i narzędzia
// z oznaczonym typem wyniku. Artykuły filtruje lib/content/topics.ts (matchesQuery). Bez generowania porad na żywo.
import { matchesWithSynonyms } from "../content/topics";
import { GROUPS, type GroupSlug } from "../taxonomy/animals";
import { TOOLS, type PortalVisibility } from "./visibility";

export type ResultType = "Dział" | "Karta gatunku" | "Narzędzie";
export interface SiteResult { type: ResultType; href: string; title: string; description: string }

export interface SiteSearch {
  results: SiteResult[];
  /** Działy pasujące do zapytania, ale jeszcze niepubliczne (np. Króliki) — do uczciwego komunikatu. */
  upcomingGroups: { slug: GroupSlug; name: string }[];
}

export function searchSite(q: string, vis: PortalVisibility): SiteSearch {
  const results: SiteResult[] = [];
  const upcomingGroups: SiteSearch["upcomingGroups"] = [];
  if (!q.trim()) return { results, upcomingGroups };
  for (const g of GROUPS) {
    const v = vis.groups[g.slug];
    const groupHay = `${g.name} ${g.slug} ${g.species.map((s) => s.name).join(" ")}`;
    if (!matchesWithSynonyms(groupHay, q)) continue;
    if (!v.isPublic) { upcomingGroups.push({ slug: g.slug, name: g.name }); continue; }
    results.push({ type: "Dział", href: `/zwierzeta/${g.slug}`, title: g.name, description: g.intro });
    for (const s of v.publicSpecies) {
      if (matchesWithSynonyms(`${s.name} ${g.name}`, q)) results.push({ type: "Karta gatunku", href: `/zwierzeta/${g.slug}/${s.slug}`, title: s.name, description: `Potrzeby, zobowiązania i materiały: ${s.name.toLowerCase()}.` });
    }
  }
  for (const t of TOOLS) {
    const toolHay = `${t.title} ${t.description} ${t.groups.length === GROUPS.length ? "wyjazd opiekun" : t.groups.join(" ")}`;
    if (matchesWithSynonyms(toolHay, q)) results.push({ type: "Narzędzie", href: t.path, title: t.title, description: t.description });
  }
  return { results, upcomingGroups };
}
