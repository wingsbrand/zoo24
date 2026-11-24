// Etykiety PL dla pól portalu V3 i opis statusu przeglądu (czyste funkcje, testowane).
import type { Article } from "../types";
import { effectiveRisk, getGroup, isGroupSlug, NEEDS, REQUIRED_REVIEW, type ContentFormat, type NeedSlug, type ReviewerRole, type RiskClass } from "../taxonomy/animals";
import { isAgentIdentity } from "../ops/identity";

export const FORMAT_LABEL: Record<ContentFormat, string> = {
  hub: "Centrum wiedzy",
  species_card: "Karta gatunku",
  breed_profile: "Profil rasy",
  guide: "Poradnik",
  checklist: "Checklista",
};

export const ROLE_LABEL: Record<ReviewerRole, string> = {
  editor: "redaktor",
  species_specialist: "osoba z wiedzą o danym gatunku",
  veterinarian: "lekarz weterynarii",
  legal: "weryfikacja prawna",
};

export const RISK_LABEL: Record<RiskClass, string> = {
  standard: "informacje praktyczne",
  welfare: "treść wpływająca na dobrostan",
  health: "zdrowie",
  legal: "prawo i handel",
};

const NEED_NAME = new Map(NEEDS.map((n) => [n.slug, n.name]));
export const needName = (n: NeedSlug): string => NEED_NAME.get(n) ?? n;

export function groupName(a: Pick<Article, "animal">): string | null {
  const g = a.animal?.group;
  return g && isGroupSlug(g) ? getGroup(g).name : null;
}

export interface ReviewStatus {
  risk: RiskClass;
  requiredRole: ReviewerRole;
  /** Kto sprawdził — tekst do wyświetlenia; null = brak przeglądu. AI nigdy nie jest przedstawiane jako człowiek. */
  reviewerLabel: string | null;
  reviewerKind: "human" | "ai" | null;
  reviewedAt: string | null;
  reviewDueAt: string | null;
  /** Wymagany przegląd specjalistyczny nie jest potwierdzony przeglądem człowieka. */
  requiredRolePending: boolean;
}

export const AI_REVIEW_LABEL = "redakcja ZOO24 z udziałem AI";

export function reviewStatus(a: Article): ReviewStatus {
  const risk = effectiveRisk(a.risk ?? "standard", a.needs ?? []);
  const requiredRole = REQUIRED_REVIEW[risk];
  const by = a.review?.by ?? a.reviewedBy ?? null;
  let kind: "human" | "ai" | null = null;
  if (by) {
    // Deklaracja "human" nie wystarcza, jeśli tożsamość wygląda na proces agenta/AI.
    kind = a.review?.byKind === "ai" || isAgentIdentity(by) ? "ai" : "human";
  }
  return {
    risk,
    requiredRole,
    reviewerLabel: by ? (kind === "ai" ? AI_REVIEW_LABEL : by) : null,
    reviewerKind: kind,
    reviewedAt: a.review?.at ?? null,
    reviewDueAt: a.reviewDueAt ?? null,
    requiredRolePending: requiredRole !== "editor" && kind !== "human",
  };
}
