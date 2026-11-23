// Synchronizacja zapisanego stanu z treściami z repo i migracje schematu — wspólna dla FileStore i SupabaseStore.
// W produkcji dodatkowo usuwa rekordy DEMO widoczne publicznie (firmy, artykuły, przykładowe stare URL).
// Szkice social (socialPosts/socialAssets) zostają — są niepubliczne i potrzebne kolejce akceptacji.
import type { AppState } from "../types";
import { loadContentArticles } from "../demo/seed";
import { loadRealBusinesses } from "../catalog/real-businesses";
import { emptyOpsState } from "../ops/types";
import { requiredReviewRole } from "../content/editorial";

/** Metadane klasyfikacji i prezentacji (poza hashem treści) — odświeżane z repo także dla opublikowanych materiałów. */
const META_FIELDS = ["animal", "needs", "format", "risk", "authorDisplay", "related"] as const;

export interface SyncOptions {
  production: boolean;
}

/** Mutuje `state`; zwraca true, gdy cokolwiek zmieniono (wtedy trzeba zapisać). */
export function syncState(state: AppState, opts: SyncOptions): boolean {
  let changed = false;
  // Realne firmy i artykuły z repo dopisywane po id/slug — bez nadpisywania już przejrzanych statusów.
  const newFirms = loadRealBusinesses().filter((b) => !state.businesses.some((x) => x.id === b.id));
  if (newFirms.length) { state.businesses.push(...newFirms); changed = true; }
  const missing = loadContentArticles().filter((a) => !state.articles.some((x) => x.slug === a.slug));
  if (missing.length) { state.articles.push(...missing); changed = true; }
  // Taksonomia/prezentacja z repo => baza (jedno źródło dla listingów, liczników, hubów i rekomendacji; audyt V4 A05).
  for (const file of loadContentArticles()) {
    const a = state.articles.find((x) => x.slug === file.slug);
    if (!a) continue;
    let touched = false;
    for (const k of META_FIELDS) {
      if (JSON.stringify(a[k] ?? null) !== JSON.stringify(file[k] ?? null)) { (a as unknown as Record<string, unknown>)[k] = file[k]; touched = true; }
    }
    if (!touched) continue;
    changed = true;
    // Zmiana klasyfikacji na temat wymagający człowieka: materiał zatwierdzony tylko przez AI schodzi z publikacji.
    if (a.status === "published" && requiredReviewRole(a) !== "editor" && a.editorialDecision?.byKind !== "human") {
      a.status = "needs_review";
      state.audit.push({ at: new Date().toISOString(), actor: "system:sync", entity: "article", entityId: a.slug, action: "article_unpublished_risk_reclassified", meta: { required: requiredReviewRole(a) } });
    }
  }
  // Migracje schematu (nowe pola z bezpiecznymi wartościami domyślnymi).
  if (!Array.isArray(state.submissions)) { state.submissions = []; changed = true; }
  if (!state.ops) { state.ops = emptyOpsState(); changed = true; }
  for (const b of state.businesses) {
    if (!Array.isArray(b.petTypes)) { b.petTypes = []; changed = true; }
    if (b.addressText === undefined) { b.addressText = null; changed = true; }
  }
  if (opts.production) {
    const before = state.businesses.length + state.articles.length + state.legacyUrls.length;
    state.businesses = state.businesses.filter((b) => !b.demo);
    state.articles = state.articles.filter((a) => !a.demo);
    state.legacyUrls = state.legacyUrls.filter((u) => !u.demo);
    if (state.businesses.length + state.articles.length + state.legacyUrls.length !== before) changed = true;
  }
  return changed;
}
