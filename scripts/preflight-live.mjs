// Kontrola gotowości do startu na zoo24.pl (uruchamiać lokalnie przed zmianą DNS i ZOO24_ENV=production).
// Użycie: node scripts/preflight-live.mjs [--url https://zoo24.vercel.app]
// Wynik: lista BLOCKER / WARN / OK; kod wyjścia 1, gdy jest jakikolwiek BLOCKER.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const results = [];
const add = (level, msg) => results.push({ level, msg });

// 1. Dane operatora (lib/legal/operator.ts)
const op = read("lib/legal/operator.ts");
const field = (name) => {
  const m = op.match(new RegExp(`${name}:\\s*(null|"[^"]*")`));
  return m && m[1] !== "null" ? m[1].slice(1, -1) : null;
};
for (const f of ["legalName", "registeredAddress", "contactEmail", "nip"]) {
  if (field(f)) add("OK", `operator.${f} uzupełnione`);
  else add("BLOCKER", `operator.${f} puste (lib/legal/operator.ts) — wymóg PKE/RODO`);
}
if (!field("krs")) add("WARN", "operator.krs puste — dla sp. z o.o. art. 206 KSH wymaga na stronie: KRS, sąd rejestrowy, kapitał zakładowy");
if (/LEGAL_EFFECTIVE_DATE[^=]*=\s*null/.test(op)) add("BLOCKER", "LEGAL_EFFECTIVE_DATE puste — data wejścia w życie regulaminu i polityki");
else add("OK", "LEGAL_EFFECTIVE_DATE ustawione");

// 2. Placeholdery <Todo> w publicznych stronach (dozwolone tylko warunkowe dla pól operatora)
const pages = ["app/regulamin/page.tsx", "app/polityka-prywatnosci/page.tsx", "app/o-nas/page.tsx", "app/kontakt/page.tsx", "app/dla-firm/page.tsx", "app/zasady-redakcyjne/page.tsx", "app/reklama-i-wspolprace/page.tsx"];
for (const p of pages) {
  if (!fs.existsSync(path.join(root, p))) continue;
  // Placeholder warunkowy (pokazywany tylko, gdy pole OPERATOR/LEGAL_EFFECTIVE_DATE jest puste) nie jest liczony —
  // jego brak sprawdza sekcja 1. Liczone są tylko placeholdery bezwarunkowe.
  const lines = read(p).split("\n");
  const guarded = (i) => lines.slice(Math.max(0, i - 3), i + 1).some((l) => /OPERATOR\.|LEGAL_EFFECTIVE_DATE/.test(l));
  const todos = lines.flatMap((l, i) => guarded(i) ? [] : [...l.matchAll(/<Todo>([^<]*)<\/Todo>/g)].map((m) => m[1].trim()));
  if (todos.length) add("BLOCKER", `${p}: ${todos.length} × <Todo> (${todos.slice(0, 3).join(" | ")}${todos.length > 3 ? " …" : ""})`);
  else add("OK", `${p}: brak placeholderów`);
}

// 3. Kluczowe artykuły pod dawnymi URL (TOP GA4)
for (const f of fs.readdirSync(path.join(root, "content/blog")).filter((x) => x.endsWith(".json"))) {
  const a = JSON.parse(read(`content/blog/${f}`));
  if (a.status === "published") add("OK", `content/blog/${f}: published (reviewedBy=${a.reviewedBy ?? "?"})`);
  else add("WARN", `content/blog/${f}: status=${a.status} — w produkcji 404 pod dawnym adresem /blog/${a.slug}`);
}

// 4. Realne firmy
const firms = fs.readdirSync(path.join(root, "content/businesses")).filter((x) => x.endsWith(".json"))
  .flatMap((f) => JSON.parse(read(`content/businesses/${f}`)).businesses ?? JSON.parse(read(`content/businesses/${f}`)));
const firmList = Array.isArray(firms) ? firms : [];
const unverified = firmList.filter((b) => !b.verifiedByHuman).length;
add(firmList.length ? "OK" : "BLOCKER", `realne firmy w repo: ${firmList.length}`);
if (unverified) add("WARN", `${unverified} firm bez potwierdzenia redakcji (verifiedByHuman=false) — wyświetlane z dopiskiem „oczekuje na potwierdzenie”`);

// 5. Konfiguracja indeksacji
const nc = read("next.config.ts");
add(/missing:\s*\[\{\s*type:\s*"host"/.test(nc) ? "OK" : "BLOCKER", "noindex dla hostów innych niż kanoniczny (next.config.ts)");
const vj = JSON.parse(read("vercel.json"));
add(vj.git?.deploymentEnabled?.["ops/**"] === false ? "OK" : "WARN", "vercel.json: brak wdrożeń dla ops/**");

// 6. Opcjonalnie: sprawdzenie działającego adresu (po ustawieniu ZOO24_ENV=production)
const urlArg = process.argv.indexOf("--url");
if (urlArg > -1) {
  const base = process.argv[urlArg + 1];
  try {
    const home = await fetch(base, { redirect: "manual" });
    const html = await home.text();
    add(home.status === 200 ? "OK" : "BLOCKER", `${base} → ${home.status}`);
    add(/DEMO/.test(html) ? "BLOCKER" : "OK", `strona główna ${/DEMO/.test(html) ? "zawiera" : "nie zawiera"} „DEMO”`);
    add(/google-site-verification/.test(html) ? "OK" : "WARN", "meta google-site-verification");
    add(/ahrefs-site-verification/.test(html) ? "OK" : "WARN", "meta ahrefs-site-verification");
    const sm = await fetch(new URL("/sitemap.xml", base));
    add(sm.status === 200 ? "OK" : "WARN", `sitemap.xml → ${sm.status}`);
  } catch (e) {
    add("BLOCKER", `nie można pobrać ${base}: ${e.message}`);
  }
}

const order = { BLOCKER: 0, WARN: 1, OK: 2 };
results.sort((a, b) => order[a.level] - order[b.level]);
for (const r of results) console.log(`${r.level.padEnd(7)} ${r.msg}`);
const blockers = results.filter((r) => r.level === "BLOCKER").length;
console.log(`\nPREFLIGHT: ${blockers ? `NIE GOTOWE (${blockers} blokerów)` : "GOTOWE"}`);
process.exit(blockers ? 1 : 0);
