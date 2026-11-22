import Link from "next/link";

/** Logo ZOO24 (sygnet SVG inline + napis w fontach serwisu). */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2 rounded-md no-underline" aria-label="ZOO24 — strona główna">
      <svg aria-hidden width="36" height="36" viewBox="0 0 96 96" className="shrink-0">
        <circle cx="48" cy="48" r="48" fill="#0e4f5c" />
        <ellipse cx="25" cy="42" rx="7.5" ry="9.5" fill="#fff7ed" transform="rotate(-22 25 42)" />
        <ellipse cx="38" cy="26" rx="7.5" ry="10" fill="#fff7ed" transform="rotate(-8 38 26)" />
        <ellipse cx="58" cy="26" rx="7.5" ry="10" fill="#fff7ed" transform="rotate(8 58 26)" />
        <ellipse cx="71" cy="42" rx="7.5" ry="9.5" fill="#fff7ed" transform="rotate(22 71 42)" />
        <path d="M48 81C39 74.5 25 65 25 54c0-6.5 5-11 11-11 5 0 9 2.8 12 7 3-4.2 7-7 12-7 6 0 11 4.5 11 11 0 11-14 20.5-23 27z" fill="#ef6c4a" />
      </svg>
      {!compact && (
        <span className="flex items-center gap-1 font-[family-name:var(--font-display)] text-[1.35rem] font-extrabold tracking-tight text-brand">
          ZOO<span className="rounded-full bg-[#ef6c4a] px-2 text-[1rem] leading-6 text-[#fff7ed]">24</span>
        </span>
      )}
    </Link>
  );
}
