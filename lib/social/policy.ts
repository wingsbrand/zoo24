// Deterministyczny policy engine publikacji social (bez LLM).
import type { SocialAsset, SocialPost } from "../types";
import { validateUtm } from "../analytics/utm";
import { warsawWeekKey } from "../time";

export interface PolicyContext {
  assets: SocialAsset[];
  now: Date;
  /** Czy ścieżka docelowa jest opublikowana (200) w serwisie. */
  isTargetLive: (path: string) => boolean;
  /** Liczba postów zaplanowanych/opublikowanych w tym tygodniu i kanale WCZEŚNIEJ niż bieżący (limit nie blokuje wcześniejszych). */
  postsInWeek: (post: SocialPost, weekKey: string) => number;
  maxPostsPerChannelWeek: number;
  /** Tryb adaptera: real odrzuca rekordy DEMO. */
  adapterKind: "mock" | "real";
}

const HEALTH = /\b(wylecz|leczy|leczenie|diagnoz|gwarantuj|100% skuteczn|zamiast weterynarza|lek na)/i;

export function checkPublishPolicy(post: SocialPost, ctx: PolicyContext): string[] {
  const e: string[] = [];
  // Prawa do materiałów
  if (!post.assetId) e.push("ASSET_MISSING");
  else {
    const a = ctx.assets.find((x) => x.id === post.assetId);
    if (!a) e.push("ASSET_NOT_IN_REGISTER");
    else {
      if (a.licenseType === "unknown" || !a.licenseProof || !a.rightsCheckedAt) e.push("ASSET_LICENSE_UNVERIFIED");
      if (a.expiresAt && new Date(a.expiresAt) <= ctx.now) e.push("ASSET_LICENSE_EXPIRED");
    }
  }
  if (!post.altText?.trim()) e.push("ALT_TEXT_MISSING");
  // Źródła i treść
  if (!post.sourceRefs?.length) e.push("NO_SOURCE");
  if (/\[UZUPE[ŁL]NIA/i.test(post.copy)) e.push("PLACEHOLDER_IN_COPY");
  if (HEALTH.test(post.copy)) e.push("HEALTH_CLAIM");
  if (post.sponsored && !post.disclosure?.trim()) e.push("DISCLOSURE_REQUIRED");
  // Link i UTM
  e.push(...validateUtm(post.utm));
  if (post.utm.source !== post.platform) e.push("UTM_SOURCE_PLATFORM_MISMATCH");
  if (!ctx.isTargetLive(post.targetPath)) e.push("TARGET_NOT_PUBLISHED");
  // Częstotliwość
  if (post.scheduledAt) {
    const wk = warsawWeekKey(post.scheduledAt);
    if (ctx.postsInWeek(post, wk) >= ctx.maxPostsPerChannelWeek) e.push("WEEKLY_LIMIT_EXCEEDED");
  } else e.push("NOT_SCHEDULED_TIME");
  // DEMO nigdy do prawdziwego API
  if (post.demo && ctx.adapterKind === "real") e.push("DEMO_POST_TO_REAL_API");
  return e;
}

/** Błędy dopuszczalne na etapie akceptacji treści (np. termin może jeszcze nie mieć ustawionego limitu). Wszystkie pozostałe blokują approve. */
export function checkApprovalPolicy(post: SocialPost, ctx: PolicyContext): string[] {
  return checkPublishPolicy(post, ctx);
}
