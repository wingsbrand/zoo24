# ZOO24 — Portal V3, pakiet 1: niezależny odbiór QA

Data: 2026-11-22 (19:45–19:58). Wykonawca: agent QA (nie budował pakietu). Commit w chwili testów: `98e284c` (po `f4998a8`).
Zasada raportu: tylko zweryfikowane fakty. „NOT RUN” nie oznacza PASS.

## Środowiska

| Id | Co | Dane |
|---|---|---|
| **A** | dev `http://localhost:3024` (tryb lokalny, DEMO widoczne, panel włączony), uruchomiony wcześniej, nie zatrzymywany | `.data/state.json` |
| **B** | `next build` + `next start -p 3025`, `ZOO24_ENV=production`, `ZOO24_SITE_URL=https://zoo24.pl`, izolowany `ZOO24_DATA_DIR` (%TEMP%\zoo24-qa-v3) | **symulacja publikacji (QA)**: w state.json ręcznie ustawiono `status=published`, `publishedAt`, `review={required:"editor",by:"claude-ai-editor",byKind:"ai"}` dla 6 poradników standard; nic nie zostało opublikowane w internecie |
| **C** | dodatkowo: ten sam build, `next start -p 3026` **bez** `ZOO24_ENV` (tryb lokalny), osobny pusty katalog danych (%TEMP%\zoo24-qa-v3-local) | utworzony, bo w A brak 12 poradników V3 (zob. D-02) |

Na koniec B i C zatrzymane, oba katalogi danych usunięte. A działa dalej. Uwaga: katalog `.next` zawiera teraz build QA (ZOO24_ENV=production) — przed ewentualnym lokalnym `next start` przebuduj.

## Werdykt

| Status (V3 §17 / PORTAL_V3_PLAN §5) | Ocena |
|---|---|
| **Wersja techniczna gotowa** | **TAK, z zastrzeżeniami** — ekrany, model grup, narzędzia, filtry, sitemap/robots, blokada AI dla welfare, formularze działają; tsc i 348 testów przechodzą. Zastrzeżenia: panel moderatora nie pokazuje powodu oczekiwania ani wymaganej roli (D-01, high). |
| **Częściowe uruchomienie redakcyjne** | **NIE potwierdzone** — publikację **tylko zasymulowano** w B. W rzeczywistości wszystkie 12 poradników ma `needs_review`; na produkcji publicznych poradników jest 0 do czasu uruchomienia gatewaya. Scenariusz „królik” nie ma opublikowanej treści (oba poradniki welfare czekają na specjalistę). |
| Pełny zakres 10 grup | NIE — publiczne (w symulacji) tylko 5 grup: psy, koty, ptaki, akwarystyka, gady. |

## Tabela kontroli

| # | Kontrola | Wynik | Dowód |
|---|---|---|---|
| 1a | Opiekun królika (B) | **FAIL wobec V3 §20 / uczciwie wobec użytkownika** | `/zwierzeta/kroliki` → 404 (noindex); `/poradniki/przygotowanie-przestrzeni-dla-krolika-w-domu` i `/poradniki/jak-znalezc-opiekuna-dla-krolika-na-czas-wyjazdu` → 404; `/poradniki?q=królik` → 200 „Brak poradników pasujących do „królik”” (bez informacji, że dział jest w przygotowaniu); `/zwierzeta` mówi „Pozostałe działy przygotowujemy…”. Brak ścieżki do treści o królikach; brak fałszywej treści. W katalogu brak filtra „króliki” (PetType = psy/koty). |
| 1b | Opiekun ptaka (B) | **PARTIAL** | `/zwierzeta/ptaki` 200, 1 poradnik (`ptaki-opieka-na-czas-wyjazdu`) przypisany do grupy, nie do gatunku; `/poradniki?q=ptak` → 1 wynik, `/poradniki?q=papuga` → 0. Brak treści gatunkowej. |
| 1c | Usługa dla konkretnego zwierzęcia | **PASS (psy/koty) / FAIL (inne zwierzęta)** | `/uslugi/hotel-dla-zwierzat/warszawa` → 200, noindex, uczciwy stan pusty „Nie mamy jeszcze firm w tej kategorii w Warszawie” + alternatywy (lista dla opiekuna, 2 poradniki wyjazdowe, poleć/zgłoś). `/uslugi/groomer/warszawa?zwierze=koty` → filtr aktywny, 1 firma („Dane niepotwierdzone”). `/uslugi/groomer?zwierze=koty` (poziom kategorii) — parametr ignorowany (canonical na `/uslugi/groomer`). `?zwierze=kroliki` — ignorowany po cichu. |
| 1d | Wyjazd → lista dla opiekuna | **PASS** | Link do `/narzedzia/lista-dla-opiekuna` z `/`, `/narzedzia`, `/zwierzeta/psy`, `/zwierzeta/ptaki`, 3 poradników wyjazdowych, `/uslugi/hotel-dla-zwierzat`, `/poradniki?potrzeba=wyjazdy`. Wypełniono 2 zwierzęta (Burek/pies, Mruczek/kot), reload → „Przywrócono zapisaną listę”, wartości zachowane (localStorage `zoo24.narzedzia.lista-dla-opiekuna.v1`). Fokus po „Dodaj kolejne zwierzę” przechodzi do nowego pola. Print CSS obecny (`@media print` w `components/tools/caretaker-sheet.tsx`, blok `hidden print:block`). Druk nie testowany. Dane testowe usunięte z localStorage. Zrzut: `qa-screens/v3-caretaker-list-restored-1280.jpg`. |
| 1e | Kalkulator akwarium | **PASS** | 100×40×50 cm wewn. → „200,0 L ≈ 52,8 US gal”. Zewn. + szkło 8 mm → „Wnętrze: 98,4 × 38,4 × 49,2 cm”, 185,9 L (sprawdzone ręcznie). Błędy: `abc` → „Wpisz liczbę, np. 60 albo 60,5.”, `-5` → „Wartość musi być większa od zera.”, szkło 300 → „Wartość jest zbyt duża (maksymalnie 50 mm).”; `aria-invalid=true` + `aria-describedby`, w panelu wyniku `aria-live` „Popraw zaznaczone pola, aby zobaczyć wynik.” Zrzut: `qa-screens/v3-calculator-errors-1280.jpg`. |
| 1f | Źródła, autorstwo, status przeglądu (B) | **PASS z uwagą (D-04)** | `/poradniki/ptaki-opieka-na-czas-wyjazdu`: „Autor Redakcja ZOO24 (szkic przygotowany z pomocą AI)”, lista 3 źródeł z datą dostępu, sekcja „Status przeglądu: Kto sprawdził redakcja ZOO24 z udziałem AI (przegląd z udziałem AI, nie przegląd człowieka) · Klasa treści informacje praktyczne · Wymagany przegląd redaktor · Następny przegląd 22 maja 2027”. W nagłówku jednak „Sprawdzone przez: redakcję ZOO24 z udziałem AI”. |
| 1g | Moderator rozumie, czemu materiał czeka | **FAIL (D-01)** | A: `/admin/content` nie zawiera 12 poradników V3 (D-02). C: `/admin/content` pokazuje poradniki welfare z kolumną „Blokady: **OK**” i aktywnym „Zatwierdź”; brak wymaganej roli i `waitingReason` (np. „potrzebna osoba z wiedzą o królikach” jest w danych, nie w UI). Klik „Zatwierdź” na `przygotowanie-przestrzeni-dla-krolika-w-domu` → zablokowane: „Nie wykonano: operacja zablokowana” + surowy JSON `POLICY_BLOCKED: ROLE_SPECIES_SPECIALIST_REQUIRED`; wiersz nadal „OK”. Podgląd `/admin/content/<slug>` pokazuje „Wymagany przegląd: osoba z wiedzą o danym gatunku — jeszcze niepotwierdzony przeglądem człowieka”. Zrzut: `qa-screens/v3-admin-content-welfare-blocked-1280.jpg`. |
| 2 | 200 + 1×h1 + title + description + canonical (B) | **PASS z 1 uwagą (D-08)** | Wszystkie z listy → 200, title, description, canonical `https://zoo24.pl/...`: `/`, `/zwierzeta`, `/zwierzeta/{psy,koty,ptaki,akwarystyka,gady}`, `/poradniki`, `/poradniki?zwierze=psy` (noindex,follow; canonical `/poradniki`), 6 poradników, `/narzedzia`, oba narzędzia, `/uslugi`, `/uslugi/groomer`, `/polec-miejsce` (noindex), `/dodaj-firme?profil=kudlate-historie-r02` (tryb przejęcia, noindex), `/firma/kudlate-historie-r02` (indeksowalna), `/firma/animalroom-r01` (noindex — niepotwierdzona). `/narzedzia/lista-dla-opiekuna` ma **2 elementy h1** w DOM (drugi w bloku tylko do druku, `hidden`, `aria-hidden`). 404 na B: `/zwierzeta/{kroliki,gryzonie,plazy}`, poradniki welfare. Opisy grup krótkie (68–91 znaków). |
| 3 | Brak linków do pustych stron (B) | **PASS z uwagą (D-06)** | Crawl z `/` do głębokości 2, host zoo24.pl: 81 URL, 0 odpowiedzi ≠200, brak linków do grup niepublicznych, brak linków do kombinacji miasto×usługa z 0 firm (karty „0 firm” w hotelach nie są linkami). Strona główna, `/uslugi`, `/uslugi/groomer` i poradnik psa linkują jednak do `/uslugi/hotel-dla-zwierzat` — kategorii z 0 firm we wszystkich 10 miastach (200, noindex, uczciwy komunikat). |
| 4 | Sitemap / robots (B) | **PASS** | `/sitemap.xml` (Host zoo24.pl): 26 URL — 6 opublikowanych poradników, grupy psy/koty/ptaki/akwarystyka/gady + gatunki pies-domowy/kot-domowy, `/narzedzia` + 2 narzędzia, 3 firmy zweryfikowane; 0 trafień „demo/krolik/gryzon/blog/”. robots.txt zoo24.pl: `Allow: /`, `Disallow: /admin`, `/api/`, Sitemap. Host `zoo24-x.vercel.app`: nagłówek `X-Robots-Tag: noindex, nofollow` i `Disallow: /`. Na zoo24.pl brak X-Robots-Tag. |
| 5 | Responsywność (B, wbudowana przeglądarka) | **PASS** | 320/360/390/768/1280/1440 × (`/`, poradnik, kalkulator, `/zwierzeta/psy`, `/uslugi/groomer/warszawa`, przy 320/390 także lista): `scrollWidth ≤ innerWidth` wszędzie (768/1280/1440: scrollWidth = clientWidth, pasek przewijania 15 px). Menu mobilne 390: otwiera się, `aria-expanded` true/false, Escape zamyka i zwraca fokus. Zrzuty w `docs/qa-screens/` (JPG — narzędzie zapisuje JPEG; desktopowe przeskalowane do 800×500 przez panel). Viewport przywrócony do „desktop”. |
| 6 | Dostępność — podstawy | **PARTIAL (D-05)** | Kolejność Tab: „Przejdź do treści” → logo → 6 linków menu → okruszki → radio → pola. Linki/radio: outline 3 px. **Pola tekstowe kalkulatora: outline `none`**, fokus = tylko zmiana koloru ramki 1 px. Etykiety `<label>` dla wszystkich pól; błędy z `aria-invalid` i `aria-describedby`; formularz „Poleć miejsce”: `role=alert` z podsumowaniem błędów i fokusem. Obrazy: wszystkie mają `alt` (hero opisowy, pozostałe `alt=""`), plakietka „Ilustracja AI” na hero i kartach. Kontrast (heurystyka skryptem, nie audyt): poza logotypem „24” (biały na pomarańczowym 2,86:1 — logo, wyłączone z 1.4.3) brak tekstów <4,5:1 na stronie głównej, poradniku, kalkulatorze, `/zwierzeta/psy`. Pełna zgodność WCAG 2.2 AA — nie badano. |
| 7 | `npx tsc --noEmit -p .` / `npx vitest run` | **PASS** | tsc exit 0; vitest: 31 plików, 348 testów passed (1,88 s). |
| 8 | Formularze (A) | **PASS** | `/polec-miejsce` bez grupy zwierząt → „Popraw 1 pole…: Zaznacz co najmniej jedną grupę zwierząt…”, dane zachowane. Honeypot (`website_hp` wypełnione) → ekran sukcesu z kodem ZG-DV7HTN, **nic nie zapisano** (submissions 0). Poprawne → kod **ZG-55R4C3**, zapis `recommend_place/pending`; `/admin/moderacja` pokazuje „Polecenie miejsca · Oczekuje na moderację · Zwierzęta (wg polecającego): Króliki · polecający nie reprezentuje firmy”; `/status-zgloszenia?kod=ZG-55R4C3` → „Oczekuje na moderację”. `/dodaj-firme?profil=kudlate-historie-r02` (B) → „Rodzaj zgłoszenia: aktualizacja / przejęcie profilu Kudłate Historie”; nieistniejący slug → „Nie znaleziono wskazanego profilu” + formularz nowej firmy. |

**Pozostawione dane testowe:** w A (`.data/state.json`) zgłoszenie QA „QA TEST Salon Testowy”, kod ZG-55R4C3, status pending — do odrzucenia przez moderatora.

## Defekty (priorytet)

**Blocker** — brak.

**High**
- **D-01 Panel treści nie wyjaśnia, dlaczego materiał czeka.** Repro (tryb lokalny, świeże dane): `/admin/content` → wiersz „Przygotowanie przestrzeni dla królika w domu”: „Blokady: OK”, przycisk „Zatwierdź”. Brak klasy ryzyka, wymaganej roli i `review.waitingReason`. Po kliknięciu: surowy JSON `ROLE_SPECIES_SPECIALIST_REQUIRED`, wiersz dalej „OK”. Dodatkowo `approveArticle` nadpisuje opisowy `waitingReason` kodem błędu (`lib/content/editorial.ts:70`). Narusza V3 §20 „moderator rozumie, dlaczego materiał czeka i co trzeba zrobić”. Kolumna „zatw.: claude-ai-editor” przy statusie `needs_review` też myli (to akceptacja AI czekająca na gateway, nie publikacja).
- **D-02 Środowisko A nie ma 12 poradników V3.** `.data/state.json` (zapis 15:28) zawiera tylko 3 artykuły z `content/blog` + 3 DEMO. `FileStore` synchronizuje treści z repo raz na proces (`synced` w `lib/store/file-store.ts`), więc dev uruchomiony przed dodaniem plików ich nie widzi. Skutek: moderator na A nie widzi kolejki V3. Naprawa: restart dev albo synchronizacja przy zmianie plików; udokumentować.

**Medium**
- **D-03 Scenariusze V3 §20 „królik” i „ptak — właściwy gatunek” nie są spełnione treścią.** Króliki: 0 opublikowanych materiałów (oba welfare, czekają na specjalistę). Ptaki: tylko poradnik grupowy, `?q=papuga` → 0. Wyszukiwarka przy „królik” nie mówi, że dział jest w przygotowaniu, i nie proponuje ścieżki (np. lista dla opiekuna, poleć miejsce).
- **D-04 Nagłówek poradnika: „Sprawdzone przez: redakcję ZOO24 z udziałem AI”** (`components/article-view.tsx:97`) sugeruje redakcję ludzką z pomocą AI, a przegląd wykonał wyłącznie `claude-ai-editor` (`byKind: ai`). Sekcja „Status przeglądu” niżej jest poprawna („nie przegląd człowieka”). Ujednolicić z nią nagłówek (CLAUDE.md: „Nie udawaj, że AI reviewer jest człowiekiem”).
- **D-05 Słaby wskaźnik fokusu w polach tekstowych.** Klasa pola zawiera `focus:outline-none … focus-visible:outline-3 focus-visible:outline-accent`, ale obliczony outline = `none` (kalkulator, ten sam komponent prawdopodobnie w liście i formularzach). Fokus widoczny tylko jako zmiana ramki 1 px. Repro: `/narzedzia/kalkulator-akwarium`, Tab do „Długość”, `getComputedStyle(document.activeElement).outlineStyle` → `none`.
- **D-06 Linki do kategorii hoteli bez firm.** `/`, `/uslugi`, `/uslugi/groomer`, `/poradniki/jak-wybrac-opieke-dla-psa-na-czas-wyjazdu` → `/uslugi/hotel-dla-zwierzat`, gdzie 10 × „0 firm — jeszcze nikogo nie dodaliśmy”. Strona jest uczciwa i noindex, ale ze strony głównej prowadzi do pustej oferty (A04/A07).
- **D-07 Katalog obsługuje tylko psy/koty.** `PetType = "psy" | "koty"`; `?zwierze=kroliki` jest po cichu ignorowany (pokazuje wszystkie firmy bez informacji). Formularz „Poleć miejsce” zbiera już 10 grup — model katalogu nie (V3 §12).

**Low**
- **D-08** `/narzedzia/lista-dla-opiekuna`: dwa `<h1>` w HTML (drugi w bloku tylko do druku, ukryty/aria-hidden). Zmienić drugi na element niebędący h1 albo renderować tylko w druku.
- **D-09** Etykiety tematów: „Informacje dla osoby, która zaopiekuje się Twoim kotem” ma temat „Rasy kotów” (`/poradniki?temat=rasy-kotow`); poradnik o wyjeździe z ptakiem ma temat/okruszek „Pielęgnacja”; na `/zwierzeta/psy` poradnik o groomerze (Wybór usługi) w sekcji „Codzienna opieka i warunki”.
- **D-10** Karty poradników: metadane „Psy · , temat: Wybór usługi” — zbędne „ · ,” (strona główna, `/poradniki`, `/zwierzeta/ptaki`).
- **D-11** Niezweryfikowany materiał (welfare, „oczekuje na przegląd”) w podglądzie ma „Następny przegląd 22 maja 2027”.
- **D-12** Strony statyczne (`/narzedzia`, narzędzia, `/polec-miejsce`, stopka w nich) są prerenderowane w buildzie z revalidate 5 min — liczby/linki zależne od opublikowanych treści mogą być do 5 min nieaktualne po publikacji. Nie zaobserwowano błędu, uwaga do procesu publikacji.
- **D-13** Opisy meta grup krótkie (68–91 znaków), np. `/zwierzeta/akwarystyka` 68.

## Czego nie wykonano (NOT RUN)

- Rzeczywista publikacja na zoo24.pl / gateway `cms.publish_approved_version` — tylko symulacja w izolowanym katalogu.
- Podgląd/druk listy dla opiekuna i plik tekstowy (sprawdzono tylko obecność print CSS).
- Pełny audyt WCAG 2.2 AA, czytnik ekranu, `prefers-reduced-motion`, kontrast w stanach hover/disabled.
- Core Web Vitals (lab i field) — brak pomiaru.
- Scenariusz V3 §20 „właściciel widzi aktualny wynik bez logów agentów” (`/admin`, `/admin/wyniki`) — nie oceniany.
- Moderacja na A dla poradników V3 (brak ich w danych A, zob. D-02); zastąpione instancją C.
- Wysyłka formularza `/dodaj-firme` (przejęcie profilu) — sprawdzono tylko tryb formularza.
- Tryb Supabase (testy na file store).

## Zrzuty (`docs/qa-screens/`, JPEG)

Mobile 390: `v3-home-390.jpg`, `v3-guide-390.jpg`, `v3-calculator-390.jpg`, `v3-caretaker-list-390.jpg`, `v3-group-psy-390.jpg`, `v3-menu-open-390.jpg`.
Desktop 1280 (panel przeskalował do 800×500): `v3-home-1280.jpg`, `v3-guide-1280.jpg`, `v3-calculator-1280.jpg`, `v3-caretaker-list-1280.jpg`, `v3-group-psy-1280.jpg`, `v3-calculator-errors-1280.jpg`, `v3-caretaker-list-restored-1280.jpg`, `v3-admin-content-welfare-blocked-1280.jpg` (instancja C).
Wszystkie z B (symulacja publikacji) poza ostatnim.
