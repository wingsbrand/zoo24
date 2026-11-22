import { NextResponse } from "next/server";
import { getStore } from "@/lib/store/file-store";
import { exportCalendarCsv } from "@/lib/social/export";
import { isTrustedAdminRequest, SITE_URL } from "@/lib/site";

export async function GET(req: Request) {
  if (!isTrustedAdminRequest(req.headers)) return new NextResponse("Not found", { status: 404 });
  // Eksportuje wszystkie pozycje z kolumną status — do ręcznego planowania wolno brać wyłącznie wiersze approved/scheduled z prawami.
  const csv = exportCalendarCsv(getStore().read(), SITE_URL, true);
  return new NextResponse("﻿" + csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="zoo24-social-calendar.csv"', "X-Robots-Tag": "noindex" },
  });
}
