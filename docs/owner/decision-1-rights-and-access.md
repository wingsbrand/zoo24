# Decyzja 1 — prawa i dostępy: instrukcja dla właściciela

> **Stan po odpowiedzi właściciela (2026-11-22):** domena — TAK (WINGS RETAIL, aftermarket.pl); GSC — brak, do założenia (Krok 1 → wariant „nowa właściwość” w `docs/audits/asset-rights-status.md`); GA4 — odczytane przez Windsor.ai (`docs/audits/top100-ga4-report.md`); FB/IG — w Windsor.ai podłączone jest tylko konto reklamowe, statystyki organiczne wymagają podłączenia konektorów Facebook Organic i Instagram; logo, treści — od nowa. Aktualny stan: `docs/audits/asset-rights-status.md`.

**Cel:** odblokować prawdziwy audyt starych URL (TOP 100) i bieżący 28-dniowy baseline, bez przekazywania haseł i tokenów.
**Czas:** ok. 45–90 min jednorazowo. **Kolejność:** najpierw GSC, bo dane wypadają z okna retencji (ok. 16 mies.) co miesiąc.

> **Nigdy nie wysyłaj** w czacie, mailu ani do repo: haseł, kodów 2FA, tokenów, kluczy API, cookies, plików `.env`, eksportów z danymi klientów (zamówienia, maile, adresy, newsletter), treści DM ani komentarzy.
> Nazwy menu w panelach Google/Meta zmieniają się — jeśli coś wygląda inaczej, szukaj odpowiednika („Ustawienia”, „Użytkownicy”, „Eksportuj”).

## Krok 1 — Google Search Console (PILNE, ok. 20 min)

**A. Sprawdź, czy masz dostęp.** Wejdź na search.google.com/search-console i poszukaj właściwości `zoo24.pl` (najlepiej typu „Domena”). Jeśli jej nie ma: ktoś inny jest właścicielem weryfikacji (dawny operator, agencja, informatyk) — zapisz kto, to jest bloker praw do domeny.

**B. Wyeksportuj dane (bez nadawania komukolwiek dostępu):**
1. Skuteczność → Wyniki wyszukiwania → zakres dat **„Ostatnie 16 miesięcy”** (lub najdłuższy dostępny).
2. Zakładka **Strony** → Eksportuj → CSV (Google zapisuje ZIP z kilkoma plikami CSV — wrzuć cały ZIP lub rozpakowane pliki).
3. Powtórz dla 2–3 okresów, jeśli to możliwe (np. 12 mies., ostatnie 3 mies.) — pozwoli to zobaczyć trend.
4. **Linki** → Eksportuj „Najczęściej linkowane strony” (linki zewnętrzne) → CSV.
5. Indeksowanie → Strony → zrzut ekranu podsumowania; Bezpieczeństwo i ręczne działania → zrzut ekranu (nawet gdy „brak problemów”).

**Nie eksportuj zakładki „Zapytania” do repo.** Zapytania mogą zawierać nazwiska lub inne dane osobowe wpisywane w wyszukiwarkę; do inwentarza URL wystarczą strony i linki. Zapytania przeanalizujemy później, w agregatach, jeśli będą potrzebne.

**C. Gdzie wrzucić pliki:** do folderu `imports/gsc/` w projekcie (folder jest w `.gitignore` — nie trafi do Gita). Następnie uruchom:

```powershell
npm run import:gsc
```

Importer zbuduje `docs/audits/old-url-inventory.csv` i raport TOP 100 (`docs/audits/top100-report.md`). **Niczego nie przekierowuje** — każdy wiersz startuje jako `draft` i czeka na ręczny przegląd.

**D. (Opcjonalnie, później)** dostęp ciągły tylko do odczytu: Ustawienia → Użytkownicy i uprawnienia → Dodaj użytkownika → uprawnienie **Ograniczone**, dla konta osoby, która będzie robić raporty. Nie nadawaj roli „Właściciel”.

## Krok 2 — Google Analytics 4 (ok. 10 min)

1. analytics.google.com → sprawdź, czy istnieje usługa dla zoo24.pl i kto jest administratorem.
2. Eksport: Raporty → Pozyskiwanie → Pozyskiwanie ruchu; oraz Zaangażowanie → Strony docelowe (wymiar: strona docelowa + kanał), zakres jak najdłuższy → Udostępnij/Eksportuj → CSV → `imports/ga4/`.
3. Jeśli istnieją **stare eksporty Universal Analytics** (PDF/CSV/arkusze z lat szczytu) — to jedyne możliwe potwierdzenie historycznych 100k+. Wrzuć do `imports/ga4/archiwum/`.
4. Dostęp ciągły (opcjonalnie): Administracja → Zarządzanie dostępem → rola **Wyświetlający**.

## Krok 3 — Facebook i Instagram (ok. 15 min)

1. business.facebook.com → Ustawienia firmy → **Konta → Strony** oraz **Konta Instagram**: czy Strona ZOO24 i konto IG są w **Twoim** portfolio firmowym?
2. **Osoby** z dostępem do Strony i IG: zrób zrzut ekranu listy ról (zamaż nazwiska osób prywatnych, jeśli chcesz — potrzebujemy wiedzieć, czy są tam osoby spoza Twojej firmy lub dawny operator).
3. Instagram → Ustawienia → typ konta: **Firmowe/Twórcy (Professional)** czy osobiste? Czy jest połączone ze Stroną FB?
4. Meta Business Suite → Statystyki (Insights): eksport obserwujących, zasięgu i kliknięć dla FB i IG za najdłuższy dostępny okres → CSV → `imports/meta/`. **Bez** eksportu wiadomości i komentarzy.
5. Jeśli w rolach są osoby spoza firmy lub dawny operator: **nie usuwaj ich pochopnie** — najpierw ustal, czy masz do tego prawo (patrz Krok 4); zabezpiecz drugie konto administratora w swojej firmie (konto awaryjne).

## Krok 4 — dowody praw (do prawnika; do repo trafia tylko status)

| Aktywo | Jaki dowód | Status do wpisania |
|---|---|---|
| Domena zoo24.pl | panel rejestratora/umowa — abonent to Ty lub Twoja spółka; dostęp do DNS | tak / nie / nie wiem |
| Nazwa i logo ZOO24 | wyciąg z UPRP/EUIPO lub umowa nabycia/licencji od dawnego podmiotu | tak / nie / nie wiem |
| Stare teksty poradników i opisy | kto je napisał, czy przeniesiono prawa autorskie | tak / nie / nie wiem |
| Zdjęcia produktów | zwykle należały do producentów/hurtowni — domyślnie **brak praw** | — |
| Strona FB i konto IG | portfolio firmowe w Twoim władaniu (Krok 3) | tak / nie / nie wiem |
| Dawny podmiot sklepu | kto prowadził sklep do 02.2025, czy istnieje umowa przejęcia | nazwa / brak |

Wpisz statusy w odpowiedzi w czacie albo w pliku `imports/rights-status.md` (bez skanów dokumentów — te zostają u Ciebie i u prawnika).

## Co się stanie po dostarczeniu
1. Import GSC → inwentarz URL z kliknięciami i linkami → TOP 100 wg kliknięć + TOP 100 wg linków (deduplikacja).
2. `zoo24-seo` klasyfikuje segmenty A–E i proponuje 200/301/404/410 — **każda para do Twojej lub redaktora akceptacji**; nic nie trafia na zoo24.pl bez osobnej zgody.
3. Dashboard pokaże realne wartości ze źródłem i datą zamiast N/A tam, gdzie dostarczono eksport (status `export_manual`).
4. `zoo24-compliance` aktualizuje GO/NO-GO dla relaunchu social na podstawie statusów praw.
