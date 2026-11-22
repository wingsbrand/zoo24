// OG artykułu pod dawnym adresem /blog/{slug}. Nieopublikowany/nieistniejący => ogólna grafika marki.
import { articleOgImage } from "@/components/editorial/og";
import { findPublishedArticle } from "@/components/editorial/queries";

export const dynamic = "force-dynamic";
export const alt = "Poradnik ZOO24";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return articleOgImage(findPublishedArticle(slug, "/blog"));
}
