import { robotsTxt } from "@/lib/seo";
import { SITE_ENV, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export function GET() {
  return new Response(robotsTxt(SITE_ENV, SITE_URL), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
