"use server";
import { headers } from "next/headers";
import { getStore } from "@/lib/store/file-store";
import { fingerprint, formDataToRecord, processFormSubmission, type FormState } from "@/lib/submissions";

export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  const h = await headers();
  return processFormSubmission("contact", formDataToRecord(formData), {
    store: getStore(),
    fingerprint: fingerprint(h.get("user-agent"), h.get("accept-language")),
  });
}
