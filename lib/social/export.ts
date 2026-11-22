// Eksport kalendarza do CSV (format docs/social-calendar.template.csv) — ścieżka ręcznego planowania
// w Meta Business Suite (ADR-004). Eksportuje wyłącznie pozycje z AKTUALNĄ akceptacją, chyba że includeAll.
import type { AppState } from "../types";
import { buildUtmUrl } from "../analytics/utm";
import { isApprovalCurrent } from "./workflow";
import { formatWarsaw } from "../time";

const HEADER = "post_id,platform,content_pillar,topic,copy_draft,source_url,asset_id,asset_license_verified,alt_text,target_url,utm_source,utm_medium,utm_campaign,disclosure,status,owner_approved_at,scheduled_at_europe_warsaw,published_at,external_post_id,notes";

const esc = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function exportCalendarCsv(state: AppState, siteUrl: string, includeAll = false): string {
  const rows = state.socialPosts
    .filter((p) => includeAll || isApprovalCurrent(p))
    .map((p) => {
      const a = state.socialAssets.find((x) => x.id === p.assetId);
      const verified = !!a && a.licenseType !== "unknown" && !!a.rightsCheckedAt;
      return [
        p.id, p.platform, p.pillar, p.topic, p.copy, p.sourceRefs.join(" | "), p.assetId, verified ? "yes" : "no",
        p.altText, buildUtmUrl(siteUrl, p.targetPath, p.utm), p.utm.source, p.utm.medium, p.utm.campaign,
        p.disclosure ?? "", p.status, p.approvedAt ?? "", formatWarsaw(p.scheduledAt), p.publishedAt ?? "",
        p.externalPostId ?? "", p.demo ? "DEMO — nie publikować" : "",
      ].map(esc).join(",");
    });
  return [HEADER, ...rows].join("\n");
}
