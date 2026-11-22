# Status instalacji operacji ZOO24

Wersja pakietu 1.0 · aktualizacja 2026-11-22 · tryb **design/shadow** · nic nie jest live.

- [x] O0: realny audyt repo i zgodności z MVP — `ops/runtime/READINESS.md` (brak git/hostingu/GSC/IG — zapisane, nie obchodzone)
- [x] sześć agentów skopiowanych (`.claude/agents/zoo24-ops-*.md`, hashe = MANIFEST) — **wykrycie w sesji: wymaga nowej sesji Claude Code** (lista agentów tej sesji sprzed instalacji)
- [x] istniejący CLAUDE.md bezpiecznie scalony — sekcja między znacznikami `zoo24-ops:appendix`, instalator idempotentny (`scripts/ops-install.mjs`)
- [ ] wybór runtime i prawdziwy koszt/limity — propozycja w `ADR-RUNTIME.md`; blokada: brak repo GitHub; koszt N/A
- [x] registry, gateway, izolacja i uprawnienia — `lib/ops/{registry,gateway,policy,pause,knowledge,guards}.ts` (lease/fencing, allowlista operacji, polityka chroniona przed agentami)
- [x] sześć przepływów i testy na mockach — handlery ról `lib/ops/roles.ts` zintegrowane z `lib/content`, `lib/social`, `lib/seo`, analityką; dispatcher shadow `lib/ops/dispatcher.ts`
- [ ] dostęp/źródła/rights i redaktor/operator — lista w `ACTIVATION_PACKAGE.md`
- [x] shadow i wymagane testy awarii — `QA_REPORT.md` (P01–P08, R01–R11, C01–C06/C10, S01–S09)
- [ ] rzeczywista polityka zaakceptowana — `ops/config/activation.json` = `INACTIVE_PENDING_OWNER_APPROVAL`
- [ ] pierwsza produkcja / canary z receipts — zablokowane (serwis offline, bramka G2)
- [ ] harmonogramy działają i przeżywają zamknięcie sesji — `ops/config/schedule.json` wszystko `enabled:false`; **żadnych zadań nie utworzono**
- [ ] test pauzy także zewnętrznego schedulera — logika przetestowana na mocku (R09); realne Meta N/A
- [ ] raport tygodniowy i obserwacja pilota — po aktywacji

## Integracja z kodem
| Rola | Czyta | Wynik shadow (22.11, realny stan lokalny) |
|---|---|---|
| zoo24-ops-knowledge | źródła artykułów, rejestr dowodów `ops.evidence` | produced — 0 kart faktów, źródła artykułów z URL |
| zoo24-ops-seo | `legacyUrls`, status GSC/GA4 | produced, `partial: gsc blocked_access`, `gsc_clicks = N/A` |
| zoo24-ops-build | VCS, hosting | blocked — `no_version_control` |
| zoo24-ops-content | kolejka `needs_review`, `checkArticlePolicy` | needs_human — 3 artykuły czekają na redaktora |
| zoo24-ops-social | kolejka postów, licencje assetów, kill switch | blocked — brak licencji grafik; publikacja tylko tryb asystowany |
| zoo24-ops-growth | eksperymenty startowe | produced — 3 projekty eksperymentów, wynik N/A |

Panel `/admin` → „Czy publikacje i automatyzacje działają?” pokazuje tryb, status polityki, runtime, 6 ról z planem i ostatnim przebiegiem oraz przycisk ręcznego przebiegu shadow. `schedulerActive` pozostaje `false`.

## Tabela przebiegów
| data | role | job_id / klucz | zakres | dowód | wynik | koszt | next |
|---|---|---|---|---|---|---|---|
| 2026-11-22 | instalacja | — | agenci + CLAUDE.md | `node scripts/ops-install.mjs` ×2 | PASS | 0 | nowa sesja: `/agents` |
| 2026-11-22 | testy | — | `npx vitest run`, `tsc`, `scan:secrets` | 238/238, 0 błędów, PASS | PASS | 0 | — |
| 2026-11-22 | 6 ról | `<rola>:manual:2026-11-22T14:11:00.000Z` | shadow, realny stan lokalny | `ops/runtime/work/shadow-run-2026-11-22.json` | PASS (0 zapisów zewn.) | N/A (bez modelu) | decyzje z ACTIVATION_PACKAGE |
| 2026-11-22 | wywołanie agentów `zoo24-ops-*` | — | I04 | — | BLOCKED | — | nowa sesja |

## Zakres działający dziś
Lokalny prototyp + ręczne przebiegi shadow 6 ról. **Wyłączone integracje:** publikacja Meta, CMS produkcyjny, deploy, GSC, IG, e-mail/DM, płatne media, harmonogram.

**Operator i redaktor:** nie wskazani. **Pauza:** panel `/admin` (kill switch) / `pauseAll`. **Rollback:** nie dotyczy (brak wdrożeń).
