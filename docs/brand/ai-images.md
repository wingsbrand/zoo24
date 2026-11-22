# Ilustracje AI — rejestr (2026-11-22)

Źródło: fal.ai, model `google/nano-banana-2.1` (konto właściciela), polecenie właściciela w czacie: „zmodyfikuj UX/UI strony stosując więcej wygenerowanych zdjęć lifestyle/petcare. Korzystaj z integracji fal.ai”.

Zasady:
- Ilustracje nie przedstawiają realnych osób, firm, salonów ani zwierząt. Na stronie każda ma widoczne oznaczenie **„Ilustracja AI”** (`components/ui/ai-badge.tsx`).
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
