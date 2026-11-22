// Ręczne uruchomienie joba MOCK przez lokalny serwer (npm run dev musi działać).
// Użycie: npm run jobs:run -- social_publish_approved | social_queue_daily | seo_health_daily | weekly_kpi_report
// To NIE jest cron. Cykliczne działanie wymaga osobno wdrożonego schedulera po zgodzie właściciela.
const job = process.argv[2];
const base = process.env.ZOO24_SITE_URL ?? "http://localhost:3024";
if (!job) {
  console.error("Podaj nazwę joba.");
  process.exit(1);
}
const res = await fetch(`${base}/api/admin/jobs/${encodeURIComponent(job)}`, { method: "POST" });
console.log(res.status, JSON.stringify(await res.json(), null, 2));
