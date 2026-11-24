// Zatwierdzone przez właściciela przekierowania starych adresów zoo24.pl (content/redirects/*.json).
// Pierwsza partia: 16 × 301 z mapy docs/seo/HISTORICAL_URL_MAP.csv — decyzja D-05 (arkusz decyzji, 2026-11-23).
// Router (lib/seo/legacy-router.ts) i tak waliduje każdą parę (R1–R12: cel 200 i indeksowalny, bez łańcuchów, bez homepage spoza segmentu A).
import fs from "node:fs";
import path from "node:path";
import type { LegacyUrl } from "../types";

export function loadApprovedRedirects(): LegacyUrl[] {
  const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), "content", "redirects");
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).flatMap((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as LegacyUrl[]).map((r) => ({ ...r, demo: false }));
  } catch {
    return [];
  }
}
