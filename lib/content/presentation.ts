// Centralna polityka prezentacji materiałów (audyt V4: A01, A02, A09, A10).
// - Autor publiczny: rzeczywista redakcja organizacyjna powiązana z wydawcą (bez dopisków o szkicach/agentach).
// - Ujawnienie AI: jedno, krótkie i czytelne przy materiale, dopóki tekst nie ma udokumentowanego przeglądu człowieka
//   (art. 50 AI Act — akceptacja przez innego agenta AI nie jest przeglądem człowieka).
// - Daty: publikacja ≠ zmiana treści. dateModified nigdy nie jest wcześniejsza niż datePublished; „Zaktualizowano”
//   pokazujemy tylko, gdy treść zmieniono PO publikacji (bez odmładzania przy buildzie).
// Wewnętrzne klasy ryzyka, role recenzentów, terminy przeglądów i rejestr twierdzeń zostają w CMS (panel), nie w UI.
import type { Article } from "../types";
import { isAgentIdentity } from "../ops/identity";
import { OPERATOR } from "../legal/operator";

export const EDITORIAL_AUTHOR = "Redakcja ZOO24";

export function publicAuthor(_a?: Pick<Article, "authorDisplay">): string {
  // Wszystkie obecne materiały są organizacyjne. Gdy pojawią się realni autorzy (content/people), tu dodamy ich nazwiska.
  return EDITORIAL_AUTHOR;
}

export const PUBLISHER_NAME = OPERATOR.legalName ?? "ZOO24";

/** Czy materiał ma udokumentowany przegląd człowieka (osoba, data, zatwierdzona wersja). */
export function hasHumanReview(a: Pick<Article, "editorialDecision" | "review" | "reviewedBy">): boolean {
  const d = a.editorialDecision;
  if (d && d.decision === "approved" && d.byKind === "human" && !isAgentIdentity(d.by)) return true;
  const r = a.review;
  return !!(r?.by && r.byKind === "human" && r.at && !isAgentIdentity(r.by));
}

/**
 * Ujawnienie AI przy materiale. Decyzja właściciela D-01 (arkusz decyzji, 2026-11-23): „usuń wszelkie informacje
 * dotyczące AI na moją odpowiedzialność” — przy materiałach nie pokazujemy dopisku o AI. Nigdzie też nie twierdzimy,
 * że tekst sprawdził człowiek; proces (w tym użycie AI) opisują zasady redakcyjne. Ponowne włączenie: SHOW_AI_DISCLOSURE.
 */
export const SHOW_AI_DISCLOSURE = false;
export function aiDisclosure(a: Pick<Article, "editorialDecision" | "review" | "reviewedBy" | "demo">): string | null {
  if (!SHOW_AI_DISCLOSURE || a.demo) return null;
  if (hasHumanReview(a)) return null;
  return "Tekst przygotowany z użyciem narzędzi AI na podstawie wskazanych źródeł. Nie był konsultowany ze specjalistą.";
}

export interface ArticleDates {
  /** Pierwsza publikacja w obecnym serwisie (null = nieopublikowany). */
  published: string | null;
  /** Ostatnia merytoryczna zmiana widoczna dla czytelnika; ≥ published. */
  modified: string;
  /** Czy pokazać „Zaktualizowano” (treść zmieniona po publikacji). */
  showUpdated: boolean;
}

export function articleDates(a: Pick<Article, "publishedAt" | "updatedAt">): ArticleDates {
  const pub = a.publishedAt;
  if (!pub) return { published: null, modified: a.updatedAt, showUpdated: false };
  const changedAfter = new Date(a.updatedAt).getTime() > new Date(pub).getTime();
  return { published: pub, modified: changedAfter ? a.updatedAt : pub, showUpdated: changedAfter };
}
