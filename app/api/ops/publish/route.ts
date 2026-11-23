// Jedyny dispatcher publikacji CMS (zastępuje hook przy starcie modułu, który Vercel zamrażał po odpowiedzi).
// Wywołuje go Vercel Cron (nagłówek Authorization: Bearer $CRON_SECRET) albo operator z tym samym sekretem.
// Publikuje wyłącznie wersje z aktualną akceptacją (hash) i tylko gdy podpisana polityka daje live_scoped;
// potem domyka read-back (READBACK_PENDING -> verifiedAt). Bez sekretu w środowisku: 503 (nic się nie dzieje).
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getStore } from "@/lib/store/file-store";
import { loadPolicy, effectiveMode } from "@/lib/ops/policy";
import { publishApprovedArticles, verifyPendingReadbacks } from "@/lib/ops/cms-publish";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(header: string | null, secret: string): boolean {
  const a = Buffer.from(header ?? "");
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32) return NextResponse.json({ error: "NOT_CONFIGURED" }, { status: 503 });
  if (!authorized(req.headers.get("authorization"), secret)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const store = getStore();
  const policy = loadPolicy();
  const mode = effectiveMode(policy, store.read().ops.mode);
  if (mode !== "live_scoped") return NextResponse.json({ mode, published: [], verified: 0 });
  const published = await publishApprovedArticles(store, policy);
  const verified = await verifyPendingReadbacks(store, policy);
  return NextResponse.json({
    mode,
    published: published.filter((r) => r.outcome !== "already_done").map((r) => ({ slug: r.slug, outcome: r.outcome, reasons: r.reasons })),
    alreadyDone: published.filter((r) => r.outcome === "already_done").length,
    verified: verified.filter((v) => v.outcome === "verified").length,
    stillPending: verified.filter((v) => v.outcome === "still_pending").length,
  });
}
