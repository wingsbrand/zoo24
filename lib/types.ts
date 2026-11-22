// ZOO24 — wspólne typy domenowe F1. Wszystkie daty w ISO UTC.

export type CategorySlug = "groomer" | "hotel-dla-zwierzat";
export type CitySlug =
  | "warszawa" | "krakow" | "lodz" | "wroclaw" | "poznan"
  | "gdansk" | "szczecin" | "bydgoszcz" | "lublin" | "bialystok";
export type PetType = "psy" | "koty";

// ---------- Zgłoszenia (formularze publiczne) ----------
export type SubmissionKind = "add_business" | "report_error" | "contact" | "recommend_place";
export interface Submission {
  code: string; // publiczny kod do sprawdzania statusu, np. ZG-7K3P9Q
  kind: SubmissionKind;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  processedAt: string | null;
  reason: string | null; // uzasadnienie decyzji moderatora (widoczne dla zgłaszającego)
  payload: Record<string, string>; // dane formularza po walidacji; e-mail tylko do weryfikacji, nie publikujemy
}

export interface Business {
  id: string;
  slug: string; // stabilny-slug-{shortId}
  name: string;
  category: CategorySlug;
  city: CitySlug;
  serviceArea: string | null;
  websiteUrl: string | null;
  phonePublic: string | null;
  description: string;
  services: string[];
  /** Dla jakich zwierząt (tylko potwierdzone dane; pusta tablica = brak informacji). */
  petTypes: PetType[];
  /** Adres firmy (tylko gdy firma publikuje go sama; usługi mobilne mogą nie mieć adresu). */
  addressText: string | null;
  status: "draft" | "published" | "hidden" | "removed";
  demo: boolean; // DEMO = fikcyjny rekord: noindex, badge, poza sitemap
  sourceNote: string;
  checkedAt: string | null;
  sponsored: boolean; // P1; w F1 zawsze false
}

export interface Article {
  slug: string;
  title: string;
  summary: string;
  body: string[]; // akapity
  checklist: string[];
  sources: { label: string; url: string | null }[];
  authorDisplay: string;
  status: "draft" | "needs_review" | "published";
  demo: boolean;
  publishedAt: string | null;
  updatedAt: string;
  relatedServicePaths: string[];
  disclosure: string | null;
  /** "/blog" = artykuł pod dawnym adresem bloga sklepu (zachowany URL), domyślnie "/poradniki". */
  basePath?: "/poradniki" | "/blog";
  /** Notatki dla redaktora (nie są publikowane). */
  reviewNotes?: string[];
  reviewedBy?: string | null;
  /** Decyzja redakcyjna związana z hashem treści (lib/ops/article-review.ts). */
  editorialDecision?: import("./ops/article-review").EditorialDecision;
  // ---------- Portal V3 (opcjonalne — stare artykuły działają bez nich) ----------
  /** Przypisanie do zwierzęcia: grupa nawigacyjna, opcjonalnie gatunek i rasa. */
  animal?: { group: import("./taxonomy/animals").GroupSlug; species?: string | null; breed?: string | null };
  /** Potrzeby opiekuna (druga oś nawigacji). */
  needs?: import("./taxonomy/animals").NeedSlug[];
  format?: import("./taxonomy/animals").ContentFormat;
  /** Klasa ryzyka (deklarowana); efektywna = effectiveRisk(risk, needs). */
  risk?: import("./taxonomy/animals").RiskClass;
  /** Kluczowe twierdzenia z dowodem (V3 §10): indeks źródła, opis dowodu, warunki zastosowania. */
  claims?: { text: string; sourceIndex: number; evidence: string; appliesTo?: string; accessedAt: string }[];
  /** Przegląd wymagany i wykonany — realna osoba albo jawnie AI; brak = oczekuje. */
  review?: {
    required: import("./taxonomy/animals").ReviewerRole;
    by: string | null; // np. "claude-ai-editor" albo id osoby w content/people
    byKind: "human" | "ai" | null;
    at: string | null;
    note?: string | null;
    /** Powód oczekiwania widoczny w panelu (np. „brak specjalisty od gadów”). */
    waitingReason?: string | null;
  };
  /** Termin kolejnego przeglądu treści (ISO). */
  reviewDueAt?: string | null;
  /** Historyczny adres starego zoo24.pl, który ten materiał zastępuje (mapa odzyskiwania). */
  legacyPath?: string | null;
  /** Korekta opublikowanego materiału: czeka na zatwierdzenie; do tego czasu publicznie widoczna jest poprzednia wersja. */
  revision?: { patch: Partial<Pick<Article, "title" | "summary" | "body" | "checklist" | "sources" | "claims">>; by: string; at: string; reason: string } | null;
}

// ---------- SEO ----------
export type Segment = "A" | "B" | "C" | "D" | "E";
export type ProposedAction =
  | "keep_200"
  | "edit_200"
  | "redirect_301"
  | "redirect_308"
  | "gone_410"
  | "not_found_404";
export type ReviewStatus = "draft" | "needs_review" | "approved" | "rejected";

export interface LegacyUrl {
  oldPath: string;
  segment: Segment;
  proposedAction: ProposedAction | null;
  targetPath: string | null;
  currentHttpStatus: number | null;
  contentRightsVerified: "yes" | "no" | "unknown";
  semanticMatchExplanation: string | null;
  reviewer: string | null;
  approvedAt: string | null;
  status: ReviewStatus;
  historicalClicks: number | null; // null = brak danych (N/A), nigdy 0 z braku danych
  dataSource: string; // "DEMO" w F1
  demo: boolean;
}

// ---------- Social ----------
export type Platform = "facebook" | "instagram";
export type PostStatus =
  | "draft"
  | "needs_review"
  | "approved"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed"
  | "rejected"
  | "held"
  | "cancelled";

export interface Utm {
  source: Platform;
  medium: "organic_social";
  campaign: string;
  content: string;
}

export interface SocialPost {
  id: string;
  platform: Platform;
  pillar: "A" | "B" | "C" | "D";
  topic: string;
  copy: string;
  cta: string;
  targetPath: string;
  utm: Utm;
  assetId: string | null;
  altText: string;
  sourceRefs: string[];
  disclosure: string | null;
  sponsored: boolean;
  scheduledAt: string | null; // UTC ISO
  status: PostStatus;
  version: number;
  contentHash: string;
  approvedVersion: number | null;
  approvedHash: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  leaseOwner: string | null;
  leaseUntil: string | null;
  externalPostId: string | null;
  publishedAt: string | null;
  lastError: string | null;
  demo: boolean;
}

export interface SocialAsset {
  id: string;
  description: string;
  licenseType: "own" | "licensed" | "provider_granted" | "cc_by" | "illustration" | "unknown";
  licenseProof: string | null;
  altText: string;
  rightsCheckedAt: string | null;
  expiresAt: string | null;
  demo: boolean;
}

export interface PublishAttempt {
  id: string;
  postId: string;
  attempt: number;
  idempotencyKey: string;
  status: "started" | "succeeded" | "failed_retryable" | "failed_permanent" | "unknown" | "skipped";
  errorCode: string | null;
  externalPostId: string | null;
  mock: boolean;
  at: string;
}

export interface OpsSettings {
  publishEnabled: boolean; // kill switch: false = wstrzymane
  channels: Record<Platform, boolean>;
  socialMode: 0 | 1;
  maxPostsPerChannelWeek: number;
  staleAfterMinutes: number;
}

export interface AuditEntry {
  at: string;
  actor: string;
  entity: string;
  entityId: string | null;
  action: string;
  meta: Record<string, unknown>;
}

export interface DirectoryEvent {
  day: string; // YYYY-MM-DD
  type: "business_site_outbound" | "business_phone_outbound" | "article_to_directory" | "directory_search";
  ref: string; // id firmy / slug artykułu (nie osoby)
  count: number;
  demo: boolean;
}

export interface AppState {
  schemaVersion: 1;
  businesses: Business[];
  articles: Article[];
  legacyUrls: LegacyUrl[];
  socialPosts: SocialPost[];
  socialAssets: SocialAsset[];
  attempts: PublishAttempt[];
  settings: OpsSettings;
  audit: AuditEntry[];
  events: DirectoryEvent[];
  submissions: Submission[];
  /** Etap operacyjny zoo24-ops: rejestr zadań ról, receipts, dowody, pauza (tryb design/shadow). */
  ops: import("./ops/types").OpsState;
}
