// Publikacja 3 zaakceptowanych artykułów przez gateway: shadow = brak zapisu; live = dokładna wersja, read-back, bez duplikatu.
import { describe, expect, it } from "vitest";
import { tempStore } from "../helpers";
import { publishApprovedArticles } from "@/lib/ops/cms-publish";
import { articleContentHash } from "@/lib/ops/article-review";
import { loadPolicy, policyHash, type ActivationPolicy } from "@/lib/ops/policy";

const NOW = new Date("2026-11-23T10:00:00Z");
const SLUGS = ["cane-corso-n63", "kot-brytyjski-n66", "maltanczyk-n77"];

function livePolicy(): ActivationPolicy {
  const p = structuredClone(loadPolicy()!);
  p.mode = "live_scoped";
  p.owner_approval = { approved: true, approved_by: "owner-test", approved_at: NOW.toISOString(), policy_hash: null };
  p.owner_approval.policy_hash = policyHash(p);
  return p;
}

describe("cms.publish_approved_version — artykuły TOP 3", () => {
  it("polityka z repo (shadow do live): dry_run, w bazie nadal needs_review", async () => {
    const store = tempStore();
    const r = await publishApprovedArticles(store, loadPolicy(), { now: NOW, fetchFn: async () => ({ status: 200 }) });
    expect(SLUGS.every((s) => r.some((x) => x.slug === s))).toBe(true);
    expect(r.every((x) => x.outcome === "dry_run")).toBe(true);
    expect(store.read().articles.filter((a) => SLUGS.includes(a.slug)).every((a) => a.status === "needs_review")).toBe(true);
  });

  it("live_scoped: publikuje dokładną zatwierdzoną wersję, read-back 200 => executed; drugi przebieg nic nie dubluje", async () => {
    const store = tempStore();
    await store.transact((s) => { const a = s.articles.find((x) => x.slug === "cane-corso-n63")!; a.body = ["stara wersja"]; }); // baza ze starą treścią
    let published = new Set<string>();
    const fetchFn = async (u: string) => ({ status: [...published].some((s) => u.endsWith(`/${s}`)) ? 200 : 404 });
    const policy = livePolicy();
    const orig = store.transact.bind(store);
    store.transact = (async (fn: never) => { const r = await orig(fn); published = new Set(store.read().articles.filter((a) => a.status === "published").map((a) => a.slug)); return r; }) as typeof store.transact;
    const r1 = await publishApprovedArticles(store, policy, { now: NOW, fetchFn });
    expect(r1.filter((x) => x.outcome !== "needs_human").every((x) => x.outcome === "executed" && x.reasons.includes("VERIFIED_READBACK"))).toBe(true);
    expect(r1.filter((x) => SLUGS.includes(x.slug)).every((x) => x.url?.startsWith("https://zoo24.pl/blog/"))).toBe(true);
    const { loadContentArticles } = await import("@/lib/demo/seed");
    const { articleHref } = await import("@/lib/content/editorial");
    const href = new Map(loadContentArticles().map((a) => [a.slug, articleHref(a)]));
    expect(r1.filter((x) => x.url).every((x) => x.url === `https://zoo24.pl${href.get(x.slug)}`)).toBe(true); // /blog/* i /poradniki/* wg basePath
    const s = store.read();
    for (const slug of SLUGS) {
      const a = s.articles.find((x) => x.slug === slug)!;
      expect(a.status).toBe("published");
      expect(articleContentHash(a)).toBe(a.editorialDecision!.contentHash);
      expect(a.reviewedBy).toBe("claude-ai-editor");
    }
    const r2 = await publishApprovedArticles(store, policy, { now: NOW, fetchFn });
    expect(r2.filter((x) => x.outcome !== "needs_human").every((x) => x.outcome === "already_done")).toBe(true);
    expect(s.audit.filter((e) => e.action === "article_published" && e.actor === "gateway:cms" && SLUGS.includes(e.entityId!))).toHaveLength(3);
  });

  it("live, ale strona nie odpowiada 200 (DNS/HTTPS w trakcie) => zapis w bazie i READBACK_PENDING, bez ponownego zapisu", async () => {
    const store = tempStore();
    const r = await publishApprovedArticles(store, livePolicy(), { now: NOW, fetchFn: async () => { throw new Error("ENOTFOUND"); } });
    expect(r.every((x) => x.outcome === "executed" && x.reasons.includes("READBACK_PENDING"))).toBe(true);
    const again = await publishApprovedArticles(store, livePolicy(), { now: NOW, fetchFn: async () => ({ status: 200 }) });
    expect(again.every((x) => x.outcome === "already_done")).toBe(true);
  });

  it("V3: materiał z klasą ryzyka (np. dobrostan/żywienie) z akceptacją AI => needs_human HUMAN_REVIEW_REQUIRED_FOR_RISK, zero zapisu", async () => {
    const store = tempStore();
    const { loadContentArticles } = await import("@/lib/demo/seed");
    const { requiredReviewRole } = await import("@/lib/content/editorial");
    const { riskBlocked } = await import("@/lib/ops/cms-publish");
    const base = loadContentArticles().find((a) => a.slug === "kot-brytyjski-n66")!;
    expect(requiredReviewRole(base)).toBe("editor"); // artykuły o rasach: klasa standard
    const risky = { ...base, risk: "welfare" } as typeof base;
    expect(requiredReviewRole(risky)).not.toBe("editor");
    expect(riskBlocked(risky)).toBe(true);
    expect(riskBlocked({ ...risky, editorialDecision: { ...risky.editorialDecision!, byKind: "human" } })).toBe(false);
    const r = await publishApprovedArticles(store, livePolicy(), { now: NOW, fetchFn: async () => ({ status: 200 }), articles: [risky] });
    expect(r).toEqual([expect.objectContaining({ slug: "kot-brytyjski-n66", outcome: "needs_human", reasons: expect.arrayContaining(["HUMAN_REVIEW_REQUIRED_FOR_RISK"]) })]);
    expect(store.read().articles.find((a) => a.slug === "kot-brytyjski-n66")?.status).toBe("needs_review");
  });

  it("artykuł edytowany po akceptacji nie jest publikowany", async () => {
    const store = tempStore();
    const { loadContentArticles } = await import("@/lib/demo/seed");
    const files = loadContentArticles().map((a) => (a.slug === "maltanczyk-n77" ? { ...a, body: [...a.body, "Dopisek bez review."] } : a));
    const r = await publishApprovedArticles(store, livePolicy(), { now: NOW, fetchFn: async () => ({ status: 200 }), articles: files });
    expect(r.map((x) => x.slug)).not.toContain("maltanczyk-n77");
  });
});
