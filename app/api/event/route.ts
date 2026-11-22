// Agregowany licznik zdarzeń (bez cookies, IP, ID użytkownika) — nie wymaga zgody na śledzenie.
// Dozwolone: article_to_directory, directory_search. Kliknięcie ≠ pozyskany klient.
import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/store/file-store";

const ALLOWED = new Set(["article_to_directory", "directory_search"]);
const REF = /^[a-z0-9/_-]{1,120}$/;

export async function POST(req: NextRequest) {
  let body: { type?: string; ref?: string } = {};
  try { body = await req.json(); } catch { /* sendBeacon może wysłać text/plain */ }
  const type = String(body.type ?? "");
  const ref = String(body.ref ?? "").toLowerCase();
  if (!ALLOWED.has(type) || !REF.test(ref)) return new NextResponse(null, { status: 400 });
  // Tylko z własnej strony (sendBeacon wysyła Origin) — utrudnia zawyżanie metryk z zewnątrz.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return new NextResponse(null, { status: 403 });
  if (/bot|crawl|spider|preview/i.test(req.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
  const day = new Date().toISOString().slice(0, 10);
  const store = getStore();
  // ref musi wskazywać istniejący zasób — brak tworzenia dowolnych wierszy (rozdmuchiwanie magazynu).
  const s0 = store.read();
  const known = type === "article_to_directory"
    ? s0.articles.some((a) => a.slug === ref && a.status === "published")
    : /^(groomer|hotel-dla-zwierzat)\/(warszawa|krakow|lodz|wroclaw|poznan|gdansk|szczecin|bydgoszcz|lublin|bialystok)$/.test(ref);
  if (!known) return new NextResponse(null, { status: 422 });
  const demo = process.env.ZOO24_ENV !== "production"; // zdarzenia z lokalnego/stagingu nie trafiają do raportu live
  await store.transact((s) => {
    const ev = s.events.find((e) => e.day === day && e.type === type && e.ref === ref && e.demo === demo);
    if (ev) ev.count += 1;
    else s.events.push({ day, type: type as "article_to_directory" | "directory_search", ref, count: 1, demo });
  });
  return new NextResponse(null, { status: 204 });
}
