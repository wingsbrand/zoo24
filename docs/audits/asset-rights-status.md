# Status praw i dostępów — aktualizacja 2026-11-22 (deklaracje właściciela + odczyt Windsor.ai)

| Aktywo | Status | Źródło / uwagi | Następny krok |
|---|---|---|---|
| Domena zoo24.pl | **TAK** — abonent: spółka WINGS RETAIL; rejestrator/hosting DNS: aftermarket.pl | deklaracja właściciela (2026-11-22) | brak; zmiany DNS tylko po osobnej zgodzie |
| Nazwa i logo ZOO24 | **nowe logo v1 gotowe** (`docs/brand/logo.md`); EUIPO: brak kolizji wg właściciela (2026-11-22) | deklaracja właściciela | opcjonalnie: UPRP + rejestracja znaku z prawnikiem |
| Stare teksty (blog), zdjęcia, opisy produktów | **utracone — nie wykorzystujemy** | deklaracja właściciela | wszystkie treści piszemy od nowa; nie kopiujemy z archiwów internetowych |
| Google Search Console | **BRAK** — założymy po uruchomieniu serwisu na serwerze (decyzja właściciela) | deklaracja właściciela | patrz „Zakładanie GSC” niżej |
| GA4 `zoo24.pl - GA4` (301981165) | **DOSTĘP (odczyt) przez Windsor.ai** | dane 2022-02 – 2024-12; bieżące 28 dni = 0 sesji | ponowne użycie tej usługi na nowym serwisie (ciągłość historii) — decyzja przy wdrożeniu |
| Meta — konto reklamowe „zoo24.pl” | widoczne w Windsor.ai (konektor Meta Ads) | to konto reklamowe, **nie** statystyki strony ani profilu | nie używamy do relaunchu organicznego |
| Facebook Page ZOO24.PL — statystyki organiczne | **DOSTĘP (odczyt) przez Windsor.ai** | 43 515 obserwujących (19.11.2026), interakcje 0 w ostatnich 28 dniach; historia od 23.11.2024 (limit API: 2 lata) | relaunch po akceptacji komunikatu |
| Instagram — statystyki | **BRAK w Windsor.ai** (konektor `instagram` niepodłączony) | — | właściciel łączy konektor Instagram; konto musi być firmowe/twórcy |
| Dane dawnych klientów, zamówień, newslettera | **nie importujemy** | CLAUDE.md, RODO/PKE | — |

## Zakładanie GSC (wykonuje właściciel — zmiana DNS wymaga Twojej decyzji)
1. search.google.com/search-console → Dodaj usługę → typ **Domena** → `zoo24.pl`.
2. Google poda rekord **TXT** — dodaj go w panelu DNS w aftermarket.pl (to jedyna zmiana DNS, nie dotyka strony ani poczty). Po weryfikacji możesz rekord zostawić.
3. Jeśli Google zachował dane dla domeny, zobaczysz ostatnie ~16 mies. — to już okres po zamknięciu sklepu (05.2025 →), ale pokaże, które stare URL nadal mają wyświetlenia i kto do nich linkuje (Linki → eksport).
4. Podłącz nową właściwość w Windsor.ai (konektor Search Console) — wtedy pobiorę eksporty bez Twojego udziału, albo wrzuć CSV do `imports/gsc/` i `npm run import:gsc`.
