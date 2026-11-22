# QA-SEO-SOC — raport F1 (2026-11-22)

**Reviewer:** `zoo24-qa` (review statyczny — agent nie miał narzędzia do uruchamiania komend; werdykt własny: BLOCKED do czasu uruchomienia testów).
**Komendy uruchomił orkiestrator** po wprowadzeniu poprawek — wyniki w `docs/STATUS.md`.

## Potwierdzone statycznie (P0)
Blokady redirectów (home, produkt→hub, pętle, łańcuchy, cel ≠ 200), noindex poza produkcją, sitemap bez DEMO, workflow i lock przy claim, rekoncyliacja po timeout, redakcja tokenów, `RealMetaAdapter` bez flagi rzuca błąd, DEMO nie przejdzie przez real adapter, N/A przy braku źródeł, brak ocen i fikcyjnych „realnych” firm.

## Uwagi i status poprawek
| ID | Waga | Problem | Poprawka | Test |
|---|---|---|---|---|
| H1 | high | panel/akcje otwarte przy publicznym stagingu lub braku `ZOO24_ENV` | panel tylko `ZOO24_ENV=local` + host loopback (`lib/site.ts`, `app/admin/layout.tsx`, `actions.ts`) | `qa-regressions` H1/M1 — FIXED |
| H2 | high | retry po 5xx bez rekoncyliacji; test zależny od deduplikacji mocka | `findByIdempotencyKey` przed każdą próbą >1; mock domyślnie BEZ dedupe + `createdTotal` | `qa-regressions` H2 + 3 crony bez dedupe — FIXED |
| M1 | medium | POST jobów bez kontroli Origin (CSRF) | `isTrustedAdminRequest` (loopback, `Sec-Fetch-Site`, `Origin`) | test jednostkowy + ręczny cross-origin POST → 404 — FIXED |
| M2 | medium | wznowienie odblokowywało kanał zapauzowany po auth | osobne `setChannel` + przycisk w panelu | FIXED |
| M3 | medium | retry omijał regułę stale (catch-up) | stale obowiązuje także retry | FIXED |
| M4 | medium | post utknięty w `publishing` po awarii | sweep wygasłego lease → rekoncyliacja → `held` | FIXED |
| M5 | medium | limit tygodniowy blokował wszystkie; `schedule()` bez limitu | liczone tylko wcześniejsze posty; limit w `schedule()` | FIXED |
| M6 | medium | SQL: hash od klienta, brak `source_refs`, admin mógł ustawić `published` | trigger liczy hash, obejmuje `source_refs`, `publishing/published` tylko `service_role` | FIXED w propozycji SQL — **nieuruchomione (N/A)** |
| L1 | low | lock bez właściciela | token właściciela per transakcja | FIXED |
| L2 | low | `sponsored` poza hashem | dodane do hasha | FIXED |
| L3 | low | `/api/out`: brak walidacji URL, prefetch/boty | tylko `https://`, pomijanie prefetch/botów w liczniku | FIXED (bez rate limitu — do F2) |
| L4 | low | skan sekretów pomijał `.data/` | `.data/` skanowane | FIXED |

## Otwarte
- Brak rate limitingu i realnego Auth (F2: Supabase Auth + RLS, staging za hasłem).
- Testy RLS na Postgres, Lighthouse/a11y — nieuruchomione (N/A).
