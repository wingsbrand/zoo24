# Gotowość wejścia w operacje (OPERATIONS §3) — 2026-11-22

| Sprawdzenie | Wynik | Dowód / komenda |
|---|---|---|
| Repozytorium | **FAIL** | brak git i brak `.git`; brak SHA/gałęzi — flow branch/PR/rollback niemożliwy |
| Aplikacja lokalnie | PASS | `npx next build` i smoke 20/20 w poprzednich etapach (docs/STATUS.md); `/admin` HTTP 200 w tej sesji; ścieżki Z1–Z4 przechodzone 22.11 (docs/design/UX_QA_REPORT.md) |
| Publikacja treści | PASS (lokalnie) | pliki `content/blog/*.json` → `needs_review` → akceptacja w `/admin/content` z polityką; cofnięcie do szkicu (`returnToDraft`); brak CMS i staging |
| Infrastruktura | **BLOCKED** | brak hostingu, stagingu, backupu, logów produkcyjnych |
| Domeny i konta | częściowo | domena zoo24.pl potwierdzona; GA4 i FB czytane przez Windsor.ai (agregaty, ręczny eksport); **GSC brak; IG brak; ID strony FB/IG nie wpisane** (nie zgadujemy) |
| Prawa | częściowo | logo v2 własne; treści i zdjęcia historyczne — brak praw/archiwum; assety social: 0 z licencją |
| Telemetria | lokalnie | zdarzenia `/api/out` (agregaty bez PII); brak produkcyjnego pomiaru |
| Automatyzacja | **design/shadow** | 6 ról, rejestr, gateway, dispatcher shadow — runtime nie wybrany (ADR-RUNTIME.md) |

Wniosek: MVP gotowe lokalnie, **nie** do produkcji. Role pracują w trybie shadow; brakujące P0 (repo, Supabase+RLS, staging) są pierwszymi zadaniami roli build.
