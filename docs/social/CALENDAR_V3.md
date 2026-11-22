# ZOO24 — kalendarz social V3 (14 dni: 2026-11-30 – 2026-12-13)

**Tryb:** Social Mode 0. Wszystkie pozycje mają status **przygotowany** (`draft`). Nic nie jest zaplanowane u dostawcy ani opublikowane; nie wywoływano API Meta.
**Dane:** `docs/social/calendar-v3-14d.json` (16 pozycji = 8 slotów × FB i IG osobno, ok. 4 sloty tygodniowo).
**Zasady:** ZOO24 jako nowy serwis, bez wzmianek o dawnym sklepie i liczbie obserwujących; bez obietnic zdrowotnych; posty linkują tylko do stron live; ilustracje AI tylko z oznaczeniem „Ilustracja AI” i poprawnym gatunkiem; przy ptakach, rybach i gadach celowo grafiki typograficzne bez wizerunku zwierzęcia, żeby nie pokazywać niewłaściwych warunków.

## Statusy

| Status | Znaczenie | Kiedy wolno go ustawić |
|---|---|---|
| **przygotowany** (`draft`) | szkic w repo | teraz — wszystkie 16 pozycji |
| **zaplanowany** (`scheduled`) | pozycja w kolejce zatwierdzonego backendu/dostawcy | dopiero po Mode 1 i zgodach A1–A4 (A5/A6 tam, gdzie wymagane) |
| **opublikowany** (`published`) | post jest na platformie | tylko z ID postu potwierdzonym z API platformy; deklaracja narzędzia nie wystarczy |

## Pozycje

| ID | Data | Platforma | Format | Materiał | Strona docelowa | Zgody |
|---|---|---|---|---|---|---|
| v3-001 | 30.11 | FB | post (przypięty) | start serwisu | `/` | A1–A6 |
| v3-002 | 30.11 | IG | grafika | start serwisu | `/` (bio) | A1–A5 |
| v3-003 | 02.12 | FB | post | jak-wybrac-opieke-dla-psa-na-czas-wyjazdu | poradnik | A1–A4 |
| v3-004 | 03.12 | IG | karuzela | jw. | poradnik (bio) | A1–A4 |
| v3-005 | 04.12 | FB | grafika-checklista | narzędzie: lista dla opiekuna | `/narzedzia/lista-dla-opiekuna` | A1–A4 |
| v3-006 | 05.12 | IG | krótkie wideo | jw. (nagranie ekranu, dane fikcyjne) | narzędzie (bio) | A1–A4 |
| v3-007 | 06.12 | FB | post | informacje-dla-opiekuna-kota | poradnik | A1–A4 |
| v3-008 | 06.12 | IG | karuzela | jw. | poradnik (bio) | A1–A4 |
| v3-009 | 08.12 | FB | post | co-ustalic-przed-pierwsza-wizyta-u-groomera | poradnik | A1–A4 |
| v3-010 | 08.12 | IG | grafika-checklista | jw. | poradnik (bio) | A1–A4 |
| v3-011 | 10.12 | FB | karuzela | akwarium-objetosc-nominalna-a-rzeczywista | poradnik | A1–A4 |
| v3-012 | 10.12 | IG | krótkie wideo | narzędzie: kalkulator akwarium | `/narzedzia/kalkulator-akwarium` (bio) | A1–A4 |
| v3-013 | 12.12 | FB | post | ptaki-opieka-na-czas-wyjazdu | poradnik | A1–A4 |
| v3-014 | 12.12 | IG | grafika-checklista | jw. | poradnik (bio) | A1–A4 |
| v3-015 | 13.12 | FB | post | gady-wymagania-gatunku-przed-zakupem-wyposazenia | poradnik | A1–A4 |
| v3-016 | 13.12 | IG | karuzela | jw. | poradnik (bio) | A1–A4 |

UTM każdej pozycji: `utm_source=facebook|instagram`, `utm_medium=organic_social`, `utm_campaign=zoo24_portal_v3`, `utm_content=<id>`.

## Wymagane zgody (kody z JSON)

- **A1** — strona docelowa live na zoo24.pl (gateway, odczyt HTTP 200, bez DEMO). Wszystkie 6 poradników ma dziś `status: needs_review`, `publishedAt: null` (decyzja redaktora-AI `approved`, publikacja dopiero po uruchomieniu serwisu). **Jeśli artykuł nie jest live w dniu slotu, post przesuwa się; nie linkujemy do strony niedostępnej.**
- **A2** — akceptacja copy przez redaktora-człowieka (recenzja AI nie jest recenzją człowieka).
- **A3** — prawa do assetu w `docs/social/asset-register.json`; przy ilustracjach AI (v3-003, v3-007, v3-009) także potwierdzenie licencji dostawcy przez compliance (otwarte w `docs/brand/ai-images.md`) i widoczne oznaczenie. Nagrania ekranu (v3-006, v3-012): wersja produkcyjna, wyłącznie dane fikcyjne, muzyka tylko z licencją.
- **A4** — Mode 1: aktywacja `ops/config/activation.json`, uprawnienia Meta dla zatwierdzonego backendu, kill switch, audit log, idempotency.
- **A5** (v3-001/002) — akceptacja właściciela komunikatu startowego w wersji V3 (lista grup zwierząt i narzędzia to zmiana względem `relaunch-message.md` v2) oraz porządek kont: kategoria, CTA, sekcja sklepu, bio, link w bio, automatyczne odpowiedzi (FB-09..FB-14, IG-04..IG-10 w `docs/audits/social-audit.md`).
- **A6** (v3-001) — katalog groomerów i hoteli zwraca realne firmy, nie DEMO.

## Co jest zablokowane

1. **Publikacja i planowanie:** brak uprawnień Meta, brak audytu kont (wszystkie pozycje audytu = N/A), `activation.json` = INACTIVE → obowiązuje Mode 0.
2. **Strony docelowe:** żaden z 6 poradników nie jest jeszcze opublikowany; narzędzia muszą działać na produkcji.
3. **Ilustracje AI:** licencja komercyjna dostawcy niepotwierdzona; brak wpisów w rejestrze assetów social.
4. **Konflikt kalendarzy:** `docs/social/drafts-14d.json` (soc-001…) ma pozycje na te same daty i kampanię `zoo24_relaunch_2026`, a część z nich linkuje do poradników DEMO. Decyzja: V3 zastępuje stary kalendarz albo stary zostaje wycofany. Nie publikować obu.

## Po przeglądzie specjalisty (poza kalendarzem)

Poradniki w klasie `welfare` — nie używać w social, także w skrócie, dopóki nie przejdą przeglądu specjalisty:
- `przygotowanie-przestrzeni-dla-krolika-w-domu`
- `jak-znalezc-opiekuna-dla-krolika-na-czas-wyjazdu`
- `gryzonie-opieka-podczas-nieobecnosci`
- `gryzonie-porownanie-gatunkow-przed-wyborem`
- `jak-przygotowac-mieszkanie-na-przyjecie-kota`
- `akwarium-opieka-podczas-wyjazdu`

## Pomiar

Liczba postów to nie wynik. Mierzymy ścieżkę **post → wejście → kolejne działanie**:

| Etap | Metryka | Źródło | Uwagi |
|---|---|---|---|
| Ekspozycja | zasięg, zapisania, udostępnienia, kliknięcia w link | Meta Insights | dopiero z dostępem; do tego czasu `N/A` |
| Wejście | sesje i użytkownicy wg `utm_content` | analityka serwisu | IG: link w bio miesza ruch między pozycjami — w dniu posta człowiek zmienia UTM w bio; wynik IG traktować jako przybliżenie |
| Zaangażowanie na stronie | sesje z przewinięciem do sekcji „Następny krok” / czas zaangażowania | analityka | |
| Użycie narzędzia | lista: druk/PDF/pobranie pliku; kalkulator: wyświetlony wynik | zdarzenia analityki | **zdarzenia do potwierdzenia lub dodania przez zoo24-analytics/builder**; bez treści wpisanej przez użytkownika |
| Poradnik → katalog | kliknięcia z poradnika do `/uslugi/groomer`, `/uslugi/hotel-dla-zwierzat` | analityka (link wewnętrzny) | dotyczy v3-003/004, v3-009/010 |
| Katalog → usługodawca | kliknięcia kontaktu/strony firmy | analityka | główna konwersja lejka usług |
| Poradnik → narzędzie | kliknięcia `/narzedzia/lista-dla-opiekuna` z poradników o psie, kocie, ptakach | analityka | |

Raport tygodniowy: `reports/social/YYYY-WW.md`, brak danych = `N/A`. KPI bez celów liczbowych do czasu pierwszego odczytu (brak bieżącego baseline; „kilkanaście tys. obserwujących” to deklaracja historyczna). Po 2 tygodniach: wskaźniki względne — wejścia/post, odsetek wejść z kolejnym działaniem, kliknięcia do katalogu na 100 wejść.

**Mały eksperyment (kierunkowy, niska liczebność):** porównać posty kierujące wprost do narzędzia (v3-005/006, v3-012) z postami do poradników pod kątem odsetka wejść zakończonych kolejnym działaniem (użycie narzędzia / klik do katalogu). Wynik decyduje, czy w kolejnym kalendarzu więcej slotów dostają narzędzia, czy poradniki. Bez wniosków przyczynowych przy małej próbie.
