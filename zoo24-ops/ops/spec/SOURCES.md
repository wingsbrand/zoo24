# Źródła i status ustaleń

**Weryfikacja publicznej dokumentacji: 22 listopada 2026.** Przed integracją ponownie sprawdź wersję API/SDK, dostępność na koncie, limity i aktualne warunki. Źródła nie potwierdzają własności kont ZOO24, obecnego ruchu ani wykonania wdrożenia.

Architektura registry/gateway, częstotliwość pracy, limity publikacji, 600 zł jako propozycja cap, cele czasu właściciela i procedury odbioru są rekomendacją projektową, nie deklaracją dostawcy ani prognozą finansową. Historyczne 100k+ wejść oraz kilkanaście tys. fanów pochodzą z informacji właściciela w tej rozmowie i wymagają odrębnego pomiaru bieżącego stanu.

## Claude Code i uruchamianie

| ID | Źródło pierwotne | Co uzasadnia |
|---|---|---|
| C01 | [Anthropic: cloud scheduled tasks](https://code.claude.com/docs/en/routines) | zadania chmurowe i status research preview; konfiguracja i kontrola dostępu |
| C02 | [Anthropic: porównanie harmonogramów i /loop](https://code.claude.com/docs/en/scheduled-tasks) | różnica cloud, Desktop i pracy powiązanej z sesją |
| C03 | [Anthropic: harmonogramy Desktop](https://code.claude.com/docs/en/desktop-scheduled-tasks) | wymagania lokalnej aplikacji i komputera |
| C04 | [Anthropic: Agent SDK overview](https://code.claude.com/docs/en/agent-sdk/overview) | SDK uruchamiane w procesie operatora; warianty integracji |
| C05 | [Anthropic: uruchamianie programowe](https://code.claude.com/docs/en/headless) | nieinteraktywne wykonanie i wyniki strukturalne |
| C06 | [Anthropic: permissions w Agent SDK](https://code.claude.com/docs/en/agent-sdk/permissions) | zakres reguł oraz kolejność allow/deny/callback; callback nie jest jedyną granicą |
| C07 | [Anthropic: hosting SDK](https://code.claude.com/docs/en/agent-sdk/hosting) | środowisko wykonawcze, izolacja i hosting procesu agenta |
| C08 | [Anthropic: subagenci](https://code.claude.com/docs/en/sub-agents) | projektowe pliki .claude/agents i ograniczanie narzędzi |

**Korekta względem Startera:** chmurowy zaplanowany run może pracować niezależnie od laptopa. Nadal potrzebuje realnej konfiguracji, repo i dozwolonych integracji. Nie utożsamiaj samej definicji agenta z aktywnym zadaniem. Nie zakładaj, że abonament interaktywnego Claude automatycznie finansuje wybrany wariant SDK/API.

## Google i SEO

| ID | Źródło pierwotne | Co uzasadnia |
|---|---|---|
| G01 | [Google: generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) | jakość, rzetelność i zalecenie ręcznego sprawdzenia AI treści |
| G02 | [Google: migracje URL](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) | sensowna mapa adresów, adekwatne przekierowania i ich utrzymanie |
| G03 | [Google: Search Analytics query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) | ograniczenie kompletności zwracanych wierszy i uprawnienia odczytu |
| G04 | [Google: URL Inspection API](https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect) | stan wersji w indeksie, ograniczenia testu live |
| G05 | [Google: Indexing API quickstart](https://developers.google.com/search/apis/indexing-api/v3/quickstart) | API ograniczone do kwalifikujących się typów stron; nie zwykłe poradniki/katalog |
| G06 | [Google: diagnozowanie spadków ruchu](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops) | okno 16 miesięcy i porównywanie danych z uwzględnieniem okresu/sezonu |
| G07 | [Google: prośba o recrawl](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl) | zgłoszenie i sitemap nie gwarantują indeksacji |
| G08 | [Google: spam policies](https://developers.google.com/search/docs/essentials/spam-policies) | masowa mało wartościowa zawartość, doorways i manipulacje linkami |

Wymóg zatwierdzania nowych treści przez wyznaczonego redaktora jest świadomym wyborem modelu operacyjnego ZOO24 uwzględniającym zalecenia jakościowe. Nie oznacza obowiązku osobistego czytania wszystkiego przez właściciela ani gwarancji rankingu po review.

## Facebook / Instagram

| ID | Źródło pierwotne | Co uzasadnia |
|---|---|---|
| M01 | [Meta: Instagram content publishing](https://developers.facebook.com/documentation/instagram-platform/content-publishing) | konta i formaty, warianty logowania/uprawnień, gotowe media dostępne dla API |
| M02 | [Meta: Pages posts](https://developers.facebook.com/documentation/pages-api/posts) | operacje na postach strony i harmonogram publikacji |
| M03 | [Meta: Page Feed](https://developers.facebook.com/docs/graph-api/reference/page/feed/) | odczyt i publikacja zależne od właściwego konta, ról i scope |
| M04 | [Meta: IG Media](https://developers.facebook.com/documentation/instagram-platform/reference/instagram-media) | funkcje odczytu, aktualizacji i usuwania mają określony zakres |

Nie utrwalaj limitów Meta w kodzie na podstawie pojedynczej liczby ze strony: weryfikuj limit dla właściwego endpointu/konta i zastosuj własny znacznie niższy cap. Możliwość zatrzymania lub poprawienia już wysłanej publikacji wymaga sprawdzenia dla danego formatu. Nie przenoś założeń z FB na IG.

## Prawo i dane

| ID | Źródło pierwotne | Zastosowanie |
|---|---|---|
| L01 | [Sejm: Prawo komunikacji elektronicznej, art. 398](https://api.sejm.gov.pl/eli/acts/DU/2024/1221/text.html) | punkt wyjścia do oceny zgody dla właściwej formy informacji handlowej/marketingu; sprawdzić bieżący stan zmian |
| L02 | [UODO: obowiązki administratora wobec osób, których dane przetwarza](https://uodo.gov.pl/pl/645/4097) | obowiązki informacyjne, cele, podstawy, retencja i prawa osób |

To referencje do przeglądu konkretnego modelu przez kompetentną osobę, nie opinia prawna o całej działalności. Zakres potrzebny przed live zależy od faktycznego CMS, danych firm, umów, analityki i komunikacji. Nie dziedzicz niezweryfikowanych numerów aktów prawnych ze starszych dokumentów. Nie rozumuj „publiczny e-mail = zgoda na każdą reklamę”.
