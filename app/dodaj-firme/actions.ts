"use server";
// Server action formularza zgłoszenia firmy. Walidacja i zapis w lib/submissions (testowane).
// Ochrona CSRF: Next.js porównuje nagłówek Origin z Host dla server actions.
import { headers } from "next/headers";
import { getStore } from "@/lib/store/file-store";
import { fingerprint, formDataToRecord, processFormSubmission, type FormState } from "@/lib/submissions";

export async function submitAddBusiness(_prev: FormState, formData: FormData): Promise<FormState> {
  const h = await headers();
  return processFormSubmission("add_business", formDataToRecord(formData), {
    store: getStore(),
    fingerprint: fingerprint(h.get("user-agent"), h.get("accept-language")),
  });
}
