import type { NextConfig } from "next";

// F1: brak redirectów w konfiguracji — mapa starych URL jest obsługiwana przez
// lib/seo/legacy-router po akceptacji człowieka (patrz docs/seo/redirect-policy.md).
function canonicalHostOf(url: string | undefined): string | null {
  try { return url ? new URL(url).host : null; } catch { return null; }
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Pliki treści czytane w runtime (seed, artykuły, realne firmy, eksporty KPI) muszą trafić do funkcji serwerowych.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./docs/social/*.json", "./data/exports/*.json", "./ops/config/*.json"],
  },
  async headers() {
    const production = process.env.ZOO24_ENV === "production";
    const canonicalHost = canonicalHostOf(process.env.ZOO24_SITE_URL);
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // Lokalny prototyp / staging: nigdy nie indeksować.
          ...(production ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
        ],
      },
      // Produkcja: indeksowana wyłącznie domena kanoniczna (np. zoo24.pl); *.vercel.app i inne aliasy => noindex.
      ...(production && canonicalHost
        ? [{ source: "/:path*", missing: [{ type: "host" as const, value: canonicalHost }], headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
        : []),
    ];
  },
};

export default nextConfig;
