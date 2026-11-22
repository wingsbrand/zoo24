// Zdjęcia serwisu: ilustracje wygenerowane w fal.ai (model google/nano-banana-2.1, 2026-11-22).
// Nie przedstawiają realnych osób, firm ani zwierząt — na stronie zawsze z oznaczeniem „Ilustracja AI”.
// Rejestr praw i promptów: docs/brand/ai-images.md.

export interface SiteImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const img = (file: string, alt: string, width = 1376, height = 768): SiteImage => ({ src: `/images/${file}`, alt, width, height });

export const SITE_IMAGES = {
  hero: img("hero-dom.webp", "Uśmiechnięta kobieta przytula golden retrievera, obok na dywanie odpoczywa pręgowany kot", 3168, 1344),
  groomer: img("kategoria-groomer.webp", "Groomerka w salonie suszy suszarką puszystego białego psa na stole do pielęgnacji"),
  hotel: img("kategoria-hotel.webp", "Opiekunka w przytulnym hotelu dla zwierząt głaszcze beagle'a, obok na posłaniu śpi drugi pies"),
  dlaFirm: img("dla-firm.webp", "Właścicielka salonu groomerskiego w fartuchu stoi w swoim salonie obok pudla", 1200, 896),
} as const;

export const CATEGORY_IMAGES: Record<string, SiteImage> = {
  groomer: SITE_IMAGES.groomer,
  "hotel-dla-zwierzat": SITE_IMAGES.hotel,
};

const ARTICLE_IMAGES: Record<string, SiteImage> = {
  "jak-wybrac-groomera": img("art-jak-wybrac-groomera.webp", "Opiekun przekazuje smycz cocker spaniela groomerce w recepcji salonu"),
  "hotel-dla-psa-checklista": img("art-hotel-dla-psa-checklista.webp", "Pies siedzi obok spakowanej torby, smyczy, miski, zabawki i kocyka przed pobytem w hotelu"),
  "pielegnacja-psa-zima": img("art-pielegnacja-psa-zima.webp", "Pies w ciepłym sweterku na spacerze z opiekunem w zaśnieżonym parku"),
  "kot-brytyjski-n66": img("art-kot-brytyjski.webp", "Niebieskoszary kot brytyjski krótkowłosy leży na sofie, opiekun szczotkuje mu sierść"),
  "cane-corso-n63": img("art-cane-corso.webp", "Pręgowany cane corso siedzi na łące obok kucającego opiekuna"),
  "maltanczyk-n77": img("art-maltanczyk.webp", "Biały maltańczyk z kitką na głowie czesany metalowym grzebieniem na kolanach opiekuna"),
};

export function articleImage(slug: string): SiteImage | null {
  return ARTICLE_IMAGES[slug] ?? null;
}
