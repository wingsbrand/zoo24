// Fixtures testowe SEO — wszystkie rekordy legacy oznaczone DEMO (dataSource "DEMO", demo: true).
import type { AppState, Business, LegacyUrl } from "@/lib/types";
import { DEMO_ARTICLES, DEMO_BUSINESSES, DEMO_LEGACY_URLS } from "@/lib/demo/seed";
import { createRegistry, type PageInfo } from "@/lib/seo/page-registry";
import { emptyOpsState } from "@/lib/ops/types";

export const SITE = "https://zoo24.example.test";

export function demoState(overrides?: Partial<AppState>): AppState {
  return {
    schemaVersion: 1,
    businesses: structuredClone(DEMO_BUSINESSES),
    articles: structuredClone(DEMO_ARTICLES),
    legacyUrls: structuredClone(DEMO_LEGACY_URLS),
    socialPosts: [],
    socialAssets: [],
    attempts: [],
    settings: {
      publishEnabled: false,
      channels: { facebook: true, instagram: true },
      socialMode: 0,
      maxPostsPerChannelWeek: 3,
      staleAfterMinutes: 30,
    },
    audit: [],
    events: [],
    submissions: [],
    ops: emptyOpsState(),
    ...overrides,
  };
}

/** Zatwierdzony (DEMO) redirect 301 — domyślnie spełnia R1/R8. */
export function row(l: Partial<LegacyUrl> & Pick<LegacyUrl, "oldPath">): LegacyUrl {
  return {
    segment: "B",
    proposedAction: "redirect_301",
    targetPath: "/poradniki/demo-artykul-a",
    currentHttpStatus: null,
    contentRightsVerified: "yes",
    semanticMatchExplanation: "DEMO: ta sama intencja informacyjna co docelowy poradnik, opis testowy.",
    reviewer: "DEMO-reviewer",
    approvedAt: "2026-11-22T09:00:00.000Z",
    status: "approved",
    historicalClicks: null,
    dataSource: "DEMO",
    demo: true,
    ...l,
  };
}

const page = (path: string, kind: PageInfo["kind"], extra?: Partial<PageInfo>): PageInfo => ({
  path,
  status: 200,
  indexable: true,
  demo: false,
  draft: false,
  kind,
  ...extra,
});

/** Rejestr testowy: indeksowalne poradniki fikcyjne + huby + strona DEMO i draft. */
export function testRegistry(extra: PageInfo[] = []) {
  return createRegistry([
    page("/", "home"),
    page("/uslugi", "hub"),
    page("/uslugi/groomer", "hub"),
    page("/uslugi/groomer/warszawa", "listing"),
    page("/poradniki", "hub"),
    page("/poradniki/demo-artykul-a", "article"),
    page("/poradniki/demo-artykul-b", "article"),
    page("/poradniki/demo-artykul-c", "article"),
    page("/poradniki/demo-strona-demo", "article", { demo: true, indexable: false }),
    page("/poradniki/demo-szkic", "article", { draft: true, indexable: false }),
    page("/firma/demo-firma-x", "business"),
    ...extra,
  ]);
}

/** Fikcyjne firmy NIE-demo wyłącznie do testu progu N4 (nie realne podmioty, nie trafiają do seed). */
export function testOnlyRealBusinesses(n: number): Business[] {
  return Array.from({ length: n }, (_, i) => ({
    ...structuredClone(DEMO_BUSINESSES[0]!),
    id: `t${i}`,
    slug: `fixture-test-${i}`,
    name: `FIXTURE-TEST ${i} (nie realna firma)`,
    demo: false,
    status: "published" as const,
    category: "groomer" as const,
    city: "warszawa" as const,
  }));
}

/** Deterministyczny PRNG (mulberry32) dla testów masowych. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
