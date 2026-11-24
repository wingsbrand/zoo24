# ZOO24 — audyt produkcji i instrukcja wykonawcza dla Claude Code

**Wersja:** V4 · **Data audytu:** 23 listopada 2026, Europe/Warsaw · **Serwis:** https://zoo24.pl/

## Jak użyć tego dokumentu

Umieść ten plik w istniejącym repozytorium ZOO24, np. w katalogu `docs/`, i poproś Claude Code o przeczytanie całego dokumentu, sprawdzenie aktualnego stanu projektu oraz wykonanie części B. Nie zastępuj automatycznie istniejącego `CLAUDE.md`: Claude ma połączyć aktualne zasady projektu z tą instrukcją, a sprzeczności rozstrzygać zgodnie z decyzjami właściciela. Ten dokument aktualizuje wcześniejsze wnioski dotyczące wersji demonstracyjnej. Ustalenia opisują stan z dnia audytu; wdrożone później poprawki należy oznaczyć jako wykonane.

Polecenie startowe:

> Przeczytaj cały plik ZOO24_AUDYT_PRODUKCJI_I_PROMPT_DLA_CLAUDE_V4.md. Potraktuj część A jako dowody z audytu, a część B jako instrukcję wykonawczą. Sprawdź repozytorium i produkcję, pomiń już naprawione problemy, uruchom potrzebnych agentów i wykonaj najpierw iterację 1. Następnie przejdź do kolejnych iteracji zgodnie z kryteriami odbioru. Pracuj w istniejącym projekcie, zachowaj wartościowe adresy i działające funkcje. Dostarczaj działające zmiany, testy istotnych ścieżek i raport wyników. Zgłaszaj zbiorczo wyłącznie rzeczywiste blokady dostępu lub decyzje wymagające właściciela.

---

# CZĘŚĆ A. Co rzeczywiście stwierdzono

## 1. Ocena kierunku

ZOO24 ma już podstawy portalu: poradniki, działy zwierząt, katalog oraz dwa użyteczne narzędzia. Następna inwestycja powinna poprawiać możliwość wykonania zadania przez czytelnika: podjęcia decyzji, przygotowania opieki, obliczenia wyniku albo znalezienia odpowiedniej usługi. Sam wzrost liczby artykułów i elementów interfejsu nie wystarczy.

Obecnie najbardziej przeszkadzają niedokończone karty atlasu, nierówne pokrycie tematów, nadmiar informacji o wewnętrznym procesie redakcyjnym i słabe połączenie poradników z kolejnym działaniem. Techniczne podstawy są w znacznej części poprawne. Nie ma podstaw, aby rekomendować budowę serwisu od nowa.

Historyczne ponad 100 tys. wejść organicznych miesięcznie oraz wielotysięczne społeczności Facebooka i Instagrama to informacje właściciela o dawnym serwisie. Nie stanowią pomiaru obecnej widoczności, aktualnego zasięgu ani obietnicy przyszłego przychodu.

## 2. Zakres i ograniczenia audytu

| Obszar | Co sprawdzono | Wynik / ograniczenie |
|---|---|---|
| Publiczne strony | 73 unikalne ścieżki HTML znalezione w sitemap i linkach | Wszystkie odpowiadały HTTP 200 |
| Sitemap | Wszystkie 46 adresów | Wszystkie pobrano poprawnie |
| Metadane i semantyka | Title, description, H1, canonical, main | Obecne na wszystkich 73 stronach; po jednym H1 |
| Linki wewnętrzne | Odkryta sieć publicznych ścieżek | Nie stwierdzono uszkodzonych połączeń w tym zakresie |
| Instrukcje indeksowania | Meta robots i nagłówki | 50 stron bez noindex, 23 z noindex; nie jest to liczba stron zaindeksowanych przez Google |
| Dane strukturalne | Początkowy HTML wszystkich stron | 0 stron z JSON-LD lub microdata itemscope; brak JSON-LD potwierdzono również w wyrenderowanym DOM homepage i Border collie |
| Poradniki | 26 adresów artykułów, metadane wszystkich | 26/26 ma datę modyfikacji wcześniejszą od podanej daty publikacji |
| Ocena redakcyjna | Próba 12 stron różnych typów, w tym 6 szczegółowych odczytów treści | Ocena użyteczności i prezentacji, bez pełnej weryfikacji weterynaryjnej wszystkich twierdzeń |
| Kalkulator | Prostokąt, wymiary wewnętrzne w cm; separator dziesiętny | 100 × 40 × 50 daje 200,0 l; 100,5 × 40 × 50 daje 201,0 l |
| Lista dla opiekuna | Wpisanie danych testowych, dodanie drugiego zwierzęcia i odświeżenie | Dane zachowały się lokalnie; dane testowe po kontroli usunięto |
| Wyszukiwarka | Zapytanie królik | 0 wyników; poprawny komunikat, lecz ujawniona luka treści |
| Warianty filtrów | q=królik, potrzeba=wybor-zwierzecia, temat=rasy-psow | Wszystkie mają noindex, follow i canonical do /poradniki; nie są indeksowalnymi pustymi landing pages |
| Wydajność | Jedna próba PageSpeed API mobile | HTTP 429 / limit API; brak wyniku Lighthouse i CrUX |

Nie wykonano pełnego audytu mobilnego, testów eksportu/drukowania, wszystkich wariantów kalkulatora, wysyłki formularzy, backendu, panelu, wszystkich dawnych adresów sklepu ani prywatnych kont GSC, analityki i Meta. Publiczny crawl nie dowodzi prawidłowej indeksacji, ruchu, skuteczności konwersji ani rzeczywistego wykonania ludzkiego review. Nie podajemy wymyślonej punktacji SEO, CWV lub GEO.

## 3. Co zachować

- Produkcyjna domena działa z HTTPS i przekierowaniem z www; homepage nie ma noindex. Wariant HTTP z www ma dwa skoki — można uprościć przy okazji, nie jest to główny problem projektu.
- Jest już 26 poradników, pięć publicznych grup zwierząt i dwa narzędzia. Nie powtarzać wcześniejszej diagnozy o pustym portalu.
- Historyczne adresy części bloga nadal działają, np. `/blog/border-collie-n61`. Zachować je, jeżeli odpowiadają właściwym materiałom.
- Istnieje osobna ścieżka `/polec-miejsce`, oddzielona od zgłoszenia firmy przez uprawnionego przedstawiciela.
- W katalogu pokazano źródła, datę sprawdzenia i różnicę między sprawdzeniem danych a oceną jakości usług. To wartościowe rozróżnienie.
- Noindex lokalnych list i niepotwierdzonych profili wygląda na świadomą politykę jakości. Zachować ją do czasu spełnienia warunków publikacji danej strony.

## 4. Problemy i decyzje

Priorytety odnoszą się do kolejności pracy, nie do stwierdzonej awarii. P0: wiarygodność i ochrona istniejących zasobów; P1: użyteczność i poprawność; P2: rozwój i przychód.

| ID | Priorytet | Dowód z produkcji | Co poprawić | Jak sprawdzić wynik |
|---|---|---|---|---|
| A01 | P0 | Homepage zapowiada przegląd osób kompetentnych, a przykładowe materiały pokazują zatwierdzenie AI | Dopasować deklaracje do rzeczywistego procesu; wykonać potrzebny przegląd merytoryczny | Każda deklaracja konsultacji ma dowód dotyczący konkretnej wersji |
| A02 | P1 | Border collie ma publiczny status szkicu, zatwierdzenie AI, klasę ryzyka, wymagany review i rejestr twierdzeń | Uprościć szablon; log operacyjny przenieść do CMS; zachować czytelne źródła i odpowiedzialność | Czytelnik widzi gotowy materiał, a nie ekran zarządzania agentami |
| A03 | P1 | Karty psa i kota pokazują brak potwierdzonej nazwy naukowej i wiele nieopracowanych pól | Uzupełnić samodzielną wartość; ukryć puste pola, rozstrzygnąć relację karty i hubu | Karta pomaga zrozumieć potrzeby i wykonać następny krok |
| A04 | P1 | Liczniki grup: psy 14, koty 6, ptaki 1, akwarystyka 1, gady 1 | Uzupełniać kompletne pakiety potrzeb, również poza psami i kotami | Każdy promowany dział oferuje użyteczną ścieżkę, nie samą zapowiedź |
| A05 | P1 | 26 poradników, a liczniki grup sumują się do 23; w temacie Rasy psów 14 wyników, filtr Psy pokazuje 12 | Sprawdzić migrację taksonomii, zwłaszcza Cane corso, Maltańczyka i kota brytyjskiego | Wszystkie właściwe teksty są dostępne po prawidłowym filtrowaniu |
| A06 | P1 | Artykuł o Border collie oznaczony jako karta gatunku | Rozdzielić grupę, gatunek, rasę, potrzebę i format treści | Rasa nie jest prezentowana jako gatunek; filtry mają jednoznaczne znaczenie |
| A07 | P1 | Pod poradnikiem akwarystycznym polecane są gady i opieka nad ptakiem | Rekomendacje według zwierzęcia i zadania, z możliwością nadpisania | Akwarium prowadzi do kalkulatora i akwarystyki; wyjazd do listy dla opiekuna |
| A08 | P1 | Brak JSON-LD w 73 początkowych HTML i w 2 sprawdzonych DOM | Dodać odpowiednie dane strukturalne zgodne z widoczną treścią | Walidacja szablonów i zgodność danych; bez fikcyjnych ocen i autorów |
| A09 | P1 | 26/26: OG modified 22.11, published 23.11.2026 | Rozdzielić publikację, import, aktualizację i przegląd | Spójność semantyki oraz UI, OG, JSON-LD i sitemap; bez sztucznego odmładzania |
| A10 | P1 | 23/26 article:author zawiera informację o szkicu AI | Ujednolicić prawdziwe autorstwo w UI i metadanych | Redakcja ZOO24 jako rzeczywista odpowiedzialna organizacja; wymagane ujawnienia osobno |
| A11 | P1 | Wyszukanie królika nie zwraca treści; publicznie tylko 5 grup | Zaplanować brakujące grupy i lepszy stan braku wyników | Brak fikcyjnych trafień; sensowne podpowiedzi i monitorowanie zapytań bez odpowiedzi |
| A12 | P1 | Home obiecuje szukanie w poradnikach i działach, podpowiedź mówi tylko o poradnikach | Ujednolicić obietnicę i zakres; docelowo wyszukiwać również narzędzia i huby | Wynik jest oznaczony typem, a wyszukiwarka znajduje deklarowane zasoby |
| A13 | P1 | Dwa działające narzędzia mają ogólne przejścia do poradników | Dodać kontekstowe kroki i zrozumiałe CTA | Użytkownik kończy zadanie i wie, co zrobić z wynikiem |
| A14 | P1/P2 | Po jednym groomerze w 10 miastach; 3 indeksowalne profile sprawdzonych danych | Zbudować użyteczny wybór w wybranych lokalizacjach i jednej kategorii | Aktualne, porównywalne dane; warunki indeksowania oceniane per strona |
| A15 | P2 | Trzy indeksowalne profile mają jednakowe ogólne opisy meta | Indywidualne opisy według faktycznej lokalizacji i usług | Bez kopiowanego boilerplate i wymyślonych wyróżników |
| A16 | P2 | W sprawdzonej homepage brak wyraźnego połączenia z dawnymi profilami social i zapisu newslettera | Potwierdzić stan integracji; dodać prostą ścieżkę powrotu | Działające, właściwe profile lub zapis, mierzenie rzeczywistych powrotów |

Adresy referencyjne: [Border collie](https://zoo24.pl/blog/border-collie-n61), [pies domowy](https://zoo24.pl/zwierzeta/psy/pies-domowy), [kot domowy](https://zoo24.pl/zwierzeta/koty/kot-domowy), [atlas](https://zoo24.pl/zwierzeta), [ptaki — opieka podczas wyjazdu](https://zoo24.pl/poradniki/ptaki-opieka-na-czas-wyjazdu), [objętość akwarium](https://zoo24.pl/poradniki/akwarium-objetosc-nominalna-a-rzeczywista), [wymagania gada](https://zoo24.pl/poradniki/gady-wymagania-gatunku-przed-zakupem-wyposazenia), [profil salonu](https://zoo24.pl/firma/kudlate-historie-r02), [zasady redakcyjne](https://zoo24.pl/zasady-redakcyjne).

## 5. Decyzja dotycząca AI

Usunąć nadmiar komunikatów o narzędziach i agentach z głównego doświadczenia użytkownika. Autorstwo organizacyjne „Redakcja ZOO24” jest odpowiednią formą, jeżeli wskazuje rzeczywistego odpowiedzialnego wydawcę. Źródła, daty i faktyczna weryfikacja pozostają dostępne.

Nie stosować globalnej operacji usuwającej każde wystąpienie AI. Ocenić konkretne materiały: obowiązki art. 50 AI Act mogą dotyczyć tekstów informujących o sprawach interesu publicznego i określonych syntetycznych obrazów. Wyjątek dotyczący tekstów wymaga rzeczywistego przeglądu lub kontroli redakcyjnej człowieka i odpowiedzialności za publikację; nie wystarcza zatwierdzenie przez drugiego agenta. Potrzebne ujawnienie musi być czytelne przy kontakcie z materiałem. [S1–S2]

Zdjęcia rzeczywistych firm, ekspertów, usług i zdarzeń powinny dokumentować wskazaną rzeczywistość. Syntetyczną ilustrację oceniać według kontekstu, również gdy przedstawia zwierzę. Można uprościć zbędne plakietki ilustracyjne; przypadki wymagające oznaczenia trzeba oznaczyć lub zastąpić odpowiednią fotografią. Zachować rejestr pochodzenia, prawa i wymagane oznaczenia maszynowe. Nazwisko eksperta, zdjęcie portretowe i informacja o teście produktu muszą odpowiadać rzeczywistym osobom i działaniom.

Google zaleca jakość, poprawność i właściwy kontekst użycia generowania; nie ma podstaw, aby traktować kasowanie badge’y jako czynnik rankingowy. [S3]

---

# CZĘŚĆ B. Instrukcja wykonawcza dla Claude Code

## 1. Cel, zakres i sposób pracy

Jesteś liderem rozwoju istniejącego ZOO24. Zwiększ użyteczność portalu, jakość treści, widoczność w wyszukiwarkach i odpowiedziach AI oraz możliwość uzyskiwania mierzalnego przychodu. Właściciel nie chce wracać do sprzedaży zoologicznej ani ręcznie prowadzić codziennych operacji. Zachowaj istniejący stos technologiczny, repozytorium, działające narzędzia i dobre adresy. Ulepszaj fragmenty na podstawie dowodów.

Przeczytaj aktualne instrukcje repozytorium i wcześniejsze dokumenty, o ile są dostępne. Zweryfikuj ustalenia części A. Przygotuj zwięzły backlog z przypisanym właścicielem, zależnościami i dowodem odbioru. Od razu wykonuj prace, które nie wymagają brakujących dostępów. Nie kończ zadania samym planem.

Użyj sześciu ról agentów, łącząc zadania i ograniczając równoległość do faktycznej potrzeby:

| Rola | Odpowiedzialność | Namacalny wynik |
|---|---|---|
| Produkt i budowa serwisu | UX, komponenty, wyszukiwanie, narzędzia, CMS | Działające ścieżki na preview, kod i sprawdzone wdrożenie |
| Redakcja i publikacja | Użyteczne artykuły, poprawki, plan publikacji | Gotowe materiały z właściwym statusem przeglądu |
| Baza wiedzy i weryfikacja | Źródła, tożsamość gatunków, twierdzenia, licencje | Rejestr źródeł, braków i wersji; sprawdzone podstawy treści |
| SEO / GEO / AEO | Indeksowanie, metadane, linkowanie, migracja, pomiar | Poprawki techniczne i raport URL–zapytanie–wynik |
| Pozyskiwanie użytkowników i przychód | Ścieżki konwersji, katalog, afiliacja, retencja | Pilotaże z rzeczywistym pomiarem wartości i kosztów |
| Social media | Powrót marki, dystrybucja, harmonogram i wyniki | Materiały do właściwych kanałów, publikacje w przyznanym zakresie, raport ruchu |

Koordynator sprawdza integrację i kryteria jakości, usuwa sprzeczności i prowadzi jeden raport. Nie twórz wielu konkurencyjnych plików planu. Agent AI nie zastępuje osoby w przeglądzie, który wymaga człowieka. Jeżeli potrzebne są takie kompetencje, przygotuj konkretną paczkę do zewnętrznego redaktora lub specjalisty; nie przerzucaj całej redakcji na właściciela.

## 2. Iteracja 1 — wiarygodność, model danych i prezentacja

### 2.1. Uprość publiczny artykuł

Docelowa kolejność: tytuł i jasna korzyść → krótka odpowiedź/wprowadzenie → autorstwo i data → właściwa treść → praktyczne podsumowanie lub narzędzie → trafny następny krok → czytelne źródła. Spis treści ma sens przy dłuższych materiałach; nie może być formalnym ozdobnikiem.

Publicznie pozostaw autora lub rzeczywistą redakcję, sensowną datę aktualizacji, faktycznie wykonaną konsultację, źródła i zgłoszenie błędu. Przenieś do CMS identyfikatory agentów, klasę ryzyka, wewnętrzny status review, wymaganego recenzenta, terminy kolejnych zadań i rozbudowany rejestr twierdzeń. Można zachować ten rejestr jako zaplecze przypisów. Nie powielaj całego artykułu blokiem dowodów po angielsku.

Wprowadź centralną politykę prezentacji autorstwa i ilustracji zgodną z częścią A. Zastosuj ją w komponentach, kartach, OG i metadanych. Usuwaj zbędne etykiety o generowaniu i redakcji AI. Zostaw lub zastąp właściwym komunikatem ujawnienia wymagane dla określonego materiału. Nie ukrywaj wymaganego komunikatu wyłącznie w regulaminie albo alt. Nie kasuj rejestru pochodzenia lub oznaczeń maszynowych w celu ukrycia pochodzenia.

Przed publikacją treści sprawdź, czy publiczna deklaracja review jest prawdziwa. Realny przegląd ma zapis wersji, zakresu, daty i osoby. Treści zdrowotne, żywieniowe i o warunkach utrzymania klasyfikuj według faktycznej treści, a nie tytułu lub etykiety „organizacyjne”. Gdy brakuje przeglądu, przygotuj materiał do weryfikacji, ogranicz niepotwierdzone twierdzenia i kontynuuj inne zadania. Nie wymyślaj nazwisk, kwalifikacji, testów lub doświadczeń.

### 2.2. Napraw taksonomię

Rozdziel: grupę zwierząt, gatunek, rasę/odmianę, potrzebę użytkownika i format materiału. Nie nazywaj rasy kartą gatunku. Króliki powinny mieć osobną grupę od gryzoni. Nie stosuj uniwersalnych parametrów opieki dla wszystkich ptaków, gadów albo ryb.

Wykonaj migrację przypisań wszystkich 26 istniejących artykułów. Sprawdź szczególnie Cane corso, Maltańczyka, kota brytyjskiego i poradnik z informacjami dla opiekuna kota przypisany do ras kotów. Wyjaśnij różnicę 26/23 w licznikach. Nie zakładaj błędu arytmetycznego; sprawdź filtry i źródło danych. Jedno źródło danych ma zasilać listingi, liczniki, huby i rekomendacje.

Rekomendacje wybieraj kolejno według konkretnego zwierzęcia, potrzeby i następnego zadania, z możliwością ręcznego nadpisania. Nie dopełniaj pustych miejsc losowymi kategoriami. Pod akwarium pokaż kalkulator i poradniki akwarystyczne; pod wyjazdem — listę dla opiekuna, następnie materiały o właściwej grupie.

### 2.3. Uporządkuj daty

Rozdziel co najmniej pierwszą potwierdzoną publikację, import/migrację, merytoryczną aktualizację i przegląd. Ustal, dlaczego modified poprzedza published na wszystkich artykułach. Jeżeli import został błędnie nazwany publikacją, napraw semantykę. Przy braku dowodu dawnej daty nie odtwarzaj jej z domysłu. Synchronizuj widoczne daty, OG, JSON-LD i sitemap zgodnie z ich znaczeniem. Nie odmładzaj artykułu przy każdym buildzie i kosmetycznej zmianie.

### 2.4. Uzupełnij rzeczywiste braki techniczne

Wdróż generowane z danych strony JSON-LD: Organization i WebSite dla serwisu, BreadcrumbList dla odpowiednich podstron, Article/BlogPosting dla publikacji oraz właściwy typ organizacji lub LocalBusiness na kompletnych profilach firm. Dobieraj typ do rzeczywistej działalności; portal nie ma udawać gabinetu weterynaryjnego. Autor organizacyjny jest dopuszczalny, jeśli prawdziwy. Nie dodawaj ocen, cen, godzin, recenzentów lub obrazów bez danych. Znaczniki powinny być dostępne w początkowym HTML i zgodne z UI. Sprawdź wyniki walidacji i wyrenderowany dokument. [S4]

Sprawdź mapę witryny: tylko adresy przeznaczone do indeksowania, właściwe canonical i uczciwe lastmod. Wyjaśnij różnicę między 50 stronami bez noindex a 46 wpisami sitemap — część stron informacyjnych może być celowo pominięta. Nie dodawaj wszystkiego automatycznie.

Zachowaj noindex wyszukiwania i kombinacji filtrów. Docelowe, wartościowe strony tematyczne buduj na stałych adresach tylko tam, gdzie dają własną odpowiedź i unikają kanibalizacji. Zachowaj noindex niegotowych lokalnych list i niepotwierdzonych profili do czasu kontroli każdej strony. Nie blokuj w robots dostępu do strony, z której wyszukiwarka ma odczytać noindex.

Odbiór iteracji 1: spójne autorstwo i deklaracje, brak publicznych logów operacyjnych, poprawna klasyfikacja i daty, prawidłowe znaczniki na szablonach, zachowane wartościowe adresy i polityka indeksowania. Potwierdź stan w przeglądarce i odczycie HTML; nie ograniczaj się do udanego builda.

## 3. Iteracja 2 — rzeczywista wartość treści i UX

### 3.1. Zdefiniuj zadanie użytkownika

Dla każdego priorytetowego materiału zapisz: kto go potrzebuje, na jakie pytanie odpowiada, jaką decyzję umożliwia, czego czytelnik dowiaduje się ponad proste streszczenie źródeł i co może zrobić na końcu. Ustal kryteria merytoryczne dla danego tematu. Liczba słów, podnagłówków i FAQ nie jest warunkiem jakości ani widoczności AI. [S5]

Przygotuj najpierw pięć wzorców na istniejących stronach:

| Strona / typ | Nowa wartość, którą trzeba opracować i sprawdzić |
|---|---|
| Border collie | Dopasowanie codziennego życia opiekuna, realistyczne zobowiązania, pytania do hodowcy lub organizacji adopcyjnej, sprawdzone przykłady aktywności; wzorzec FCI jako jedno ze źródeł |
| Opieka podczas wyjazdu | Porównanie sposobów opieki, lista ustaleń, przygotowanie domu i bezpośrednie przejście do wypełnienia listy |
| Objętość akwarium | Przykład nominalnej i rzeczywistej objętości, interpretacja wyniku kalkulatora i granice jego zastosowania |
| Gady | Zastosowanie metody do konkretnego, właściwie zidentyfikowanego gatunku i sprawdzony plan przygotowania środowiska |
| Pies/kot — karta atlasu | Samodzielna orientacja w potrzebach i zobowiązaniach oraz trafne dalsze materiały; rozstrzygnięcie nakładania się z hubem |

Źródła powinny wspierać konkretne twierdzenia. Dla zdrowia i opieki korzystaj z odpowiednich źródeł weterynaryjnych, organizacji dobrostanu i publikacji specjalistycznych; dla cech ras ze standardów właściwych organizacji. Ustalaj ograniczenia źródeł i rozbieżności. Nie kopiuj całych artykułów ani nie traktuj tekstu sklepu lub wyniku wyszukiwarki jako wystarczającego dowodu. Przykłady autorskie oznaczaj jako przykłady, nie obserwacje z badania, którego nie było.

### 3.2. Rozwijaj wszystkie grupy etapami

Docelowa architektura obejmuje psy, koty, króliki, gryzonie, fretki, ptaki, ryby i akwarystykę, gady, płazy oraz bezkręgowce. Przydziel właściciela i status każdej grupie. W obrębie szerokich grup schodź do gatunku tam, gdzie od niego zależy odpowiedź.

Uruchamiaj kompletny pakiet: użyteczny hub + materiał startowy + konkretne zadanie opiekuna + właściwy następny krok. To kryterium produktu, nie rzekomy próg Google. Priorytet brakujących grup ustal z zapytań użytkowników, odzyskiwanych adresów i dostępnych kompetencji. Królik jest konkretną ujawnioną luką, lecz nie udawaj, że wykonano badanie wielkości rynku.

Puste pola, redakcyjne plany i „brak potwierdzonych danych” przechowuj w CMS. Jeśli niepełna karta już ma adres i potencjalne wejścia, najpierw ją uzupełnij albo rozstrzygnij merytoryczne połączenie; nie usuwaj masowo ani nie przekierowuj na homepage. Nie publikuj setek niemal identycznych opisów ras, gatunków lub miast.

### 3.3. Popraw stronę główną i wyszukiwanie

Zachowaj rozpoznawalną identyfikację. Pierwszy ekran ma pokazać, komu portal pomaga, oraz pozwolić wybrać zwierzę lub zadanie. W treści głównej używaj języka potrzeb, np. przygotowanie domu, codzienna opieka, wyjazd, wybór usługi. Szczegóły procesu publikacji przenieś do zasad redakcyjnych.

Zrównoważ ekspozycję: blok polecanych nie powinien być wyłącznie katalogiem ras psów. Pokazuj różne zadania i gotowe grupy; nie eksponuj niekompletnych modułów jak ukończonych produktów. Podaj zakres katalogu zgodny z liczbą i jakością dostępnych firm.

Ujednolić należy zakres i opis wyszukiwarki. Docelowo wyniki mają obejmować dostępne poradniki, działy i narzędzia z oznaczonym typem. Obsłuż polskie znaki i sensowne synonimy, wykorzystując istniejące rozwiązanie. Przy braku wyników zaoferuj trafną alternatywę lub przejście do opublikowanych materiałów. Nie generuj niezweryfikowanej porady na żywo jako odpowiedzi na brak treści.

### 3.4. Dokończ narzędzia i ich otoczenie

Nie buduj kolejnych narzędzi, zanim istniejące nie staną się częścią ścieżek użytkownika. Zastąp surowe URL w treści opisowymi CTA. Przy kalkulatorze połącz wynik z poradnikiem o objętości; nie wyciągaj z litrażu automatycznych zaleceń obsady. Przy liście dla opiekuna dodaj przydatne instrukcje przekazania i przygotowania; dane użytkownika pozostają lokalne zgodnie z obietnicą.

Sprawdź: cm/cale, przecinek/kropkę, wartości zerowe i ujemne, kształty i sposób uwzględniania szkła/podłoża; listę wielu zwierząt, zapis po odświeżeniu, czyszczenie, druk i eksport. Zweryfikuj użycie na telefonie i klawiaturze. Nie wysyłaj treści prywatnej listy do analityki. Nowe narzędzie może powstać dopiero po wykazaniu luki, wiarygodnych danych i możliwości utrzymania.

Odbiór iteracji 2: pięć poprawionych wzorców, użyteczne karty startowe, zgodne filtry, trafne rekomendacje, działające scenariusze narzędzi i opis planu dla wszystkich grup. Pozostałe teksty poprawiaj partiami według danych o wartości, nie automatycznie przez ten sam szablon.

## 4. Iteracja 3 — odzyskanie ruchu, SEO / GEO / AEO i pomiar

### 4.1. Ochrona historii zoo24.pl

Zbierz dostępne historyczne URL z eksportów CMS/sklepu, kopii sitemap, analityki, Search Console, logów i raportów linków. GSC nie musi zawierać całej wieloletniej historii; wykorzystaj dostępne eksporty i archiwa. Zbuduj tabelę: stary adres → dawna intencja → aktualny status → ruch/linki, jeśli dostępne → decyzja → adres docelowy → test.

Kolejność: przywróć lub popraw wartościowy materiał pod dawnym adresem; gdy to właściwe, zastosuj jednoznaczne stałe przekierowanie do rzeczywistego następcy. Dla usuniętego produktu bez odpowiednika prawidłowa odpowiedź 404/410 może być lepsza niż przekierowanie do niepowiązanego poradnika. Nie kieruj wszystkich dawnych produktów i kategorii na homepage. Nie zmieniaj dobrego adresu tylko dla estetyki. Sprawdzaj łańcuchy, pętle i soft 404. [S6]

Oceń dostępne ważne adresy w Search Console i monitoruj rzeczywiste zapytania. Dawny ruch transakcyjny nie przechodzi automatycznie na portal poradnikowy. Raportuj osobno odzyskane wejścia na materiały historyczne i nowy ruch na nowych stronach. Nie obiecuj powrotu do 100 tys. wizyt w określonym terminie.

### 4.2. Widoczność w wyszukiwarkach i odpowiedziach AI

Podstawą są indeksowalne, dostępne strony, jasne odpowiedzi, wiarygodne źródła, własna wartość, spójne encje i trafne linkowanie. Nie twórz osobnej wersji treści dla robotów. Unikaj fałszywych wzmianek, wymyślonych ekspertów, ukrytych bloków słów kluczowych i masowego generowania stron. Google wprost nie wymaga specjalnego schematu GEO ani llms.txt; tego pliku nie traktuj jako zadania priorytetowego lub warunku widoczności. [S5]

Sekcje pytań i odpowiedzi dodawaj, jeśli odpowiadają na rzeczywiste pytania i nie dublują materiału. Nie obiecuj efektu z FAQPage: Google wycofał FAQ rich results od 7 maja 2026. [S7]

Sprawdź w istniejącym GSC ustawienie Search generative AI i raport Generative AI performance. Raport dotyczy wyświetleń w funkcjach generatywnych; nie nazywaj ich kliknięciami ani przychodem. Brak raportu może wynikać z niewystarczającej liczby wyświetleń. Uzupełnij go o klasyczne wyniki Search i analitykę wejść. [S8–S9]

Po uzyskaniu dostępu wykorzystaj Bing Webmaster Tools i AI Performance do obserwacji cytowań. Dostęp robotów do wyszukiwania w ChatGPT sprawdzaj przez OAI-SearchBot; decyzja o GPTBot/treningu jest osobna. Zweryfikuj robots i ewentualne reguły zapory bez wyłączania zabezpieczeń całego serwisu. Żadne ustawienie ani schemat nie gwarantuje cytowania. [S10–S11]

Utwórz małą próbę reprezentatywnych pytań, datuj obserwacje i zapisuj cytowane adresy. Takie obserwacje są pomocnicze i zmienne; nie przekształcaj jednej odpowiedzi modelu w „udział w rynku AI”.

### 4.3. Analityka i jakość działania

Najpierw zinwentaryzuj istniejące integracje i `/api/out`, aby nie podwajać zdarzeń. Zdefiniuj pomiar bez treści prywatnych formularzy. Przykładowe zdarzenia: wyszukiwanie bez wyniku, przejście poradnik→narzędzie, poprawny wynik kalkulatora, eksport listy, kliknięcie strony firmy/telefonu, kliknięcie partnerskie i faktycznie potwierdzona konwersja z programu. Wartość wyszukiwania należy przetwarzać ostrożnie, bez utrwalania przypadkowych danych osobowych.

Odróżniaj użycie narzędzia od odsłony, kliknięcie telefonu od rozmowy, rozmowę od rezerwacji, kliknięcie afiliacyjne od zaakceptowanej prowizji. Podstawowy raport ma obejmować: ruch organiczny, ważne strony i zapytania, ukończone zadania użytkownika, konwersje, przychód zaakceptowany, koszty i czas obsługi.

Wykonaj pomiary wydajności właściwymi narzędziami. Jeżeli brak danych terenowych, oznacz to; wynik laboratoryjny nie jest pomiarem realnych użytkowników. Docelowo oceniaj LCP ≤ 2,5 s, INP ≤ 200 ms i CLS ≤ 0,1 w 75. percentylu, oddzielnie dla mobile i desktop. Audyt z 23.11 nie dostarczył wyniku CWV. [S12]

Odbiór iteracji 3: raport historycznych adresów z decyzjami, sprawdzona indeksowalność reprezentatywnych stron, działające i niezdublowane pomiary, baseline z okresu rzeczywiście objętego danymi oraz jasno nazwane braki dostępu. Brak danych nie ma blokować poprawy HTML, treści i UX.

## 5. Iteracja 4 — monetyzacja i dystrybucja

### 5.1. Dwa pilotaże przychodu

**Pilotaż A: poradnik zakupowy i afiliacja.** Wybierz potrzebę z istniejącym zainteresowaniem albo testowalną hipotezą, np. wyposażenie do przygotowania opieki lub akwarium. Opracuj kryteria doboru, porównanie sensownych wariantów, ograniczenia i datę sprawdzenia. Rekomendacje muszą wynikać z potrzeb zwierzęcia, nie wysokości prowizji. Podłącz rzeczywiście dostępny program partnerski dopiero po sprawdzeniu warunków i uprawnień. Oznacz linki i relacje komercyjne; płatne linki kwalifikuj odpowiednio, np. `rel="sponsored"`. Nie nazywaj przeglądu ofert własnym testem. [S13]

**Pilotaż B: użyteczny katalog i płatna ekspozycja.** Skoncentruj pierwszą pracę na jednej kategorii i dwóch lokalizacjach dobranych na podstawie danych lub jawnego założenia. Zbuduj realny wybór, np. planistycznie 10–15 sprawdzonych profili na lokalizację, jeśli pozwala na to rynek i budżet. To cel pilotażu, nie próg SEO. Dane sprawdzaj w uprawnionych źródłach, z datą i zakresem weryfikacji. Zachowaj bezpłatny profil podstawowy i możliwość korekty. Sprzedawaj oznaczone wyróżnienie lub dodatkową prezentację, nie fałszywą ocenę, pierwszeństwo w rzetelności ani obietnicę określonej liczby klientów.

Przygotuj ofertę na podstawie obecnych wyświetleń, kliknięć i kosztów. Jeżeli ruch jest zbyt mały, uczciwie opisz ofertę pilotażową. Historycznych 100 tys. wizyt nie prezentuj jako obecnego zasięgu. Ceny i docelowy przychód pozostają hipotezami do walidacji.

W obu pilotażach policz przychód zaakceptowany minus koszt pozyskania, publikacji, review, narzędzi i obsługi. Afiliacja: sesje kwalifikowane × odsetek kliknięć × konwersja partnera × zaakceptowana prowizja, z oznaczeniem nieznanych danych. Katalog: faktycznie płacący klienci × średnia opłata minus obsługa i pozyskanie. Nie raportuj brutto jako zysku.

Reklamy display i większe współprace sponsorowane rozważ po zebraniu danych o ruchu, utrzymaniu użytkownika i kosztach. Rezerwuj miejsce reklamowe tak, aby nie psuć czytelności i stabilności układu. Partner komercyjny nie może narzucać nieprawdziwych wniosków.

### 5.2. Powrót Facebooka i Instagrama

Potwierdź właściwe profile, ich dostępność, właściciela, stan uprawnień i aktualne statystyki. Zachowaj istniejącą publiczność, jeśli konta są dostępne. Zaktualizuj powiązania profili i portalu w ramach posiadanych uprawnień. Zaproponuj przypiętą informację o nowym portalu, a potem praktyczne materiały pomagające przejść do narzędzia albo poradnika.

Przygotuj pierwszą paczkę 12 publikacji rozłożonych na około cztery tygodnie, jako hipotezę tempa do oceny, nie obowiązek ilościowy. Każda publikacja ma: odbiorcę, jedną korzyść, zweryfikowane fakty, format dopasowany do kanału, właściwy link/CTA i UTM tam, gdzie link może prowadzić do serwisu. Nie zakładaj, że link w każdym opisie Instagrama działa jak link w serwisie. Wykorzystuj karuzele z checklistą, krótkie wyjaśnienia narzędzi i odpowiedzi na rzeczywiste pytania. Nie kopiuj jednego posta bez adaptacji między kanałami.

Publikuj przez faktycznie skonfigurowane, uprawnione integracje. Jeżeli nie ma dostępu, przygotuj gotową kolejkę i podaj jeden konkretny krok potrzebny do połączenia konta. Nie twierdź, że działa publikacja lub agent 24/7, jeśli jest wyłącznie plik z planem.

Nie wysyłaj automatycznie wiadomości do dawnych klientów ani masowego outreachu. Wykorzystanie istniejących baz kontaktów wymaga sprawdzenia ich przeznaczenia i zgód. Newsletter może być prostą nową ścieżką zapisu według grup zwierząt, jeśli realnie da się go utrzymywać.

### 5.3. Utrzymanie przy małym nakładzie właściciela

Najpierw wykorzystaj istniejące procesy i harmonogram. Dla zadań cyklicznych skonfiguruj rzeczywisty mechanizm uruchamiania, kolejkę, retry z limitem, kontrolę duplikatów, budżet oraz raport błędów. Claude Code uruchomiony w sesji nie jest sam w sobie stale działającym operatorem.

Automatyzuj pobieranie danych, wykrywanie problemów, przygotowywanie draftów, kontrolę linków, przypomnienia o przeglądzie i publikację w już przyznanym zakresie. Sprawy wymagające kompetencji człowieka obsługuje przypisany redaktor lub specjalista. Właściciel dostaje krótki tygodniowy raport: wyniki, koszty, wykonane zmiany i maksymalnie kilka konkretnych decyzji. Rzeczywiste awarie zgłaszaj od razu.

Odbiór iteracji 4: dwa kompletne pilotaże z pomiarem albo jasno nazwaną zewnętrzną blokadą, kolejka social, działające połączenia w przyznanym zakresie i sprawdzony proces utrzymania. Nie uznawaj samego przygotowania komponentu cenowego za uruchomienie modelu biznesowego.

## 6. Testy i raport końcowy

Testuj ryzyka, które zmieniasz: taksonomię i filtry, daty, schema, reguły indeksowania, trafność rekomendacji, historyczne URL, obliczenia, lokalny zapis i eksport, ścieżki kontaktu i analitykę. Wykonaj kontrolę mobile oraz obsługi klawiaturą dla kluczowych widoków. Formularze sprawdzaj w środowisku testowym bez wysyłania fikcyjnych zgłoszeń do rzeczywistych firm. Nie uruchamiaj rzeczywistych połączeń telefonicznych jako testu.

Wdrożenia wykonuj zgodnie z istniejącymi uprawnieniami i procesem projektu. Przygotuj preview i plan wycofania. Jeśli publikacja na produkcji jest już autoryzowana, wykonaj ją po przejściu istotnych kontroli; jeśli nie, przedstaw konkretny gotowy zakres do decyzji, nie pytaj o każdą odwracalną zmianę w repozytorium. Nie uruchamiaj płatnych usług ani kampanii poza przyznanym budżetem.

Raport końcowy ma zawierać:

1. Co faktycznie zmieniono i jakie zadanie użytkownika jest teraz łatwiejsze.
2. Listę adresów reprezentujących poprawione szablony i treści.
3. Wyniki istotnych testów, rzeczywiste pomiary i nieusunięte ograniczenia.
4. Status napraw A01–A16: wykonane, nieaktualne, częściowe lub zablokowane, z dowodem.
5. Stan odzyskiwania starych URL i brakujące źródła historycznych danych.
6. Status integracji SEO, analityki, social i monetyzacji; odróżnienie draftu od uruchomionej funkcji.
7. Koszty, następny priorytet i zbiorczą listę decyzji właściciela.

Sukces pierwszego etapu to spójny, wiarygodny portal pomagający wykonać konkretne zadania, z działającym pomiarem i gotowymi do walidacji ścieżkami przychodu. Pozycje, cytowania i przychód trzeba dopiero zmierzyć.

---

# Źródła zasad i zaleceń

Dokument opiera obserwacje ZOO24 na odczycie produkcji z 23.11.2026. Poniższe źródła dotyczą zasad platform i obowiązków, a nie wyników biznesowych portalu. Wnioski produktowe, kolejność pracy i cele pilotaży są rekomendacjami z audytu.

- **S1:** Komisja Europejska, art. 50 AI Act: https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50
- **S2:** Komisja Europejska, wyjaśnienia przejrzystości i rzeczywistego przeglądu: https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act
- **S3:** Google, wykorzystanie treści generatywnych: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
- **S4:** Google, Article structured data: https://developers.google.com/search/docs/appearance/structured-data/article
- **S5:** Google, aktualny przewodnik optymalizacji dla funkcji generatywnych: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- **S6:** Google, migracje i mapowanie adresów: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- **S7:** Google, historia aktualizacji dokumentacji, wpisy o FAQ z maja i czerwca 2026: https://developers.google.com/search/updates
- **S8:** Search Console, Search generative AI control: https://support.google.com/webmasters/answer/16908024
- **S9:** Search Console, Generative AI performance report: https://support.google.com/webmasters/answer/16984139
- **S10:** Bing, AI Performance: https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/
- **S11:** OpenAI, przeznaczenie crawlerów: https://developers.openai.com/api/docs/bots
- **S12:** web.dev, Core Web Vitals i progi pomiaru: https://web.dev/articles/vitals
- **S13:** Google, kwalifikowanie płatnych linków: https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links


---

# Załącznik: inwentaryzacja publicznych ścieżek

Stan odczytu z 23.11.2026. Wszystkie poniższe ścieżki zwróciły HTTP 200. Kolumna noindex opisuje odczytaną dyrektywę, nie obecność w indeksie Google. Parametry zapytań sprawdzono osobno w trzech scenariuszach opisanych w części A.

| Ścieżka | W sitemap | Noindex |
|---|---|---|
| `/` | tak | nie |
| `/blog/basenji-n78` | tak | nie |
| `/blog/border-collie-n61` | tak | nie |
| `/blog/cane-corso-n63` | tak | nie |
| `/blog/chihuahua-n99` | tak | nie |
| `/blog/corgi-n107` | tak | nie |
| `/blog/dalmatynczyk-n76` | tak | nie |
| `/blog/doberman-n60` | tak | nie |
| `/blog/jack-russell-terrier-n95` | tak | nie |
| `/blog/jamnik-n112` | tak | nie |
| `/blog/kot-bengalski-n65` | tak | nie |
| `/blog/kot-brytyjski-n66` | tak | nie |
| `/blog/kot-syberyjski-n67` | tak | nie |
| `/blog/kot-syjamski-n69` | tak | nie |
| `/blog/maine-coon--n124` | tak | nie |
| `/blog/maltanczyk-n77` | tak | nie |
| `/blog/owczarek-niemiecki-n96` | tak | nie |
| `/blog/ragdoll-n116` | tak | nie |
| `/blog/shiba-inu--n100` | tak | nie |
| `/blog/shih-tzu-n62` | tak | nie |
| `/blog/west-highland-white-terrier-n79` | tak | nie |
| `/dla-firm` | tak | nie |
| `/dodaj-firme` | nie | tak |
| `/firma/animalroom-r01` | nie | tak |
| `/firma/groom-room-r09` | nie | tak |
| `/firma/kudlate-historie-r02` | tak | nie |
| `/firma/kudlatek-studio-psiej-urody-r10` | tak | nie |
| `/firma/luxpies-r06` | nie | tak |
| `/firma/pom-pom-r05` | nie | tak |
| `/firma/psi-fryzjer-r03` | nie | tak |
| `/firma/salonik-dla-pupila-r08` | nie | tak |
| `/firma/strefa-psa-r04` | tak | nie |
| `/firma/yuti-dog-spa-r07` | nie | tak |
| `/kontakt` | nie | nie |
| `/narzedzia` | tak | nie |
| `/narzedzia/kalkulator-akwarium` | tak | nie |
| `/narzedzia/lista-dla-opiekuna` | tak | nie |
| `/o-nas` | tak | nie |
| `/polec-miejsce` | nie | tak |
| `/polityka-prywatnosci` | nie | tak |
| `/poradniki` | tak | nie |
| `/poradniki/akwarium-objetosc-nominalna-a-rzeczywista` | tak | nie |
| `/poradniki/co-ustalic-przed-pierwsza-wizyta-u-groomera` | tak | nie |
| `/poradniki/gady-wymagania-gatunku-przed-zakupem-wyposazenia` | tak | nie |
| `/poradniki/informacje-dla-opiekuna-kota` | tak | nie |
| `/poradniki/jak-wybrac-opieke-dla-psa-na-czas-wyjazdu` | tak | nie |
| `/poradniki/ptaki-opieka-na-czas-wyjazdu` | tak | nie |
| `/regulamin` | nie | tak |
| `/reklama-i-wspolprace` | nie | nie |
| `/status-zgloszenia` | nie | tak |
| `/uslugi` | tak | nie |
| `/uslugi/groomer` | tak | nie |
| `/uslugi/groomer/bialystok` | nie | tak |
| `/uslugi/groomer/bydgoszcz` | nie | tak |
| `/uslugi/groomer/gdansk` | nie | tak |
| `/uslugi/groomer/krakow` | nie | tak |
| `/uslugi/groomer/lodz` | nie | tak |
| `/uslugi/groomer/lublin` | nie | tak |
| `/uslugi/groomer/poznan` | nie | tak |
| `/uslugi/groomer/szczecin` | nie | tak |
| `/uslugi/groomer/warszawa` | nie | tak |
| `/uslugi/groomer/wroclaw` | nie | tak |
| `/uslugi/hotel-dla-zwierzat` | nie | tak |
| `/zasady-redakcyjne` | nie | nie |
| `/zglos-blad` | nie | nie |
| `/zwierzeta` | tak | nie |
| `/zwierzeta/akwarystyka` | tak | nie |
| `/zwierzeta/gady` | tak | nie |
| `/zwierzeta/koty` | tak | nie |
| `/zwierzeta/koty/kot-domowy` | tak | nie |
| `/zwierzeta/psy` | tak | nie |
| `/zwierzeta/psy/pies-domowy` | tak | nie |
| `/zwierzeta/ptaki` | tak | nie |
