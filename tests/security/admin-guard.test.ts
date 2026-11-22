import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Regresja (QA przed startem, 2026-11-22): notFound() tylko w layoucie /admin nie zatrzymuje renderu strony —
// dane panelu trafiały do ładunku RSC odpowiedzi 404. Każda strona panelu musi sama wywołać requireAdmin().
function pages(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? pages(p) : e.name === "page.tsx" ? [p] : [];
  });
}

describe("panel /admin — blokada na poziomie każdej strony", () => {
  const list = pages(path.join(process.cwd(), "app", "admin"));
  it("istnieją strony panelu", () => expect(list.length).toBeGreaterThan(0));
  for (const f of list) {
    it(`${path.relative(process.cwd(), f)} wywołuje await requireAdmin() na początku`, () => {
      const src = fs.readFileSync(f, "utf8");
      // pierwsza instrukcja ciała domyślnie eksportowanej funkcji (nawias klamrowy kończący linię sygnatury)
      expect(src).toMatch(/^export default async function \w+\([^\n]*\)[^\n]*\{\r?\n\s*await requireAdmin\(\);/m);
    });
  }
});
