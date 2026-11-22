import { Search } from "lucide-react";
import type { CategorySlug, CitySlug } from "@/lib/types";
import { CATEGORIES, CITIES } from "@/lib/site";
import { Button, Input, Select, cn } from "@/components/ui";
import { GeolocateButton } from "./geolocate-button";

const CITY_NAMES = Object.fromEntries(Object.entries(CITIES).map(([k, v]) => [k, v.name])) as Record<CitySlug, string>;

/**
 * Wyszukiwarka usług: „Rodzaj usługi” + „Miasto” (lista podpowiedzi, wpisanie ręczne zawsze możliwe).
 * Zwykły formularz GET do /szukaj — działa bez JavaScriptu. Geolokalizacja to opcjonalne ulepszenie po stronie klienta.
 */
export function ServiceSearch({
  defaultCategory,
  defaultCity,
  variant = "hero",
  idPrefix,
}: {
  defaultCategory?: CategorySlug;
  /** Slug lub dowolny tekst miasta. */
  defaultCity?: string;
  variant?: "hero" | "compact";
  /** Unikalny prefiks id, gdy na stronie są dwie wyszukiwarki tego samego wariantu. */
  idPrefix?: string;
}) {
  const p = idPrefix ?? `szukaj-${variant}`;
  const hero = variant === "hero";
  const cityValue = defaultCity ? (CITY_NAMES[defaultCity as CitySlug] ?? defaultCity) : "";

  return (
    <form
      action="/szukaj"
      method="get"
      role="search"
      aria-label="Wyszukaj usługę dla zwierzęcia"
      className={cn(
        "space-y-2",
        hero ? "rounded-[var(--radius-xl)] border border-line bg-surface p-4 shadow-[var(--shadow-raised)] sm:p-6" : "rounded-[var(--radius-lg)] border border-line bg-canvas p-3 sm:p-4",
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-1.5">
          <label htmlFor={`${p}-usluga`} className="block font-semibold text-ink">Rodzaj usługi</label>
          <Select id={`${p}-usluga`} name="usluga" defaultValue={defaultCategory ?? ""}>
            <option value="">Wybierz rodzaj usługi</option>
            {(Object.keys(CATEGORIES) as CategorySlug[]).map((c) => (
              <option key={c} value={c}>{CATEGORIES[c].name}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor={`${p}-miasto`} className="block font-semibold text-ink">Miasto</label>
          <Input
            id={`${p}-miasto`}
            name="miasto"
            type="text"
            list={`${p}-miasta`}
            defaultValue={cityValue}
            placeholder="np. Warszawa"
            autoComplete="off"
            maxLength={60}
            aria-describedby={`${p}-miasto-hint`}
          />
          <datalist id={`${p}-miasta`}>
            {Object.values(CITY_NAMES).map((n) => <option key={n} value={n} />)}
          </datalist>
        </div>
        <Button type="submit" variant="accent" size={hero ? "lg" : "md"} icon={<Search aria-hidden size={18} />} className="w-full sm:w-auto">
          Szukaj
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p id={`${p}-miasto-hint`} className="text-sm text-ink-muted">Działamy w: Warszawa, Kraków, Łódź, Wrocław, Poznań, Gdańsk, Szczecin, Bydgoszcz, Lublin, Białystok.</p>
        <GeolocateButton inputId={`${p}-miasto`} cityNames={CITY_NAMES} />
      </div>
    </form>
  );
}
