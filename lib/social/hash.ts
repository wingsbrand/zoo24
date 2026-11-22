import { createHash } from "node:crypto";
import type { SocialPost } from "../types";

/** Hash zamrażanej treści: każda zmiana tych pól unieważnia akceptację. */
export function contentHash(p: Pick<SocialPost, "platform" | "copy" | "cta" | "targetPath" | "utm" | "assetId" | "altText" | "disclosure" | "scheduledAt" | "sourceRefs" | "sponsored">): string {
  const frozen = JSON.stringify([p.platform, p.copy, p.cta, p.targetPath, p.utm, p.assetId, p.altText, p.disclosure, p.scheduledAt, p.sourceRefs, p.sponsored]);
  return createHash("sha256").update(frozen).digest("hex");
}

export function idempotencyKey(postId: string, version: number): string {
  return createHash("sha256").update(`${postId}:${version}`).digest("hex");
}
