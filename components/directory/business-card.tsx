import Link from "next/link";
import { Cat, Dog, Globe, MapPin, Phone, PhoneOff } from "lucide-react";
import type { Business } from "@/lib/types";
import { CATEGORIES, CITIES } from "@/lib/site";
import { DataCheckedBadge, DemoBadge } from "@/components/ui";
import { contactChannels, publicLocation } from "@/lib/directory/contact";
import { CategoryTile } from "./category-icon";

const PET = { psy: { Icon: Dog, label: "psy" }, koty: { Icon: Cat, label: "koty" } } as const;

/**
 * Karta firmy na listingu. Cała karta klikalna (wzorzec „stretched link” na nazwie), jedyny element interaktywny.
 * `from` = query listingu (filtry/strona) przekazywane do profilu jako `?z=` dla okruszków „wróć do wyników”.
 */
export function BusinessCard({ b, from }: { b: Business; from?: string }) {
  const href = from ? `/firma/${b.slug}?z=${encodeURIComponent(from)}` : `/firma/${b.slug}`;
  const ch = contactChannels(b);
  const loc = publicLocation(b);
  const area = loc.address ?? loc.serviceArea;
  const services = b.services.slice(0, 4);
  const more = b.services.length - services.length;

  return (
    <li className="relative flex gap-4 rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-card)] transition-colors duration-150 hover:border-brand has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent">
      <CategoryTile category={b.category} />
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <h3 className="line-clamp-2 break-words hyphens-auto text-lg font-semibold leading-snug">
            <Link
              href={href}
              title={b.name}
              className="text-brand-dark no-underline hover:underline focus-visible:outline-none after:absolute after:inset-0 after:rounded-[var(--radius-lg)] after:content-['']"
            >
              {b.name}
            </Link>
          </h3>
          <p className="text-sm text-ink-muted">{CATEGORIES[b.category].name} · {CITIES[b.city].name}</p>
        </div>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="sr-only">Zwierzęta:</span>
          {b.petTypes.length ? (
            b.petTypes.map((p) => {
              const { Icon, label } = PET[p];
              return (
                <span key={p} className="inline-flex items-center gap-1">
                  <Icon aria-hidden size={16} className="text-brand" /> {label}
                </span>
              );
            })
          ) : (
            <span className="text-ink-muted">zwierzęta: brak informacji</span>
          )}
        </p>

        {services.length > 0 && (
          <ul aria-label="Usługi" className="flex flex-wrap gap-1.5">
            {services.map((s) => (
              <li key={s} className="max-w-full break-words rounded-full bg-brand-tint px-2.5 py-0.5 text-xs font-medium text-brand-dark">{s}</li>
            ))}
            {more > 0 && <li className="px-1 py-0.5 text-xs text-ink-muted">+{more} więcej</li>}
          </ul>
        )}

        {area && (
          <p className="flex items-start gap-1.5 break-words text-sm text-ink-muted">
            <MapPin aria-hidden size={16} className="mt-0.5 shrink-0" />
            <span><span className="sr-only">{loc.address ? "Adres: " : "Obszar działania: "}</span>{area}</span>
          </p>
        )}

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="sr-only">Kontakt:</span>
          {ch.site && <span className="inline-flex items-center gap-1"><Globe aria-hidden size={16} className="text-brand" /> strona www</span>}
          {ch.phone && <span className="inline-flex items-center gap-1"><Phone aria-hidden size={16} className="text-brand" /> telefon</span>}
          {!ch.site && !ch.phone && (
            <span className="inline-flex items-center gap-1 text-ink-muted"><PhoneOff aria-hidden size={16} /> brak potwierdzonego kontaktu</span>
          )}
        </p>

        <div className="flex flex-wrap gap-1.5">
          <DataCheckedBadge checkedAt={b.checkedAt} />
          <DemoBadge show={b.demo} />
        </div>
      </div>
    </li>
  );
}
