// Dostęp do opublikowanych artykułów + metadane stron artykułów (serwer).
import type { Metadata } from "next";
import type { Article } from "@/lib/types";
import { getStore } from "@/lib/store/file-store";
import { articleHref } from "@/lib/content/editorial";
import { topicForArticle } from "@/lib/content/topics";

export type ArticleBase = "/poradniki" | "/blog";

/** Tylko status "published" i zgodna ścieżka bazowa; draft/needs_review => null (publicznie 404). */
export function findPublishedArticle(slug: string, base: ArticleBase): Article | null {
  return getStore().read().articles.find((a) => a.slug === slug && a.status === "published" && (a.basePath ?? "/poradniki") === base) ?? null;
}

export function allArticles(): Article[] {
  return getStore().read().articles;
}

export function articleMetadata(a: Article): Metadata {
  const url = articleHref(a);
  const topic = topicForArticle(a);
  return {
    title: a.title,
    description: a.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: "ZOO24",
      locale: "pl_PL",
      url,
      title: a.title,
      description: a.summary,
      publishedTime: a.publishedAt ?? undefined,
      modifiedTime: a.updatedAt,
      section: topic.name,
      authors: [a.authorDisplay],
    },
    // DEMO zawsze noindex; poza produkcją noindex dziedziczony z app/layout.tsx.
    robots: a.demo ? { index: false, follow: false } : undefined,
  };
}
