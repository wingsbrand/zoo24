// Decyzja redakcyjna artykułu (ADR-013): akceptacja jest związana z hashem treści.
// Każda zmiana tytułu, leadu, treści, checklisty lub źródeł unieważnia akceptację (C02).
// Akceptacja ≠ publikacja: publikacja zaakceptowanej wersji idzie przez gateway dopiero na serwisie live.
import { createHash } from "node:crypto";
import type { Article } from "../types";
import { isAgentIdentity } from "./identity";

export interface EditorialDecision {
  decision: "approved" | "needs_changes" | "needs_human";
  by: string;
  byKind: "ai" | "human";
  at: string;
  contentHash: string;
  evidenceRef: string | null;
  excludedCategoriesChecked: string[];
  notes: string[];
  publishAfter: string;
}

export function articleContentHash(a: Pick<Article, "title" | "summary" | "body" | "checklist" | "sources">): string {
  return createHash("sha256").update(JSON.stringify([a.title, a.summary, a.body, a.checklist, a.sources])).digest("hex");
}

/** Akceptacja aktualna: decyzja approved i hash zgodny z bieżącą treścią; redaktor-AI tylko nazwany w polityce. */
export function isEditorialApprovalCurrent(a: Article & { editorialDecision?: EditorialDecision }, aiEditorId: string | null): boolean {
  const d = a.editorialDecision;
  if (!d || d.decision !== "approved") return false;
  if (d.contentHash !== articleContentHash(a)) return false;
  if (isAgentIdentity(d.by)) return !!aiEditorId && d.by === aiEditorId && d.byKind === "ai";
  return d.byKind === "human";
}
