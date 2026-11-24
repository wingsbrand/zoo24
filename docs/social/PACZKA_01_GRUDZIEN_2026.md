# ZOO24 — paczka social 01 (1–28.12.2026)

**Tryb:** Social Mode 0. Wszystkie 12 pozycji ma status `draft`. Nic nie jest zaplanowane u Meta ani opublikowane, nie łączyliśmy się z API Meta i nie wysłaliśmy żadnych DM. Konta FB/IG są **niepotwierdzone**: nie mamy URL profili ani uprawnień.
**Dane maszynowe:** `docs/social/paczka-01.json`. Pola są zgodne z `SocialPost` (`lib/types.ts`), a do każdej pozycji dochodzi rozszerzenie `paczka`: odbiorca, korzyść, format, opis grafiki, pełny link, fakty i źródła, instrukcja linku.
**Tempo:** 12 publikacji w 4 tygodnie (6 FB + 6 IG, ok. 3 tygodniowo łącznie). To hipoteza do oceny po pierwszym odczycie Insights, nie obowiązek ilościowy.
**Przygotowanie:** zoo24-social (AI), 23.11.2026. To jest szkic — recenzja AI nie zastępuje redaktora-człowieka.

## Kalendarz

| ID | Data (Warszawa) | Kanał | Format | Odbiorca → korzyść | Strona docelowa |
|---|---|---|---|---|---|
| p01-01 | wt 01.12, 18:00 | FB | post **przypięty** | obserwujący FB → wiedzą, czym dziś jest ZOO24 | `/poradniki` |
| p01-02 | śr 02.12, 18:30 | IG | karuzela **przypięta** (4) | obserwujący IG → to samo w 4 planszach | `/poradniki` (bio) |
| p01-03 | pt 04.12, 18:00 | FB | post | wyjazd świąteczny → jedna lista dla opiekuna | `/narzedzia/lista-dla-opiekuna` |
| p01-04 | pn 07.12, 18:30 | IG | karuzela-checklista (6) | opiekunowie psów → checklista wyboru opieki | `/poradniki/jak-wybrac-opieke-dla-psa-na-czas-wyjazdu` (bio) |
| p01-05 | śr 09.12, 18:00 | FB | post: pytanie i odpowiedź | opiekunowie kotów → jak często zaglądać do kota | `/poradniki/informacje-dla-opiekuna-kota` |
| p01-06 | pt 11.12, 18:30 | IG | reels-scenariusz (30 s) | IG → lista dla opiekuna pokazana w praktyce | `/narzedzia/lista-dla-opiekuna` (bio + relacja) |
| p01-07 | pn 14.12, 18:00 | FB | karuzela-checklista (5 zdjęć) | pierwsza wizyta u groomera → 5 pytań | `/poradniki/co-ustalic-przed-pierwsza-wizyta-u-groomera` |
| p01-08 | śr 16.12, 18:30 | IG | karuzela-checklista (5) | opiekunowie ptaków → minimum opieki na wyjazd | `/poradniki/ptaki-opieka-na-czas-wyjazdu` (bio) |
| p01-09 | pt 18.12, 18:00 | FB | post: wyjaśnienie narzędzia | akwaryści → objętość nominalna a rzeczywista | `/narzedzia/kalkulator-akwarium` |
| p01-10 | pn 21.12, 18:30 | IG | reels-scenariusz (30 s) | akwaryści → 3 powody i obliczenie | `/narzedzia/kalkulator-akwarium` (bio) |
| p01-11 | śr 23.12, 12:00 | FB | post | opiekunowie kotów → dom czy hotel, dział Koty | `/zwierzeta/koty` |
| p01-12 | pn 28.12, 18:30 | IG | karuzela-checklista (5) | przyszli opiekunowie gadów → co sprawdzić przed zakupem | `/poradniki/gady-wymagania-gatunku-przed-zakupem-wyposazenia` (bio) |

Teksty FB i IG są pisane osobno, a tematy na obu kanałach rozkładamy tak, żeby się uzupełniały: FB p01-03 to tekst o narzędziu, IG p01-06 to nagranie. FB p01-09 opiera się na liczbach z przykładu, IG p01-10 na 3 powodach w wideo. Pełne teksty, alty, scenariusze i opisy grafik są w JSON.

## Zasady zastosowane w paczce

- **Linki.** FB ma klikalny link z UTM w treści. Na IG link w podpisie nie działa, dlatego piszemy „link w bio”. Operator ręcznie ustawia link z UTM danej pozycji w bio w dniu publikacji. Opcjonalnie dodaje relację z naklejką linku, też ręcznie, bo API publikacji Instagrama nie obsługuje naklejek. Ruch z bio miesza się między pozycjami, więc wynik IG traktujemy jako przybliżenie.
- **UTM.** Format: `utm_source=facebook|instagram&utm_medium=organic_social&utm_campaign=paczka01&utm_content=<id>`. **Odstępstwo od zlecenia:** zlecenie podawało `utm_medium=social`, ale walidator `lib/analytics/utm.ts` przepuszcza tylko `organic_social` i każdy inny medium zablokuje akceptację.
- **Treść.** Każde twierdzenie ma URL źródła. W pierwszej kolejności to źródło, z którego korzysta poradnik (RSPCA, PDSA, Cats Protection, MSD Vet Manual, Vetstreet), albo sama strona narzędzia, jeśli opisujemy jego funkcje. Nie ma porad weterynaryjnych, dawek, liczb żywieniowych ani parametrów środowiskowych. Jedyne liczby to arytmetyka przykładu akwarium z poradnika oraz długość życia gekona według RSPCA. Pomijamy twierdzenia z artykułów `/blog/*`, bo mają tylko akceptację redaktora-AI i część zdań nie ma przypisanego źródła.
- **Marka.** ZOO24 to portal wiedzy. Nie składamy obietnic ruchu, nie podajemy liczby obserwujących i nie nawiązujemy do sklepu, dawnych klientów ani zamówień. Komentarze moderuje człowiek. Skargi, stare zamówienia, DM i dane osobowe trafiają do człowieka.
- **Grafiki.** Na razie są tylko **opisy do przygotowania**, bez plików. Nie ma wizerunków osób, zdjęć ani logo firm trzecich. Przy ptakach, rybach i gadach używamy samej typografii, żeby nie pokazywać niewłaściwych warunków. W nagraniach ekranu pojawiają się wyłącznie fikcyjne dane, a muzyka tylko z licencją dla konta firmowego. Bez pliku pozycja zostaje szkicem: `assetId=null` → silnik polityki zwraca `ASSET_MISSING`.
- **Disclosure.** Brak treści sponsorowanych (`sponsored=false`). Gdyby redaktor użył ilustracji AI, trzeba ją oznaczyć zgodnie z zasadami platformy i `docs/brand/ai-images.md`.

## Weryfikacja stron docelowych (23.11.2026)

Wszystkie 10 stron docelowych pobrałem publicznie z https://zoo24.pl. Każda ma pełną treść, datę publikacji i sekcję źródeł tam, gdzie dotyczy, bez znacznika DEMO. Sprawdzone strony: 6 × `/poradniki/<slug>`, `/poradniki`, `/narzedzia/kalkulator-akwarium`, `/narzedzia/lista-dla-opiekuna`, `/zwierzeta/koty`.
**Ograniczenie:** w tej sesji nie było powłoki, więc nie uruchomiłem `curl -s -o /dev/null -w "%{http_code}"`. Kod 200 wynika z udanego pobrania strony, a nie z bezpośredniego odczytu. W dniu publikacji ponownie sprawdź HTTP 200 (zgoda A1).

## Blokady i konflikty

1. **Silnik polityki a strony docelowe.** `policyContext().isTargetLive` (`lib/social/workflow.ts`) uznaje tylko listę statyczną i `/poradniki/<slug>`. Pozycje p01-03, 06, 09, 10 i 11 (`/narzedzia/*`, `/zwierzeta/*`) dostaną `TARGET_NOT_PUBLISHED`. Rozszerzenie tej funkcji o odczyt live to zadanie dla zoo24-builder. Nie obchodzić ręcznie.
2. **Konflikt z kalendarzem V3.** `docs/social/calendar-v3-14d.json` (30.11–13.12) dotyczy tych samych dat i tematów. Uwaga w nim, że poradniki nie są live, jest już nieaktualna. Nie publikować obu. Propozycja: paczka01 zastępuje V3 od 1.12, a pozycje v3-* przy imporcie przechodzą w `cancelled`.
3. **Przypięcie i naklejki.** Przypięcie posta (FB, IG) i naklejkę linku w relacji wykonuje operator ręcznie, chyba że backend potwierdzi obsługę tych operacji w aktualnym API. Do tego czasu nie raportujemy ich jako wykonanych.
4. **Limity publikacji.** Nie przyjęliśmy na sztywno limitów ze starszych przykładów. Limit tygodniowy pochodzi z `settings.maxPostsPerChannelWeek`, a limity Meta trzeba sprawdzić w aktualnej dokumentacji przy podłączeniu.

## Pomiar (bez celów liczbowych)

Mierzymy ścieżkę: post → wejście (sesje wg `utm_content`) → kolejne działanie (użycie narzędzia, przejście do działu lub katalogu). Zasięg, zapisania i kliknięcia zbieramy z Meta Insights dopiero po uzyskaniu dostępu, do tego czasu wpisujemy `N/A`. Historycznych „kilkunastu tys. fanów” nie traktujemy jako bieżącego baseline. Po 2 tygodniach porównamy kierunkowo posty prowadzące do narzędzi (03, 06, 09, 10) z postami prowadzącymi do poradników, bez wniosków przyczynowych.

## Co jest potrzebne do uruchomienia

**Jeden następny krok właściciela:** podaj URL profilu Facebook i profilu Instagram ZOO24 oraz nadaj uprawnienia do strony w Meta Business Suite (Ustawienia firmy → Konta → Strony / Konta Instagram → przypisanie osoby lub aplikacji zatwierdzonego backendu). Dopiero wtedy da się potwierdzić właściciela, stan kont i statystyki.

**Jak wygląda akceptacja** (kolejka `lib/social/workflow.ts`):

1. `draft` — stan obecny wszystkich 12 pozycji: tekst gotowy, grafika tylko opisana.
2. `needs_review` — pozycja trafia tu po dołączeniu gotowego pliku grafiki lub wideo z wpisem w rejestrze assetów (licencja, dowód, data) i po dopasowaniu alt do pliku.
3. `approved` — redaktor-człowiek zatwierdza copy i zgodność ze źródłem. Silnik polityki sprawdza asset, alt, źródła, UTM, stronę live i limit. Akceptacja zamraża wersję i hash treści, a każda późniejsza edycja cofa pozycję do `needs_review`.
4. `scheduled` → `published` — wyłącznie po aktywacji Mode 1 (polityka social w `ops/config/activation.json`, uprawnienia Meta, kill switch, audit log). `published` wymaga potwierdzonego ID i permalinku posta z platformy. Przy timeout najpierw ustalamy skutek, a dopiero potem ewentualnie ponawiamy.
