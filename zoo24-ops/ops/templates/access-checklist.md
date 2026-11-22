# Dostępy i aktywacja — wypełnia Claude podczas instalacji

Nigdy nie wpisuj haseł ani tokenów do tej listy. Zapisuj nazwę zasobu, identyfikator, właściciela dostępu, status, zakres i datę testu. Sekret tylko w bezpiecznym magazynie.

| Zasób | ID / konto | Minimalny zakres | Wynik testu | Brak / następny krok |
|---|---|---|---|---|
| Repo aplikacji | do ustalenia | branch/PR; chroniona produkcja | N/A | |
| CMS / baza | do ustalenia | staging + wąskie operacje publikacji | N/A | |
| Hosting / CI | do ustalenia | preview i promowanie konkretnych releasów | N/A | |
| GSC | do ustalenia | odczyt właściwej property | N/A | |
| GA4 / agregaty | do ustalenia | odczyt raportów | N/A | |
| Facebook Page | do ustalenia | odczyt, publikacja, osobno moderacja | N/A | |
| Instagram | do ustalenia | właściwy login route i account type | N/A | |
| Grafiki / media | do ustalenia | storage/rights i dostęp dostawcy do finalnego pliku | N/A | |
| Scheduler | do ustalenia | wyłącznie sześć zaakceptowanych zadań | N/A | |
| Gateway | do ustalenia | operacje przypisane per rola | N/A | |
| Redaktor + zastępca | do ustalenia | review finalnych wersji | N/A | |
| Operator alarmów | do ustalenia | odbiór incydentów i uprawnienie pauzy | N/A | |

## Pierwszy pakiet decyzji dla właściciela (maksymalnie 3 grupy)

1. **Zasoby i zakres:** konkretne konta/domena, dozwolone zielone operacje, treści i okna publikacji, kanał alertów, osoba od awarii.
2. **Koszt i ludzie:** zmierzony koszt/limit AI i narzędzi, redaktor/zastępca, budżet płatnych kampanii domyślnie zero.
3. **Aktywacja:** konkretny release i lista testów, canary, polityka, sposób pauzy, zakres późniejszej samodzielności.

Jeśli właściciel już udzielił dokładnie takiej zgody w sesji, zapisz dowód i nie pytaj drugi raz. Brak zasobu blokuje tylko zależny zakres. Polityki platform i narzędzi pozostają w mocy.
