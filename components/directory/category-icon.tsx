import { BedDouble, Scissors } from "lucide-react";
import type { CategorySlug } from "@/lib/types";
import { cn } from "@/components/ui";

const ICONS = { groomer: Scissors, "hotel-dla-zwierzat": BedDouble } as const;

export function CategoryIcon({ category, size = 24, className }: { category: CategorySlug; size?: number; className?: string }) {
  const Icon = ICONS[category];
  return <Icon aria-hidden size={size} className={className} />;
}

/** Kafel zamiast zdjęcia (brak praw do zdjęć w F1). Stałe wymiary — bez przesunięć układu. */
export function CategoryTile({ category, size = "md" }: { category: CategorySlug; size?: "md" | "lg" }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand-soft text-brand",
        size === "lg" ? "size-20 sm:size-24" : "size-14 sm:size-16",
      )}
    >
      <CategoryIcon category={category} size={size === "lg" ? 36 : 26} />
    </div>
  );
}
