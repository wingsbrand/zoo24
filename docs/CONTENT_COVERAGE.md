# ZOO24 — pokrycie treści (Portal V3)

Stan: 2026-11-22. Statusy: **przygotowany** (szkic ze źródłami), **zatwierdzony** (wersja z hashem, wymagany przegląd wykonany), **opublikowany** (publicznie na zoo24.pl, potwierdzony odczytem), **czeka** (brak wymaganego przeglądu — powód niżej). Szkic ≠ publikacja.

## 1. Pierwsza partia — 12 materiałów z 7 grup (`content/guides/`)
| Grupa | Materiał | Klasa ryzyka | Wymagany przegląd | Status |
|---|---|---|---|---|
| Psy | Jak wybrać opiekę dla psa na czas wyjazdu | standard | redaktor (AI dopuszczalne, jawnie) | przygotowany → recenzja redaktora-AI w toku |
| Psy | Co ustalić przed pierwszą wizytą u groomera | standard (do potwierdzenia: uwaga o suszeniu) | redaktor | przygotowany → recenzja w toku |
| Koty | Informacje dla osoby, która zaopiekuje się kotem | standard | redaktor | przygotowany → recenzja w toku |
| Koty | Jak przygotować mieszkanie na przyjęcie kota | **welfare** | specjalista (koty) | **czeka** — brak specjalisty |
| Króliki | Przygotowanie przestrzeni dla królika w domu | **welfare** | specjalista (króliki) | **czeka** — brak specjalisty |
| Króliki | Jak znaleźć opiekuna z doświadczeniem w królikach | **welfare** (łączenie par, codzienna kontrola) | specjalista (króliki) | **czeka** — brak specjalisty |
| Gryzonie | Jak porównać potrzeby gatunków przed wyborem | **welfare** | specjalista (gryzonie) | **czeka** — brak specjalisty |
| Gryzonie | Opieka nad gryzoniem podczas nieobecności | **welfare** | specjalista (gryzonie) | **czeka** — brak specjalisty |
| Ptaki | Jak zorganizować opiekę nad ptakiem na czas wyjazdu | standard | redaktor | przygotowany → recenzja w toku |
| Akwarystyka | Objętość nominalna a rzeczywista ilość wody | standard | redaktor | przygotowany → recenzja w toku |
| Akwarystyka | Opieka nad akwarium podczas wyjazdu | **welfare** (żywienie, jakość wody) | specjalista (akwarystyka) | **czeka** — brak specjalisty |
| Gady | Jak sprawdzić wymagania gatunku przed zakupem wyposażenia | standard (metoda, bez parametrów) | redaktor | przygotowany → recenzja w toku |

Dawne adresy (`content/blog/`): kot brytyjski, cane corso, maltańczyk — **zatwierdzone** przez redaktora-AI (hash), publikacja przez gateway po działającym HTTPS.

Narzędzia (opublikowane w kodzie, bez przeglądu treści merytorycznej): lista dla opiekuna na wyjazd, kalkulator objętości akwarium.

Każdy materiał ma: przypisanie do grupy (gatunek, gdy dotyczy), potrzeby opiekuna, źródła z URL, rejestr kluczowych twierdzeń (źródło, dowód, warunki, data dostępu), autorstwo „Redakcja ZOO24 (szkic przygotowany z pomocą AI)”, termin przeglądu 2027-05-22.

## 2. Pokrycie grup (publicznie po publikacji klasy standard)
| Grupa | Opublikowane (plan) | Czeka na specjalistę | Historyczny ruch (dawny blog) |
|---|---|---|---|
| Psy | 2 + cane corso, maltańczyk | — | 92 artykuły w archiwum — największy potencjał |
| Koty | 1 + kot brytyjski | 1 | 50 artykułów |
| Króliki | 0 → **dział niepubliczny** | 2 | 3 |
| Gryzonie | 0 → **dział niepubliczny** | 2 | 2 |
| Fretki i inne małe ssaki | 0 | — | 0 |
| Ptaki | 1 | — | 1 |
| Ryby i akwarystyka | 1 (+ kalkulator) | 1 | 0 artykułów (sklep: >1000 produktów) |
| Gady | 1 | — | 0 |
| Płazy | 0 | — | 0 |
| Bezkręgowce | 0 | — | 0 |

## 3. Plan uzupełnienia pozostałych grup (kolejność wg `fillOrder` i potencjału)
1. **Psy, koty** — odtworzenie najcenniejszych dawnych artykułów blogowych (`docs/seo/URL_RECOVERY_MAP_V3.md`: rasy — kot syberyjski, bengalski, shih tzu, buldog francuski; tematy zdrowotne — wyłącznie po recenzji lekarza weterynarii).
2. **Króliki, gryzonie** — odblokowanie przygotowanych materiałów przez specjalistę; potem karty gatunków (kawia, chomik, szczur…), start „przed wyborem”.
3. **Akwarystyka** — planowanie pierwszego akwarium, cykl azotowy (welfare → specjalista), karta „ryby akwariowe — od czego zacząć”.
4. **Ptaki** — karty papużki falistej, nimfy, kanarka (welfare).
5. **Fretki i małe ssaki, gady, płazy, bezkręgowce** — po jednym przewodniku startowym „jak rozpoznać gatunek i znaleźć rzetelne wymagania” (standard) + karty gatunków po przeglądzie specjalisty.
Termin każdej pozycji wynika z dostępności przeglądu — nie publikujemy, by „zapełnić” dział.

## 4. Model redakcji (do decyzji właściciela — bez zaciągniętych zobowiązań)
Agenci: knowledge zbiera dowody, content pisze, orkiestrator integruje, gateway publikuje zatwierdzoną wersję i potwierdza odczytem. Właściciel: decyzje i wyjątki (raport tygodniowy).
Brakujące role ludzkie i opcje:
| Opcja | Zakres | Plusy / minusy | Koszt |
|---|---|---|---|
| A. Redaktor freelancer + specjaliści „za materiał” | redaktor: klasa standard i spójność; specjaliści: welfare per grupa | elastyczne, płacisz za realny przegląd; wymaga koordynacji | wycena po zapytaniu (stawka za recenzję materiału) |
| B. Stała współpraca: lekarz weterynarii zwierząt egzotycznych + behawiorysta/zoolog | welfare i zdrowie dla wszystkich grup poza psami/kotami | ciągłość i możliwość pokazania recenzentów (za zgodą) | wycena miesięczna po zapytaniu |
| C. Partnerstwa z organizacjami/stowarzyszeniami (np. hodowców, akwarystów, herpetologów) | przegląd w zamian za widoczność/afiliację z jawnym oznaczeniem | niski koszt; wolniejsze i zależne od partnera | barter / do negocjacji |
Rekomendacja: A na start (2–3 specjalistów: króliki/gryzonie, akwarystyka, gady), B po walidacji ruchu. Strony autorów i recenzentów powstaną dopiero dla realnych osób, za ich zgodą.
