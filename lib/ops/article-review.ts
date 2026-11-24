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

export function articleContentHash(a: Pick<Article, "title" | "summary" | "body" | "checklist" | "sources"> & { comparison?: Article["comparison"] }): string {
  // Tabela porównawcza jest treścią redakcyjną: gdy występuje, wchodzi do hasha (brak tabeli = hash jak dotąd).
  // Stała kolejność kluczy: Postgres jsonb zmienia kolejność kluczy obiektów, a JSON.stringify od niej zależy.
  // Kolejność = układ plików content/*.json, więc istniejące akceptacje (hash) pozostają ważne.
  const sources = a.sources.map((s) => ({ label: s.label, url: s.url }));
  const parts: unknown[] = [a.title, a.summary, a.body, a.checklist, sources];
  if (a.comparison) parts.push({ caption: a.comparison.caption, columns: a.comparison.columns, rows: a.comparison.rows.map((r) => ({ label: r.label, cells: r.cells })) });
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

/** Akceptacja aktualna: decyzja approved i hash zgodny z bieżącą treścią; redaktor-AI tylko nazwany w polityce. */
export function isEditorialApprovalCurrent(a: Article & { editorialDecision?: EditorialDecision }, aiEditorId: string | null): boolean {
  const d = a.editorialDecision;
  if (!d || d.decision !== "approved") return false;
  if (d.contentHash !== articleContentHash(a)) return false;
  if (isAgentIdentity(d.by)) return !!aiEditorId && d.by === aiEditorId && d.byKind === "ai";
  return d.byKind === "human";
}
