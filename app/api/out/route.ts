// Wyjście do usługodawcy z agregowanym licznikiem (bez IP, cookies, ID użytkownika).
import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/store/file-store";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("b") ?? "";
  const t = req.nextUrl.searchParams.get("t") === "phone" ? "phone" : "site";
  const store = getStore();
  const b = store.read().businesses.find((x) => x.id === id && x.status === "published");
  if (!b) return new NextResponse("Nie znaleziono", { status: 404 });
  const target = t === "phone"
    ? (b.phonePublic ? `tel:${b.phonePublic.replace(/[^\d+]/g, "")}` : null)
    : (b.websiteUrl && /^https:\/\//i.test(b.websiteUrl) ? b.websiteUrl : null); // tylko https (bez javascript:/data:)
  if (!target) return new NextResponse("Brak potwierdzonych danych kontaktowych", { status: 404 });
  // Prefetch/boty nie zawyżają licznika (agregat i tak jest przybliżeniem, nie rezerwacją).
  const purpose = `${req.headers.get("sec-purpose") ?? ""} ${req.headers.get("purpose") ?? ""}`;
  const bot = /bot|crawl|spider|preview/i.test(req.headers.get("user-agent") ?? "");
  if (/prefetch/i.test(purpose) || bot) return NextResponse.redirect(target, 302);
  const day = new Date().toISOString().slice(0, 10);
  const type = t === "phone" ? "business_phone_outbound" : "business_site_outbound";
  await store.transact((s) => {
    const ev = s.events.find((e) => e.day === day && e.type === type && e.ref === b.id);
    if (ev) ev.count += 1;
    else s.events.push({ day, type, ref: b.id, count: 1, demo: b.demo });
  });
  return NextResponse.redirect(target, 302);
}
