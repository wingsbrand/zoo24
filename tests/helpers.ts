import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { FileStore } from "@/lib/store/file-store";
import type { AppState, SocialAsset } from "@/lib/types";

export function tempStore(): FileStore {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "zoo24-test-"));
  const s = new FileStore(dir);
  s.reset();
  return s;
}

/** Asset z zweryfikowaną licencją (wyłącznie w testach — w repo nie ma zweryfikowanych assetów). */
export function verifiedAsset(id: string): SocialAsset {
  return { id, description: "TEST asset", licenseType: "own", licenseProof: "TEST-proof", altText: "alt", rightsCheckedAt: "2026-11-20T00:00:00Z", expiresAt: null, demo: true };
}

/** Przygotowuje post soc-007 (target: opublikowany poradnik) do publikacji: prawa + review + approve + schedule. */
export async function prepareScheduled(store: FileStore, postId: string, scheduledAt: string, now: Date) {
  const { submitForReview, approve, schedule, editPost } = await import("@/lib/social/workflow");
  await store.transact((s: AppState) => {
    const post = s.socialPosts.find((p) => p.id === postId)!;
    const assetId = `ast-test-${postId}`;
    s.socialAssets.push(verifiedAsset(assetId));
    editPost(s, postId, "test", { assetId, scheduledAt, copy: post.copy.replace(/\[UZUPE[ŁL]NIA[^\]]*\]/g, "Kontakt: patrz strona O nas.") });
    if (post.status === "draft") submitForReview(s, postId, "test");
    approve(s, postId, "owner-test", now);
    schedule(s, postId, "owner-test");
  });
}
