// Import historycznych stron docelowych ruchu organicznego z GA4 (docs/audits/ga4-organic-landing-top100.csv,
// pobrane przez Windsor.ai, tylko agregaty) -> docs/audits/old-url-inventory.csv + docs/audits/top100-ga4-report.md.
// Klasyfikacja typu strony i PROPOZYCJA segmentu wynikają wyłącznie ze struktury URL; decyzje 200/301/404/410
// pozostają puste (status draft) — podejmuje je człowiek.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inventoryToCsv, parseCsv, readInventory, toInt } from "./import-gsc.mjs";

const ACCOUNT = /^\/(koszyk|logowanie|historia-zamowien|sledzenie-zamowien-gosci|potwierdzenie-zamowienia|jolisearch|index\.php|promocje|moje-konto|zamowienie)(\/|$)/;
const PROMO = /^\/(content\/\d+-zookazje|\d+-totalna-wyprzedaz)/;
// Tematy zdrowotne: wymagają recenzji lekarza weterynarii albo wykluczenia z MVP (MASTER_PLAN §10, SEO_SOCIAL §3.2).
export const HEALTH = /(choroba|nosowka|babeszjoza|borelioza|alergia|zapalenie|lamblia|gardioza|giardioza|grypa|objawy|leczeni|kleszcz|preparat|odrobacz|oleje|olej-z-lososia|kwasy-tluszczowe|oznaki-choroby|odpornosc|biegunk|pasozyt)/;

export function pageType(p) {
  if (p === "/") return "home";
  if (p === "/kontakt") return "static";
  if (ACCOUNT.test(p)) return "account_cart_search";
  if (PROMO.test(p)) return "promo";
  if (p.startsWith("/blog/")) return "blog";
  if (p.startsWith("/brand/")) return "brand";
  if (/\.html$/.test(p)) return "product";
  if (/^\/\d+-[a-z0-9-]+$/.test(p)) return "category";
  return "other";
}

/** Propozycja segmentu (A–E) — do potwierdzenia przez zoo24-seo/człowieka. */
export function proposeSegment(p) {
  const t = pageType(p);
  if (t === "home" || t === "static") return "A";
  if (t === "blog") return "B";
  if (t === "brand" || t === "category" || t === "product") return "C";
  if (t === "account_cart_search" || t === "promo") return "E";
  return "";
}

export function intentNote(p) {
  const t = pageType(p);
  if (t === "blog") return HEALTH.test(p) ? "informacyjna-ZDROWIE: recenzja weterynarza albo 404" : "informacyjna";
  if (t === "brand" || t === "category" || t === "product") return "zakupowa (produkt/marka) — poradnik/porównanie tylko przy realnej wartości, inaczej 404/410";
  if (t === "account_cart_search") return "funkcja sklepu — brak odpowiednika";
  if (t === "promo") return "promocja sklepu — brak odpowiednika";
  return "";
}

export function mergeGa4(landingRows, existing, exportedAt) {
  const byPath = new Map(existing.map((r) => [r.old_path, { ...r }]));
  landingRows.forEach((l, i) => {
    const r = byPath.get(l.path) ?? { old_path: l.path, status: "draft", content_rights_verified: "unknown" };
    r.historical_ga4_organic_sessions = l.sessions;
    r.ga4_session_rank = i + 1;
    if (!r.old_page_type) r.old_page_type = pageType(l.path);
    if (!r.segment) r.segment = proposeSegment(l.path);
    if (!r.search_intent) r.search_intent = intentNote(l.path);
    if (!r.status) r.status = "draft";
    if (!r.content_rights_verified) r.content_rights_verified = pageType(l.path) === "blog" ? "no" : "unknown";
    const src = "ga4:301981165 via windsor.ai (organic landing, 2022-02..2025-02)";
    r.data_source = r.data_source && !r.data_source.includes("ga4:") ? `${r.data_source}|${src}` : src;
    if (!r.exported_at) r.exported_at = exportedAt;
    byPath.set(l.path, r);
  });
  return [...byPath.values()].sort((a, b) => (toInt(b.historical_ga4_organic_sessions) ?? -1) - (toInt(a.historical_ga4_organic_sessions) ?? -1));
}

export function renderGa4Report(landingRows, monthly) {
  const sum = (f) => landingRows.filter(f).reduce((a, r) => a + r.sessions, 0);
  const total = sum(() => true);
  const by = (t) => sum((r) => pageType(r.path) === t);
  const health = landingRows.filter((r) => pageType(r.path) === "blog" && HEALTH.test(r.path));
  const peakOrg = monthly.reduce((m, r) => (r.org > m.org ? r : m), { org: -1 });
  const peakTot = monthly.reduce((m, r) => (r.tot > m.tot ? r : m), { tot: -1 });
  const last12 = monthly.filter((r) => r.ym >= "2023-12" && r.ym <= "2024-11");
  const avg12 = Math.round(last12.reduce((a, r) => a + r.org, 0) / Math.max(1, last12.length));
  const monthsOver100k = monthly.filter((r) => r.tot >= 100000).map((r) => r.ym);
  const pct = (n) => `${Math.round((n / total) * 100)}%`;
  const row = (r, i) => `| ${i + 1} | \`${r.path}\` | ${r.sessions} | ${pageType(r.path)} | ${proposeSegment(r.path)} | ${intentNote(r.path)} |`;
  return `# TOP 100 historycznych URL wg ruchu organicznego (GA4) — F0

Źródło: GA4 \`zoo24.pl - GA4\` (property 301981165) przez Windsor.ai, okres **2022-02 – 2025-02**, kanał *Organic Search*, metryka: sesje rozpoczęte na stronie docelowej (agregaty, bez danych osobowych). Pobrano 2026-11-22.
To nie są kliknięcia GSC (brak dostępu do GSC). Sesje z „(not set)” i pustą stroną docelową (łącznie ok. 147 tys.) pominięto — lista zaniża realny udział stron.
**Wszystkie wiersze w inwentarzu mają status \`draft\`.** Typ strony i segment to propozycja z samej struktury URL; decyzje 200/301/404/410 podejmuje człowiek.

## Wiarygodność „100k+ wejść organicznych/mies.”
- GA4 (od 02.2022): **szczyt ruchu organicznego ${peakOrg.org.toLocaleString("pl-PL")} sesji (${peakOrg.ym})**; średnia z ostatnich 12 pełnych miesięcy przed zamknięciem (12.2023–11.2024): **${avg12.toLocaleString("pl-PL")} sesji/mies.**
- Ruch **łączny** (wszystkie kanały, głównie płatne) przekraczał 100 tys. sesji w ${monthsOver100k.length} miesiącach (${monthsOver100k.join(", ")}); szczyt ${peakTot.tot.toLocaleString("pl-PL")} (${peakTot.ym}).
- Wniosek: w okresie GA4 deklaracja 100k+ odpowiada ruchowi łącznemu, nie organicznemu. Okres sprzed 02.2022 (Universal Analytics) — **niezweryfikowany**. Benchmark organiczny do planowania: rząd **25–34 tys. sesji/mies.** (historyczny, nie cel).
- Zbieranie danych skończyło się w 12.2024 (81 sesji), od 03.2025 brak sesji. **Bieżące 28 dni (2026-10-23 – 2026-11-19): 0 sesji** — źródło podłączone, serwis nie działa / brak tagu.

## Struktura TOP 100 (suma ${total.toLocaleString("pl-PL")} sesji organicznych)
| typ | sesje | udział |
|---|---|---|
| blog (poradniki) | ${by("blog").toLocaleString("pl-PL")} | ${pct(by("blog"))} |
| kategorie / marki / produkty | ${(by("category") + by("brand") + by("product")).toLocaleString("pl-PL")} | ${pct(by("category") + by("brand") + by("product"))} |
| strona główna / kontakt | ${(by("home") + by("static")).toLocaleString("pl-PL")} | ${pct(by("home") + by("static"))} |
| konto / koszyk / wyszukiwarka | ${by("account_cart_search").toLocaleString("pl-PL")} | ${pct(by("account_cart_search"))} |

**Najważniejsze:** ruch organiczny niosły głównie poradniki blogowe (rasy psów i kotów, zachowanie, opieka) — to dobra wiadomość dla modelu „poradniki + katalog”, bo intencja jest informacyjna, nie zakupowa. ${health.length} z artykułów TOP 100 dotyczy zdrowia (choroby, pasożyty, preparaty) — wymagają recenzji lekarza weterynarii albo pozostaną 404.

## Rekomendacje do przeglądu (nie wdrożone)
1. **Blog, tematy niezdrowotne** (rasy, zachowanie, opieka): napisać **nowe, autorskie** artykuły i opublikować pod **tym samym adresem** (200) — stare treści utracono, nic nie kopiujemy z archiwów bez praw. Kolejność wg sesji.
2. **Blog, zdrowie:** decyzja właściciela — recenzent weterynaryjny (koszt) albo 404 do czasu recenzji.
3. **Kategorie / marki / produkty:** domyślnie 404/410; wyjątki tylko tam, gdzie powstanie autentyczny poradnik zakupowy o tej samej intencji (np. „jak wybrać legowisko dla psa”) — 301 po akceptacji, bez przekierowań na stronę główną.
4. **Konto, koszyk, wyszukiwarka, promocje:** 410.
5. Strona główna i \`/kontakt\`: 200 z komunikatem nowej formuły.

## TOP 100
| # | URL | sesje org. | typ | segment (propozycja) | intencja / uwaga |
|---|---|---|---|---|---|
${landingRows.map(row).join("\n")}
`;
}

function main() {
  const root = process.cwd();
  const src = path.join(root, "docs", "audits", "ga4-organic-landing-top100.csv");
  const landing = parseCsv(fs.readFileSync(src, "utf8")).slice(1).map((r) => ({ path: r[0], sessions: toInt(r[1]) ?? 0 }));
  const monthly = parseCsv(fs.readFileSync(path.join(root, "docs", "audits", "ga4-monthly-sessions.csv"), "utf8")).slice(1)
    .map((r) => ({ ym: r[0], tot: toInt(r[1]) ?? 0, org: toInt(r[2]) ?? 0 }));
  const invPath = path.join(root, "docs", "audits", "old-url-inventory.csv");
  const existing = fs.existsSync(invPath) ? readInventory(fs.readFileSync(invPath, "utf8")) : [];
  const rows = mergeGa4(landing, existing, "2026-11-22");
  fs.writeFileSync(invPath, inventoryToCsv(rows), "utf8");
  fs.writeFileSync(path.join(root, "docs", "audits", "top100-ga4-report.md"), renderGa4Report(landing, monthly), "utf8");
  console.log(`Import GA4 OK: ${rows.length} URL w inwentarzu. Zapisano old-url-inventory.csv i top100-ga4-report.md`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
