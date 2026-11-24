import { cn } from "./cn";

/**
 * Oznaczenie ilustracji wygenerowanej przez AI na obrazie.
 * Decyzja właściciela (2026-11-23, ADR-016): bez napisu na obrazach. Ogólna informacja o ilustracjach AI
 * pozostaje w regulaminie i zasadach redakcyjnych; rejestr pochodzenia: docs/brand/ai-images.md.
 * Ponowne włączenie: SHOW_AI_IMAGE_BADGE = true.
 */
export const SHOW_AI_IMAGE_BADGE = false;

export function AiBadge({ className }: { className?: string }) {
  if (!SHOW_AI_IMAGE_BADGE) return null;
  return (
    <span
      className={cn(
        "pointer-events-none absolute bottom-2 right-2 z-[1] rounded-full bg-ink/70 px-2 py-0.5 text-[0.7rem] font-medium leading-5 text-white backdrop-blur-sm",
        className,
      )}
    >
      Ilustracja AI
    </span>
  );
}
