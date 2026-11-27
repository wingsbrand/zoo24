// Pomiar wydajności ZOO24 (backlog V4 poz. 6). Lab ≠ field: wyniki laboratoryjne (HTTP/HTML, Lighthouse z PSI)
// i dane terenowe (CrUX z PSI) raportujemy osobno; brak danych = „brak danych”, nigdy wartość zgadnięta.
// Użycie: node scripts/perf-check.mjs [baseUrl] [--psi]   (domyślnie https://zoo24.pl; --psi woła PageSpeed API bez klucza)
const DEFAULT_PATHS = ["/", "/poradniki", "/uslugi", "/narzedzia/kalkulator-akwarium"];

/** Czysta analiza HTML — bez sieci, testowalna. */
export function analyzeHtml(html) {
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  const fill = (t) => /data-nimg="fill"/.test(t);
  const hasDim = (t) => /\bwidth=/.test(t) && /\bheight=/.test(t);
  return {
    htmlBytes: Buffer.byteLength(html, "utf8"),
    images: imgs.length,
    imagesLazy: imgs.filter((t) => /loading="lazy"/.test(t)).length,
    // CLS-ryzyko: obraz bez width/height i bez trybu fill (fill ma rezerwację z kontenera)
    imagesWithoutDimensions: imgs.filter((t) => !hasDim(t) && !fill(t)).length,
    imagesWithoutAlt: imgs.filter((t) => !/\balt=/.test(t)).length,
    scripts: (html.match(/<script\b/gi) ?? []).length,
    renderBlockingStylesheets: (html.match(/<link\b[^>]*rel="stylesheet"[^>]*>/gi) ?? []).length,
  };
}

/** Rozdziela dane lab (Lighthouse) i field (CrUX) z odpowiedzi PSI; brak sekcji → null. */
export function summarizePsi(json) {
  const lh = json?.lighthouseResult?.audits;
  const field = json?.loadingExperience?.metrics;
  const ms = (k) => (lh?.[k]?.numericValue != null ? Math.round(lh[k].numericValue) : null);
  return {
    lab: lh ? { lcpMs: ms("largest-contentful-paint"), cls: lh["cumulative-layout-shift"]?.numericValue ?? null, tbtMs: ms("total-blocking-time"), score: json.lighthouseResult.categories?.performance?.score ?? null } : null,
    field: field ? { lcpMs: field.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? null, inpMs: field.INTERACTION_TO_NEXT_PAINT?.percentile ?? null, cls: field.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile ?? null, category: json.loadingExperience.overall_category ?? null } : null,
  };
}

async function measure(base, path) {
  const t0 = performance.now();
  const r = await fetch(base + path, { redirect: "manual" });
  const html = await r.text();
  return { path, status: r.status, totalMs: Math.round(performance.now() - t0), cacheControl: r.headers.get("cache-control"), ...analyzeHtml(html) };
}

async function psi(url) {
  const r = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&url=${encodeURIComponent(url)}`);
  if (!r.ok) return { error: `PSI HTTP ${r.status}` };
  return summarizePsi(await r.json());
}

if (process.argv[1]?.endsWith("perf-check.mjs")) {
  const args = process.argv.slice(2);
  const base = (args.find((a) => a.startsWith("http")) ?? "https://zoo24.pl").replace(/\/$/, "");
  const out = [];
  for (const p of DEFAULT_PATHS) {
    const row = await measure(base, p);
    if (args.includes("--psi")) row.psi = await psi(base + p);
    out.push(row);
  }
  console.log(JSON.stringify({ base, measuredAt: new Date().toISOString(), note: "totalMs z jednej maszyny to pomiar laboratoryjny, nie CrUX", pages: out }, null, 2));
}
