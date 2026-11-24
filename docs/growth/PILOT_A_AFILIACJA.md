# Pilotaż A — poradnik zakupowy z oznaczonym linkiem partnerskim (projekt)

- Rola: zoo24-ops-growth (SOP C), tryb: **design / przygotowanie**. Data: 2026-11-23.
- Podstawa: `docs/ZOO24_AUDYT_PRODUKCJI_I_PROMPT_DLA_CLAUDE_V4.md` cz. B §5.1, `docs/MASTER_PLAN.md` §7 („afiliacja wyłącznie jako uzupełnienie”), `ops/config/activation.json` (live_scoped tylko dla CMS; `sponsored` i `dynamic_prices` wyłączone z akceptacji redaktora-AI; budżet płatny = 0 PLN).
- Status: **nieuruchomiony**. Nie zarejestrowano się w żadnym programie, nie kontaktowano partnerów, nie poniesiono kosztów. Ten dokument to przegląd publicznych warunków programów, a nie test produktów ani programów.

## 1. Wybrana potrzeba i uzasadnienie

**Potrzeba:** „Wybieram zbiornik akwariowy (i podstawę pod niego) o właściwej rzeczywistej pojemności”.

| Kryterium | Stan w repo | Ocena |
|---|---|---|
| Istniejąca treść | Poradnik `content/guides/akwarium-objetosc-nominalna-a-rzeczywista.json` (klasa standard, zatwierdzony przez redaktora-AI 22.11.2026) | jest punkt wejścia |
| Istniejące narzędzie | `/narzedzia/kalkulator-akwarium` (`lib/tools/aquarium.ts`: wymiary wewnętrzne/zewnętrzne, objętość nominalna vs woda vs po wyparciu) | naturalny most do kryteriów wyboru |
| Historia domeny | Sklep miał kategorie akwarystyczne (np. `/345-akwarystyka`, `/873-akwaria`, `/872-akwaria-i-akcesoria` w `docs/seo/historical-url-inventory-v3.csv`), ale **brak liczb sesji organicznych** dla tych URL; blog nie miał treści akwarystycznych | popyt = **hipoteza testowalna**, nie dane |
| Ryzyko merytoryczne | Wybór zbiornika i podstawy to geometria i nośność (1 l wody ≈ 1 kg — do potwierdzenia źródłem w karcie faktów). Filtry, grzałki, oświetlenie, obsada to kategorie `environment`/`temperature_humidity_lighting`/`cohabitation` — **poza zakresem pilota** | niskie, jeśli zakres jest wąski |

**Odrzucona alternatywa:** transporter / przygotowanie na wyjazd. Kategoria `transport` wymaga przeglądu człowieka z wiedzą gatunkową (activation.json), a poradniki wyjazdowe w klasie welfare czekają na specjalistę (`docs/CONTENT_COVERAGE.md`). Akwarium ma krótszą ścieżkę do startu.

## 2. Ścieżka użytkownika (do zlecenia Content/Build, nie pisana tutaj)

1. **Wejście:** poradnik o objętości lub kalkulator (organic, ewentualnie Social po aktywacji Meta).
2. **Kryteria wyboru** (nowy poradnik „Jak dobrać zbiornik akwariowy: wymiary, pojemność rzeczywista, podstawa” — zlecenie dla Content):
   - rzeczywista ilość wody z kalkulatora (nie nominalna z opisu);
   - wymiary zewnętrzne vs miejsce w mieszkaniu, dostęp do serwisu z góry;
   - masa napełnionego zbiornika + podłoża → nośność podstawy i podłogi (bez liczb nieposiadających źródła);
   - rodzaj podstawy: szafka dedykowana do akwarium vs mebel ogólny (kryterium: deklarowana przez producenta nośność i równość blatu);
   - zakres: poradnik **nie** dobiera obsady, filtracji ani parametrów wody i odsyła do osobnych materiałów po review specjalisty.
3. **Porównanie wariantów (typy produktów, nie SKU):**

| Typ | Dla kogo | Ograniczenia do opisania | Co sprawdzić w ofercie |
|---|---|---|---|
| Sam zbiornik (szkło klejone) | ktoś, kto kompletuje osprzęt osobno | wymaga osobnej pokrywy/podstawy | wymiary zewn. i grubość szkła, deklarowana pojemność |
| Zestaw „zbiornik + pokrywa (+ osprzęt)” | początkujący, mniej decyzji | osprzęt w zestawie poza zakresem oceny pilota | co faktycznie jest w zestawie, wymiary |
| Zbiornik z szafką (komplet) | ktoś, kto chce dopasowanej podstawy | gabaryt, transport | deklarowana nośność szafki, wymiary blatu |
| Szafka/podstawa osobno | posiadacz zbiornika | dopasowanie do wymiarów dna | nośność, wymiary, poziomowanie |

4. **Oznaczony link partnerski** — tylko po aktywacji programu i review człowieka:
   - przy linku tekst: „Link partnerski — jeśli kupisz przez niego, ZOO24 może otrzymać prowizję. Cena dla Ciebie się nie zmienia. Kolejność wariantów nie zależy od prowizji.”;
   - atrybut `rel="sponsored nofollow"` (Google: `sponsored` dla linków płatnych/afiliacyjnych), `target` bez wpływu na rel;
   - na stronie pole `disclosure` artykułu ustawione, klasa artykułu `sponsored` → **akceptacja człowieka** (redaktor-AI wyłączony dla `sponsored`);
   - linki do kategorii/wyszukiwania u partnera zgodnej z typem z tabeli, nie do jednego produktu, aby nie sugerować testu;
   - brak cen dynamicznych w treści (`dynamic_prices` = człowiek), brak słów „testowaliśmy”, „najlepszy”, „ranking”.
5. **Pomiar:** patrz §5.

## 3. Rozeznanie programów partnerskich (sprawdzone 2026-11-23, publiczne strony; warunki mogą się zmienić — potwierdzić w dniu przystąpienia)

| Program / sieć | Prowizja (publicznie) | Okno atrybucji / walidacja | Wymagania i zakazy wobec wydawcy | Dopasowanie do akwarystyki | URL |
|---|---|---|---|---|---|
| **Maxi Zoo PL** (Awin, ID 61371) | % netto koszyka: nowy klient 6% (z kuponem 3%), istniejący 3% (z kuponem 1,5%) | 60 dni; proces walidacji nieopisany; zamówienia w aplikacji nieśledzone | rejestracja w Awin + „dodatkowe warunki uczestnictwa” (nieopublikowane w profilu); zakaz brand bidding/SEM z marką, zakaz CSS Google Shopping | asortyment akwarystyczny **do potwierdzenia** | https://ui.awin.com/merchant-profile/61371 |
| **zooplus PL** (Awin, ID 10247) | 3% za pierwsze 3 zamówienia klienta, od 4. zamówienia 1%; nagłówek mówi „nawet 7%” — **niespójne**, przyjąć 3%/1% | 30 dni; „weryfikacja zamówień co 21 dni” | rejestracja w Awin; wymagania nieopisane w profilu | ma dział akwarystyka (do potwierdzenia zakresu: zbiorniki/szafki) | https://ui.awin.com/merchant-profile/10247 |
| **zooplus.pl** (Tradedoubler, ID 226970) | CPS: nowy klient 3%, inne grupy 1–2% | cookie 30 dni; **pending 60 dni** | zakaz przerabiania kreacji; całkowity zakaz Google Ads; mailing tylko po akceptacji testu | jak wyżej (alternatywna sieć — wybrać jedną) | https://directory.tradedoubler.com/en/programs/226970-Zooplus-pl |
| **Fera PL** (Awin, ID 16879) | 3% na start, możliwy wzrost zależnie od wyników | 30 dni; zasady walidacji nieopisane | dozwolone m.in. blogi/strony contentowe; zakaz SEM (Google/Bing Ads) | asortyment akwarystyczny **do potwierdzenia** | https://ui.awin.com/merchant-profile/16879 |
| **Amazon.pl — Program Partnerski** | stawki per kategoria; tabela dla kategorii zwierzęta **N/A** (za logowaniem; źródła wtórne z 2021 r. nie podają tej kategorii) | N/A | rejestracja na affiliate-program.amazon.pl; regulamin do odczytu przed decyzją | szeroki asortyment, warunki nieznane | https://affiliate-program.amazon.pl/ |

**Sieć Awin — warunek wspólny:** proces rejestracji wydawcy wymaga wpłaty weryfikacyjnej (Awin podaje 1 EUR/GBP/USD lub równowartość, zwracanej z pierwszą wypłatą; kwota dla PL niepotwierdzona) i akceptacji przez każdego reklamodawcę osobno; czas akceptacji wniosku — **N/A** (nie publikowany). Źródła: https://success.awin.com/articles/en_US/Knowledge/Why-do-I-have-to-pay-the-sign-up-fee, warunki PL: https://www.awin.com/docs.awin.com/Legal/Publisher+Terms/2025/PL_Awin-AG-Publisher-terms_August-2025.pdf. **To jest płatność** — przy budżecie 0 PLN wymaga decyzji właściciela.

**Odrzucone:** Allegro Share (następca Allegro Polecam) — według prasy nagroda w punktach/kuponach, nie w pieniądzu (m.in. https://www.instalki.pl/news/internet/allegro-share-co-to-jest-jak-dziala-wysokosc-prowizji/); oficjalnego regulaminu nie odczytano. Nie generuje przychodu dla wydawcy-firmy. Krakvet — znaleziono tylko wpis zagranicznej sieci CPC, brak polskiego źródła; niezweryfikowany.

**Wniosek:** kandydaci pierwszego wyboru to Maxi Zoo PL lub zooplus PL przez Awin (jedna sieć, jeden panel, jasne zakazy SEM, których i tak nie używamy). Prowizje 1–6% od koszyka oznaczają, że przychód zależy głównie od wolumenu ruchu, którego dziś nie ma.

## 4. Model ekonomiczny (wzór + scenariusze z jawnymi założeniami; NIE prognoza)

```
Przychód zaakceptowany / mies. = S × CTR × CR × AOV × p × A
Wynik netto = Przychód zaakceptowany − (K_treść + K_review + K_narzędzia + K_obsługa + K_rejestracja)
```

| Symbol | Znaczenie | Źródło | Dziś |
|---|---|---|---|
| S | sesje kwalifikowane: sesje z wejściem na poradnik zakupowy / poradnik o objętości / kalkulator | GA4/GSC | **N/A** (brak podłączonego GA4/GSC dla nowej wersji) |
| CTR | kliknięcia w link partnerski / S | własny licznik `affiliate_outbound` | **N/A** (licznik nie istnieje; kafel w `lib/analytics/kpi.ts` = „afiliacja nieuruchomiona”) |
| CR | konwersja u partnera (zamówienia / kliknięcia) | panel sieci | **N/A** |
| AOV | średnia wartość koszyka netto | panel sieci | **N/A** |
| p | stawka prowizji | regulamin programu | 1–6% (tab. §3) |
| A | odsetek prowizji zaakceptowanych po zwrotach/anulacjach | panel sieci, po pending | **N/A** |

Scenariusze ilustracyjne (wszystkie wartości poza `p` są **założeniami do obalenia**):

| Scenariusz | S | CTR | CR | AOV | p | A | Przychód zaakceptowany |
|---|---:|---:|---:|---:|---:|---:|---:|
| Niski | 100 | 2% | 1% | 300 PLN | 3% | 0,7 | ≈ 0,13 PLN |
| Średni | 1 000 | 5% | 3% | 600 PLN | 3% | 0,8 | ≈ 21,60 PLN |
| Wysoki | 5 000 | 10% | 5% | 600 PLN | 6% | 0,9 | ≈ 810 PLN |

Koszty: K_treść (szkic AI w subskrypcji — koszt gotówkowy 0, koszt limitu: unknown), **K_review** (człowiek dla klasy `sponsored`: godziny × stawka — unknown, prawdopodobnie największa pozycja), K_narzędzia 0 (własny licznik), K_obsługa (miesięczny ręczny import raportu z sieci, kontrola martwych linków: unknown), K_rejestracja (wpłata Awin, zwrotna). Opóźnienie gotówki: pending 30–60 dni + próg wypłaty sieci.

**Próg opłacalności:** S_min = (suma kosztów miesięcznych) / (CTR × CR × AOV × p × A). Przy założeniach „średnich” 1 sesja kwalifikowana ≈ 0,02 PLN, więc pokrycie 100 PLN kosztów wymaga ok. 4 600 sesji kwalifikowanych/mies. na tej jednej ścieżce. Historyczne dane domeny (ruch sklepu, deklaracja 100 tys.+, GA4 do 12.2024) **nie** są wartością S.

## 5. Pomiar (zlecenia dla Build — artefakt, nie kod tutaj)

1. Trasa wyjścia afiliacyjnego analogiczna do `/api/out`: allowlista ofert (id → URL partnera z parametrem sieci), agregat dzienny `affiliate_outbound` per oferta i per artykuł, bez cookies/IP, filtr botów i prefetch (jak w `app/api/out/route.ts`), `demo` poza produkcją.
2. Link renderowany z `rel="sponsored nofollow"` i widocznym oznaczeniem; test jednostkowy, że każdy link afiliacyjny ma oba atrybuty i disclosure.
3. Ręczny miesięczny wpis z panelu sieci: kliknięcia wg sieci, zamówienia, prowizja oczekująca, **prowizja zaakceptowana** (tylko ta trafia do `affiliate_revenue_approved`).
4. Zgodność metryk: kliknięcia własne ≠ kliknięcia w sieci ≠ transakcje; raportować osobno, bez sumowania.

## 6. Kryteria startu (wszystkie muszą być prawdą)

1. Poradnik o objętości i kalkulator są opublikowane i zwracają HTTP 200 na https://zoo24.pl (receipt z read-back).
2. Podłączone źródło S (GA4 lub GSC dla nowej witryny) — inaczej pilotaż można uruchomić, ale wynik będzie `inconclusive`.
3. Właściciel zatwierdził przystąpienie do jednej sieci i wpłatę weryfikacyjną (decyzja 1); konto zakłada właściciel, sekrety poza repo.
4. Program zaakceptował wydawcę; regulamin przeczytany i zapisany z datą (link + wersja).
5. Licznik `affiliate_outbound` i atrybuty rel przeszły testy (Build + QA).
6. Poradnik zakupowy przeszedł review człowieka (klasa `sponsored`); wskazany recenzent (decyzja 2).
7. Polityka/aktywacja dopuszcza publikację treści sponsorowanej — dziś **nie** (activation.json: `sponsored` wyłączone z AI-editora; publikacja wymaga człowieka).

## 7. KPI (definicje)

| KPI | Definicja | Źródło | Dziś |
|---|---|---|---|
| Sesje kwalifikowane (S) | sesje z landingiem na 3 stronach ścieżki, 28 dni | GA4 | N/A |
| CTR partnerski | `affiliate_outbound` / S | własny licznik + GA4 | N/A |
| Zamówienia u partnera | liczba zamówień przypisanych w panelu sieci | sieć | N/A |
| Prowizja zaakceptowana | PLN netto po pending, w miesiącu akceptacji | sieć | N/A |
| Wynik netto pilota | prowizja zaakceptowana − koszty z §4 | ręczny | N/A |
| Jakość | odsetek wariantów z aktualną datą sprawdzenia (≤ 90 dni), 0 martwych linków | kontrola linków | N/A |

Minimalna próba do oceny: CTR po ≥ 300 sesjach kwalifikowanych; CR po ≥ 100 kliknięciach partnerskich. Poniżej progu wynik = `inconclusive`.

## 8. Kryterium zatrzymania

- Po 90 dniach od publikacji: < 100 kliknięć partnerskich **lub** prowizja zaakceptowana < kosztu review → zatrzymać (usunąć linki, zostawić poradnik bez afiliacji) i zapisać przyczynę.
- Natychmiast: zmiana regulaminu sprzeczna z zasadami (np. wymóg rankingów, ukrywania relacji), skarga na wprowadzenie w błąd, odrzucenie wniosku przez sieć, utrata dostępności asortymentu dla opisanych typów.
- Rekomendacje nie mogą się zmieniać w zależności od stawki prowizji; jeśli taka presja się pojawi — stop.

## 9. Decyzje właściciela (max 3)

1. **Czy zgadzasz się na rejestrację ZOO24 jako wydawcy w Awin (wpłata weryfikacyjna, zwrotna) i wybór jednego programu (rekomendacja: Maxi Zoo PL albo zooplus PL)?** Konto zakłada właściciel.
2. **Kto jest człowiekiem-recenzentem treści sponsorowanej** (wymagany przez politykę; redaktor-AI nie może zatwierdzić klasy `sponsored`)?
3. **Czy akceptujesz, że pilot ma najpierw zweryfikować ścieżkę (S, CTR), a nie przynieść przychód** — przy obecnym ruchu oczekiwany przychód jest bliski zera?
