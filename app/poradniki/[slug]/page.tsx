import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleView } from "@/components/article-view";
import { articleMetadata, findPublishedArticle } from "@/components/editorial/queries";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const a = findPublishedArticle((await params).slug, "/poradniki");
  return a ? articleMetadata(a) : {};
}

export default async function ArticlePage({ params }: P) {
  const a = findPublishedArticle((await params).slug, "/poradniki");
  if (!a) notFound(); // draft / needs_review => 404 publicznie
  return <ArticleView a={a} />;
}
