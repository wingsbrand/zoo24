# Compliance review — F0 / CON-01 (v0.1, 22.11.2026)

> Opracował agent `zoo24-compliance` (odczyt dokumentów repo). **Lista ryzyk do przeglądu przez kancelarię, nie porada prawna.** Stanu prawnego nie sprawdzano na żywo; przepisy [S10][S11][S14][S15][S16] z MASTER_PLAN należy zweryfikować ponownie w dniu wdrożenia.
> Tagi: **[PREM]** przed publiczną premierą/relaunchem · **[PAY]** przed płatnościami · **[P2]**. Brak dowodu = NO-GO. Brak odpowiedzi właściciela = brak zgody.

## A. GO/NO-GO przed relaunchem social (S) i migracją URL (U)
| # | Bramka | Dowód wymagany dla GO | S | U |
|---|---|---|---|---|
| 1 | Domena zoo24.pl | WHOIS/umowa z rejestratorem na właściciela lub jego spółkę, dostęp do DNS | – | PREM |
| 2 | Nazwa/znak/logo ZOO24 | wyciąg UPRP/EUIPO lub umowa nabycia/licencji od dawnego podmiotu. Sama domena nie daje praw do znaku. **Ocena kancelarii** | PREM | PREM |
| 3 | Stare treści i zdjęcia | dla każdego URL `content_rights` = own/licensed/none; zdjęcia producentów/hurtowni domyślnie `none` | PREM | PREM |
| 4 | Opinie Opineo (~10 tys.) | **nie kopiować** tekstów, gwiazdek ani widgetów; najwyżej neutralna wzmianka po ocenie kancelarii | PREM | PREM |
| 5 | Konta FB/IG | zrzut z Business Managera: administratorzy, Business Portfolio, typ konta IG. Prywatne konta osób trzecich jako admini = NO-GO do czasu przekazania | PREM | – |
| 6 | Dane klientów/newsletter/zamówienia | **zakaz importu** do repo i serwisu; tylko agregaty GSC/GA4/Meta | PREM | PREM |
| 7 | PKE art. 398 | brak cold outreach e-mail/SMS/DM; kontakt tylko inbound | PREM | – |
| 8 | RODO/cookies | polityka prywatności, CMP przed analityką niekonieczną, umowy powierzenia; podstawa dla Insights/moderacji (wspólne administrowanie Page Insights) — **ocena kancelarii** | PREM | PREM |
| 9 | Reklama/afiliacja | etykiety „Reklama”/„Link afiliacyjny”, opis zasad kolejności wyników, tag partnerstwa w Meta | PREM | PREM |
| 10 | Weterynaria, art. 29 | zakłady lecznicze tylko w neutralnym wpisie, bez wyróżnień, sponsoringu, rankingów — **ocena kancelarii** | PREM | PREM |
| 11 | DSA, formularze firm | regulamin, punkt kontaktowy, notice-and-action, uzasadnienie moderacji — **ocena kancelarii** | PREM | – |
| 12 | Treści zdrowotne AI | brak porad diagnostycznych; recenzja specjalisty albo wykluczenie z MVP | PREM | PREM |
| 13 | Dawne zamówienia | gotowa odpowiedź: „ZOO24 działa w nowej formule, nie realizujemy dawnych zamówień ani gwarancji”; bez podszywania się pod dawnego operatora | PREM | PREM |
| 14 | Umowa abonamentu, faktury, VAT, reklamacje | ocena przed billingiem | – | PAY |
| 15 | OSM/mapy | przegląd ODbL i atrybucji | P2 | P2 |

## B. Reguły wymuszane przez kod F1 (pokrycie testami — patrz `docs/STATUS.md`)
1. **Licencja assetu:** publikacja zablokowana, jeśli licencja niezweryfikowana, brak dowodu lub wygasła. Edycja po approve cofa do `needs_review`.
2. **Disclosure:** sponsorowane/afiliacyjne => wymagana etykieta i `rel="sponsored nofollow"`; kategoria `vet` => blokada sponsored/featured.
3. **DEMO:** rekordy fikcyjne `demo=true`, widoczny badge, `noindex,nofollow`, wyłączone z sitemap/JSON-LD, zablokowane w social publish (poza symulacją mock).
4. **Brak PII:** walidator UTM odrzuca e-mail, telefon, ID użytkownika; redakcja logów (tokeny, e-maile, telefony); brak treści DM w repo.
5. **Brak ocen:** brak pól rating/review, brak `AggregateRating`, brak gwiazdek (test negatywny).
6. Kill switch, idempotency key, limit 3 posty/kanał/tydzień, brak hurtowej publikacji zaległych wpisów, `Europe/Warsaw`.
7. Redirect 301 tylko z akceptacją człowieka.
8. Brak modułu outreach/mailingu.

## C. Decyzje właściciela (skonsolidowane w STATUS.md)
1. Dowody praw do domeny, znaku/logo i starych treści; wskazanie dawnego podmiotu i umowy przeniesienia.
2. Kto administruje FB/IG; zgoda na przeniesienie do firmowego Business Portfolio z kontem awaryjnym.
3. Treść komunikatu o dawnych zamówieniach oraz polityka „brak sponsoringu weterynarzy i brak opinii w MVP”.

## D. Ryzyka
- **CRITICAL:** nazwa/logo/treści/zdjęcia bez tytułu prawnego; import/mailing do dawnych klientów (RODO + PKE); konta FB/IG kontrolowane przez osobę trzecią lub dawny podmiot.
- **HIGH:** reklama zakładów leczniczych; nieoznaczona afiliacja/płatny ranking; kopiowanie opinii Opineo; komunikacja sugerująca powrót sklepu; analityka/piksel bez zgody; treści zdrowotne AI bez recenzji.
