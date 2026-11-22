import { notFound } from "next/navigation";
import { getStore } from "@/lib/store/file-store";
import { ArticleView } from "@/components/article-view";

export const dynamic = "force-dynamic";

export default async function ContentPreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getStore().read().articles.find((x) => x.slug === slug);
  if (!a) notFound();
  return <ArticleView a={a} preview />;
}
