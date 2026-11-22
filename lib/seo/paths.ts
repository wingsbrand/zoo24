// ZOO24 — normalizacja ścieżek dla SEO (docs/seo/redirect-policy.md §1). Czysta funkcja, bez I/O.

const TRACKING_PARAM = /^(utm_[a-z0-9_]*|gclid|fbclid)$/i;

/**
 * Normalizuje URL/ścieżkę do porównań:
 * - usuwa schemat i host (także protocol-relative `//host`),
 * - usuwa fragment `#...`,
 * - usuwa parametry śledzące `utm_*`, `gclid`, `fbclid` (pozostałe parametry zachowuje w kolejności),
 * - lowercase ścieżki, scala wielokrotne `/`, usuwa końcowy `/` (poza `/`).
 */
export function normalizePath(input: string | null | undefined): string {
  let s = (input ?? "").trim();
  const hashIdx = s.indexOf("#");
  if (hashIdx >= 0) s = s.slice(0, hashIdx);
  // schemat + host
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/?]*/i, "");
  // protocol-relative //host/...
  if (s.startsWith("//")) s = s.replace(/^\/\/[^/?]*/, "");

  let query = "";
  const qIdx = s.indexOf("?");
  if (qIdx >= 0) {
    query = s.slice(qIdx + 1);
    s = s.slice(0, qIdx);
  }

  let p = s.toLowerCase().replace(/\/{2,}/g, "/");
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1) p = p.replace(/\/+$/, "");
  if (p === "") p = "/";

  const kept = query
    .split("&")
    .filter((kv) => kv.length > 0)
    .filter((kv) => !TRACKING_PARAM.test(kv.split("=")[0] ?? ""));
  return kept.length > 0 ? `${p}?${kept.join("&")}` : p;
}

/** Ścieżka bez query (do canonical i rejestru stron). */
export function pathOnly(input: string | null | undefined): string {
  const n = normalizePath(input);
  const q = n.indexOf("?");
  return q >= 0 ? n.slice(0, q) : n;
}
