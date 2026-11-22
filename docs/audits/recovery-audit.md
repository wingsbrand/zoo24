# ZOO24 — audyt odzyskiwania SEO (F0)

**Zadania:** RCV-01, RCV-02, RCV-05, SEO-REC-01, SEO-REC-03 | **Data:** 22.11.2026 | **Właściciel:** `zoo24-seo` | **Status:** szablon audytu, bez danych.
**Podstawa:** `CLAUDE.md`, `docs/SEO_SOCIAL_RECOVERY.md` §1–3, §7–8, `docs/MASTER_PLAN.md` §1, §4, §6, `docs/seo-url-mapping.template.csv`.
**Powiązane:** `docs/audits/old-url-inventory.csv` (tylko nagłówek), `docs/seo/redirect-policy.md` (reguły dla kodu).

## 0. Stan faktyczny: co sprawdzono, a co jest założeniem

| Pozycja | Stan | Rodzaj |
|---|---|---|
| Eksport GSC (zapytania/strony/linki) | brak w repo | sprawdzono w repo |
| Eksport GA4 / starsza analityka | brak w repo | sprawdzono w repo |
| Sitemapy, backup sklepu, logi serwera | brak w repo | sprawdzono w repo |
| Crawl własnej domeny | nie wykonano (brak zgody i sensu przy 403) | nie testowano |
| Backlinki (GSC / narzędzie licencjonowane) | brak w repo | sprawdzono w repo |
| Strona główna zoo24.pl | `403 Forbidden` w publicznym odczycie narzędzia badawczego (MASTER_PLAN §1) | zgłoszone wcześniej, **nie powtarzane w tym audycie** |
| Stan indeksacji, ruch dziś, profil linków | nieznane | brak danych |
| Ponad 100 tys. wejść organicznych/mies. | deklaracja właściciela | niezweryfikowane |

W tym audycie nie wykonano żadnych testów HTTP, crawlów ani zapytań do API. Wszystkie liczby poniżej to `N/A`, chyba że wyraźnie opisano inaczej.

## 1. Trzy baseline'y — oddzielne, nie wolno ich mieszać

| Baseline | Wartość | Źródło | Uwagi |
|---|---|---|---|
| **Historyczny benchmark** | „ponad 100 000 wejść organicznych/mies.” w najlepszym okresie | **deklaracja właściciela**, brak raportu | Nie jest bieżącym baseline'em ani celem. Nie wiadomo, czy to sesje GA czy kliknięcia GSC, ani z jakiego okresu. Do potwierdzenia eksportem GSC (16 mies.) lub archiwalnym raportem GA. Nie używać do prognoz finansowych. |
| **Bieżący (28 pełnych dni)** | `N/A` | brak dostępu do GSC/GA4 | Wyznaczyć po podłączeniu read-only. Osobno: `clicks` (GSC) i `sessions` (GA4). |
| **Efekt odbudowy** | `N/A` | brak bieżącego baseline'u i wdrożenia | Liczyć jako zmianę względem bieżącego baseline'u, z rozbiciem: odtworzone stare URL / nowe poradniki / katalog lokalny / social; YoY tylko przy dostępnych danych. |

**Uwaga:** GSC przechowuje ok. 16 miesięcy. Oferta sklepu zatrzymana wg Ceneo 17.02.2025 (MASTER_PLAN §1, S2), więc najlepszy okres sklepu może już **nie być widoczny w GSC**. Wtedy historyczny benchmark potwierdza się tylko z archiwalnych raportów GA/UA albo pozostaje deklaracją.

## 2. Segmenty A–E i reguły decyzji

Kolumna `segment` w `old-url-inventory.csv` przyjmuje: `A/brand`, `B/editorial`, `C/product-intent`, `D/service-adjacent`, `E/expired`.

| Segment | Co obejmuje | Domyślna decyzja | 301/308 dozwolone, gdy | 404 / 410 | Zakazane |
|---|---|---|---|---|---|
| `A/brand` | strona główna, o nas, kontakt, regulaminy dawnego sklepu | `200` na nowej treści marki (komunikat o nowej formule) | dawna ścieżka np. `/o-nas.html` → nowe `/o-nas` (ta sama funkcja) | stare regulaminy sklepu, dane zamówień: 410 po decyzji prawnej | sugerowanie, że sklep/zamówienia/gwarancje działają |
| `B/editorial` | dawne poradniki, FAQ, artykuły blogowe | `200` pod **tym samym URL** po odświeżeniu, jeśli prawa do treści potwierdzone | zmiana ścieżki, a nowy artykuł pokrywa ten sam temat i pytania | brak praw + brak nowej treści na ten temat: 404; temat trwale porzucony: 410 | kopiowanie treści bez praw; przekierowanie na `/poradniki` |
| `C/product-intent` | karty produktów, marki, kategorie produktowe z ruchem zakupowym | `404/410`, **chyba że** powstanie autorski poradnik/porównanie/checklista zakupowa dla tej samej potrzeby | target odpowiada tej samej potrzebie (np. „jak wybrać X” dla karty X) i nie zbiera dziesiątek kart na jeden adres bez uzasadnienia | karta bez odpowiednika: 404, wycofany produkt/marka trwale: 410 | 301 na `/`, `/poradniki`, `/uslugi/*`, `/firma/*`; „pseudo-sklep”, ceny, dostępność, „Kup u nas” |
| `D/service-adjacent` | pielęgnacja, opieka, przygotowanie zwierzęcia — tematy bliskie usługom | `200` po odświeżeniu lub 301 do nowego poradnika usługowego | nowy poradnik odpowiada tej samej intencji informacyjnej | brak odpowiednika: 404 | zmiana intencji informacyjnej na listing katalogu (np. poradnik → `/uslugi/groomer/warszawa`) |
| `E/expired` | promocje, konkursy, koszyk, konto, parametry filtrów, zamówienia | `410` (trwale usunięte) lub `404` | nigdy | domyślnie 410 dla treści celowo usuniętych, 404 gdy niepewne | redirect na homepage, soft 404 (status 200 z treścią „nie ma”) |

**Wybór 301 vs 308:** oba trwałe; 301 domyślnie dla GET. 308 tylko gdy technicznie trzeba zachować metodę (praktycznie nie dotyczy starych stron sklepu).

## 3. Dwa rozłączne lejki intencji

| | Dawne intencje zakupowe (SEO recovery) | Przyszłe intencje lokalne (nowe SEO katalogowe) |
|---|---|---|
| Źródło zapytań | historyczne GSC dawnego sklepu (marki, karmy, akcesoria) | nowe badanie fraz: usługa + miasto, poradniki o usługach |
| Docelowa treść | autorskie poradniki, porównania, checklisty zakupowe, niekomercyjne FAQ | `/uslugi/{kategoria}/{miasto}`, `/firma/*`, `/poradniki/*` o usługach |
| Monetyzacja | jawnie oznaczona afiliacja (po weryfikacji programów), ewentualnie display przy realnej skali | profile premium nieweterynaryjne po walidacji |
| Warunek indeksacji | oryginalna wartość, prawa, review | wystarczająca liczba **prawdziwych** firm + autorski kontekst; puste kombinacje `noindex` |
| Zakaz | pseudo-sklep, tysiące kart produktowych, fikcyjne ceny/testy | doorways miasto×usługa bez firm, masowe teksty AI |

**Reguła twarda:** żaden URL z segmentu `C` nie prowadzi (301 ani CTA jako substytut) do katalogu usług. Linki wewnętrzne z poradnika produktowego do katalogu są dopuszczalne tylko, gdy merytorycznie pomagają (np. poradnik o szczotkach → wzmianka o groomerze).

Raportowanie: KPI recovery i KPI katalogu zawsze w osobnych wierszach raportu tygodniowego.

## 4. Procedura TOP 100 (kliknięcia) i TOP 100 (linki) z deduplikacją

**Wejście:** eksporty z §8. Bez nich procedura nie startuje; inwentarz pozostaje pusty.

1. **Normalizacja URL** (wszystkie źródła): lowercase hosta, usunięcie `#fragment`, usunięcie parametrów śledzących (`utm_*`, `gclid`, `fbclid`), unifikacja `http/https` i `www/bez www` do jednej postaci, zachowanie ścieżki i istotnych parametrów (np. ID produktu) bez zmian wielkości liter w ścieżce. Zapisać mapowanie oryginał → znormalizowany.
2. **TOP wg kliknięć:** z eksportu GSC „Strony” za maksymalny dostępny zakres (16 mies.) zsumować `clicks` per znormalizowany URL; sortować malejąco, remis → `impressions` malejąco. Rangi 1..N → `click_rank`.
3. **TOP wg linków:** z eksportu GSC „Linki” (Top linked pages + linking sites) i ewentualnie narzędzia licencjonowanego: per URL liczba **unikalnych domen odsyłających** (nie linków), po odrzuceniu domen ocenionych ręcznie jako spam. Sortować malejąco, remis → łączna liczba linków. Rangi → `link_priority_rank`. W `backlink_priority` wpisać wartość źródłową (liczba domen), nie ocenę.
4. **Deduplikacja:** suma zbiorów TOP 100 (kliknięcia) ∪ TOP 100 (linki) po znormalizowanym URL; jeden wiersz na URL z obiema rangami (puste, jeśli URL nie jest w danym rankingu). Wynik: 100–200 unikalnych URL do **ręcznej** kontroli = kolejka P0.
5. **Kolumny pochodzenia:** `data_source` (np. `gsc_pages_export`, `gsc_links_export`, `ahrefs_export` — tylko faktycznie użyte), `exported_at` (ISO 8601 daty eksportu).
6. **Status HTTP:** `current_http_status` wypełnia się wyłącznie z rzeczywistego sprawdzenia (po zgodzie, z ograniczeniem częstotliwości); inaczej `N/A`.
7. **Klasyfikacja:** segment A–E, `search_intent` z top zapytań dla danego URL (eksport GSC Strony×Zapytania), `content_rights_verified` z decyzji `zoo24-compliance` (`yes/no/unknown`).
8. **Decyzja:** `proposed_action` ∈ `keep_200 | edit_200 | redirect_301 | redirect_308 | gone_410 | not_found_404`; `status` startuje jako `draft`; `reviewer` i `approved_at` uzupełnia człowiek. Reguły walidacji w `docs/seo/redirect-policy.md`.

**Kolejka 101–500 (P1):** te same kroki dla rang 101–500 w obu rankingach (po deduplikacji, bez URL z P0). Przegląd półautomatyczny: planner proponuje segment i akcję, człowiek zatwierdza partiami po maks. 50 wierszy. URL spoza TOP 500 bez linków zewnętrznych → domyślnie 404 (bez ręcznego przeglądu), chyba że należą do segmentu `B` z potwierdzonymi prawami.

## 5. Recovery queue — TOP 20

**Stan: PUSTA.** Brak eksportów GSC, więc nie istnieje lista historycznie wartościowych tematów. Nie wypełniać z domysłów.

| # | source-query | old URL | target URL | intent | real added value | source | prawa | review |
|---|---|---|---|---|---|---|---|---|
| 1–20 | N/A | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

### Testowalne hipotezy (HIPOTEZA — nie fakty, nie rankingi)

- **HIPOTEZA H1:** Większość historycznych kliknięć dawnego sklepu dotyczyła kart produktów/marek (segment `C`), nie treści redakcyjnych. *Test:* udział `clicks` URL sklasyfikowanych jako `C` w sumie kliknięć TOP 500 z eksportu GSC. *Konsekwencja:* jeśli >70%, realny potencjał odzysku przez poradniki jest ograniczony, a większość URL dostanie 404/410.
- **HIPOTEZA H2:** Część dawnych URL ma linki zewnętrzne z serwisów niezwiązanych z zakupem (fora, blogi o zwierzętach), wskazujące na treści redakcyjne/FAQ, które da się legalnie odświeżyć. *Test:* liczba URL z segmentów `B`/`D` w TOP 100 wg unikalnych domen odsyłających. *Konsekwencja:* ≥5 takich URL z prawami → priorytet `keep_200/edit_200`.
- **HIPOTEZA H3:** Zapytania kategoryjne typu „jak wybrać [akcesorium]” (nie nazwy SKU) miały istotny udział wyświetleń i można je obsłużyć jednym autorskim poradnikiem na kategorię. *Test:* grupowanie zapytań GSC na klastry kategoryjne vs zapytania z nazwą produktu/marki; udział `impressions` klastrów kategoryjnych. *Konsekwencja:* jeśli istotny, 3–5 briefów porównawczych do recovery queue.

## 6. Service queue — 6–8 tematów MVP (nowe SEO, nie recovery)

Źródło tematów: MASTER_PLAN §6 (plan treści). Popyt nie zmierzony (brak danych o wolumenach); kolejność to propozycja redakcyjna.

| # | Temat roboczy | Intent / CTA | Wymagana wartość dodana | Ryzyko |
|---|---|---|---|---|
| 1 | Jak wybrać groomera — pytania przed wizytą | poradnik → `/uslugi/groomer` | checklista od praktyka (zweryfikowana tożsamość) | brak |
| 2 | Pierwsza wizyta psa u groomera | poradnik → groomer | kroki przygotowania, bez porad medycznych | granica zdrowia |
| 3 | Hotel dla psa: pytania przed rezerwacją | poradnik → `/uslugi/hotel-dla-zwierzat` | autorska tabela porównawcza | brak |
| 4 | Hotel dla kota czy opieka w domu | porównanie → hotel | neutralne kryteria | brak |
| 5 | Jak przygotować psa do pobytu w hotelu | poradnik → hotel | checklista rzeczy; bez porad behawioralnych | granica behawioryzmu |
| 6 | Strzyżenie, trymowanie, kąpiel — różnice | wyjaśnienie → groomer | opisy własne, bez kopiowania z witryn firm | prawa do opisów |
| 7 | Hotel dla psa na wakacje — kiedy szukać | sezonowy → hotel | kalendarz organizacyjny, bez cen | brak |
| 8 | Petsitter czy hotel — który model opieki | porównanie → hotel | neutralne, z opcjami konkurencyjnymi | brak |

Każdy temat: brief → draft w `content/drafts/` → fact-check → review redaktora → `approved`. Bez publikacji przez agenta. Landingi miasto×usługa indeksowane tylko przy realnej podaży firm.

## 7. Dane potrzebne (read-only, bez haseł i PII)

| # | Źródło | Dostęp | Właściciel zadania | Blokuje |
|---|---|---|---|---|
| 1 | GSC property zoo24.pl (domenowa lub URL-prefix) | użytkownik z uprawnieniem **Ograniczony/Pełny (odczyt)** lub eksport CSV od właściciela | właściciel → `zoo24-seo` | baseline bieżący, TOP 100, recovery queue |
| 2 | GA4 / archiwum Universal Analytics (jeśli zachowane) | rola Viewer lub eksport agregatów | właściciel → `zoo24-analytics` | potwierdzenie benchmarku 100k+ |
| 3 | Sitemapy / backup bazy URL sklepu | plik od właściciela (tylko URL i typ strony, bez danych klientów) | właściciel | inwentarz URL spoza GSC |
| 4 | Logi serwera (jeśli są) | zanonimizowane: ścieżka, status, user-agent, data — **bez IP** | właściciel/hosting | żądania botów do starych URL |
| 5 | Backlinki | eksport GSC „Linki”; opcjonalnie licencjonowane narzędzie (koszt wymaga zgody) | właściciel | TOP 100 wg linków |
| 6 | Prawa do treści | decyzja `zoo24-compliance` per typ treści | compliance | każdy `keep_200`/`edit_200` |
| 7 | Przyczyna 403 | informacja od właściciela/hostingu: WAF, blokada geograficzna, wyłączony serwer? | właściciel | test statusów HTTP |

Tokeny/klucze tylko w zewnętrznym magazynie sekretów; w repo wyłącznie `.env.example`.

## 8. Format eksportów (kolumny)

Pliki umieszczać poza repo lub w katalogu ignorowanym przez Git; do repo trafiają tylko agregaty bez PII. Kodowanie UTF-8, separator `,`, daty ISO 8601.

| Plik | Kolumny wymagane | Zakres |
|---|---|---|
| `gsc_pages.csv` | `page,clicks,impressions,ctr,position,date_from,date_to` | max dostępny (16 mies.); dodatkowo miesięcznie: `month,page,clicks,impressions` |
| `gsc_queries.csv` | `query,clicks,impressions,ctr,position,date_from,date_to` | jw.; zapytania anonimizowane przez Google pozostają pominięte |
| `gsc_page_query.csv` | `page,query,clicks,impressions,position,date_from,date_to` | TOP 500 stron (API/Looker Studio; UI nie daje tej pary) |
| `gsc_links_top_pages.csv` | `target_page,incoming_links,linking_sites` | eksport GSC „Linki → najczęściej linkowane strony” |
| `gsc_links_sites.csv` | `linking_site,incoming_links,target_pages` | eksport GSC „Linki → najczęściej linkujące witryny” |
| `gsc_index_coverage.csv` | `page,index_status,reason,last_crawled` | raport indeksowania stron (dostępny przykład) |
| `ga_landing_pages.csv` | `month,landing_page,channel_group,sessions,engaged_sessions` | 12–24 mies.; bez user ID, bez IP |
| `legacy_sitemap_urls.csv` | `url,page_type,lastmod` | wszystkie znane URL sklepu |
| `server_log_agg.csv` | `date,path,status,user_agent_class,hits` | ostatnie 30–90 dni; `user_agent_class` ∈ `googlebot|bingbot|other_bot|browser` |

## 9. Checklista testów migracji (do wykonania po wdrożeniu lokalnym / staging, potem po zgodzie na produkcji)

Status każdej pozycji: `nie wykonano` (stan na dziś).

- [ ] Każdy wiersz `redirect_301/308` ma `approved_at`, `reviewer`, `semantic_match_explanation`.
- [ ] Target każdego redirectu zwraca **200** (nie 3xx, 404, 410, 5xx) i nie jest `noindex`.
- [ ] Brak łańcuchów (max 1 hop) i pętli.
- [ ] Żaden redirect z `C/product-intent` nie ma targetu `/`, huba kategorii, `/poradniki`, `/uslugi*`, `/firma/*`.
- [ ] Alarm koncentracji targetów nie przekroczony (redirect-policy §4).
- [ ] URL `404/410` faktycznie zwracają ten status (nie soft 404 ze statusem 200).
- [ ] Strona 404/410 jest pomocna (wyszukiwarka, linki do poradników), ale ze statusem błędu.
- [ ] Canonical każdej strony 200 wskazuje na siebie (lub zatwierdzony preferowany URL), absolutny, https.
- [ ] Sitemap zawiera tylko indeksowalne strony 200, bez DEMO/draft/noindex/redirectów.
- [ ] Staging: `noindex` (nagłówek `X-Robots-Tag` + meta) i ochrona hasłem/IP.
- [ ] Produkcja: `robots.txt` nie blokuje stron publicznych.
- [ ] Linki wewnętrzne wskazują na finalne URL (nie na redirecty).
- [ ] Test jako Googlebot (Inspekcja URL w GSC) dla próbki TOP 20 — po podłączeniu GSC.
- [ ] Po wdrożeniu: tygodniowy monitoring TOP 100 (status, indeksacja, clicks) przez min. 8 tygodni.

## 10. Czego NIE robić

1. **Blanket 301 na `/`** (lub na `/poradniki`, `/uslugi`, hub kategorii) dla kart produktów — Google traktuje to jak soft 404; tracimy sygnały i wprowadzamy w błąd.
2. **Pseudo-sklep:** brak kart produktowych z cenami, dostępnością, „Kup”, koszykiem lub udawaniem sprzedawcy dla utrzymania pozycji.
3. Brak masowej generacji tysięcy stron (produkty, miasto×usługa) treściami AI — ryzyko scaled content abuse.
4. Brak kopiowania dawnych treści/opisów producentów/opinii (np. Opineo) bez praw.
5. Brak 301 do strony, która nie istnieje lub zwraca błąd; brak łańcuchów.
6. Brak automatycznego nadpisywania produkcyjnej mapy redirectów przez agenta lub crona; każda mapa wymaga zgody właściciela.
7. Brak przekierowywania intencji produktowej do lokalnego groomera/hotelu.
8. Brak prognoz ruchu lub przychodu opartych na historycznych 100k+.
9. Brak wymyślonych URL, kliknięć, pozycji, linków w inwentarzu i raportach — puste pola = `N/A`.

## 11. Następne kroki

1. Właściciel: dostęp read-only do GSC lub eksporty z §8; wyjaśnienie przyczyny 403. (bramka)
2. `zoo24-seo`: po otrzymaniu danych — §4 kroki 1–8, wypełnienie inwentarza, recovery queue TOP 20, weryfikacja hipotez H1–H3.
3. `zoo24-builder`: redirect planner wg `docs/seo/redirect-policy.md` na fixtures oznaczonych DEMO (RCV-03).
4. `zoo24-compliance`: decyzja o prawach do dawnych treści (blokuje `keep_200`/`edit_200`).
