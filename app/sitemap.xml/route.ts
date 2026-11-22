import { buildPageRegistry, sitemapEntries } from "@/lib/seo";
import { getStore } from "@/lib/store/file-store";
import { IS_PRODUCTION, SITE_ENV, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export function GET() {
  // N2: poza produkcją sitemap nie jest serwowana.
  if (!IS_PRODUCTION) return new Response("Sitemap niedostępna poza produkcją (F1).", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  const entries = sitemapEntries(buildPageRegistry(getStore().read()), SITE_URL, SITE_ENV);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map((e) => `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""}</url>`)
    .join("\n")}\n</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
