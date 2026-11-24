# Ilustracje AI — rejestr (2026-11-22)

Źródło: fal.ai, model `google/nano-banana-2.1` (konto właściciela), polecenie właściciela w czacie: „zmodyfikuj UX/UI strony stosując więcej wygenerowanych zdjęć lifestyle/petcare. Korzystaj z integracji fal.ai”.

Zasady:
- Ilustracje nie przedstawiają realnych osób, firm, salonów ani zwierząt. **Od 2026-11-23 bez napisu na obrazie** (decyzja właściciela, ADR-016; `SHOW_AI_IMAGE_BADGE = false`). Ogólna informacja o ilustracjach AI: regulamin §, zasady redakcyjne.
- Nie używamy ich jako zdjęć konkretnej firmy w katalogu ani jako „dowodu” w poradniku.
- Prompty bez napisów, logo i znaków wodnych. Sprawdzone wizualnie: brak tekstu, poprawna anatomia, zgodność cech rasy (kot brytyjski, cane corso, maltańczyk).
- Warunki licencyjne modelu/dostawcy dla użytku komercyjnego — do potwierdzenia przez compliance przed produkcją (zoo24.pl).
- Do social media (FB/IG) — osobny wpis w `docs/social/asset-register.json` przed użyciem.

| Plik (`public/images/`) | Użycie | Opis (prompt w skrócie) |
|---|---|---|
| hero-dom.webp (3168×1344) | baner strony głównej | kobieta z golden retrieverem i kotem w jasnym mieszkaniu |
| kategoria-groomer.webp | karta + nagłówek kategorii Groomer | groomerka suszy białego psa w salonie |
| kategoria-hotel.webp | karta + nagłówek kategorii Hotel | opiekunka z psami w przytulnym hotelu |
| dla-firm.webp | sekcja i strona „Dla firm” | właścicielka salonu z pudlem |
| art-jak-wybrac-groomera.webp | poradnik `jak-wybrac-groomera` (DEMO) | przekazanie cocker spaniela groomerce |
| art-hotel-dla-psa-checklista.webp | poradnik `hotel-dla-psa-checklista` (DEMO) | pies przy spakowanej torbie |
| art-pielegnacja-psa-zima.webp | poradnik `pielegnacja-psa-zima` (DEMO) | pies w sweterku na zimowym spacerze |
| art-kot-brytyjski.webp | `/blog/kot-brytyjski-n66` | kot brytyjski szczotkowany na sofie |
| art-cane-corso.webp | `/blog/cane-corso-n63` | cane corso z opiekunem na łące |
| art-maltanczyk.webp | `/blog/maltanczyk-n77` | maltańczyk czesany na kolanach |

## Partia 2026-11-23 — ilustracje do 29 artykułów (fal.ai, google/nano-banana-2.1, 1K, 16:9, webp)
Polecenie właściciela: „brakuje jeszcze zdjęć do artykułów. wygeneruj wszystkie zdjęcia bez informacji »Wygenerowane przez AI«”. Prompty: fotorealistyczne zdjęcie lifestyle, bez napisów, logo i znaków wodnych; cechy rasy opisane w promptcie. Kontrola wizualna: zestawienie wszystkich 29 + szczegółowo basenji, doberman (naturalne uszy i ogon), westie, shih tzu, gady (bez zwierzęcia — planowanie przed zakupem). Pliki `public/images/art-<slug>.webp`, przypisania w `lib/content/images.ts`. Identyfikatory zadań fal: zachowane w transkrypcji sesji (submission_key `zoo24-art-*-v1`).

| Pliki | Artykuły |
|---|---|
| art-basenji, art-border-collie, art-chihuahua, art-corgi, art-dalmatynczyk, art-doberman, art-jack-russell-terrier, art-jamnik, art-owczarek-niemiecki, art-shiba-inu, art-shih-tzu, art-west-highland-white-terrier | profile ras psów `/blog/*` |
| art-kot-bengalski, art-kot-syberyjski, art-kot-syjamski, art-maine-coon, art-ragdoll | profile ras kotów `/blog/*` |
| art-akwarium-objetosc, art-groomer-wizyta, art-gady-wymagania, art-opiekun-kota, art-opieka-pies-wyjazd, art-ptaki-wyjazd | opublikowane poradniki `/poradniki/*` |
| art-akwarium-wyjazd, art-gryzonie-nieobecnosc, art-gryzonie-porownanie, art-mieszkanie-kot, art-krolik-opiekun, art-krolik-przestrzen | poradniki czekające na przegląd (niepubliczne) |
