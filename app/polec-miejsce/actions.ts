"use server";
// Server action formularza „Poleć miejsce”. Walidacja, honeypot, limit i zapis w lib/submissions (testowane).
// Ochrona CSRF: Next.js porównuje nagłówek Origin z Host dla server actions.
import { headers } from "next/headers";
import { getStore } from "@/lib/store/file-store";
import { fingerprint, formDataToRecord, processFormSubmission, type FormState } from "@/lib/submissions";

export async function submitRecommendPlace(_prev: FormState, formData: FormData): Promise<FormState> {
  const h = await headers();
  return processFormSubmission("recommend_place", formDataToRecord(formData), {
    store: getStore(),
    fingerprint: fingerprint(h.get("user-agent"), h.get("accept-language")),
  });
}
