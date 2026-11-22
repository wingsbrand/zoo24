// ADR-013: akceptacja redaktora-AI 3 artykułów TOP 3 GA4 jest związana z hashem treści i nie publikuje ich przed live.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Article } from "@/lib/types";
import { articleContentHash, isEditorialApprovalCurrent } from "@/lib/ops/article-review";
import { checkArticlePolicy } from "@/lib/content/editorial";
import { loadContentArticles } from "@/lib/demo/seed";
import { loadPolicy } from "@/lib/ops/policy";

const SLUGS = ["kot-brytyjski-n66", "cane-corso-n63", "maltanczyk-n77"];
const read = (s: string) => JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "blog", `${s}.json`), "utf8")) as Article;

describe("akceptacja redaktora-AI artykułów TOP 3", () => {
  const ai = loadPolicy()?.review.ai_editor_id ?? null;

  it("każdy artykuł: decyzja approved przez claude-ai-editor (AI), aktualny hash, polityka maszynowa PASS, status nadal needs_review", () => {
    expect(ai).toBe("claude-ai-editor");
    for (const s of SLUGS) {
      const a = read(s);
      expect(a.editorialDecision?.byKind, s).toBe("ai");
      expect(isEditorialApprovalCurrent(a, ai), s).toBe(true);
      expect(checkArticlePolicy(a), s).toEqual([]);
      expect(a.status, s).toBe("needs_review"); // publikacja dopiero po przełączeniu domeny
      expect(a.sources.some((x) => x.url && /fci\.be|fifeweb\.org/.test(x.url)), s).toBe(true); // źródło pierwotne odczytane przez knowledge
    }
  });

  it("twierdzenia niepoparte standardem zostały usunięte", () => {
    const all = SLUGS.map((s) => JSON.stringify(read(s).body)).join(" ");
    for (const bad of ["łatwym w szkoleniu", "pełnymi policzkami", "źle znosi", "jedna z najstarszych", "eleganckiego i zgrabnego"]) expect(all).not.toContain(bad);
  });

  it("C02: zmiana treści po akceptacji unieważnia ją; loader nie publikuje plików", () => {
    const a = read("cane-corso-n63");
    const edited = { ...a, body: [...a.body, "Nowe twierdzenie."] };
    expect(articleContentHash(edited)).not.toBe(a.editorialDecision!.contentHash);
    expect(isEditorialApprovalCurrent(edited, ai)).toBe(false);
    expect(isEditorialApprovalCurrent(a, "inny-redaktor-ai")).toBe(false);
    expect(loadContentArticles().filter((x) => SLUGS.includes(x.slug)).every((x) => x.status === "needs_review" && x.publishedAt === null)).toBe(true);
  });
});
