// Dane strukturalne JSON-LD generowane z danych (audyt V4 A08, B §2.4).
// Zasady: tylko to, co widać na stronie; bez ocen, cen, godzin, recenzentów ani obrazów bez danych.
// Autor organizacyjny = rzeczywista redakcja wydawcy. Typy dobierane do faktycznej działalności (portal ≠ gabinet).
import type { Article } from "../types";
import { articleHref } from "../content/editorial";
import { articleDates, EDITORIAL_AUTHOR, PUBLISHER_NAME } from "../content/presentation";
import { OPERATOR } from "../legal/operator";

export const CANONICAL_ORIGIN = "https://zoo24.pl";
const abs = (path: string) => (path.startsWith("http") ? path : `${CANONICAL_ORIGIN}${path}`);
const ORG_ID = `${CANONICAL_ORIGIN}/#organization`;
const SITE_ID = `${CANONICAL_ORIGIN}/#website`;

export type JsonLdObject = Record<string, unknown>;

export function organizationLd(): JsonLdObject {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "ZOO24",
    legalName: PUBLISHER_NAME,
    url: `${CANONICAL_ORIGIN}/`,
    logo: abs("/icon.svg"),
    ...(OPERATOR.contactEmail ? { email: OPERATOR.contactEmail } : {}),
    ...(OPERATOR.nip ? { vatID: `PL${OPERATOR.nip}` } : {}),
    publishingPrinciples: abs("/zasady-redakcyjne"),
  };
}

export function websiteLd(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    name: "ZOO24",
    url: `${CANONICAL_ORIGIN}/`,
    inLanguage: "pl-PL",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${CANONICAL_ORIGIN}/poradniki?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface Crumb { label: string; href?: string }

/** BreadcrumbList z widocznych okruszków; element bez href (bieżąca strona) — bez `item` (dopuszczalne dla ostatniego). */
export function breadcrumbLd(items: Crumb[]): JsonLdObject {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: abs(c.href) } : {}),
    })),
  };
}

export function articleLd(a: Article, opts: { section?: string; image?: string | null } = {}): JsonLdObject {
  const d = articleDates(a);
  const url = abs(articleHref(a));
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: a.title.slice(0, 110),
    description: a.summary,
    url,
    mainEntityOfPage: url,
    inLanguage: "pl-PL",
    ...(d.published ? { datePublished: d.published, dateModified: d.modified } : {}),
    author: { "@type": "Organization", name: EDITORIAL_AUTHOR, url: abs("/o-nas") },
    publisher: { "@id": ORG_ID },
    ...(opts.section ? { articleSection: opts.section } : {}),
    ...(opts.image ? { image: abs(opts.image) } : {}),
    ...(a.sources.some((s) => s.url) ? { citation: a.sources.filter((s) => s.url).map((s) => s.url) } : {}),
  };
}

/** Graf do <script type="application/ld+json">. */
export function ldGraph(...nodes: JsonLdObject[]): string {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c");
}
