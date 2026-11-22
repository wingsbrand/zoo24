// Knowledge: źródło -> kwarantanna (candidate) -> review człowieka -> approved; wycofanie blokuje zależne
// szkice i tworzy zadania korekty opublikowanych (C01, C03, C04). Treść źródła to dane, nie polecenia (C05).
import { createHash } from "node:crypto";
import type { AppState } from "../types";
import { isAgentIdentity } from "./policy";
import type { OpsEvidence } from "./types";

export class KnowledgeError extends Error {
  constructor(public code: string) { super(code); this.name = "KnowledgeError"; }
}

export function ingestSource(s: AppState, input: Omit<OpsEvidence, "evidenceId" | "status" | "reviewerId" | "reviewedAt" | "usedByArtifacts">): OpsEvidence {
  const evidenceId = "ev-" + createHash("sha256").update(input.sourceUrl + "|" + input.claimText).digest("hex").slice(0, 12);
  const existing = s.ops.evidence.find((e) => e.evidenceId === evidenceId);
  if (existing) return existing; // deduplikacja technicznie identycznych wersji
  const ev: OpsEvidence = { ...input, evidenceId, status: "candidate", reviewerId: null, reviewedAt: null, usedByArtifacts: [] };
  s.ops.evidence.push(ev);
  return ev;
}

/** Zatwierdzenie faktu: tylko człowiek, tylko przy znanej podstawie prawnej użycia. */
export function approveEvidence(s: AppState, evidenceId: string, reviewer: string, now: Date): OpsEvidence {
  const ev = s.ops.evidence.find((e) => e.evidenceId === evidenceId);
  if (!ev) throw new KnowledgeError("EVIDENCE_NOT_FOUND");
  if (isAgentIdentity(reviewer)) throw new KnowledgeError("AGENT_CANNOT_APPROVE_EVIDENCE");
  if (ev.licenseBasis === "unknown") throw new KnowledgeError("LICENSE_UNKNOWN_QUARANTINE");
  if (ev.status !== "candidate") throw new KnowledgeError(`NOT_CANDIDATE:${ev.status}`);
  ev.status = "approved";
  ev.reviewerId = reviewer;
  ev.reviewedAt = now.toISOString();
  return ev;
}

export function linkEvidence(s: AppState, evidenceId: string, artifactId: string): void {
  const ev = s.ops.evidence.find((e) => e.evidenceId === evidenceId);
  if (ev && !ev.usedByArtifacts.includes(artifactId)) ev.usedByArtifacts.push(artifactId);
}

/** Braki dowodowe pakietu: brak/candidate/stale/disputed/revoked/przeterminowany => niegotowe do publikacji. */
export function bundleBlockers(s: AppState, evidenceIds: string[], now: Date): string[] {
  if (!evidenceIds.length) return ["NO_EVIDENCE"];
  return evidenceIds.flatMap((id) => {
    const ev = s.ops.evidence.find((e) => e.evidenceId === id);
    if (!ev) return [`MISSING:${id}`];
    if (ev.status !== "approved") return [`${ev.status.toUpperCase()}:${id}`];
    if (ev.validUntil && new Date(ev.validUntil) <= now) return [`EXPIRED:${id}`];
    return [];
  });
}

function artifactPublished(s: AppState, artifactId: string): boolean {
  const [kind, id] = artifactId.split(":");
  if (kind === "article") return s.articles.some((a) => a.slug === id && a.status === "published");
  if (kind === "post") return s.socialPosts.some((p) => p.id === id && p.status === "published");
  return false;
}

/** Wycofanie/sprzeczność: blokuje zależne szkice (cofa artykuły needs_review do draft), dla opublikowanych tworzy zadania korekty. */
export function revokeEvidence(s: AppState, evidenceId: string, status: "revoked" | "disputed" | "stale", reason: string, now: Date) {
  const ev = s.ops.evidence.find((e) => e.evidenceId === evidenceId);
  if (!ev) throw new KnowledgeError("EVIDENCE_NOT_FOUND");
  ev.status = status;
  const blockedDrafts: string[] = [];
  const corrections: string[] = [];
  for (const art of ev.usedByArtifacts) {
    if (artifactPublished(s, art)) {
      corrections.push(art);
      s.ops.correctionTasks.push({ artifactId: art, reason: `${status}:${evidenceId}:${reason}`, createdAt: now.toISOString() });
    } else {
      blockedDrafts.push(art);
      const [kind, id] = art.split(":");
      if (kind === "article") { const a = s.articles.find((x) => x.slug === id); if (a && a.status === "needs_review") a.status = "draft"; }
      if (kind === "post") { const p = s.socialPosts.find((x) => x.id === id); if (p && ["approved", "scheduled"].includes(p.status)) { p.status = "needs_review"; p.approvedHash = null; } }
    }
  }
  s.audit.push({ at: now.toISOString(), actor: "ops:knowledge", entity: "evidence", entityId: evidenceId, action: `evidence_${status}`, meta: { blockedDrafts, corrections } });
  return { blockedDrafts, corrections };
}
