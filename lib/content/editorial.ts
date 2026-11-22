// Kolejka redakcyjna artykułów: draft -> needs_review -> published (+ powrót do draft). Akceptacja tylko przez człowieka.
import type { AppState, Article } from "../types";
import { redact } from "../security/redact";

export const articleHref = (a: Pick<Article, "slug" | "basePath">) => `${a.basePath ?? "/poradniki"}/${a.slug}`;

const HEALTH_PROMISE = /\b(wylecz|leczy|gwarantuj|100% skuteczn|zamiast weterynarza|lek na)/i;

/** Blokady przed publikacją (MASTER_PLAN §6, CLAUDE.md zasada 6). */
export function checkArticlePolicy(a: Article): string[] {
  const e: string[] = [];
  if (!a.sources?.length || a.sources.every((s) => !s.url)) e.push("NO_VERIFIABLE_SOURCE");
  if (a.demo) e.push("DEMO_ARTICLE");
  if (/\[(UZUPE[ŁL]NIA|DO UZUPE[ŁL]NIENIA)/i.test(JSON.stringify(a.body))) e.push("PLACEHOLDER_IN_BODY");
  if (HEALTH_PROMISE.test(a.body.join(" "))) e.push("HEALTH_PROMISE");
  if (!a.title.trim() || a.body.length < 3) e.push("TOO_SHORT");
  return e;
}

export class EditorialError extends Error {
  constructor(public code: string, public details: string[] = []) {
    super(details.length ? `${code}: ${details.join(", ")}` : code);
  }
}

function audit(state: AppState, actor: string, action: string, slug: string, meta: Record<string, unknown> = {}) {
  state.audit.push({ at: new Date().toISOString(), actor, entity: "article", entityId: slug, action, meta: redact(meta) });
}

export function approveArticle(state: AppState, slug: string, actor: string, now = new Date()): Article {
  const a = state.articles.find((x) => x.slug === slug);
  if (!a) throw new EditorialError("ARTICLE_NOT_FOUND", [slug]);
  if (a.status !== "needs_review") throw new EditorialError("APPROVE_REQUIRES_NEEDS_REVIEW", [a.status]);
  const errors = checkArticlePolicy(a);
  if (errors.length) { audit(state, actor, "approve_blocked", slug, { errors }); throw new EditorialError("POLICY_BLOCKED", errors); }
  a.status = "published";
  a.reviewedBy = actor;
  a.publishedAt = a.publishedAt ?? now.toISOString();
  a.updatedAt = now.toISOString();
  audit(state, actor, "article_published", slug);
  return a;
}

export function returnToDraft(state: AppState, slug: string, actor: string, reason: string): Article {
  const a = state.articles.find((x) => x.slug === slug);
  if (!a) throw new EditorialError("ARTICLE_NOT_FOUND", [slug]);
  a.status = "draft";
  audit(state, actor, "article_to_draft", slug, { reason });
  return a;
}

export function submitArticle(state: AppState, slug: string, actor: string): Article {
  const a = state.articles.find((x) => x.slug === slug);
  if (!a) throw new EditorialError("ARTICLE_NOT_FOUND", [slug]);
  if (a.status !== "draft") throw new EditorialError("SUBMIT_REQUIRES_DRAFT", [a.status]);
  a.status = "needs_review";
  audit(state, actor, "article_submitted", slug);
  return a;
}
