# ZOO24 — audyt obecnej wersji i instrukcja rozwoju portalu V3

**Data obserwacji:** 22 listopada 2026, strefa Europe/Warsaw.  
**Analizowana wersja:** https://zoo24.vercel.app/  
**Docelowa marka i domena:** ZOO24 / zoo24.pl.  
**Przeznaczenie:** dokument do przekazania Claude Code w istniejącym repozytorium.  
**Charakter:** rozszerzenie zakresu produktu o wszystkie główne grupy zwierząt domowych. To propozycja następnego etapu i kryteria odbioru, a nie opis już wykonanych zmian.

## Jak przekazać dokument Claude

Umieść ten plik w głównym katalogu projektu i wklej:

> Przeczytaj ZOO24_AUDYT_I_INSTRUKCJA_ROZWOJU_V3.md oraz istniejący CLAUDE.md i dokumentację projektu. Potraktuj ten dokument jako nowe wymaganie produktowe: rozwijamy ZOO24 w portal wiedzy, narzędzi i usług dla wszystkich głównych grup zwierząt domowych. Najpierw zweryfikuj audyt względem aktualnego kodu i wdrożenia. Następnie uruchom odpowiednich agentów, przygotuj backlog i wykonaj pierwszy pakiet P0/P1 z części II. Kontynuuj do działającej, sprawdzonej wersji podglądowej. Korzystaj z istniejących uprawnień; rutynowe decyzje podejmuj samodzielnie. Raportuj rzeczywiste wyniki, ograniczenia i pozostałe zależności.

Dokument rozszerza wcześniejszy pilotaż groomerów i hoteli dla psów i kotów. Zachowuje kierunek katalog + poradniki, odzyskiwanie SEO i social media oraz cel małego zaangażowania właściciela. Decyzje produktowe o zakresie należy uaktualnić w dokumentacji. Ustalone uprawnienia, ochrona danych i rzeczywiste zasady zatwierdzania publikacji nadal obowiązują.

---

# CZĘŚĆ I. Audyt publicznej wersji

## 1. Wniosek

Obecna wersja jest spójnym wizualnie początkiem katalogu usług. Główna luka względem nowej ambicji dotyczy zakresu i zawartości: publiczny portal poradnikowy nie ma jeszcze artykułów, a nawigacja i komunikacja skupiają się na dwóch usługach dla psów i kotów.

Następny etap powinien dostarczyć trzy rzeczy: strukturę wiedzy według zwierzęcia i potrzeby opiekuna, pierwszą użyteczną zawartość oraz działający proces redakcyjny. Istniejący wygląd, komponenty i mechanikę katalogu można rozwijać.

„Najlepszy portal” jest celem jakościowym. Ten audyt nie jest rankingiem polskich portali ani potwierdzeniem przewagi konkurencyjnej.

## 2. Co faktycznie sprawdzono

Obejrzano w przeglądarce desktopowej stronę główną, poradniki, wyniki groomerów w Warszawie, profil AnimalRoom, pustą kategorię hoteli w Warszawie, formularz dodania firmy, stronę o serwisie i zasady redakcyjne. Sprawdzono wybór filtra „Koty”, przejście do profilu i powrót do wyników.

Dodatkowo odczytano publiczne odpowiedzi HTTP/HTML wybranych stron, robots.txt i sitemap.xml. Nie wysłano zgłoszeń, nie nawiązano kontaktu z firmami i nie zmieniono wdrożenia.

**Ograniczenia:** bez dostępu do repozytorium, CMS, bazy danych, panelu, Search Console, analityki i kont Meta. Brak pełnego audytu mobilnego, pomiarów Core Web Vitals, testów wszystkich formularzy i kontroli faktycznego działania agentów. Publiczne zero poradników nie dowodzi braku szkiców w CMS. Etykieta weryfikacji profilu potwierdza stan interfejsu, nie wykonanie pracy redakcyjnej.

## 3. Mocne strony do zachowania

- Spójna paleta zieleni/petrolu, ciepłego akcentu i jasnego tła, czytelna hierarchia oraz konsekwentne komponenty.
- Widoczna wyszukiwarka usług, opisy pól i rozpoznawalne działania.
- Filtr zwierzęcia zapisuje się w adresie. Powrót z profilu do wyników zachował filtr „Koty”.
- Profil firmy oddziela dane kontaktowe, usługi, obsługiwane zwierzęta, adres i pochodzenie danych.
- Status niepotwierdzonych informacji jest jawny.
- Są zasady redakcyjne, opis wykorzystania AI, dane operatora i ścieżka korekty.
- Treść wybranych stron jest dostępna w HTML, a podstrony mają indywidualne tytuły i canonical.

To podstawa do rozwoju. Nie ma potrzeby wymieniać stosu technologicznego ani odtwarzać od początku całej warstwy wizualnej tylko z powodu rozszerzenia zakresu.

## 4. Obserwacje i ich konsekwencje

| ID | Obserwacja z publicznej wersji | Konsekwencja i zadanie |
|---|---|---|
| A01 | Strona główna przedstawia groomerów i hotele w 10 miastach; opis marki skupia się na opiekunach psów i kotów. | Zmienić architekturę i komunikację na portal zwierząt, wiedzy, narzędzi i usług. |
| A02 | /poradniki pokazuje 0 opublikowanych materiałów; wszystkie tematy mają licznik 0. | Zdiagnozować rzeczywistą przyczynę i doprowadzić do pierwszych pełnych publikacji. |
| A03 | Główne listy pokazują po jednym groomerze w 10 miastach i zero hoteli we wszystkich tych lokalizacjach. | Pogłębić użyteczne obszary katalogu i ograniczyć eksponowanie pustych kombinacji. |
| A04 | Puste lokalizacje hoteli są linkowane ze strony głównej i długiej stopki. | Nawigację oprzeć na dostępnej wartości; pozostawić poprawną obsługę bezpośrednich wejść. |
| A05 | AnimalRoom ma dane niepotwierdzone i opis automatycznego odczytu oczekującego na redakcję. | Doprowadzić weryfikację do końca oraz zachować rozróżnienie źródła, daty odczytu i potwierdzenia. |
| A06 | Inne profile, m.in. Kudłate Historie, Strefa Psa i Kudłatek, mają oznaczenie sprawdzenia i datę 22.11.2026. | Zweryfikować dowody w zapleczu i konsekwentnie stosować proces. |
| A07 | Pusta strona hoteli kieruje m.in. do groomera oraz do pustych poradników. | Proponować alternatywy odpowiadające potrzebie opieki podczas wyjazdu. |
| A08 | Pusta strona zachęca także do zgłoszenia znanej firmy, lecz formularz wymaga bycia właścicielem lub upoważnionym pracownikiem. | Rozdzielić polecenie miejsca od zgłoszenia/przejęcia własnego profilu. |
| A09 | W nawigacji poradników są m.in. rasy psów, rasy kotów i pielęgnacja; brak publicznej struktury innych grup. | Wprowadzić klasyfikację zwierzęcia oraz osobną klasyfikację potrzeb i formatów treści. |
| A10 | Zasady redakcyjne dopuszczają zatwierdzanie części tekstów przez AI. | Uzupełnić proces o kontrolę dobrostanu i realną odpowiedzialność za nową wiedzę gatunkową. |

Adresy dowodowe:

- Strona główna: https://zoo24.vercel.app/
- Poradniki: https://zoo24.vercel.app/poradniki
- Wyniki i filtr: https://zoo24.vercel.app/uslugi/groomer/warszawa?zwierze=koty
- Profil otwarty z wyników: https://zoo24.vercel.app/firma/animalroom-r01?z=zwierze%3Dkoty
- Pusta lokalizacja: https://zoo24.vercel.app/uslugi/hotel-dla-zwierzat/warszawa
- Formularz: https://zoo24.vercel.app/dodaj-firme
- O serwisie: https://zoo24.vercel.app/o-nas
- Polityka redakcyjna: https://zoo24.vercel.app/zasady-redakcyjne

## 5. Środowisko podglądowe i SEO

Na sprawdzonych odpowiedziach zoo24.vercel.app odnotowano nagłówek X-Robots-Tag: noindex, nofollow. robots.txt zawiera zakaz crawlowania całego hosta. Canonical i OG wskazują domenę zoo24.pl. Sitemap ma osiem adresów domeny docelowej i pomija puste lokalizacje, hotele oraz pusty dział poradników.

Wygląda to na konfigurację podglądu. Sam canonical do zoo24.pl lub noindex na podglądzie nie stanowi dowodu błędu.

Do osobnej kontroli pozostaje sposób ochrony preview: robots.txt blokujący odczyt uniemożliwia robotowi przeczytanie noindex. Taka kombinacja nie jest gwarancją usunięcia samego URL z wyników. Claude powinien wybrać spójny mechanizm zgodny z celem: chroniony dostęp do prywatnego preview albo dostępny do odczytu publiczny preview z noindex. Noindex nie zabezpiecza poufnych danych. [G4]

Nie udało się wiarygodnie ocenić zoo24.pl z użytego środowiska: występowały timeouty i odpowiedzi 403. Nie jest to dowód awarii domeny dla zwykłych użytkowników. Wdrożenie docelowe, DNS, indeksację i stare przekierowania należy sprawdzić osobno, korzystając z uprawnionego dostępu.

---

# CZĘŚĆ II. Instrukcja wykonawcza dla Claude Code

## 6. Cel i organizacja pracy

Rozwijaj istniejącą aplikację. Zacznij od CLAUDE.md, wcześniejszego master planu, planu odzyskiwania SEO/social, dokumentów operacyjnych i aktualnej implementacji. Obserwacje w części I są punktem startu; zweryfikuj, które nadal występują.

Wykonaj prace do działającej wersji podglądowej. Wdrażanie produkcyjne i publikacje prowadź w granicach wcześniej udzielonej autoryzacji. Nie proś ponownie o zgodę na rutynowe działania już objęte zakresem. Nowe płatne zobowiązania wymagają ustalenia budżetu; najpierw przygotuj konkretne opcje i uzasadnienie.

Aktualizuj istniejącą dokumentację zamiast tworzyć sprzeczny równoległy plan. Zapisz nowy zakres, decyzje i kryteria odbioru. Nie nadpisuj istniejących instrukcji agentów bez rozpoznania ich roli.

### Role

| Rola | Odpowiedzialność w tym etapie | Wynik |
|---|---|---|
| Koordynator produktu/UX | Nowa architektura, priorytety, powiązania między modułami, integracja pracy | Mapa ekranów i spójne wydanie |
| Budowanie serwisu | Model danych, szablony, nawigacja, wyszukiwarka, narzędzia | Działające funkcje w obecnej aplikacji |
| Baza wiedzy | Dobór źródeł według gatunku, rejestr twierdzeń, aktualność, prawa do materiałów | Pakiety źródeł i lista luk |
| Treści | Briefy, szkice, redakcja, korekty, kolejka do sprawdzenia i publikacji | Pełne materiały z dowodami |
| SEO | Inwentaryzacja starych URL-i, klastry, linkowanie, indeksacja, kontrola produkcji | Mapa odzyskiwania ruchu i raport |
| Pozyskiwanie użytkowników | Pomiar potrzeb, kanały wejścia, współprace, wykorzystanie narzędzi | Eksperymenty i mierzalne wyniki |
| Social media | Adaptacja zatwierdzonych materiałów, kalendarz, odzyskiwanie aktywności | Kolejka postów i wyniki publikacji |
| QA | Niezależna kontrola ścieżek, dostępności, danych i regresji | Raport odbioru z dowodami |

Korzystaj z istniejących agentów operacyjnych; role UX i QA mogą być funkcjami agentów prowadzących/review. Nie muszą działać stale. Przydziel pliki lub odrębne gałęzie i kontroluj konflikty.

## 7. Architektura obejmująca wszystkie główne grupy

Na potrzeby pierwszego zakresu przyjmij zwierzęta towarzyszące utrzymywane w domu, akwarium i terrarium. Model danych ma pozwalać później dodać kolejne grupy. Konie i zwierzęta gospodarskie wymagają osobnego etapu redakcyjnego i decyzji o zakresie.

Zaprojektuj dziesięć wejść:

1. Psy.
2. Koty.
3. Króliki.
4. Gryzonie.
5. Fretki i inne małe ssaki towarzyszące.
6. Ptaki.
7. Ryby i akwarystyka.
8. Gady.
9. Płazy.
10. Bezkręgowce.

To grupy nawigacyjne, a nie jeden poziom klasyfikacji biologicznej. W bazie rozróżnij grupę, gatunek i rasę. Króliki nie należą do gryzoni; aksolotl powinien znaleźć się w płazach. Materiały o poszczególnych gatunkach muszą mieć odrębne wymagania, nawet jeśli korzystają ze wspólnego szablonu.

W gryzoniach przewidź m.in. kawie domowe, chomiki, szczury, myszy, szynszyle, koszatniczki i myszoskoczki. W pozostałych działach rozbudowuj gatunki według dostępności wiarygodnych informacji i rzeczywistego zainteresowania.

Przygotuj pełną architekturę już teraz. Publicznie eksponuj działy z samodzielnie użyteczną zawartością. Strona grupy nie może być wyłącznie tytułem i listą zapowiedzi. Nie twórz indeksowalnych pustych kombinacji gatunku, tematu, miasta i usługi.

### Dwie osie nawigacji

- **Zwierzę:** np. królik, kawia domowa, papuga konkretnego gatunku.
- **Potrzeba:** przygotowanie domu, codzienna opieka, żywienie, zachowanie, środowisko, wyjazd, wyposażenie, koszty, profesjonalna pomoc.

Ten sam artykuł może pojawiać się w kilku zestawieniach, lecz powinien mieć jedną tożsamość i ustalony adres kanoniczny. Zachowuj wartościowe istniejące adresy artykułów.

## 8. Nowa strona główna

Zachowaj czytelność i spójność obecnej oprawy. Przebuduj hierarchię treści w kierunku portalu.

Proponowana kolejność:

1. Krótkie przedstawienie wartości: „Zrozum swojego zwierzaka. Zadbaj o niego lepiej”.
2. Wyszukiwarka wiedzy i zwierząt z przykładami rzeczywistych zapytań.
3. Wybór grupy zwierząt w czytelnej siatce.
4. Materiały dla osób przygotowujących się do opieki.
5. Wybrane opublikowane poradniki i aktualizacje.
6. Praktyczne narzędzia i checklisty.
7. Osobny, widoczny moduł usług z kategorią, gatunkiem i lokalizacją.
8. Krótka informacja o redakcji i sposobie sprawdzania wiedzy.
9. Powiązania z rzeczywistymi profilami social media i zapis do newslettera, jeśli integracja oraz proces zgód działają.
10. Sekcja dla firm i uporządkowana stopka.

To hipoteza układu do sprawdzenia na działającym projekcie. Zadbaj, aby użyteczna zawartość była widoczna wcześnie, także na telefonie.

Menu: „Zwierzęta”, „Poradniki”, „Narzędzia”, „Usługi”, „O ZOO24”. Atlas gatunków może być dostępny w sekcji „Zwierzęta”. Dostęp dla firm powinien pozostać czytelny, ale strona główna ma służyć przede wszystkim opiekunowi.

Wyszukiwanie wiedzy i wyszukiwanie firm powinny mieć czytelnie opisany zakres. Jeśli powstanie wspólna wyszukiwarka, rozdziel typy wyników i pokaż kontekst zwierzęcia. Brak wyniku nie może powodować automatycznego generowania niezbadanej porady.

## 9. Szablony wiedzy i narzędzi

### A. Centrum wiedzy o grupie lub gatunku

Wprowadzenie, start dla początkującego, codzienna opieka, warunki utrzymania, zachowanie, odsyłacze do profesjonalnej pomocy, checklisty i odpowiednie usługi. Szczegóły mają wynikać z danego gatunku.

### B. Karta gatunku lub rasy

Nazwa, identyfikacja, podstawowe potrzeby, zobowiązania opiekuna, środowisko, aktywność, koszty przedstawione jako jawne założenia, źródła i zakres przeglądu. Pole nieznane pozostaje nieuzupełnione lub opisane jako brak danych.

Oceny typu „idealny dla dziecka” i „bardzo łatwy” zastąp informacjami pozwalającymi ocenić wymagania. Zdjęcia mają przedstawiać właściwy gatunek; ilustracje AI muszą być właściwie opisane. Nie używaj ich jako dowodu realnych warunków utrzymania ani cech konkretnej firmy.

### C. Poradnik zadaniowy

Jeden materiał odpowiada na jasno określoną potrzebę. Powinien zawierać krótką odpowiedź, praktyczne kroki, warunki zastosowania, typowe błędy, źródła oraz następny użyteczny krok. Długość wynika z tematu.

### D. Checklista i narzędzie

Narzędzia mają rozwiązywać konkretne zadania. Na pierwszy etap wybierz dwa:

- lista informacji dla opiekuna zwierzęcia podczas wyjazdu, możliwa do wydrukowania lub zapisania;
- kalkulator orientacyjnej objętości akwarium, z rozróżnieniem wymiarów wewnętrznych/zewnętrznych i nominalnej objętości od rzeczywistej ilości wody.

Kalkulator objętości nie wyznacza automatycznie dopuszczalnej obsady akwarium. Lista dla opiekuna może działać lokalnie w przeglądarce, bez obowiązkowego konta i zbierania danych na serwerze.

Kolejne propozycje: planer przygotowania domu, budżet opieki według kwot użytkownika, kalkulator energii wyposażenia, lista transportowa. Wzory i jednostki podlegają testom, a założenia są widoczne.

Automatyczna diagnostyka, dobór dawek i indywidualne leczenie nie należą do tego etapu. Dział zdrowia może udostępniać ogólną edukację po odpowiednim przeglądzie specjalisty.

## 10. Baza wiedzy i odpowiedzialność redakcyjna

### Minimalny model informacji

Dostosuj do obecnej bazy i CMS: grupa, gatunek, rasa, temat, etap życia, typ materiału, język, intencja, autor/redakcja, reviewer, klasa ryzyka, źródła, data weryfikacji, termin przeglądu, status, adres historyczny, adres docelowy.

Dla kluczowego twierdzenia zachowaj link do źródła, fragment lub opis dowodu w dozwolonym zakresie, datę dostępu, gatunek i warunki zastosowania. Sama lista kilku linków pod artykułem nie wystarcza do wykazania, że popierają konkretne zalecenia.

Priorytet źródeł: instytucje naukowe, uznane organizacje weterynaryjne i dobrostanowe, wytyczne, rzetelne publikacje specjalistów. Instrukcje producenta mogą dokumentować parametry konkretnego wyposażenia. Materiały sklepowe wymagają rozpoznania interesu handlowego. Forum może ujawniać pytania opiekunów; nie stanowi samoistnego potwierdzenia faktów.

Przykładowe punkty startu: RSPCA, MSD Veterinary Manual, właściwe organizacje weterynaryjne i źródła naukowe dotyczące danego gatunku. Ocena źródła odbywa się dla konkretnego twierdzenia. Aktualne polskie informacje prawne i lokalne sprawdzaj w odpowiednich źródłach pierwotnych.

### Proces

Research → szkic → sprawdzenie faktów → przegląd redakcyjny → wymagany przegląd specjalistyczny → zatwierdzenie wersji → publikacja → monitoring i aktualizacja.

AI może wspierać każdy dozwolony etap, lecz jego wewnętrzny przegląd nie jest recenzją człowieka. Podpis „sprawdził lekarz weterynarii” wymaga rzeczywistej osoby i rzeczywistej oceny materiału.

Dla celu wysokiej jakości zaplanuj ludzką kontrolę nowych materiałów generowanych przez AI przed publikacją, zgodnie z zaleceniami Google dotyczącymi faktów i wiarygodności. [G5] Nie twórz fikcyjnej akceptacji, aby odblokować publikację.

Żywienie, warunki środowiskowe, temperatury, wilgotność, oświetlenie, współutrzymywanie gatunków i transport mogą wpływać na dobrostan, nawet jeśli tekst nie dotyczy leczenia. Takie materiały kieruj do osoby o odpowiedniej wiedzy gatunkowej. Leki, objawy i leczenie wymagają lekarza weterynarii; prawo i kwestie handlowe właściwej weryfikacji.

Właściciel nie ma być jedynym redaktorem. Przygotuj rolę zewnętrznego redaktora oraz listę tematów wymagających specjalistów. Istniejące procesy wykorzystaj, brakujące zasoby przedstaw zbiorczo z zakresem pracy. Nie zaciągaj samodzielnie płatnych zobowiązań.

Brak review zatrzymuje dany materiał. Pozostałe prace i materiały mogą postępować. W panelu pokaż przyczynę oczekiwania, odpowiedzialną rolę i możliwy następny krok.

## 11. Usunięcie stanu „0 poradników”

Sprawdź, która sytuacja występuje: brak treści, treści w szkicach, brak reviewerów, błędne statusy, błędne filtrowanie, konfiguracja środowiska, nieudana publikacja, problem routingu lub cache.

Przetestuj cały cykl na jednym materiale w staging: źródła, szkic, przegląd, zatwierdzenie konkretnej wersji, publikacja, widoczność w liście, wyszukiwaniu i na stronie artykułu. Potwierdź metadane i możliwość korekty.

Następnie wykorzystaj ten sam proces dla pierwszej partii. Nie usuwaj warunków jakości wyłącznie po to, aby licznik przestał wskazywać zero.

Każdy opublikowany poradnik musi prowadzić do sensownych, istniejących dalszych materiałów lub usług. W kartach i nagłówkach prezentuj faktycznie dostępne treści.

## 12. Katalog dla wielu zwierząt

Dodaj model obsługiwanych gatunków oparty na źródłach. Dopuszczenie psów i kotów nie oznacza przyjmowania królików, ptaków czy gadów.

Kierunki rozbudowy: opieka podczas wyjazdu, petsitterzy, hotele przyjmujące określone gatunki, specjaliści zachowania, usługi pielęgnacji oraz odpowiednie usługi akwarystyczne i terrarystyczne. Placówki weterynaryjne wymagają odrębnie zweryfikowanych danych i zgodności modelu prezentacji z aktualnymi zasadami.

Najpierw popraw użyteczność widocznych lokalizacji. Wybierz pilotaż na podstawie rzeczywistych danych i możliwości ich sprawdzania. Docelowy zasięg ogólnopolski nie wymaga natychmiastowego tworzenia każdej kombinacji miasto × usługa × gatunek.

Napraw A07 i A08: alternatywa powinna odpowiadać potrzebie; formularz „poleć miejsce” musi być odrębny od potwierdzania prawa do zarządzania profilem. Użytkownik polecający miejsce nie może przejąć profilu.

Płatne wyróżnienia pokazuj jawnie. Status danych i porządek wyników opisuj zgodnie z rzeczywistością. Publikacja profilu wymaga udokumentowanego źródła.

## 13. Odzyskiwanie dawnego ruchu

Wykorzystaj dostępne eksporty Search Console, analitykę, kopie starej witryny, sitemap, logi i dane o linkach. Brakujący dostęp zgłoś zbiorczo. Historyczne 100 tys. wizyt to informacja właściciela i punkt odniesienia, nie obietnica wyniku.

Dla ważnych starych URL-i zapisz dawną intencję, dowód potencjału i decyzję: zachować/odtworzyć, scalić, przekierować do rzeczywistego odpowiednika albo pozostawić prawidłową odpowiedź braku zasobu.

Istniejące wartościowe artykuły powinny zachować adres, jeśli to możliwe. Nowe grupy tematyczne mają porządkować wejścia do wiedzy, nie wymuszać migracji każdej publikacji.

Nie kieruj automatycznie wszystkich starych produktów na homepage. Dopasowanie musi odpowiadać temu, czego użytkownik szukał. Przygotuj mapę i testy przekierowań. [G3]

Kontroluj produkcyjne robots, noindex, canonical, sitemap, statusy HTTP i brak przypadkowych kopii. Nie uznawaj samej obecności URL-a w sitemap za dowód indeksacji. Zmiana zawartości w obrębie zoo24.pl nie oznacza automatycznie zmiany domeny wymagającej Change of Address.

Google podkreśla wartość oryginalnych, użytecznych i rzetelnie opracowanych treści. Duża liczba stron generowanych bez wartości dla czytelnika może naruszać zasady scaled content abuse. To nie jest ogólny zakaz wspomagania redakcji AI. [G1][G2]

## 14. Odbudowa social media i pozyskiwanie użytkowników

Sprawdź istniejące konta Facebook i Instagram po otrzymaniu lub wykorzystaniu dostępnych uprawnień. Ustal aktualne zasięgi, aktywność, historyczne zainteresowania oraz działające integracje. Dawna liczba obserwujących nie oznacza obecnego zasięgu.

Przygotuj spójną komunikację przejścia marki w portal oraz cykl materiałów dla różnych grup zwierząt. Odsyłaj do ukończonych stron. Do każdego zatwierdzonego tematu dobieraj odpowiedni format: krótki post, karuzela, materiał wideo, checklista. Jeden artykuł nie musi automatycznie otrzymać wszystkich formatów.

Tematy wpływające na dobrostan zachowują wymagania przeglądu również po skróceniu do posta. Grafiki muszą prawidłowo pokazywać gatunek i nie utrwalać błędnych warunków opieki.

Startowy plan to kalendarz na 14 dni oraz hipoteza 3–4 wartościowych publikacji tygodniowo, dostosowana do dostępności materiałów i reakcji odbiorców. To propozycja tempa, nie obowiązek publikowania za wszelką cenę.

Wykorzystuj UTM i mierzenie wejść oraz dalszych działań. Oddziel wynik od automatycznej deklaracji narzędzia. Publikacja wymaga potwierdzenia z platformy.

Współprace z ekspertami i organizacjami przygotuj jako listę oraz konkretne propozycje. Wysyłkę prowadź tylko w ramach udzielonego uprawnienia; nie rozsyłaj automatycznie masowych wiadomości do znalezionych kontaktów.

## 15. Monetyzacja dopasowana do wartości

Zachowaj rezygnację z prowadzenia sklepu.

Kolejność rozwoju modelu przychodowego:

1. Jasno oznaczone wyróżnienia firm, gdy katalog oferuje rzeczywisty wybór i ruch.
2. Afiliacja do wyposażenia omawianego w rzetelnych poradnikach, z czytelnym oznaczeniem oraz niezależnym doborem rekomendacji.
3. Partnerstwa i materiały sponsorowane podlegające redakcji.
4. Reklama display dopiero po ustaleniu wpływu na czytelność, wydajność i przychód.

Nie przedstawiaj nieprzeprowadzonych testów produktów jako własnych testów redakcji. Warunki programów, dostępność i ceny wymagają aktualnej weryfikacji. Rozmiar i liczba reklam powinny wynikać z pomiaru, a nie z maksymalizacji powierzchni.

Na tym etapie priorytetem jest użyteczność i wiarygodność. Przychód mierz po kosztach hostingu, narzędzi AI, redakcji i pozyskania danych.

## 16. Mały nakład czasu właściciela

Panel właściciela powinien skupiać się na decyzjach i wyjątkach:

- najważniejsze problemy oraz ich właściciel;
- stan publikacji i materiałów oczekujących na review;
- pokrycie tematów według grup zwierząt;
- stan źródeł i terminów przeglądu;
- treści i publikacje social z potwierdzonym rezultatem;
- rzeczywiste wyniki wyszukiwania i przejść do usług;
- koszty, przychód i wykorzystanie limitów;
- stan zadań agentów i możliwość ich zatrzymania.

Właściciel otrzymuje jeden zwięzły raport tygodniowy oraz alerty krytyczne, zgodnie z istniejącą konfiguracją. Rutynowe kontrole i publikowanie zatwierdzonych wersji automatyzuj.

Cel małego zaangażowania właściciela wymaga obsadzenia redakcji i odpowiedzialności operacyjnej. Agenci mogą ograniczyć pracę, ale nie wolno deklarować recenzji eksperta, którego nie ma.

## 17. Kolejność realizacji

Poniższe etapy są kolejnością odbiorów. Konkretne daty i koszty Claude ustala po poznaniu repozytorium, dostępów i zasobów redakcyjnych.

| Priorytet | Pakiet | Kryterium odbioru |
|---|---|---|
| P0 | Weryfikacja audytu i gotowości środowisk | Każda obserwacja ma status; wiadomo, gdzie jest preview i produkcja oraz co pozostaje niedostępne |
| P0 | Inwentaryzacja historycznych URL-i przed zmianą routingu | Zebrano dostępne stare adresy, wskazano najważniejsze zasoby i zasady zachowania; brakujące eksporty mają jawny status |
| P0 | Diagnoza 0 poradników i rzeczywisty cykl publikacji | Jedna pełna ścieżka publikacji/korekty przechodzi na staging; blokady mają konkretną przyczynę |
| P0 | Puste ścieżki i formularze | Homepage/stopka ograniczają puste wejścia; polecenie miejsca nie udaje uprawnienia właściciela |
| P1 | Model dziesięciu grup i nowa nawigacja | Model, szablony i routing obejmują zakres; publiczne wejścia prowadzą do użytecznej zawartości |
| P1 | Homepage portalu, centrum wiedzy, artykuł i karta gatunku | Ekrany są zaimplementowane i działają na telefonie oraz komputerze |
| P1 | Pierwsza partia treści | 12 pełnych materiałów do przeglądu z co najmniej 6 grup, publikowanych według zatwierdzenia; przejrzysty status reszty |
| P1 | Dwa użyteczne narzędzia | Działają, mają jawne założenia, prawidłowe jednostki i testy kluczowych obliczeń |
| P1 | Powiązania wiedza–gatunek–usługa | Linki i filtry odnoszą się do prawdziwych danych i nie wymyślają kompetencji firm |
| P2 | Pozostałe grupy i pogłębienie wiedzy | Każda z 10 grup uzyskuje użyteczny przewodnik startowy i kolejne materiały; daty wynikają z gotowości review |
| P2 | Odzyskiwanie historycznych URL-i | Mapa priorytetów, przygotowane odpowiedniki i sprawdzone przekierowania |
| P2 | Social i dystrybucja | Kalendarz z ukończonych materiałów, działające pomiary i potwierdzenia publikacji |
| P2 | Monetyzacja | Pierwszy model z mierzalną wartością, oznaczeniami i oceną kosztów |

Liczby publikacji są założeniami organizacyjnymi, nie progami Google ani gwarancją ruchu. Materiał oczekujący na wymagany przegląd nie liczy się jako opublikowany.

Rozróżniaj trzy statusy odbioru: **wersja techniczna gotowa**, **częściowe uruchomienie redakcyjne** i **uruchomienie pełnego zakresu grup**. Pierwszy nie oznacza, że opublikowano treści. Drugi wymaga rzeczywiście zatwierdzonych, publicznie dostępnych materiałów i działających ścieżek w eksponowanych działach. Trzeci wymaga użytecznej zawartości każdej z dziesięciu grup. Szkice i komunikaty „w przygotowaniu” nie spełniają tych dwóch ostatnich warunków. Brak review ma być zgłoszoną zależnością, bez obchodzenia zatwierdzania.

### Pierwszy pakiet do wykonania teraz

1. Zweryfikuj stan aplikacji, dokumentów i dostępów.
2. Zinwentaryzuj dostępne historyczne URL-e i zabezpiecz ich uwzględnienie przed zmianą routingu.
3. Ustal powód braku publicznych poradników.
4. Napraw puste przejścia i niespójność zgłoszeń.
5. Zbuduj model grup/gatunków/tematów oraz szablony.
6. Wdróż nową hierarchię strony głównej.
7. Przygotuj pierwsze 12 pełnych materiałów i przeprowadź dostępny, rzeczywisty proces przeglądu.
8. Wykonaj dwa narzędzia.
9. Sprawdź pełne ścieżki i przygotuj podgląd z raportem.
10. Zapisz kolejny pakiet dla pozostałych grup i odzyskiwania SEO.

Weryfikacje wymagające zewnętrznej osoby nie blokują niezależnej implementacji. Brak dostępu ma konkretny status i wpływ; nie wolno go przedstawiać jako ukończonego zadania.

## 18. Wymagania techniczne i UX

Dostosuj rozwiązanie do istniejącego stosu. Zachowaj obecne działające funkcje. Publiczne treści mają być czytelne bez konta.

Sprawdź nawigację klawiaturą, fokus, semantykę, formularze, tekst alternatywny, kontrast i ograniczanie animacji. Cel dostępności: WCAG 2.2 AA. Sprawdź układ przy szerokościach 360, 390, 768, 1280 i 1440 px oraz reflow przy 320 CSS px. Są to scenariusze kontroli, nie deklaracja spełnienia całej normy.

Cele Core Web Vitals w danych rzeczywistych użytkowników: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 w 75. percentylu. Pomiar laboratoryjny nie zastępuje danych terenowych. Przy braku danych pokaż brak pomiaru. [G6][G7]

Formularze i narzędzia muszą obsługiwać loading, empty, error i success. Testuj istotne obliczenia, uprawnienia, przejścia publikacyjne, przekierowania i główne ścieżki. Nie produkuj testów, które wyłącznie odtwarzają implementację.

Dane strukturalne, tytuły i opisy powinny odpowiadać rzeczywistej zawartości. Nie obiecuj rich results ani pozycji w Google. Nie twórz fikcyjnych gwiazdek, ekspertów, wyników testów lub ruchu.

## 19. Mierniki i definicja jakości

| Miernik | Jak interpretować |
|---|---|
| Pokrycie potrzeb według grup | Czy opiekun znajduje odpowiedzi na podstawowe zadania; osobno każda grupa |
| Aktualność wiedzy | Udział opublikowanych materiałów z aktualnym przeglądem i źródłami |
| Jakość wyszukiwania | Udział zapytań bez wyniku i przejścia do odpowiedniej treści |
| Użycie narzędzi | Rozpoczęcie, ukończenie i zapis/druk przydatnego wyniku |
| Powroty odbiorców | Wskaźnik wartości regularnej, zgodnie z dostępną analityką |
| Przejścia do usług | Kliknięcie kontaktu jest sygnałem intencji, nie potwierdzoną rezerwacją |
| SEO | Kliknięcia i wyświetlenia z aktualnych raportów, indeksacja wartościowych URL-i |
| Social | Rzeczywisty zasięg i wejścia do ukończonych materiałów |
| Obsługa | Liczba wyjątków i czas właściciela potrzebny do ich rozstrzygnięcia |
| Ekonomia | Przychód i marża po kosztach redakcji, danych, AI i infrastruktury |

Na początku zbierz punkt odniesienia. Cele wzrostu ustalaj po pomiarze. Różnica między brakiem danych a rzeczywistym zerem musi być widoczna w panelu.

## 20. Odbiór i końcowe materiały

Wymagane scenariusze:

- opiekun królika znajduje właściwy dział i istniejący poradnik;
- opiekun ptaka trafia do treści o właściwym gatunku;
- użytkownik szuka usługi przyjmującej konkretne zwierzę i otrzymuje prawdziwy wynik lub uczciwy brak;
- osoba wyjeżdżająca tworzy listę dla opiekuna i zapisuje ją;
- czytelnik widzi źródła, autorstwo i rzeczywisty status przeglądu;
- moderator rozumie, dlaczego materiał czeka i co trzeba zrobić;
- właściciel widzi aktualny wynik bez przeglądania logów agentów.

Przekaż:

1. Działający podgląd zmian lub dokładny sposób uruchomienia.
2. Listę ekranów i funkcji faktycznie wdrożonych.
3. Listę materiałów: przygotowane, zatwierdzone, opublikowane, oczekujące.
4. Zrzuty kluczowych ekranów mobilnych i desktopowych wykonane podczas QA.
5. Wyniki rzeczywistych kontroli i pozostałe ograniczenia.
6. Stan odzyskiwania SEO i social, z rozróżnieniem planu od wykonania.
7. Następny uporządkowany pakiet prac.
8. Jedną zbiorczą listę brakujących dostępów i decyzji, tylko jeśli są konieczne.

Zapisz krótkie dokumenty w istniejącym systemie dokumentacji, np. PORTAL_V3_PLAN.md, CONTENT_COVERAGE.md i PORTAL_V3_QA.md. Nie duplikuj sprzecznych planów.

---

# CZĘŚĆ III. Startowa lista tematów

Poniższe propozycje są briefami do sprawdzenia pod kątem potrzeb, historii SEO, źródeł i wymaganych kwalifikacji reviewerów. Nie są gotowymi poradami.

| Grupa | Temat 1 | Temat 2 | Temat 3 |
|---|---|---|---|
| Psy | Przygotowanie domu przed przyjęciem psa | Jak wybrać opiekę podczas wyjazdu | Co ustalić przed pierwszą wizytą u groomera |
| Koty | Przygotowanie mieszkania na przyjęcie kota | Informacje dla osoby opiekującej się kotem | Jak zaplanować transport i wizytę u specjalisty |
| Króliki | Przygotowanie przestrzeni dla królika | Jak szukać opiekuna z doświadczeniem w królikach | Checklista obserwacji i informacji dla opiekuna |
| Gryzonie | Jak porównywać potrzeby konkretnych gatunków przed wyborem | Przygotowanie środowiska dla wybranego gatunku | Organizacja opieki podczas nieobecności |
| Fretki i inne małe ssaki | Co sprawdzić przed decyzją o opiece nad fretką | Przygotowanie bezpiecznej przestrzeni | Jak przekazać opiekunowi informacje o zwierzęciu |
| Ptaki | Jak wybrać gatunek z uwzględnieniem jego potrzeb | Przygotowanie domowego środowiska dla konkretnego gatunku | Jak znaleźć opiekę dla ptaka na czas wyjazdu |
| Ryby i akwarystyka | Jak zaplanować pierwsze akwarium | Objętość nominalna i rzeczywista ilość wody | Organizacja opieki nad akwarium podczas wyjazdu |
| Gady | Jak badać wymagania gatunku przed zakupem wyposażenia | Plan przygotowania terrarium dla wybranego gatunku | Checklista informacji dla doświadczonego opiekuna |
| Płazy | Co sprawdzić przed rozpoczęciem opieki nad płazem | Plan środowiska dla wybranego gatunku | Jak znaleźć wiarygodne źródła i odpowiednią pomoc |
| Bezkręgowce | Jak rozpoznać gatunek i znaleźć rzetelne wymagania | Plan przygotowania środowiska dla wybranego gatunku | Co ustalić przed powierzeniem opieki innej osobie |

Wymagania środowiskowe i żywieniowe są materiałami wpływającymi na dobrostan. Sam tytuł „dla początkującego” nie obniża wymagań weryfikacji. Nazwy gatunków i parametry trzeba sprawdzić osobno.

---

# CZĘŚĆ IV. Źródła i rozdzielenie faktów od rekomendacji

Obserwacje strony pochodzą z publicznego UI i odczytu HTTP/HTML z daty audytu. Rekomendacje architektury, priorytetów, liczby materiałów i mierników są propozycją dla ZOO24. Nie stanowią obietnicy rankingów, przychodów ani czasu powrotu historycznego ruchu.

- **G1 — Google Search Central, helpful content:** https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- **G2 — Google Search Central, spam/scaled content:** https://developers.google.com/search/docs/essentials/spam-policies
- **G3 — Google Search Central, migracje URL:** https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- **G4 — Google Search Central, noindex:** https://developers.google.com/search/docs/crawling-indexing/block-indexing
- **G5 — Google Search Central, generative AI content:** https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- **G6 — W3C, WCAG 2.2:** https://www.w3.org/TR/WCAG22/
- **G7 — web.dev, Web Vitals:** https://web.dev/articles/vitals
- **R1 — RSPCA, przykład organizacji porad według zwierzęcia:** https://www.rspca.org.uk/adviceandwelfare/pets

Źródła te wspierają ogólne zasady jakości, technicznego SEO i dostępności. Nie są automatycznym potwierdzeniem przyszłych porad gatunkowych. Każdy taki materiał wymaga własnych dowodów i przeglądu.

