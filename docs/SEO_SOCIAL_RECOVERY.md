# ZOO24.pl — odzyskanie SEO i reaktywacja Facebooka / Instagrama

**Wersja:** 1.2 | **Data:** 22.11.2026 | **Status:** specyfikacja wykonawcza dla Claude Code.  
**Czytaj razem z:** `MASTER_PLAN.md`, `AUTOMATION_RUNBOOK.md`, `../CLAUDE.md`, `STATUS.md`.  
**Cel:** przywrócić możliwie dużą część *wartościowego* ruchu i ponownie zaangażować dotychczasowych obserwujących, a następnie przekierować ten potencjał do nowego katalogu usług i poradników — przy minimalnym czasie właściciela.

## 1. Fakt wejściowy i granice obietnicy

Właściciel deklaruje, że **dawny sklep generował ponad 100 000 wejść organicznych miesięcznie** i miał **kilkanaście tysięcy obserwujących na Facebooku i Instagramie**. To HISTORYCZNA deklaracja właściciela, **nie** aktualny odczyt GA4/GSC/Meta Insights ani prognoza możliwości odzyskania ruchu. Liczba obserwujących może być łączna lub dotyczyć osobnych profili — zweryfikować po podłączeniu kont. Nie przypisywać fikcyjnych wartości do raportów.

**Najważniejsza korekta strategii MVP:** historyczne zasoby SEO + oficjalne konta społecznościowe stają się **współrównorzędnym źródłem przewagi**, obok katalogu usług. Nie zakładać, że sam katalog będzie wystarczającym źródłem ruchu. **Nie** budować ponownie sklepu, koszyka, dropshippingu ani własnej obsługi zamówień.

**Problem do rozwiązania:** stary ruch mógł pochodzić głównie z nazw karm, produktów, marek i zapytań zakupowych. Taki ruch nie przełoży się automatycznie na lokalne usługi. Dlatego utrzymujemy dwa zgodne z intencją filary:

1. **Poradniki i porównania produktów** — dla tematycznych zapytań dawnego sklepu, jeśli istnieje rzeczywista, unikalna użyteczność i prawa do treści; monetyzacja afiliacyjna i ewentualne reklamy display przy odpowiedniej skali.
2. **Katalog usług i poradniki o usługach** — dla nowych, lokalnych intencji; monetyzacja profilami premium nieweterynaryjnymi.

**Zakaz:** nie tworzyć pozornej repliki sklepu lub tysięcy automatycznie wygenerowanych „kart produktów” wyłącznie po to, by odzyskać pozycje. Treści muszą odpowiadać na rzeczywistą potrzebę użytkownika.

## 2. Audyt aktywów: wejścia, format i wynik

### 2.1. Dane potrzebne do rzeczywistej oceny możliwości odzyskania ruchu

| Źródło | Bezpieczny eksport/dostęp | Zadanie agenta | Efekt |
|---|---|---|---|
| Google Search Console | odczyt tylko dla property zoo24.pl; historyczne zapytania/strony, kliknięcia, impressions, CTR, pozycje; możliwie dostępne 16 miesięcy | `zoo24-seo` | `docs/audits/gsc-baseline.md`, top zapytania i URL, trend po zamknięciu sklepu |
| GA4 / wcześniejsza analityka | zestawienia agregowane, historycznie dostępne okresy, landing page, kanał, konwersje; nie eksportować PII | `zoo24-analytics` | oddzielne dane **sessions** vs **clicks**; raport źródeł i sezonowości |
| Sitemapy, kopia sklepu, własne logi | eksport URL i statusów, legalny crawl własnej domeny, własny backup | `zoo24-seo` + `zoo24-builder` | inwentarz URL, rozkład typów stron, 404/5xx i realne zapytania botów |
| Backlinki | eksport GSC + opcjonalnie licencjonowane narzędzie | `zoo24-seo` | domeny linkujące, najbardziej wartościowe dawne URL-e, lista outreach do redakcji po uzyskaniu zgody |
| Facebook Page / Meta Business Suite | odczyt Insights przez uprawnionego administratora, statystyki 90/180/365 dni o ile dostępne | `zoo24-social` + `zoo24-analytics` | liczba obserwujących dziś, zasięg, interakcje, tematy i najlepsze formaty |
| Instagram Professional / Insights | odczyt statystyk legalnym kanałem; audyt rodzaju konta i powiązania z Facebook Page | `zoo24-social` | realna liczba obserwujących, zasięg, zapisy, wyświetlenia profilu, kliknięcia linku |
| Prawa i tożsamość | potwierdzenie, kto kontroluje domenę, fanpage, IG, logo, zdjęcia, stare artykuły i dostęp do API | `zoo24-compliance` | **GO/NO-GO** do zmiany komunikacji i ponownego użycia aktywów |

Jeśli danych brakuje, agent ma dostarczyć **format eksportu i instrukcję dostępu read-only**, a nie zgadywać statystyki. Nigdy nie prosić o hasła w czacie, tokeny w pliku czy dane dawnych klientów.

### 2.2. Trzy baseline'y — nie wolno ich mieszać

- **Historyczny benchmark:** deklarowane ponad 100 tys. wejść organicznych/miesiąc w najlepszym okresie starego sklepu, do potwierdzenia raportami. Nie jest to cel gwarantowany ani aktualna baza.
- **Bieżący punkt odniesienia:** średnia z **ostatnich 28 pełnych dni** dla GSC, analityki i Meta — dopiero po podłączeniu danych.
- **Efekt odbudowy:** zmiana względem bieżącego punktu odniesienia, z wyszczególnieniem stron odtworzonych, ruchu poradnikowego, lokalnego i social; porównywać także sezonowość/okresy rok do roku, jeśli są dane.

## 3. SEO: strategia odzyskania dawnego potencjału

### 3.1. Inwentarz i priorytety

`zoo24-seo` tworzy `docs/audits/old-url-inventory.csv` na podstawie **danych**, nie heurystyk z domeny. Schemat początkowy w `seo-url-mapping.template.csv`. Każdy URL ma: dawny typ, historyczne kliknięcia, wartościowe linki, aktualny status HTTP, intencję, prawa do treści, decyzję i adres docelowy, uzasadnienie oraz akceptację człowieka.

**Segmenty:**

- `A/brand` — stare URL-e marki lub o nas: zachować na potrzeby zrozumiałego komunikatu „ZOO24 ma nową formułę”.
- `B/editorial` — stare poradniki i FAQ: zachować/odświeżyć pod **tym samym adresem**, jeśli jest to możliwe, legalne i wartościowe.
- `C/product-intent` — wartościowe intencje zakupowe: badać możliwość stworzenia **autentycznego** poradnika porównawczego, checklisty zakupu lub niekomercyjnego FAQ; 301 tylko gdy nowa strona rzeczywiście odpowiada tej samej potrzebie. Nie przekierowywać wszystkich kart produktów na jedną stronę porównania.
- `D/service-adjacent` — treści o pielęgnacji i opiece: powiązać z katalogiem i poradnikami usługowymi, bez sztucznego zmieniania intencji.
- `E/expired` — nieaktualne produkty/promocje/parametry bez sensownego odpowiednika: 404 lub 410, jeśli trwale usunięte; nie przekierowywać na homepage.

**Priorytet:** ręczna kontrola TOP 100 dawnych adresów według kliknięć i osobno TOP 100 według wartości linków (z deduplikacją). Druga kolejka: 101–500. P0 zawsze adresy z istotnym ruchem/linkami i realną możliwością dostarczenia zgodnej intencji. Nie przetwarzać masowo tysięcy 301 bez testu zgodności.

**Decyzje serwerowe:**

| Przypadek | Działanie | Niedozwolony skrót |
|---|---|---|
| Wartościowy, legalnie posiadany poradnik nadal aktualny | zwróć `200`, odśwież treść, zachowaj URL jeśli możliwe | przekierowanie na nową kategorię bez potrzeby |
| Zmiana ścieżki, nowa strona ściśle odpowiada dawnej intencji | `301` lub `308` do bezpośredniego finalnego URL, po sprawdzeniu | łańcuchy, pętle, link do nieistniejącej strony |
| Karta produktu bez równoważnego materiału | `404/410`, ewentualnie użyteczna strona błędu bez mylącego statusu 200 | masowy `301` na `/`, `/poradniki` lub groomera |
| Brak prawa do dawnej treści | nie kopiuj; twórz tylko własną treść po researchu, ocena przekierowania osobno | pobieranie archiwum cudzego contentu bez praw |
| Stara strona zakupowa nadal uzyskuje ruch | pokaż użyteczny, jawnie informacyjny materiał tylko jeśli jest zgodny z intencją i legalny; brak przycisku „Kup u nas” | fikcyjna dostępność/produkt/cena |

Pamiętać o canonicalach, sitemapach tylko ważnych stron, prawidłowych nagłówkach cache, własnych linkach wewnętrznych, `noindex` stagingu i testach Googlebot. Zmiana struktury w **obrębie zoo24.pl** nie wymaga w GSC narzędzia Change of Address (służy do przenoszenia między domenami/subdomenami); wymaga natomiast kontroli indeksacji, nowej mapy i poprawnych przekierowań.

### 3.2. Strategia treści zależna od dawnego GSC

Agent tworzy **dwie kolejki**, nie jedną listę SEO:

- **Recovery queue:** TOP 20 historycznie wartościowych tematów możliwych do legalnego przywrócenia/odświeżenia; przypisanie `source-query -> target-URL -> intent -> real added value -> source -> review`.
- **Service queue:** 6–8 materiałów MVP, a potem 1–2/miesiąc odpowiadających rzeczywistym potrzebom katalogu i miast.

Przykłady zadań wyłącznie hipotetyczne, nie deklaracja aktualnych rankingów: „jak dobrać szelki dla psa” → neutralna checklista zakupowa (możliwa afiliacja), „jak często kąpać psa” → praktyczny poradnik z ostrożnym językiem i konsultacją źródeł, „hotel dla psa Warszawa” → katalog realnych, sprawdzonych ofert. **Żaden produktowy URL nie ma automatycznie prowadzić do lokalnego hotelu/groomera.**

AI przygotowuje research, brief, strukturę, propozycje title, meta, linkowanie, alternatywne wersje i raport brakujących źródeł. **Publikacja** wymaga oryginalnej wartości, sprawdzenia faktów i praw do zdjęć, bez wymyślonych ekspertów, recenzji ani doświadczeń „przetestowaliśmy”. Materiały o zdrowiu zwierząt — specjalna ścieżka recenzji specjalistycznej lub wykluczenie z MVP.

### 3.3. Stała obsługa SEO przez Claude i automatyzacje

**Nie wystarczy jednorazowy audyt.** Zbudować zadania operacyjne i raportowanie:

| Cykl | Automatyczne zadanie | Wymagany wynik |
|---|---|---|
| Codziennie | status domeny/SSL, próbki ważnych URL, 5xx, anomalie 404, robots, sitemap, status tasków | alert tylko dla krytycznych błędów |
| Co tydzień | pobierz dozwolone agregaty GSC, różnice `clicks/impressions/CTR/position` dla URL i zapytań, stan indeksacji | `reports/seo/YYYY-WW.md`: co urosło, co spadło, 3 zadania najwyższego wpływu |
| Co tydzień | skontroluj top URL-e po migracji (301/200/404/410), mapę, błędne canonicale | lista poprawek w PR, nie automatyczne przekierowania produkcyjne |
| Co 2 tygodnie | zaktualizuj content backlog z trendów i luk oraz istniejących, wiarygodnych źródeł | 2–4 briefy do akceptacji/weryfikacji |
| Co miesiąc | przegląd Core Web Vitals, broken links, duplikacji, aktualności artykułów i afiliacji | plan napraw + wykonanie zmian kodowych po testach |
| Co 90 dni | ocena ruchu odzyskanego i przychodów z obu typów intencji | decyzja: rozbudować / zmienić / wstrzymać klaster |

Automaty mogą tworzyć branche, drafty i PR-y z testami. **Nie mogą samodzielnie nadpisywać mapy 301 produkcji ani publikować ryzykownych treści.** Progi alertów dostroić po poznaniu realnego baseline'u; tymczasowy sygnał do zbadania: spadek kliknięć o ~30% vs mediana czterech poprzednich porównywalnych tygodni, przy wystarczającej próbie i bez świąt/sezonowości. Nie traktować tego jako dowodu kary Google.

## 4. Reaktywacja social media: Facebook i Instagram ZOO24

### 4.1. Audyt i plan relaunchu

W pierwszym kroku potwierdzić, że właściciel rzeczywiście kontroluje **właściwe** konto Facebook Page i konto Instagram; sprawdzić status administracyjny, polityki Meta, podpięte zasoby firmowe, rodzaj konta Instagram (Professional dla API), dostępne Insights i historię reakcji. Nie kupować obserwujących ani nie tworzyć kopii kont tylko dla „łatwego” API. Stare komentarze i wiadomości mogą zawierać dane osobowe — w analizie używać agregatów, nie kopiować całych DM do repo.

**Komunikacja zmiany:** jasno powiedzieć, że **stary sklep nie wraca w formule sklepu**. Nowa propozycja: „ZOO24 wraca z poradami i wyszukiwarką usług dla zwierząt”; nie sugerować, że działają dawne promocje, zamówienia czy gwarancje. Po zatwierdzeniu: zaktualizować bio, link w profilu, przypięty post, wyróżnione relacje (jeśli możliwe) i opis strony. Zachować archiwalne wpisy, jeżeli nie wprowadzają w błąd; konieczne edycje/usunięcia tylko po decyzji administratora.

**Etapy reaktywacji:**

1. **Dni 1–7 po zgodzie:** audyt Meta Insights, zapis baseline'u, przygotowanie 2 wersji postu „nowa formuła ZOO24” oraz grafiki bez cudzych praw; właściciel zatwierdza komunikat.
2. **Tydzień 2:** przypięty post, 2 edukacyjne materiały, 1 angażujący format/pytanie; aktualizacja bio i legalnych linków UTM.
3. **Tydzień 3–4:** 2–3 posty/tydzień na kanał (tematy można adaptować, nie ślepo duplikować), jeden materiał zachęcający do wizyty w poradniku, jeden edukacyjny, jeden o usługach lub aktywizujący.
4. **Miesiąc 2–3:** kalendarz oparty na wynikach zasięgu i przekierowań do serwisu; test 1 wspólnego posta/miesiąc z usługodawcą za obopólną zgodą. Zwiększać częstotliwość tylko gdy jakość i realne zaangażowanie rosną.

**4 filary treści:** (A) praktyczna opieka i pielęgnacja bez porad diagnostycznych; (B) wybór usługi i checklisty; (C) angażujące pytania do opiekunów, bez proszenia o dane wrażliwe; (D) historie i doświadczenia realnych firm/odbiorców wyłącznie za zgodą i z prawami do zdjęć. Udziały testowe: 40/30/20/10 — hipoteza, do korekty po Insights.

### 4.2. Przykładowe 4 tygodnie treści (do weryfikacji)

| Tydzień | Facebook | Instagram | Cel/CTA |
|---|---|---|---|
| 1 | Post powitalny „ZOO24 wraca w nowej formule”; checklista wyboru groomera | Karuzela: 5 pytań do groomera; krótka grafika o zmianie | Wyjaśnienie zmiany, odwiedziny nowej strony po publikacji |
| 2 | Checklist: co sprawdzić przed pobytem psa w hotelu; pytanie do społeczności | Karuzela: rzeczy do sprawdzenia przed pobytem psa w hotelu; Stories/Q&A **jeśli API/konto pozwala**, inaczej ręcznie | Kliknięcia do poradnika, zapisy/udostępnienia |
| 3 | Poradnik pielęgnacji psa + link; ciekawostka dot. wyboru opiekuna | Karuzela edukacyjna; krótki Reel, tylko gdy dostępny legalny materiał | Budowa zaufania i sesje na stronie |
| 4 | Profil realnej firmy za jej zgodą; „czego chcecie więcej?” | Karuzela z checklistą; odpowiedź na najczęstsze pytanie społeczności bez ujawniania DM | Trafienie do katalogu i zebranie tematów |

W kalendarzu wszystkie rekordy startują jako `draft`. Żaden przykładowy post nie staje się reklamą/promocją firmy bez oznaczenia współpracy i zgody.

### 4.3. Co Claude ma robić stale

`zoo24-social` pełni rolę **AI Social Media Managera**, nie osoby publikującej z przeglądarki bez kontroli:

- pobiera **uprawnione dane agregowane** Meta Insights i analizuje, co działa; co tydzień przedstawia 3 wnioski i 2 eksperymenty;
- przygotowuje kalendarz 14 dni naprzód, osobne copy FB/IG, CTA, warianty formatów, opis materiałów wizualnych, linki UTM, alt text i listę źródeł;
- przerabia **już zweryfikowane** artykuły na karuzele i krótkie posty; nie generuje sztucznych zdjęć rzekomych realnych firm/zwierząt jako faktów;
- utrzymuje kolejkę `draft -> needs_review -> approved -> scheduled -> published/failed`, wersjonowanie i audyt akceptacji;
- po uruchomieniu legalnej integracji publikuje **wyłącznie zatwierdzone** pozycje w harmonogramie, rejestruje identyfikatory publikacji, błędy i retry;
- analizuje zasięg, zaangażowanie, kliknięcia na stronę, nowe obserwacje i realny udział w leadach; tworzy raport `reports/social/YYYY-WW.md`;
- przegląda komentarze/wiadomości jedynie przy nadanych uprawnieniach; klasyfikuje pytania, tworzy **proponowane odpowiedzi**, sprawy sporne, medyczne, prywatne i skargi kieruje do człowieka; bez automatycznych DM/outreach;
- po analizie danych proponuje tematy blogowe, co zamyka pętlę **social -> SEO -> katalog -> social**.

### 4.4. Tryby automatyzacji i akceptacja

- **Mode 0 / offline (domyślny):** generowanie draftów, mock adapter Meta, symulowana publikacja, testy i pliki eksportu. Zero autoryzacji i zewnętrznych działań.
- **Mode 1 / assisted:** właściciel lub redaktor zatwierdza zbiorczo kalendarz na 2 tygodnie. Własny scheduler publikuje zatwierdzone materiały z prawidłowym tokenem i uprawnieniami. To **rekomendowany** tryb docelowy dla niskiej obsługowości.
- **Mode 2 / autopilot ograniczony (P2):** dopiero po kilku tygodniach bezbłędnego Mode 1 i **odrębnej zgodzie** może automatycznie publikować wybrane „zielone” formaty evergreen z wcześniej zatwierdzonymi szablonami, materiałami i listą faktów. Podlega limitowi publikacji i natychmiastowemu wyłącznikowi. Zdrowie, kryzys, promocje sponsorowane i konkretne firmy nadal wymagają akceptacji człowieka.

**Uprawnienia i API:** dla publikacji poprzez oficjalne API Meta potrzebne są odpowiednie uprawnienia strony FB (np. `pages_manage_posts`) i konta IG typu Professional, konfiguracja aplikacji i OAuth oraz dostęp do wymaganych funkcji. Istnieją różne warianty dostępu: dla **Instagram API with Facebook Login** konto profesjonalne musi być połączone z Facebook Page; dla **Instagram API with Instagram Login** należy zweryfikować odrębny zestaw uprawnień i nie zakładać, że połączenie z Page jest obowiązkowe. Konkretne uprawnienia, formaty i możliwości (zwłaszcza Stories/Reels) sprawdź w oficjalnej dokumentacji Meta w dniu implementacji. **Nie** obchodzić ograniczeń automatyzacją logowania, zapisywaniem cookie/session ani botem Playwright. Jeśli dostęp do API nie zostanie przyznany, przygotowywać publikacje do ręcznego planowania w Meta Business Suite; nie deklarować, że autopost działa.

**Claude Code nie pracuje bez przerwy jako usługa.** Subagent tworzy kod, harmonogramy, testy i raporty w sesji. Po autoryzacji i wdrożeniu zadania cykliczne muszą działać na legalnie skonfigurowanej infrastrukturze (np. chroniony backend + cron/queue albo zatwierdzona platforma do social scheduling), z monitorowaniem, limitami kosztów i wyłącznikiem. Nigdy nie obiecywać publikacji, jeśli nie zainstalowano i nie uruchomiono schedulera.

### 4.5. Reguły bezpieczeństwa publikacji

- **Nigdy:** fałszywe rekomendacje, zmyślone testy, fikcyjne zdjęcia klientów, „taniej u nas”, podszywanie się pod konsultację weterynaryjną, automatyczne odpowiedzi o zdrowiu zwierząt, nieoznaczone reklamy.
- Dla zdjęć: własne, licencjonowane, udostępnione przez firmę z prawem wykorzystania lub wyraźnie oznaczone ilustracje. Bez kopiowania treści influencerów/komentarzy jako postów.
- Każdy post: źródło, przypisany artykuł/profil, `content_owner`, status review, disclosure, zaplanowany czas z `Europe/Warsaw`, cel i prawidłowy URL. Klucze OAuth wyłącznie w sekretnym magazynie serwera, nie w Git/Markdown.
- **Nadzór:** limit częstotliwości (testowo maks. 3 posty na kanał/tydzień), ręczna pauza, idempotency key, deduplikacja, alert przy 2 kolejnych błędach publikacji lub wygaśnięciu tokenu; żadnego publikowania „zaległego backlogu” hurtowo po naprawie błędu.
- **Moderatowanie:** usuwać spam i nadużycia zgodnie z zasadami, nie usuwać merytorycznej krytyki automatycznie. Pytania o stare zamówienia: neutralna informacja o zmianie profilu i przekazanie do właściwego podmiotu wyłącznie, gdy jest to zgodne z prawdą i prawami operatora.

## 5. Lejek i atrybucja: od obserwującego do przychodu

**Wspólny lejek:** post/poradnik -> kliknięcie do strony -> zapoznanie z poradnikiem/profilami -> `business_site_outbound` lub `business_phone_outbound` -> udokumentowane zainteresowanie usługodawcy profilem premium -> ewentualna płatna subskrypcja. **Kliknięcie nie jest rezerwacją ani sprzedażą.**

- Linki z Facebooka: `utm_source=facebook&utm_medium=organic_social&utm_campaign=zoo24_relaunch_2026`.
- Linki z Instagrama: `utm_source=instagram&utm_medium=organic_social&utm_campaign=zoo24_relaunch_2026`; osobny link w bio i tracking bez niepotrzebnych danych osobowych.
- Dla wpisów promujących katalog: `utm_content=post_ID` (stabilny, niesekretny identyfikator, nigdy e-mail/ID użytkownika).
- Mierzyć oddzielnie: `organic_search_sessions`, `social_sessions_fb`, `social_sessions_ig`, `engaged_sessions`, `article_to_directory_click`, `business_outbound`, `provider_claims`, `paid_profiles`, `affiliate_outbound`, rzeczywiste przychody.
- Ścieżki attribution mogą być niedoskonałe (aplikacje social, cookies, zgody). Raport zawsze podaje metodę, brakujące dane i ograniczenia.

### Zarabianie na dawnych aktywach bez sklepu

1. **Afiliacja z wartościowych, odpowiednich poradników** dla odbiorców dawnych zapytań produktowych. Linki i sponsorzy czytelnie oznaczeni; przegląd ofert i regulaminów; brak wymyślonych cen/prowizji. Dwa niezależne źródła testu: kliknięcia afiliacyjne i faktycznie rozliczone prowizje.
2. **Premium profil usługodawcy** — oferta z `MASTER_PLAN.md`: nie pchać automatycznie oferty do każdego obserwującego; reklamować użyteczność katalogu, sprzedawać B2B po udowodnieniu ruchu i efektów.
3. **Sponsorowane poradniki/posty** — tylko z wyraźnym oznaczeniem i bez niedozwolonej reklamy zakładów weterynaryjnych; dane zasięgowe pokazywać dopiero po weryfikacji Analytics/Insights.
4. **Reklamy display** — opcja po osiągnięciu odpowiedniego aktualnego ruchu i po ocenie UX, RODO/cookies oraz sieci reklamowych; nie bazować na dawnym wyniku 100 tys. do prognoz.

**Nie budować prognozy finansowej z historycznych 100 tys. wejść.** Pierwszy model liczyć od realnego 28-dniowego ruchu i testowych CTR/conversion dla każdego kanału; przychód w startowym okresie może wynosić 0 zł.

## 6. Wymagania implementacyjne (MVP dostosowane do niskiej obsługowości)

### 6.1. Architektura i integracje

`Claude Code` buduje **moduł SEO Operations** i **moduł Social Operations** jako części projektu, z adapterami do danych i mediów:

```text
lib/integrations/
  gsc/          # read-only, adapter + mock, ograniczenia quota
  analytics/    # GA4 lub agregaty, adapter + mock
  meta/         # OAuth, dozwolone odczyty/publikacje, adapter + mock
lib/seo/
  legacy-url-audit/ redirect-plan/ index-checks/ alerts/
lib/social/
  calendar/ approval/ publish/ analytics/ moderation-triage/
app/admin/
  seo/ social/ approvals/ reports/
workers-or-jobs/
  daily-health/ weekly-seo/ weekly-social/ publish-approved/
reports/seo/ reports/social/
tests/unit/ tests/integration/ tests/e2e/
```

F1: wszystko działa na fixtures/danych DEMO, brak połączeń produkcyjnych. F2/F3 dopiero po prawach, zgodzie i konfiguracji bezpiecznych sekretów. Nie rozbudowywać CMS i schedulera ponad potrzeby; preferować istniejące sprawdzone komponenty/hostowane narzędzia po analizie kosztów.

### 6.2. Sugerowane tabele

| Tabela | Kolumny minimum / zasady |
|---|---|
| `legacy_urls` | `old_path`, `historical_clicks`, `link_priority`, `intent`, `rights_status`, `current_http`, `decision`, `target_path`, `approved_by`, `reviewed_at`; brak automatycznego 301 bez zatwierdzenia |
| `seo_checks` | `date`, `path`, `http_status`, `canonical`, `index_state`, `issue_type`, `severity`, `resolved_at` |
| `seo_metrics_daily` | `date`, `page`, `query_group`, `clicks`, `impressions`, `position`; agregaty zgodnie z retencją i zgodami |
| `content_queue` | `id`, `topic`, `primary_intent`, `target_url`, `source_refs`, `facts_checked_at`, `editor_approved_at`, `status`, `seo_owner` |
| `social_posts` | `id`, `platform`, `copy`, `asset_refs`, `target_url`, `utm`, `status`, `scheduled_at`, `approved_at`, `approved_by`, `disclosure`, `source_refs`, `external_post_id` |
| `social_assets` | `id`, `asset_uri`, `license_type`, `license_proof`, `alt_text`, `rights_checked_at`, `expires_at` |
| `social_publish_attempts` | `id`, `post_id`, `attempt`, `idempotency_key`, `error_code`, `timestamp`, `status`; bez tokenów, nagłówków auth i prywatnych DM |
| `social_metrics_daily` | `date`, `platform`, `post_id`, `reach`, `engagement`, `saves`, `link_clicks`, `followers_total`; null tam, gdzie API nie udostępnia metryki |
| `social_review_queue` | `id`, `platform`, `message_ref_hash`, `topic`, `priority`, `draft_response`, `review_status`; domyślnie bez trwałego zapisu treści DM |
| `growth_experiments` | `id`, `hypothesis`, `metric`, `start`, `end`, `decision`, `owner_approved` |

**RLS:** dostęp publiczny do metryk/wpisów opublikowanych tylko w zakresie nieosobowym; kalendarz, statystyki, identyfikatory integracji i kolejka moderacji admin-only; operacje z Meta via backend z minimalnymi scopes. Logi mają retencję i redakcję tokenów/PII. Panel ma 1-click pause dla integracji i wysyłek.

### 6.3. Minimalny panel właściciela (1 ekran)

- KPI za 28 dni: sesje organiczne vs baseline; sesje Facebook/Instagram; top 5 odzyskiwanych URL; kliknięcia do firm; liczba profili premium; przychody, koszty, liczba materiałów zaplanowanych.
- Kolory/status: `OK`, `Do akceptacji`, `Problem`; nie tworzyć fikcyjnych alertów. Max **3 decyzje** do właściciela w tygodniu.
- Akcje: `Zatwierdź kalendarz 14 dni`, `Pauzuj publikacje`, `Otwórz SEO issues`, `Eksportuj raport PDF/Markdown` (PDF może być P2).
- Gdy brak danych API: `brak dostępu / ostatnia synchronizacja`, NIE zero udające rzeczywisty wynik.

## 7. Backlog dla Claude Code — ID, zależności, akceptacja

| ID | Priorytet | Zadanie | Kryterium ukończenia |
|---|---|---|---|
| RCV-01 | P0 | Audyt danych GSC/GA4/Meta i uprawnień, bez PII | Raport baseline z rozróżnieniem historyczny/bieżący i brakami dostępu |
| RCV-02 | P0 | Inwentarz starych URL i plan statusów | CSV mapy, TOP 100 URL, semantyczny przegląd, `301/200/404/410` i testy; brak blanket redirect |
| RCV-03 | P0 | Moduł redirect planner + testy offline | Fixtures i testy pętli, soft-404, nieistniejących targetów; wymagane approval flag |
| RCV-04 | P0 | SEO monitoring + raport weekly (mock first) | Działa przy wyłączonych integracjach; eksport 1 tygodniowego raportu z jawnie oznaczonymi fikcyjnymi danymi |
| RCV-05 | P0 | Odtwarzanie realnych poradników i rekomendacje content | Kolejka top 20 tematów z danych lub pusta jeśli brak danych; żadnego samodzielnego publish |
| SOC-01 | P0 | Audyt FB/IG i plan reaktywacji | Stan dostępu, dane o fanach i angażujących formatach, projekt postu ogłaszającego pivot |
| SOC-02 | P0 | Kalendarz treści + copy FB/IG + media rights | 14-dniowy kalendarz, UTM, źródła, alt text, załączniki z licencją, `draft` |
| SOC-03 | P0 | Panel zatwierdzania postów i policy engine | Tylko `approved` może przejść w `scheduled`; role, audyt, pauza; test E2E |
| SOC-04 | P0 | Meta adapter mock + integracja rzeczywista flag-off | Testy retry, idempotency, token expiry, rate limit; realne publikowanie OFF w F1 |
| SOC-05 | P1 | Publikacja do FB/IG po osobnej autoryzacji | Oficjalny API i poprawne scopes, smoke test za zgodą, brak niezatwierdzonych publikacji |
| SOC-06 | P1 | Raport social 7/28 dni i atrybucja UTM | Niewymyślone metryki, źródło/wariant brak danych, ścieżka do serwisu |
| SOC-07 | P1 | Moderation triage, sugerowane odpowiedzi | Bez autopublikacji odpowiedzi, bez importu DM do repo; eskalacja trudnych spraw |
| OPS-SEO-SOC-01 | P0 | Scheduler dla zadania tygodniowego (mock) | Plan, test cron, brak run po błędzie, audit trail, bounded cost |
| OPS-SEO-SOC-02 | P1 | Przełączenie cyklicznych zadań na produkcję | Oddzielna zgoda, backup i rollback, alert przy 2 błędach, owner kill switch |
| QA-SEO-SOC | P0 | Kontrola prawa, jakości i integracji | PASS tylko po sprawdzonych testach SEO + permissions Meta + zero nieautoryzowanych postów |

**Równoległość:** `zoo24-seo` i `zoo24-social` mogą robić audyt i briefy równolegle, `zoo24-analytics` projektuje baseline/KPI; `zoo24-architect` zatwierdza storage/integracje; `zoo24-builder` pisze kod rozłącznie, `zoo24-qa` testuje, `zoo24-compliance` sprawdza prawa, zgody i reklamy.

## 8. Roadmapa 0–90 dni i testy decyzyjne

### Dni 0–14 — odzyskać wiedzę, nie pozycje
- Pozyskać uprawniony odczyt GSC/GA4 i Meta Insights; zdefiniować obecny 28-dniowy baseline, historyczny benchmark oddzielnie.
- Audyt największych dawnych URL i segmentów intencji; spis kont oraz praw do brandu i treści.
- Uruchomić lokalnie SEO checker i mock kalendarz social; draft komunikatu „ZOO24 zmienia formułę”.
- Warunek sukcesu: **wiemy, co ma sens przywracać i co można legalnie opublikować**. Jeśli brak danych — udokumentować priorytet „connect accounts”, ale nie blokować prototypu.

### Dni 15–45 — technika, treści i relaunch
- Po G2 i akceptacji DNS wdrożyć wybrane mapy 301, zachować zgodne stare URL z realnymi poradnikami, ograniczyć 404/500, zgłosić sitemapę.
- Uruchomić portal i pierwsze treści, legalnie zintegrować profile FB/IG (lub przygotować ręczny eksport publikacji).
- Zatwierdzić i zaplanować 2 tygodnie postów, mierzyć UTM i kliknięcia.
- Warunek: brak krytycznych błędów SEO i nieautoryzowanych publikacji, prawdziwe statystyki przekierowań i social.

### Dni 46–90 — eksperymenty i decyzja
- Co tydzień raport trendu ruchu nowego/starego, 10–20 top adresów do odświeżenia, ranking przydatnych tematów, reakcja na ruch społeczności.
- Testy CTA z artykułu do katalogu, propozycje dwóch modeli afiliacyjnych po weryfikacji programów, pierwsze sygnały firm zainteresowanych profilem premium.
- Warunek: **mierzalne** wizyty ze starych URL/nowych treści i ze społeczności oraz kliknięcia do firm; nie wymagać arbitralnie „powrotu do 100 tys.” w 90 dni.
- Jeżeli po 90 dniach brak sensownego wzrostu i korzyści, zrewidować klastry, a nie kompensować produkcją setek tekstów AI.

### Minimum testów automatycznych
1. Mapy URL: 301 tylko dla zatwierdzonych relewantnych par, brak pętli i 301->404, stara karta produktu bez odpowiednika = 404/410 (nie `/`).
2. Indeksacja: sitemap bez prywatnych/draft/DEMO, staging `noindex`, canonical poprawny, strony `404` faktycznie zwracają status 404.
3. Publikacja social: `draft` i `needs_review` nigdy nie idą do API; `approved` może być zaplanowany; dwa uruchomienia crona nie dublują posta.
4. Bezpieczeństwo integracji: fałszywy/wygasły token nie drukuje sekretów; brak `pages_manage_posts` jest bezpieczną odmową, nie obejściem; wyłącznik pauzuje wysyłkę.
5. Treść: każdy autopost ma źródło, akceptację/licencję aktywów, disclosure, UTM, kontrolę tonu i bezpieczeństwa; nie ma obietnic zdrowotnych ani sponsorów weterynaryjnych.
6. Raporty: przy niedostępnych danych powstaje `N/A` i ostrzeżenie, a nie fałszywe `0` lub „wzrost”.

## 9. Rytm właściciela i rzeczywisty koszt obsługi

**Po ustabilizowaniu i z działającymi integracjami:** cel 30–60 minut tygodniowo na jeden raport, zatwierdzenie dwutygodniowego kalendarza postów i wyjątki. W pierwszych tygodniach trzeba jednak poświęcić dodatkowy czas na dostęp do kont, branding, decyzje prawne i pierwszy relaunch. Ktoś — wewnętrzny redaktor albo zewnętrzny moderator — musi kontrolować jakość treści i krytyczne komentarze. Claude przyspiesza opracowanie i pomiar; **nie gwarantuje autonomicznego prowadzenia marki bez nadzoru**.

**Koszt dodatkowy:** API/hostowane schedulery, grafiki/licencje, przegląd redakcyjny i moderacja mogą wymagać budżetu powyżej wartości z pierwotnego MVP. Claude ma porównać dwa warianty: (A) Meta Business Suite + ręczne batch approve/publish, (B) integracja Meta API + background scheduler. Dla każdego: miesięczny koszt, liczba minut człowieka, ryzyko i zależność od API. Bez decyzji właściciela pozostać w wariancie A/offline.

## 10. Materiały pomocnicze i źródła

**Szablony w repo:**
- `docs/seo-url-mapping.template.csv` — struktura oceny przekierowań, bez rzeczywistych URL i danych.
- `docs/social-calendar.template.csv` — kalendarz publikacji i approval, pusty poza nagłówkiem.
- `docs/analytics-baseline.template.csv` — wspólny rejestr KPI i pochodzenia danych.

**Oficjalne źródła do ponownej weryfikacji przez agentów w dniu implementacji (sprawdzone orientacyjnie 22.11.2026):**
1. Google, zmiana URL i przekierowania: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
2. Google, polityka masowo generowanych treści: https://developers.google.com/search/docs/essentials/spam-policies
3. Google, AI-assisted content: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
4. Google, optymalizacja pod AI Search: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
5. Meta, Facebook Page Feed API: https://developers.facebook.com/docs/graph-api/reference/page/feed/
6. Meta, oficjalna dokumentacja Instagram API: https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
7. Meta, odrębny Instagram Login: https://developers.facebook.com/docs/instagram/platform/instagram-api/changelog/

**Uwaga:** zmieniają się wersje API, wymagane scopes, limity i zasady akceptacji aplikacji. Nie opierać kodu na numerze wersji lub uprawnieniu „z pamięci” — zweryfikować przed integracją. Dokument zawiera wytyczne projektowe, nie gwarantuje przyznania dostępu przez Meta ani powrotu ruchu z Google.

## 11. START_PROMPT — co ma najpierw zrealizować Claude

1. Przeczytaj `CLAUDE.md`, `MASTER_PLAN.md` i **ten dokument**. Nie zastępuj strategii katalogu „masowym SEO” ani social-only projektem.
2. Uruchom role `zoo24-seo`, `zoo24-social`, `zoo24-analytics`, `zoo24-growth`, `zoo24-architect` i `zoo24-compliance` jako read-only równolegle, jeśli dostępne.
3. Przygotuj `docs/audits/data-access-checklist.md`, `docs/audits/recovery-audit.md`, `docs/audits/social-audit.md` oraz plan URL map, z **N/A** tam gdzie brak danych. Zaznacz wejściowe 100k/mies. jako deklarację historyczną właściciela.
4. Zacznij lokalny kod: SEO redirect planner z mock URL, content queue, social calendar/approval, Meta mock adapter, raport 28-dniowy, bez prawdziwych kluczy/API.
5. Przetestuj state machine, 404/301, RLS/uprawnienia, brak autopostingu, brak sekretów. Zapisz wyniki w `docs/STATUS.md` i zbierz maks. trzy decyzje od właściciela.

**Kryterium zakończenia F1:** kompletna lokalna ścieżka *analiza -> brief/draft -> zatwierdzenie -> symulacja publikacji -> pomiar/raport* oraz mapa starych URL z audytem decyzji. Żadne rzeczywiste posty, redirecty ani nowe strony nie idą publicznie bez późniejszej odrębnej zgody.
