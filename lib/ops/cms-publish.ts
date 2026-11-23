// Publikacja zaakceptowanych artykułów (rola content) przez gateway: `cms.publish_approved_version`.
// Publikowana jest DOKŁADNIE wersja z repo, której akceptacja (hash) jest aktualna — treść w bazie
// zostaje nadpisana tą wersją. Read-back: publiczny URL na site_origin musi zwrócić 200.
// W design/shadow gateway nie wywołuje executora (dry_run).
import type { Article } from "../types";
import type { Store } from "../store/file-store";
import { loadContentArticles } from "../demo/seed";
import { articleHref, checkArticlePolicy, requiredReviewRole } from "../content/editorial";
import { articleContentHash, isEditorialApprovalCurrent } from "./article-review";
import { executeAction, operationKey, type ActionRequest, type Executor, type GatewayOutcome } from "./gateway";
import { claim, complete, enqueue } from "./registry";
import { effectiveMode, type ActivationPolicy } from "./policy";
import type { OpsJobResult } from "./types";

type FetchFn = (url: string) => Promise<{ status: number }>;

/** Materiał o wpływie na dobrostan/zdrowie/prawo (klasa ryzyka != standard) wymaga recenzji człowieka z rolą — AI nie zatwierdza (V3). */
export function riskBlocked(a: Article): boolean {
  return requiredReviewRole(a) !== "editor" && a.editorialDecision?.byKind !== "human";
}

export class StoreCmsExecutor implements Executor {
  private keyToSlug = new Map<string, string>();
  constructor(private store: Store, private approved: Map<string, Article>, private siteOrigin: string, private fetchFn: FetchFn, private now: Date) {}

  register(key: string, slug: string) { this.keyToSlug.set(key, slug); }

  private url(slug: string) { return `${this.siteOrigin.replace(/\/$/, "")}${articleHref(this.approved.get(slug)!)}`; }

  async execute(_req: ActionRequest, key: string) {
    const slug = this.keyToSlug.get(key)!;
    const file = this.approved.get(slug)!;
    await this.store.transact((s) => {
      if (riskBlocked(file)) throw Object.assign(new Error("HUMAN_REVIEW_REQUIRED_FOR_RISK"), { cls: "permanent", code: "HUMAN_REVIEW_REQUIRED_FOR_RISK" });
      const errors = checkArticlePolicy(file);
      if (errors.length) throw Object.assign(new Error(`POLICY:${errors.join(",")}`), { cls: "permanent", code: "ARTICLE_POLICY" });
      let a = s.articles.find((x) => x.slug === slug);
      if (!a) { a = { ...file }; s.articles.push(a); }
      Object.assign(a, {
        title: file.title, summary: file.summary, body: file.body, checklist: file.checklist, sources: file.sources,
        authorDisplay: file.authorDisplay, basePath: file.basePath, relatedServicePaths: file.relatedServicePaths, disclosure: file.disclosure,
        editorialDecision: file.editorialDecision, reviewedBy: file.editorialDecision!.by, demo: false,
        status: "published", publishedAt: a.publishedAt ?? this.now.toISOString(), updatedAt: file.updatedAt,
      } satisfies Partial<Article>);
      s.audit.push({ at: this.now.toISOString(), actor: "gateway:cms", entity: "article", entityId: slug, action: "article_published", meta: { operationKey: key, contentHash: articleContentHash(file), reviewedBy: file.editorialDecision!.by } });
    });
    return { externalObjectId: `article:${slug}@${articleContentHash(file).slice(0, 12)}`, url: this.url(slug) };
  }

  /** Stan w bazie + publiczny HTTP 200. Opublikowane w bazie, ale strona jeszcze nie odpowiada 200 => unknown (bez ślepego retry). */
  async lookup(key: string) {
    const slug = this.keyToSlug.get(key);
    if (!slug) return { state: "unknown" as const };
    const file = this.approved.get(slug)!;
    const a = this.store.read().articles.find((x) => x.slug === slug);
    const inDb = !!a && a.status === "published" && articleContentHash(a) === articleContentHash(file);
    if (!inDb) return { state: "absent" as const };
    try {
      const r = await this.fetchFn(this.url(slug));
      return r.status === 200 ? { state: "found" as const, externalObjectId: `article:${slug}@${articleContentHash(file).slice(0, 12)}`, url: this.url(slug) } : { state: "unknown" as const };
    } catch {
      return { state: "unknown" as const };
    }
  }
}

export interface PublishReport { slug: string; outcome: GatewayOutcome["status"]; reasons: string[]; url: string | null }

/** Jeden przebieg: każdy artykuł z repo z aktualną akceptacją i statusem != published w bazie => job + gateway. */
export async function publishApprovedArticles(store: Store, policy: ActivationPolicy | null, opts: { now?: Date; fetchFn?: FetchFn; worker?: string; articles?: Article[] } = {}): Promise<PublishReport[]> {
  const now = opts.now ?? new Date();
  const worker = opts.worker ?? "worker-cms-publish";
  const aiEditor = policy?.review.ai_editor_id ?? null;
  const files = (opts.articles ?? loadContentArticles()).filter((a) => isEditorialApprovalCurrent(a, aiEditor));
  const approved = new Map(files.map((a) => [a.slug, a]));
  const origin = policy?.resources.site_origin ?? "";
  const ex = new StoreCmsExecutor(store, approved, origin, opts.fetchFn ?? (async (u) => ({ status: (await fetch(u, { redirect: "manual" })).status })), now);
  const out: PublishReport[] = [];
  for (const file of files) {
    const hash = articleContentHash(file);
    if (riskBlocked(file)) { out.push({ slug: file.slug, outcome: "needs_human", reasons: ["HUMAN_REVIEW_REQUIRED_FOR_RISK", `ROLE:${requiredReviewRole(file)}`], url: null }); continue; }
    const cur = store.read().articles.find((a) => a.slug === file.slug);
    if (cur?.status === "published" && articleContentHash(cur) === hash) { out.push({ slug: file.slug, outcome: "already_done", reasons: ["ALREADY_PUBLISHED"], url: null }); continue; }
    const dedupeKey = `content:publish:${file.slug}:${hash.slice(0, 16)}`;
    await store.transact((s) => { enqueue(s, { dedupeKey, role: "content", scheduledAtUtc: now.toISOString() }, now); });
    const token = await claim(store, dedupeKey, worker, now);
    if (token === null) { out.push({ slug: file.slug, outcome: "rejected", reasons: ["JOB_LEASED_OR_DONE"], url: null }); continue; }
    const req: ActionRequest = {
      op: "cms.publish_approved_version", role: "content", jobDedupeKey: dedupeKey, fencingToken: token,
      target: { kind: "site_origin", id: origin },
      artifact: { id: `article:${file.slug}`, contentHash: hash, approvedHash: file.editorialDecision!.contentHash, authorId: "zoo24-ops-content", reviewedBy: file.editorialDecision!.by, evidenceIds: [] },
      estimatedCostPln: 0, payload: { slug: file.slug },
    };
    ex.register(operationKey(req), file.slug);
    const o = await executeAction(req, { store, policy, executor: ex, now });
    const result: OpsJobResult = {
      schema_version: "zoo24.ops.job-result.v1", job_id: dedupeKey, role: "content", mode: o.mode, policy_version: policy?.owner_approval.policy_hash ?? null,
      status: o.status === "executed" || o.status === "already_done" ? "done" : o.status === "dry_run" ? "produced" : o.status === "needs_human" ? "needs_human" : o.status === "failed" ? "failed" : "blocked",
      reason: o.reasons.join(","), artifacts: [{ id: `article:${file.slug}`, type: "article", version: hash.slice(0, 12), note: o.status }], checks: [],
      external_actions: [{ op: req.op, outcome: o.status, receipt_id: o.receipt?.operationKey ?? null }], metrics: [], cost: { value: 0, currency: "PLN", status: "measured" },
      next_tasks: o.reasons.includes("READBACK_PENDING") ? ["Sprawdzić publiczny URL (HTTP 200) po propagacji/odświeżeniu"] : [], human_decisions_required: [], finished_at: now.toISOString(),
    };
    await complete(store, dedupeKey, token, result, now);
    out.push({ slug: file.slug, outcome: o.status, reasons: o.reasons, url: o.receipt?.url ?? null });
  }
  return out;
}

export interface ReadbackReport { slug: string; url: string; outcome: "verified" | "still_pending" | "skipped"; reason: string }

/**
 * Zamyka READBACK_PENDING: dla receipts `cms.publish_approved_version` (succeeded, bez verifiedAt) sprawdza,
 * czy artykuł jest w bazie opublikowany w tej samej wersji (hash) i czy publiczny URL na site_origin z polityki
 * zwraca 200. Tylko odczyt HTTP + wpis w rejestrze (verifiedAt, check w job-result, audit) — bez zewnętrznych zapisów.
 * Nie uruchamiać przy starcie modułu (zimny start); przeznaczone dla osobnego endpointu/crona albo skryptu.
 */
export async function verifyPendingReadbacks(store: Store, policy: ActivationPolicy | null, opts: { now?: Date; fetchFn?: FetchFn } = {}): Promise<ReadbackReport[]> {
  const now = opts.now ?? new Date();
  const fetchFn = opts.fetchFn ?? (async (u: string) => ({ status: (await fetch(u, { redirect: "manual" })).status }));
  const s0 = store.read();
  if (effectiveMode(policy, s0.ops.mode) === "paused") return [];
  const origin = (policy?.resources.site_origin ?? "").replace(/\/$/, "");
  const pending = s0.ops.receipts.filter((r) => r.op === "cms.publish_approved_version" && r.status === "succeeded" && !r.verifiedAt && r.url);
  const out: ReadbackReport[] = [];
  const verified: { key: string; job: string; url: string; slug: string }[] = [];
  for (const r of pending) {
    const url = r.url!;
    const slug = r.artifactId.replace(/^article:/, "");
    if (!origin || !url.startsWith(`${origin}/`)) { out.push({ slug, url, outcome: "skipped", reason: "URL_OUTSIDE_SITE_ORIGIN" }); continue; }
    const a = s0.articles.find((x) => x.slug === slug);
    if (!a || a.status !== "published" || articleContentHash(a) !== r.artifactHash) { out.push({ slug, url, outcome: "skipped", reason: "DB_VERSION_MISMATCH" }); continue; }
    let status: number | null = null;
    try { status = (await fetchFn(url)).status; } catch { status = null; }
    if (status !== 200) { out.push({ slug, url, outcome: "still_pending", reason: `HTTP_${status ?? "ERROR"}` }); continue; }
    verified.push({ key: r.operationKey, job: r.jobDedupeKey, url, slug });
    out.push({ slug, url, outcome: "verified", reason: "HTTP_200" });
  }
  if (verified.length) {
    const at = now.toISOString();
    await store.transact((s) => {
      for (const v of verified) {
        const r = s.ops.receipts.find((x) => x.operationKey === v.key && x.status === "succeeded" && !x.verifiedAt);
        if (!r) continue;
        r.verifiedAt = at;
        for (const res of s.ops.results.filter((x) => x.job_id === v.job && (x.reason ?? "").split(",").includes("READBACK_PENDING"))) {
          res.next_tasks = [];
          if (!res.checks.some((c) => c.name === "public_readback_http_200")) res.checks.push({ name: "public_readback_http_200", status: "pass", detail: `${v.url} HTTP 200 (${at})` });
        }
      }
      s.audit.push({ at, actor: "gateway:cms", entity: "ops_receipt", entityId: null, action: "readback_verified", meta: { count: verified.length, slugs: verified.map((v) => v.slug) } });
    });
  }
  return out;
}
