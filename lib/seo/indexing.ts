// ZOO24 — robots/sitemap/canonical/meta robots (redirect-policy §5: C1–C3, S1–S3, N1–N4). Czyste funkcje.
import type { PageInfo, PageRegistry } from "./page-registry";
import { pathOnly } from "./paths";

export type RobotsMeta = "noindex, nofollow" | "index, follow";

/** N3: bezpieczny default — wszystko poza dokładnie "production" traktowane jak staging/local. */
export function isProduction(env: string | null | undefined): boolean {
  return env === "production";
}

function baseUrl(siteUrl: string): string {
  return siteUrl.trim().replace(/\/+$/, "");
}

export function robotsTxt(env: string | null | undefined, siteUrl: string): string {
  if (!isProduction(env)) {
    // N2: środowisko != production -> pełna blokada, brak sitemap.
    return "User-agent: *\nDisallow: /\n";
  }
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api/",
    `Sitemap: ${baseUrl(siteUrl)}/sitemap.xml`,
    "",
  ].join("\n");
}

/** C1/C3: canonical absolutny, bez query i fragmentu. */
export function canonicalFor(path: string, siteUrl: string): string {
  return `${baseUrl(siteUrl)}${pathOnly(path)}`;
}

export function robotsMetaFor(info: PageInfo | null, env: string | null | undefined): RobotsMeta {
  if (!isProduction(env)) return "noindex, nofollow"; // N2
  if (!info) return "noindex, nofollow";
  if (info.demo || info.draft || !info.indexable || info.status !== 200) return "noindex, nofollow"; // N1, N4
  return "index, follow";
}

export interface SitemapEntry {
  loc: string;
  /** S3: tylko realna data zmiany treści; brak = pole pominięte. */
  lastmod?: string;
}

/**
 * S1/S2: tylko strony 200, indeksowalne, nie-DEMO, nie-draft, nie będące źródłem redirectu.
 * Środowisko != production -> [] (N2: sitemap nie jest serwowana).
 */
export function sitemapEntries(
  registry: PageRegistry,
  siteUrl: string,
  env: string | null | undefined,
  opts?: { excludePaths?: readonly string[] },
): SitemapEntry[] {
  if (!isProduction(env)) return [];
  const excluded = new Set((opts?.excludePaths ?? []).map((p) => pathOnly(p)));
  return registry
    .all()
    .filter((p) => p.status === 200 && p.indexable && !p.demo && !p.draft && !excluded.has(p.path))
    .map((p) => {
      const e: SitemapEntry = { loc: canonicalFor(p.path, siteUrl) };
      if (p.lastmod) e.lastmod = p.lastmod;
      return e;
    });
}
