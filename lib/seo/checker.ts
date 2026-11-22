// ZOO24 — MOCK SEO checker (F1). Działa wyłącznie na danych w pamięci; nie wykonuje żadnych żądań HTTP,
// nie łączy się z GSC. Realne checki HTTP/GSC = F2 po osobnej zgodzie.
import type { AppState, LegacyUrl } from "../types";
import { canonicalFor, isProduction, robotsMetaFor, robotsTxt, sitemapEntries } from "./indexing";
import type { PageRegistry } from "./page-registry";
import { normalizePath, pathOnly } from "./paths";
import { isRedirectAction, validateRedirectMap } from "./redirect-plan";

export type SeoIssueCode =
  | "SOFT_404"
  | "REDIRECT_TO_HOME"
  | "CHAIN"
  | "LOOP"
  | "TARGET_NOT_200"
  | "SITEMAP_CONTAINS_NONINDEXABLE"
  | "CANONICAL_NOT_200"
  | "DEMO_INDEXABLE"
  | "STAGING_INDEXABLE";

export interface SeoIssue {
  path: string;
  issue: SeoIssueCode;
  severity: "info" | "warn" | "critical";
  detail: string;
}

export interface SeoCheckReport {
  isMock: true;
  env: string;
  issues: SeoIssue[];
}

export function runSeoChecks(
  state: AppState,
  registry: PageRegistry,
  rows: LegacyUrl[],
  ctx: { env: string; siteUrl: string },
): SeoCheckReport {
  const issues: SeoIssue[] = [];
  const pages = registry.all();
  const validation = validateRedirectMap(rows, registry);
  const legacySources = new Set(rows.map((r) => pathOnly(r.oldPath)));

  // STAGING_INDEXABLE (N2)
  if (!isProduction(ctx.env)) {
    if (!/^Disallow: \/$/m.test(robotsTxt(ctx.env, ctx.siteUrl))) {
      issues.push({ path: "/robots.txt", issue: "STAGING_INDEXABLE", severity: "critical", detail: "robots.txt poza produkcją nie blokuje indeksacji." });
    }
    for (const p of pages) {
      if (robotsMetaFor(p, ctx.env) !== "noindex, nofollow") {
        issues.push({ path: p.path, issue: "STAGING_INDEXABLE", severity: "critical", detail: "Strona indeksowalna poza produkcją." });
      }
    }
    if (sitemapEntries(registry, ctx.siteUrl, ctx.env).length > 0) {
      issues.push({ path: "/sitemap.xml", issue: "STAGING_INDEXABLE", severity: "critical", detail: "Sitemap serwowana poza produkcją." });
    }
  }

  // DEMO_INDEXABLE (N1)
  for (const p of pages) {
    if (p.demo && (p.indexable || robotsMetaFor(p, "production") === "index, follow")) {
      issues.push({ path: p.path, issue: "DEMO_INDEXABLE", severity: "critical", detail: "Strona DEMO oznaczona jako indeksowalna." });
    }
  }
  for (const b of state.businesses) {
    if (!b.demo || b.status !== "published") continue;
    const info = registry.get(`/firma/${b.slug}`);
    if (info && !info.demo) {
      issues.push({ path: info.path, issue: "DEMO_INDEXABLE", severity: "critical", detail: "Rekord firmy DEMO bez flagi demo w rejestrze stron." });
    }
  }
  for (const a of state.articles) {
    if (!a.demo || a.status !== "published") continue;
    const info = registry.get(`/poradniki/${a.slug}`);
    if (info && !info.demo) {
      issues.push({ path: info.path, issue: "DEMO_INDEXABLE", severity: "critical", detail: "Poradnik DEMO bez flagi demo w rejestrze stron." });
    }
  }

  // SITEMAP_CONTAINS_NONINDEXABLE (S1/S2) — symulacja sitemapy produkcyjnej
  for (const e of sitemapEntries(registry, ctx.siteUrl, "production")) {
    const path = pathOnly(e.loc.slice(ctx.siteUrl.replace(/\/+$/, "").length) || "/");
    const info = registry.get(path);
    if (!info || !info.indexable || info.demo || info.draft || legacySources.has(path)) {
      issues.push({ path, issue: "SITEMAP_CONTAINS_NONINDEXABLE", severity: "critical", detail: "Sitemap zawiera stronę nieindeksowalną/DEMO/draft/redirect." });
    }
  }

  // CANONICAL_NOT_200 (C2)
  for (const p of pages) {
    if (!p.indexable) continue;
    const canon = canonicalFor(p.path, ctx.siteUrl);
    const canonPath = pathOnly(canon.slice(ctx.siteUrl.replace(/\/+$/, "").length) || "/");
    const target = registry.get(canonPath);
    if (!target || legacySources.has(canonPath) || !target.indexable) {
      issues.push({ path: p.path, issue: "CANONICAL_NOT_200", severity: "warn", detail: `Canonical ${canon} nie wskazuje na indeksowalną stronę 200.` });
    }
  }

  // SOFT_404
  for (const p of pages) {
    if (p.kind === "listing" && (p.listingCount ?? 0) === 0) {
      issues.push({
        path: p.path,
        issue: "SOFT_404",
        severity: p.indexable ? "warn" : "info",
        detail: "Pusty listing zwraca 200 — wymagana pomocna treść i noindex (S2/N4).",
      });
    }
  }
  for (const r of rows) {
    if (r.currentHttpStatus === 200 && (r.proposedAction === "gone_410" || r.proposedAction === "not_found_404")) {
      issues.push({
        path: normalizePath(r.oldPath),
        issue: "SOFT_404",
        severity: "warn",
        detail: "Stary URL obecnie zwraca 200, a decyzja to 404/410 — potencjalny soft 404 (dane z inwentarza, nie z HTTP).",
      });
    }
  }

  // Redirecty: REDIRECT_TO_HOME, CHAIN, LOOP, TARGET_NOT_200
  rows.forEach((r, i) => {
    const entry = validation.entries[i];
    if (!entry) return;
    if (isRedirectAction(r.proposedAction) && r.targetPath && pathOnly(r.targetPath) === "/" && r.segment !== "A") {
      issues.push({ path: entry.oldPath, issue: "REDIRECT_TO_HOME", severity: "critical", detail: `Redirect segmentu ${r.segment} na stronę główną (R5/M4).` });
    }
    if (entry.errors.includes("LOOP")) {
      issues.push({ path: entry.oldPath, issue: "LOOP", severity: "critical", detail: "Cykl w grafie redirectów (R10)." });
    } else if (entry.errors.includes("CHAIN")) {
      issues.push({ path: entry.oldPath, issue: "CHAIN", severity: "warn", detail: "Łańcuch redirectów > 1 hop (R9)." });
    }
    if (entry.errors.includes("TARGET_NOT_200")) {
      issues.push({ path: entry.oldPath, issue: "TARGET_NOT_200", severity: "warn", detail: `Target ${entry.targetPath ?? "-"} nie zwraca 200 (R3).` });
    }
  });

  return { isMock: true, env: ctx.env, issues };
}
