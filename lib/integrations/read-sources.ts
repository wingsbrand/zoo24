// Adaptery odczytu agregatów GSC / GA4 / Meta Insights. F1: tylko MOCK bez danych => no_access => N/A.
import fs from "node:fs";
import path from "node:path";
import { IntegrationDisabledError, liveFlag } from "./errors";

export type AccessStatus =
  | "connected" | "export_manual" | "no_access" | "not_implemented" | "api_metric_unavailable" | "demo";

export type SourceId = "gsc" | "ga4" | "meta_fb" | "meta_ig";

export interface AggregateResult {
  source: SourceId;
  accessStatus: AccessStatus;
  periodStart: string;
  periodEnd: string;
  lastSyncAt: string | null;
  metrics: Record<string, number | null>; // null = metryka niedostępna
}

export interface ReadSource {
  id: SourceId;
  fetch28d(periodStart: string, periodEnd: string): Promise<AggregateResult>;
}

/** Mock bez dostępu — domyślny w F1. Nigdy nie zwraca zer udających wynik. */
export class NoAccessSource implements ReadSource {
  constructor(public id: SourceId) {}
  async fetch28d(periodStart: string, periodEnd: string): Promise<AggregateResult> {
    return { source: this.id, accessStatus: "no_access", periodStart, periodEnd, lastSyncAt: null, metrics: {} };
  }
}

/** Fixture do testów (wartości oznaczone jako demo/connected wg parametru). */
export class FixtureSource implements ReadSource {
  constructor(public id: SourceId, private metrics: Record<string, number | null>, private status: AccessStatus = "demo") {}
  async fetch28d(periodStart: string, periodEnd: string): Promise<AggregateResult> {
    return { source: this.id, accessStatus: this.status, periodStart, periodEnd, lastSyncAt: periodEnd, metrics: this.metrics };
  }
}

/**
 * Ręczny eksport agregatów (np. pobranych przez Windsor.ai w sesji z właścicielem) zapisany w
 * `data/exports/<source>-28d.json`. Status `export_manual`; okres i data synchronizacji pochodzą z pliku.
 */
export class ManualExportSource implements ReadSource {
  constructor(public id: SourceId, private file: string) {}
  async fetch28d(periodStart: string, periodEnd: string): Promise<AggregateResult> {
    try {
      const j = JSON.parse(fs.readFileSync(this.file, "utf8")) as Partial<AggregateResult>;
      return {
        source: this.id, accessStatus: "export_manual",
        periodStart: j.periodStart ?? periodStart, periodEnd: j.periodEnd ?? periodEnd,
        lastSyncAt: j.lastSyncAt ?? null, metrics: j.metrics ?? {},
      };
    } catch {
      return new NoAccessSource(this.id).fetch28d(periodStart, periodEnd);
    }
  }
}

export function getReadSources(exportsDir = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "exports")): Record<SourceId, ReadSource> {
  const ids: SourceId[] = ["gsc", "ga4", "meta_fb", "meta_ig"];
  for (const flag of ["GSC", "GA4", "META"] as const) {
    if (liveFlag(flag)) throw new IntegrationDisabledError(`${flag} (live read nie jest zaimplementowany w F1)`);
  }
  return Object.fromEntries(ids.map((id) => {
    const file = path.join(exportsDir, `${id}-28d.json`);
    return [id, fs.existsSync(file) ? new ManualExportSource(id, file) : new NoAccessSource(id)];
  })) as Record<SourceId, ReadSource>;
}
