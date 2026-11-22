# Pakiet aktywacji zoo24-ops — do decyzji właściciela

**Stan:** przygotowane, **nieaktywne**. Nic nie jest live. Ten dokument proponuje **jeden** zakres do zatwierdzenia i listę dokładnie potrzebnych dostępów (bez haseł i tokenów — sekrety wyłącznie w magazynie dostawcy/hostingu).

## Proponowany zakres pierwszej aktywacji: „Shadow z harmonogramem (tylko odczyt)”
Co się włączy po zgodzie:
- 6 zadań ról `zoo24-ops-*` w harmonogramie (Europe/Warsaw): knowledge codz. 07:00, SEO pn–pt 07:30, build pn–pt 08:00, content pn/śr/pt 09:00, social codz. 09:00, growth wt/czw 10:00; raport tygodniowy pn 12:00.
- Każdy przebieg: odczyt stanu i agregatów (Windsor.ai: GA4, FB; GSC/IG po podłączeniu), szkice, karty faktów, kolejka 14 dni, propozycje SEO — zapis wyników do rejestru i raportu.
- **Zero zapisów zewnętrznych**: żadnych postów, publikacji artykułów, zmian na stronie, DNS, e-maili/DM, wydatków. Gateway zostaje w trybie shadow (`dry_run`).

Czego ten zakres **nie** obejmuje (osobne zgody później): pierwsza produkcja i DNS (bramka G2), canary publikacji (1 artykuł, 1 post FB, 1 post IG, 1 poprawka SEO — dopiero gdy serwis działa publicznie), auto-deploy, płatne kampanie.

## Warunki techniczne (wykona Claude po zgodzie)
1. Prywatne repozytorium git + GitHub dla kodu ZOO24 (bez `.data/`, `imports/`, `.env`).
2. Trwały stan `ops` w Supabase/Postgres (zastąpienie `.data/state.json`) — inaczej chmurowy run go nie zobaczy.
3. 6 chmurowych zadań Claude Code, jeden dispatcher, maks. 2 równoległe; test przetrwania zamknięcia laptopa (I05) i pauzy.
4. Polityka v1 podpisana przez właściciela w `ops/config/activation.json` (mode `shadow`, `enabled: true`, autonomia wyłącznie `read_approved_sources` + `create_drafts`), wpis ADR.

## Dostępy — dokładna lista
| Zasób | Stan dziś | Minimalny zakres | Kto |
|---|---|---|---|
| Repozytorium GitHub (prywatne) | brak | zapis gałęzi/PR dla Claude; chroniona gałąź główna | właściciel zakłada / akceptuje |
| Claude Code — zadania chmurowe | niezweryfikowane | 6 zadań, konektor Windsor.ai tylko odczyt | właściciel (konto) |
| Supabase (projekt dev) | brak | baza dev + Auth; klucz serwisowy tylko w sekretach | właściciel zakłada, Claude konfiguruje |
| Windsor.ai | GA4 + FB podłączone | odczyt agregatów; dołączyć **Search Console** i **Instagram** | właściciel |
| Google Search Console | brak | property zoo24.pl, rola: pełny odczyt | po uruchomieniu serwera (decyzja z 22.11) |
| Facebook Page ZOO24.PL / Instagram | odczyt FB przez Windsor.ai | na tym etapie **tylko odczyt**; ID strony i konta IG do wpisania (nie zgadujemy) | właściciel |
| Redaktor + zastępca | brak | review artykułów i postów raz w tygodniu | właściciel wskazuje |
| Operator alarmów | brak | odbiór pilnych alertów, prawo pauzy; kanał np. e-mail | właściciel wskazuje |

## Koszt
- Zmierzony: **N/A** (runtime nie działał). Propozycja z pakietu: do **600 zł/mies.** na AI/automatyzacje (nie jest wyceną), **0 zł** reklamy.
- Pilot 7 dni w zakresie powyżej mierzy realne zużycie; przy 70% limitu — sygnał, 90% — wstrzymanie opcjonalnych przebiegów, 100% — stop nowych płatnych wywołań.
- Redakcja/moderacja — osobna pozycja (zależna od wykonawcy).

## Pauza i wycofanie
- Panel `/admin` → „Wstrzymaj publikacje”; w kodzie `pauseAll` (stan `paused`, kolejka anulowana, harmonogram dostawcy sprawdzony — bez dostępu ⇒ `partially_paused` z instrukcją).
- Wyłączenie zadań w runtime; `ops/config/schedule.json` pozostaje źródłem `enabled:false`.
- Brak nadrabiania zaległości po wznowieniu.

## Decyzje właściciela (maks. 3)
1. **Zasoby:** zgoda na prywatne repo GitHub i chmurowe zadania Claude Code dla 6 ról; podłączenie GSC i Instagrama w Windsor.ai (gdy serwis ruszy).
2. **Ludzie i koszt:** wskazanie redaktora (+ zastępcy) i operatora alarmów z kanałem; limit AI na pilot (propozycja ≤ 600 zł/mies.), reklamy 0 zł.
3. **Aktywacja:** podpis polityki v1 „shadow z harmonogramem — tylko odczyt” na 7 dni pilota; canary publikacji dopiero po starcie serwisu (osobna zgoda).

Brak odpowiedzi = brak zgody: role działają dalej tylko w ręcznym trybie shadow.
