# ZOO24 — audyt Facebook Page i Instagram (SOC-01)

**Wersja:** 0.1 (F0) | **Data:** 2026-11-22 | **Autor:** `zoo24-social` (AI, tryb Mode 0 / offline) | **Status:** `needs_review`
**Źródła:** `CLAUDE.md`, `docs/SEO_SOCIAL_RECOVERY.md` §4–5, §9, `docs/AUTOMATION_RUNBOOK.md`.

> **Stan faktyczny na dzień audytu:** brak dostępu do kont FB/IG, brak odczytu Meta Insights, brak zatwierdzonych assetów i zdjęć. Żadne API Meta nie było wywoływane. Wszystkie wartości bieżące = `N/A`.
> **„Kilkanaście tysięcy obserwujących FB/IG”** to `historical_owner_claim` (deklaracja właściciela). Nie wiadomo, czy liczba jest łączna, czy dotyczy każdego profilu osobno. Nie jest to bieżący baseline ani podstawa prognoz.

---

## 1. Checklista własności i dostępu (do wykonania przez właściciela / uprawnionego administratora)

Wykonuje człowiek w natywnym interfejsie Meta. **Nie przesyłać haseł, kodów 2FA, tokenów ani zrzutów z danymi osób do czatu lub repo.** Do repo trafiają tylko odpowiedzi TAK/NIE/N/A i agregaty.

### 1.1. Facebook Page

| # | Pozycja do sprawdzenia | Jak sprawdzić (ręcznie) | Wynik |
|---|---|---|---|
| FB-01 | Czy to jest **właściwy, oficjalny** fanpage ZOO24 (nie duplikat, nie strona nieoficjalna)? | Porównanie nazwy, URL strony, daty utworzenia, historii postów | N/A |
| FB-02 | Kto ma **pełną kontrolę** (Full control / dawniej „Administrator”) — liczba osób, czy właściciel jest wśród nich | Ustawienia strony > Dostęp do strony | N/A |
| FB-03 | Czy są osoby/agencje z dostępem, które nie powinny go już mieć (byli pracownicy, dawne agencje) | j.w.; zapisać tylko liczbę i rolę, bez nazwisk w repo | N/A |
| FB-04 | Czy strona jest w **Meta Business Portfolio** (dawniej Business Manager) i kto jest jego właścicielem | Meta Business Suite > Ustawienia > Zasoby firmy | N/A |
| FB-05 | Czy portfolio należy do podmiotu właściciela (nie do byłego partnera / agencji) | j.w. | N/A |
| FB-06 | Weryfikacja firmy w portfolio (status) | Ustawienia > Centrum zabezpieczeń / Informacje o firmie | N/A |
| FB-07 | 2FA włączone dla wszystkich osób z pełną kontrolą | Centrum zabezpieczeń | N/A |
| FB-08 | Status strony: ograniczenia, ostrzeżenia, naruszenia zasad, ograniczenia reklam | Jakość strony / Status konta (Page Quality / Account Status) | N/A |
| FB-09 | Nazwa strony, nazwa użytkownika (@), kategoria strony — czy wymaga zmiany (np. „Sklep zoologiczny” → kategoria serwisu informacyjnego) | Edycja informacji o stronie | N/A |
| FB-10 | Przycisk akcji (CTA) — czy nie kieruje do nieistniejącego sklepu / „Kup teraz” | Strona > przycisk akcji | N/A |
| FB-11 | Sekcja Sklep / katalog produktów / Commerce — czy jest aktywna i wymaga wyłączenia | Commerce Manager / zakładki strony | N/A |
| FB-12 | Opis strony, link do strony www, dane kontaktowe — czy nieaktualne | Informacje | N/A |
| FB-13 | Przypięty post — treść i data | Oś czasu strony | N/A |
| FB-14 | Automatyczne odpowiedzi Messengera / FAQ / wiadomość powitalna — czy obiecują zamówienia, wysyłkę, rabaty | Skrzynka odbiorcza > Automatyzacje | N/A |
| FB-15 | Aktywne kampanie reklamowe / podpięte konta reklamowe z metodą płatności | Menedżer reklam | N/A |
| FB-16 | Data ostatniego posta i ostatniej aktywności administratora | Oś czasu / dziennik aktywności | N/A |

### 1.2. Instagram

| # | Pozycja do sprawdzenia | Jak sprawdzić (ręcznie) | Wynik |
|---|---|---|---|
| IG-01 | Czy to oficjalny profil ZOO24, kto zna dane logowania i kto ma 2FA | Aplikacja IG > Ustawienia > Centrum kont | N/A |
| IG-02 | **Typ konta:** prywatne / profesjonalne (Firma lub Twórca). Do API wymagane konto **Professional** | Ustawienia > Typ konta i narzędzia | N/A |
| IG-03 | Czy IG jest **połączony z Facebook Page** ZOO24 i z tym samym Business Portfolio | Centrum kont / Business Suite > Zasoby | N/A |
| IG-04 | Kategoria profilu, nazwa, @handle | Edytuj profil | N/A |
| IG-05 | Bio — czy zawiera „sklep”, „zamów”, „wysyłka”, kody rabatowe | Profil | N/A |
| IG-06 | Link w bio — dokąd prowadzi (stary sklep, martwa strona, zewnętrzny link-in-bio) | Profil | N/A |
| IG-07 | Przypięte posty (do 3) — treść i data | Siatka profilu | N/A |
| IG-08 | Wyróżnione relacje (Highlights) — czy pokazują promocje/zamówienia/dostawy | Profil | N/A |
| IG-09 | Instagram Shopping / tagi produktów aktywne | Ustawienia > Firma > Zakupy | N/A |
| IG-10 | Szybkie odpowiedzi / automatyczne wiadomości w DM | Ustawienia > Narzędzia firmowe | N/A |
| IG-11 | Ograniczenia konta, naruszenia, status (Account Status) | Ustawienia > Status konta | N/A |
| IG-12 | Data ostatniego posta, Reels, relacji | Profil | N/A |

### 1.3. Wariant dostępu do Instagram API (decyzja w dniu wdrożenia)

| Kryterium | Instagram API with **Instagram Login** | Instagram API with **Facebook Login** |
|---|---|---|
| Powiązanie z FB Page | wg dokumentacji Meta nie zakłada obowiązkowego powiązania — **zweryfikować w dniu wdrożenia** | **wymagane** powiązanie konta Professional z FB Page |
| Typ konta | Professional (Firma/Twórca) — zweryfikować obsługiwane typy | Professional (Firma/Twórca) — zweryfikować |
| Logowanie OAuth | konto Instagram | konto Facebook osoby z uprawnieniami do Page/portfolio |
| Wspólna obsługa FB + IG jedną aplikacją | rozdzielne przepływy | łatwiejsza wspólna konfiguracja z Page |
| Rekomendacja wstępna | rozważyć, jeśli IG nie jest powiązany z Page lub powiązanie jest problematyczne | domyślnie, jeśli FB Page i IG są w tym samym portfolio właściciela |

Wybór wariantu = decyzja właściciela + `zoo24-architect`, zapis w ADR. Nie tworzyć nowych kont tylko po to, by „ułatwić” API.

### 1.4. Uprawnienia do sprawdzenia w dniu wdrożenia (lista robocza, NIE z pamięci jako fakt)

Nazwy poniżej to **kandydaci do weryfikacji** w aktualnej dokumentacji Meta (źródła w `SEO_SOCIAL_RECOVERY.md` §10). Zasada: minimalny zestaw scope'ów.

| Cel | Facebook Login (kandydaci) | Instagram Login (kandydaci) | Faza |
|---|---|---|---|
| Lista stron / zasobów | `pages_show_list`, ewent. `business_management` | — | F2 |
| Odczyt postów i zaangażowania strony | `pages_read_engagement` | — | F2 |
| Statystyki strony | `read_insights` | — | F2 |
| Publikacja na Page | `pages_manage_posts` | — | F3 (SOC-05, osobna zgoda) |
| Podstawowe dane IG | `instagram_basic` | `instagram_business_basic` | F2 |
| Statystyki IG | `instagram_manage_insights` | `instagram_business_manage_insights` | F2 |
| Publikacja IG | `instagram_content_publish` | `instagram_business_content_publish` | F3 (osobna zgoda) |
| Odczyt komentarzy do triage (bez autoodpowiedzi) | `instagram_manage_comments`, `pages_read_user_content` | `instagram_business_manage_comments` | P1 (SOC-07) |
| Wiadomości (DM) | **nie wnioskować w MVP** | **nie wnioskować w MVP** | poza zakresem |

Do sprawdzenia także: wymóg App Review / Advanced Access, weryfikacja firmy, limity publikacji przez API (dzienny limit postów IG), obsługiwane formaty (obraz, karuzela, Reels, Stories), czas życia i odświeżanie tokenów, polityka retencji danych Insights.

### 1.5. Meta Insights — zakres do odczytu (agregaty)

| Metryka | FB 90 dni | FB 180 dni | FB 365 dni | IG 90 dni | IG 180 dni | IG 365 dni | Uwagi |
|---|---|---|---|---|---|---|---|
| Obserwujący (stan na dzień odczytu) | N/A | — | — | N/A | — | — | jedna wartość + data |
| Zmiana obserwujących netto | N/A | N/A | N/A | N/A | N/A | N/A | |
| Zasięg (reach) | N/A | N/A | N/A | N/A | N/A | N/A | |
| Interakcje / zaangażowanie | N/A | N/A | N/A | N/A | N/A | N/A | |
| Kliknięcia linków / w link w bio | N/A | N/A | N/A | N/A | N/A | N/A | |
| Wyświetlenia profilu | N/A | N/A | N/A | N/A | N/A | N/A | |
| Zapisy / udostępnienia (IG) | — | — | — | N/A | N/A | N/A | |
| Top 10 postów wg interakcji (temat, format, data) | N/A | N/A | N/A | N/A | N/A | N/A | tylko temat i format, bez komentarzy |
| Struktura odbiorców (wiek/płeć/miasta — agregat) | N/A | — | — | N/A | — | — | tylko agregat Meta |
| Godziny aktywności odbiorców | N/A | — | — | N/A | — | — | |

Jeśli Meta nie udostępnia danego okresu (retencja), wpisać `N/A — niedostępne w Insights`, a nie `0`. Zapis surowego eksportu poza repo; do repo tylko agregaty zgodnie z `docs/analytics-baseline.template.csv`.

### 1.6. Historia i ryzyka PII

- **Analizować tylko agregaty:** liczba komentarzy/DM w okresie, odsetek pytań o zamówienia/reklamacje (kategoria + liczba), najczęstsze tematy. **Nie kopiować** treści komentarzy, DM, imion, nazw profili, numerów zamówień, adresów, telefonów ani e-maili do repo, raportów ani promptów.
- Nieodpowiedziane DM / komentarze ze skargami z okresu sklepu: zapisać tylko liczbę i kategorię; decyzja o odpowiedzi należy do człowieka (ryzyko roszczeń konsumenckich).
- Stare posty z promocjami, cenami, konkursami, kodami rabatowymi: zinwentaryzować (liczba, okres). Decyzja administratora: zostawić / ukryć / opisać jako archiwalne. Agent nie usuwa niczego.
- Stare posty ze zdjęciami osób trzecich / UGC / materiałami producentów: oznaczyć jako „prawa nieznane” — **nie wykorzystywać ponownie**.
- Dawne konkursy: sprawdzić, czy nie ma niewydanych nagród / otwartych zobowiązań (eskalacja do właściciela, nie do agenta).

---

## 2. Tabela parametrów kont (stan na 2026-11-22)

| Parametr | Facebook Page | Instagram | Źródło / uwagi |
|---|---|---|---|
| Kontrola nad kontem potwierdzona | N/A | N/A | wymaga właściciela |
| Liczba osób z pełną kontrolą | N/A | N/A | |
| Business Portfolio (właściciel) | N/A | N/A | |
| Typ konta IG | — | N/A | wymagany Professional |
| Powiązanie IG ↔ FB Page | N/A | N/A | |
| Obserwujący — historycznie | „kilkanaście tys.” łącznie lub osobno | j.w. | `historical_owner_claim`, niezweryfikowane |
| Obserwujący — bieżąco | N/A | N/A | brak dostępu |
| Zasięg 28 dni | N/A | N/A | brak Insights |
| Interakcje 28 dni | N/A | N/A | brak Insights |
| Kliknięcia linków 28 dni | N/A | N/A | brak Insights |
| Data ostatniego posta | N/A | N/A | |
| Najlepsze historyczne tematy/formaty | N/A | N/A | do ustalenia z Insights; plan 14d oparty na hipotezie |
| Bio / opis strony aktualny | N/A | N/A | propozycja w `docs/social/relaunch-message.md` |
| Link w profilu | N/A | N/A | docelowo `https://zoo24.pl/?utm_source=...` po uruchomieniu serwisu |
| Przypięty post | N/A | N/A | |
| Aktywny sklep / tagi produktowe | N/A | N/A | do wyłączenia po decyzji |
| Automatyczne odpowiedzi | N/A | N/A | do przeglądu |
| Ograniczenia / naruszenia | N/A | N/A | |
| Aktywne reklamy / płatności | N/A | N/A | |
| Wariant API | N/A | N/A | decyzja w dniu wdrożenia |
| Uprawnienia aplikacji | N/A | N/A | brak aplikacji |

---

## 3. Kryteria GO / NO-GO

### 3.1. GO do publikacji ręcznej relaunchu (wariant A)

Wszystkie muszą być spełnione:

1. Właściciel potwierdził pełną kontrolę nad **właściwym** FB Page i IG (FB-01/02, IG-01) oraz 2FA.
2. Brak aktywnych ograniczeń / naruszeń uniemożliwiających publikację (FB-08, IG-11).
3. Sklep FB/IG, przyciski „Kup”, automatyczne odpowiedzi o zamówieniach wyłączone lub zaplanowane do wyłączenia w dniu relaunchu.
4. Właściciel zatwierdził tekst relaunchu i treść odpowiedzi FAQ o starych zamówieniach, **w tym wskazanie, kto i jakim kanałem obsługuje sprawy dawnego sklepu** (fakt prawny do potwierdzenia).
5. Grafiki relaunchu mają udokumentowane prawa (`licenseType` ≠ `unknown`, `rightsCheckedAt` uzupełnione) — obecnie **niespełnione** (patrz `docs/social/asset-register.json`).
6. Strony docelowe (`/`, `/o-nas`, poradniki) są publicznie dostępne, bez danych DEMO; inaczej CTA zmienić na brak linku.
7. Jest osoba (właściciel lub moderator) do przeglądania komentarzy w ciągu 24–48 h po relaunchu.

### 3.2. GO do wariantu B (API + scheduler) — dodatkowo

1. Zgoda właściciela na integrację, budżet i wariant API (ADR).
2. Aplikacja Meta skonfigurowana na koncie właściciela, przyznane wymagane uprawnienia (App Review, jeśli wymagany).
3. Sekrety w zewnętrznym magazynie, nie w repo; plan rotacji/revocation.
4. QA PASS dla SOC-03/SOC-04 (approval gate, idempotency, kill switch, brak publikacji `draft`/`needs_review`).
5. Hosting schedulera z monitoringiem, limitem kosztów i alertem przy 2 błędach.
6. Smoke test za osobną zgodą (SOC-05).

### 3.3. NO-GO (którykolwiek blokuje)

- Brak potwierdzenia, kto kontroluje konto, lub konto w rękach osoby trzeciej bez umowy.
- Nierozstrzygnięte roszczenia klientów dawnego sklepu bez wskazanego kanału obsługi.
- Brak praw do grafik / logo.
- Aktywne ograniczenia Meta.
- Brak osoby do moderacji w okresie relaunchu.
- Brak odpowiedzi właściciela (brak odpowiedzi = brak zgody).

---

## 4. Wariant A vs wariant B

| Kryterium | **A: Meta Business Suite — ręczny batch** | **B: Meta API + własny scheduler** |
|---|---|---|
| Opis | Agent przygotowuje kalendarz 14 dni (JSON/CSV) → człowiek zatwierdza → człowiek planuje posty w Meta Business Suite → człowiek odnotowuje dowód publikacji (ID/link) | Agent przygotowuje kalendarz → zatwierdzenie w panelu ZOO24 → backend publikuje wyłącznie `approved` przez oficjalne API, zapisuje `external_post_id` |
| Koszt licencji / narzędzia | N/A — do wyceny (zweryfikować aktualne warunki Meta Business Suite) | N/A — do wyceny (hosting, monitoring, utrzymanie) |
| Koszt wdrożenia | N/A — do wyceny (niski, głównie konfiguracja kont) | N/A — do wyceny (aplikacja Meta, App Review, backend, testy, utrzymanie przy zmianach API) |
| Grafiki / redakcja / moderacja | N/A — do wyceny (wspólne dla A i B) | N/A — do wyceny (wspólne dla A i B) |
| Minuty człowieka / 14 dni (szacunek, hipoteza do weryfikacji) | ok. 60–120 min: review + ręczne zaplanowanie ok. 10 postów + wpisanie dowodów publikacji | ok. 30–60 min: review i zatwierdzenie batcha; plus jednorazowo kilka godzin przy wdrożeniu i okresowo przy wygasaniu tokenów/zmianach API |
| Moderacja (oba warianty) | osobno: N/A min — zależy od wolumenu komentarzy, nieznanego bez Insights | j.w. |
| Zależność od API | brak | wysoka (scope'y, App Review, wersje API, limity, tokeny) |
| Ryzyka | błąd ręczny (zła godzina, zły wariant copy), brak automatycznego audit logu, zapomniane wpisanie dowodu | błędy integracji, duplikaty po timeout, wygasłe tokeny, cofnięcie uprawnień przez Meta, ryzyko bezpieczeństwa sekretów |
| Kontrola i audyt | ręczny dowód publikacji; audit log tylko w ZOO24 po wpisaniu | automatyczny audit log, idempotency, kill switch |
| Kiedy wybrać | **domyślnie teraz** (F0/F1, relaunch, brak dostępu) | po kilku tygodniach stabilnego A, zgodzie właściciela i QA PASS |

**Rekomendacja:** start w wariancie **A** (zgodnie z §9 — bez decyzji właściciela pozostajemy w A/offline). Wariant B przygotowywać lokalnie na mockach (SOC-03/04), włączenie dopiero po osobnej zgodzie.

---

## 5. Hipoteza treściowa do weryfikacji danymi

Bez Insights nie znamy najlepszych historycznych tematów. Plan 14 dni (`docs/social/drafts-14d.json`) opiera się na hipotezie z §4.1–4.2: relaunch + praktyczna opieka sezonowa (zima) + checklisty wyboru usług (hotel przed świętami, groomer) + pytania do społeczności. Filar D (historie realnych firm/odbiorców) celowo pominięty — brak zgód i praw do zdjęć. Po odczycie Insights: korekta udziałów filarów (hipoteza 40/30/20/10) i tematów.

## 6. Decyzje właściciela (maks. 3)

1. Potwierdzić kontrolę nad FB Page i IG (checklista §1.1–1.2) i wskazać osobę do moderacji w okresie relaunchu.
2. Zatwierdzić lub poprawić komunikat relaunchu + wskazać kanał/podmiot obsługujący sprawy dawnego sklepu.
3. Zatwierdzić wariant A jako tryb startowy oraz źródło grafik (własne/licencjonowane) do uzupełnienia rejestru assetów.

---
## Aktualizacja 2026-11-22 — realne parametry z Windsor.ai (Facebook Organic)
| Parametr | Wartość | Źródło |
|---|---|---|
| Strona | ZOO24.PL (facebook_organic) | Windsor.ai |
| Obserwujący 23.11.2024 → 21.11.2026 | 44 662 → 43 506 (−1 156, ok. −50/mies.) | `docs/audits/meta-fb-monthly.csv` |
| Bieżące 28 dni (23.10–19.11.2026) | 43 547 → 43 515 (−32 netto, 6 nowych), interakcje 0, wyświetlenia strony 103 | `data/exports/meta_fb-28d.json` |
| Zasięg 28 dni | N/A — API zwraca tylko dzienne unikalne; suma dziennych (59) to nie zasięg | — |
| Kliknięcia linków | N/A — metryka zwrócona jako null | — |
| Ostatnia aktywność | interakcje 3 033 (11.2024), 676 (12.2024), potem ~0 | — |
| Ruch z social do sklepu (GA4, historycznie) | Organic Social 300–5 700 sesji/mies. (szczyt 02.2023) | `docs/audits/ga4-monthly-sessions.csv` |
| Instagram | **N/A** — konektor Instagram niepodłączony w Windsor.ai | — |

**Wnioski:** deklaracja „kilkanaście tys. fanów” jest zaniżona dla FB — strona ma ponad 43 tys. obserwujących, ale jest uśpiona od 2 lat (zasięg organiczny kilka osób dziennie). Liczba obserwujących ≠ aktywni odbiorcy: algorytm pokaże pierwsze posty niewielkiej części fanów, a część może nie pamiętać marki — stąd jasny komunikat „sklep nie wraca” i realistyczny cel: odbudowa interakcji, nie zasięgu „44 tys.”.
