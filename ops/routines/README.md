# Zadania chmurowe zoo24-ops — konfiguracja

Tworzone na https://claude.ai/code/routines (konto z autoryzacją GitHub do `wingsbrand/zoo24`). Każde: repozytorium `wingsbrand/zoo24`, środowisko Default, model Sonnet 5.5, **bez konektorów**, narzędzia: Bash, Read, Write, Edit, Glob, Grep (knowledge dodatkowo WebFetch, WebSearch).

Czas: harmonogram chmurowy jest w UTC. Poniżej zima (CET = UTC+1); od 28.03.2027 przesunąć o −1 h, aby zachować godziny lokalne.

| Nazwa | Cron (UTC) | Lokalnie (zima) | Polecenie |
|---|---|---|---|
| ZOO24 ops — knowledge (shadow) | `0 6 * * *` | codziennie 07:00 | `Przeczytaj i wykonaj dokładnie ops/routines/knowledge.md (oraz ops/routines/_common.md). Tryb SHADOW: zero zapisów zewnętrznych, nigdy nie pushuj na main — tylko gałąź ops/knowledge.` |
| ZOO24 ops — seo (shadow) | `30 6 * * 1-5` | pn–pt 07:30 | jak wyżej z `seo` |
| ZOO24 ops — build (shadow) | `0 7 * * 1-5` | pn–pt 08:00 | jak wyżej z `build` |
| ZOO24 ops — content (shadow) | `0 8 * * 1,3,5` | pn/śr/pt 09:00 | jak wyżej z `content` |
| ZOO24 ops — social (shadow) | `0 8 * * *` | codziennie 09:00 | jak wyżej z `social` |
| ZOO24 ops — growth (shadow) | `0 9 * * 2,4` | wt/czw 10:00 | jak wyżej z `growth` |

Jeden dispatcher: nie twórz drugiego zestawu (Desktop, /loop, lokalny cron) dla tych samych ról. Pauza: wyłącz zadania na stronie routines (toggle) — wyniki zostają na gałęziach `ops/<rola>`.
