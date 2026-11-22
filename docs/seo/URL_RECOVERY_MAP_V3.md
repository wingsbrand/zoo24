# ZOO24 — mapa odzyskiwania historycznych URL (v3, DRAFT)

**Data:** 22.11.2026 | **Właściciel:** `zoo24-seo` | **Status: draft — nic nie jest wdrożone.** Mapa routingu jeszcze się nie zmieniła; żadnego 301/410 nie ustawiono na produkcji.
**Plik danych:** `docs/seo/historical-url-inventory-v3.csv` (22 631 wierszy, wszystkie `status=draft`).
**Reguły:** `docs/seo/redirect-policy.md` (R1–R12, M1–M6). Każdy `redirect_301_candidate` przed wdrożeniem wymaga recenzenta, `approved_at` i targetu z odpowiedzią 200 (R1, R3). Prefiks `planned:` oznacza, że target jeszcze nie istnieje.

## 1. Źródła danych i ich ograniczenia

| Źródło | Co daje | Ograniczenia |
|---|---|---|
| **GA4** (własna usługa właściciela 301981165, eksport Windsor.ai już w repo: `docs/audits/ga4-organic-landing-top100.csv`) | Sesje organiczne wg strony docelowej, 2022-02 – 2025-02, TOP 100 | Tylko 100 URL. To sesje, nie kliknięcia GSC. Ok. 147 tys. sesji z „(not set)” lub bez strony docelowej pominięto. Brak danych sprzed 02.2022 (UA) i po 02.2025. |
| **Internet Archive CDX** (`web.archive.org/cdx`, filtr: status 200 + `text/html`) | 10 557 unikalnych ścieżek, 25 799 zrzutów, daty 2004–2026 | **Zrzut z archiwum nie oznacza ruchu.** Liczba zrzutów zależy od crawlera IA, nie od popularności. Pokrycie jest niepełne: 1 z 100 URL z GA4 nie ma żadnego zrzutu 200. |
| **Archiwalna mapa witryny** `1_pl_0_sitemap.xml` (PrestaShop, zrzut IA z 2022-10-17, lastmod 2022-10-14) | 14 800 URL (14 467 produktów, 328 kategorii) | Tylko jeden stan z 10.2022. **Nie ma w niej bloga.** Późniejsze zrzuty z 2023 są prawie puste. 12 079 URL występuje tylko w niej. |
| Deklaracja właściciela „100k+ wejść organicznych/mies.” | — | **To historyczna deklaracja, niezweryfikowana.** W okresie GA4 **szczyt ruchu organicznego to ~33,7 tys. sesji/mies. (01.2024)**. 100k+ przekraczał tylko ruch łączny ze wszystkich kanałów. Okres sprzed 2022 jest niezweryfikowany. |

Normalizacja: małe litery, bez query stringów i identyfikatorów sesji, bez końcowego `/`, scalone http/https oraz www/bez www. Odrzucono 6 ścieżek: 4 ze śmieciowym HTML w URL i 2 pliki zasobów.

**Odkryte ery serwisu** (wg archiwum): skrypty `.php` (2004–2006), sklep `/pl/static`, `/pl/*.html` (~2013), PrestaShop (2021–2025, główna era GA4), a w **2025–2026 sklep na innej platformie** (`/pl/p/…`, `/pl/c/…`, `/pl/producer/…`: 830 produktów, ostatni zrzut w 2026). Ta ostatnia era jest **poza GA4**, więc jej ruchu nie znamy. `/pl/n/tag/*` zawiera tematy odzieżowe, prawdopodobnie treści szablonu.

## 2. Liczby

**Wg `page_type`:** product 19 160 · category 3 112 (w tym marki i producenci) · blog 222 (179 artykułów `-nNN`, reszta to listingi i paginacja) · promo 64 · static 34 · other 19 · account_cart_search 15 · home 5.

**Wg `proposed_action`:** gone_410 19 275 · not_found_404 3 128 · recreate_200 165 · redirect_301_candidate 60 · keep_200 3.

| page_type | keep_200 | recreate_200 | redirect_301_candidate | not_found_404 | gone_410 |
|---|---|---|---|---|---|
| blog | – | 165 | 31 | 20 | 6 |
| category | – | – | 22 | 3 090 | – |
| product | – | – | – | – | 19 160 |
| home | 1 | – | 3 (aliasy → `/`) | 1 | – |
| static / promo / account / other | 2 (`/kontakt`, `/szukaj`) | – | 4 | 17 | 109 |

Sesje GA4 (TOP 100 = 260 347) wg decyzji: blog recreate_200 **201 121**, kategorie 404 28 766, kategorie → poradnik 14 017, strona główna 10 598, konto/koszyk 410 4 503, `/kontakt` 1 342.
Redirecty to 0,27% mapy (M3 OK). Największe skupienie dla targetów `category` to 4 źródła na jeden poradnik (M2 ≤ 20 OK). Największe skupienie w całej mapie: 8 listingów bloga → `/zwierzeta/koty` (M1: 13% z 60 redirectów, ale < 10 źródeł, więc bez ostrzeżenia). Żaden redirect nie prowadzi na `/` spoza segmentu A (R5/M4 OK).

## 3. TOP 30 priorytetów (wg sesji GA4)

Legenda: **ZDR** = temat zdrowotny, 200 dopiero po recenzji lekarza weterynarii i ze źródłami (do tego czasu 404). Oznaczenie heurystyczne (słowa kluczowe w slugu), do weryfikacji przez człowieka.

| # | URL | sesje | decyzja |
|---|---|---|---|
| 1 | `/blog/kot-brytyjski-n66` | 13 648 | recreate_200 (szkic lokalny: needs_review) |
| 2 | `/blog/cane-corso-n63` | 11 812 | recreate_200 (szkic lokalny: needs_review) |
| 3 | `/blog/maltanczyk-n77` | 11 604 | recreate_200 (szkic lokalny: needs_review) |
| 4 | `/` | 10 598 | keep_200 |
| 5 | `/blog/kot-syberyjski-n67` | 10 399 | recreate_200 |
| 6 | `/blog/nosowka-u-psa-…-n93` | 6 975 | recreate_200 **ZDR** |
| 7 | `/blog/kot-bengalski-n65` | 6 634 | recreate_200 |
| 8 | `/brand/360-pan-miesko` | 6 546 | not_found_404 (marka sklepu, brak odpowiednika) |
| 9 | `/blog/jakie-rasy-psow-sa-najbardziej-towarzyskie-n144` | 5 804 | recreate_200 |
| 10 | `/brand/208-wiejska-zagroda` | 5 633 | not_found_404 |
| 11 | `/blog/zapalenie-stawow-u-psa-n86` | 5 582 | recreate_200 **ZDR** |
| 12 | `/blog/shih-tzu-n62` | 5 515 | recreate_200 |
| 13 | `/blog/buldog-francuski-n64` | 5 327 | recreate_200 |
| 14 | `/blog/babeszjoza-u-psa-…-n91` | 5 282 | recreate_200 **ZDR** |
| 15 | `/blog/borelioza-u-psow-…-n90` | 5 268 | recreate_200 **ZDR** |
| 16 | `/blog/alergia-u-kota-…-n92` | 5 095 | recreate_200 **ZDR** |
| 17 | `/blog/dalej-nie-ide-…-pies-siada-na-spacerze-…-n176` | 4 238 | recreate_200 |
| 18 | `/blog/jaki-preparat-na-kleszcze-dla-psa-wybrac-n88` | 4 226 | recreate_200 **ZDR** |
| 19 | `/blog/border-collie-n61` | 4 165 | recreate_200 |
| 20 | `/blog/cavalier-king-charles-spaniel-n113` | 3 793 | recreate_200 |
| 21 | `/blog/oleje-w-diecie-psa-…-n87` | 3 741 | recreate_200 **ZDR** |
| 22 | `/blog/doberman-n60` | 3 599 | recreate_200 |
| 23 | `/blog/bokser-n75` | 3 154 | recreate_200 |
| 24 | `/blog/4-powody-psich-ucieczek-…-n98` | 3 110 | recreate_200 |
| 25 | `/118-legowiska-dla-psa` | 3 050 | 301 candidate → `planned:/blog/czym-sie-kierowac-wybierajac-legowisko-dla-psa-n51` |
| 26 | `/blog/krolik-miniaturka-…-n184` | 3 002 | recreate_200 |
| 27 | `/blog/lamblia-u-psa-…-n149` | 2 947 | recreate_200 **ZDR** |
| 28 | `/14-karma-sucha-dla-psa` | 2 924 | 301 candidate → `planned:/blog/jak-wybrac-karme-dla-psa-pod-wzgledem-wieku-n16` |
| 29 | `/blog/giardioza-u-kota-…-n161` | 2 898 | recreate_200 **ZDR** |
| 30 | `/blog/basenji-n78` | 2 839 | recreate_200 |

Bez GA4, według dowodów z archiwum (≥5 zrzutów, kandydaci drugiej fali): `feromony-dla-kota-…-n158`, `jak-zostac-wolontariuszem-w-schronisku-…-n159`, `pies-w-lozku-tak-czy-nie-n173`, `strachliwy-kot-…-n175`, `przysmaki-dla-szczeniaka-…-n177`, `jakie-przysmaki-i-gryzaki-dla-psa-wybrac-n181`, `najlepsze-zabawki-dla-chomika-…-n183`, `jak-wzmocnic-odpornosc-psa-i-kota--n165` (ZDR).

W TOP 100 GA4 jest 15 artykułów ZDR (49 888 sesji). Decyzja właściciela: recenzent weterynaryjny (koszt) albo 404.

## 4. Stary blog a 10 grup zwierząt (priorytety nowych poradników)

Artykuły `recreate_200` wg grupy (liczba / sesje GA4 / w tym ZDR):

| grupa | artykuły | sesje GA4 | ZDR | tematy z dawnego bloga |
|---|---|---|---|---|
| psy | 92 | 132 869 | 13 | ~45 ras (cane corso, maltańczyk, shih tzu, buldog francuski, border collie…), zachowanie (spacery, ucieczki, zostawanie samemu, sikanie), szczeniak, żywienie, pasożyty i choroby |
| koty | 50 | 54 272 | 4 | ~30 ras (brytyjski, syberyjski, bengalski, maine coon, ragdoll…), upały, choinka, balkon, adaptacja, żwirek, drapak, kuweta |
| kroliki | 3 | 5 624 | 0 | królik miniaturka, karzełek teddy, angora |
| gryzonie | 2 | 2 342 | 0 | kapibara, zabawki dla chomika |
| ptaki | 1 | 1 146 | 0 | dokarmianie dzikich ptaków zimą |
| ogolne (pies+kot) | 17 | 4 868 | 10 | adopcja, wolontariat, odporność, omega-3, olej z łososia, nowy pies + kot |
| akwarystyka, gady, płazy, małe ssaki, bezkręgowce | 0 | – | – | tylko listingi kategorii bloga (`ryby-c22`, `gady-i-plazy-c20`, `ssaki-c23`) bez artykułów w archiwum |

Wnioski: (1) ruch niosły **rasy psów i kotów** oraz zachowanie, a to tematy niezdrowotne, które najłatwiej odtworzyć; (2) akwarystyka, gady, płazy, małe ssaki i bezkręgowce nie mają w blogu żadnego materiału do odzyskania. W sklepie były to jednak realne kategorie (np. akwarystyka: 1 069 produktów i 30 kategorii w inwentarzu), więc dla tych grup trzeba budować **nowy organic**, bez odzyskiwania. Listingi kategorii bloga są kandydatami 301 do `/zwierzeta/<grupa>`.

## 5. Zachowane reguły

- **Bez masowego 301 na stronę główną.** Na `/` trafiają wyłącznie aliasy strony głównej (`/2-strona-glowna`, `/index.php`, `/sklep-z-artykulami-…-online`), segment A.
- **Produkty → 410** (19 160), bo sklep jest trwale zamknięty. Bez pseudo-sklepu, bez cen i bez schema `Product/offers`.
- **Kategorie → 404** domyślnie. 301 tylko do **konkretnego autorskiego poradnika wyboru** o tej samej potrzebie (legowisko, karma, drapak, żwirek, kuweta, obroża, gryzaki), nigdy do hubu, `/uslugi` ani `/zwierzeta` (R6). Działa dopiero, gdy poradnik zostanie odtworzony i zwraca 200 (R3).
- Marki i producenci sklepu → 404. Leki, odrobaczanie i pchły → 404. Promocje, konto i koszyk → 410.
- Stare URL bloga **zachowują ścieżkę** z nową, autorską treścią. Nic nie kopiujemy z archiwum, bo stara treść nie ma potwierdzonych praw. Duplikaty tematów konsolidujemy 301 do mocniejszego URL (np. `kot-angielski-n130` → `kot-brytyjski-n66`, `kot-majkun-n121` → `maine-coon--n124`). Treści promocyjne marek (Josera, Primacat, Twisto, „top 7 produktów”) → 410.
- `/blog/hotel-dla-psow-…-n139` → `/poradniki/hotel-dla-psa-checklista`: jedyny 301 blogowy do już opublikowanego poradnika (stan lokalny `.data/state.json`, produkcji nie weryfikowano).
- Regulamin i polityka prywatności sklepu → kandydaci 301 do nowych stron. Wymaga to decyzji prawnej, bo to inny operator i zakres.

## 6. Czego wciąż brakuje

1. **Eksport GSC:** brak dostępu, a właściciel historycznie go nie miał. Bez niego nie znamy zapytań ani kliknięć dla URL spoza TOP 100 GA4.
2. **Dane o linkach zwrotnych:** Ahrefs jest w trakcie podłączania. Brak danych, które URL produktów i kategorii mają linki, a to może zmienić 410/404 na 301 do poradnika. W tej sesji Ahrefs nie był użyty.
3. **GA4 poza TOP 100** i ruch z platformy `/pl/` z lat 2025–2026 (poza zakresem eksportu).
4. **Mapa witryny bloga:** archiwalna `1_pl_0_sitemap.xml` z 10.2022 jest jedyną znalezioną i nie zawiera bloga. `/sitemap.xml` w archiwum zwraca 404/302. Brak mapy witryny ery 2023–2024.
5. **Przegląd człowieka:** grupy zwierząt i flagi ZDR są heurystyczne (słowa w slugu). 3 085 produktów i 1 491 kategorii ma `animal_group=null`.
6. Decyzje właściciela: recenzent weterynaryjny dla 27 artykułów ZDR; akceptacja pierwszej partii redirectów (≤50 wierszy, M5).
