# ZOO24 — status wdrożenia (v1.2)

**Aktualizacja:** 2026-11-22 — sesja 1 Claude Code (F0 + lokalne F1). **Tryb:** Mode 0 / MOCK. Nic nie jest live.

## Aktualizacja 2026-11-22 (popołudnie) — staging na Vercel (ADR-012)
| Element | Stan (zweryfikowany) |
|---|---|
| Repozytorium | `github.com/wingsbrand/zoo24` (prywatne), gałąź `main` |
| Hosting | Vercel, zespół WINGS, projekt `zoo24`; deploy `dpl_5WA7ah5bYscbNyBvTeQt6dhyt7Rs` = **READY**; adres **https://zoo24.vercel.app** (staging) |
| Indeksacja | zablokowana: `X-Robots-Tag: noindex`, `robots.txt` = `Disallow: /`, sitemap 404 (`ZOO24_ENV=staging`) |
| Panel `/admin` | 404 na hostingu (tylko lokalnie) |
| DNS zoo24.pl | **bez zmian** (bramka G2 — osobna zgoda) |
| Baza | projekt Supabase `ZOO24` + tabela `app_state` gotowe; **aplikacja jeszcze na efemerycznym store `/tmp`** — brak `ZOO24_SUPABASE_SECRET_KEY` (właściciel dodaje sam w Vercel) |
| Social / GSC / GA4 live | wyłączone (`ZOO24_SOCIAL_MODE=0`, flagi `*_LIVE=false`) |

Smoke test `ZOO24_SITE_URL=https://zoo24.vercel.app node scripts/smoke-http.mjs`: 21/22 PASS; jedyny FAIL `/admin` → 404 był oczekiwanym zachowaniem — skrypt poprawiony (na hostingu oczekuje 404).
Uwaga: funkcje działają w regionie `iad1` (USA), baza w `eu-central-1` — do przeniesienia na `fra1` przed włączeniem Supabase (opóźnienia, lokalizacja danych).

## Co jest MOCK, a co live
| Obszar | Stan |
|---|---|
| Strona zoo24.pl, DNS, redirecty produkcyjne | **nietknięte** (brak dostępu i zgody) |
| Publikacje FB/IG | **żadne** — tylko symulacja adapterem MOCK; kill switch domyślnie aktywny |
| GSC / GA4 / Meta Insights | **brak połączenia** — adaptery zwracają `no_access` → N/A |
| Scheduler / cron | **brak** — joby uruchamiane ręcznie (`npm run jobs:run -- <job>`); Claude Code nie działa w tle po sesji |
| Dane katalogu i poradników | **DEMO** (fikcyjne, oznaczone, noindex, poza sitemap) |
| Baza danych | lokalny plik `.data/state.json`; SQL Supabase z RLS tylko jako propozycja |

## Zakończone w tej sesji
### F0 (dokumenty)
- [x] Audyt odzyskiwania SEO, segmenty A–E, reguły 200/301/404/410, procedura TOP 100 klików + TOP 100 linków: `docs/audits/recovery-audit.md` (zoo24-seo)
- [x] Inwentarz starych URL: `docs/audits/old-url-inventory.csv` — **tylko nagłówek, 0 wierszy** (brak eksportów; nic nie wymyślono)
- [x] Polityka redirectów R1–R12, M1–M6, canonical/sitemap/noindex: `docs/seo/redirect-policy.md`
- [x] Audyt własności i parametrów FB/IG (wartości N/A), GO/NO-GO, wariant A vs B: `docs/audits/social-audit.md` (zoo24-social)
- [x] Komunikat relaunchu FB/IG („sklep nie wraca”), bio, FAQ triage: `docs/social/relaunch-message.md`
- [x] Kalendarz 14 dni (30.11–13.12.2026), 10 draftów (5 FB / 5 IG, osobne copy/CTA/UTM): `docs/social/drafts-14d.json`; rejestr assetów (wszystkie `unknown`): `docs/social/asset-register.json`
- [x] Specyfikacja dashboardu 28 dni i checklista brakujących dostępów: `docs/analytics/dashboard-28d-spec.md`, `docs/audits/data-access-checklist.md` (zoo24-analytics)
- [x] Compliance GO/NO-GO: `docs/compliance-review.md`; eksperymenty wzrostu: `docs/growth-experiments.md`; ADR: `docs/decisions.md` (product, architect, compliance, growth)

### F1 (lokalny prototyp — Next.js 16.4.6, React 19.3, TS 5.9, Tailwind 4.3, Vitest 5.1)
- [x] Strony publiczne: `/`, `/uslugi`, `/uslugi/[kategoria]`, `/uslugi/[kategoria]/[miasto]`, `/firma/[slug]`, `/poradniki`, `/poradniki/[slug]`, `/o-nas`, `/dla-firm`, 404; wyjścia do firm przez `/api/out` (agregat bez PII)
- [x] SEO Operations (`lib/seo`, zoo24-builder): redirect planner R1–R12 + alarmy masowe, legacy router (`app/[...legacy]/route.ts`), rejestr stron, robots/sitemap/canonical, mock checker; panel `/admin/seo`
- [x] Social Operations (`lib/social`): state machine, policy engine (licencja, źródła, placeholder, zdrowie, disclosure, UTM, strona docelowa, limit 3/kanał/tydz.), publisher z lease + idempotency + retry/backoff + rekoncyliacja timeout + brak catch-upu, kill switch, eksport CSV do Meta Business Suite, harmonogram MOCK; panel `/admin/social`
- [x] Integracje: `MockMetaAdapter`, `RealMetaAdapter` (rzuca `IntegrationDisabledError`), źródła GSC/GA4/Meta `NoAccessSource`
- [x] Analytics: KPI 28 dni z N/A, osobny historyczny claim, UTM builder/walidator (bez PII), raport tygodniowy; panel 1-ekranowy `/admin`
- [x] Bezpieczeństwo: redakcja tokenów/PII w logach (`lib/security/redact.ts`), skan sekretów (także `.data/`), nagłówki ochronne, `X-Robots-Tag: noindex` poza produkcją, panel admina tylko `ZOO24_ENV=local` + host loopback + same-origin (inaczej 404)

## Testy faktycznie uruchomione (2026-11-22)
| Komenda | Wynik |
|---|---|
| `npx vitest run` | **PASS — 8 plików, 97/97 testów** (SEO 64, social 17 + 8 regresji QA, analytics/UTM/redakcja 8) |
| Review `zoo24-qa` | statyczny (agent bez Bash): 2 high, 6 medium, 4 low → wszystkie poprawione, testy regresyjne dodane; szczegóły `docs/qa-report.md` |
| Cross-origin POST na `/api/admin/jobs/*` | **PASS** — 404 |
| `npx tsc --noEmit -p .` | **PASS** — 0 błędów |
| `npm run scan:secrets` | **PASS** — brak sekretów/tokenów |
| `npx next build` | **PASS** — 19 tras skompilowanych |
| `node scripts/smoke-http.mjs` (dev server :3024) | **PASS — 20/20** (301 tylko dla zatwierdzonego poradnika, 404 dla blanket→`/`, produkt→listing, needs_review, brak decyzji, niezwiązany URL; 410 dla gone; sitemap 404 poza prod; robots `Disallow: /`; DEMO noindex + badge; brak ocen) |
| Ręczny test UI `/admin/social` | **PASS** — „Zatwierdź” dla soc-001 zablokowane: `POLICY_BLOCKED: ASSET_LICENSE_UNVERIFIED, PLACEHOLDER_IN_COPY` |
| `npm run jobs:run -- weekly_kpi_report` | **PASS** — `reports/weekly/2026-11-16.md`, wszystkie KPI zewnętrzne = N/A ze źródłem |
| Testy RLS na Postgres | **N/A** — migracja SQL nieuruchomiona (brak bazy w F1) |
| Lighthouse / a11y audyt | **N/A** — nie uruchomiono w tej sesji |

### Pokrycie warunków P0
| Warunek | Dowód | Status |
|---|---|---|
| Brak masowych 301 na `/` | `tests/seo/redirect-plan.test.ts` (100 kart C → `/` = 0 aktywnych, BLOCK), smoke `/demo-legacy/produkt/karma-xyz-12kg` → 404 | PASS |
| Niezwiązane URL nie są przekierowywane | `tests/seo/legacy-router.test.ts`, smoke `/cokolwiek/niezwiazanego` → 404 | PASS |
| DEMO/staging nieindeksowane | testy indexing + smoke (X-Robots-Tag, meta robots, robots.txt, sitemap 404) | PASS |
| Post bez zgody/praw nie jest publikowany | `tests/social/publish-safety.test.ts` (draft, needs_review, brak licencji, wygasła licencja, edycja po akceptacji, status bez akceptacji) | PASS |
| Dwukrotny cron nie dubluje | test równoległych `runPublishJob` → 1 wywołanie API | PASS |
| Zatrzymanie schedulera działa | test kill switch → 0 publikacji; wznowienie → `held`, brak catch-upu | PASS |
| Brak tokenów w kodzie/logach | test wygasłego tokenu (brak w stanie/logach) + `scan:secrets` | PASS |
| Brak danych → N/A | `tests/analytics/kpi.test.ts`, raport tygodniowy | PASS |

## Baseline
- Historyczny: 100 000+ wejść organicznych/mies., kilkanaście tys. obserwujących FB/IG — **deklaracja właściciela, niezweryfikowana**.
- Zweryfikowany (GA4, 02.2022–11.2024): organic szczyt 33 702 sesji/mies., średnio 28 542/mies. (12.2023–11.2024).
- Bieżący 28 dni: GA4 **0 sesji** (serwis offline); GSC, FB, IG: **N/A** — brak dostępu.
- Efekt odbudowy: **N/A**.

## Brakujące dostępy (szczegóły: `docs/audits/data-access-checklist.md`)
1. GSC read-only (pilne: retencja ok. 16 mies., oferta sklepu zatrzymana w 02.2025) — BRAK
2. GA4 Viewer / archiwalne eksporty UA — BRAK
3. Meta: FB Page Insights i IG Professional Insights; ustalenie administratorów i Business Portfolio — BRAK
4. Sitemap/backup struktury URL starego sklepu (bez danych klientów), backlinki — BRAK
5. Dowody praw: domena, znak/logo, stare treści i zdjęcia — BRAK

## Ryzyka (top)
- **Critical:** prawa do nazwy/logo/treści i kontrola kont FB/IG nieustalone; import danych dawnych klientów zakazany (RODO/PKE).
- **High:** okres szczytu 100k+ może być już poza retencją GSC — nie da się go potwierdzić; komunikacja nie może sugerować powrotu sklepu; brak redaktora/moderatora = brak realnego Mode 1.
- **Medium:** store JSON i proste zabezpieczenie panelu nadają się tylko lokalnie; przed stagingiem — Supabase + Auth + RLS i ochrona endpointów.

## Następne 3 kroki
1. Po decyzji 1: import realnych eksportów GSC/sitemap do `old-url-inventory.csv` → walidacja planerem → TOP 100 do ręcznego review (bez wdrożenia).
2. F1 c.d.: formularz zgłoszeń firm + moderacja (BE-01/02), Supabase lokalnie z testami RLS, staging z ochroną hasłem i noindex.
3. Po decyzji 2: finalne copy relaunchu, licencjonowane grafiki w rejestrze, pierwszy batch 14 dni do akceptacji (eksport CSV → ręczne planowanie w Meta Business Suite).

## Aktualizacja 2026-11-22 (odpowiedź właściciela + Windsor.ai)
- [x] GA4 `zoo24.pl - GA4` odczytane przez Windsor.ai (tylko agregaty): `docs/audits/ga4-monthly-sessions.csv`, `docs/audits/ga4-organic-landing-top100.csv`
- [x] **Weryfikacja 100k+:** w GA4 (02.2022–11.2024) szczyt organiczny **33 702 sesji/mies.** (01.2024), średnio **28 542/mies.** w ostatnich 12 mies.; >100 tys. osiągał tylko ruch **łączny** (9 miesięcy, szczyt 175 820 w 01.2023). Okres przed 02.2022 — niezweryfikowany.
- [x] **Bieżące 28 dni GA4: 0 sesji** (źródło podłączone, serwis offline od 12.2024) — dashboard pokazuje 0 ze statusem `export_manual` (`data/exports/ga4-28d.json`); GSC/FB/IG nadal N/A
- [x] **Inwentarz URL z prawdziwych danych:** 100 adresów w `docs/audits/old-url-inventory.csv` + raport `docs/audits/top100-ga4-report.md` (`npm run import:ga4`). Blog = 77% sesji TOP 100, w tym 15 tematów zdrowotnych; kategorie/marki/produkty = 16%. Wszystko `draft`, brak decyzji.
- [x] Status praw: `docs/audits/asset-rights-status.md` — domena TAK (WINGS RETAIL, aftermarket.pl); logo/treści od nowa; GSC do założenia; FB/IG organic niepodłączone w Windsor.ai
- [x] Testy: `npx vitest run` **106/106 (10 plików)**, `tsc` PASS, `scan:secrets` PASS
- Brak „TOP 100 wg linków” — wymaga GSC (Linki) lub licencjonowanego narzędzia; **N/A**

## Aktualizacja 2026-11-22 (2) — Facebook Organic, logo, plan live
- [x] Facebook ZOO24.PL odczytany przez Windsor.ai: **43 515 obserwujących** (19.11.2026; 44 662 w 11.2024), interakcje 0/28 dni, strona uśpiona od 01.2025 — `docs/audits/meta-fb-monthly.csv`, `data/exports/meta_fb-28d.json`, audyt w `docs/audits/social-audit.md`. Dashboard pokazuje obserwujących i interakcje ze źródłem; zasięg i kliknięcia linków = N/A (API).
- [x] Instagram: **N/A** — konektor nadal niepodłączony w Windsor.ai.
- [x] Logo v1: `public/brand/` (logo, sygnet, favicon), opis `docs/brand/logo.md`; w nagłówku serwisu i jako favicon. EUIPO: brak kolizji wg właściciela.
- [x] GSC: zakładamy po uruchomieniu serwisu na serwerze (decyzja właściciela).
- [x] Testy: `npx vitest run` **106/106**, `tsc` PASS, `scan:secrets` PASS; wygląd logo sprawdzony w przeglądarce (16–372 px).

- [x] Logo v2: właściciel wybrał wariant **C — serce** spośród 4 propozycji; wdrożone jako logo, sygnet i favicon, kolory serwisu → granat + koral (`docs/brand/logo.md`, ADR-008). Sprawdzone w przeglądarce 16–352 px; testy 106/106, `tsc` PASS.

## Aktualizacja 2026-11-22 (3) — pierwsze artykuły i kolejka redakcyjna
- [x] 3 nowe, autorskie artykuły pod dawnymi adresami z TOP 3 GA4 (razem 37 064 historycznych sesji org.): `/blog/kot-brytyjski-n66`, `/blog/cane-corso-n63`, `/blog/maltanczyk-n77` — pliki `content/blog/*.json`. Źródła: standardy FCI nr 343 i nr 65, standard FIFe BSH/BLH (+ WCF, CFA, The Kennel Club porównawczo). Bez porad diagnostycznych; liczby wzrostu/masy celowo pominięte do weryfikacji z aktualnym standardem.
- [x] Status **needs_review** — publicznie 404 do akceptacji redaktora (sprawdzone HTTP). Podgląd i akceptacja: `/admin/content` (polityka: weryfikowalne źródła, brak DEMO, brak placeholderów, brak obietnic zdrowotnych).
- [x] Trasa `/blog/[slug]`: opublikowany artykuł = 200 pod starym URL, w sitemap tylko w produkcji; dawne `/blog/*` bez nowego artykułu = 404 (bez blanket redirect).
- [x] Testy: `npx vitest run` **111/111 (11 plików)**, `tsc` PASS, `scan:secrets` PASS, smoke HTTP PASS.
- [ ] Redaktor: weryfikacja faktów 3 artykułów, zdjęcia z licencją → „Zatwierdź” w `/admin/content`.
- Kolejne z TOP 100 (niezdrowotne): kot syberyjski (n67), kot bengalski (n65), jakie rasy psów są najbardziej towarzyskie (n144), shih tzu (n62), buldog francuski (n64).

## Aktualizacja 2026-11-22 (4) — przebudowa UX/UI całego serwisu
- [x] Plan UX (zadania Z1–Z4, macierz ekranów i stanów, zachować/poprawić/zbudować): `docs/design/UX_PLAN.md`
- [x] System projektowy: tokeny w `app/globals.css`, komponenty `components/ui/*`, Bricolage Grotesque + Inter (self-hosted), petrol + koral, ikony lucide-react: `docs/design/DESIGN_SYSTEM.md` (ADR-010)
- [x] Nowe/przebudowane ekrany: strona główna; katalog (wyszukiwarka usługa+miasto z wpisywaniem i geolokalizacją, filtry z danych, liczniki, aktywne filtry, sortowanie, stronicowanie, puste stany, `/szukaj`); profil firmy (pasek kontaktu na telefonie, źródło danych, przejęcie profilu); poradniki (hub z tematami i wyszukiwaniem, artykuł ze spisem treści, okładki, obrazy OG); dla firm; formularze zgłoszenia firmy/błędu/kontaktu ze statusem po kodzie; strony informacyjne i szkice prawne; 404/błąd; panel 4 pytań + moderacja + wskaźniki
- [x] Agenci: 3 × `zoo24-builder` (katalog, poradniki, formularze — rozłączne pliki), `zoo24-qa` (niezależny przegląd); integracja i testy — orkiestrator
- [x] Testy: `tsc` PASS, `vitest` **195/195**, build PASS, smoke **20/20**, SEO meta **12/12**, ścieżki Z1–Z4 przejdzione w przeglądarce; szczegóły i ograniczenia: `docs/design/UX_QA_REPORT.md`
- [x] Kolor koła logo: petrol — potwierdzony przez właściciela (ADR-010)
- [x] Adresy firm: decyzja właściciela — pokazujemy adres lokalu publikowany przez firmę (ADR-011); DEMO nigdy
- [x] Katalog rozszerzony do 10 największych miast; dodano 10 realnych salonów groomerskich (po 1 na miasto) z `content/businesses/groomers-2026-11-22.json` — źródło: strona firmy; data sprawdzenia tylko dla 3 potwierdzonych w przeglądarce (Kraków, Wrocław, Białystok), pozostałe „dane niepotwierdzone” do weryfikacji redakcji. Widoczne tylko lokalnie. Testy 246/246, smoke i SEO meta PASS.
- [ ] Redakcja: potwierdzić 7 firm (adres, kod pocztowy, lokal usługowy przy „/7” itp.), ręcznie sprawdzić luxpies.com; poinformować firmy o wpisie przez ich kanały kontaktowe przed publikacją live
- [ ] Przed produkcją: rate limit na poziomie infrastruktury, Lighthouse + RUM, test czytnikiem ekranu, prawdziwe zdjęcia z prawami

### Warunki przejścia na live (bramka G2 — osobna zgoda właściciela)
Publikacja na serwerze i przełączenie DNS zoo24.pl **nie zostały wykonane**. Przed nimi potrzebne:
1. Treści: min. 6–8 nowych, sprawdzonych artykułów — w pierwszej kolejności pod adresami z TOP 100 GA4 (np. `/blog/kot-brytyjski-n66`, `/blog/cane-corso-n63`, `/blog/maltanczyk-n77`), zatwierdzonych przez redaktora.
2. Katalog: realne, sprawdzone profile firm albo ukrycie katalogu na start (dane DEMO nie mogą trafić na produkcję).
3. Zatwierdzona mapa URL z TOP 100 (200 / 301 / 404 / 410).
4. Polityka prywatności, regulamin, informacja o cookies (prawnik); decyzja o tagu GA4 (ta sama usługa 301981165 = ciągłość historii) i zgodach.
5. Hosting i budżet (np. Vercel + baza lub hosting statyczny), backup i plan wycofania.
6. Twoja zgoda na: deploy produkcyjny, zmianę DNS w aftermarket.pl, potem GSC (TXT) i podłączenie w Windsor.ai.

## Decyzja 1 (prawa i dostępy) — w toku, czeka na właściciela
- [x] Instrukcja krok po kroku (GSC → GA4 → FB/IG → dowody praw), bez haseł/tokenów: `docs/owner/decision-1-rights-and-access.md`
- [x] Folder `imports/` (gsc, ga4, meta) — w `.gitignore`
- [x] Importer `npm run import:gsc`: eksport „Strony” + „Linki” (PL/EN) → `docs/audits/old-url-inventory.csv` + `docs/audits/top100-report.md`; nie czyta zapytań (PII), kliknięcia z różnych okresów = maks., zachowuje decyzje ludzi, wszystkie nowe wiersze `draft`
- [x] Testy importera: `tests/seo/import-gsc.test.ts` — **PASS**; łącznie `npx vitest run` **102/102 (9 plików)**, `tsc` PASS
- [x] `npm run import:gsc` bez plików: kończy się czytelnym błędem (sprawdzone); na realnych danych — **N/A, brak eksportów**
- [ ] Właściciel: założyć GSC (rekord TXT w aftermarket.pl) i podłączyć w Windsor.ai
- [ ] Właściciel: podłączyć w Windsor.ai konektory Facebook Organic i Instagram (statystyki strony/profilu ZOO24)
- [ ] Prawnik: sprawdzenie „ZOO24” w UPRP/EUIPO przed użyciem nowego logo

## Decyzje właściciela (maks. 3)
1. **Dostępy (reszta):** założyć GSC dla zoo24.pl (rekord TXT w aftermarket.pl) i podłączyć w Windsor.ai konektory Search Console, Facebook Organic i Instagram; prawnik sprawdza nazwę „ZOO24” przed nowym logo. (Domena — potwierdzona; GA4 — odczytane.)
2. **Relaunch social:** zatwierdź komunikat „ZOO24 w nowej formule — sklep nie wraca”, wskaż podmiot/kanał dla spraw dawnych zamówień oraz źródło grafik z prawami; start w wariancie A (ręczny batch w Meta Business Suite, 0 zł OPEX).
3. **Kierunek i budżet:** zaakceptuj kierunek UX prototypu i hipotezę Warszawa/Białystok × groomer/hotel; ustal miesięczny limit kosztów i osobę odpowiedzialną za redakcję/moderację.

Brak odpowiedzi = brak zgody: prototyp rozwijany dalej wyłącznie lokalnie na DEMO.

## Aktualizacja 2026-11-22 (5) — etap operacyjny zoo24-ops (design/shadow, nic live)
- [x] 6 ról `zoo24-ops-{build,content,growth,knowledge,social,seo}` w `.claude/agents/` (9 dotychczasowych zachowanych; hashe = MANIFEST); sekcja ops dopisana do CLAUDE.md raz (instalator idempotentny `node scripts/ops-install.mjs`). Wykrycie agentów wymaga nowej sesji Claude Code.
- [x] `lib/ops/`: rejestr jobów (dedupe, lease, fencing), gateway z allowlistą operacji i bramkami, polityka chroniona przed agentami, pauza z harmonogramem dostawcy, rejestr dowodów (kwarantanna, wycofanie → korekty), strażnicy growth/pomiaru, harmonogram Europe/Warsaw z DST i bez catch-upu, dispatcher shadow; role zintegrowane z `lib/content`, `lib/social`, `lib/seo`; panel `/admin` pokazuje 6 ról, tryb i politykę (`automationStatus().ops`), `schedulerActive=false`.
- [x] Przebieg shadow na realnym stanie lokalnym: 6 ról, 0 zapisów zewnętrznych (`ops/runtime/work/shadow-run-2026-11-22.json`): build blocked (brak git), content needs_human (3 artykuły → redaktor), social blocked (brak licencji grafik), SEO partial (GSC N/A), knowledge/growth produced.
- [x] Testy: `npx vitest run` **238/238 (19 plików)**, `tsc` PASS, `scan:secrets` PASS; scenariusze ACCEPTANCE w `ops/runtime/QA_REPORT.md` (I04/I05, C07–C09, wdrożenie — BLOCKED).
- [x] Pakiet aktywacji: `ops/runtime/ACTIVATION_PACKAGE.md` (jeden zakres: harmonogram shadow tylko do odczytu), polityka `ops/config/activation.json` INACTIVE, runtime `ops/runtime/ADR-RUNTIME.md`, gotowość `ops/runtime/READINESS.md`, rejestr `ops/runtime/INSTALL_STATUS.md`.
- [x] Właściciel zatwierdził zakres „shadow z harmonogramem — tylko odczyt” (pilot 7 dni, do 29.11.2026); polityka podpisana, testy 252/252, `tsc` PASS.
- [ ] Do uruchomienia harmonogramu: zdalne prywatne repo GitHub (lokalne repo już jest) + wybór runtime; redaktor-człowiek (AI może tylko redagować szkice); kanał alarmów; limit AI (budżet niezatwierdzony).
