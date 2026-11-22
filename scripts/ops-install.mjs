// Idempotentna instalacja pakietu zoo24-ops (agenci + sekcja CLAUDE.md).
// Użycie: node scripts/ops-install.mjs [katalog-repo]  (domyślnie bieżący)
// - kopiuje tylko 6 definicji zoo24-ops-*.md; istniejących zoo24-* nie dotyka;
// - plik o tej samej nazwie i innej treści => CONFLICT (bez nadpisania, z raportem);
// - sekcję z CLAUDE_OPS_APPENDIX.md dopisuje raz, między znacznikami; drugi przebieg nic nie zmienia.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

export const BEGIN = "<!-- zoo24-ops:appendix:begin v1.0 -->";
export const END = "<!-- zoo24-ops:appendix:end -->";

const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");

export function installOps(root) {
  const pkg = path.join(root, "zoo24-ops");
  const srcAgents = path.join(pkg, ".claude", "agents");
  const dstAgents = path.join(root, ".claude", "agents");
  fs.mkdirSync(dstAgents, { recursive: true });
  const report = { copied: [], identical: [], conflicts: [], preserved: [], claudeMd: "unchanged" };

  for (const f of fs.readdirSync(dstAgents)) if (!f.startsWith("zoo24-ops-")) report.preserved.push(f);
  for (const f of fs.readdirSync(srcAgents).filter((x) => /^zoo24-ops-[a-z]+\.md$/.test(x)).sort()) {
    const src = fs.readFileSync(path.join(srcAgents, f));
    const dst = path.join(dstAgents, f);
    if (!fs.existsSync(dst)) { fs.writeFileSync(dst, src); report.copied.push(f); continue; }
    const cur = fs.readFileSync(dst);
    if (sha(cur) === sha(src)) report.identical.push(f);
    else report.conflicts.push({ file: f, installed: sha(cur), package: sha(src) });
  }

  const claude = path.join(root, "CLAUDE.md");
  const appendix = fs.readFileSync(path.join(pkg, "CLAUDE_OPS_APPENDIX.md"), "utf8").trim();
  const block = [
    BEGIN,
    appendix,
    "",
    "Instalacja i stan: `ops/runtime/INSTALL_STATUS.md`, odbiór: `ops/runtime/QA_REPORT.md`, pakiet aktywacji: `ops/runtime/ACTIVATION_PACKAGE.md`. Do czasu zatwierdzenia `ops/config/activation.json` (status INACTIVE) obowiązuje tryb design/shadow i wszystkie zasady powyżej (Mode 0).",
    END,
  ].join("\n");
  const existing = fs.existsSync(claude) ? fs.readFileSync(claude, "utf8") : null;
  if (existing === null) {
    fs.writeFileSync(claude, `# ZOO24\n\n${block}\n`, "utf8");
    report.claudeMd = "created";
  } else if (!existing.includes(BEGIN)) {
    fs.writeFileSync(claude, `${existing.replace(/\s*$/, "")}\n\n${block}\n`, "utf8");
    report.claudeMd = "appended";
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] ?? process.cwd());
  const r = installOps(root);
  console.log(JSON.stringify(r, null, 2));
  if (r.conflicts.length) process.exitCode = 2;
}
