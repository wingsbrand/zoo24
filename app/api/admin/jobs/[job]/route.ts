// Ręczne wyzwalanie jobów (symulacja tego, co w przyszłości wywoła scheduler hostingu).
// F1: tylko lokalnie, tylko adapter MOCK. Brak aktywnego crona.
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getStore } from "@/lib/store/file-store";
import { isTrustedAdminRequest, SITE_ENV, SITE_URL } from "@/lib/site";
import { MockMetaAdapter } from "@/lib/integrations/meta/adapter";
import { runJobOnce } from "@/lib/social/scheduler";
import { buildDashboard, renderWeeklyReport } from "@/lib/analytics/kpi";
import { getReadSources } from "@/lib/integrations/read-sources";
import { buildPageRegistry, runSeoChecks } from "@/lib/seo";
import { OWNER_DECISIONS } from "@/lib/decisions";
import { warsawWeekKey } from "@/lib/time";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ job: string }> }) {
  if (!isTrustedAdminRequest(req.headers)) return new NextResponse("Not found", { status: 404 });
  const { job } = await params;
  const store = getStore();
  if (job === "weekly_kpi_report") {
    const d = await buildDashboard(store.read(), getReadSources());
    const week = warsawWeekKey(new Date().toISOString());
    const txt = renderWeeklyReport(d, week, OWNER_DECISIONS);
    const dir = path.join(process.cwd(), "reports", "weekly");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${week}.md`);
    fs.writeFileSync(file, "```text\n" + txt + "\n```\n", "utf8");
    return NextResponse.json({ job, file: path.relative(process.cwd(), file), mock: true });
  }
  if (job === "seo_health_daily") {
    const s = store.read();
    return NextResponse.json({ job, ...runSeoChecks(s, buildPageRegistry(s), s.legacyUrls, { env: SITE_ENV, siteUrl: SITE_URL }) });
  }
  const result = await runJobOnce(job, { store, adapter: new MockMetaAdapter() });
  return NextResponse.json({ job, mock: true, result });
}
