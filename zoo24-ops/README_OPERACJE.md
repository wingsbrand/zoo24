# ZOO24 — pakiet operacyjny dla Claude Code

**Etap 2: po przygotowaniu pierwszej wersji serwisu. Wersja pakietu 1.0, 22.11.2026.**

W tym pakiecie są kompletne instrukcje instalacji sześciu ról operacyjnych: budowa serwisu, treści/publikacja, pozyskiwanie użytkowników, baza wiedzy, Facebook/Instagram i SEO. To dodatek do istniejącego projektu, który zachowuje Starter V2 i kod już napisany przez Claude.

## Zrób tylko to

1. Kiedy Claude przygotuje pierwszą wersję projektu, rozpakuj **cały folder `zoo24-ops` do głównego folderu tego projektu** (obok istniejącego `CLAUDE.md`).
2. Otwórz w Claude Code **główny folder aplikacji ZOO24**, nie sam folder dodatku.
3. Wklej:

```text
Przeczytaj zoo24-ops/START_OPERACJE.txt i wykonaj opisany tam etap operacyjny
w tym istniejącym projekcie ZOO24. Zainstaluj sześć ról, zintegruj je ze stroną,
przetestuj harmonogramy i przygotuj konkretny pakiet aktywacji.
```

Claude ma sam skopiować nowe definicje agentów do właściwego miejsca, dopisać odsyłacz do głównego CLAUDE.md, sprawdzić rzeczywisty stan projektu i wdrożyć operacje. Nie trzeba ręcznie przeklejać sześciu promptów ani zastępować wcześniejszego CLAUDE.md.

## Co dostajesz

| Element | Znaczenie |
|---|---|
| `START_OPERACJE.txt` | Gotowe polecenie do wykonania instalacji i pilota |
| `ops/OPERATIONS.md` | Kompletny plan działania i wdrożenia |
| `.claude/agents/` | Sześć nowych definicji `zoo24-ops-*` do skopiowania przez Claude do głównego `.claude/agents/` |
| `ops/spec/ROLE_SOPS.md` | Praca każdej roli krok po kroku |
| `ops/spec/ACCEPTANCE.md` | Scenariusze odbioru i awarii |
| `ops/spec/SOURCES.md` | Oficjalne źródła i ograniczenia faktów technicznych |
| `ops/templates/` | Konfiguracje wzorcowe, dostępy i raporty; wszystkie live zakresy wyłączone |
| `ops/prompts/` | Sześć gotowych poleceń dla harmonogramów |
| `CLAUDE_OPS_APPENDIX.md` | Sekcja do bezpiecznego scalenia z istniejącą instrukcją |

## Jak będzie działała samodzielność

Po pierwszym odbiorze i nadaniu uprawnień agenci pracują w stałym zakresie, bez codziennych poleceń właściciela. Nowe treści merytoryczne przechodzą delegowanego redaktora, a opublikowanie sprawdzonych wersji i ich dystrybucja są automatyczne. Zmiany budżetu, kont i wysokiego ryzyka pozostają wyjątkami.

Claude wybiera dostępny runtime: preferowane chmurowe zadania harmonogramowe, jeśli dostępne i przetestowane; alternatywnie zarządzany worker Agent SDK. Samo rozpakowanie plików niczego nie publikuje i nie tworzy działających harmonogramów. Stan początkowy to `design`, a konfiguracje są **przykładami do integracji z kodem**, nie pluginem instalującym się samodzielnie.

Nie potrzebujesz teraz wpisywać haseł ani kluczy do dokumentów. Claude najpierw kończy bezpieczne prace i przekazuje listę dokładnie potrzebnych dostępów oraz jeden konkretny zakres aktywacji.
