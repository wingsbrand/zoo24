// Catch-all dla nieznanych ścieżek (w tym starych URL dawnego sklepu). Trasy aplikacji mają pierwszeństwo.
// 301/308 wyłącznie dla zatwierdzonych i zwalidowanych par (R1–R12); 410 dla zatwierdzonego gone; reszta 404.
// To SYMULACJA lokalna — mapa produkcyjna dla zoo24.pl wymaga osobnej zgody właściciela.
import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/lib/store/file-store";
import { buildPageRegistry, createLegacyResolver } from "@/lib/seo";
import { IS_PRODUCTION } from "@/lib/site";

const page = (title: string, body: string) =>
  `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} | ZOO24</title></head>` +
  `<body style="font-family:system-ui;max-width:40rem;margin:3rem auto;padding:0 1rem"><h1>${title}</h1><p>${body}</p>` +
  `<p><a href="/poradniki">Poradniki</a> · <a href="/uslugi">Usługi</a> · <a href="/">Strona główna</a></p></body></html>`;

function handle(req: NextRequest): NextResponse {
  const state = getStore().read();
  const registry = buildPageRegistry(state);
  const { resolve } = createLegacyResolver(state.legacyUrls, registry, { requireUnblocked: IS_PRODUCTION });
  const r = resolve(req.nextUrl.pathname);
  const headers = { "X-Robots-Tag": "noindex", "X-Zoo24-Legacy-Reason": r.reason, "Content-Type": "text/html; charset=utf-8" };
  if ((r.status === 301 || r.status === 308) && r.location) {
    return new NextResponse(null, { status: r.status, headers: { ...headers, Location: new URL(r.location, req.nextUrl.origin).toString() } });
  }
  if (r.status === 410) {
    return new NextResponse(page("Strona usunięta (410)", "Ta strona została trwale usunięta. Zajrzyj do poradników albo znajdź usługę w swoim mieście."), { status: 410, headers });
  }
  return new NextResponse(page("Nie znaleziono strony (404)", "Ta strona nie istnieje albo zmieniła adres. Zajrzyj do poradników albo znajdź usługę w swoim mieście."), { status: 404, headers });
}

export const dynamic = "force-dynamic";
export const GET = handle;
export const HEAD = handle;
