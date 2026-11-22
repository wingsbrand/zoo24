// Czysta funkcja (bez node:fs) — używana także w komponentach.
/** Tożsamość procesu agenta/AI — nie może zmieniać polityki ani udawać przeglądu człowieka (P04, P08). */
export function isAgentIdentity(actor: string | null | undefined): boolean {
  if (!actor) return true; // brak tożsamości traktujemy jak niezaufany proces
  return /^(agent:|ai:|claude|zoo24-ops-|zoo24-(product|seo|social|analytics|architect|builder|qa|growth|compliance)\b|job:|worker-|dispatcher)/i.test(actor.trim());
}
