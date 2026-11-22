// ZOO24 — lokalny router starych URL (F1, symulacja). Nie zmienia produkcji/DNS/301 na zoo24.pl.
// Zasada: tylko zwalidowany i zatwierdzony redirect -> 301/308; zatwierdzony gone_410 -> 410;
// wszystko inne -> 404. Nigdy 200 i nigdy redirect na `/` z segmentu innego niż A.
import type { LegacyUrl } from "../types";
import type { PageRegistry } from "./page-registry";
import { normalizePath, pathOnly } from "./paths";
import { validateRedirectMap, type RedirectValidationResult, type ValidateOptions } from "./redirect-plan";

export interface LegacyResolution {
  status: 301 | 308 | 404 | 410;
  location?: string;
  reason: string;
}

export interface LegacyRouterOptions extends ValidateOptions {
  /** Produkcyjnie zalecane: gdy mapa ma alarm BLOCK, wszystko -> 404. */
  requireUnblocked?: boolean;
}

/** Waliduje mapę raz i zwraca resolver (do wielokrotnego użycia). */
export function createLegacyResolver(
  rows: LegacyUrl[],
  registry: PageRegistry,
  opts?: LegacyRouterOptions,
): { resolve(path: string): LegacyResolution; validation: RedirectValidationResult } {
  const validation = validateRedirectMap(rows, registry, opts);
  const byPath = new Map<string, (typeof validation.entries)[number]>();
  for (const e of validation.entries) if (!byPath.has(e.oldPath)) byPath.set(e.oldPath, e);

  const resolve = (path: string): LegacyResolution => {
    const n = normalizePath(path);
    const entry = byPath.get(n) ?? byPath.get(pathOnly(n));
    if (!entry) return { status: 404, reason: "NO_RECORD" };
    if (opts?.requireUnblocked && validation.blocked) return { status: 404, reason: "MAP_BLOCKED" };
    if (entry.action === null) return { status: 404, reason: "NO_DECISION" };
    if (!entry.ok) return { status: 404, reason: `VALIDATION_FAILED: ${entry.errors.join(",")}` };

    switch (entry.action) {
      case "redirect_301":
      case "redirect_308": {
        const location = entry.targetPath;
        // Zabezpieczenie w głąb: nigdy redirect na `/` z segmentu != A, nigdy bez targetu.
        if (!location || (pathOnly(location) === "/" && entry.segment !== "A")) {
          return { status: 404, reason: "GUARD_TARGET_IS_HOME" };
        }
        return { status: entry.action === "redirect_301" ? 301 : 308, location, reason: "REDIRECT_APPROVED" };
      }
      case "gone_410":
        return { status: 410, reason: "GONE_APPROVED" };
      case "not_found_404":
        return { status: 404, reason: "NOT_FOUND_DECISION" };
      default:
        // keep_200/edit_200 obsługuje rejestr stron aplikacji, nie legacy router.
        return { status: 404, reason: "KEEP_200_NOT_SERVED_BY_LEGACY_ROUTER" };
    }
  };

  return { resolve, validation };
}

export function resolveLegacyPath(
  path: string,
  rows: LegacyUrl[],
  registry: PageRegistry,
  opts?: LegacyRouterOptions,
): LegacyResolution {
  return createLegacyResolver(rows, registry, opts).resolve(path);
}
