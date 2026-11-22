# ZOO24 — raport QA przebudowy UX/UI (2026-11-22)

Środowisko: lokalny prototyp (Next.js 16.4.6, dev `http://localhost:3024`, `ZOO24_ENV=local`), dane DEMO. Przeglądarka: wbudowany podgląd Claude (Chromium). Raportuję wyłącznie faktycznie wykonane kontrole.

## 1. Komendy (wykonane przez orkiestratora)
| Komenda | Wynik |
|---|---|
| `npx tsc --noEmit -p .` | PASS — 0 błędów |
| `npx vitest run` | PASS — 16 plików, 195/195 testów (katalog, poradniki/TOC/tematy, zgłoszenia, SEO, social, analytics) |
| `npx next build` | PASS — 37 tras, bez ostrzeżeń (po poprawce adnotacji fs) |
| `npm run scan:secrets` | PASS |
| `node scripts/smoke-http.mjs` | PASS — 20/20 (statusy 301/404/410, noindex, DEMO, brak ocen) |
| `node scripts/seo-meta-check.mjs` (nowy) | PASS — 12/12 (canonical/robots dla filtrów, stronicowania, /szukaj, hubu poradników, szkiców prawnych, niezatwierdzonych /blog) |
| Test `/api/event` | PASS — opublikowany artykuł 204; nieznany/niezatwierdzony slug 422; obce Origin 403; niedozwolony typ 400 |

## 2. Zadania użytkownika (przejście w przeglądarce)
| Zadanie | Kroki | Wynik |
|---|---|---|
| Z1 — znajdź usługę i kontakt | strona główna → „Groomer” + wpisane „wawa” → przekierowanie na `/uslugi/groomer/warszawa` (8 firm) → filtry „koty” + „strzyżenie” (3 z 8, aktywne etykiety, „Wyczyść wszystkie”) → profil → okruszek wraca z zachowanymi filtrami (`?zwierze=koty&usluga=…`) | PASS |
| Z1 mobile | profil na 390 px: przyklejony pasek „Strona firmy”, treść nie jest zasłonięta | PASS |
| Z2 — poradnik → usługi | podgląd artykułu (maltańczyk): hero, metadane, spis treści w kolumnie bocznej, checklista, blok usług, źródła | PASS (prawdziwe artykuły czekają na akceptację — publicznie 404, zgodnie z założeniem) |
| Z3 — zgłoszenie firmy | pusty formularz → podsumowanie „Popraw 7 pól” z linkami + błędy przy polach → poprawne dane testowe → kod `ZG-…`, opis „co dalej”, brak e-maila (prototyp) → `/status-zgloszenia?kod=…` pokazuje „Zaakceptowane” po decyzji | PASS |
| Z4 — decyzja właściciela | `/admin`: 4 sekcje (decyzje z licznikami, automatyzacje, wyniki z okresem/źródłem, zmiany od ostatniej wizyty) → `/admin/moderacja`: odrzucenie bez powodu zablokowane („Podaj powód…”), akceptacja zapisana, potwierdzenie na stronie + link do statusu | PASS (po poprawce: potwierdzenie znikało razem z kartą) |

## 3. Responsywność i dostępność
- Szerokości sprawdzone: **320** (reflow), **390**, **768**, **1024**, **1280**, **1440**.
- 320 px, automatyczna kontrola DOM (`scrollWidth`, liczba `h1`, duplikaty `id`, pola bez etykiet) na: `/`, listing z filtrem, profil z najdłuższą nazwą, artykuł, `/dodaj-firme`, `/admin`, `/admin/social`, `/admin/seo`, `/admin/moderacja`, `/admin/content`, `/admin/wyniki` → po poprawkach wszędzie: brak przewijania poziomego, 1 × `h1`, 0 duplikatów `id`, 0 pól bez etykiet.
- Klawiatura: pierwszy Tab = „Przejdź do treści” (widoczny); menu mobilne: `aria-expanded`, zamknięcie Esc z powrotem fokusu na przycisk.
- Kontrast (wzór WCAG, policzony skryptem): tekst pomocniczy 6,62:1; biały na przycisku-akcencie **5,34:1** (po poprawce — wcześniej 4,09:1, FAIL wykryty przez QA); koral jako tekst 6,32–6,83:1; petrol na tle 7,86:1; DEMO 6,24:1; statusy ok/warn ≥ 4,69:1.
- Obrazy OG: renderowane i obejrzane; polskie znaki (ą, ć, ł) poprawne; tytuł zawężony, by nie wchodził na grafikę.

## 4. Niezależne QA (`zoo24-qa`, przegląd statyczny — agent bez narzędzia do komend)
Werdykt agenta: FAIL (1 × high). Status po poprawkach:
| Uwaga | Status |
|---|---|
| HIGH: kontrast białego na akcencie 4,09:1 | **Poprawione** — `--color-accent` `#b8461f` (5,34:1), `--color-accent-dark` `#963818` |
| Licznik firm na stronie głównej: bez odmiany i bez oznaczenia DEMO | Poprawione (`firmCount` + „w tym N DEMO”) |
| „sprawdzone usługi” sugeruje ocenę | Poprawione → „firmy ze sprawdzonymi danymi” |
| Etykieta współpracy w artykule bez słowa „Reklama” | Poprawione → „Reklama · współpraca komercyjna” |
| `/api/event` przyjmuje dowolny `ref`, brak kontroli Origin | Poprawione (tylko opublikowane artykuły / znane listingi, Origin = host) |
| Cele dotykowe: stopka, okruszki, „Panel” | Poprawione (stopka/panel 44 px; okruszki ≥ 24 px — minimum WCAG 2.5.8) |
| 768–1023 px bez CTA i bez menu; `aria-controls` do nieistniejącego elementu | Poprawione (menu do `lg`, nav zawsze w DOM z `hidden`) |
| Placeholder `ink-muted/70` | Poprawione (pełny `ink-muted`) |
| `aria-invalid` na fieldset; brak `aria-required` na zgodach | Poprawione |
| EmptyState `h2` pod `h2` | Poprawione (`headingLevel`) |
| Status harmonogramu na sztywno; emoji bez `aria-hidden` | Poprawione |
| Moderacja: wartość „update” | Poprawione |
| Rate limit oparty o UA + język | **Otwarte** — znane ograniczenie F1; przed produkcją: limit po stronie infrastruktury (IP/edge) |
| Stronicowanie: noindex + canonical do bazy | **Otwarte (świadoma decyzja)** — strony filtrów/stronicowania nieindeksowane; do rewizji, gdy listingi będą miały > 9 realnych firm |
| Kategoria indeksowalna niezależnie od liczby firm | Otwarte — huby mają unikalną treść; poza produkcją i tak noindex |
| `role="search"` na formularzu statusu; brak limitu sprawdzania kodu | Otwarte (low) — kod ma 32^6 kombinacji; limit do dodania z rate limitem infrastruktury |

## 5. Ograniczenia weryfikacji
- **Brak danych RUM** (LCP/INP/CLS w 75. percentylu) — serwis nie jest publiczny. Lighthouse nie był uruchamiany (brak narzędzia w sesji). Ocena laboratoryjna: strony publiczne renderowane na serwerze, fonty self-hosted (`next/font`, `display: swap`), brak obrazów rastrowych, stałe proporcje okładek, JS klienta tylko dla menu, geolokalizacji, formularzy i spisu treści.
- Czytnik ekranu (NVDA/VoiceOver) — nie testowano; semantyka sprawdzona przez drzewo dostępności przeglądarki.
- Geolokalizacja — nie testowano zgody/odmowy w przeglądarce (wymaga interakcji użytkownika z uprawnieniem); obsługa odmowy jest w kodzie.
- Zrzuty ekranu wykonane w podglądzie przeglądarki w trakcie sesji (desktop 1280/1440, tablet 768, telefon 390, reflow 320) — nie zapisane jako pliki w repo.
- Zachowanie `<select defaultValue>` po błędzie akcji w React 19 — zweryfikowane pośrednio (formularz po błędzie zachował wartości tekstowe; selecty były puste w teście) — do ponownego sprawdzenia przy kolejnej iteracji.
