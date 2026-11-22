// Prosty skan repo pod kątem sekretów/tokenów (P0: brak tokenów w kodzie i logach).
// Pomija node_modules, .next, .git. Skanuje też lokalny stan .data/ (audit log). Wartości testowe zawierające FAKE/MOCK/TEST są dozwolone.
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SKIP = new Set(["node_modules", ".next", ".git", "coverage"]); // .data/ (stan, audyt) JEST skanowany
const RULES = [
  ["Meta access token", /\bEAA[A-Za-z0-9]{20,}\b/g],
  ["Google OAuth token", /\bya29\.[A-Za-z0-9\-_]{20,}/g],
  ["Google API key", /\bAIza[0-9A-Za-z\-_]{35}\b/g],
  ["Private key", /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g],
  ["Stripe live key", /\b(sk|rk)_live_[0-9a-zA-Z]{20,}/g],
  ["JWT", /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g],
  ["Assigned secret", /\b(META_APP_SECRET|META_PAGE_ACCESS_TOKEN|SUPABASE_SERVICE_ROLE_KEY|GSC_SERVICE_ACCOUNT_JSON|CRON_SECRET)[ \t]*=[ \t]*[^\s#]+/g],
];
const ALLOW = /FAKE|MOCK|TEST|EXAMPLE/i;

const hits = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(ts|tsx|js|mjs|json|md|csv|sql|env|example|txt|yml|yaml|log)$/i.test(e.name) || e.name.startsWith(".env")) {
      const text = fs.readFileSync(p, "utf8");
      for (const [name, re] of RULES) for (const m of text.matchAll(re)) if (!ALLOW.test(m[0])) hits.push(`${path.relative(ROOT, p)}: ${name}: ${m[0].slice(0, 12)}…`);
    }
  }
}
walk(ROOT);
const envFiles = fs.readdirSync(ROOT).filter((f) => f.startsWith(".env") && f !== ".env.example");
if (envFiles.length) hits.push(`Pliki .env w repo: ${envFiles.join(", ")} (muszą być w .gitignore i poza commitami)`);
if (hits.length) {
  console.error(`SECRET SCAN: FAIL (${hits.length})\n` + hits.join("\n"));
  process.exit(1);
}
console.log("SECRET SCAN: PASS — brak wykrytych sekretów/tokenów.");
