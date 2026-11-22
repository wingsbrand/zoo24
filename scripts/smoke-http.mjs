// Smoke test HTTP lokalnego prototypu (wymaga `npm run dev`). Sprawdza statusy i noindex.
const base = process.env.ZOO24_SITE_URL ?? "http://localhost:3024";
const cases = [
  ["/", 200], ["/uslugi/groomer/warszawa", 200], ["/poradniki/jak-wybrac-groomera", 200],
  ["/poradniki/pielegnacja-psa-zima", 404], // needs_review => niepubliczny
  ["/uslugi/groomer/krakow", 200], ["/uslugi/groomer/zielona-gora", 404], ["/firma/nie-istnieje-x1", 404],
  ["/demo-legacy/poradnik-wybor-groomera", 301, "/poradniki/jak-wybrac-groomera"],
  ["/demo-legacy/hotel-dla-psa-poradnik", 404], // needs_review
  ["/demo-legacy/produkt/karma-xyz-12kg", 404], // blanket na / odrzucony
  ["/demo-legacy/produkt/szelki-abc", 404], // produkt -> listing odrzucony
  ["/demo-legacy/promocja-black-friday-2023", 410],
  ["/demo-legacy/kategoria/akwarystyka", 404], // brak decyzji
  ["/cokolwiek/niezwiazanego", 404],
  ["/sitemap.xml", 404], // poza produkcją nie serwowana
  ["/robots.txt", 200],
  ["/admin", 200],
];
let fail = 0;
for (const [p, status, loc] of cases) {
  const r = await fetch(base + p, { redirect: "manual" });
  const location = r.headers.get("location");
  const robots = r.headers.get("x-robots-tag") ?? "";
  const okStatus = r.status === status;
  const okLoc = !loc || (location && new URL(location).pathname === loc);
  const okNoindex = /noindex/.test(robots);
  const ok = okStatus && okLoc && okNoindex;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"} ${p} -> ${r.status}${location ? " " + new URL(location).pathname : ""} [X-Robots-Tag: ${robots || "BRAK"}]`);
}
const robotsBody = await (await fetch(base + "/robots.txt")).text();
const disallow = /Disallow: \/\s*$/m.test(robotsBody);
console.log(`${disallow ? "PASS" : "FAIL"} robots.txt zawiera 'Disallow: /' (staging/local)`);
const html = await (await fetch(base + "/firma/salon-futrzak-d01")).text();
const metaNoindex = /<meta name="robots" content="noindex/.test(html);
const demoBadge = html.includes("DEMO");
const noRating = !/AggregateRating|ratingValue|★/.test(html);
console.log(`${metaNoindex ? "PASS" : "FAIL"} profil DEMO ma meta robots noindex`);
console.log(`${demoBadge ? "PASS" : "FAIL"} profil DEMO ma oznaczenie DEMO`);
console.log(`${noRating ? "PASS" : "FAIL"} brak ocen/gwiazdek/AggregateRating`);
if (!disallow || !metaNoindex || !demoBadge || !noRating) fail++;
console.log(fail ? `SMOKE: FAIL (${fail})` : "SMOKE: PASS");
process.exit(fail ? 1 : 0);
