"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FileText, Gauge, Inbox, Search } from "lucide-react";
import { cn } from "@/components/ui/cn";

const ITEMS = [
  { href: "/admin", label: "Przegląd", icon: Gauge },
  { href: "/admin/moderacja", label: "Moderacja", icon: Inbox },
  { href: "/admin/content", label: "Treści", icon: FileText },
  { href: "/admin/social", label: "Social media", icon: CalendarDays },
  { href: "/admin/seo", label: "SEO", icon: Search },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <aside className="min-w-0 lg:sticky lg:top-20 lg:self-start">
      <p className="mb-2 hidden text-xs font-bold uppercase tracking-wide text-ink-muted lg:block">Panel właściciela</p>
      <nav aria-label="Panel">
        <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
          {ITEMS.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin" ? path === href : path.startsWith(href);
            return (
              <li key={href} className="shrink-0">
                <Link href={href} aria-current={active ? "page" : undefined}
                  className={cn("flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-3 font-medium no-underline",
                    active ? "bg-brand text-white" : "text-ink hover:bg-brand-soft")}>
                  <Icon aria-hidden size={18} /> {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <p className="mt-4 hidden rounded-[var(--radius-md)] border border-line bg-surface p-3 text-xs text-ink-muted lg:block">
        Tryb <strong>Mode 0 / MOCK</strong>: żadne działanie z panelu nie publikuje niczego w internecie. Panel działa tylko lokalnie.
      </p>
    </aside>
  );
}
