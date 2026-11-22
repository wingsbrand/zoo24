// Dawne adresy bloga sklepu (np. /blog/kot-brytyjski-n66) — nowe, autorskie treści pod tym samym URL (200).
// Nieopublikowany lub nieistniejący artykuł => obsługa jak stary URL: legacy router (404/410/zatwierdzony 301).
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getStore } from "@/lib/store/file-store";
import { ArticleView } from "@/components/article-view";
import { articleMetadata, findPublishedArticle } from "@/components/editorial/queries";
import { buildPageRegistry, createLegacyResolver } from "@/lib/seo";
import { IS_PRODUCTION } from "@/lib/site";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const a = findPublishedArticle((await params).slug, "/blog");
  return a ? articleMetadata(a) : {};
}

export default async function BlogArticlePage({ params }: P) {
  const { slug } = await params;
  const a = findPublishedArticle(slug, "/blog");
  if (a) return <ArticleView a={a} />;
  const state = getStore().read();
  const r = createLegacyResolver(state.legacyUrls, buildPageRegistry(state), { requireUnblocked: IS_PRODUCTION }).resolve(`/blog/${slug}`);
  if ((r.status === 301 || r.status === 308) && r.location) permanentRedirect(r.location);
  notFound(); // 410 dla /blog/* rozważyć po akceptacji mapy; domyślnie 404
}
