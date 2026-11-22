import { cn } from "./cn";

/** Jawne oznaczenie ilustracji wygenerowanej przez AI (nie przedstawia realnych osób, firm ani zwierząt). */
export function AiBadge({ className }: { className?: string }) {
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
