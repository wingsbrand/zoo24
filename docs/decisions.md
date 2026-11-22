# ZOO24 — rejestr decyzji (ADR)

Status „Zaakceptowane” = wynika z CLAUDE.md / MASTER_PLAN; „Proponowane” = wymaga potwierdzenia właściciela. Brak odpowiedzi = brak zgody na działania live.

## ADR-001 — 2026-11-22 — Stack F1: Next.js 16.4.6 + React 19.3 + TypeScript 5.9 + Tailwind 4.3 + Vitest 5.1
Decyzja: wersje sprawdzone `npm view` w dniu instalacji. TypeScript 7 (natywny) pominięty jako zbyt świeży dla ekosystemu Next. Port dev 3024.
Status: Zaakceptowane (orkiestrator).

## ADR-002 — 2026-11-22 — F1 bez bazy: lokalny store JSON za wąskim interfejsem repozytorium
Decyzja: `.data/state.json` (atomowy zapis tmp→rename, poza Git), seed DEMO; `supabase/migrations/0001_init.sql` jako nieuruchamiana propozycja z RLS deny-by-default.
Powód: działa bez kont i kosztów; podmiana na Supabase jest tania. (zoo24-architect)
Status: Zaakceptowane.

## ADR-003 — 2026-11-22 — Rola admin tylko z claimu `app_metadata`; anon wyłącznie SELECT opublikowanych rekordów
Powód: brak eskalacji uprawnień i public write. W F1 panel `/admin` dostępny tylko lokalnie (`ZOO24_ENV != production`), inaczej 404.
Status: Zaakceptowane (do wdrożenia przy Supabase).

## ADR-004 — 2026-11-22 — Social Mode 1 zaczyna od ręcznego batcha CSV w Meta Business Suite
Decyzja: eksport zatwierdzonych pozycji do CSV i ręczne planowanie; API + scheduler dopiero po App Review i decyzji o budżecie.
Powód: dodatkowy OPEX 0 zł vs szacunkowo ok. 45 USD/mies. (hosting komercyjny + baza, ceny do weryfikacji w dniu decyzji); ręczny batch ≈ 60–90 min redaktora/14 dni vs 15–25 min przy API.
Status: Proponowane (decyzja właściciela).

## ADR-005 — 2026-11-22 — Publikacja tylko wersji zamrożonej akceptacją; bez zewnętrznej kolejki i bez catch-upu
Decyzja: akceptacja wiąże `post_id + version + content_hash`; edycja po akceptacji → `needs_review`. Worker: lease, `idempotency_key = sha256(post_id:version)`, maks. 3 próby z backoffem, timeout → `unknown` → rekoncyliacja przed retry, posty spóźnione > 30 min → `held`.
Status: Zaakceptowane.

## ADR-006 — 2026-11-22 — Mapa starych URL obsługiwana w aplikacji (catch-all route), nie w `next.config`
Decyzja: `app/[...legacy]/route.ts` + `lib/seo` zwracają 301/308 wyłącznie dla zatwierdzonych i zwalidowanych par, w pozostałych przypadkach 404/410. Reguły R1–R12 z `docs/seo/redirect-policy.md`.
Status: Zaakceptowane (mapa produkcyjna wymaga osobnej zgody).

## ADR-007 — 2026-11-22 — Odczyt GA4 przez Windsor.ai; nowe treści pod starymi adresami blogowymi
Decyzja: właściciel wskazał Windsor.ai jako kanał dostępu do GA4 i Meta. Pobieramy wyłącznie agregaty (sesje wg miesiąca, kanału i strony docelowej) do `docs/audits/`; dashboard czyta je jako `export_manual`. Benchmark do planowania: historyczny organic GA4 (~28,5 tys. sesji/mies.), nie deklaracja 100k+. Stare treści utracone — artykuły blogowe z TOP 100 piszemy od nowa i rekomendujemy publikację pod tym samym URL (200); tematy zdrowotne tylko po recenzji weterynarza.
Status: Zaakceptowane (dostęp — właściciel); publikacja i mapa URL — Proponowane.

## ADR-008 — 2026-11-22 — Logo „serce” (wariant C) i kolory serwisu
Decyzja: właściciel wybrał wariant C (granatowy okrągły sygnet, łapa z poduszką-sercem, „24” w koralowej pigułce). Kolory serwisu zmienione z zieleni na granat `#1e3a5f` + koral `#ef6c4a`. Pozostałe warianty zarchiwizowane w `docs/brand/variants/` (poza `public/`, nie trafią na produkcję).
Status: Zaakceptowane (właściciel).

## ADR-009 — 2026-11-22 — Artykuły jako pliki JSON + kolejka redakcyjna w panelu
Decyzja: treści redakcyjne w `content/blog/*.json` (wersjonowane w repo, bez CMS); do stanu trafiają zawsze jako `needs_review`. Publikacja tylko przyciskiem redaktora w `/admin/content` po przejściu polityki (źródła z URL, brak DEMO/placeholderów/obietnic zdrowotnych). Dawne adresy bloga obsługuje `/blog/[slug]`.
Status: Zaakceptowane (orkiestrator); akceptacja treści — redaktor/właściciel.

## ADR-010 — 2026-11-22 — System projektowy v1: petrol + koral, Bricolage Grotesque + Inter
Decyzja: kolor marki petrol `#0e4f5c` (brief: zieleń/petrol), akcent koral `#b8461f` dla jednego głównego działania (kontrast z białym 5,34:1; pierwotne `#d4552d` = 4,09:1, poprawione po QA), tło ciepłe `#faf7f2`. Koło logo „serce” przekolorowane z granatu na petrol — kształt, koral i układ bez zmian (odwracalne: zmiana jednej wartości). Fonty self-hosted przez `next/font` (latin-ext). Ikony lucide-react. Tokeny w `app/globals.css`, komponenty w `components/ui`. Szczegóły: `docs/design/DESIGN_SYSTEM.md`.
Status: Zaakceptowane — właściciel potwierdził petrol jako kolor koła logo (2026-11-22).

## ADR-011 — 2026-11-22 — Adres lokalu usługowego firmy jest wyświetlany (decyzja właściciela)
Pierwotnie (wersja proponowana): adresy ukryte do decyzji compliance — ostrożna interpretacja zasady organizacji „nie udostępniamy danych adresowych klientów” (adres jednoosobowej działalności może być adresem osoby fizycznej).
Decyzja właściciela (2026-11-22, w rozmowie z orkiestratorem: „znajdź realnie po 1 firmie z każdego dużego miasta… i podaj je na start” → „Tak, dodaj”): pokazujemy adres **wyłącznie lokalu usługowego**, który firma sama publikuje dla klientów na własnej stronie (źródło + data sprawdzenia). Nie publikujemy adresów zamieszkania ani adresów usług „tylko z dojazdem”; rekordy DEMO nigdy nie pokazują adresu. Firmy wymienione w zasadzie organizacji jako „klienci” (dane dawnych klientów sklepu) — bez zmian, nie są importowane.
Wdrożenie: `lib/directory/contact.ts → publicLocation` (zwraca `address` tylko dla nie-DEMO), profil i karta firmy, link „Wyznacz trasę” (zewnętrzny, bez osadzania mapy). Dane: `content/businesses/groomers-2026-11-22.json`. Do potwierdzenia przez redakcję przed live: czy adresy z numerem lokalu (/7, /4, /3) to lokale usługowe.
Status: **Zaakceptowane przez właściciela**; compliance może zawęzić przed publikacją produkcyjną.

## ADR-P01 — 2026-11-22 — F1 wyłącznie na danych DEMO i mockach (zoo24-product)
Integracje GSC/GA4/Meta flag-off. Status: Zaakceptowane.

## ADR-P02 — 2026-11-22 — SEO recovery i social są P0 na równi z katalogiem
Funkcje P1/P2 bez priorytetu, dopóki QA-SEO-SOC nie ma PASS. Status: Zaakceptowane.

## ADR-P03 — 2026-11-22 — Bez billingu, opinii, rezerwacji i weterynarii 24h w MVP
Status: Zaakceptowane.

## ADR-P04 — 2026-11-22 — Raporty: N/A zamiast zer; trzy rozdzielne baseline'y
Historyczny claim (100k+/mies., deklaracja), bieżący 28d i przyrost raportowane osobno. Status: Zaakceptowane.

## ADR-012 — 2026-11-22 — Etap operacyjny zoo24-ops: 6 ról w trybie shadow, polityka chroniona
Decyzja: zainstalowano 6 ról `zoo24-ops-*` obok 9 dotychczasowych (instalator idempotentny `scripts/ops-install.mjs`, sekcja w CLAUDE.md między znacznikami). Stan operacji w `AppState.ops` (rejestr jobów z lease + monotonicznym fencing tokenem, receipts, dowody, budżet, pauza). Zapisy zewnętrzne wyłącznie przez `lib/ops/gateway.ts` (allowlista 4 operacji, zasób z polityki, aktualna zgoda człowieka, dowody, budżet, rekoncyliacja); w design/shadow executor nie jest wywoływany. Polityka `ops/config/activation.json` = INACTIVE; agenci nie mogą jej zapisać; live wymaga podpisu właściciela zgodnego z hashem. Harmonogram 6 ról zdefiniowany (`ops/config/schedule.json`, wszystko `enabled:false`); runtime nie wybrany — blokada: brak repozytorium git/GitHub (`ops/runtime/ADR-RUNTIME.md`). Dotychczasowe zasady CLAUDE.md (Mode 0, brak publikacji bez zgody) obowiązują bez zmian do podpisania polityki.
Status: Zaakceptowane (orkiestrator) dla trybu shadow; aktywacja — decyzja właściciela (`ops/runtime/ACTIVATION_PACKAGE.md`).
