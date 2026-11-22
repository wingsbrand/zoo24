import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { adminEnabled, isLoopbackHost } from "@/lib/site";

/**
 * Blokada panelu: wywoływać na POCZĄTKU każdej strony /admin (nie tylko w layoucie).
 * Next renderuje layout i stronę równolegle — samo notFound() w layoucie nie zatrzymuje renderu strony,
 * więc jej dane trafiałyby do ładunku RSC odpowiedzi 404.
 */
export async function requireAdmin(): Promise<void> {
  if (!adminEnabled() || !isLoopbackHost((await headers()).get("host"))) notFound();
}
