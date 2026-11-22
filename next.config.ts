import type { NextConfig } from "next";

// F1: brak redirectów w konfiguracji — mapa starych URL jest obsługiwana przez
// lib/seo/legacy-router po akceptacji człowieka (patrz docs/seo/redirect-policy.md).
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Pliki treści czytane w runtime (seed, artykuły, realne firmy, eksporty KPI) muszą trafić do funkcji serwerowych.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*", "./docs/social/*.json", "./data/exports/*.json", "./ops/config/*.json"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // F1 = lokalny prototyp / staging: nigdy nie indeksować.
          ...(process.env.ZOO24_ENV === "production"
            ? []
            : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
        ],
      },
    ];
  },
};

export default nextConfig;
