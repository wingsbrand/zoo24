# ZOO24 — backlog V4 (jedyny backlog wykonawczy)

Źródło: `docs/ZOO24_AUDYT_PRODUKCJI_I_PROMPT_DLA_CLAUDE_V4.md` (audyt 23.11.2026). Decyzje właściciela: arkusz „ZOO24 — decyzje właściciela” (https://claude.ai/artifact/Fs8MvZ9yLSMaJc48iidubw), przypomnienie e-mail codziennie 8:30, gdy są nowe pozycje.

## Wspólne kryteria odbioru (każda pozycja)
1. Zmiana widoczna w preview i w odczycie HTML (nie tylko udany build); testy istotnej ścieżki w `tests/`.
2. Żadnych deklaracji, których nie da się udowodnić (przegląd, konsultacja, test, ekspert, ruch).
3. Treść merytoryczna: źródła z URL, klasa ryzyka wg treści; welfare/zdrowie/prawo → człowiek z rolą (AI nie zatwierdza).
4. Bez masowych redirectów, bez zdejmowania noindex hurtem, bez publikacji social poza Mode 0 bez zgody.
5. Raport: co wdrożono, jakie zadanie użytkownika jest łatwiejsze, adresy, testy, ograniczenia, koszty.

## Status A01–A16 (stan po partii 1, 23.11.2026)

| ID | Właściciel | Status | Dowód / co zostało |
|---|---|---|---|
| A01 deklaracje przeglądu | Produkt/Redakcja | **wykonane** | Homepage, /o-nas, /zasady-redakcyjne, blok „Skąd bierzemy wiedzę” opisują rzeczywisty proces; ujawnienie AI przy materiałach bez przeglądu człowieka |
| A02 publiczne logi operacyjne | Produkt | **wykonane** | Usunięte z artykułu: klasa ryzyka, wymagany recenzent, termin przeglądu, rejestr twierdzeń, „zatwierdzone przez redaktora AI”; zostaje sekcja „O tym materiale” (autor, wydawca, daty, jak powstał, zgłoś błąd). Dane nadal w CMS/bazie |
| A03 karty psa/kota | Baza wiedzy | **wykonane (AI, bez specjalisty)** | `content/species/*.json`: nazwa naukowa ze źródłem i opisem rozbieżności, 5 sekcji, pytania przed decyzją, 11/15 źródeł; puste pola nie są publikowane |
| A04 nierówne pokrycie grup | Redakcja | częściowe | Paczka welfare (6 poradników: króliki, gryzonie, kot, akwarium) gotowa dla specjalisty — decyzja D-02 |
| A05 26 vs 23 | Produkt | **wykonane** | Przyczyna: cane corso, maltańczyk, kot brytyjski bez `animal/needs`. Dodane; synchronizacja metadanych repo→baza także dla opublikowanych (bez zmiany hasha treści) |
| A06 rasa jako „karta gatunku” | Produkt | **wykonane** | Nowy format `breed_profile` (18+3 profile ras); temat wyliczany z danych |
| A07 rekomendacje | Produkt | **wykonane** | Punktacja: zwierzę → potrzeba → rodzaj; między grupami tylko zadania przekrojowe (wyjazd, usługa); ręczne `related`; blok „Co dalej” z narzędziem i działem |
| A08 JSON-LD | SEO | **wykonane** | Organization+WebSite (sitewide), BreadcrumbList (każde okruszki), Article (autor = organizacja, daty jak w UI). LocalBusiness — **nie** (profile firm wymagają przeglądu kompletności, następna partia) |
| A09 daty | SEO/Produkt | **wykonane** | Przyczyna: `updatedAt` = data szkicu (22.11), `publishedAt` = publikacja (23.11). `dateModified` ≥ `datePublished`; „Zaktualizowano” tylko po zmianie treści po publikacji; sitemap lastmod spójny |
| A10 article:author z „szkic AI” | Produkt | **wykonane** | `publicAuthor()` = „Redakcja ZOO24” w UI, OG, JSON-LD, obrazach OG; pliki treści poprawione |
| A11 brak królika | Redakcja | częściowe | Wyszukiwarka uczciwie: „Dział Króliki jest w przygotowaniu”; treść czeka na D-02 |
| A12 zakres wyszukiwarki | Produkt | **wykonane** | Wyniki: działy, karty gatunków, narzędzia z typem + artykuły; synonimy (pies/psa, rybki, królik…); brak wyników bez generowania porad |
| A13 CTA narzędzi | Produkt/Redakcja | **wykonane** | Linki `[etykieta](/ścieżka)` + słownik etykiet zamiast surowych URL; strony narzędzi kierują do właściwych poradników |
| A14 katalog | Growth | plan | `docs/growth/PILOT_B_KATALOG.md`, decyzja D-07 |
| A15 meta opisy profili | SEO | do zrobienia | Następna partia (z LocalBusiness) |
| A16 social/newsletter | Social | plan | Paczka 12 postów (Mode 0), decyzje D-03, D-09 |

## Następne pozycje (kolejność)
1. Redaktor-AI: ponowna akceptacja 4 wzorców (Border collie, wyjazd psa, objętość akwarium, gady) → publikacja przez gateway.
2. Wyjazd publikacji z hooka modułu do endpointu/crona z sekretem; re-weryfikacja read-back (24 potwierdzenia READBACK_PENDING).
3. LocalBusiness/ProfessionalService + indywidualne opisy meta dla 3 indeksowalnych profili firm (A08/A15).
4. Pomiar: zdarzenia narzędzi (wynik kalkulatora, eksport listy — bez treści), wyszukiwania bez wyników (bez utrwalania fraz z danymi osobowymi), sprawdzenie /api/out bez dubli.
5. Redirecty 301 — tylko po D-05; odtworzenia treści pod dawnymi adresami (kolejka w `docs/seo/HISTORICAL_URL_MAP.csv`).
6. Pomiar wydajności (PageSpeed/CrUX — lab ≠ field).
