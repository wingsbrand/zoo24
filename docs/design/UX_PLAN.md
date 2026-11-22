# ZOO24 — plan UX (v1, 2026-11-22)

Źródła: `CLAUDE.md`, `docs/MASTER_PLAN.md` (§0–4, §9), `docs/SEO_SOCIAL_RECOVERY.md`, `zoo24-ops/` (README, appendix, ACCEPTANCE), stan repo, dane GA4/FB z Windsor.ai. Pliki `ZOO24_MASTER_PLAN_DLA_CLAUDE_CODE_V2.md` / `ZOO24_SEO_SOCIAL_RECOVERY_V2.md` nie istnieją — odpowiednikami są `docs/MASTER_PLAN.md` i `docs/SEO_SOCIAL_RECOVERY.md` (v1.2). Pakiet `zoo24-ops` (instalacja 6 ról operacyjnych, harmonogramy) to **osobny etap, niewykonany** — panel pokazuje rzeczywisty stan: tryb `design`, brak harmonogramów.

## 1. Audyt: zachować / poprawić / zbudować

| Zachować | Dlaczego |
|---|---|
| Next.js 16 App Router + TS + Tailwind 4, SSR stron publicznych | szybkie, indeksowalne, działa |
| Logika SEO (`lib/seo`), social (`lib/social`), KPI z N/A, store, testy (111) | rdzeń bezpieczeństwa i wiarygodności, przetestowany |
| Struktura URL (`/uslugi/{kategoria}/{miasto}`, `/firma/{slug}`, `/poradniki/{slug}`, `/blog/{slug}` dla dawnych adresów) | zgodna z planem SEO; zmiana = ryzyko regresji |
| Logo „serce” (wybór właściciela) | ciągłość marki; kolor koła dostrojony do petrolu (ADR-010) |
| Uczciwe oznaczenia DEMO, „brak potwierdzonych danych”, brak ocen | wymóg wiarygodności |

| Poprawić | Problem |
|---|---|
| Wizualnie surowy UI (domyślne style, brak typografii) | brak rozpoznawalności i hierarchii |
| Wyszukiwanie: tylko kafelki miast | brak rozdzielenia usługa/lokalizacja, brak wpisania miasta, brak geolokalizacji |
| Listing: brak filtrów, sortowania, licznika, stronicowania, pustych stanów z pomocą | zadanie 1 trudne do wykonania |
| Profil: kontakt nisko, brak paska kontaktu na telefonie | zadanie 1 — ostatni krok |
| Artykuł: brak spisu treści, powiązanych treści, okładek, OG | zadanie 2 |
| „Dla firm”: formularz zapowiedziany, niedziałający | przycisk musi działać lub komunikować ograniczenie |
| Panel: lista kafli bez priorytetów | właściciel nie widzi od razu decyzji |

| Zbudować | Zakres F1 |
|---|---|
| System projektowy (tokeny + komponenty) | `app/globals.css`, `components/ui/*` |
| Katalog z filtrami opartymi na danych (rodzaj zwierzęcia, zakres usług, dostępny kontakt), sortowanie neutralne, stronicowanie, zachowanie stanu w URL | `/uslugi/...` |
| Formularze: zgłoszenie firmy, zgłoszenie błędu, kontakt — zapis do lokalnej kolejki moderacji, sprawdzanie statusu kodem | `/dodaj-firme`, `/zglos-blad`, `/kontakt`, `/status-zgloszenia` |
| Strony informacyjne: zasady redakcyjne, prywatność (szkic), regulamin (szkic), reklama i współprace | prawnik uzupełnia przed live |
| Panel 4 pytań + moderacja zgłoszeń | `/admin`, `/admin/moderacja` |
| Okładki poradników i obrazy OG | `next/og` |
| Ekrany systemowe: 404, błąd serwera, brak dostępu do panelu | `not-found`, `error`, `global-error` |

**Poza zakresem (backlog):** konta firm i logowanie (Supabase Auth — F2), mapa (licencja dostawcy), opinie/oceny, płatne wyróżnienia i checkout (P1/F4), godziny otwarcia i ceny (wymagają potwierdzenia), wyszukiwarka pełnotekstowa poradników po >20 tekstach, prawdziwe zdjęcia (prawa — rejestr assetów).

## 2. Cztery zadania — ścieżki

### Z1. Opiekun znajduje usługę i kontaktuje się z firmą
- **Wejście:** Google (landing `/uslugi/{kategoria}/{miasto}`), strona główna, link z poradnika lub posta FB (UTM).
- **Kroki:** wybór rodzaju usługi → miasto (lista, wpisanie, opcjonalnie „Użyj mojej lokalizacji”) → lista z licznikiem i filtrami → profil → „Zadzwoń” / „Strona firmy”.
- **Informacje do decyzji:** zakres usług, dla jakich zwierząt, obszar działania, dostępne kanały kontaktu, źródło i data sprawdzenia danych. **Bez ocen** (brak wiarygodnej weryfikacji opinii).
- **Błędy/stany:** brak firm w mieście (pomoc: inne miasto, druga kategoria, poradnik, „zgłoś firmę”), miasto spoza pilotażu, brak telefonu/www, filtry dające 0 wyników (usuń pojedynczy / wyczyść), odmowa geolokalizacji (komunikat + ręczny wybór).
- **Rezultat:** wyjście do firmy (mierzone jako `business_site_outbound` / `business_phone_outbound` — to kliknięcie, nie pozyskany klient).

### Z2. Czytelnik dostaje odpowiedź i przechodzi do usług
- **Wejście:** Google na dawny adres `/blog/...` lub nowy `/poradniki/...`, social.
- **Kroki:** tytuł + lead → spis treści → treść → checklista → „Znajdź usługę w swoim mieście” (kontekstowy blok) → powiązane poradniki.
- **Informacje:** autor/redakcja, data aktualizacji, status weryfikacji, źródła.
- **Stany:** artykuł niezatwierdzony = 404 publicznie, podgląd tylko w panelu.
- **Rezultat:** `article_to_directory` (zdarzenie agregowane).

### Z3. Firma zgłasza / aktualizuje profil
- **Wejście:** `/dla-firm`, link „Zgłoś firmę” w pustym listingu, stopka.
- **Kroki:** zasady obecności (bezpłatnie, moderacja, brak ocen, oznaczanie płatnych wyróżnień w przyszłości) → formularz (nazwa, kategoria, miasto, www, telefon publiczny, e-mail kontaktowy do weryfikacji, zgoda) → potwierdzenie z kodem zgłoszenia → `/status-zgloszenia` (oczekuje / zaakceptowane / odrzucone z powodem).
- **Błędy:** walidacja pól po polsku przy polu, honeypot antyspam, limit długości.
- **Rezultat:** zgłoszenie w kolejce moderacji (prywatne). Weryfikacja kontroli nad firmą — ręcznie przez moderatora (F1), automatyczna e-mailowa — F2.

### Z4. Właściciel widzi, co działa i co wymaga decyzji
- **Wejście:** `/admin` (lokalnie).
- **Pierwszy ekran odpowiada na 4 pytania:** (1) Co wymaga mojej decyzji — liczniki z linkami: zgłoszenia firm, artykuły, posty, mapa URL; (2) Czy publikacje i automatyzacje działają — kill switch, tryb, kanały, „harmonogram: brak (joby ręczne)”, ostatnie uruchomienia; (3) Wyniki — kafle z okresem, źródłem, aktualnością, rozróżnieniem 0 vs N/A; (4) Co się wydarzyło od ostatniej wizyty — audit log od znacznika wizyty.
- **Rezultat:** decyzja jednym kliknięciem z potwierdzeniem (zapisane w audycie).

## 3. Architektura informacji
Nawigacja główna: **Usługi** · **Poradniki** · **Dla firm** · **O ZOO24**. Stopka: usługi (kategorie × miasta), poradniki, firma (o nas, zasady redakcyjne, reklama i współprace, kontakt, zgłoś błąd), formalne (prywatność, regulamin).

## 4. Macierz ekranów i stanów

| Ekran | Trasa | Stany | Indeksacja |
|---|---|---|---|
| Strona główna | `/` | standard; brak opublikowanych poradników | tak (prod) |
| Usługi — hub | `/uslugi` | — | tak |
| Kategoria | `/uslugi/{kat}` | — | tak |
| Listing | `/uslugi/{kat}/{miasto}` | wyniki; filtry aktywne; 0 wyników po filtrach; brak firm; stronicowanie; nieznana strona | noindex gdy < 3 realnych firm lub filtr/strona>1 (canonical do bazy) |
| Wyszukiwarka | `/szukaj?usluga=&miasto=` | przekierowanie 303 do listingu; miasto spoza pilotażu; brak usługi | noindex |
| Profil firmy | `/firma/{slug}` | pełne dane; brak telefonu; brak www; brak usług; długa nazwa; DEMO | noindex dla DEMO |
| Poradniki — hub | `/poradniki` | lista; filtr tematu; brak wyników | tak |
| Artykuł | `/poradniki/{slug}`, `/blog/{slug}` | opublikowany; niezatwierdzony (404); podgląd w panelu | tak (prod, nie-DEMO) |
| Dla firm | `/dla-firm` | — | tak |
| Zgłoszenie firmy | `/dodaj-firme` | formularz; błędy walidacji; sukces z kodem | noindex |
| Status zgłoszenia | `/status-zgloszenia` | formularz kodu; oczekuje; zaakceptowane; odrzucone; nie znaleziono | noindex |
| Zgłoś błąd / Kontakt | `/zglos-blad`, `/kontakt` | formularz; błędy; sukces | tak / tak |
| Informacyjne | `/o-nas`, `/zasady-redakcyjne`, `/reklama-i-wspolprace`, `/polityka-prywatnosci`, `/regulamin` | szkic prawny oznaczony | tak (prawne po akceptacji) |
| Panel | `/admin`, `/admin/moderacja`, `/admin/content`, `/admin/social`, `/admin/seo` | dane; brak danych (N/A); integracja niedostępna; sukces/błąd akcji | nigdy |
| Systemowe | 404, `error`, panel poza lokalnym środowiskiem (404) | — | nigdy |
| Logowanie / odzyskiwanie dostępu | — | **nie dotyczy F1** (brak kont); backlog F2 | — |

## 5. Hipotezy projektowe (niezweryfikowane)
1. Ruch organiczny dawnego serwisu był w 77% poradnikowy (GA4, TOP 100) → blok „Znajdź usługę” w artykule jest głównym mostem do katalogu.
2. Większość wejść z social i Google lokalnego będzie mobilna → przyklejony pasek kontaktu na profilu, cele dotykowe ≥ 44 px.
3. Brak ocen nie zniechęci, jeśli profil jasno pokaże zakres usług, źródło i datę sprawdzenia.
Weryfikacja: zdarzenia `business_*_outbound`, `article_to_directory` po starcie (brak danych RUM przed live).
