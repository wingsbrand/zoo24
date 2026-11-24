// Zdjęcia serwisu: ilustracje wygenerowane w fal.ai (model google/nano-banana-2.1, 2026-11-22).
// Nie przedstawiają realnych osób, firm ani zwierząt — bez napisu na obrazie (ADR-016); informacja ogólna w regulaminie i zasadach redakcyjnych.
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
  "basenji-n78": img("art-basenji.webp", "Rudo-biały basenji z zakręconym ogonem stoi na leśnej ścieżce jesienią obok opiekuna"),
  "border-collie-n61": img("art-border-collie.webp", "Czarno-biały border collie skupiony na opiekunce podczas ćwiczeń na łące"),
  "chihuahua-n99": img("art-chihuahua.webp", "Płowy krótkowłosy chihuahua siedzi na kocu na sofie w jasnym salonie"),
  "corgi-n107": img("art-corgi.webp", "Rudo-biały welsh corgi pembroke biegnie parkową alejką obok opiekuna"),
  "dalmatynczyk-n76": img("art-dalmatynczyk.webp", "Dalmatyńczyk na smyczy biegnie z opiekunką ścieżką nad rzeką o poranku"),
  "doberman-n60": img("art-doberman.webp", "Czarny podpalany doberman leży spokojnie na dywanie obok czytającej opiekunki"),
  "jack-russell-terrier-n95": img("art-jack-russell-terrier.webp", "Biało-podpalany jack russell terrier w biegu bawi się sznurem w ogrodzie"),
  "jamnik-n112": img("art-jamnik.webp", "Rudy krótkowłosy jamnik na smyczy w jesiennym parku"),
  "kot-bengalski-n65": img("art-kot-bengalski.webp", "Kot bengalski w rozety wspina się na drapak w jasnym mieszkaniu"),
  "kot-syberyjski-n67": img("art-kot-syberyjski.webp", "Półdługowłosy kot syberyjski odpoczywa na parapecie, za oknem zima"),
  "kot-syjamski-n69": img("art-kot-syjamski.webp", "Kot syjamski o niebieskich oczach siedzi na krześle w kuchni"),
  "maine-coon--n124": img("art-maine-coon.webp", "Pręgowany maine coon leży na dywanie, opiekunka szczotkuje mu sierść"),
  "owczarek-niemiecki-n96": img("art-owczarek-niemiecki.webp", "Owczarek niemiecki idzie przy nodze opiekuna leśną ścieżką"),
  "ragdoll-n116": img("art-ragdoll.webp", "Rozluźniony kot ragdoll leży na rękach opiekunki na sofie"),
  "shiba-inu--n100": img("art-shiba-inu.webp", "Rudy shiba inu stoi na drewnianym ganku, opiekun zapina mu szelki"),
  "shih-tzu-n62": img("art-shih-tzu.webp", "Shih tzu z kitką na głowie czesany grzebieniem na kolanach opiekunki"),
  "west-highland-white-terrier-n79": img("art-west-highland-white-terrier.webp", "Biały west highland white terrier na smyczy na ogrodowej ścieżce"),
  "akwarium-objetosc-nominalna-a-rzeczywista": img("art-akwarium-objetosc.webp", "Mężczyzna mierzy taśmą wnętrze pustego akwarium stojącego na szafce"),
  "co-ustalic-przed-pierwsza-wizyta-u-groomera": img("art-groomer-wizyta.webp", "Opiekunka rozmawia z groomerem przy recepcji salonu, pies czeka na smyczy"),
  "gady-wymagania-gatunku-przed-zakupem-wyposazenia": img("art-gady-wymagania.webp", "Mężczyzna czyta atlas gadów przy biurku obok nierozpakowanego terrarium"),
  "informacje-dla-opiekuna-kota": img("art-opiekun-kota.webp", "Opiekunka przekazuje klucze i notatkę osobie, która zaopiekuje się kotem"),
  "jak-wybrac-opieke-dla-psa-na-czas-wyjazdu": img("art-opieka-pies-wyjazd.webp", "Opiekun z walizką przekazuje smycz labradora opiekunce przy drzwiach"),
  "ptaki-opieka-na-czas-wyjazdu": img("art-ptaki-wyjazd.webp", "Papużka falista w przestronnej klatce, opiekunka uzupełnia wodę"),
  "akwarium-opieka-podczas-wyjazdu": img("art-akwarium-wyjazd.webp", "Akwarium roślinne w salonie wieczorem, obok stoi walizka"),
  "gryzonie-opieka-podczas-nieobecnosci": img("art-gryzonie-nieobecnosc.webp", "Opiekunka dokłada siana dwóm świnkom morskim w dużym wybiegu"),
  "gryzonie-porownanie-gatunkow-przed-wyborem": img("art-gryzonie-porownanie.webp", "Rodzina przy stole porównuje małe zwierzęta, w tle wybieg świnki morskiej"),
  "jak-przygotowac-mieszkanie-na-przyjecie-kota": img("art-mieszkanie-kot.webp", "Młody kot ostrożnie poznaje przygotowane mieszkanie z drapakiem"),
  "jak-znalezc-opiekuna-dla-krolika-na-czas-wyjazdu": img("art-krolik-opiekun.webp", "Opiekunka wita królika w przestronnym wybiegu przed wyjazdem właściciela"),
  "przygotowanie-przestrzeni-dla-krolika-w-domu": img("art-krolik-przestrzen.webp", "Dwa króliki w dużym wybiegu w salonie z kryjówką i paśnikiem"),
  "maltanczyk-n77": img("art-maltanczyk.webp", "Biały maltańczyk z kitką na głowie czesany metalowym grzebieniem na kolanach opiekuna"),
};

export function articleImage(slug: string): SiteImage | null {
  return ARTICLE_IMAGES[slug] ?? null;
}
