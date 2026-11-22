# ZOO24.pl — Master Plan dla Claude Code

**Wersja:** 1.2 — SEO recovery i prowadzenie social media  
**Data opracowania:** 22 listopada 2026 r.  
**Język projektu:** polski (pl-PL)  
**Status:** brief wykonawczy do rozpoczęcia pracy w lokalnym repozytorium; nie oznacza zgody na publikację, wysyłkę marketingu ani podłączenie płatności.

> **AKTUALIZACJA PRIORYTETÓW — informacja od właściciela:** poprzedni sklep zoo24.pl miał historycznie **ponad 100 000 wejść organicznych miesięcznie** oraz **kilkanaście tysięcy obserwujących łącznie lub na obu kontach Facebook/Instagram** (dokładne liczby wymagają audytu). Są to dawne wyniki, **nie aktualny baseline** ani gwarancja ich odzyskania. Od wersji 1.2 **odzyskanie odpowiedniego ruchu SEO i reaktywacja istniejących profili społecznościowych to P0, równolegle do budowy serwisu**.
>
> **Dokument wykonawczy o randze obowiązkowej:** [`SEO_SOCIAL_RECOVERY.md`](./SEO_SOCIAL_RECOVERY.md) zawiera audyt dawnych URL, mapping i politykę przekierowań, model prowadzenia Facebooka i Instagrama, automatyzację, kalendarz, analitykę, KPI, roadmapę i testy. [`AUTOMATION_RUNBOOK.md`](./AUTOMATION_RUNBOOK.md) opisuje zadania cykliczne, uprawnienia, bramki akceptacji i utrzymanie. Oba dokumenty są częścią wymagań, **nie** opcjonalnymi pomysłami na później.
>
> **Ważne operacyjnie:** Agenci Claude Code przygotowują kod, treści i plany w sesjach. Stałe monitorowanie i publikowanie wymagają osobnego, wdrożonego schedulera / wspieranego narzędzia Meta, dostępów z prawidłowymi uprawnieniami i nadzoru. W F1 wszystko działa na mockach; publikowanie na prawdziwych kontach, zmiany na zoo24.pl i płatności wymagają zgody właściciela.

> **Nadrzędny cel:** Przekształcić domenę po sklepie zoologicznym w serwis *ZOO24 — usługi i praktyczna wiedza dla opiekunów zwierząt*, który z czasem zarabia na płatnych profilach usługodawców, ewentualnie partnerstwach afiliacyjnych i sponsorowanych materiałach. Bez towaru, logistyki, transakcji między klientem a usługodawcą, ręcznej obsługi zapytań i konieczności codziennej pracy właściciela.

> **Najważniejsze ograniczenie biznesowe:** Nie budować ogólnopolskiego, masowego katalogu ani fabryki treści AI. Istnieją już rozbudowane katalogi i platformy; przewaga powinna wynikać z jakości danych, użyteczności, skupienia na konkretnych potrzebach i powiązania poradników z lokalnymi usługami. Automatyzować proces, **nie** publikować fikcyjnych danych, ocen ani specjalistycznych porad bez kontroli.

---

## 0. Decyzje produktowe — obowiązujące, dopóki dane nie wykażą inaczej

| Obszar | Decyzja | Powód |
|---|---|---|
| Model | Redakcyjny katalog usług + portal poradnikowy | Jeden serwis: odzyskiwane SEO, nowe SEO lokalne i istniejące społeczności Meta; bez e-commerce |
| Historyczny potencjał | Historycznie 100 000+ wejść organicznych/mies. i kilkanaście tys. fanów FB/IG według właściciela; aktualny stan do audytu | Trzy baseline'y: historyczny, aktualny 28 dni i przyrost — bez ekstrapolowania dawnych statystyk |
| SEO Recovery (P0) | Audyt GSC/GA4 i dawnych URL, 200 / relewantne 301 / 404 / 410; zachowanie legalnych treści zgodnych z intencją | Ochrona wartości starego serwisu bez tworzenia fikcyjnego sklepu |
| Social Media (P0) | Reaktywacja istniejących stron FB + IG; Claude przygotowuje materiały, harmonogram i analizę, scheduler publikuje **tylko zatwierdzone** | Stała obecność przy minimalnej pracy właściciela, legalne API lub Meta Business Suite |
| Monetyzacja 1 | Płatne rozszerzenia wizytówek/sponsoring **nieweterynaryjny** | Przychód cykliczny, prosta operacja i brak konieczności obsługi transakcji klient–firma |
| Monetyzacja 2 | Afiliacja wyłącznie jako uzupełnienie | Zależność od ruchu i zmian w programach partnerskich |
| Cel czasu właściciela | Po ustabilizowaniu: ok. 30–60 min/tydzień na decyzje; okres wdrożenia może wymagać więcej | Realistyczny model niskoobsługowy, a nie „całkiem pasywny” |
| Zakres geograficzny MVP | 2 miasta pilotażowe: **Warszawa i Białystok** jako hipoteza, do potwierdzenia danymi popytu w F0 | Test dużego i mniejszego rynku; nie zakładać zamieszkania właściciela w którymkolwiek mieście |
| Kategorie MVP | **Groomerzy/salony pielęgnacji** oraz **hotele dla psów i kotów** | Jasna intencja usługowa, możliwośc monetyzacji i relatywnie niższe ryzyko regulacyjne niż weterynaria |
| Katalog | 30–40 wartościowych, realnych, sprawdzonych profili na start; docelowo min. 10 na każdą aktywną kategorię-miasto | Gęstość podaży zamiast pustych SEO landingów |
| Poradniki | 6–8 autorskich, sprawdzonych artykułów do premiery, kolejne 1–2/miesiąc po ocenie efektów | Quality-first; unikać generowania setek stron |
| Kontakty klient–firma | Link www / przycisk telefon / link do własnego systemu rezerwacji firmy | Bez trzymania danych klientów i obsługi leadów w MVP |
| Opinie/rankingi | Brak recenzji użytkowników i gwiazdek w MVP | Moderacja, weryfikacja, DSA/Omnibus i ryzyko fałszywych opinii |
| Weterynaria 24h | NIE w MVP, dopiero po przeglądzie prawnym i weryfikacji aktualności dyżurów | Szczególne ograniczenia reklamy i ryzyko nieaktualnych danych |
| Rezerwacje, płatność za usługę | Poza MVP | Zwiększają odpowiedzialność, support, rozliczenia, ryzyko sporów |
| Projektowanie | Mobile-first, szybkie strony, filtr miasta i kategorii, dostępność | Większość lokalnych potrzeb rozwiązuje się szybko na telefonie |
| Wdrażanie | Claude Code tworzy lokalny kod i testy automatycznie; wdrożenie produkcyjne wyłącznie po bramce akceptacyjnej | Ograniczenie ryzyka i nieautoryzowanych kosztów |

**Ważne:** Miasta i kategorie są założeniami testowymi. Agent ds. wzrostu ma sprawdzić wolumen/intencje fraz i rozmowy z potencjalnymi partnerami. Jeśli bez twardych danych nie można przeanalizować rynku, zachować ustawienia jako hipotezę, nie udawać przeprowadzonej walidacji.

## 1. Sytuacja wyjściowa i weryfikacja aktywów

### Co można potwierdzić publicznie (stan na 22.11.2026)

- Opineo ma stronę historycznego sklepu ZOO24.PL z ok. **10 072 opiniami**. To dowód historycznej działalności i rozpoznawalności, **nie** dowód obecnego ruchu ani uprawnień do ponownego wykorzystania treści opinii [S1].
- Ceneo opisuje profil sprzedawcy zoo24.pl i wskazuje zatrzymanie oferty 17.02.2025 [S2]. Nazwy dawnych podmiotów w katalogach nie przesądzają obecnej sytuacji prawnej domeny czy znaku.
- Publiczny odczyt strony głównej przez narzędzie badawcze zwrócił `403 Forbidden`. **Nie ustalono** rzeczywistego stanu sklepu, indeksacji, ruchu organicznego, zawartości serwera ani profilu linków.
- Na rynku działają m.in. **Zwierzoklub** (katalog firm), **Petsy** (opieka i rezerwacje). Konkurencja jest rzeczywista, więc powielanie szerokiego katalogu bez przewagi nie ma sensu [S3, S4].
- Branża ma znaczną bazę odbiorców: opracowanie ZPF opisuje >13,5 mln psów i kotów według cytowanego tam oszacowania. Nie jest to prognoza liczby potencjalnych klientów ZOO24 [S5].

### Zadania audytowe przed przełączeniem domeny (F0, obowiązkowe)

1. **Domena i marka:** potwierdzić właściciela domeny, prawo używania nazwy/logo, ewentualne prawa osób trzecich do historycznego sklepu, znaków oraz treści. Brak samodzielnego wniosku o stanie prawnym znaku.
2. **Search Console:** eksport ostatnich 16 miesięcy: kliknięcia, wyświetlenia, CTR, pozycja; 100–500 top URL i zapytań; indeksacja, ręczne działania, usunięcia, mapy witryny.
3. **Analityka:** historia ruchu 12–24 miesięcy (o ile dostępna), źródła, wejścia zewnętrzne, sezonowość, bez eksportowania danych osobowych klientów.
4. **URL-e i linki:** legalny crawl **własnej** strony/sitemap, lista backlinków z dostarczonego narzędzia i raport `OLD_URL -> NEW_URL / 404 / 410`; przegląd ryzyka spamlinków.
5. **Stan techniczny:** obecny DNS, SSL, hosting, robots.txt, zasoby, przekierowania, canonicale, status aplikacji; zabezpieczyć kopię i opcję rollbacku.
6. **Dane i RODO:** nie przenosić list starych klientów, zamówień, e-maili newslettera ani danych marketingowych do nowego serwisu bez zweryfikowanej podstawy prawnej i zakresu zgód.
7. **Decyzja F0:** przełączać domenę wyłącznie po raporcie „co zachować, co wycofać, jak przekierować” i świadomej zgodzie właściciela.

**Reguła migracji SEO:** 301 wyłącznie ze starego adresu na odpowiadający mu treścią nowy URL; strony bez odpowiednika powinny zwracać 404/410. **Nie** przekierowywać masowo kart produktów na stronę główną (soft 404). Mapa przekierowań i monitoring GSC mają być integralną częścią wdrożenia [S6].

## 2. Strategia rynkowa i pozycjonowanie

**Wartość dla właściciela zwierzęcia:** „Znajdź konkretną usługę w swoim mieście, sprawdź istotne informacje, dowiedz się jak świadomie wybrać i przejdź bezpośrednio do usługodawcy”.

**Wartość dla usługodawcy:** „Zdobądź czytelny profil w branżowym serwisie, wizyty od osób zainteresowanych usługą oraz możliwość samodzielnej aktualizacji informacji”.

**Czym nie jesteśmy:** weterynaryjną infolinią, giełdą sprzedaży zwierząt, sklepem, platformą do przyjmowania płatności za usługi, organizatorem przewozu zwierząt, gwarantem jakości i 24-godzinną pomocą.

**Wyróżniki możliwe do obrony:**

- Wizy­tówki oparte na aktualnych, dających się wskazać źródłach; „**Dane sprawdzone dnia**”, bez fikcyjnego badge'u zaufania.
- Pola naprawdę przydatne: czy strzyżenie kotów, wielkość psa, obszar usług, zakres usług hotelu, warunki pobytu — tylko gdy potwierdzone.
- Jasna i uczciwa informacja, co jest reklamą, a co zwykłą pozycją katalogową.
- Poradniki z checklistami i praktycznymi pytaniami do usługodawcy, nie automatycznie generowane „100 najlepszych salonów” bez badań.
- Samoobsługa usługodawcy i prosta automatyczna kontrola świeżości danych.

### Segmenty i Jobs To Be Done

| Osoba | Zadanie | Główna akcja |
|---|---|---|
| Opiekun psa | Znalazłem groomera w pobliżu, porównuję zakres i sposób kontaktu | Telefon lub witryna firmowa |
| Opiekun kota | Szukam hotelu, który potwierdza przyjmowanie kotów | Porównanie informacji i przejście do firmy |
| Właściciel salonu | Chcę widoczności bez dodatkowych narzędzi i obsługi systemu | Dodaj / przejmij / aktualizuj profil |
| Właściciel hotelu | Chcę klientów sezonowych i widoczności oferty | Uzupełnij profil; opcjonalnie wykup oznaczone wyróżnienie |
| Administrator | Mam kilkanaście zmian tygodniowo, nie chcę przepisywać danych | Zweryfikuj zbiorczo w panelu, zatwierdź lub odrzuć |

## 3. Zakres MVP: wymagania funkcjonalne

### P0 — konieczne do publicznej premiery

- Strona główna: prosta wyszukiwarka miasto + rodzaj usługi, dwa wejścia tematyczne, krótkie poradniki, CTA „Dodaj firmę”.
- Lista usług dla wybranej kategorii i miasta; filtry naprawdę obsługiwane, sortowanie neutralne i opisane; pusty wynik z innymi opcjami, `noindex` dla pustych kombinacji.
- Profil usługodawcy: nazwa, kategoria, miasto, adres/obszar działalności, dozwolone kontakty, opis (unikalny), zakres usług, źródło i data sprawdzenia, CTA zewnętrzny/telefon, status „profil zgłoszony przez firmę” *tylko po potwierdzeniu*.
- Strona poradnikowa: tytuł, data publikacji i aktualizacji, autor lub rzetelne przypisanie redakcyjne, źródła, checklista, linki do powiązanych usług w mieście, informacje o współpracy komercyjnej.
- Formularz dodania / aktualizacji / przejęcia profilu: minimalne pola, zgoda na regulamin, informacja o prywatności, dowód kontroli firmy (weryfikacja domeny e-mail lub inna procedura), moderacja zmian przed publikacją.
- Zaplecze admina: logowanie, kolejka zgłoszeń, statusy `draft/pending/rejected/published/suspended`, historia zmian i źródeł, szybka edycja, publikacja; dostęp tylko dla uprawnionego admina.
- Strony zaufania: O nas, Kontakt, Zasady aktualizacji danych, Reklama i współprace, Polityka prywatności, Cookies (jeśli potrzebne), Regulamin świadczenia usług drogą elektroniczną, Zgłoś błąd/nadużycie.
- Techniczne SEO: SSR/SSG, przyjazne URL, meta, canonical, sitemap.xml tylko opublikowanych stron, robots.txt, schema.org bez zmyślonych ocen, semantyczne nagłówki, Open Graph, wewnętrzne linkowanie, obsługa 301/404/410, poprawny XML sitemap.
- Wydajność i mobilność: poprawne layouty 360 px+, klawiatura, formularze z walidacją, optymalizacja obrazów, atrybuty alt, ochrona przeciw spamowi/rate-limit.
- Pomiar: agregowane zdarzenia `listing_view` (opcjonalnie), `provider_site_click`, `provider_call_click`, `claim_start`, `claim_verified`, `content_to_directory_click`, bez przechowywania niepotrzebnych danych odwiedzających.

### P1 — dopiero po premierze i pierwszych sygnałach popytu

- Jeden plan „**Wyróżniona wizytówka**” dla branż nieregulowanych; jawne etykiety „Reklama”/„Wyróżnione (płatne)” z zachowaniem neutralnego porządku wyników zwykłych.
- Checkout subskrypcji (np. wybrany dostawca płatności obsługujący B2B w Polsce), automatyczne potwierdzenie płatności, fakturowanie/obowiązki podatkowe po konsultacji z księgowym.
- Automatyczny panel usługodawcy do zdjęć i godzin, moderacja ryzykownych zmian; okresowe przypomnienia do **zarejestrowanych, wyrażających zgodę usługodawców**, nie do przypadkowo znalezionych adresów.
- Rozszerzenie o 1–2 kolejne miasta tylko gdy spełnione są bramki jakości i popytu.

### P2 — opcjonalnie, nie planować do implementacji w pierwszej wersji

- Zaawansowana mapa (tylko legalny dostawca map i licencja), rezerwacje online, opinie, czat, profil klienta, rankingi, porównywarka ubezpieczeń, płatne leady, dane o 24h weterynarii.
- Rozdzielić ocenę biznesową i prawną każdego dodatku. Przy ubezpieczeniach szczególnie nie sugerować doradztwa bez oceny obowiązków regulacyjnych.

## 4. UX i architektura informacji

### Główne ścieżki

**Konsument:** Google / link -> landing typu `/uslugi/groomer/warszawa` -> profil -> kontakt na stronie firmy / telefon. Celem jest wykonanie akcji maksymalnie w 3 krokach od landingu.

**Usługodawca:** `/dla-firm` -> formularz zgłoszenia -> e-mail potwierdzający -> moderacja -> publiczny profil -> link do aktualizacji. Nie sprzedawać abonamentu, zanim nie ma czego promować.

**Administrator:** powiadomienie o nowym zgłoszeniu -> panel „Do weryfikacji” -> źródła i porównanie zmian -> zatwierdź / poproś o poprawkę -> log audytu. Krytyczne zmiany (telefon, adres, własność) wymagać dodatkowego potwierdzenia.

### Proponowane URL-e

```text
/
/uslugi
/uslugi/groomer
/uslugi/hotel-dla-zwierzat
/uslugi/groomer/warszawa
/uslugi/groomer/bialystok
/uslugi/hotel-dla-zwierzat/warszawa
/uslugi/hotel-dla-zwierzat/bialystok
/firma/{stabilny-slug}-{short-id}
/poradniki
/poradniki/{slug}
/dla-firm
/dodaj-firme
/zglos-blad
/o-nas
/kontakt
/polityka-prywatnosci
/regulamin
/reklama-i-wspolprace
```

**Indexability:** indeksuj tylko faktycznie kompletne, unikatowe strony. Nie indeksuj wyszukiwania ogólnego (`?q=`), stronicowania/filtrów bez odrębnej wartości, pustych miast i wariantów parametrów. Zablokuj indeksację stagingu; nie blokuj robots.txt po włączeniu produkcji. Canonical do preferowanego adresu. Dla listingów unikalne opisy weryfikowane i aktualne; slugi stabilne na podstawie ID.

**Makieta strony głównej — kolejność:** logo/nawigacja -> jedno zdanie wartości -> wybór miasta i usługi -> 2 kategorie -> sprawdzone firmy -> praktyczne poradniki -> jak aktualizujemy dane -> CTA dla firm -> stopka prawna.

**Zasady projektowe:** brak fałszywych countdownów, ocen, dostępności 24h czy haseł „najlepszy”; niedopowiedzenia nie mogą wyglądać na potwierdzone dane; pokaż „Brak potwierdzonych danych” zamiast zgadywania.

## 5. Jakość danych katalogowych i zasady pozyskania

### Źródła, prawa, prawdziwość

1. Preferowane: zgłoszenie firmy z własnymi materiałami i udzieleniem licencji na ich użycie; ręczne, legalne uzupełnianie podstawowych faktów z oficjalnej witryny usługodawcy z odnotowaniem URL i daty dostępu.
2. Nie importować automatycznie z Google Maps, konkurencyjnych katalogów ani mediów społecznościowych bez wyraźnej zgodności z regulaminem, prawem do bazy danych i prawami do treści/zdjęć.
3. Jeśli w przyszłości pojawi się OpenStreetMap, wykonać osobny przegląd ODbL, sposobu atrybucji, obowiązków dotyczących pochodnych baz i limitów publicznych serwerów tile/API [S12].
4. Każdy profil ma `source_url`, `checked_at`, `verification_method`, `verification_status` i właściciela/zgłaszającego; nie pokazywać badge „Zweryfikowany”, jeżeli potwierdzono tylko zgodność nazwy z publiczną stroną.
5. Brak zdjęcia = neutralny placeholder, nigdy nie przypisywać wygenerowanego zdjęcia konkretnemu, prawdziwemu salonowi.
6. Przeciwdziałanie duplikatom: normalizacja numeru telefonu/domeny, `name + city + address`; łączenie tylko po moderacji.
7. Formularz zgłoszenia błędu/usunięcia; potwierdzenie posiadania firmy; archiwizacja/kwarantanna po utracie aktualności.

### Stan i świeżość

- `pending`: rekord niepubliczny i nieindexowany.
- `published`: posiada wszystkie pola obowiązkowe, źródło i świeżą weryfikację.
- `stale`: jeśli minęło **180 dni** od ostatniego potwierdzenia podstawowych danych; kolejka ponownej weryfikacji.
- `suspended`: informacja o zamknięciu/konflikt danych/brak możliwości potwierdzenia; profil z `noindex` lub 404 po przejrzeniu historii SEO.
- Co 90 dni zaproszenie do aktualizacji profilom **claimowanym**, o ile kanał komunikacji i zgody pozwalają; 180 dni przegląd w panelu. Nie twierdzić, że automatyczne sprawdzanie strony zastępuje realne potwierdzenie.

### Minimalne pola profilu

Nazwa, slug+ID, kategoria, miasto, dokładny adres **lub** obszar działania, kontakt, opis, źródło, data sprawdzenia, status publikacji, rozróżnienie profilu przejętego i zwykłego. Pola dodatkowe tylko przy wiarygodnym źródle: rodzaje zwierząt, rozmiary psów, usługi, godziny, ceny **jako przedziały wyłącznie od usługodawcy z datą**, warunki hotelowe. Nie zgadywać cen.

## 6. Strategia ruchu: SEO + dystrybucja + partnerzy

### Rdzeń SEO (najtańszy w długim okresie, ale wolny i niepewny)

- **Intent transakcyjny lokalny:** `groomer warszawa`, `strzyżenie psa Białystok`, `hotel dla kota Warszawa`, `hotel dla psa Białystok` — strony indeksowane dopiero gdy zawierają odpowiednią liczbę prawdziwych usługodawców i autorski kontekst.
- **Intent poradnikowy blisko usługi:** `jak wybrać groomera`, `pierwsza wizyta u groomera`, `co zabrać do hotelu dla psa`, `jak przygotować psa na pobyt w hotelu`, `czym różni się hotel od petsittera` — każdy tekst z praktyczną wartością i rozsądnymi odsyłaczami do katalogu.
- **Dawne SEO:** zachować tylko wartościowe tematycznie i prawnie legalne treści dawnego sklepu (własne prawa autorskie), przerobić niekatalogowe poradniki, przygotować mapę przekierowań; nie wymuszać kierowania intencji zakupowej na wizytówkę groomera.
- **Entity i zaufanie:** autor, redakcja, metodologia źródeł, rzeczywisty kontakt, jawne sponsoringi, data weryfikacji, FAQ odpowiadające na pytania użytkowników (bez oczekiwania gwarantowanych rich snippets).
- **Technika:** SSR/SSG dla indexable, canonical, breadcrumbs, schema `Organization`, `BreadcrumbList`, `Article` oraz `LocalBusiness` tam gdzie prawdziwy profil i widoczne dane spełniają wymogi [S7]. Bez zmyślonych `aggregateRating`/`review`.

**Reguła Google:** AI może pomóc redaktorowi, ale masowe publikowanie mało oryginalnych stron dla manipulacji rankingami to ryzyko naruszenia zasad scaled content abuse. Zakaz automatycznego tworzenia tysięcy stron miasta×usługa bez unikatowej wartości [S8, S9].

### Plan treści (12 propozycji; 6–8 do premiery)

| Kolejność | Temat (propozycja) | Intent / CTA | Dodatkowa wartość, którą trzeba zebrać |
|---|---|---|---|
| 1 | Jak wybrać dobrego groomera? Lista pytań przed wizytą | poradnik -> groomer | Checklista ekspert/praktyk; kryteria zamiast „top 10” |
| 2 | Pierwsza wizyta psa u groomera: przygotowanie i przebieg | poradnik -> groomer | Jasne kroki; bez porad medycznych |
| 3 | Hotel dla psa: 15 pytań, które warto zadać przed rezerwacją | poradnik -> hotel | Autorska tabela porównawcza do pobrania |
| 4 | Hotel dla kota czy opieka w domu? Plusy i minusy | porównanie -> hotel | Warunki, ograniczenia; wskazanie indywidualnych potrzeb |
| 5 | Jak przygotować psa do pobytu w hotelu? | poradnik -> hotel | Checklista rzeczy; bez recept na problemy behawioralne |
| 6 | Co sprawdzić w salonie groomerskim dla kota? | poradnik -> groomer | Wyłącznie zweryfikowane praktyczne zalecenia |
| 7 | Strzyżenie, trymowanie, kąpiel — czym różnią się usługi groomera | wyjaśnienie -> groomer | Przykłady z usługodawcami; bez skopiowanych opisów |
| 8 | Hotel dla psa na wakacje: kiedy zacząć szukać | sezonowy -> hotel | Kalendarz organizacyjny, bez fikcyjnych cen |
| 9 | Usługi groomerskie w Warszawie — jak porównać oferty | lokalny poradnik -> profil | Własna ankieta 3–5 firm, aktualna data |
| 10 | Jak przygotować do pierwszego trymowania psa | poradnik -> groomer | Konsultacja z praktykiem |
| 11 | Hotel dla zwierząt — jak sprawdzić warunki i bezpieczeństwo | wysokointencyjny -> hotel | Procedura pytań i dowody, bez gwarantowania bezpieczeństwa |
| 12 | Petsitter czy hotel dla psa — który model opieki pasuje do sytuacji | poradnik -> hotel | Neutralne porównanie, wskazanie konkurencyjnych opcji |

**Publikacja:** AI tworzy brief/outline/draft i listę źródeł; redaktor lub sprawdzony wykonawca weryfikuje fakty, sens, oryginalność i użyteczność. Treści o zdrowiu zwierząt wymagają odpowiedniej merytorycznej kontroli (a w MVP najlepiej ich nie tworzyć). Nie wymyślać ekspertów, ich cytatów, referencji ani własnych testów [S9].

### Kanały ruchu poza SEO — kolejność ROI do czasu

1. **Dystrybucja przez usługodawców:** po pozytywnym zgłoszeniu gotowy link, QR do wizytówki, opcjonalny uczciwy widget „Sprawdź nasz profil na ZOO24”; bez wymuszania linkowania za pozycję w rankingu.
2. **Partnerstwa z realnymi usługodawcami i lokalnymi społecznościami:** 2 wartościowe współprace/miesiąc (np. wspólne checklisty, materiały edukacyjne). Kanały i zgody zgodne z PKE, bez masowego cold mailingu.
3. **Social repurposing niskokosztowy:** 1–2 krótkie publikacje/tydzień z już zweryfikowanych poradników, kierujące do pełnych materiałów. Automatyzacja przygotowania i harmonogramu, bez spamowania grup.
4. **Newsletter opcjonalny po walidacji:** tylko aktywny opt-in, double opt-in, łatwe wypisanie; nie importować dawnej listy sklepu bez przeglądu podstawy prawnej.
5. **Płatny ruch:** mikrotest wyłącznie na stronę „Dla firm” / walidację zakupu; maks. uzgodniony budżet. Reklamy do szerokich użytkowników rzadko opłacają się przy modelu wizytówkowym na starcie.
6. **Link building:** PR z autorskimi materiałami i partnerstwami; zero kupowania farm linków i zapleczówek.

### Harmonogram pozyskiwania ruchu

| Okres | Cel | Działania | Sygnał sukcesu |
|---|---|---|---|
| Dni 1–14 | Zdiagnozować SEO i popyt | GSC, 4 klastry fraz, 5–10 rozmów/ankiet firm (przez legalny kanał), audyt konkurencji | Można wskazać intencje i 2 firmy gotowe przetestować produkt |
| Dni 15–45 | Zbudować pierwszą wartość | 30–40 profili z potwierdzonymi danymi, 6–8 poradników, indeksowalne landingi z podażą | Strony przechodzą QA, zero pustych landingów |
| Dni 46–90 | Uzyskać sygnał z rynku | Wpiąć GSC, program claim, dystrybucja partnerów, 2 nowe teksty/mies., zbierać kliknięcia | Pierwsze kwalifikowane kliknięcia i zgłoszenia firm; brak sygnału = pivot testów |
| Miesiące 4–6 | Potwierdzić sprzedaż | Test planu wyróżnienia; pierwszy cykl odnowień | Min. 3 niezależne płatne pilotaże **lub** jasne dowody odmowy i zmiana modelu |
| Miesiące 7–12 | Powtarzalność | Rozszerzać tylko skuteczne kategorie/miasta; redakcja i aktualizacje | Rosnąca liczba aktywnych profili i płacących; mierzalny retention |

## 7. Monetyzacja i ekonomia

### Zasady

- **Freemium dla firm:** podstawowa wizytówka bezpłatna; płatność za jawnie wymienione funkcje reklamowe i możliwość rozszerzenia. Nie sprzedawać fałszywej „weryfikacji” ani nie wymuszać opłat za poprawienie danych.
- **Bez reklamowania zakładów leczniczych dla zwierząt** w modelu promowanych profili bez specjalistycznej analizy. Art. 29 ustawy o zakładach leczniczych dla zwierząt wymaga, aby publiczne informacje o usługach nie nosiły cech reklamy [S10].
- **Jawność sponsorów:** płatne wyróżnienia i afiliacje muszą być czytelnie oznaczone. Płatna pozycja nie może udawać neutralnego rankingu [S11].
- **Nie uzależniać przychodu od niezweryfikowanych danych kontaktowych czy rozsyłania cudzych leadów.**

### Oferta testowa dla firm (hipotezy cenowe, nie cennik rynku)

| Plan | Netto PLN / miesiąc | Warunki |
|---|---:|---|
| Podstawowa | 0 | Widoczne potwierdzone dane, telefon/link, zgłoszenie aktualizacji |
| Wyróżniona | **149** | Jawnie oznaczony moduł sponsorowany na wybranym, adekwatnym landingu; więcej zdjęć dostarczonych przez firmę, CTA, podsumowane statystyki agregowane; nie gwarantować liczby klientów |
| Partner sezonowy (P2) | **299** | Oznaczona ekspozycja przez wskazany okres, raport emisji; po weryfikacji popytu i wymogów prawnych |

**Walidacja gotowości do płacenia:** przed implementacją pełnego billing — strona oferty i formularz wyrażenia zainteresowania / ręczne pilotaże z poprawną fakturą. Zmierzyć: 10 rozmów lub odpowiedzi od kwalifikowanych usługodawców, co najmniej 2 deklaracje płatnego testu, następnie 3 realne płatności w czasie pilotażu. Brak zainteresowania = korekta produktu, nie więcej kodowania.

### Alternatywy, dopiero gdy mają sens

- Afiliacja do usług lub produktów odpowiadających kontekstowi poradnika; program partnerski należy potwierdzić na dzień podpisania współpracy, prowizja i regulamin mogą się zmieniać.
- Sponsoring checklist/sezonowego przewodnika — wyraźne oznaczenie i oddzielenie od treści niezależnej.
- Sprzedaż kontaktów/dochodów z rezerwacji lub ubezpieczenia: **nie w MVP** z uwagi na prywatność, odpowiedzialność i możliwe regulacje.

### Scenariusze miesięczne — ilustracja matematyczna, NIE prognoza

| Wariant | Płacące firmy × 149 zł netto | Inne przychody netto | Razem przychody netto | Założone koszty operacyjne / mies. | Saldo przed podatkiem, wynagrodzeniem właściciela i inwestycją początkową |
|---|---:|---:|---:|---:|---:|
| Ostrożny | 5 × 149 = 745 zł | 0 zł | 745 zł | 1 500 zł | **−755 zł** |
| Bazowy testowy | 20 × 149 = 2 980 zł | 300 zł | 3 280 zł | 1 500 zł | **1 780 zł** |
| Wysoki, wymagający skali | 50 × 149 = 7 450 zł | 1 000 zł | 8 450 zł | 2 500 zł | **5 950 zł** |

**Interpretacja:** bazowy wariant wymaga realnego pozyskania i utrzymania 20 płacących firm (np. ok. 13% spośród 150 aktywnych firm, gdyby taka baza powstała). To trudny cel sprzedażowy, nie automatyczny skutek stworzenia serwisu. 9 planów po 149 zł = 1 341 zł; przy koszcie 1 500 zł trzeba ich min. 11, by przekroczyć tę kwotę (przy braku innych przychodów). Cena i koszty netto, bez VAT i opłat operatorów płatności, zależnie od podatków i umów. W pierwszych miesiącach dopuszczać **0 zł przychodów**.

### Budżet orientacyjny — do doprecyzowania ofertami

- Hosting/aplikacja/baza/poczta/analityka: **100–500 zł/mies.** przy niewielkim ruchu, bez gwarancji cen i przy możliwych opłatach walutowych. Gdy produkcja komercyjna, nie opierać się bezrefleksyjnie na darmowym planie z usypianiem lub bez backupów (Supabase Free obecnie ma ograniczenia i pauzowanie nieaktywnych projektów) [S13].
- Techniczny monitoring i aktualizacje: **150–500 zł/mies.** przy mocnej automatyzacji lub sporadycznych zleceniach.
- Redakcja/weryfikacja i moderacja: **400–1 500 zł/mies.** zależnie od liczby materiałów i zgłoszeń; **właściciel nie powinien być redaktorem operacyjnym**.
- Narzędzia AI / agenci / jednorazowe prace Claude Code: oddzielny, monitorowany budżet, zależny od planu rozliczenia i zadań; nie przyjmować, że są bezkosztowe.
- Opracowanie regulaminu, polityk, kwestii marki, konfiguracja płatności, ewentualna pomoc prawna i księgowa: **koszty jednorazowe do wyceny**, poza miesięcznymi scenariuszami.
- Płatne pozyskiwanie: **0 zł na start**, ewentualnie osobny ograniczony test po ustaleniu KPI.

## 8. Model operacyjny niskiego zaangażowania

**Właściciel**: zatwierdza F0 (domenę i markę), premierę i budżet, raz w tygodniu sprawdza dashboard i wyjątki. **Nie** poprawia opisów ani nie odpowiada na pytania o dostępność usług.

**Automatyzacja (bezpieczne zadania):**

- co tydzień: raport GSC (jeśli dostępny), analityka (agregaty), 404/5xx, brak indeksacji, nowe zgłoszenia, kliknięcia kontaktowe, koszty, alerty;
- codziennie: sprawdzanie błędów build/deploy, status formularzy i limitów, kolejka spamu;
- po zgłoszeniu firmy: walidacja pól, deduplikacja, wysyłka potwierdzenia e-mail, utworzenie wersji roboczej, kolejka do akceptacji;
- co miesiąc: wykrycie profili bez aktualizacji, prośba o potwierdzenie do **już zarejestrowanych podmiotów** z prawidłowym kanałem/zgodami;
- przy artykule: AI brief i draft do kolejki, sprawdzenie oryginalności i źródeł przez redaktora, publikacja dopiero po zatwierdzeniu;
- przy płatności: webhook weryfikowany podpisem, nadanie widoczności sponsorowanej, odnowienie/anulowanie zgodnie z regulaminem — dopiero po uruchomieniu P1;
- w alertach tylko odstępstwa: wyciek, błąd płatności, wezwanie prawne, spadek indeksacji, przekroczony budżet.

**Nie automatyzować bez kontroli:** rozstrzygania sporów, oceniania jakości usługodawców, zaleceń zdrowotnych, publikacji niezweryfikowanych godzin dyżurów, usuwania negatywnych informacji, generowania recenzji, masowych e-maili sprzedażowych.

### Obowiązkowe operacje SEO i Social Media (P0, od pierwszej fazy)

- **SEO agent (`zoo24-seo`)** ma prowadzić dwie kolejki: odzyskanie wartościowego ruchu ze starych URL/zapytań (w tym zapytań produktowych przy zachowaniu realnej intencji) oraz rozwój widoczności katalogu i poradników. Działa na wyeksportowanych danych GSC/GA4, wdraża plan redirectów przez build agenta **po akceptacji**, kontroluje indeksację, linkowanie i wpływ zmian. Nie tworzy strony produktu ani tysięcy cienkich tekstów.
- **Social agent (`zoo24-social`)** prowadzi operacyjnie Facebooka i Instagrama: audyt aktualnych kont, relaunch komunikacji „ZOO24 wraca jako poradnik i katalog”, osobne formaty FB/IG, kalendarz 14 dni, copy, kreacje z prawami do publikacji, UTM, harmonogram zatwierdzeń, przegląd komentarzy do odpowiedzi redaktora i analizę wyników. Docelowa częstotliwość testowa 2–3 posty/tydzień/kanał, dostosowana do Insightów, bez spamowania.
- **Analytics agent (`zoo24-analytics`)** odróżnia 100k+ historycznie od dzisiejszego ruchu; raportuje GSC `clicks`, GA4 `sessions`, Meta `reach`, `link_clicks` oraz rzeczywiste wejścia social, osobno i bez wymyślonych zer. Śledzi `article_to_directory`, `business_outbound`, `affiliate_outbound` i przychód.
- **Scheduler i monitoring** powstają jako kod/konfiguracja w F1 na mockach, a po zgodzie i prawidłowej integracji z Meta/Google działają jako odrębne, monitorowane zadania automatyczne. Sam Claude Code **nie** prowadzi kont po zamknięciu sesji.
- **Batch approval właściciela:** docelowo raz na 14 dni zatwierdzenie kalendarza i raz w tygodniu zbiorczy raport; materiały, prawa do zdjęć, komunikaty o zdrowiu, treści sponsorowane, spory i wątpliwe fakty muszą mieć kontrolę człowieka. Po starcie potrzebna może być rola zewnętrznego redaktora/moderatora.

Szczegółowy workflow, zakres autonomii, koszty i testy: `docs/SEO_SOCIAL_RECOVERY.md` oraz `docs/AUTOMATION_RUNBOOK.md`. **F0/F1 nie są skończone**, jeśli nie powstały prototypy SEO recovery, kalendarza social, approvalu i raportowania.

### Przykładowy rytm tygodniowy (po stabilizacji)

| Kto | Co | Czas/docelowo |
|---|---|---|
| System | Pomiar, backup, alerty, weryfikacja techniczna | Automatycznie |
| Zewnętrzny moderator/redaktor | Nowe zgłoszenia i błędy, źródła, 1–2 aktualizacje treści/mies. | Orientacyjnie 2–6 godz./mies., rośnie z wolumenem |
| Właściciel | 10-min raport wyników i wyjątków, decyzja sponsor/budżet | 30–60 min/tydzień |
| Ekspert prawny/branżowy | Ocena nowych ryzyk / treści specjalistycznych | Zlecane tylko w razie potrzeby |

**SLA:** zgłoszenie błędu/usunięcia profilu potwierdzane automatycznie natychmiast, do oceny przez człowieka w ustawionym terminie (domyślnie 3 dni robocze). Skargi prawne nie mogą czekać w zwykłej kolejce marketingowej.

## 9. Architektura techniczna — preferencja MVP

### Technologia

- **Frontend/backend:** Next.js z App Router + TypeScript + Tailwind CSS; serwerowe renderowanie stron indeksowalnych, komponenty dostępne z klawiatury.
- **Baza i logowanie:** PostgreSQL + Supabase (Auth jedynie dla admina i firm, RLS, dostęp do sekretów po stronie serwera, storage tylko na materiały z licencją). Wybór wersji i pakietów po sprawdzeniu aktualnej stabilności oraz licencji.
- **Hosting:** Vercel lub równoważny dostawca z preview deployments, SSL i monitoringiem; pilnować zgodności planu z komercyjnym użyciem i rozliczeniami.
- **E-mail transakcyjny:** dostawca z weryfikacją domeny, SPF/DKIM/DMARC, limitami i logami; nie służy do cold outreach.
- **Analityka:** lekkie agregaty po stronie serwera / rozwiązanie minimalizujące tracking; nie zakładać, że „cookieless” automatycznie usuwa wszystkie obowiązki informacyjne. GA4 tylko po prawidłowym wdrożeniu zgód, jeśli wymagane.
- **Antyspam:** rate limiting, honeypot, ewentualnie Turnstile/captcha z przeglądem prywatności; walidacja schematem (np. Zod).
- **Płatności P1:** Stripe Billing / lokalny operator wybrany po sprawdzeniu warunków B2B i fakturowania; żadnych tajnych kluczy w repo. **Nie w P0.**
- **Mapa:** nieobowiązkowa w MVP — link „Otwórz trasę” bez osadzania płatnych map; jeśli później OSM, osobny przegląd licencji i źródła map.

### Podział kodu (propozycja)

```text
app/
  (public)/
  admin/
  api/
components/
  directory/  editorial/  forms/  ui/
lib/
  db/  validation/  seo/  analytics/  auth/
content/                 # tylko gdy przyjęte MDX; nie dublować CMS
supabase/migrations/
tests/unit/
tests/integration/
tests/e2e/
docs/
  architecture.md
  seo-migration.csv
  decisions.md
  compliance-checklist.md
scripts/
```

### Minimalny schemat danych

| Tabela | Najważniejsze kolumny | Uwaga |
|---|---|---|
| `categories` | `id`, `slug`, `name`, `public_enabled` | Od początku tylko 2 aktywne kategorie |
| `cities` | `id`, `slug`, `name`, `public_enabled` | Nie indeksować pustych kombinacji |
| `businesses` | `id`, `slug`, `name`, `category_id`, `city_id`, `address_text`, `service_area`, `website_url`, `phone_public`, `description`, `status`, `source_url`, `checked_at`, `claimed_by`, `created_at`, `updated_at` | Publiczny SELECT wyłącznie `published`; adres nie zawsze obowiązkowy dla mobilnych usług |
| `business_features` | `business_id`, `key`, `value`, `source_url`, `checked_at` | Fakty wyspecjalizowane, nie zgadywać |
| `business_sources` | `id`, `business_id`, `url`, `source_type`, `verified_at`, `verification_note` | Audyt danych |
| `provider_accounts` | `user_id`, `business_id`, `role`, `verified_at` | Role/ownership i dostęp firmy |
| `submissions` | `id`, `kind`, `payload`, `status`, `submitted_at`, `processed_at`, `reason` | Wersjonowana kolejka, ukryta dla publiczności |
| `articles` | `id`, `slug`, `title`, `summary`, `body`, `author_display`, `reviewed_by`, `status`, `published_at`, `updated_at`, `sources`, `disclosure` | Wersja robocza vs opublikowana |
| `url_redirects` | `old_path`, `new_path`, `status_code`, `reason`, `approved_at` | Tylko 301 potwierdzone semantycznie |
| `audit_log` | `id`, `actor_id`, `entity_type`, `entity_id`, `action`, `timestamp`, `metadata` | Bez sekretów i niepotrzebnego PII |
| `directory_events_daily` | `day`, `business_id`, `event_type`, `count` | Agregaty, ograniczać identyfikatory użytkowników |
| `subscriptions` (P1) | `business_id`, `plan`, `payment_provider_id`, `status`, `starts_at`, `ends_at` | Dostęp admina/serwera, brak danych karty |

**RLS i bezpieczeństwo:** publicznie widoczne tylko opublikowane treści i publiczne pola; firma może edytować wyłącznie przypisany profil i wprowadza zmiany przez `pending`; admin zatwierdza; nie eksponować identyfikatorów zgłaszających, adresów e-mail adminów, tokenów, źródeł prywatnych; backend nie ufa roli od klienta. Wszystkie formularze walidowane serwerowo, CSRF i ograniczenia zapytań, bezpieczna obsługa uploadu, ścisłe typowanie, CSP i nagłówki ochronne, trzymanie sekretów poza repozytorium.

### Kontrakt operacyjny i obserwowalność

- Zdarzenia: `directory_search`, `business_profile_view`, `business_site_outbound`, `business_phone_outbound`, `submission_created`, `submission_approved`, `article_service_click`, `sponsored_impression` (P1).
- Pomiary **agregowane** (bez profilowania konsumenta i historii zdrowotnej zwierząt). Skrypty analityczne i piksele reklamowe tylko po ocenie prawnej.
- Monitoring: uptime, 4xx/5xx, formularz end-to-end, backup/restore, koszty usług, alert o nieskutecznym cron i podejrzanych logowaniach.
- Wersje i migracje DB pod kontrolą, środowiska `local/staging/production`, test rollbacku; sekretów nie drukować w logach.
- Każdy cron idempotentny, rate-limit i retry z backoff, manual override.

### Testy wymagane

- Unit: normalizacja slugów, walidacja numerów/URL, statusów i danych, serwis rankingowy neutralny, reguły reklam.
- Integration: RLS, brak publicznego dostępu do `submissions`, moderacja, wysyłka potwierdzenia, redirect mapping, raportowania eventów.
- E2E: szukam groomera w Warszawie -> profil -> link; firma zgłasza zmianę -> jest prywatna -> admin zatwierdza -> widoczna; usunięty rekord 404; pusty katalog `noindex`; sponsor nie może podszywać się pod rating.
- SEO: sitemap tylko strony publikowane, kanonikalne URL, hreflang niepotrzebny przy pojedynczej wersji pl-PL, JSON-LD zgodny z widoczną treścią, 301/404/410, meta robots.
- UX: mobile 360 px, tab/Enter, kontrast, kluczowe standardy WCAG 2.2 AA jako cel, brak przesunięć CTA.
- NFR cele weryfikacyjne: LCP <=2,5 s, CLS <=0,1 i INP <=200 ms w dobrych warunkach pomiarowych; to cele, nie obietnice uzyskania w każdych warunkach. Lighthouse mobile Performance >=85 i Accessibility >=90 przy danych testowych, raport wyników.

## 10. Compliance: czerwone linie i punkty kontrolne

**To lista ryzyk do przeglądu przez prawnika, a nie opinia prawna.**

1. **Weterynaria:** art. 29 ustawy ogranicza reklamowanie zakładów leczniczych dla zwierząt; nie proponować im wyróżnień, sponsorowanych poleceń lub rankingów do czasu formalnej oceny [S10].
2. **Marketing elektroniczny:** art. 398 Prawa komunikacji elektronicznej reguluje wymaganie uprzedniej zgody na informacje handlowe/marketing bezpośredni przez urządzenia końcowe. Nie budować masowej wysyłki do firm z publicznych adresów e-mail ani automatycznego cold outreach [S14].
3. **RODO:** minimalizacja, obowiązki informacyjne, polityka retencji, podstawy przetwarzania dla danych osób fizycznych prowadzących usługi i osób zgłaszających; umowy powierzenia dla dostawców, obsługa żądań dostępu/usuń/sprostuj.
4. **Cookies/ePrivacy:** sprawdzić, co wymaga zgody dla zastosowanej analityki i integracji; nie udawać, że zgoda jest zbędna, jeżeli używa się technologii marketingowych.
5. **Reklama:** jawnie oznaczać płatne wyróżnienia i linki afiliacyjne, opisać zasady kolejności wyników [S11].
6. **Opinie:** dopóki nie ma rozwiązania do weryfikacji i moderacji, nie publikować ocen ani opinii. UOKiK wymaga transparentności metod ich weryfikowania i zakazuje fałszywego podwyższania ocen [S15].
7. **Treści użytkowników / DSA:** formularze profili i inne treści zgłaszane przez firmy mogą uruchamiać określone obowiązki dla usług pośrednich; prawnik ocenia kwalifikację i procedurę zgłoszeń, kontakt, moderację, regulamin [S16].
8. **Zdjęcia, logo, dane historyczne:** nie kopiować cudzych recenzji, zdjęć, znaków, starych baz klientów. Domenę można posiadać, niekoniecznie prawa do całego dorobku pod dawną marką.
9. **Bezpieczeństwo użytkownika:** nie wprowadzać w błąd, że usługi są zawsze otwarte „24h”; `zoo24` to nazwa serwisu, nie gwarancja czasu dostępności.
10. **Prawo konsumenckie/B2B i podatki:** umowa abonamentu i rezygnacji, reklamacje, faktury, VAT, odpowiedzialność serwisu za sponsorów — ocena przed uruchomieniem płatności.

## 11. Plan wdrożenia: etapy i bramki

**F0 — Discovery i zabezpieczenie domeny (1–2 tygodnie; bez publikacji)**
- GSC, analityka i aktywa; raport migracji i ryzyk marki; desk research fraz/konkurentów; kontakt z 5–10 usługodawcami legalnym kanałem, ewentualnie wywiady operatora z realną zgodą.
- Deliverables: `docs/discovery.md`, `docs/seo-migration.csv`, `docs/decisions.md`, `docs/risk-register.md`.
- **Gate G0:** właściciel zatwierdza: domena/marka, dwa miasta + dwie kategorie, maksymalny budżet miesięczny, odpowiedzialny za treści i prawne dokumenty. Gdy danych brak — budować prototyp na **mock data** bez domeny.

**F1 — Prototyp i fundament (1–2 tygodnie pracy wykonawczej)**
- Scaffold Next.js + TypeScript, bazowe komponenty, 4 typy strony, schemat bazy i RLS, prototyp admina na dev danych, CI/lint/testy, staging z autoryzacją i `noindex`.
- Deliverables: lokalna aplikacja, testy, README i env.example bez sekretów, przykładowe syntetyczne rekordy z oznaczeniem `DEMO`.
- **Gate G1:** właściciel ogląda podgląd i akceptuje kierunek UX; nie przełączać DNS.

**F2 — MVP z prawdziwymi treściami (następne 2–4 tygodnie, zależnie od dostępności danych/redaktora)**
- 30–40 realnych, legalnie pozyskanych profili; potwierdzenie danych; 6–8 sprawdzonych poradników; formularze i moderacja; SEO; migracja URL, monitoring.
- **Gate G2:** przejście checklist bezpieczeństwa, SEO, prawno-redakcyjnej, testów; kopia i plan rollbacku; podpisana zgoda właściciela na deploy produkcyjny.

**F3 — Publikacja i sprawdzenie rynku (pierwsze 90 dni po premierze)**
- GSC, pomiar kontaktów, dystrybucja przez firmy, 1–2 poradniki/mies., zbieranie zgłoszeń. Test płatnego zainteresowania jeszcze bez automatycznego billing.
- **Gate G3:** co najmniej kilka rzeczywistych zapytań/kliknięć, sensowna jakość indeksacji i zainteresowanie firm. Jeśli nie ma — nie zwiększać wolumenu stron.

**F4 — Monetyzacja subskrypcji (po walidacji)**
- Dokumenty B2B, checkout, fakturowanie i webhook, sponsorowana karta, historia płatności; test 3 prawdziwych płatności i rezygnacji.
- **Gate G4:** dopiero wtedy uruchomić powtarzalne płatne plany. Rozszerzać geografie po kontroli jakości i retencji.

### Ryzyka projektu i reakcje

| Ryzyko | Skutek | Mitigacja / stop condition |
|---|---|---|
| Stare SEO prawie bez ruchu | Wolny start | Budżet na 6–12 mies. testu, mały MVP, nie obiecywać zarobków |
| Niska konwersja firm na abonament | Nie ma przychodu | Sprzedaż pilota przed pełnym billing; zmienić ofertę lub zaprzestać rozwoju |
| Nieaktualne wizytówki | Utrata zaufania, skargi | `checked_at`, kolejka moderacji, oznaczenie niepewności, usuwanie po audycie |
| Zbyt wiele miast i opisów AI | Thin content / problemy SEO | Nie publikować bez unikalnego wkładu i podaży; limity indexability |
| Problemy prawne | Kary i koszty | Legal review, brak wet premium/recenzji/leadow w MVP |
| Obietnica 100% pasywności | Zaległa moderacja | Outsource moderator i tygodniowy dashboard; limit liczby zgłoszeń |
| Vendor lock-in i koszty | Rosnący OPEX | Standaryzowany SQL, export danych, alerty billing, rozdział lokal/staging/prod |
| Niejawny sponsor | Ryzyko prawne i reputacyjne | Widoczne oznaczenie, log zasad sortowania, testy UI |

## 12. KPI, mierzenie sukcesu i podejmowanie decyzji

### Definicje

- `Organic clicks`: rzeczywiste kliknięcia z wyszukiwarki mierzone GSC, nie „widoczność” szacowana na podstawie liczby opublikowanych stron.
- `Historical organic`: dawne deklarowane 100 000+ wejść/mies. osobno, jako niezweryfikowany benchmark; **nie** porównywać mechanicznie z obecnym `GSC clicks`.
- `Recovery baseline`: ostatnie 28 pełnych dni odczytów GSC/GA4; osobno kliknięcia na zachowane/przekierowane dawne URL i na nowe materiały.
- `Social`: odrębnie aktualni obserwujący, zasięg/zaangażowanie FB i IG, kliknięcia Meta oraz sesje i konwersje w GA4 z UTM; nigdy nie traktować liczby fanów jak liczby aktywnych odbiorców.
- `Approved social cadence`: odsetek zaplanowanych publikacji z udokumentowaną zgodą i licencją; 100% wymagane przed produkcją. `Publication reliability`: brak duplikatów i nieautoryzowanych publikacji.
- `Qualified outbound`: klik `tel:` lub wyjście na własną stronę usługodawcy (przybliżenie zainteresowania, nie potwierdzona rezerwacja).
- `Outreach-approved claims`: zatwierdzone zgłoszenie/profil firmy, bez ręcznego wpisywania przez właściciela.
- `Paying providers`: aktywni płacący w rozliczonym miesiącu; osobno trial i przychody netto po zwrotach.
- `Stale profile rate`: udział opublikowanych wizytówek bez sprawdzenia >180 dni.
- `Owner hours`: rzeczywisty czas poświęcony przez właściciela, w tygodniu/miesiącu.

### Hipotezy / cele operacyjne (nie obietnice)

| Kiedy | Co mierzymy | Próg oceny |
|---|---|---|
| Przed uruchomieniem | Minimum podaży i jakości | 30–40 realnych profili + 6–8 zatwierdzonych poradników; 100% rekordów z datą i źródłem |
| 30 dni od publikacji | Indeksacja i działanie | Brak krytycznych błędów, główne landingi obecne w indeksie albo diagnoza przyczyn, tracking działa |
| 30 dni od publikacji | SEO recovery i social relaunch | Zatwierdzona mapa TOP 100 ważnych URL, pomiar 28-dniowego baseline'u, legalny relaunch kont, pierwszy kalendarz postów; jeśli brak dostępów — status N/A i wskazane blokery |
| 90 dni | Ruch i realne akcje | >0 kwalifikowanych kliknięć i zgłoszeń firm; przy braku sygnałów ocena kanałów, nie skalować mechanicznie |
| 90 dni | Kierunek odbudowy widoczności | Mierzalna zmiana traffic-u starych/nowych stron i FB/IG względem bieżącego baseline'u, realne kliknięcia do katalogu lub uzasadniona zmiana strategii; bez obietnicy powrotu do 100k/mies. |
| 6 miesięcy | Weryfikacja sprzedaży | 3 płatne pilotaże lub pisemny wniosek o niepowodzeniu oferty |
| 12 miesięcy | Powtarzalność i efektywność | Analiza MRR/churn, kosztów i czasu właściciela; możliwość dojścia do dodatniego salda, nie gwarancja |
| Stale | Świeżość | <10% aktywnych profili przeterminowanych (>180 dni) lub automatyczne flagowanie i wstrzymanie ekspozycji |

**Reguła kill/pivot:** jeżeli po 6 miesiącach jest 0 płacących firm oraz brak sensownego wzrostu kwalifikowanych kliknięć, zamrozić nowe funkcje, ocenić SEO i popyt, rozważyć alternatywę afiliacyjną, dzierżawę domeny albo sprzedaż serwisu. Nie inwestować „jeszcze jednego kwartału” bez hipotezy i miary.

### Tygodniowy raport właściciela (maks. 1 ekran)

```text
ZOO24 — tydzień YYYY-WW (rzeczywiste dane lub N/A)
Historyczne SEO: 100k+/mies. wg właściciela (benchmark, nie obecny wynik)
GSC organic clicks (28 dni): X | GA4 organic sessions: X | powrót na dawne URL: X
SEO recovery: top wygrane/przegrane stare URL | przekierowania do zatwierdzenia: X
Facebook: reach X | link clicks X | sessions FB X
Instagram: reach X | link clicks X | sessions IG X
Social: opublikowano X/Y zatwierdzonych | kalendarz 14 dni: do akceptacji/OK
Qualified business outbound: X | Affiliate outbound: X
Claimed profiles: X | Paying providers: X | MRR netto: X zł
Costs this month: X zł | Rights/content incidents: X | Technical incidents: X
Czas właściciela: X min | Decyzje do zatwierdzenia (maks. 3): [...]
Rekomendacja: utrzymać / poprawić / zatrzymać + mierzalne uzasadnienie
```

## 13. Backlog techniczny dla agentów — gotowy do wykonania

**Protokół:** każde zadanie ma własną gałąź, krótki opis, kryteria akceptacji, testy, pliki zmienione i raport ryzyka. Najpierw badanie repo i spis założeń. Nie stosować niekontrolowanych równoległych zapisów do tych samych plików.

| ID | Priorytet | Zadanie | Zależność | Akceptacja |
|---|---|---|---|---|
| D-01 | P0 | Audyt zasobów domeny / danych GSC i praw do treści (tylko po dostępie) | brak | `discovery.md`, ryzyka, brak domysłów |
| D-02 | P0 | Analiza klastra fraz, konkurencji i wyboru miast | brak | `market-validation.md`, założenia z oznaczonym źródłem |
| A-01 | P0 | ADR stacku i repo scaffold | D-01 opcjonalny | `architecture.md`, uruchamialny dev server |
| A-02 | P0 | PostgreSQL schema, migrations, RLS, seed demo | A-01 | Testy dostępu public/provider/admin |
| UX-01 | P0 | Design system i responsywne layouty | A-01 | 360px, keyboard/contrast |
| FE-01 | P0 | Strona główna + kategorie + miasto + filtr | UX-01, A-02 | Realne query i sensowne empty states |
| FE-02 | P0 | Profil usługi, akcje tel/WWW i znacznik źródła | FE-01 | Bez fałszywych danych i ratings |
| FE-03 | P0 | Poradniki + cross-linking katalog | A-01 | Autor, źródła, data, disclaimer |
| BE-01 | P0 | Zgłaszanie / claim, e-mail potwierdzający, antyspam | A-02 | Niepubliczna kolejka, statusy, test spam |
| BE-02 | P0 | Moderacja, audyt, uprawnienia, edycje | BE-01 | Żaden niezatwierdzony profil publiczny |
| SEO-01 | P0 | Metadane, sitemap, schema, index rules | FE-01–03 | Automatyczne SEO tests |
| SEO-02 | P0 | Mapa przekierowań starego serwisu + scenariusze 404/410 | D-01 | 301 tylko na relewantny URL; brak redirect-to-home |
| SEO-REC-01 | P0 | Inwentarz TOP 100 historycznych URL według kliknięć oraz TOP 100 według linków (jeśli dane) | D-01; mock w F1 | Eksport z datą/źródłem, 200/relewantne 301/404/410; brak fikcyjnego mappingu |
| SEO-REC-02 | P0 | SEO Operations: checker URL/indeksacji/canonical, kolejka akceptacji redirectów i raport | A-01, SEO-02 | Mock F1, testy brak redirect-to-home, pętli, 301->404; bez zmian na domenie |
| SEO-REC-03 | P0 | Redakcyjna strategia odbudowy starych zapytań (poradnik/porównanie/afiliacja) | D-01, CT-01 | Mapa intencji, unikalność, prawa do treści, brak masowych kart produktów |
| SOCIAL-01 | P0 | Audyt istniejących oficjalnych kont FB + Instagram i brief relaunchu | D-01 lub checklista bez danych | Liczby historyczne odrębnie, obecny odczyt albo N/A, własność/prawa/wymagane role |
| SOCIAL-02 | P0 | Social Operations: kalendarz 14 dni, drafty FB/IG, approval, mock scheduler | A-01, A-02, SOCIAL-01 | Stany `draft -> needs_review -> approved -> scheduled -> published/failed`, nigdy autopost draftu |
| SOCIAL-03 | P0 | UTM, rights register, 1-click pause, retry/idempotency, mock Meta API | SOCIAL-02, OPS-02 | Brak sekretów i postów live w F1; brak duplikatów po retry; log audytu |
| DATA-01 | P0 | Zintegrowany raport SEO recovery / nowego SEO / FB / IG / kliknięć do firm | OPS-02 | Rzeczywisty baseline 28d albo N/A, rozdzielenie GSC clicks i GA4 sessions |
| QA-SEO-SOC | P0 | Testy SEO recovery i bezpiecznej publikacji social | SEO-REC-02, SOCIAL-03, DATA-01 | Tylko zatwierdzone wpisy; brak pętli/soft-404; pause działa; brak fikcyjnych KPI |
| OPS-01 | P0 | CI, tests, preview, backup/logging, alerting | A-01 | Build/test/lint, sekretów brak w repo |
| OPS-02 | P0 | Minimalna analityka agregowana i dashboard | FE-02 | Zlicza wyjścia bez niepotrzebnego PII |
| CON-01 | P0 | Projekt polityk + checklist zgodności do zewn. prawnika | D-01 | Oznaczone pola do uzupełnienia, nie fikcyjne dane firmy |
| CT-01 | P0 | Plan redakcyjny i 6–8 draftów do kontroli | D-02 | Źródła i status „pending”, nie autopublikowane |
| QA-01 | P0 | Accessibility, security, e2e smoke, SEO checks | FE/BE/SEO | Raport QA + weryfikacja krytycznych luk |
| G-01 | P1 | Pozyskanie firm przez formularze, partner kits | BE-01 | Materiały dystrybucyjne zgodne z prawem |
| PAY-01 | P1 | Walidacja willingness-to-pay i oferta | G-01 | 2 deklaracje testu płatnego |
| PAY-02 | P1 | Rozliczenia B2B i sponsorowane moduły | PAY-01 + legal | test webhook, cancellation, disclosure |

### Akceptacja jakości produktu (Definition of Done dla każdej funkcji)

- Działa lokalnie i na stagingu z przykładowymi danymi, a produkcja nie jest zmieniana bez zgody.
- Ma test jednostkowy/integracyjny/e2e zgodny z ryzykiem i przechodzi typecheck/lint.
- Ma polskie teksty, czytelne komunikaty błędów, działa na telefonie i klawiaturze.
- Nie utrwala cudzych danych osobowych bez podstawy, nie loguje sekretów.
- Nie tworzy indeksowalnych stron bez wartości, nie sugeruje danych niepotwierdzonych.
- W raporcie zadania zapisano: decyzje, pliki, testy, znane ryzyka i następne kroki.

## 14. Instrukcja orkiestracji Claude Code

W przekazanym pakiecie znajduje się krótkie `CLAUDE.md` i wyspecjalizowani agenci w `.claude/agents/`. Plik ten (`docs/MASTER_PLAN.md`) to źródło strategii i wymagań. **Agenci są konfiguracjami do wywołania w Claude Code, nie działają sami bez uruchomionej sesji Claude Code.**

### Podział odpowiedzialności

| Agent | Rola | Artefakt |
|---|---|---|
| `zoo24-product` | strategia, zakres, acceptance, priorytety | `docs/decisions.md`, aktualizacje backlogu |
| `zoo24-seo` | właściciel ciągłego SEO recovery + nowe SEO, treści i bezpieczna migracja URL | `docs/audits/`, `docs/seo/`, URL map i tygodniowy raport |
| `zoo24-social` | AI Social Media Manager FB i IG: relaunch, copy, kreacje, kalendarz, monitoring, raporty | `docs/social/`, kalendarz 14 dni i kolejka zatwierdzeń |
| `zoo24-analytics` | baseline historyczny/bieżący, pomiar SEO+Meta i atrybucja | `docs/audits/`, 28-dniowy dashboard oraz wnioski bez wymyślonych danych |
| `zoo24-architect` | model danych, stack, bezpieczeństwo projektowe | `docs/architecture.md`, ADR, migracje jako propozycja |
| `zoo24-builder` | implementacja MVP | kod, testy, README, staging |
| `zoo24-qa` | review, bezpieczeństwo, dostępność, testy | `docs/qa-report.md` |
| `zoo24-growth` | acquisition, monetyzacja, niska obsługowość | `docs/growth-experiments.md`, raport KPI |
| `zoo24-compliance` | checklista ryzyk, a nie wiążąca porada prawna | `docs/compliance-review.md` |

### Reguły równoległości

1. **Równolegle przy rozłącznych plikach:** product, SEO, social, analytics, compliance i growth mogą przygotować niezależne analizy; agent social/SEO zapisują tylko własne materiały, nie zmieniają kodu. Realne integracje wykonuje builder po review.
2. **Po decyzji architekta:** builder implementuje jeden moduł na raz (serwis, SEO Operations, Social Operations), bez równoczesnych edycji schematu danych, routingu ani tych samych UI components.
3. **Po każdej fazie:** QA kontroluje kod, SEO sprawdza metadane/URL, social sprawdza kolejkę/permissions, analytics raportuje faktyczne dane, compliance ocenia wpływ nowego zakresu. Orkiestrator aktualizuje `docs/STATUS.md`.
4. **Gdy blokada:** zapisać decyzję/wyjaśnienie i użyć bezpiecznego mocka; zatrzymać tylko wątek wymagający praw/sekretów/płatności/deployu. Nie pytać właściciela o każdą kosmetyczną preferencję.
5. **Koszt agentów:** unikać wysyłania wszystkim całego repo i nie uruchamiać niekończących się pętli; maks. 2–3 agenci równolegli do researchu, jeden właściciel danego pliku kodu.

### Twarde zakazy dla agentów

- NIE publikować na zoo24.pl, zmieniać DNS, podpisywać umów ani uruchamiać płatności bez wyraźnej zgody.
- NIE wykonywać outbound e-mail do osób trzecich, nie scrapować Google Maps/konkurencyjnych katalogów, nie masowo pozyskiwać danych osobowych.
- NIE importować byłych klientów sklepu lub ich danych kontaktowych.
- NIE używać fikcyjnych „realnych” firm, adresów, ocen i zdjęć; demo ma być oznaczone „DEMO” i nieindeksowane.
- NIE publikować zdrowotnych porad AI bez właściwej kontroli.
- NIE automatyzować claimowania wizytówek bez weryfikacji własności firmy.
- NIE dodawać sponsorowanych profili weterynaryjnych, ukrytych reklam, fikcyjnych rankingów.
- NIE aktywować produkcyjnych planów narzędzi ani tworzyć płatnych zasobów bez limitu budżetu.

### Pierwsze polecenie dla Claude Code (skopiuj w całości)

```text
Pracujesz nad ZOO24.pl. Najpierw przeczytaj: ./CLAUDE.md, ./docs/MASTER_PLAN.md, ./docs/SEO_SOCIAL_RECOVERY.md, ./docs/AUTOMATION_RUNBOOK.md i ./docs/STATUS.md. Twoja misja to zbudować niskoobsługowy katalog usług i poradników, ale OD PIERWSZEJ FAZY równie ważne są odzyskiwanie ruchu SEO dawnego sklepu oraz reaktywacja oficjalnych profili Facebook i Instagram.

Dane wejściowe od właściciela: stary sklep osiągał historycznie ponad 100 000 wejść organicznych miesięcznie i miał kilkanaście tysięcy obserwujących na Facebooku i Instagramie. To DANE HISTORYCZNE I NIEZWERYFIKOWANE aktualnie. Nie traktuj ich jako dzisiejszego ruchu, gwarancji odzyskania, celu w 90 dni ani dowodu wpływu na sprzedaż. Najpierw odróżnij historyczny benchmark od obecnego 28-dniowego baseline'u na podstawie GSC, GA4 i Meta Insights, o ile dostępne. Bez źródeł zapisuj N/A.

Wywołaj równolegle tam, gdzie nie konfliktują pliki, role zoo24-product, zoo24-seo, zoo24-social, zoo24-analytics, zoo24-growth, zoo24-architect i zoo24-compliance. Zbierz wymagania i ryzyka. Nie wywołuj niekończących się pętli agentów. Następnie użyj zoo24-builder do wdrażania małych, testowalnych modułów, a zoo24-qa do sprawdzania etapów. Jeden agent edytujący na jeden moduł naraz.

Najważniejsze zadania F0:
1) przygotuj audyt historycznych URL i plan zachowaj 200 / odpowiedni 301 / 404 / 410, TOP 100 URL wg dawnych kliknięć i linków, z szablonów i realnych danych (jeśli brak — nie wymyślaj); rozdziel dawne intencje zakupowe i przyszłe lokalne;
2) przygotuj audit własności i parametrów oficjalnych kont FB/IG, komunikat relaunchu bez sugerowania powrotu sklepu, kalendarz 14 dni i 8-12 bezpiecznych draftów, oddzielne copy/CTA/UTM dla platform;
3) przygotuj 28-dniowy dashboard organica, odzyskiwanych URL, social sessions, kliknięć do usługodawców, przychodów, kosztów i listę brakujących dostępów.

Następnie bez zwłoki rozpocznij F1 w lokalnym repo: Next.js/TypeScript + demo danych katalogu i poradników, SEO Operations (plan 301, checker 404/410/canonical/sitemap, kolejka akceptacji), Social Operations (kalendarz, asset/license register, kolejka draft -> review -> approved -> scheduled -> published/failed, adapter Meta MOCK i harmonogram MOCK), analytics/UTM/raport oraz panel 1 ekranu, retry/idempotency, kill switch i testy. Jeśli repo ma już kod, najpierw go obejrzyj. Nie żądaj kont ani sekretów, by zrobić prototyp; przygotuj bezpieczne integracyjne adaptery i checklistę dostępów.

P0 jako warunek ukończenia: istnieje działający prototyp i testy pokazujące, że brak masowych 301 na stronę główną, żadne niezwiązane URL nie są przekierowywane, dane DEMO/staging nie są indeksowane; post bez zgody i praw do materiałów NIE jest publikowany, dwukrotny cron nie robi duplikatów, zatrzymanie scheduler działa, brak tokenów w kodzie/logach, a brak danych daje N/A. Wszelki realny API, DNS, publikacja, płatność, masowa komunikacja i import dawnych klientów pozostają zablokowane do osobnej, wyraźnej akceptacji właściciela.

Zapisuj postęp i wyniki faktycznie wykonanych testów w docs/STATUS.md. Na koniec pokaż działający lokalny zakres, pliki, testy, raport SEO+social, ryzyka oraz maksymalnie trzy skonsolidowane decyzje właściciela. Nie obiecuj automatycznego prowadzenia mediów przez sam proces Claude Code: kod ma działać cyklicznie dopiero po wdrożeniu schedulera lub zgodnej integracji Meta Business Suite/API.
```

## 15. Co musi dostarczyć właściciel (tylko 3 decyzje na start)

1. **Prawa i odczyt danych:** potwierdzić kontrolę domeny, marki, starych treści/logo i oficjalnych kont FB/IG oraz operatora. Dopuścić odczyt GSC/GA4/Meta Insights tylko przez prawidłowe dostępy lub dostarczyć eksporty (bez haseł i danych klientów).
2. **Budżet i delegowanie:** wybrać maksymalny limit na hosting, analitykę, narzędzie scheduling/Meta API, AI, grafiki, redaktora/moderatora i prawnika. Bez zgody agent przygotowuje bezpłatny lokalny prototyp, nie dokonuje zakupów.
3. **Go/no-go dla rynku i komunikacji:** po F0 zatwierdzić miasta/kategorie, komunikat „ZOO24 wraca”, zasady batch-approval social i testowe przekierowania. Jeśli właściciel nie odpowie, Claude Code może nadal rozwijać staging na demonstracyjnych danych, ale nie publikuje.

**Co oddać właścicielowi po F1:** podgląd działającej witryny, raport 1 strona, 2–3 decyzje. Nie prosić o codzienną redakcję ani ręczne uzupełnienie dziesiątek wizytówek.

## 16. Źródła i daty weryfikacji

Dostęp publiczny i weryfikacja na **22.11.2026**. Są to punkty odniesienia do decyzji — agent ma je ponownie sprawdzić przed opublikowaniem danych, zwłaszcza dynamiczne liczby i prawo.

- **[S1]** Opineo, ZOO24.PL, opinie historyczne: https://www.opineo.pl/opinie/zoo24-pl
- **[S2]** Ceneo, profil sklepu zoo24.pl: https://www.ceneo.pl/sklepy/zoo24.pl-s32962
- **[S3]** Zwierzoklub, katalog firm: https://zwierzoklub.pl/
- **[S4]** Petsy, opiekunowie zwierząt: https://petsy.pl/opiekunowie
- **[S5]** ZPF, badanie wydatków na zwierzęta: https://media.zpf.pl/releases/w-polsce-zyje-ponad-13-5-mln-psow-i-kotow-ile-wydajemy-na-ich-utrzymanie
- **[S6]** Google Search Central, migracje i przekierowania: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- **[S7]** Google Search Central, LocalBusiness structured data i zasady: https://developers.google.com/search/docs/appearance/structured-data/local-business oraz https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- **[S8]** Google Search Central, spam policies / scaled content abuse: https://developers.google.com/search/docs/essentials/spam-policies
- **[S9]** Google Search Central, AI-generated content i people-first: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content oraz https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- **[S10]** Ustawa o zakładach leczniczych dla zwierząt, tekst jednolity (Dz.U. 2026 poz. 1458), art. 29: https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU20260001458
- **[S11]** UOKiK, przejrzyste oznaczanie reklamy / influencer marketing: https://uokik.gov.pl/influencer-marketing
- **[S12]** OSM, ODbL i atrybucja: https://www.openstreetmap.org/copyright/attribution-guide
- **[S13]** Supabase, aktualne warunki i ceny: https://supabase.com/pricing
- **[S14]** Prawo komunikacji elektronicznej, art. 398 (Dz.U. 2024 poz. 1221, ze zmianami): https://api.sejm.gov.pl/eli/acts/DU/2024/1221/text.pdf
- **[S15]** UOKiK, zasady autentyczności opinii: https://uokik.gov.pl/falszywe-opinie-stop
- **[S16]** DSA, zasady dla usług pośrednich: https://digital-strategy.ec.europa.eu/en/policies/digital-services-act
- **[S17]** Oficjalne instrukcje Claude Code: https://code.claude.com/docs/en/sub-agents oraz https://code.claude.com/docs/en/memory

---

### Podsumowanie decyzji

**Budować**: wąski katalog groomerów i hoteli + jakościowe poradniki, przewagę danych, samoobsługę firm, ruch SEO/partnerów, monetyzację jawnych sponsorowanych wizytówek po dowodzie popytu.  
**Nie budować na start**: koszyka, rezerwacji, recenzji, płatnych weterynarzy, masowego scraping-u, 5000 stron AI, aplikacji mobilnej, pośrednictwa w leadach, integracji ubezpieczeń.  
**Miara sukcesu**: realny kontakt użytkownika z firmą, płacące firmy i niski koszt obsługi — a nie liczba stron na stronie.


### Uzupełnienie źródeł dla SEO i Social Media (do ponownej weryfikacji w dniu wdrożenia)

- Google Search Central, przenoszenie URL i unikanie nieadekwatnych redirectów: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Google Search Central, AI generated content (quality/fact-checking): https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- Meta, Facebook Page Feed API i uprawnienia: https://developers.facebook.com/docs/graph-api/reference/page/feed/
- Meta, Instagram API i tryby logowania: https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api oraz https://developers.facebook.com/docs/instagram/platform/instagram-api/changelog/
- Claude Code, subagenci projektu: https://code.claude.com/docs/en/claude-code-on-the-web

