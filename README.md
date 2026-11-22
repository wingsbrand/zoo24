# ZOO24.pl — pakiet wykonawczy Claude Code v1.2

**Cel:** zbudować niskoobsługowy katalog usług + portal poradnikowy i równolegle odzyskiwać dawny potencjał SEO oraz reaktywować **istniejące** kanały Facebook i Instagram. Nie budujemy sklepu ani systemu rezerwacji.

## Co nowego po uwzględnieniu danych właściciela

- Historycznie **100 000+ wejść organicznych/miesiąc** oraz **kilkanaście tysięcy obserwujących na FB i IG** — deklaracja właściciela. Wymagany audyt obecnych danych: **nie** zakładać, że tyle osób wciąż odwiedza stronę lub widzi posty.
- **P0 SEO Recovery:** badanie GSC/GA4, spis ważnych historycznych URL, zachowanie starych wartościowych treści tam, gdzie legalne, bezpieczne 301 tylko gdy intencje pasują, 404/410 zamiast nieadekwatnych przekierowań, monitoring i raporty.
- **P0 Social Operations:** strategia reaktywacji dawnych kont, post powrotny, content pillars, 14-dniowy kalendarz, osobne treści FB/IG, prawa do zdjęć, UTM, pomiar i bezpieczny system zbiorczych akceptacji.
- **Automatyzacja:** docelowo batch approve co 14 dni + raport raz w tygodniu. API i harmonogram realnego publikowania tylko po osobnej zgodzie, konfiguracji uprawnień i monitoringu; prototyp korzysta z mocków.

## Uruchomienie

1. Rozpakuj ZIP, zachowując folder **`.claude/agents/`** (ukryty na części systemów).
2. Wejdź w katalog `zoo24-claude-code` zawierający `CLAUDE.md` i uruchom Claude Code: `claude`.
3. Wklej **cały** `START_PROMPT.txt`; agent ma przeczytać również `docs/SEO_SOCIAL_RECOVERY.md` i `docs/AUTOMATION_RUNBOOK.md`.
4. Zweryfikuj raport F0, lokalne demo i `docs/STATUS.md`. Do tego czasu nie udostępniaj produkcyjnych tokenów, nie zmieniaj DNS ani nie włączaj prawdziwych publikacji.

## Lokalny prototyp F1 (Mode 0 / MOCK)

```powershell
npm install
npm run dev            # http://localhost:3024  (panel: /admin, /admin/seo, /admin/social)
npm run check          # typecheck + testy + skan sekretów
node scripts/smoke-http.mjs              # testy statusów HTTP (przy działającym dev)
npm run jobs:run -- weekly_kpi_report    # ręczne uruchomienie joba MOCK (to nie jest cron)
```

Wszystkie dane są DEMO i nieindeksowane. Żadne posty, redirecty ani integracje nie są aktywne. Stan: `docs/STATUS.md`.

## Dokumenty

| Plik | Po co |
|---|---|
| `docs/MASTER_PLAN.md` | Kompletny PRD, biznes, SEO, roadmapa, monetizacja, backlog i acceptance criteria |
| `docs/SEO_SOCIAL_RECOVERY.md` | Szczegółowa strategia odzyskania ruchu i FB/IG, działania 0–90 dni, KPI, workflow |
| `docs/AUTOMATION_RUNBOOK.md` | Powtarzalne zadania systemowe, approval, cron, awarie, właściciel, redaktor |
| `CLAUDE.md` i `START_PROMPT.txt` | Obowiązkowa instrukcja wykonania oraz pierwsze polecenie |
| `.claude/agents/*.md` | **9 agentów** (SEO, social, analytics, product, architecture, builder, QA, growth, compliance) |
| `docs/*.template.csv` | Puste formaty: URL mapping, baseline i kalendarz publikacji — nie rzeczywiste dane |
| `docs/STATUS.md` | Prawdziwy status realizacji; początkowo prototyp i integracje nie są zbudowane |

## Właściciel i bezpieczne uruchomienie

Wstępny cel po stabilizacji: 30–60 min właściciela/tydzień **z redaktorem/moderatorem lub zatwierdzonym procesem kontroli treści**. Claude Code samo w sobie nie jest całodobowym botem: potrzebne są oddzielne zadania cron / kolejki lub zgodne narzędzie Meta Business Suite oraz dostęp do GSC/Meta. Każda publikacja musi mieć źródło, prawa do materiałów i potwierdzony status. Dane historyczne nie gwarantują odzyskania pozycji.

Opracowano 2026-11-22. Strategia i pliki konfiguracyjne, nie ukończony serwis ani działająca integracja.
