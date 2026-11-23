# ZOO24 — kontrola techniczna SEO i mapa historycznych URL (2026-11-23)

**Rola:** zoo24-seo (analiza, tryb design/shadow) | **Wersja mapy:** `HISTORICAL_URL_MAP.csv` v4-2026-11-23 (pochodna `historical-url-inventory-v3.csv`, 22.11.2026)
**Zakres:** tylko odczyt repo i publicznej produkcji. Nie zmieniono kodu, redirectów, robots ani produkcji.
**Narzędzia:** odczyt repo + WebFetch (32 żądania do zoo24.pl). `curl` i powłoka nie były dostępne, więc **kody 3xx i nagłówki nie były widoczne**. WebFetch pokazuje 404 jako błąd, a dla 200 zwraca treść. Wyniki 200 nie wykluczają przekierowania w obrębie tej samej domeny. Wayback CDX API: **zablokowane dla narzędzia** (`unable to fetch from web.archive.org`). Lista adresów z archiwum pochodzi z wcześniejszego zrzutu w v3.

## 0. Źródła historycznych adresów (inwentaryzacja)

| Źródło | Plik w repo | Zawartość | Kompletność / finalność |
|---|---|---|---|
| GA4 (usługa 301981165, eksport Windsor.ai) | `docs/audits/ga4-organic-landing-top100.csv`, `docs/audits/old-url-inventory.csv` | TOP 100 stron docelowych ruchu organicznego, 2022-02..2025-02 (sesje, nie kliknięcia GSC) | Częściowe: tylko 100 URL. Brak okresu przed 02.2022 (UA) i po 02.2025. Dane historyczne, zamknięte |
| Internet Archive CDX (zrzut z 22.11) | `docs/seo/historical-url-inventory-v3.csv` | 10 557 ścieżek HTML 200, lata 2004–2026 | Liczba zrzutów nie oznacza ruchu. Pokrycie niepełne |
| Archiwalna sitemap PrestaShop (IA, 2022-10) | jw. | 14 800 URL (produkty i kategorie), bez bloga | Jeden stan z 10.2022 |
| Łącznie po normalizacji | `historical-url-inventory-v3.csv` | **22 631 ścieżek**: product 19 160, category 3 112, blog 222, promo 64, static 34, other 19, account 15, home 5 | Status draft |
| Kod | `lib/seo/redirect-plan.ts`, `lib/seo/legacy-router.ts`, `app/[...legacy]/route.ts` | Walidator R1–R12/M1–M6 i catch-all | W produkcji `legacyUrls = []` (`lib/demo/seed.ts:199`), więc **każdy nieznany stary URL daje 404 + `X-Robots-Tag: noindex`**. Na żywo nie działa żaden 301 ani 410 |
| Skrypty | `scripts/import-gsc.mjs`, `scripts/import-ga4-landing.mjs` | Importery | Brak eksportu GSC w repo |
| Obecny baseline 28 dni | `data/exports/ga4-28d.json` | 2026-10-23..2026-11-19: 0 sesji organicznych (tag nie działał od 12.2024) | Prawdziwe 0, okres sprzed startu nowego serwisu. **Nie miesza się z kohortą historyczną** |

**Trzy kohorty (bez podwajania):** (1) deklaracja właściciela „100k+ wejść organicznych/mies.” — niezweryfikowana. W GA4 szczyt organic wyniósł ok. 33,7 tys. sesji/mies. (01.2024, za `URL_RECOVERY_MAP_V3.md`). (2) Potwierdzony eksport GA4 TOP 100 z lat 2022–2025 — historyczny, nie jest prognozą. (3) Obecny baseline 28 dni = 0, przed uruchomieniem pomiaru nowego serwisu. Wejścia na odtworzone URL `/blog/*` trzeba raportować osobno od nowych URL (`/poradniki/*`, `/zwierzeta/*`).

## 1. Mapa `HISTORICAL_URL_MAP.csv`: zakres i rozkład

287 wierszy = **278 konkretnych URL** (wszystkie 222 ścieżki bloga, 33 URL spoza bloga z TOP 100 GA4, 23 pozostałe kandydaty i aliasy) + **9 wierszy-wzorców** dla ok. 22 tys. kart produktów i kategorii. Pełna lista pojedynczych adresów jest w v3.

| Decyzja | Wiersze | Uwagi |
|---|---|---|
| zachowaj 200 (już działa) | 23 | 20 artykułów `/blog/*` w sitemap + `/`, `/kontakt`, `/szukaj` (noindex) |
| zachowaj 200 (do odtworzenia pod tym samym URL) | 117 | Teraz 404 (to poprawne, nie soft-404); po publikacji autorskiej treści 200 |
| 301 do równoważnika (cel działa już dziś) | 16 | Pierwsza partia do zatwierdzenia, zob. decyzja 1 |
| 301 do równoważnika (warunkowo) | 18 | Cel jeszcze nie istnieje (`planowany:`) albo wymaga potwierdzenia redaktora (n139) |
| 404 | 44 (w tym 6 wzorców) | Marki, leki, paginacja, kategorie bez odpowiednika |
| 410 | 15 (w tym 3 wzorce) | Promocje marek, konto/koszyk, produkty i skrypty `.php`. Dziś działa 404, co jest akceptowalne. 410 wymaga wpisów w mapie |
| do decyzji | 54 | 27 artykułów ZDR (zdrowie), kategorie karmy, kategorie tematyczne bloga, regulaminy sklepu, wyprawki |

**Pokrycie historycznych sesji GA4 (TOP 100, 2022-02..2025-02, dane historyczne, nie prognoza):** 67 URL bloga = 201 121 sesji. Obecnie 20 z nich zwraca 200 (93 639 sesji, ok. 47%). 15 artykułów ZDR = 49 888 sesji (blokada: recenzja lek. wet.). Pozostałe 32 nieodtworzone tematy bez ZDR = 57 594 sesji. Najwyżej z nich: buldog francuski n64, n144, n176, cavalier n113, bokser n75, n98, królik n184.

**Próba HTTP (2026-11-23, 29 starych/docelowych URL):** 3 × 200 (`/blog/border-collie-n61`, `/kontakt`, `/szukaj`), 26 × 404. Ani jednego 5xx, soft-404 czy przekierowania na stronę główną. Wynik zgadza się z kodem (catch-all, pusta mapa). Mała próba, ale zachowanie jest deterministyczne.

### Odkrycia dotyczące mapy v3 (do korekty przed zatwierdzeniem)

1. **Cele v3 nie istnieją na produkcji:** `/poradniki/hotel-dla-psa-checklista` → 404, `/zwierzeta/gryzonie` → 404, `/zwierzeta/male-ssaki` → 404. Te redirecty i tak zablokowałaby reguła R3. W mapie v4 n139 wskazuje działający `/poradniki/jak-wybrac-opieke-dla-psa-na-czas-wyjazdu` (temat hotelu jest w treści — 19 wystąpień w pliku źródłowym). Pokrycie intencji potwierdza redaktor.
2. **Zmiana intencji w v3:** `/content/36-wyprawka-dla-kota`, `/content/38-wyprawka-dla-psa` i `/blog/*-c19` → `/narzedzia/lista-dla-opiekuna`. Lista dla opiekuna służy do przekazania opieki na czas nieobecności, a nie do kompletowania wyprawki. V4 proponuje odtworzony `/blog/wyprawka-dla-psa-...-n40` lub (dla kota) poradnik o przygotowaniu mieszkania po jego publikacji, a do tego czasu 404.
3. Tematyczne kategorie bloga (żywienie, wychowanie, pielęgnacja i zdrowie, życie codzienne) → hub grupy to słaby odpowiednik i ryzyko traktowania jako soft-404. Rekomendacja: 404, dopóki nie ma strony tematycznej.
4. Sezonowe tematy grudniowe (choinka i kot n72, sylwester n30, pies pod choinkę n163) mają sens tylko po szybkim odtworzeniu. To uwaga redakcyjna, nie obietnica ruchu.

## 2. (a) 50 stron bez noindex vs 46 adresów w sitemap

Sitemap produkcji (odczyt 2026-11-23): **46 `<url>`**. Lista jest identyczna z kolumną „W sitemap = tak” w załączniku audytu V4. Żadna strona z noindex nie trafiła do sitemap. Różnica 4 stron bez noindex, których nie ma w sitemap:

| Strona | Przyczyna techniczna | Czy pominięcie jest słuszne | Rekomendacja |
|---|---|---|---|
| `/kontakt` | Brak w `lib/seo/page-registry.ts` (`STATIC_PATHS = ["/o-nas","/dla-firm"]`). Strona ma tylko `alternates.canonical`, robots dziedziczy domyślne index | Neutralne. Strona jest indeksowalna, a historycznie miała 1 342 sesje GA4 | Można dodać do sitemap. Niski priorytet |
| `/zasady-redakcyjne` | jw. | **Raczej niesłuszne.** Strona wiarygodności, własna treść i link z artykułów | Dodać do sitemap **po** korekcie deklaracji o przeglądzie (A01). Strona deklaruje, że „opublikowane teksty przegląda wydawca” — potrzebny dowód |
| `/reklama-i-wspolprace` | jw. | Raczej niesłuszne. Polityka ujawnień, własna treść | Dodać do sitemap |
| `/zglos-blad` | jw. | Słuszne. Strona narzędziowa (formularz, warianty `?firma=`/`?url=` z canonical do `/zglos-blad`) | Pozostawić poza sitemap. Rozważyć `noindex, follow`, bo dziś jest indeksowalna |

Wniosek: to **nie jest udokumentowana decyzja** (brak wpisu w `docs/decisions.md` i w polityce), tylko efekt tego, że cztery strony nie są w rejestrze. Skutek uboczny: te strony nie przechodzą przez `robotsMetaFor()` i przez kontrolę rejestru (np. `/admin/seo`). Zadanie dla builder: dopisać je do rejestru z jawną flagą `indexable` (decyzja per strona jak wyżej) i testem, że sitemap = {rejestr indexable} oraz że noindex ⇔ brak w sitemap.

## 3. (b) robots.txt produkcji — roboty AI (decyzja właściciela, nic nie zmieniono)

Odczyt `https://zoo24.pl/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: https://zoo24.pl/sitemap.xml
```
- **OAI-SearchBot** (wyszukiwanie w ChatGPT): **ma dostęp**, bo nie ma osobnej grupy i obowiązuje `*` z `Allow: /`.
- **GPTBot** (zbieranie danych do trenowania modeli OpenAI): **również ma dostęp**, z tego samego powodu. To osobna decyzja niż OAI-SearchBot. Blokada GPTBot nie wyłącza widoczności w wyszukiwaniu ChatGPT [S11].
- Pozostałe roboty (Googlebot, Bingbot, Google-Extended, ClaudeBot, CCBot) też są dopuszczone regułą `*`.
- **Niezweryfikowane:** reguły zapory/Bot Protection w Vercel dla tych user-agentów. Narzędzie nie pozwala ustawić UA. Trzeba to sprawdzić w panelu Vercel (Firewall) albo przez `curl -A "OAI-SearchBot/1.0" -I https://zoo24.pl/`.
- Host `www` dostaje w kodzie `Disallow: /` (`app/robots.txt/route.ts`), ale według konfiguracji jest przekierowany 308 na apex, więc nie blokuje domeny kanonicznej.
- Zmiana robots dla całego serwisu wymaga wyższego odbioru (SOP F).

## 4. (c) Łańcuch http://www.zoo24.pl → https://zoo24.pl

- Konfiguracja (`docs/STATUS.md`, `docs/GO_LIVE_RUNBOOK.md`): `www` → 308 na `https://zoo24.pl/`.
- Audyt V4 (23.11) zmierzył dla `http://www.zoo24.pl` **2 skoki**: http→https na `www`, potem `www`→apex. Każdy skok to 308.
- **Moja weryfikacja: inconclusive.** WebFetch wymusza HTTPS i nie pokazuje nagłówków. `https://www.zoo24.pl/` zwrócił treść serwisu bez widocznej informacji o przekierowaniu między hostami.
- Ocena: 2 skoki są w granicach tolerancji wyszukiwarek, a stałe 308 przekazują sygnały. Na Vercel pierwszy skok (podniesienie do HTTPS) jest zwykle wykonywany przed regułą domeny. Ewentualne skrócenie do jednego skoku sprawdzić w panelu, jako niski priorytet. Test: `curl -sIL http://www.zoo24.pl/ | grep -iE "^(HTTP|location)"`.

## 5. (d) lastmod w sitemap

- 37/46 wpisów ma `lastmod`, a 9 go nie ma: `/`, `/uslugi`, `/poradniki`, `/o-nas`, `/dla-firm`, `/narzedzia`, oba narzędzia i `/uslugi/groomer`. Brak jest zgodny z regułą S3 („brak = pominięte”, bez daty generacji).
- Wszystkie podane daty mieszczą się w **2026-11-22** (12:00–20:04 UTC), czyli w dniu importu i publikacji w CMS. Daty nie są ustawiane na moment żądania (brak „odmładzania” przy każdym odczycie).
- Artykuły: `lastmod = updatedAt` (22.11). Audyt stwierdził `article:published_time = 23.11` > `modified = 22.11` dla 26/26. Sitemap dziedziczy więc tę samą błędną semantykę: data importu jest nazwana modyfikacją, a publikacja leży po niej (A09). Po rozdzieleniu pól (first_published / imported / content_updated / reviewed) `lastmod` powinien pokazywać tylko merytoryczną aktualizację.
- Huby `/zwierzeta/*`: lastmod = najnowszy artykuł działu (akceptowalne). `/poradniki` nie ma lastmod, choć działa tak samo jak hub — drobna niespójność.
- Profile firm: `lastmod = checkedAt` (godzina 12:00:00 wygląda na datę bez czasu). To data weryfikacji danych, nie zmiany treści — akceptowalne, jeśli przy weryfikacji zmienia się widoczna data na stronie.

## 6. Zadania przekazywane (bez wykonania w tej sesji)

| # | Właściciel | Zadanie | Dowód odbioru |
|---|---|---|---|
| T1 | builder | Dopisać `/kontakt`, `/zasady-redakcyjne`, `/reklama-i-wspolprace`, `/zglos-blad` do rejestru z jawną decyzją indeksacji, plus test zgodności sitemap/noindex | Test jednostkowy i odczyt `sitemap.xml` |
| T2 | builder + content | Rozdzielić daty artykułów (A09) i zasilać `lastmod` wyłącznie z `content_updated` | OG/JSON-LD/sitemap spójne; modified ≥ published |
| T3 | seo | Po decyzji 1: przygotować wpisy `legacyUrls` (approved, reviewer, approved_at) dla 16 wierszy i zwalidować `validateRedirectMap` (oczekiwane: 0 błędów, brak alarmów BLOCK) | Wynik walidatora + `curl -I` dla 16 URL po wdrożeniu |
| T4 | content | Kolejka odtworzeń bez ZDR wg sesji GA4: n64, n144, n176, n113, n75, n98, n184 oraz n51 (cel kategorii legowisk) | Status w CMS; po publikacji 200 + sitemap |
| T5 | analytics | Zebrać z logów Vercel zagregowane ścieżki 404 (sama ścieżka i liczba, bez IP i UA) z 28 dni: które stare URL nadal są odwiedzane | CSV ścieżka → liczba, z okresem i kompletnością |

## 7. Decyzje właściciela (maks. 5)

1. **Zatwierdzenie pierwszej partii 16 przekierowań 301** z działającymi celami: 3 aliasy strony głównej (`/index.php`, `/2-strona-glowna`, `/sklep-z-artykulami-…`) → `/`; indeks bloga i aliasy (`/blog`, `/blog/default-c1`, `/blog/home-c1`) → `/poradniki`; 7 kategorii bloga o grupach → `/zwierzeta/{psy|koty|ptaki|akwarystyka|gady}`; 3 aliasy ras (`kot-angielski-n130`, `130_kot-angielski.html` → `kot-brytyjski-n66`; `kot-majkun-n121` → `maine-coon--n124`). **Rekomendacja: zatwierdzić.** Partia jest mała (≤ 50, M5), bez produktów, bez redirectu na homepage spoza aliasów i odwracalna.
2. **Artykuły zdrowotne (27 URL, w tym 15 z TOP 100 = 49 888 historycznych sesji):** płatny recenzent — lekarz weterynarii — albo pozostawienie 404. **Rekomendacja:** pilotaż recenzji 3–5 najważniejszych (n93 nosówka, n86 stawy, n91 babeszjoza, n90 borelioza, n92 alergia kota) po wycenie. Reszta zostaje 404. Bez recenzji nie publikować.
3. **GPTBot (trening OpenAI): tak/nie.** OAI-SearchBot (wyszukiwanie w ChatGPT) zostaje dopuszczony — rekomendowane, i dziś tak jest. **Rekomendacja:** pozostawić stan obecny (dopuszczony), chyba że licencje tekstów lub zdjęć (`docs/social/asset-register.json`, `docs/audits/asset-rights-status.md`) zabraniają użycia do trenowania AI — wtedy dodać `User-agent: GPTBot / Disallow: /` (zmiana globalna, wyższy odbiór).
4. **Regulamin i polityka prywatności dawnego sklepu** (`/content/3-regulamin`, `/content/5-polityka-prywatnosci`): **rekomendacja 404** zamiast 301 na dokumenty portalu (inny operator i zakres; przekierowanie mogłoby sugerować ciągłość umowy). Do potwierdzenia przez compliance.
5. **Dostęp do danych:** (a) właściwość domenowa GSC dla zoo24.pl (od weryfikacji zbiera dane naprzód, wstecz nie odtworzy historii), (b) pełny eksport GA4 stron docelowych 2022–2025 poza TOP 100 (Windsor.ai), (c) eksport URL i redirectów z bazy PrestaShop oraz platformy `/pl/` (sama lista adresów, bez danych klientów), (d) dane o linkach zwrotnych (Ahrefs). **Rekomendacja: (a) i (b) od razu** — bez nich kolejność odtworzeń poza TOP 100 opiera się tylko na archiwum, które nie mierzy ruchu.

*Nie podano prognoz ruchu ani pozycji. Wszystkie liczby sesji to historyczny eksport GA4 2022-02..2025-02 ze wskazanym źródłem.*
