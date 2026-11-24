# Pilotaż B — katalog groomerów w 2 miastach i płatne wyróżnienie (projekt)

- Rola: zoo24-ops-growth (SOP C), tryb: **design / przygotowanie**. Data: 2026-11-23.
- Podstawa: `docs/ZOO24_AUDYT_PRODUKCJI_I_PROMPT_DLA_CLAUDE_V4.md` cz. B §5.1, `docs/MASTER_PLAN.md` §7 (freemium, jawność sponsorów, hipotezy cenowe 0/149/299 PLN), `ops/config/activation.json` (e-mail/DM wyłączone, budżet płatny 0 PLN, `sponsored`/`dynamic_prices` wymagają człowieka).
- Status: **nieuruchomiony**. Brak kontaktu z firmami, brak rejestracji, brak płatności. Dokument nie zawiera danych adresowych ani kontaktowych firm.

## 1. Stan wyjściowy (z repo)

- `content/businesses/groomers-2026-11-22.json`: 10 groomerów, po 1 na miasto (`PILOT_CITIES` w `lib/directory/stats.ts`). `verifiedByHuman: true` tylko w 3 rekordach (Kraków, Wrocław, Białystok); 7 czeka na weryfikację (`docs/STATUS.md`). Jeden rekord (Gdańsk) ma uwagę o ukrytym poleceniu dla botów na stronie firmy — wymaga ręcznej kontroli.
- Indeksowalność listingu: `MIN_REAL_LISTINGS = 3` realne firmy na kategorię × miasto. Dziś żaden listing groomerów nie spełnia progu.
- Zgłoszenia: istnieje `/dla-firm` i formularz `/dodaj-firme` (bezpłatne zgłoszenie, ręczna moderacja, przejęcie/korekta profilu, prośba o usunięcie).

## 2. Wybór kategorii i lokalizacji

**Kategoria: groomer** (kategoria MVP, nieregulowana, w odróżnieniu od weterynarii można ją wyróżniać płatnie — MASTER_PLAN §7).

**Lokalizacje: Kraków i Wrocław.** Uzasadnienie (jawne założenie, nie dane o popycie):

| Kryterium | Kraków | Wrocław | Uwagi |
|---|---|---|---|
| Rekord zweryfikowany przez człowieka | tak | tak | punkt startu i wzorzec jakości |
| Wielkość rynku | 2. największe miasto PL | 3. największe miasto PL | prawdopodobna podaż ≥ 15 salonów, więc cel 10–15 profili jest realny bez rozszerzania na powiaty |
| Dane o popycie lokalnym (GSC/GA4) | N/A | N/A | brak podłączonych źródeł; wybór do korekty po 28 dniach danych |

Odrzucone: Warszawa (rekord niezweryfikowany; 10–15 profili to wycinek rynku wymagający podziału na dzielnice — ryzyko wyglądu arbitralnej selekcji), Białystok (zweryfikowany, ale mniejszy rynek — kandydat na ewentualny trzeci etap, aby sprawdzić różnicę skali).

## 3. Budowa 10–15 sprawdzonych profili na miasto

**Uprawnione źródła (w kolejności):**
1. Strona internetowa firmy (kontakt, oferta, regulamin) — źródło główne, URL zapisany w `sourceUrl`.
2. CEIDG (https://aplikacja.ceidg.gov.pl) / KRS (https://ekrs.ms.gov.pl) — potwierdzenie, że podmiot istnieje i jest aktywny; **do rekordu nie przenosimy NIP, adresu zamieszkania właściciela JDG ani danych osobowych** — tylko fakt „podmiot aktywny, sprawdzono <data>”.
3. Zgłoszenie firmy przez `/dodaj-firme` z weryfikacją e-mailem (dobrowolne zgłoszenie = najlepsze źródło i podstawa do zgody na dodatkowe dane).

**Zakazane:** automatyczne pobieranie Google Maps, Booksy, katalogów konkurencji; kopiowanie zdjęć, opinii i gwiazdek; wymyślanie usług; kontakt z firmą (cold mail/DM/telefon) bez osobnej autoryzacji.

**Zakres weryfikacji (zapisany w rekordzie z datą `verifiedAt` i osobą/rolą):**

| Pole | Jak sprawdzone | Ważność |
|---|---|---|
| Nazwa, miasto, obszar | strona firmy + CEIDG/KRS | 180 dni |
| Telefon/WWW publiczne firmy | strona firmy (https) | 90 dni; martwy link → profil do ponownej weryfikacji |
| Usługi, gatunki | wyłącznie deklaracja firmy ze strony | 90 dni |
| `verifiedByHuman` | człowiek odczytał źródło | wymagane do publikacji w pilocie |

Uwaga prawna (do Compliance przed startem): dane JDG są danymi osobowymi; pozyskanie ich z publicznych źródeł rodzi obowiązek informacyjny (art. 14 RODO). Sposób jego realizacji **bez** cold outreachu (np. tylko firmy zgłaszające się same albo informacja w uzgodnionej formie) jest niewiadomą blokującą wpisywanie firm bez zgłoszenia.

**Bezpłatny profil podstawowy (zawsze):** nazwa, obszar, usługi, gatunki, publiczny telefon/WWW z wyjściem przez `/api/out`, źródło i data sprawdzenia, przycisk „To Twoja firma? Popraw dane” i ścieżka usunięcia. Korekta danych jest bezpłatna i nie zależy od zakupu.

## 4. Płatne wyróżnienie (hipoteza, nie oferta)

- Osobny blok „**Wyróżnione (płatne)**” nad lub obok listy; wyróżniona firma pozostaje także na swojej normalnej pozycji w liście neutralnej.
- Lista neutralna ma jawną regułę kolejności (np. alfabetycznie lub wg dzielnicy) opisaną na stronie „Jak ustalamy kolejność” — opłata nie zmienia tej reguły.
- Nie sprzedajemy: ocen, odznak „zweryfikowane/polecane”, pierwszeństwa w liście neutralnej, gwarancji liczby wyświetleń/klientów, wyłączności miasta.
- Zawartość wyróżnienia: dodatkowe zdjęcia dostarczone przez firmę (z oświadczeniem o prawach), dłuższy opis, CTA, miesięczny raport agregatów.

**Szkic cennika — HIPOTEZA do walidacji (netto, mies.):**

| Wariant | Cena | Warunek |
|---|---:|---|
| Podstawowy | 0 PLN | zawsze |
| Wyróżnienie — pilotaż | 0 PLN przez 60 dni dla pierwszych firm, które same się zgłoszą | uczciwie: ruch dopiero startuje, brak historii wyświetleń |
| Wyróżnienie — po pilotażu | 49 / 99 / 149 PLN (3 warianty do testu chęci zapłaty; 149 = hipoteza z MASTER_PLAN) | tylko jeśli raport z pilota pokaże mierzalne wyjścia do firm |

Publiczna strona cennika = treść klasy `sponsored`/ceny → **review człowieka**; do tego czasu cennik nie jest publikowany. Historycznych 100 tys. wizyt i danych dawnego sklepu nie używamy jako argumentu sprzedażowego ani zasięgu.

## 5. Raport dla firmy — co dziś da się zmierzyć

| Metryka | Mechanizm | Stan |
|---|---|---|
| Kliknięcia „Strona WWW” | `app/api/out/route.ts` → zdarzenie `business_site_outbound`, agregat dzienny per firma, bez IP/cookies, filtr botów i prefetch | **działa w kodzie**; trwałość zależy od store (Supabase vs efemeryczny `/tmp` — `docs/STATUS.md` ma sprzeczne wpisy, do potwierdzenia) |
| Kliknięcia „Zadzwoń” (tel:) | ten sam endpoint, `business_phone_outbound` | jw.; kliknięcie ≠ połączenie ≠ klient |
| Wyświetlenia profilu `/firma/[slug]` | brak licznika | **N/A** — zlecenie Build: agregat `business_profile_view` (bez cookies, filtr botów) |
| Wyświetlenia listingu miasta / pozycji w bloku wyróżnionych | brak licznika | **N/A** — zlecenie Build: `listing_view` i `featured_impression` |
| Poradnik → katalog | `app/api/event/route.ts`, `article_to_directory` (per artykuł) | działa w kodzie; brak przypisania do konkretnej firmy |
| Rezerwacje / transakcje | nie mierzymy i nie obiecujemy | N/A z założenia |

Wzór raportu miesięcznego: okres, wyświetlenia profilu (lub N/A), wyjścia WWW, kliknięcia tel., porównanie z poprzednim okresem, jawna uwaga „kliknięcie nie oznacza pozyskanego klienta; boty filtrowane heurystycznie”.

## 6. Koszt pozyskania i obsługi (wzór; wartości nieznane = unknown)

```
Wynik netto pilota = (płacące firmy × średnia opłata netto) − (K_weryfikacja + K_obsługa + K_raporty + K_faktury + K_pozyskanie)
K_weryfikacja = liczba profili × czas weryfikacji × stawka człowieka   (30 profili; czas i stawka: unknown — zmierzyć na pierwszych 5)
K_obsługa     = zgłoszenia/korekty × czas obsługi                       (unknown)
K_raporty     = 0 przy automatycznym raporcie z agregatów (wymaga Build)
K_faktury     = ręczna faktura × liczba płacących (unknown; zależy od formy działalności właściciela)
K_pozyskanie  = 0 PLN gotówki (tylko kanały własne: /dla-firm, CTA na profilu, Social po aktywacji); cold outreach i reklamy wykluczone
```

Przy 0 PLN przychodu w fazie bezpłatnego pilotażu wynik jest ujemny o koszt pracy — to świadoma inwestycja w podaż, nie przychód.

## 7. Kryteria startu

1. Trwały store produkcyjny potwierdzony (zdarzenia `/api/out` przetrwają restart) — receipt: odczyt licznika po redeployu.
2. Compliance: sposób realizacji obowiązku informacyjnego RODO dla firm wpisanych bez zgłoszenia + tekst oznaczenia „Wyróżnione (płatne)” i strony „Jak ustalamy kolejność” (review człowieka).
3. Wskazany człowiek do weryfikacji profili (`verifiedByHuman`) i obsługi korekt.
4. Build: liczniki `business_profile_view` i `listing_view` z testami (bez nich raport dla firmy jest niepełny — dopuszczalne, ale oznaczone N/A).
5. Co najmniej 3 realne, zweryfikowane profile w każdym z 2 miast (próg indeksowalności), zanim zaczniemy mówić o wyróżnieniu.

## 8. KPI (definicje)

| KPI | Definicja | Źródło | Dziś |
|---|---|---|---|
| Profile zweryfikowane | profile `verifiedByHuman` z datą ≤ 90 dni, per miasto | store | Kraków 1, Wrocław 1 |
| Wyjścia do firm | `business_site_outbound` + `business_phone_outbound` (osobno), 28 dni, per miasto | `/api/out` | N/A (brak produkcyjnych danych w okresie) |
| Wyświetlenia listingu/profilu | jw., po wdrożeniu licznika | Build | N/A |
| Zgłoszenia dobrowolne | zgłoszenia/przejęcia z `/dodaj-firme` po weryfikacji e-mail | moderacja | N/A |
| Deklaracje zainteresowania wyróżnieniem | firmy, które same wybrały opcję wyróżnienia w formularzu/na `/dla-firm` | moderacja | N/A |
| Płacący klienci i przychód netto | faktury opłacone, PLN netto | ręcznie | 0 / N/A |

Minimalna próba: wyjścia per miasto oceniamy po ≥ 28 dniach i ≥ 50 wyjściach; poniżej — `inconclusive`.

## 9. Kryterium zatrzymania

- Po 90 dniach od osiągnięcia 10 profili w mieście: < 50 wyjść do firm w 28 dniach w tym mieście → nie sprzedawać wyróżnienia, wrócić do pracy nad ruchem (poradnik → katalog).
- Po 6 miesiącach: 0 płacących i < 2 dobrowolne deklaracje zainteresowania → zgodnie z regułą kill/pivot z MASTER_PLAN zamrozić płatny model.
- Natychmiast: skarga firmy na nieprawdziwe dane bez szybkiej korekty, zastrzeżenie Compliance co do podstawy przetwarzania, żądanie usunięcia — profil usuwamy, a jeśli problem jest systemowy, wstrzymujemy pilot.

## 10. Decyzje właściciela (max 3)

1. **Zatwierdzasz Kraków i Wrocław jako dwa miasta pilota** (alternatywa: zamiana jednego na Białystok)?
2. **Czy w pilocie wpisujemy tylko firmy, które same się zgłoszą, czy także firmy z publicznych stron** (po wskazaniu przez Compliance sposobu spełnienia art. 14 RODO) — i kto jest człowiekiem-weryfikatorem?
3. **Czy wyróżnienie ma być w pierwszej fazie bezpłatne (60 dni), a cennik 49/99/149 PLN testowany dopiero po raporcie wyjść** — oraz czy możesz wystawiać faktury za wyróżnienie?
