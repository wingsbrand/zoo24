import type { Utm } from "../types";

const SAFE = /^[a-z0-9_-]{1,64}$/;
const PII = [/@/, /(?:\d[\s-]?){9,}/, /%40/i];

export function validateUtm(utm: Partial<Utm>): string[] {
  const errors: string[] = [];
  for (const k of ["source", "medium", "campaign", "content"] as const) {
    const v = utm[k];
    if (!v) errors.push(`UTM_MISSING_${k.toUpperCase()}`);
    else if (PII.some((re) => re.test(v))) errors.push(`UTM_PII_${k.toUpperCase()}`);
    else if (!SAFE.test(v)) errors.push(`UTM_INVALID_${k.toUpperCase()}`);
  }
  if (utm.source && !["facebook", "instagram"].includes(utm.source)) errors.push("UTM_SOURCE_NOT_ALLOWED");
  if (utm.medium && utm.medium !== "organic_social") errors.push("UTM_MEDIUM_NOT_ALLOWED");
  return errors;
}

/** Buduje link z UTM do ścieżki serwisu. Odrzuca PII. Linki wewnętrzne nie dostają UTM (nie używać tej funkcji). */
export function buildUtmUrl(siteUrl: string, targetPath: string, utm: Utm): string {
  const errors = validateUtm(utm);
  if (errors.length) throw new Error(`Nieprawidłowe UTM: ${errors.join(", ")}`);
  const url = new URL(targetPath, siteUrl);
  url.searchParams.set("utm_source", utm.source);
  url.searchParams.set("utm_medium", utm.medium);
  url.searchParams.set("utm_campaign", utm.campaign);
  url.searchParams.set("utm_content", utm.content);
  return url.toString();
}
