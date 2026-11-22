// DANE DEMO — fikcyjne, oznaczone `demo: true`, nieindeksowane, nie przedstawiają realnych firm.
// Domeny example.com/.test są zarezerwowane (RFC 2606). Brak prawdziwych numerów telefonów.
import fs from "node:fs";
import path from "node:path";
import type { AppState, Article, Business, LegacyUrl, SocialAsset, SocialPost } from "../types";
import { contentHash } from "../social/hash";
import { warsawLocalToUtcIso } from "../time";
import { emptyOpsState } from "../ops/types";
import { loadRealBusinesses } from "../catalog/real-businesses";

const SEED_DATE = "2026-11-22T09:00:00.000Z";

const biz = (
  id: string, name: string, category: Business["category"], city: Business["city"], services: string[],
  extra: Partial<Business> = {},
): Business => ({
  id,
  slug: `${name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ł/g, "l").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${id}`,
  name: `DEMO — ${name}`,
  category, city,
  serviceArea: null,
  websiteUrl: `https://example.com/demo/${id}`,
  phonePublic: null, // DEMO: brak numeru, aby nie sugerować realnego kontaktu
  description: "Fikcyjny profil demonstracyjny. Służy wyłącznie do testów układu strony — nie jest realną firmą.",
  services,
  petTypes: ["psy"],
  addressText: null,
  status: "published",
  demo: true,
  sourceNote: "DEMO — brak źródła (rekord syntetyczny)",
  checkedAt: null,
  sponsored: false,
  ...extra,
});

// Zestaw celowo różnorodny: długie nazwy, brak www, usługi mobilne, różne zwierzęta — do testów UI, filtrów i stronicowania.
export const DEMO_BUSINESSES: Business[] = [
  biz("d01", "Salon Futrzak", "groomer", "warszawa", ["kąpiel", "strzyżenie", "pielęgnacja pazurów"], { petTypes: ["psy"] }),
  biz("d02", "Pracownia Ogonek", "groomer", "warszawa", ["trymowanie", "strzyżenie", "kąpiel"], { petTypes: ["psy", "koty"] }),
  biz("d03", "Grooming Łapka", "groomer", "bialystok", ["kąpiel", "pielęgnacja pazurów"], { petTypes: ["psy", "koty"] }),
  biz("d04", "Hotel Psia Przystań", "hotel-dla-zwierzat", "warszawa", ["pobyt dzienny", "pobyt nocny", "spacery"], { petTypes: ["psy"] }),
  biz("d05", "Kocie Zacisze", "hotel-dla-zwierzat", "bialystok", ["pobyt nocny"], { petTypes: ["koty"] }),
  { ...biz("d06", "Salon Szkic", "groomer", "bialystok", ["kąpiel"]), status: "draft" },
  biz("d07", "Mobilny Groomer Na Kółkach — dojazd do klienta na terenie całej Warszawy i okolic", "groomer", "warszawa", ["kąpiel", "strzyżenie", "dojazd do klienta"], { petTypes: ["psy", "koty"], serviceArea: "Warszawa i powiat warszawski zachodni (DEMO)", websiteUrl: null }),
  biz("d08", "Studio Sierść i Spółka", "groomer", "warszawa", ["trymowanie", "strzyżenie"], { petTypes: ["psy"] }),
  biz("d09", "Kot w Butach — pielęgnacja kotów", "groomer", "warszawa", ["kąpiel", "strzyżenie"], { petTypes: ["koty"] }),
  biz("d10", "Psi Fryzjer Mokotów", "groomer", "warszawa", ["strzyżenie", "pielęgnacja pazurów"], { petTypes: ["psy"], websiteUrl: null }),
  biz("d11", "Groomownia Praga", "groomer", "warszawa", ["kąpiel", "trymowanie", "pielęgnacja pazurów"], { petTypes: ["psy"] }),
  biz("d12", "Pensjonat Leśna Polana", "hotel-dla-zwierzat", "warszawa", ["pobyt nocny", "spacery", "pobyt dzienny"], { petTypes: ["psy", "koty"] }),
  biz("d13", "Hotelik Mruczek", "hotel-dla-zwierzat", "warszawa", ["pobyt nocny"], { petTypes: ["koty"] }),
  biz("d14", "Psia Przechowalnia Białystok", "hotel-dla-zwierzat", "bialystok", ["pobyt dzienny", "pobyt nocny"], { petTypes: ["psy"] }),
  biz("d15", "Salon Elegancki Pies", "groomer", "warszawa", ["strzyżenie", "kąpiel"], { petTypes: ["psy"] }),
  biz("d16", "Pracownia Pielęgnacji Zwierząt Domowych „Czysta Łapa” s.c.", "groomer", "bialystok", ["kąpiel", "strzyżenie", "trymowanie"], { petTypes: ["psy", "koty"] }),
];

const art = (a: Omit<Article, "demo" | "updatedAt" | "authorDisplay" | "disclosure"> & Partial<Article>): Article => ({
  demo: true,
  updatedAt: SEED_DATE,
  authorDisplay: "Redakcja ZOO24 (DEMO — tekst do weryfikacji redakcyjnej)",
  disclosure: null,
  ...a,
});

export const DEMO_ARTICLES: Article[] = [
  art({
    slug: "jak-wybrac-groomera",
    title: "Jak wybrać groomera — pytania przed pierwszą wizytą (DEMO)",
    summary: "Checklista pytań do salonu pielęgnacji. Szkic demonstracyjny, wymaga weryfikacji redakcyjnej.",
    body: [
      "To jest szkic demonstracyjny poradnika. Przed publikacją redaktor musi zweryfikować treść i źródła.",
      "Przed wizytą warto zapytać salon o zakres usług, doświadczenie z daną rasą i sposób postępowania ze zwierzętami zestresowanymi.",
      "Ten tekst nie zawiera porad weterynaryjnych. W sprawach zdrowia zwierzęcia skontaktuj się z lekarzem weterynarii.",
    ],
    checklist: ["Jakie usługi obejmuje cennik?", "Czy salon pracuje z moją rasą/wielkością psa?", "Jak wygląda pierwsza wizyta adaptacyjna?", "Jakie są zasady odwoływania wizyt?"],
    sources: [{ label: "DEMO — źródła do uzupełnienia przez redaktora", url: null }],
    status: "published",
    publishedAt: SEED_DATE,
    relatedServicePaths: ["/uslugi/groomer/warszawa", "/uslugi/groomer/bialystok"],
  }),
  art({
    slug: "hotel-dla-psa-checklista",
    title: "Hotel dla psa — co sprawdzić przed pobytem (DEMO)",
    summary: "Lista rzeczy do sprawdzenia przed rezerwacją pobytu. Szkic demonstracyjny.",
    body: [
      "Szkic demonstracyjny. Wymaga weryfikacji faktów i źródeł przed publikacją.",
      "Zapytaj o warunki pobytu, wymagane dokumenty, plan dnia i kontakt w razie nagłej sytuacji.",
    ],
    checklist: ["Jakie dokumenty są wymagane?", "Jak wyglądają spacery i plan dnia?", "Jak hotel kontaktuje się z opiekunem?"],
    sources: [{ label: "DEMO — źródła do uzupełnienia przez redaktora", url: null }],
    status: "published",
    publishedAt: SEED_DATE,
    relatedServicePaths: ["/uslugi/hotel-dla-zwierzat/warszawa", "/uslugi/hotel-dla-zwierzat/bialystok"],
  }),
  art({
    slug: "pielegnacja-psa-zima",
    title: "Pielęgnacja psa zimą — praktyczne wskazówki (DEMO)",
    summary: "Szkic poradnika sezonowego, status: do recenzji.",
    body: ["Szkic w kolejce recenzji — nie jest widoczny publicznie."],
    checklist: [],
    sources: [{ label: "DEMO — brak źródeł", url: null }],
    status: "needs_review",
    publishedAt: null,
    relatedServicePaths: ["/uslugi/groomer/warszawa"],
  }),
];

// Fikcyjne stare URL — prefiks /demo-legacy/ celowo, aby nie udawać realnej struktury zoo24.pl.
const legacy = (l: Partial<LegacyUrl> & Pick<LegacyUrl, "oldPath" | "segment">): LegacyUrl => ({
  proposedAction: null, targetPath: null, currentHttpStatus: null, contentRightsVerified: "unknown",
  semanticMatchExplanation: null, reviewer: null, approvedAt: null, status: "draft",
  historicalClicks: null, dataSource: "DEMO", demo: true, ...l,
});

export const DEMO_LEGACY_URLS: LegacyUrl[] = [
  legacy({
    oldPath: "/demo-legacy/poradnik-wybor-groomera", segment: "B", proposedAction: "redirect_301",
    targetPath: "/poradniki/jak-wybrac-groomera", contentRightsVerified: "yes",
    semanticMatchExplanation: "Stary poradnik o wyborze groomera odpowiada tej samej intencji informacyjnej co nowy poradnik-checklista.",
    reviewer: "DEMO-reviewer", approvedAt: SEED_DATE, status: "approved",
  }),
  legacy({
    oldPath: "/demo-legacy/hotel-dla-psa-poradnik", segment: "B", proposedAction: "redirect_301",
    targetPath: "/poradniki/hotel-dla-psa-checklista", contentRightsVerified: "yes",
    semanticMatchExplanation: "Dawny poradnik o przygotowaniu psa do hotelu, ta sama intencja co nowa checklista hotelowa.",
    status: "needs_review",
  }),
  legacy({ oldPath: "/demo-legacy/produkt/karma-xyz-12kg", segment: "C", proposedAction: "redirect_301", targetPath: "/",
    semanticMatchExplanation: "Próba blanket redirectu karty produktu na stronę główną — musi zostać odrzucona.",
    reviewer: "DEMO-reviewer", approvedAt: SEED_DATE, status: "approved" }),
  legacy({ oldPath: "/demo-legacy/produkt/szelki-abc", segment: "C", proposedAction: "redirect_301", targetPath: "/uslugi/groomer/warszawa",
    semanticMatchExplanation: "Karta produktu (szelki) przekierowana na listing groomerów — zmiana intencji, musi zostać odrzucona.",
    reviewer: "DEMO-reviewer", approvedAt: SEED_DATE, status: "approved" }),
  legacy({ oldPath: "/demo-legacy/promocja-black-friday-2023", segment: "E", proposedAction: "gone_410",
    reviewer: "DEMO-reviewer", approvedAt: SEED_DATE, status: "approved" }),
  legacy({ oldPath: "/demo-legacy/produkt/obroza-niedostepna", segment: "C", proposedAction: "not_found_404", status: "approved",
    reviewer: "DEMO-reviewer", approvedAt: SEED_DATE }),
  legacy({ oldPath: "/demo-legacy/kategoria/akwarystyka", segment: "C" }), // brak decyzji -> 404
];

interface DraftJson {
  id: string; platform: SocialPost["platform"]; pillar: SocialPost["pillar"]; topic: string; copy: string; cta: string;
  targetPath: string; utm: SocialPost["utm"]; assetId: string | null; altText: string; sourceRefs: string[];
  disclosure: string | null; scheduledAtLocal: string; status: string;
}

function readJson<T>(rel: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(/*turbopackIgnore: true*/ process.cwd(), rel), "utf8")) as T;
  } catch {
    return null;
  }
}

export function loadDraftPosts(): SocialPost[] {
  const drafts = readJson<DraftJson[]>("docs/social/drafts-14d.json") ?? [];
  return drafts.map((d) => {
    const base = {
      platform: d.platform, copy: d.copy, cta: d.cta, targetPath: d.targetPath, utm: d.utm,
      assetId: d.assetId, altText: d.altText, disclosure: d.disclosure,
      scheduledAt: warsawLocalToUtcIso(d.scheduledAtLocal), sourceRefs: d.sourceRefs ?? [], sponsored: false,
    };
    return {
      id: d.id, pillar: d.pillar, topic: d.topic, ...base,
      status: "draft" as const, version: 1, contentHash: contentHash(base),
      approvedVersion: null, approvedHash: null, approvedBy: null, approvedAt: null,
      leaseOwner: null, leaseUntil: null, externalPostId: null, publishedAt: null, lastError: null, demo: true,
    };
  });
}

export function loadAssets(): SocialAsset[] {
  const assets = readJson<SocialAsset[]>("docs/social/asset-register.json") ?? [];
  return assets.map((a) => ({ ...a, demo: true }));
}

/** Prawdziwe (nie-DEMO) treści redakcyjne z content/blog/*.json — startują jako needs_review. */
/** Treści z repo: content/blog (dawne adresy /blog/*) i content/guides (portal V3). Zawsze trafiają jako nieopublikowane. */
export function loadContentArticles(): Article[] {
  return ["blog", "guides"].flatMap((sub) => {
    const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), "content", sub);
    try {
      return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => {
        const a = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Article;
        return { ...a, demo: false, status: a.status === "published" ? "needs_review" : a.status, publishedAt: null } as Article;
      });
    } catch {
      return [];
    }
  });
}

export function buildSeedState(opts: { production?: boolean } = {}): AppState {
  // Produkcja: bez publicznych rekordów DEMO (fikcyjne firmy, artykuły, przykładowe stare URL).
  const prod = opts.production ?? process.env.ZOO24_ENV === "production";
  return {
    schemaVersion: 1,
    businesses: [...(prod ? [] : structuredClone(DEMO_BUSINESSES)), ...loadRealBusinesses()],
    articles: [...(prod ? [] : structuredClone(DEMO_ARTICLES)), ...loadContentArticles()],
    legacyUrls: prod ? [] : structuredClone(DEMO_LEGACY_URLS),
    socialPosts: loadDraftPosts(),
    socialAssets: loadAssets(),
    attempts: [],
    settings: {
      publishEnabled: false, // domyślnie WSTRZYMANE (kill switch aktywny)
      channels: { facebook: true, instagram: true },
      socialMode: 0,
      maxPostsPerChannelWeek: 3,
      staleAfterMinutes: 30,
    },
    audit: [],
    events: [],
    submissions: [],
    ops: emptyOpsState(),
  };
}
