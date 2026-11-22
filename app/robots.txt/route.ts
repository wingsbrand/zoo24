import { robotsTxt } from "@/lib/seo";
import { IS_PRODUCTION, SITE_ENV, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  // W produkcji robots „allow” tylko na domenie kanonicznej; aliasy (*.vercel.app, www) dostają Disallow.
  const canonical = new URL(SITE_URL).host;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const env = IS_PRODUCTION && host !== canonical ? "staging" : SITE_ENV;
  return new Response(robotsTxt(env, SITE_URL), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
