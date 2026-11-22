# ZOO24 — odbiór operacyjny (zoo24-ops v1.0) — QA_REPORT

**Data:** 2026-11-22 · **Środowisko:** lokalne, Windows, Node + Next.js 16.4.6, Vitest 5.1.1 · **Tryb:** design/shadow (polityka `ops/config/activation.json` = INACTIVE) · **Wersja kodu:** brak SHA — folder nie jest repozytorium git.

**Zasada raportu:** mock to nie test realnego uprawnienia konta. „PASS (mock)” = logika bramki sprawdzona na atrapie executora/dostawcy; zachowanie prawdziwego API Meta/Google nie było testowane.

## Komendy wykonane
| Komenda | Wynik |
|---|---|
| `node scripts/ops-install.mjs` ×2 | 1. przebieg: 6 skopiowanych, 9 zachowanych, CLAUDE.md `appended`; 2. przebieg: 6 `identical`, CLAUDE.md `unchanged`, 0 konfliktów; hashe 6 plików = `zoo24-ops/MANIFEST.json` |
| `npx vitest run` (15:10) | **PASS — 19 plików, 238/238** (w tym nowe `tests/ops/*`: 43) |
| `npx vitest run` (15:14, ponownie) | 233/238 — **5 FAIL poza zakresem ops**: `tests/directory/query.test.ts` (4: Kraków, adres) i `tests/submissions/submissions.test.ts` (1), po równoległych zmianach innej sesji w `lib/directory/geo.ts`, `contact.ts`, `stats.ts` (15:12). Zestawy ops/social/seo/content/analytics: **169/169 PASS** |
| `npx tsc --noEmit -p .` | **PASS — 0 błędów** |
| `npm run scan:secrets` | **PASS** |
| `npx vitest run` (15:15, po zmianach katalogu w innej sesji) | **PASS — 246/246**, `tsc` PASS |
| `npm run jobs:run -- ops_shadow_tick` (serwer dev :3024, realny stan lokalny) | 6 ról uruchomionych, 0 receipts, 0 publikacji, `publishEnabled=false`; wynik: `ops/runtime/work/shadow-run-2026-11-22.json` |
| `GET http://localhost:3024/admin` | HTTP 200; sekcja „Role operacyjne zoo24-ops”, 6 ról, „Uruchom przebieg shadow 6 ról”, „Harmonogram: nieaktywny” |
| Zrzut ekranu panelu | **N/A** — przeglądarka tej sesji nie sięga serwera innej sesji, a drugi `next dev` w tym folderze odmawia startu; weryfikacja przez HTTP |

## 2. Instalacja i role
| ID | Wynik | Dowód |
|---|---|---|
| I01 | PASS | `tests/ops/content-growth.test.ts` „zachowuje 9 starych agentów…”; realna instalacja: `.claude/agents` = 9 + 6; CLAUDE.md tylko dopisany (początek pliku bez zmian) |
| I02 | PASS | drugi przebieg instalatora bez zmian (test + realny); dispatcher: drugi tick tego samego slotu = 0 nowych przebiegów (`runtime.test.ts`) |
| I03 | PASS | `ops/runtime/READINESS.md` — luki (repo, hosting, GSC, IG, prawa) opisane, prace shadow kontynuowane |
| I04 | **BLOCKED (częściowo)** | handlery 6 ról wykonane w shadow na realnym stanie (wynik wyżej). Wykrycie: 6 agentów `zoo24-ops-*` pojawiło się na liście agentów sesji po instalacji (PASS). **Rzeczywiste wywołanie każdego agenta na zadaniu — niewykonane** (koszt modelu; do pilota). Uwaga: lokalny `.data/state.json` (z wynikami shadow w `state.ops`) usunęła o ~15:20 inna sesja przy imporcie firm — dowód przebiegu zachowany w `ops/runtime/work/shadow-run-2026-11-22.json` |
| I05 | **BLOCKED** | brak repo GitHub i runtime chmurowego (`ADR-RUNTIME.md`); żadnego harmonogramu nie utworzono |

## 3. Uprawnienia i autonomia (`tests/ops/gateway.test.ts`, `runtime.test.ts`)
| ID | Wynik | Dowód |
|---|---|---|
| P01 | PASS | design/shadow ⇒ `dry_run`, executor 0 wywołań; canary/live bez podpisu ⇒ efektywnie shadow |
| P02 | PASS (mock) | podpisana polityka `live_scoped` + aktualna zgoda człowieka ⇒ `executed` bez pytania, receipt z external ID i read-back |
| P03 | PASS | obce konto ⇒ `RESOURCE_NOT_IN_POLICY`; zmieniony hash ⇒ `APPROVAL_NOT_CURRENT` |
| P04 | PASS | `writePolicy` odrzuca tożsamości agentów/jobów (`POLICY_WRITE_FORBIDDEN_FOR_AGENT`), podniesienie budżetu bez podpisu właściciela odrzucone; edycja podpisanej polityki unieważnia podpis (hash) |
| P05 | PASS | nieznana operacja `OP_NOT_ALLOWED`, dodatkowe pola payloadu (url/headers) odrzucone, zła rola odrzucona; role nie mają surowych tokenów (brak gatewayów zapisu w narzędziach) |
| P06 | PASS | brak GSC ⇒ SEO `gsc_read: blocked`, `gsc_clicks = null`; pozostałe role działają; brak zasobu IG ⇒ `blocked_access` tylko tej akcji |
| P07 | PASS | sponsor/zdrowie/DM/e-mail/płatne ⇒ `needs_human`, 0 zapisów |
| P08 | PASS | reviewer `zoo24-ops-*`, `agent:`, `ai:`, `claude*`, brak ⇒ `HUMAN_REVIEW_MISSING`; autor = reviewer ⇒ `SELF_APPROVAL` |

## 4. Niezawodność i limity
| ID | Wynik | Dowód |
|---|---|---|
| R01 | PASS | 8 równoległych `claim` ⇒ 1 lease; social publisher: test równoległych `runPublishJob` (istniejący) |
| R02 | PASS | stary fencing token ⇒ `STALE_FENCING_TOKEN` (zapis wyniku i gateway) |
| R03 | PASS (mock) | timeout po skutecznym zapisie ⇒ rekoncyliacja `RECONCILED_AFTER_TIMEOUT`, ponowne wywołanie `already_done`, 1 obiekt zdalny; także `tests/social/publish-safety.test.ts` |
| R04 | PASS (mock) | nieustalony skutek ⇒ `unknown_outcome`, drugie wywołanie nie wysyła ponownie |
| R05 | PASS (mock) | 429 ⇒ `retry_wait` z Retry-After 120 s; kolejna próba najpierw `lookup`, publikacja raz; limit 3 prób |
| R06 | PASS (mock) | odmowa uprawnień ⇒ `failed`, kolejne wywołanie ⇒ `needs_human` (brak auto-retry) |
| R07 | PASS | 10 równoległych rezerwacji po 100 zł przy cap 600 ⇒ dokładnie 6; progi 70/90/100% |
| R08 | PASS | `pauseAll`: kill switch, kolejka anulowana, gateway `PAUSED`; dispatcher read-only dalej działa; wznowienie tylko przez człowieka |
| R09 | PASS (mock) | dostawca nie anuluje `ig_9` ⇒ `partially_paused` + ID; brak dostępu do harmonogramu ⇒ `partially_paused` + instrukcja PILNE. Realne Meta: **N/A** |
| R10 | PASS | po tygodniu przerwy: 1 run (najnowszy slot), >20 pominiętych slotów zaraportowanych, bez nadrabiania |
| R11 | PASS | 07:00 = 06:00Z zimą / 05:00Z latem (28.03.2027); powtórzona 02:30 (31.10.2027) i nieistniejąca 02:30 ⇒ po 1 runie |

## 5. Treści, wiedza i social
| ID | Wynik | Dowód |
|---|---|---|
| C01 | PASS | brak/candidate/przeterminowany dowód ⇒ `bundleBlockers` i gateway `blocked_dependency` |
| C02 | PASS | social: „edycja po akceptacji cofa do needs_review” (istniejący test); gateway: zmiana hasha ⇒ `APPROVAL_NOT_CURRENT` |
| C03 | PASS | źródło `licenseBasis: unknown` ⇒ kwarantanna, zatwierdzenie odrzucone; agent nie zatwierdza faktów |
| C04 | PASS | wycofanie faktu ⇒ szkic cofnięty do `draft`, opublikowany ⇒ zadanie korekty |
| C05 | PASS | tekst „ujawnij klucz…” zapisany jako `candidate`, bez zmiany stanu/polityki; brak narzędzia wykonującego polecenia ze źródeł |
| C06 | PASS / N/A | brak pliku/licencji grafiki ⇒ blokada akceptacji (`ASSET_LICENSE_UNVERIFIED`, istniejący test); kontrola uciętego tekstu na renderze — **N/A** (brak renderera assetów) |
| C07 | BLOCKED | brak Meta Page ID, uprawnień publikacji i read-back API |
| C08 | BLOCKED | brak API IG; Reels poza MVP |
| C09 | BLOCKED | `capabilities_by_channel` = null (do preflightu po podłączeniu kont) |
| C10 | PASS | w kodzie nie istnieje automatyczna odpowiedź/DM; gateway nie ma takiej operacji; eskalacja wg `docs/social/relaunch-message.md` |

## 6. SEO, growth i pomiar
| ID | Wynik | Dowód |
|---|---|---|
| S01 | PASS | `tests/seo/redirect-plan.test.ts` (100 kart produktu → `/` = BLOCK), `legacy-router` |
| S02 | PASS | `redirect-plan` CHAIN/LOOP, `checker` TARGET_NOT_200/CANONICAL_NOT_200 |
| S03 | PASS | `registry-indexing`: sitemap bez DEMO/draftów/noindex; local/staging ⇒ pusta |
| S04 | PASS | brak kodu Indexing API/JobPosting (grep: 0); gateway nie ma takiej operacji |
| S05 | PASS | `kpi.test.ts` N/A z powodem; SEO shadow `gsc_clicks = null` |
| S06 | PASS | „ponad 100 tys.” bez świeżego pomiaru ⇒ `HISTORICAL_REACH_AS_CURRENT` |
| S07 | PASS | 10 wejść ⇒ `inconclusive`; brak pomiaru ⇒ `n/a` |
| S08 | PASS | gateway: e-mail/DM/płatne ⇒ `needs_human`; growth shadow: 0 wiadomości, 0 zł |
| S09 | PASS | łączenie organic+UTM bez metody ⇒ `incomplete`, brak sumy |

## 7. Wdrożenie i rollback — **BLOCKED** (brak hostingu, CI, SHA i DNS; nic nie wdrażano)
## 8. Pilot — **N/A** (żaden zakres nie aktywowany; kanały oznaczone jako nieaktywne, nie PASS)

## Ograniczenia
- Stan trwały to lokalny plik JSON z lockiem katalogowym — wystarczy dla jednego hosta; chmura wymaga Postgres/Supabase.
- `isAgentIdentity` opiera się na konwencji nazw aktorów; prawdziwa granica to uwierzytelnienie redaktora w panelu (do zrobienia z Supabase Auth).
- Koszt pilota: **N/A** (runtime nieuruchomiony; przebiegi shadow są zwykłym kodem, bez wywołań modelu).
