# ZOO24 — Portal V3: plan, stan i odbiory

Źródło zakresu: `docs/ZOO24_AUDYT_I_INSTRUKCJA_ROZWOJU_V3.md` (polecenie właściciela 2026-11-22). Rozszerza pilotaż groomerów i hoteli (MASTER_PLAN, ADR-001…014) — **bez sklepu**, z małym udziałem właściciela. Obowiązują dotychczasowe uprawnienia (CLAUDE.md, polityka `ops/config/activation.json`), mapa odzyskiwania ruchu i zasady social Mode 0.

## 1. Weryfikacja obserwacji audytu (stan 2026-11-22 wieczór)
| ID | Obserwacja | Status | Rodzaj problemu | Działanie |
|---|---|---|---|---|
| A01 | Strona główna = groomerzy/hotele, psy i koty | **aktualne** | zakres/treść | nowa hierarchia portalu (pakiet 1) |
| A02 | 0 publicznych poradników | **aktualne na produkcji** | **brak opublikowanej treści + brak ścieżki publikacji w produkcji** (nie filtr, nie cache) | zob. §2 |
| A03 | 1 groomer × 10 miast, 0 hoteli | **aktualne** (10 firm w bazie produkcyjnej, 0 hoteli) | brak danych | jakość danych w eksponowanych lokalizacjach; bez pustych kombinacji |
| A04 | Puste lokalizacje linkowane ze strony głównej i stopki | **aktualne** (karty miast z „0 firm”) | konfiguracja nawigacji | linki tylko do niepustych kombinacji; bezpośrednie wejście = 200 z uczciwym stanem pustym (noindex) |
| A05 | AnimalRoom niepotwierdzony | **aktualne** — 7 z 10 firm `verifiedByHuman=false` | dane | od dziś noindex do weryfikacji (N6); kolejka weryfikacji (rola knowledge) |
| A06 | 3 profile z oznaczeniem sprawdzenia 22.11.2026 | **aktualne** (r02, r04, r10) | proces | dowody weryfikacji do udokumentowania w rejestrze (kto, kiedy, źródło) — wpis w CONTENT_COVERAGE |
| A07 | Pusta strona hoteli proponuje groomera | **aktualne** | logika rekomendacji | alternatywy zgodne z potrzebą (opieka na wyjazd, lista dla opiekuna) |
| A08 | „Poleć znaną firmę” vs formularz tylko dla właściciela | **aktualne** | proces | osobne: polecenie miejsca / zgłoszenie własnej firmy / przejęcie profilu |
| A09 | Brak struktury innych grup | **aktualne** | architektura | model 10 grup × gatunek × rasa + oś potrzeb (`lib/taxonomy/animals.ts`) |
| A10 | AI może zatwierdzać część tekstów | **aktualne, zawężone** | zasady | od dziś: AI tylko klasa *standard*; *welfare/health/legal* wymagają człowieka z rolą (kod + test) |

Preview vs produkcja: produkcja `ZOO24_ENV=production`, domena kanoniczna https://zoo24.pl (DNS przełączony 2026-11-22, propagacja/HTTPS w toku); alias `*.vercel.app` = `noindex` + `Disallow` (ADR-014). Uwaga z audytu (G4): `Disallow` uniemożliwia robotowi odczyt `noindex`. Rekomendacja: dla aliasu pozostawić `noindex` i zezwolić na crawl (robot zobaczy noindex) — **nie zmieniono automatycznie** (wymóg „nie usuwaj ograniczeń preview automatycznie”); decyzja w pakiecie 2.

## 2. Diagnoza „0 poradników” (A02)
Przyczyny (sprawdzone w kodzie i bazie):
1. W produkcji z założenia znikają artykuły DEMO (seed + `lib/store/sync.ts`) — 0 to prawda, nie błąd filtra.
2. Treści z repo (`content/blog`, `content/guides`) zawsze wchodzą jako `needs_review` (`loadContentArticles`), a panel `/admin` w produkcji zwraca 404 → **nie było ścieżki publikacji w produkcji**.
3. 3 artykuły pod dawnymi URL (#1–3 GA4) mają akceptację redaktora-AI (hash) — publikację wykona gateway sesji ops po działającym HTTPS i podpisie polityki `live_scoped` (zgoda właściciela: „Yes, publish when ready”).
4. Hub `/poradniki` filtruje poprawnie (testy); rejestr/sitemap pokazuje hub dopiero przy ≥1 opublikowanym realnym artykule (N5).

Pełny cykl na jednym materiale (staging, test automatyczny `tests/content/publication-cycle.test.ts`): źródła → szkic → `submit` → zatwierdzenie konkretnej wersji (hash) → publikacja → widoczność na liście, w wyszukiwaniu i w sitemap → korekta (publicznie stara wersja do zatwierdzenia) → ponowne zatwierdzenie. Dodatkowo: materiał dobrostanowy nie przejdzie przez AI ani właściciela bez roli specjalisty; twierdzenie bez źródła blokuje publikację.

## 3. Architektura
- **Zwierzę:** 10 grup nawigacyjnych (psy, koty, króliki, gryzonie, fretki i inne małe ssaki, ptaki, ryby i akwarystyka, gady, płazy, bezkręgowce) → gatunek → rasa. Króliki ≠ gryzonie; aksolotl = płazy.
- **Potrzeba:** wybór zwierzęcia, przygotowanie domu, środowisko, codzienna opieka, żywienie, zachowanie, wyposażenie, transport, wyjazdy, koszty, profesjonalna pomoc.
- **Format:** centrum wiedzy, karta gatunku/rasy, poradnik zadaniowy, checklista/narzędzie.
- **Ryzyko → przegląd:** standard → redaktor (może AI, jawnie); welfare → specjalista gatunkowy; health → lekarz weterynarii; legal → prawnik. Klasa efektywna nie spada poniżej wynikającej z potrzeb.
- **Adresy:** `/zwierzeta`, `/zwierzeta/<grupa>`, `/zwierzeta/<grupa>/<gatunek>`; artykuł ma jeden adres kanoniczny (`/poradniki/<slug>`, dawne `/blog/<slug>` zachowane); zestawienia przez filtry `?zwierze=`, `?potrzeba=` (noindex). Narzędzia: `/narzedzia/...`.
- **Ekspozycja:** grupa/gatunek publiczne dopiero z ≥1 opublikowanym materiałem; pozostałe przygotowane w zapleczu (404 w produkcji, podgląd poza produkcją), bez indeksowalnych pustych kombinacji.

## 4. Podział pracy (pakiet 1)
| Rola | Wykonawca | Zakres plików |
|---|---|---|
| Koordynacja produktu/UX, integracja | orkiestrator | model (`lib/taxonomy`, `lib/types`), proces redakcyjny (`lib/content/editorial.ts`), dokumentacja, wdrożenia |
| Budowa — portal | agent portal | strona główna, nawigacja, `/zwierzeta`, `/poradniki`, widok artykułu, rejestr SEO |
| Budowa — katalog | agent katalog | `/uslugi`, `/firma`, `/dodaj-firme`, `/polec-miejsce`, zgłoszenia |
| Budowa — narzędzia | agent narzędzia | `/narzedzia/*`, `lib/tools/*` + testy |
| Baza wiedzy + treści | 2 agentów treści | `content/guides/*.json` (źródła, twierdzenia, klasa ryzyka) |
| SEO | agent SEO | inwentaryzacja dawnych URL, mapa odzyskiwania |
| Publikacja / gateway / social | sesja zoo24-ops | `lib/ops/*`, `content/blog/*`, harmonogram chmurowy |
| QA (niezależny odbiór) | agent QA po integracji | raport `docs/PORTAL_V3_QA.md` |

## 5. Statusy odbioru (definicje V3 §17)
- **Wersja techniczna gotowa** — ekrany, model, narzędzia i proces działają (nie oznacza publikacji).
- **Częściowe uruchomienie redakcyjne** — zatwierdzone, publiczne materiały i działające ścieżki w eksponowanych działach.
- **Pełny zakres 10 grup** — użyteczna zawartość każdej grupy.
Szkice i zapowiedzi nie są opublikowaną treścią. Brak wymaganego review zatrzymuje dany materiał — pozostałe prace trwają.

## 5a. Social (Mode 0)
Kalendarz V3 (`docs/social/calendar-v3-14d.json`, `docs/social/CALENDAR_V3.md`, 16 szkiców, start 30.11) **zastępuje** kalendarz relaunchu `docs/social/drafts-14d.json` w tych samych datach (decyzja orkiestratora 2026-11-22 — stary częściowo linkował do treści DEMO). Posty tylko do stron opublikowanych na zoo24.pl; publikacja wymaga Mode 1, uprawnień Meta i akceptacji copy.

## 6. Model pracy z redakcją i specjalistami (do decyzji właściciela — opcje kosztowe w raporcie)
- Rola zewnętrznego **redaktora** (człowiek) dla klasy standard + **specjaliści per grupa** dla welfare (np. behawiorysta/zoolog/lekarz weterynarii egzotycznych).
- Agenci: knowledge zbiera dowody, content pisze, orkiestrator integruje; publikacja automatyczna po zatwierdzeniu wersji; właściciel tylko decyzje i wyjątki (raport tygodniowy).
- Brak specjalisty = materiał czeka z jawnym powodem (`review.waitingReason`) widocznym w panelu.
