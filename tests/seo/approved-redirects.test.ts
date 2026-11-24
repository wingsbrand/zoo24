// D-05: 16 zatwierdzonych 301 ze starych adresów zoo24.pl — każdy przechodzi walidację R1–R12 na stanie produkcyjnym.
import { describe, expect, it } from "vitest";
import { buildSeedState, loadContentArticles } from "@/lib/demo/seed";
import { syncState } from "@/lib/store/sync";
import { buildPageRegistry, createLegacyResolver } from "@/lib/seo";
import { loadApprovedRedirects } from "@/lib/seo/approved-redirects";

function prodState() {
  const s = buildSeedState({ production: true });
  syncState(s, { production: true });
  // Opublikowane jak na produkcji: materiały z aktualną akceptacją redaktora-AI.
  const approved = new Set(loadContentArticles().filter((a) => a.editorialDecision?.decision === "approved").map((a) => a.slug));
  for (const a of s.articles) if (approved.has(a.slug)) { a.status = "published"; a.publishedAt = "2026-11-23T01:45:00.000Z"; }
  return s;
}

describe("zatwierdzone przekierowania 301 (D-05)", () => {
  const rows = loadApprovedRedirects();
  it("16 wpisów, wszystkie zatwierdzone, bez celu na homepage poza aliasami strony głównej (segment A)", () => {
    expect(rows).toHaveLength(16);
    expect(rows.every((r) => r.status === "approved" && r.proposedAction === "redirect_301" && r.reviewer && r.approvedAt)).toBe(true);
    expect(rows.filter((r) => r.targetPath === "/").every((r) => r.segment === "A")).toBe(true);
  });

  it("na stanie produkcyjnym: mapa nie jest zablokowana, każdy stary adres => 301 do celu", () => {
    const s = prodState();
    expect(s.legacyUrls).toHaveLength(16);
    const { resolve, validation } = createLegacyResolver(s.legacyUrls, buildPageRegistry(s), { requireUnblocked: true });
    expect(validation.blocked).toBe(false);
    for (const r of rows) {
      const res = resolve(r.oldPath);
      expect(res, `${r.oldPath} ${res.reason}`).toMatchObject({ status: 301, location: r.targetPath });
    }
    expect(resolve("/blog/nieznany-wpis-n999").status).toBe(404);
  });

  it("synchronizacja jest idempotentna (także po przestawieniu kluczy jak w Postgres jsonb)", () => {
    const s = prodState();
    s.legacyUrls = s.legacyUrls.map((r) => Object.fromEntries(Object.entries(r).reverse()) as typeof r);
    expect(syncState(s, { production: true })).toBe(false);
  });
});
