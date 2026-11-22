"use server";
// Akcje panelu (F1, lokalnie). Brak logowania: panel jest wyłączony w produkcji (ADR-003).
// Aktor "owner-local" — w F2 zastąpiony przez Supabase Auth z claimem admin.
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store/file-store";
import { headers } from "next/headers";
import { isTrustedAdminRequest } from "@/lib/site";
import { approve, cancel, reject, schedule, submitForReview, WorkflowError } from "@/lib/social/workflow";
import { runPublishJob, setChannel, setPublishing } from "@/lib/social/publisher";
import { MockMetaAdapter } from "@/lib/integrations/meta/adapter";
import { approveArticle, EditorialError, returnToDraft, submitArticle } from "@/lib/content/editorial";
import { moderateSubmission, SubmissionError } from "@/lib/submissions";

const ACTOR = "owner-local";

async function guard() {
  if (!isTrustedAdminRequest(await headers())) notFound();
}

export async function postAction(formData: FormData): Promise<void> {
  await guard();
  const id = String(formData.get("id"));
  const op = String(formData.get("op"));
  const store = getStore();
  await store.transact((s) => {
    try {
      if (op === "submit") submitForReview(s, id, ACTOR);
      else if (op === "approve") approve(s, id, ACTOR);
      else if (op === "reject") reject(s, id, ACTOR, "odrzucone w panelu");
      else if (op === "schedule") schedule(s, id, ACTOR);
      else if (op === "cancel") cancel(s, id, ACTOR);
      const p = s.socialPosts.find((x) => x.id === id);
      if (p) p.lastError = null;
    } catch (e) {
      const p = s.socialPosts.find((x) => x.id === id);
      if (p) p.lastError = e instanceof WorkflowError ? e.message : "Błąd operacji";
    }
  });
  revalidatePath("/admin/social");
  revalidatePath("/admin");
}

export async function toggleKillSwitch(formData: FormData): Promise<void> {
  await guard();
  const enable = formData.get("enable") === "1";
  const cancelFuture = formData.get("cancelFuture") === "1";
  await setPublishing(getStore(), enable, ACTOR, cancelFuture);
  revalidatePath("/admin");
  revalidatePath("/admin/social");
}

export async function articleAction(formData: FormData): Promise<void> {
  await guard();
  const slug = String(formData.get("slug"));
  const op = String(formData.get("op"));
  let error: string | null = null;
  await getStore().transact((s) => {
    try {
      if (op === "approve") approveArticle(s, slug, ACTOR);
      else if (op === "draft") returnToDraft(s, slug, ACTOR, "cofnięte w panelu");
      else if (op === "submit") submitArticle(s, slug, ACTOR);
    } catch (e) {
      error = e instanceof EditorialError ? e.message : "Błąd operacji";
      s.audit.push({ at: new Date().toISOString(), actor: ACTOR, entity: "article", entityId: slug, action: "article_action_failed", meta: { op, error } });
    }
  });
  revalidatePath("/admin/content");
  revalidatePath("/", "layout");
}

export type ModerationResult = { ok: boolean; message: string; code?: string } | null;

/** Moderacja zgłoszenia (useActionState): wynik zwracany do UI jako czytelne potwierdzenie. */
export async function moderateAction(_prev: ModerationResult, formData: FormData): Promise<ModerationResult> {
  await guard();
  const code = String(formData.get("code") ?? "");
  const decision = formData.get("decision") === "approved" ? "approved" : "rejected";
  const reason = String(formData.get("reason") ?? "").trim() || undefined;
  try {
    const sub = await getStore().transact((s) => moderateSubmission(s, code, decision, ACTOR, reason));
    revalidatePath("/admin/moderacja");
    revalidatePath("/admin");
    return { ok: true, code: sub.code, message: decision === "approved" ? `Zaakceptowano ${sub.code}. Zgłaszający zobaczy status na stronie statusu (brak automatycznego e-maila w prototypie).` : `Odrzucono ${sub.code} z podanym powodem.` };
  } catch (e) {
    const msg = e instanceof SubmissionError ? ({ not_found: "Nie znaleziono zgłoszenia.", not_pending: "Zgłoszenie zostało już rozpatrzone.", reason_required: "Podaj powód odrzucenia — zobaczy go zgłaszający.", invalid: "Nieprawidłowe dane." } as Record<string, string>)[e.code] ?? e.message : "Błąd operacji.";
    return { ok: false, code, message: msg };
  }
}

export async function markVisited(): Promise<void> {
  await guard();
  const { cookies } = await import("next/headers");
  (await cookies()).set("zoo24_admin_lv", new Date().toISOString(), { httpOnly: true, sameSite: "strict", path: "/admin", maxAge: 60 * 60 * 24 * 90 });
}

export async function enableChannel(formData: FormData): Promise<void> {
  await guard();
  const platform = formData.get("platform") === "instagram" ? "instagram" : "facebook";
  await setChannel(getStore(), platform, true, ACTOR);
  revalidatePath("/admin");
}

/** Uruchamia job publikacji z ADAPTEREM MOCK (symulacja; brak połączeń z Meta). */
export async function runMockPublishJob(): Promise<void> {
  await guard();
  await runPublishJob(getStore(), new MockMetaAdapter(), { workerId: "panel-mock" });
  revalidatePath("/admin/social");
  revalidatePath("/admin");
}

/** Ręczny przebieg shadow sześciu ról zoo24-ops: tylko odczyt stanu, zapis wyników do rejestru, zero zapisów zewnętrznych. */
export async function runOpsShadow(): Promise<void> {
  await guard();
  const { runShadowTick } = await import("@/lib/ops/dispatcher");
  const { loadPolicy } = await import("@/lib/ops/policy");
  const { buildOpsEnv } = await import("@/lib/ops/env");
  const policy = loadPolicy();
  await runShadowTick(getStore(), { now: new Date(), dispatcherId: "dispatcher:panel", policy, env: await buildOpsEnv(policy), manual: true });
  revalidatePath("/admin");
}

export async function resetDemo(): Promise<void> {
  await guard();
  await getStore().reset();
  revalidatePath("/", "layout");
}
