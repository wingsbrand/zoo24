// ZOO24 — walidator planu redirectów wg docs/seo/redirect-policy.md (R1–R12, §3, M1–M6).
// Planner WALIDUJE i PROPONUJE. Nic nie wdraża; wynik produkcyjny wymaga osobnej zgody właściciela.
// Czyste funkcje, bez I/O i bez sieci.
import type { LegacyUrl, ProposedAction, Segment } from "../types";
import { HUB_PATHS, type PageRegistry } from "./page-registry";
import { normalizePath, pathOnly } from "./paths";

export type RedirectErrorCode =
  | "NOT_APPROVED"
  | "MISSING_TARGET"
  | "SELF_REDIRECT"
  | "TARGET_NOT_200"
  | "TARGET_NOT_INDEXABLE"
  | "TARGET_IS_HOME"
  | "PRODUCT_TO_HUB"
  | "INTENT_SHIFT"
  | "INTENT_NOT_DOCUMENTED"
  | "CHAIN"
  | "LOOP"
  | "EXPIRED_REDIRECT"
  | "DUPLICATE_SOURCE"
  | "NO_DECISION"
  | "RIGHTS_UNVERIFIED"
  | "SEGMENT_NOT_ALLOWED"
  | "PRODUCT_FANIN";

export type AlarmCode =
  | "WARN_TARGET_CONCENTRATION"
  | "BLOCK_PRODUCT_FANIN"
  | "WARN_REDIRECT_RATIO"
  | "BLOCK_REDIRECT_TO_HOME"
  | "WARN_BATCH_SIZE"
  | "WARN_VERSION_CHANGE"
  | "WARN_PSEUDO_SHOP_REVIEW";

export interface RedirectEntry {
  oldPath: string;
  segment: Segment;
  action: ProposedAction | null;
  targetPath: string | null;
  ok: boolean;
  errors: RedirectErrorCode[];
}

export interface RedirectAlarm {
  code: AlarmCode;
  severity: "WARN" | "BLOCK";
  detail: string;
  paths?: string[];
}

export interface RedirectValidationResult {
  entries: RedirectEntry[];
  alarms: RedirectAlarm[];
  /** true = mapa nie przechodzi walidacji jako całość (alarm BLOCK). */
  blocked: boolean;
  versionHash: string;
  summary: {
    byAction: Record<ProposedAction | "none", number>;
    bySegment: Record<Segment, number>;
    ok: number;
    rejected: number;
  };
}

export interface RedirectThresholds {
  concentrationShare: number; // M1
  concentrationMinSources: number; // M1
  productFanIn: number; // M2
  redirectRatio: number; // M3
  batchSize: number; // M5
  versionChangeRows: number; // M6
  versionChangeShare: number; // M6
}

export const DEFAULT_THRESHOLDS: RedirectThresholds = {
  concentrationShare: 0.05,
  concentrationMinSources: 10,
  productFanIn: 20,
  redirectRatio: 0.6,
  batchSize: 50,
  versionChangeRows: 100,
  versionChangeShare: 0.2,
};

export interface ValidateOptions {
  hubPaths?: readonly string[];
  minExplanationLength?: number;
  /**
   * F1/DEMO: rekord legacy oznaczony `demo` może wskazywać na stronę DEMO (oba fikcyjne, oba noindex).
   * Rekord NIE-demo nigdy nie może wskazywać na DEMO (R4). Domyślnie true; ustaw false dla trybu ścisłego.
   */
  allowDemoTargetsForDemoRows?: boolean;
  thresholds?: Partial<RedirectThresholds>;
  /** M6: poprzednia zatwierdzona wersja mapy (opcjonalnie). */
  previousRows?: LegacyUrl[] | null;
}

const ACTIONS: (ProposedAction | "none")[] = [
  "keep_200",
  "edit_200",
  "redirect_301",
  "redirect_308",
  "gone_410",
  "not_found_404",
  "none",
];
const SEGMENTS: Segment[] = ["A", "B", "C", "D", "E"];

export function isRedirectAction(a: ProposedAction | null | undefined): a is "redirect_301" | "redirect_308" {
  return a === "redirect_301" || a === "redirect_308";
}

const nonEmpty = (s: string | null | undefined): boolean => typeof s === "string" && s.trim().length > 0;

export function isApproved(row: LegacyUrl): boolean {
  return row.status === "approved" && nonEmpty(row.approvedAt) && nonEmpty(row.reviewer);
}

const PRODUCT_FORBIDDEN: RegExp[] = [/^\/$/, /^\/poradniki$/, /^\/uslugi(\/.*)?$/, /^\/firma\/.*/];
const LISTING_FORBIDDEN: RegExp[] = [/^\/uslugi\/.*/, /^\/firma\/.*/];

/** FNV-1a 64-bit (czysty JS, bez node:crypto — działa też w bundlu klienta). */
export function fnv1a64(input: string): string {
  let h = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let i = 0; i < input.length; i++) {
    h ^= BigInt(input.charCodeAt(i));
    h = (h * prime) & mask;
  }
  return h.toString(16).padStart(16, "0");
}

function rowSignature(r: LegacyUrl): string {
  return JSON.stringify([
    r.proposedAction ?? null,
    r.targetPath ? normalizePath(r.targetPath) : null,
    r.status,
    r.approvedAt ?? null,
  ]);
}

/** Hash wersji mapy: deterministyczny, niezależny od kolejności wierszy, bez danych osobowych w raporcie. */
export function mapVersionHash(rows: LegacyUrl[]): string {
  const lines = rows
    .map((r) => `${normalizePath(r.oldPath)}|${r.segment}|${rowSignature(r)}`)
    .sort();
  return fnv1a64(lines.join("\n"));
}

export function validateRedirectMap(
  rows: LegacyUrl[],
  registry: PageRegistry,
  opts?: ValidateOptions,
): RedirectValidationResult {
  const th: RedirectThresholds = { ...DEFAULT_THRESHOLDS, ...(opts?.thresholds ?? {}) };
  const hubPaths = new Set((opts?.hubPaths ?? HUB_PATHS).map((p) => pathOnly(p)));
  const minExpl = opts?.minExplanationLength ?? 30;
  const allowDemo = opts?.allowDemoTargetsForDemoRows ?? true;

  // Graf przekierowań (wszystkie proponowane redirecty, niezależnie od statusu akceptacji — konserwatywnie).
  const sourceCount = new Map<string, number>();
  const redirectGraph = new Map<string, string>();
  const goneSources = new Set<string>();
  for (const r of rows) {
    const old = normalizePath(r.oldPath);
    sourceCount.set(old, (sourceCount.get(old) ?? 0) + 1);
    if (isRedirectAction(r.proposedAction) && nonEmpty(r.targetPath) && !redirectGraph.has(old)) {
      redirectGraph.set(old, normalizePath(r.targetPath));
    }
    if (r.proposedAction === "gone_410" && !goneSources.has(old)) goneSources.add(old);
  }

  const targetStatus = (t: string): number => {
    if (redirectGraph.has(t)) return 301;
    if (goneSources.has(t)) return 410;
    return registry.get(t) ? 200 : 404;
  };

  const leadsBackTo = (start: string, origin: string): boolean => {
    const seen = new Set<string>();
    let cur: string | undefined = start;
    while (cur !== undefined && !seen.has(cur)) {
      if (cur === origin) return true;
      seen.add(cur);
      cur = redirectGraph.get(cur);
    }
    return false;
  };

  const alarms: RedirectAlarm[] = [];
  const pseudoShopReview: string[] = [];

  const entries: RedirectEntry[] = rows.map((r) => {
    const oldPath = normalizePath(r.oldPath);
    const target = nonEmpty(r.targetPath) ? normalizePath(r.targetPath) : null;
    const errors: RedirectErrorCode[] = [];
    const action = r.proposedAction ?? null;

    if ((sourceCount.get(oldPath) ?? 0) > 1) errors.push("DUPLICATE_SOURCE"); // R12

    if (action === null) {
      errors.push("NO_DECISION");
    } else if (isRedirectAction(action)) {
      if (!isApproved(r)) errors.push("NOT_APPROVED"); // R1
      if (target === null) {
        errors.push("MISSING_TARGET"); // R2
      } else if (target === oldPath) {
        errors.push("SELF_REDIRECT"); // R2
      } else {
        const tPath = pathOnly(target);
        if (targetStatus(target) !== 200) errors.push("TARGET_NOT_200"); // R3
        const info = registry.get(target);
        if (info) {
          const demoOk = info.demo && r.demo && allowDemo;
          if (info.draft || (!info.indexable && !demoOk)) errors.push("TARGET_NOT_INDEXABLE"); // R4
        }
        if (tPath === "/" && r.segment !== "A") errors.push("TARGET_IS_HOME"); // R5
        if (r.segment === "C") {
          const toHub =
            PRODUCT_FORBIDDEN.some((re) => re.test(tPath)) ||
            hubPaths.has(tPath) ||
            (info !== null && info.kind !== "article");
          if (toHub) errors.push("PRODUCT_TO_HUB"); // R6
        }
        if ((r.segment === "B" || r.segment === "D") && LISTING_FORBIDDEN.some((re) => re.test(tPath))) {
          errors.push("INTENT_SHIFT"); // R7
        }
        if (redirectGraph.has(target)) {
          if (leadsBackTo(target, oldPath)) errors.push("LOOP"); // R10
          else errors.push("CHAIN"); // R9
        }
      }
      if ((r.semanticMatchExplanation ?? "").trim().length < minExpl) errors.push("INTENT_NOT_DOCUMENTED"); // R8
      if (r.segment === "E") errors.push("EXPIRED_REDIRECT"); // R11
    } else if (action === "keep_200" || action === "edit_200") {
      if (!isApproved(r)) errors.push("NOT_APPROVED");
      if (r.contentRightsVerified !== "yes") errors.push("RIGHTS_UNVERIFIED");
      if (r.segment === "E") errors.push("SEGMENT_NOT_ALLOWED");
      if (r.segment === "C") pseudoShopReview.push(oldPath);
    } else if (action === "gone_410") {
      if (!isApproved(r)) errors.push("NOT_APPROVED");
    }
    // not_found_404: bezpieczny domyślny wynik — brak dodatkowych warunków.

    return { oldPath, segment: r.segment, action, targetPath: target, ok: errors.length === 0, errors };
  });

  // ---- Limity masowe (M1–M6) ----
  const redirectRows = rows.filter((r) => isRedirectAction(r.proposedAction) && nonEmpty(r.targetPath));
  const totalRedirects = redirectRows.length;
  const byTarget = new Map<string, string[]>();
  const productByTarget = new Map<string, string[]>();
  for (const r of redirectRows) {
    const t = normalizePath(r.targetPath);
    const old = normalizePath(r.oldPath);
    byTarget.set(t, [...(byTarget.get(t) ?? []), old]);
    if (r.segment === "C") productByTarget.set(t, [...(productByTarget.get(t) ?? []), old]);
  }

  // M1
  for (const [t, sources] of byTarget) {
    if (totalRedirects > 0 && sources.length / totalRedirects > th.concentrationShare && sources.length >= th.concentrationMinSources) {
      alarms.push({
        code: "WARN_TARGET_CONCENTRATION",
        severity: "WARN",
        detail: `${sources.length} z ${totalRedirects} redirectów wskazuje na ${t} — wymagane ręczne potwierdzenie całej grupy.`,
        paths: sources,
      });
    }
  }
  // M2 — rekordy z grupy fan-in są odrzucane z aktywnej mapy
  const fanInSources = new Set<string>();
  for (const [t, sources] of productByTarget) {
    if (sources.length > th.productFanIn) {
      sources.forEach((s) => fanInSources.add(s));
      alarms.push({
        code: "BLOCK_PRODUCT_FANIN",
        severity: "BLOCK",
        detail: `${sources.length} kart produktowych (C) na jeden target ${t} (próg ${th.productFanIn}).`,
        paths: sources,
      });
    }
  }
  if (fanInSources.size > 0) {
    for (const e of entries) {
      if (e.segment === "C" && isRedirectAction(e.action) && fanInSources.has(e.oldPath)) {
        if (!e.errors.includes("PRODUCT_FANIN")) e.errors.push("PRODUCT_FANIN");
        e.ok = false;
      }
    }
  }
  // M3
  if (rows.length > 0 && totalRedirects / rows.length > th.redirectRatio) {
    alarms.push({
      code: "WARN_REDIRECT_RATIO",
      severity: "WARN",
      detail: `Redirecty stanowią ${Math.round((totalRedirects / rows.length) * 100)}% mapy (próg ${Math.round(th.redirectRatio * 100)}%) — podejrzenie blanket redirectu.`,
    });
  }
  // M4
  const toHome = redirectRows
    .filter((r) => r.segment !== "A" && pathOnly(r.targetPath) === "/")
    .map((r) => normalizePath(r.oldPath));
  if (toHome.length > 0) {
    alarms.push({
      code: "BLOCK_REDIRECT_TO_HOME",
      severity: "BLOCK",
      detail: `${toHome.length} redirect(ów) na stronę główną z segmentu innego niż A.`,
      paths: toHome,
    });
  }
  // M5
  if (rows.length > th.batchSize) {
    alarms.push({
      code: "WARN_BATCH_SIZE",
      severity: "WARN",
      detail: `Partia ma ${rows.length} wierszy (próg ${th.batchSize}) — podziel partię zatwierdzenia.`,
    });
  }
  // M6
  if (opts?.previousRows) {
    const prev = new Map(opts.previousRows.map((r) => [normalizePath(r.oldPath), rowSignature(r)]));
    const cur = new Map(rows.map((r) => [normalizePath(r.oldPath), rowSignature(r)]));
    let changed = 0;
    for (const [k, sig] of cur) if (prev.get(k) !== sig) changed++;
    for (const k of prev.keys()) if (!cur.has(k)) changed++;
    const share = changed / Math.max(opts.previousRows.length, 1);
    if (changed > th.versionChangeRows || share > th.versionChangeShare) {
      alarms.push({
        code: "WARN_VERSION_CHANGE",
        severity: "WARN",
        detail: `Zmiana ${changed} wierszy (${Math.round(share * 100)}%) względem poprzedniej wersji — wymagane nowe zatwierdzenie całej wersji przez właściciela.`,
      });
    }
  }
  if (pseudoShopReview.length > 0) {
    alarms.push({
      code: "WARN_PSEUDO_SHOP_REVIEW",
      severity: "WARN",
      detail: "Strony 200 dla segmentu C wymagają ręcznej kontroli PSEUDO_SHOP (cena, koszyk, schema Product/offers, nieoznaczona afiliacja).",
      paths: pseudoShopReview,
    });
  }

  const byAction = Object.fromEntries(ACTIONS.map((a) => [a, 0])) as Record<ProposedAction | "none", number>;
  const bySegment = Object.fromEntries(SEGMENTS.map((s) => [s, 0])) as Record<Segment, number>;
  for (const r of rows) {
    byAction[r.proposedAction ?? "none"]++;
    bySegment[r.segment]++;
  }
  const okCount = entries.filter((e) => e.ok).length;

  return {
    entries,
    alarms,
    blocked: alarms.some((a) => a.severity === "BLOCK"),
    versionHash: mapVersionHash(rows),
    summary: { byAction, bySegment, ok: okCount, rejected: entries.length - okCount },
  };
}

export interface ActiveDecision {
  oldPath: string;
  status: 301 | 308 | 404 | 410;
  targetPath: string | null;
}

/**
 * Aktywna mapa: wyłącznie rekordy bez błędów z decyzją 301/308/410/404.
 * `requireUnblocked: true` (zalecane dla produkcji) zwraca [] gdy mapa ma alarm BLOCK.
 */
export function activeRedirects(
  result: RedirectValidationResult,
  opts?: { requireUnblocked?: boolean },
): ActiveDecision[] {
  if (opts?.requireUnblocked && result.blocked) return [];
  const out: ActiveDecision[] = [];
  for (const e of result.entries) {
    if (!e.ok) continue;
    if (e.action === "redirect_301") out.push({ oldPath: e.oldPath, status: 301, targetPath: e.targetPath });
    else if (e.action === "redirect_308") out.push({ oldPath: e.oldPath, status: 308, targetPath: e.targetPath });
    else if (e.action === "gone_410") out.push({ oldPath: e.oldPath, status: 410, targetPath: null });
    else if (e.action === "not_found_404") out.push({ oldPath: e.oldPath, status: 404, targetPath: null });
  }
  return out;
}
