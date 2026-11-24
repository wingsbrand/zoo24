// State machine kolejki social: draft -> needs_review -> approved -> scheduled -> publishing -> published/failed
// (+ rejected, held, cancelled). Akceptacja zamraża wersję i hash treści.
import type { AppState, PostStatus, SocialPost } from "../types";
import { contentHash } from "./hash";
import { checkApprovalPolicy, type PolicyContext } from "./policy";
import { redact } from "../security/redact";
import { warsawWeekKey } from "../time";
import { computeVisibility, isSpeciesPublic, TOOLS } from "../portal/visibility";
import { isGroupSlug } from "../taxonomy/animals";

export class WorkflowError extends Error {
  constructor(public code: string, public details: string[] = []) {
    super(details.length ? `${code}: ${details.join(", ")}` : code);
    this.name = "WorkflowError";
  }
}

const TRANSITIONS: Record<PostStatus, PostStatus[]> = {
  draft: ["needs_review", "cancelled"],
  needs_review: ["approved", "rejected", "draft"],
  approved: ["scheduled", "needs_review", "cancelled"],
  scheduled: ["publishing", "held", "cancelled", "needs_review"],
  publishing: ["published", "failed", "held", "scheduled"],
  published: [],
  failed: ["needs_review", "cancelled"],
  rejected: ["draft"],
  held: ["needs_review", "cancelled"],
  cancelled: ["draft"],
};

export function canTransition(from: PostStatus, to: PostStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

function move(post: SocialPost, to: PostStatus): void {
  if (!canTransition(post.status, to)) throw new WorkflowError("INVALID_TRANSITION", [`${post.status} -> ${to}`]);
  post.status = to;
}

export function audit(state: AppState, actor: string, action: string, entityId: string | null, meta: Record<string, unknown> = {}): void {
  state.audit.push({ at: new Date().toISOString(), actor, entity: "social_post", entityId, action, meta: redact(meta) });
}

export function isApprovalCurrent(post: SocialPost): boolean {
  return post.approvedVersion === post.version && post.approvedHash === post.contentHash && !!post.approvedBy;
}

/** Kontekst polityki zbudowany ze stanu aplikacji. */
export function policyContext(state: AppState, now: Date, adapterKind: "mock" | "real" = "mock"): PolicyContext {
  const staticLive = new Set(["/", "/o-nas", "/dla-firm", "/poradniki", "/uslugi", "/uslugi/groomer", "/uslugi/hotel-dla-zwierzat"]);
  return {
    assets: state.socialAssets,
    now,
    adapterKind,
    maxPostsPerChannelWeek: state.settings.maxPostsPerChannelWeek,
    isTargetLive: (p) => {
      if (staticLive.has(p)) return true;
      const listing = /^\/uslugi\/(groomer|hotel-dla-zwierzat)\/(warszawa|krakow|lodz|wroclaw|poznan|gdansk|szczecin|bydgoszcz|lublin|bialystok)$/.test(p);
      if (listing) return true;
      const art = /^\/(poradniki|blog)\/([a-z0-9-]+)$/.exec(p);
      if (art) return state.articles.some((a) => a.slug === art[2] && a.status === "published" && (a.basePath ?? "/poradniki") === `/${art[1]}`);
      if (TOOLS.some((t) => t.path === p)) return true;
      const zoo = /^\/zwierzeta\/([a-z-]+)(?:\/([a-z0-9-]+))?$/.exec(p);
      if (zoo && isGroupSlug(zoo[1])) {
        const v = computeVisibility(state.articles);
        return zoo[2] ? isSpeciesPublic(v, zoo[1], zoo[2]) : v.groups[zoo[1]].isPublic;
      }
      const firm = /^\/firma\/([a-z0-9-]+)$/.exec(p);
      if (firm) return state.businesses.some((b) => b.slug === firm[1] && b.status === "published");
      return false;
    },
    postsInWeek: (cur, week) =>
      state.socialPosts.filter(
        (p) => p.id !== cur.id && p.platform === cur.platform && p.scheduledAt &&
          ["scheduled", "publishing", "published"].includes(p.status) && warsawWeekKey(p.scheduledAt) === week &&
          (p.scheduledAt < cur.scheduledAt! || (p.scheduledAt === cur.scheduledAt && p.id < cur.id)),
      ).length,
  };
}

export function submitForReview(state: AppState, postId: string, actor: string): SocialPost {
  const post = get(state, postId);
  move(post, "needs_review");
  audit(state, actor, "submit_for_review", postId);
  return post;
}

export function approve(state: AppState, postId: string, actor: string, now = new Date()): SocialPost {
  const post = get(state, postId);
  if (post.status !== "needs_review") throw new WorkflowError("APPROVE_REQUIRES_NEEDS_REVIEW", [post.status]);
  const errors = checkApprovalPolicy(post, policyContext(state, now));
  if (errors.length) {
    audit(state, actor, "approve_blocked", postId, { errors });
    throw new WorkflowError("POLICY_BLOCKED", errors);
  }
  move(post, "approved");
  post.approvedVersion = post.version;
  post.approvedHash = post.contentHash;
  post.approvedBy = actor;
  post.approvedAt = now.toISOString();
  audit(state, actor, "approve", postId, { version: post.version });
  return post;
}

export function reject(state: AppState, postId: string, actor: string, reason: string): SocialPost {
  const post = get(state, postId);
  move(post, "rejected");
  audit(state, actor, "reject", postId, { reason });
  return post;
}

export function schedule(state: AppState, postId: string, actor: string): SocialPost {
  const post = get(state, postId);
  if (post.status !== "approved" || !isApprovalCurrent(post)) throw new WorkflowError("SCHEDULE_REQUIRES_CURRENT_APPROVAL");
  const errors = checkApprovalPolicy(post, policyContext(state, new Date()));
  if (errors.includes("WEEKLY_LIMIT_EXCEEDED")) throw new WorkflowError("POLICY_BLOCKED", ["WEEKLY_LIMIT_EXCEEDED"]);
  move(post, "scheduled");
  audit(state, actor, "schedule", postId, { scheduledAt: post.scheduledAt });
  return post;
}

type Editable = Partial<Pick<SocialPost, "copy" | "cta" | "targetPath" | "assetId" | "altText" | "disclosure" | "scheduledAt" | "sourceRefs" | "sponsored">>;

/** Edycja treści: nowa wersja; jeśli była zaakceptowana/zaplanowana — wraca do needs_review. */
export function editPost(state: AppState, postId: string, actor: string, changes: Editable): SocialPost {
  const post = get(state, postId);
  if (["publishing", "published"].includes(post.status)) throw new WorkflowError("POST_LOCKED", [post.status]);
  Object.assign(post, changes);
  const h = contentHash(post);
  if (h !== post.contentHash) {
    post.contentHash = h;
    post.version += 1;
    if (["approved", "scheduled", "held", "failed"].includes(post.status)) post.status = "needs_review";
    audit(state, actor, "edit", postId, { version: post.version, fields: Object.keys(changes) });
  }
  return post;
}

export function cancel(state: AppState, postId: string, actor: string): SocialPost {
  const post = get(state, postId);
  move(post, "cancelled");
  audit(state, actor, "cancel", postId);
  return post;
}

function get(state: AppState, id: string): SocialPost {
  const p = state.socialPosts.find((x) => x.id === id);
  if (!p) throw new WorkflowError("POST_NOT_FOUND", [id]);
  return p;
}
