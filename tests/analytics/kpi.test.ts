import { describe, expect, it } from "vitest";
import { buildDashboard, renderWeeklyReport, tileFromSource, HISTORICAL_OWNER_CLAIM } from "@/lib/analytics/kpi";
import { FixtureSource, NoAccessSource, getReadSources } from "@/lib/integrations/read-sources";
import { buildUtmUrl, validateUtm } from "@/lib/analytics/utm";
import { buildSeedState } from "@/lib/demo/seed";
import { redact, redactString } from "@/lib/security/redact";

const NOW = new Date("2026-11-22T10:00:00Z");

describe("P0 analytics: brak danych => N/A, nigdy 0", () => {
  it("bez podłączonych źródeł wszystkie KPI zewnętrzne to N/A z powodem", async () => {
    const d = await buildDashboard(buildSeedState(), getReadSources("tests/__no_exports__"), NOW);
    for (const t of [...d.organic, ...d.social, ...d.directory, ...d.money]) {
      expect(t.value).toBeNull();
      expect(t.display).toMatch(/^N\/A — /);
      expect(t.display).not.toMatch(/^0/);
    }
    expect(d.connections.every((c) => c.accessStatus === "no_access")).toBe(true);
    expect(d.legacyTop5).toEqual([]);
  });

  it("okres = 28 pełnych dni kończących się D-3", async () => {
    const d = await buildDashboard(buildSeedState(), getReadSources("tests/__no_exports__"), NOW);
    expect(d.period).toEqual({ start: "2026-10-23", end: "2026-11-19" });
  });

  it("historyczny claim jest osobny, niezweryfikowany i nie jest KPI", async () => {
    const d = await buildDashboard(buildSeedState(), getReadSources("tests/__no_exports__"), NOW);
    expect(d.claim).toBe(HISTORICAL_OWNER_CLAIM);
    expect(d.claim.verified).toBe(false);
    const keys = [...d.organic, ...d.social, ...d.directory, ...d.money, ...d.ops].map((t) => t.key);
    expect(keys).not.toContain("historical_owner_claim");
    expect(JSON.stringify([...d.organic, ...d.social])).not.toContain("100");
  });

  it("zdarzenia DEMO nie trafiają do raportu (N/A), metryka podłączona z wartością 0 pokazuje 0", async () => {
    const s = buildSeedState();
    s.events.push({ day: "2026-11-10", type: "business_site_outbound", ref: "d01", count: 7, demo: true });
    const d = await buildDashboard(s, getReadSources("tests/__no_exports__"), NOW);
    expect(d.directory[0].value).toBeNull();
    const t = tileFromSource("gsc_clicks", "x", "k", await new FixtureSource("gsc", { gsc_clicks: 0 }, "connected").fetch28d("a", "b"));
    expect(t.value).toBe(0);
    const na = tileFromSource("gsc_clicks", "x", "k", await new FixtureSource("gsc", { gsc_clicks: null }, "connected").fetch28d("a", "b"));
    expect(na.display).toMatch(/N\/A — metryka niedostępna/);
  });

  it("raport tygodniowy zawiera źródła i N/A", async () => {
    const d = await buildDashboard(buildSeedState(), { gsc: new NoAccessSource("gsc"), ga4: new NoAccessSource("ga4"), meta_fb: new NoAccessSource("meta_fb"), meta_ig: new NoAccessSource("meta_ig") }, NOW);
    const txt = renderWeeklyReport(d, "2026-W48", ["a", "b", "c", "d"]);
    expect(txt).toContain("N/A");
    expect(txt).toContain("źródło: gsc");
    expect(txt).toContain("NIEZWERYFIKOWANA");
    expect(txt).not.toContain("4) d");
  });
});

describe("eksport ręczny (Windsor.ai → data/exports)", () => {
  it("GA4 podłączone z prawdziwym 0 pokazuje 0 ze statusem export_manual; FB/IG bez dostępu = N/A", async () => {
    const d = await buildDashboard(buildSeedState(), getReadSources("data/exports"), NOW);
    const org = d.organic.find((t) => t.key === "ga4_organic_sessions")!;
    expect(org.value).toBe(0);
    expect(org.accessStatus).toBe("export_manual");
    expect(org.display).toBe("0");
    expect(d.social.find((t) => t.key === "facebook_reach")!.display).toMatch(/^N\/A/);
    expect(d.organic.find((t) => t.key === "gsc_clicks")!.display).toMatch(/^N\/A/);
    expect(d.historicalVerified.verified).toBe(true);
    expect(JSON.stringify(d.organic)).not.toContain("33");
  });
});

describe("UTM i redakcja PII", () => {
  it("walidator UTM odrzuca e-mail, telefon i wielkie litery", () => {
    expect(validateUtm({ source: "facebook", medium: "organic_social", campaign: "zoo24_relaunch_2026", content: "soc-001" })).toEqual([]);
    expect(validateUtm({ source: "facebook", medium: "organic_social", campaign: "x", content: "jan@example.com" })).toContain("UTM_PII_CONTENT");
    expect(validateUtm({ source: "facebook", medium: "organic_social", campaign: "x", content: "600700800" })).toContain("UTM_PII_CONTENT");
    expect(validateUtm({ source: "facebook", medium: "organic_social", campaign: "Promo", content: "a" })).toContain("UTM_INVALID_CAMPAIGN");
    expect(buildUtmUrl("http://localhost:3024", "/poradniki", { source: "instagram", medium: "organic_social", campaign: "zoo24_relaunch_2026", content: "soc-002" }))
      .toBe("http://localhost:3024/poradniki?utm_source=instagram&utm_medium=organic_social&utm_campaign=zoo24_relaunch_2026&utm_content=soc-002");
  });

  it("wszystkie drafty z kalendarza mają poprawne UTM zgodne z platformą", () => {
    for (const p of buildSeedState().socialPosts) {
      expect(validateUtm(p.utm)).toEqual([]);
      expect(p.utm.source).toBe(p.platform);
    }
  });

  it("redact maskuje tokeny, nagłówki, e-maile, telefony i klucze sekretów", () => {
    expect(redactString("GET /me?access_token=EAAB123456789012345&x=1")).not.toContain("EAAB123456789012345");
    expect(redactString("Authorization: Bearer abc.def.ghi")).toContain("Bearer [REDACTED]");
    expect(redactString("kontakt jan.kowalski@example.com tel 600 700 800")).toBe("kontakt [REDACTED_EMAIL] tel [REDACTED_PHONE]");
    expect(redact({ appSecret: "s3cr3t", nested: { token: "t" }, ok: "x" })).toEqual({ appSecret: "[REDACTED]", nested: { token: "[REDACTED]" }, ok: "x" });
  });
});
