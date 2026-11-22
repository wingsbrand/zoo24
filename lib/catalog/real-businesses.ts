// Realne firmy dodane ręcznie ze źródeł publikowanych przez same firmy (content/businesses/*.json).
// Data sprawdzenia (`checkedAt`) tylko gdy dane potwierdził człowiek; odczyt AI = „dane niepotwierdzone”.
import fs from "node:fs";
import path from "node:path";
import type { Business, CategorySlug, CitySlug, PetType } from "../types";

interface RealBusinessJson {
  id: string; name: string; category: CategorySlug; city: CitySlug;
  addressText: string | null; serviceArea: string | null; websiteUrl: string | null; phonePublic: string | null;
  services: string[]; petTypes: PetType[]; sourceUrl: string; verifiedByHuman: boolean; note?: string;
}

const CHECKED_AT = "2026-11-22T12:00:00.000Z";

export function slugify(text: string): string {
  return text.toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function toBusiness(r: RealBusinessJson): Business {
  return {
    id: r.id,
    slug: `${slugify(r.name)}-${r.id}`,
    name: r.name,
    category: r.category,
    city: r.city,
    serviceArea: r.serviceArea,
    websiteUrl: r.websiteUrl,
    phonePublic: r.phonePublic,
    description: "Salon pielęgnacji zwierząt. Zakres usług i dane kontaktowe według strony internetowej firmy — ceny i terminy ustalasz bezpośrednio z salonem.",
    services: r.services,
    petTypes: r.petTypes,
    addressText: r.addressText,
    status: "published",
    demo: false,
    sourceNote: r.verifiedByHuman
      ? `Strona firmy (${r.sourceUrl}) — dane sprawdzone przez redakcję`
      : `Strona firmy (${r.sourceUrl}) — odczyt automatyczny, oczekuje na potwierdzenie przez redakcję`,
    checkedAt: r.verifiedByHuman ? CHECKED_AT : null,
    sponsored: false,
  };
}

export function loadRealBusinesses(): Business[] {
  const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), "content", "businesses");
  try {
    return fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
      .flatMap((f) => (JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as RealBusinessJson[]).map(toBusiness));
  } catch {
    return [];
  }
}
