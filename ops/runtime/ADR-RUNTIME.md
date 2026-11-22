# ADR-RUNTIME — gdzie będą działać role zoo24-ops

**Data:** 2026-11-22 · **Status:** WDROŻONE (aktualizacja 2026-11-22 17:03) — 6 zadań chmurowych Claude Code, tryb shadow · **Strefa:** Europe/Warsaw

## Aktualizacja: stan wdrożony
- Repozytorium: prywatne `wingsbrand/zoo24`; aplikacja GitHub „Claude” zainstalowana na koncie `wingsbrand` tylko dla `zoo24`; integracja GitHub włączona w organizacji przez właściciela.
- 6 zadań (identyfikatory w `ops/config/schedule.json`): model Sonnet 5.5, środowisko Default, bez konektorów, polecenie = `ops/routines/<rola>.md` + `_common.md`; wyniki wyłącznie na gałęziach `ops/<rola>`, nigdy `main`.
- Cron w UTC dla CET; od 28.03.2027 przesunąć o −1 h (test w `tests/ops/runtime.test.ts` pilnuje zgodności z czasem lokalnym zimą).
- Koszt: w ramach subskrypcji konta (ADR-013), bez kluczy API.
- Pauza: przełącznik przy zadaniu na https://claude.ai/code/routines (usunięcie tylko tam). Lokalny dispatcher shadow (`/admin`, `ops_shadow_tick`) pozostaje ręczny i używa innych kluczy (`manual:`), więc nie dubluje zadań.
- Trwałość stanu: historia wyników w gałęziach git `ops/<rola>` (efemeryczne środowisko nie trzyma `.data/`).

## Stan faktyczny (sprawdzony)
| Warunek | Wynik | Dowód |
|---|---|---|
| Repozytorium git | **BRAK** — folder nie jest repo, `git` niezainstalowany w PATH | `git status` → „term 'git' is not recognized”; brak `.git` (`lib/ops/env.ts` → `vcs=false`) |
| Hosting / CI / produkcja | **BRAK** — serwis offline, DNS nietknięty | docs/STATUS.md, bramka G2 |
| Cloud scheduled tasks (routines) | **niedostępne dla tego projektu** — wymagają repozytorium na GitHub; nie weryfikowano limitów konta | brak repo |
| Desktop scheduled tasks | dostępne w aplikacji, ale wymagają włączonego komputera i aplikacji — **nie 24/7** | narzędzie obecne w sesji; **żadnego zadania nie utworzono** |
| `/loop` | związany z otwartą sesją — odrzucony | OPERATIONS §5 |
| Worker Agent SDK | wymaga hostingu, klucza API (osobny koszt od abonamentu) i sekretów poza repo — brak | — |

## Decyzja (proponowana)
1. **Docelowo: chmurowe zadania harmonogramowe Claude Code**, po jednym na rolę (6), każde z promptem `zoo24-ops/ops/prompts/<rola>.txt`, z minimalnym zestawem konektorów (Windsor.ai tylko odczyt dla seo/social/growth; brak konektorów zapisu). Warunek: prywatne repo GitHub + test, że run czyta trwały stan.
2. **Trwały stan**: obecnie `.data/state.json` (`AppState.ops`: jobs, results, receipts, evidence, budżet, pauza). Efemeryczne środowisko chmurowe go **nie zachowa** → przed włączeniem chmury stan musi trafić do Supabase/Postgres (zaplanowane w F1 c.d.) albo do commitowanych plików `ops/runtime/work/` (tylko wyniki shadow, bez danych osobowych).
3. **Do tego czasu**: przebiegi shadow uruchamiane ręcznie (`npm run jobs:run -- ops_shadow_tick` lub przycisk w `/admin`). Jeden dispatcher (`ops.dispatcher` lease) — cloud i lokalny dispatcher nie mogą działać jednocześnie dla tego samego `job_key`.

## Parametry, które obowiązują niezależnie od runtime
- maks. 2 równoległe przebiegi modelu, 1 zapisujący na zasób; build 2400 s / 50 tur, pozostałe 1200 s / 30 tur; ≤ 3 próby tylko przy błędach przejściowych.
- bez `bypassPermissions` / `--dangerously-skip-permissions`; narzędzia ról bez zmian względem paczki (brak gatewayów zapisu, bo żaden nie istnieje).
- koszt: **N/A** — runtime nie działa; pierwsze 7 dni pilota ma zmierzyć realne zużycie zanim limit zostanie przyznany.

## Zatrzymanie i odtworzenie
- Pauza: `pauseAll` (lib/ops/pause.ts) — stan `paused`, kill switch social, anulowanie kolejki; harmonogram dostawcy bez dostępu ⇒ `partially_paused` + instrukcja dla operatora.
- Wyłączenie runtime: usunięcie/wyłączenie zadań w panelu runtime + `ops/config/schedule.json` pozostaje `enabled:false`.
- Odtworzenie po awarii: job z wygasłym lease przejmuje nowy worker z wyższym fencing tokenem; spóźniony worker jest odrzucany (testy R01/R02).
