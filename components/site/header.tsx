"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/components/ui/cn";

// Portal V3 §8: menu opiekuna. Dostęp dla firm pozostaje czytelny jako osobny przycisk „Dla firm”.
export const NAV = [
  { href: "/zwierzeta", label: "Zwierzęta" },
  { href: "/poradniki", label: "Poradniki" },
  { href: "/narzedzia", label: "Narzędzia" },
  { href: "/uslugi", label: "Usługi" },
  { href: "/o-nas", label: "O ZOO24" },
];

export function SiteHeader({ showAdmin }: { showAdmin: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const active = (href: string) =>
    path === href || path.startsWith(href + "/") ||
    (href === "/poradniki" && path.startsWith("/blog/")) ||
    (href === "/uslugi" && (path.startsWith("/firma/") || path === "/szukaj"));

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur supports-[backdrop-filter]:bg-canvas/85">
      <div className="mx-auto flex max-w-[var(--container-page)] items-center gap-4 px-4 py-2 sm:px-6">
        <Logo />
        <nav aria-label="Główna" className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? "page" : undefined}
                  className={cn("flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 font-medium no-underline hover:bg-brand-soft hover:text-brand-dark",
                    active(n.href) ? "text-brand-dark underline decoration-accent decoration-2 underline-offset-[10px]" : "text-ink")}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {showAdmin && (
            <Link href="/admin" className="hidden min-h-11 items-center rounded-[var(--radius-sm)] border border-line-strong px-3 text-sm font-semibold text-brand no-underline hover:bg-brand-soft sm:flex">
              Panel
            </Link>
          )}
          <Link href="/dla-firm" aria-current={active("/dla-firm") ? "page" : undefined}
            className="hidden min-h-11 items-center rounded-[var(--radius-md)] border border-line-strong bg-surface px-4 text-sm font-semibold text-brand no-underline hover:border-brand hover:bg-brand-soft lg:flex">
            Dla firm
          </Link>
          <button ref={btn} type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav"
            className="flex size-11 items-center justify-center rounded-[var(--radius-md)] text-brand hover:bg-brand-soft lg:hidden">
            {open ? <X aria-hidden /> : <Menu aria-hidden />}
            <span className="sr-only">{open ? "Zamknij menu" : "Otwórz menu"}</span>
          </button>
        </div>
      </div>
      {(
        <nav id="mobile-nav" hidden={!open} aria-label="Główna (mobilna)" className="border-t border-line bg-surface lg:hidden">
          <ul className="mx-auto max-w-[var(--container-page)] px-4 py-2">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className="flex min-h-12 items-center border-b border-line text-lg font-medium no-underline last:border-0">
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="py-3"><Link href="/dla-firm" aria-current={active("/dla-firm") ? "page" : undefined} className="flex min-h-12 items-center justify-center rounded-[var(--radius-md)] border border-line-strong bg-surface font-semibold text-brand no-underline">Dla firm — dodaj firmę</Link></li>
            {showAdmin && <li className="pb-2"><Link href="/admin" className="flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-line-strong text-brand no-underline">Panel (lokalnie)</Link></li>}
          </ul>
        </nav>
      )}
    </header>
  );
}
