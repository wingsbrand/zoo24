// Kolejka redakcyjna artykułów: draft -> needs_review -> published (+ powrót do draft, + korekta opublikowanej wersji).
// Portal V3: zatwierdzenie zależy od klasy ryzyka (lib/taxonomy/animals.ts):
//  - standard: redaktor (człowiek albo jawnie redaktor-AI, ADR-013),
//  - welfare / health / legal: wyłącznie człowiek z właściwą rolą (specjalista gatunkowy / lekarz weterynarii / prawnik).
// Akceptacja wiąże konkretną wersję treści (hash) — zmiana treści wymaga ponownego zatwierdzenia.
import type { AppState, Article } from "../types";
import { redact } from "../security/redact";
import { articleContentHash } from "../ops/article-review";
import { effectiveRisk, REQUIRED_REVIEW, type ReviewerRole } from "../taxonomy/animals";
import { isAgentIdentity } from "../ops/identity";

export const articleHref = (a: Pick<Article, "slug" | "basePath">) => `${a.basePath ?? "/poradniki"}/${a.slug}`;

// Obietnice zdrowotne (nie samo słowo „leczy” — np. „lekarz, który leczy króliki” jest dopuszczalne).
const HEALTH_PROMISE = /\b(wylecz\w*|gwarantuj\w*|100% skuteczn\w*|zamiast (lekarza )?weterynarza|lek na|(?:to|preparat|produkt|środek|sposób|metoda) leczy)\b/i;

/** Blokady przed publikacją (MASTER_PLAN §6, CLAUDE.md zasada 6). */
export function checkArticlePolicy(a: Article): string[] {
  const e: string[] = [];
  if (!a.sources?.length || a.sources.every((s) => !s.url)) e.push("NO_VERIFIABLE_SOURCE");
  if (a.demo) e.push("DEMO_ARTICLE");
  if (/\[(UZUPE[ŁL]NIA|DO UZUPE[ŁL]NIENIA)/i.test(JSON.stringify(a.body))) e.push("PLACEHOLDER_IN_BODY");
  if (HEALTH_PROMISE.test(a.body.join(" "))) e.push("HEALTH_PROMISE");
  if (!a.title.trim() || a.body.length < 3) e.push("TOO_SHORT");
  // V3: twierdzenia muszą wskazywać istniejące źródło
  if (a.claims?.some((c) => !a.sources[c.sourceIndex]?.url)) e.push("CLAIM_WITHOUT_SOURCE");
  return e;
}

export class EditorialError extends Error {
  constructor(public code: string, public details: string[] = []) {
    super(details.length ? `${code}: ${details.join(", ")}` : code);
  }
}

/** Kto zatwierdza: człowiek z rolami albo jawnie AI (tylko rola editor). */
export interface Reviewer {
  id: string;
  kind: "human" | "ai";
  roles: ReviewerRole[];
}

/** Domyślnie (panel lokalny): właściciel jako człowiek-redaktor — bez kwalifikacji specjalistycznych. */
const defaultReviewer = (actor: string): Reviewer =>
  isAgentIdentity(actor) ? { id: actor, kind: "ai", roles: ["editor"] } : { id: actor, kind: "human", roles: ["editor"] };

function audit(state: AppState, actor: string, action: string, slug: string, meta: Record<string, unknown> = {}) {
  state.audit.push({ at: new Date().toISOString(), actor, entity: "article", entityId: slug, action, meta: redact(meta) });
}

/** Wymagana rola przeglądu dla materiału (efektywna klasa ryzyka — tytuł „dla początkującego” jej nie obniża). */
export function requiredReviewRole(a: Article): ReviewerRole {
  return REQUIRED_REVIEW[effectiveRisk(a.risk ?? "standard", a.needs ?? [])];
}

/** Sprawdza, czy recenzent może zatwierdzić materiał. Zwraca listę powodów blokady (pusta = może). */
export function reviewBlockers(a: Article, r: Reviewer): string[] {
  const need = requiredReviewRole(a);
  if (need === "editor") return r.roles.includes("editor") ? [] : ["REVIEWER_NOT_EDITOR"];
  if (r.kind !== "human") return [`HUMAN_${need.toUpperCase()}_REQUIRED`];
  return r.roles.includes(need) ? [] : [`ROLE_${need.toUpperCase()}_REQUIRED`];
}

export function approveArticle(state: AppState, slug: string, actor: string, now = new Date(), reviewer: Reviewer = defaultReviewer(actor)): Article {
  const a = state.articles.find((x) => x.slug === slug);
  if (!a) throw new EditorialError("ARTICLE_NOT_FOUND", [slug]);
  if (a.status !== "needs_review") throw new EditorialError("APPROVE_REQUIRES_NEEDS_REVIEW", [a.status]);
  const errors = [...checkArticlePolicy(a), ...reviewBlockers(a, reviewer)];
  if (errors.length) {
    a.review = { ...(a.review ?? { required: requiredReviewRole(a), by: null, byKind: null, at: null }), required: requiredReviewRole(a), waitingReason: errors.join(", ") };
    audit(state, actor, "approve_blocked", slug, { errors });
    throw new EditorialError("POLICY_BLOCKED", errors);
  }
  a.status = "published";
  a.reviewedBy = reviewer.id;
  a.review = { required: requiredReviewRole(a), by: reviewer.id, byKind: reviewer.kind, at: now.toISOString(), note: a.review?.note ?? null, waitingReason: null };
  a.editorialDecision = {
    decision: "approved", by: reviewer.id, byKind: reviewer.kind, at: now.toISOString(), contentHash: articleContentHash(a),
    evidenceRef: null, excludedCategoriesChecked: [effectiveRisk(a.risk ?? "standard", a.needs ?? [])], notes: [], publishAfter: now.toISOString(),
  };
  a.publishedAt = a.publishedAt ?? now.toISOString();
  a.updatedAt = now.toISOString();
  audit(state, actor, "article_published", slug, { reviewerKind: reviewer.kind, required: requiredReviewRole(a) });
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

/** Korekta opublikowanego materiału: zapisuje propozycję; publicznie zostaje poprzednia wersja do zatwierdzenia. */
export function proposeCorrection(state: AppState, slug: string, actor: string, patch: NonNullable<Article["revision"]>["patch"], reason: string, now = new Date()): Article {
  const a = state.articles.find((x) => x.slug === slug);
  if (!a) throw new EditorialError("ARTICLE_NOT_FOUND", [slug]);
  if (a.status !== "published") throw new EditorialError("CORRECTION_REQUIRES_PUBLISHED", [a.status]);
  a.revision = { patch, by: actor, at: now.toISOString(), reason };
  audit(state, actor, "article_correction_proposed", slug, { reason });
  return a;
}

/** Zatwierdzenie korekty: te same zasady przeglądu co publikacja; nowa wersja = nowy hash i data aktualizacji. */
export function approveCorrection(state: AppState, slug: string, actor: string, now = new Date(), reviewer: Reviewer = defaultReviewer(actor)): Article {
  const a = state.articles.find((x) => x.slug === slug);
  if (!a?.revision) throw new EditorialError("NO_PENDING_CORRECTION", [slug]);
  const candidate: Article = { ...a, ...a.revision.patch };
  const errors = [...checkArticlePolicy(candidate), ...reviewBlockers(candidate, reviewer)];
  if (errors.length) { audit(state, actor, "correction_blocked", slug, { errors }); throw new EditorialError("POLICY_BLOCKED", errors); }
  Object.assign(a, a.revision.patch);
  a.revision = null;
  a.updatedAt = now.toISOString();
  a.reviewedBy = reviewer.id;
  a.review = { required: requiredReviewRole(a), by: reviewer.id, byKind: reviewer.kind, at: now.toISOString(), note: null, waitingReason: null };
  a.editorialDecision = { ...(a.editorialDecision ?? { evidenceRef: null, excludedCategoriesChecked: [], notes: [], publishAfter: now.toISOString() }), decision: "approved", by: reviewer.id, byKind: reviewer.kind, at: now.toISOString(), contentHash: articleContentHash(a) };
  audit(state, actor, "article_correction_published", slug);
  return a;
}
