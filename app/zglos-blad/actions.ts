"use server";
import { headers } from "next/headers";
import { getStore } from "@/lib/store/file-store";
import { fingerprint, formDataToRecord, processFormSubmission, type FormState } from "@/lib/submissions";

export async function submitReportError(_prev: FormState, formData: FormData): Promise<FormState> {
  const h = await headers();
  return processFormSubmission("report_error", formDataToRecord(formData), {
    store: getStore(),
    fingerprint: fingerprint(h.get("user-agent"), h.get("accept-language")),
  });
}
