// Agregowany licznik zdarzeń (bez cookies, IP, ID użytkownika) — nie wymaga zgody na śledzenie.
// Dozwolone: patrz lib/analytics/events.ts (poradnik→katalog, narzędzia: wynik/eksport, wyszukiwanie bez wyników). Kliknięcie ≠ pozyskany klient.
import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/store/file-store";
import { bumpEvent, EVENT_REF_SHAPE, isClientEventType, isKnownEventRef } from "@/lib/analytics/events";


export async function POST(req: NextRequest) {
  let body: { type?: string; ref?: string } = {};
  try { body = await req.json(); } catch { /* sendBeacon może wysłać text/plain */ }
  const type = String(body.type ?? "");
  const ref = String(body.ref ?? "").toLowerCase();
  if (!isClientEventType(type) || !EVENT_REF_SHAPE.test(ref)) return new NextResponse(null, { status: 400 });
  // Tylko z własnej strony (sendBeacon wysyła Origin) — utrudnia zawyżanie metryk z zewnątrz.
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) return new NextResponse(null, { status: 403 });
  if (/bot|crawl|spider|preview/i.test(req.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
  const day = new Date().toISOString().slice(0, 10);
  const store = getStore();
  // ref musi wskazywać istniejący zasób — brak tworzenia dowolnych wierszy (rozdmuchiwanie magazynu).
  const s0 = store.read();
  const known = isKnownEventRef(type, ref, s0);
  if (!known) return new NextResponse(null, { status: 422 });
  const demo = process.env.ZOO24_ENV !== "production"; // zdarzenia z lokalnego/stagingu nie trafiają do raportu live
  await store.transact((s) => {
    bumpEvent(s.events, day, type, ref, demo);
  });
  return new NextResponse(null, { status: 204 });
}
