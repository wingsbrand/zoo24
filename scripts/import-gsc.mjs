// Import eksportów Google Search Console (zakładka „Strony” i „Linki”) -> docs/audits/old-url-inventory.csv
// + docs/audits/top100-report.md. Tylko dane agregowane; NIE czyta zapytań (mogą zawierać dane osobowe).
// Niczego nie przekierowuje: nowe wiersze mają status `draft`; decyzje ludzi z poprzednich importów są zachowywane.
// Użycie: npm run import:gsc   (pliki CSV w imports/gsc/; ZIP najpierw rozpakuj)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const INVENTORY_HEADER = [
  "old_path", "old_page_type", "historical_gsc_clicks", "backlink_priority", "current_http_status", "search_intent",
  "content_rights_verified", "proposed_action", "target_path", "semantic_match_explanation", "reviewer", "approved_at",
  "status", "segment", "link_priority_rank", "click_rank", "data_source", "exported_at",
  "historical_ga4_organic_sessions", "ga4_session_rank",
];
// Kolumny wypełniane przez ludzi — nie nadpisujemy ich przy ponownym imporcie.
const HUMAN_COLS = ["old_page_type", "search_intent", "content_rights_verified", "proposed_action", "target_path",
  "semantic_match_explanation", "reviewer", "approved_at", "status", "segment", "current_http_status",
  "historical_ga4_organic_sessions", "ga4_session_rank"]; // dane GA4 z osobnego importu też zachowujemy
const TRACKING = /^(utm_|gclid$|fbclid$|msclkid$|_ga$)/i;
export const ALLOWED_HOSTS = /^(www\.)?zoo24\.pl$/i;

export function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", q = false;
  const t = text.replace(/^﻿/, "");
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"' && t[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x !== "")) rows.push(row);
  return rows;
}

const esc = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toInt = (v) => {
  const d = String(v ?? "").replace(/[^\d]/g, "");
  return d === "" ? null : Number(d);
};

/** URL z eksportu -> ścieżka; null gdy obca domena lub niepoprawny URL. */
export function urlToPath(raw) {
  let u;
  try { u = new URL(String(raw).trim()); } catch { return null; }
  if (!ALLOWED_HOSTS.test(u.hostname)) return null;
  for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k);
  let p;
  try { p = decodeURI(u.pathname); } catch { p = u.pathname; }
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1) p = p.replace(/\/$/, "");
  const qs = u.searchParams.toString();
  return qs ? `${p}?${qs}` : p;
}

/** Rozpoznaje typ pliku po nagłówkach (PL lub EN). */
export function detectKind(header) {
  const h = header.map((x) => x.toLowerCase());
  const has = (re) => h.findIndex((x) => re.test(x));
  const clicks = has(/klikni|clicks/), impressions = has(/wyświetl|wyswietl|impressions/);
  const links = has(/linki przych|incoming links|^linki$|^links$/), sites = has(/witryn|linking sites|sites/);
  const page = has(/stron|page|url/);
  if (page >= 0 && clicks >= 0) return { kind: "pages", page, clicks, impressions };
  if (page >= 0 && links >= 0) return { kind: "links", page, links, sites };
  return { kind: "unknown" };
}

/** Łączy pliki: kliknięcia = MAX per ścieżka (różne okresy się nie sumują), linki = MAX. */
export function aggregate(files) {
  const map = new Map();
  const skipped = { foreignHost: 0, invalid: 0 };
  const sources = [];
  for (const f of files) {
    const rows = parseCsv(f.text);
    if (!rows.length) continue;
    const k = detectKind(rows[0]);
    if (k.kind === "unknown") { sources.push({ file: f.name, kind: "pominięty (nierozpoznane nagłówki)" }); continue; }
    sources.push({ file: f.name, kind: k.kind, rows: rows.length - 1 });
    for (const r of rows.slice(1)) {
      const p = urlToPath(r[k.page]);
      if (p === null) { /^https?:/i.test(r[k.page] ?? "") ? skipped.foreignHost++ : skipped.invalid++; continue; }
      const e = map.get(p) ?? { path: p, clicks: null, impressions: null, links: null, sites: null, files: new Set(), exportedAt: f.exportedAt };
      if (k.kind === "pages") {
        const c = toInt(r[k.clicks]); const im = k.impressions >= 0 ? toInt(r[k.impressions]) : null;
        if (c !== null) e.clicks = Math.max(e.clicks ?? 0, c);
        if (im !== null) e.impressions = Math.max(e.impressions ?? 0, im);
      } else {
        const l = toInt(r[k.links]); const s = k.sites >= 0 ? toInt(r[k.sites]) : null;
        if (l !== null) e.links = Math.max(e.links ?? 0, l);
        if (s !== null) e.sites = Math.max(e.sites ?? 0, s);
      }
      e.files.add(f.name);
      if (f.exportedAt > e.exportedAt) e.exportedAt = f.exportedAt;
      map.set(p, e);
    }
  }
  const all = [...map.values()];
  const byClicks = all.filter((e) => e.clicks !== null).sort((a, b) => b.clicks - a.clicks || a.path.localeCompare(b.path));
  // Priorytet linków: liczba domen linkujących, potem liczba linków.
  const byLinks = all.filter((e) => e.links !== null || e.sites !== null)
    .sort((a, b) => (b.sites ?? 0) - (a.sites ?? 0) || (b.links ?? 0) - (a.links ?? 0) || a.path.localeCompare(b.path));
  byClicks.forEach((e, i) => (e.clickRank = i + 1));
  byLinks.forEach((e, i) => (e.linkRank = i + 1));
  return { entries: all, byClicks, byLinks, skipped, sources };
}

export function buildInventory(agg, existingRows = []) {
  const prev = new Map(existingRows.map((r) => [r.old_path, r]));
  const sorted = [...agg.entries].sort((a, b) => (a.clickRank ?? 1e9) - (b.clickRank ?? 1e9) || (a.linkRank ?? 1e9) - (b.linkRank ?? 1e9));
  const out = sorted.map((e) => {
    const old = prev.get(e.path) ?? {};
    const row = {
      old_path: e.path,
      historical_gsc_clicks: e.clicks ?? "", // pusty = brak danych (N/A), nie 0
      backlink_priority: e.sites ?? e.links ?? "",
      link_priority_rank: e.linkRank ?? "",
      click_rank: e.clickRank ?? "",
      data_source: `gsc_export:${[...e.files].join("|")}`,
      exported_at: e.exportedAt,
    };
    for (const c of HUMAN_COLS) row[c] = old[c] ?? "";
    if (!row.status) row.status = "draft";
    if (!row.content_rights_verified) row.content_rights_verified = "unknown";
    return row;
  });
  // Wiersze dodane ręcznie, których nie ma w eksporcie, zostają.
  for (const r of existingRows) if (!agg.entries.some((e) => e.path === r.old_path)) out.push(r);
  return out;
}

export function inventoryToCsv(rows) {
  return [INVENTORY_HEADER.join(","), ...rows.map((r) => INVENTORY_HEADER.map((h) => esc(r[h])).join(","))].join("\n") + "\n";
}

export function readInventory(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const h = rows[0];
  return rows.slice(1).map((r) => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ""])));
}

export function renderReport(agg, rows, now = new Date()) {
  const top = (list, n, fmt) => list.slice(0, n).map((e, i) => `| ${i + 1} | \`${e.path}\` | ${fmt(e)} |`).join("\n") || "| — | brak danych | — |";
  const topClicks = agg.byClicks.slice(0, 100), topLinks = agg.byLinks.slice(0, 100);
  const union = new Set([...topClicks, ...topLinks].map((e) => e.path));
  return `# TOP 100 historycznych URL — raport importu GSC

Wygenerowano: ${now.toISOString().slice(0, 10)} · źródło: eksporty GSC w \`imports/gsc/\` (agregaty; zapytania NIE były czytane).
**Status:** wszystkie wiersze \`draft\` — żadna decyzja 200/301/404/410 nie została podjęta automatycznie. Nic nie jest wdrożone na zoo24.pl.

## Pliki
${agg.sources.map((s) => `- ${s.file}: ${s.kind}${s.rows !== undefined ? ` (${s.rows} wierszy)` : ""}`).join("\n") || "- brak plików"}

Pominięte wiersze: obca domena ${agg.skipped.foreignHost}, niepoprawny URL ${agg.skipped.invalid}. Uwaga: interfejs GSC eksportuje maks. ~1000 wierszy na tabelę; pełniejsze dane wymagają API (osobna zgoda).

## Podsumowanie
- URL w inwentarzu: ${rows.length}
- z kliknięciami: ${agg.byClicks.length} · z linkami zewnętrznymi: ${agg.byLinks.length}
- **kolejka ręcznego przeglądu P0 (TOP 100 klików ∪ TOP 100 linków, deduplikacja): ${union.size}**
- kolejka 101–500 wg kliknięć: ${Math.max(0, Math.min(agg.byClicks.length, 500) - 100)}

Kliknięcia z różnych plików/okresów nie są sumowane (przyjęto maksimum per URL). To dane historyczne z okna GSC — nie bieżący baseline 28 dni.

## TOP 100 wg kliknięć
| # | URL | kliknięcia |
|---|---|---|
${top(topClicks, 100, (e) => e.clicks)}

## TOP 100 wg linków zewnętrznych (domeny linkujące, potem linki)
| # | URL | domeny / linki |
|---|---|---|
${top(topLinks, 100, (e) => `${e.sites ?? "N/A"} / ${e.links ?? "N/A"}`)}

## Następny krok
\`zoo24-seo\` przypisuje segment A–E i proponowaną akcję dla kolejki P0; każda para wymaga akceptacji człowieka i walidacji planerem (R1–R12) w \`/admin/seo\`.
`;
}

async function main() {
  const root = process.cwd();
  const dir = path.join(root, "imports", "gsc");
  if (!fs.existsSync(dir)) { console.error("Brak folderu imports/gsc/."); process.exit(1); }
  const names = fs.readdirSync(dir);
  const zips = names.filter((n) => /\.zip$/i.test(n));
  if (zips.length) console.warn(`Znaleziono ZIP (${zips.join(", ")}) — rozpakuj je do imports/gsc/ (np. Expand-Archive) i uruchom ponownie.`);
  const files = names.filter((n) => /\.csv$/i.test(n)).map((n) => {
    const p = path.join(dir, n);
    return { name: n, text: fs.readFileSync(p, "utf8"), exportedAt: fs.statSync(p).mtime.toISOString().slice(0, 10) };
  });
  if (!files.length) { console.error("Brak plików CSV w imports/gsc/ — patrz docs/owner/decision-1-rights-and-access.md."); process.exit(1); }
  const agg = aggregate(files);
  const invPath = path.join(root, "docs", "audits", "old-url-inventory.csv");
  const existing = fs.existsSync(invPath) ? readInventory(fs.readFileSync(invPath, "utf8")) : [];
  const rows = buildInventory(agg, existing);
  fs.writeFileSync(invPath, inventoryToCsv(rows), "utf8");
  fs.writeFileSync(path.join(root, "docs", "audits", "top100-report.md"), renderReport(agg, rows), "utf8");
  console.log(`Import OK: ${rows.length} URL, z kliknięciami ${agg.byClicks.length}, z linkami ${agg.byLinks.length}. Zapisano docs/audits/old-url-inventory.csv i top100-report.md`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
