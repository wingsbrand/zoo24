// Kontrola canonical / robots / statusów dla wariantów URL (regresja SEO po zmianach UI). Wymaga `npm run dev`.
const base = process.env.ZOO24_SITE_URL ?? "http://localhost:3024";
const cases = [
  // [ścieżka, oczekiwany status, oczekiwany canonical (ścieżka) lub null, robots musi zawierać "noindex"?]
  ["/uslugi/groomer/warszawa", 200, "/uslugi/groomer/warszawa", true],              // < 3 realnych firm => noindex
  ["/uslugi/groomer/warszawa?zwierze=koty", 200, "/uslugi/groomer/warszawa", true],
  ["/uslugi/groomer/warszawa?strona=2", 200, "/uslugi/groomer/warszawa", true],
  ["/szukaj?usluga=groomer&miasto=zielona%20gora", 200, null, true],
  ["/poradniki?temat=rasy-psow", 200, "/poradniki", true],
  ["/poradniki?q=groomer", 200, "/poradniki", true],
  ["/polityka-prywatnosci", 200, null, true],
  ["/regulamin", 200, null, true],
  ["/dodaj-firme", 200, null, true],
  ["/blog/kot-syberyjski-n67", 404, null, true],
  ["/blog/kot-brytyjski-n66", 404, null, true], // needs_review => niepubliczny
  ["/firma/salon-futrzak-d01", 200, "/firma/salon-futrzak-d01", true],
];
let fail = 0;
for (const [p, status, canon, mustNoindex] of cases) {
  const r = await fetch(base + p, { redirect: "manual" });
  const h = await r.text();
  const c = (h.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] ?? null;
  const rob = (h.match(/<meta name="robots" content="([^"]+)"/) || [])[1] ?? "";
  const xr = r.headers.get("x-robots-tag") ?? "";
  const okS = r.status === status;
  const okC = canon === null || (c && new URL(c, base).pathname === canon && !new URL(c, base).search);
  const okR = !mustNoindex || /noindex/.test(rob + " " + xr);
  const ok = okS && okC && okR;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"} ${r.status} ${p} canonical=${c ?? "-"} robots=${rob || "-"} x-robots=${xr || "-"}`);
}
console.log(fail ? `SEO META: FAIL (${fail})` : "SEO META: PASS");
process.exit(fail ? 1 : 0);
