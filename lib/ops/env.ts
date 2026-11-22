// Środowisko przebiegu ról zbudowane z faktycznego stanu projektu (nie z deklaracji).
import fs from "node:fs";
import path from "node:path";
import { getReadSources, type AccessStatus, type SourceId } from "../integrations/read-sources";
import type { ActivationPolicy } from "./policy";
import type { OpsEnv } from "./roles";

export async function buildOpsEnv(policy: ActivationPolicy | null, root = process.cwd()): Promise<Omit<OpsEnv, "now" | "mode" | "policyVersion">> {
  const src = getReadSources();
  const sources = {} as Record<SourceId, AccessStatus>;
  for (const [id, s] of Object.entries(src) as [SourceId, (typeof src)[SourceId]][]) sources[id] = (await s.fetch28d("", "")).accessStatus;
  return {
    sources,
    vcs: fs.existsSync(path.join(/*turbopackIgnore: true*/ root, ".git")),
    editorId: policy?.review.editor_id ?? null,
    aiEditorAllowed: !!policy?.review.ai_editor_allowed && policy.review.ai_editor_id === policy.review.editor_id,
  };
}
