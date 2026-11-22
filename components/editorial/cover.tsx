// Okładka poradnika. Stałe proporcje 16:9 => brak przesunięć układu.
// Gdy artykuł ma ilustrację (lib/content/images.ts) — zdjęcie z oznaczeniem „Ilustracja AI”.
// W przeciwnym razie szablon: tło w kolorze tematu, motyw łapki z poduszką-sercem, nazwa tematu (marginesy ≥ 8%).
import Image from "next/image";
import type { Topic } from "@/lib/content/topics";
import type { SiteImage } from "@/lib/content/images";
import { AiBadge, cn } from "@/components/ui";

/** Łapa w układzie 100×100: cztery palce + poduszka w kształcie serca. */
export function PawShape({ fill, opacity = 1, transform }: { fill: string; opacity?: number; transform?: string }) {
  return (
    <g fill={fill} fillOpacity={opacity} transform={transform}>
      <ellipse cx="20" cy="38" rx="9" ry="12" transform="rotate(-24 20 38)" />
      <ellipse cx="39" cy="20" rx="9" ry="12.5" transform="rotate(-8 39 20)" />
      <ellipse cx="61" cy="20" rx="9" ry="12.5" transform="rotate(8 61 20)" />
      <ellipse cx="80" cy="38" rx="9" ry="12" transform="rotate(24 80 38)" />
      <path d="M50 94 C31 81 19 70 22 56 C24.5 46 38 42 50 53 C62 42 75.5 46 78 56 C81 70 69 81 50 94 Z" />
    </g>
  );
}

export function Cover({ topic, variant = "card", className, image }: { topic: Topic; variant?: "card" | "hero"; className?: string; image?: SiteImage | null }) {
  if (image) {
    const hero = variant === "hero";
    return (
      <div className={cn("relative aspect-video w-full overflow-hidden bg-brand-soft", className)}>
        <Image
          src={image.src}
          // Na karcie tytuł jest tuż obok — zdjęcie dekoracyjne; w nagłówku artykułu opis alternatywny.
          alt={hero ? image.alt : ""}
          fill
          priority={hero}
          sizes={hero ? "(min-width: 1024px) 24rem, 100vw" : "(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <AiBadge />
      </div>
    );
  }
  const { bg, fg, motif } = topic.colors;
  return (
    <div
      aria-hidden
      className={cn("@container relative aspect-video w-full overflow-hidden select-none", className)}
      style={{ backgroundColor: bg, color: fg }}
    >
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" focusable="false">
        {/* duża łapa przycięta krawędzią — rozpoznawalna nawet w miniaturze */}
        <PawShape fill={motif} opacity={0.32} transform="translate(1010 330) scale(7.2) rotate(14 50 50)" />
        {/* drobne łapki w tle (poza polem tekstu) */}
        <PawShape fill={motif} opacity={0.22} transform="translate(860 110) scale(1.5) rotate(-18 50 50)" />
        <PawShape fill={motif} opacity={0.16} transform="translate(1340 90) scale(1.1) rotate(22 50 50)" />
        <PawShape fill={motif} opacity={0.14} transform="translate(760 640) scale(1.2) rotate(-30 50 50)" />
      </svg>
      {/* bezpieczne pole: padding 8% szerokości (≥ 8% także w pionie przy 16:9) */}
      <div className="absolute inset-0 flex flex-col justify-between p-[8%]">
        <span className="font-semibold tracking-wide uppercase opacity-90" style={{ fontSize: variant === "hero" ? "clamp(0.7rem, 2.6cqw, 1rem)" : "clamp(0.65rem, 3.4cqw, 0.9rem)" }}>
          ZOO24 · Poradnik
        </span>
        <span
          className="block max-w-[62%] font-bold leading-[1.05] [font-family:var(--font-display)] [text-wrap:balance]"
          style={{ fontSize: variant === "hero" ? "clamp(1.4rem, 7.5cqw, 3.25rem)" : "clamp(1.1rem, 8.5cqw, 2.25rem)" }}
        >
          {topic.name}
        </span>
      </div>
    </div>
  );
}
