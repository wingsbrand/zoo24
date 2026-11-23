# ZOO24 — runbook startu na zoo24.pl (plan na 2026-11-23)

Decyzja właściciela (2026-11-22): „jutro chcę opublikować już finalną wersję live na domenie zoo24.pl, podpiąć GSC i Ahrefs i rozpocząć pracę nad skalowaniem i optymalizacją serwisu”.
Kontrola gotowości: `npm run preflight:live` (lokalnie) i `node scripts/preflight-live.mjs --url https://zoo24.pl` (po przełączeniu).

## Stan na 2026-11-22 wieczór
| Element | Stan |
|---|---|
| Aplikacja | Vercel `zoo24` (zespół WINGS), region fra1, auto-deploy z `main` |
| Domena w Vercel | `zoo24.pl` (produkcja) i `www.zoo24.pl` → 308 na `zoo24.pl` — **dodane, czekają na DNS** |
| DNS dziś | NS `ns1/ns2.aftermarket.pl`; A `185.253.212.22` (parking); MX `mx.aftermarket.pl`; TXT SPF `v=spf1 ip4:185.237.29.0/27 -all` |
| Tryb produkcyjny | gotowy w kodzie: bez DEMO, noindex na aliasach (*.vercel.app), robots/sitemap tylko dla zoo24.pl |
| Weryfikacja GSC/Ahrefs | meta tagi przez `ZOO24_GSC_VERIFICATION` / `ZOO24_AHREFS_VERIFICATION` (opcjonalnie; zalecany rekord DNS TXT) |

## A. Przed przełączeniem — właściciel (ok. 15 min)
1. **Klucz Supabase** (bez tego zgłoszenia i decyzje giną przy restarcie):
   Supabase → projekt **ZOO24** → Project Settings → API Keys → *Create new secret key* → skopiuj.
   Vercel → zoo24 → Settings → Environment Variables → `ZOO24_SUPABASE_SECRET_KEY`, typ **Sensitive**, środowisko **Production**. Klucza nie wklejać w czat.
2. **Dane operatora** do regulaminu i polityki (podaj w czacie): pełna nazwa spółki z formą prawną, adres siedziby, KRS (jeśli jest), e-mail kontaktowy usługodawcy, data wejścia w życie dokumentów. NIP mamy.
3. **Skrzynka kontaktowa** (np. `kontakt@zoo24.pl`) — poczta zostaje w aftermarket (MX bez zmian).

## B. Przełączenie aplikacji — orkiestrator (po „GO” właściciela)
4. Vercel env (Production): `ZOO24_ENV=production`, `ZOO24_SITE_URL=https://zoo24.pl`; redeploy.
5. Sprawdzenie na `https://zoo24.vercel.app`: brak DEMO, `X-Robots-Tag: noindex` (alias), dane Supabase zapisują się.

## C. DNS — właściciel w panelu aftermarket.pl (orkiestrator nie ma dostępu)
Zmieniać **tylko** poniższe rekordy. **MX i TXT (SPF) zostawić bez zmian** — inaczej przestanie działać poczta.
| Host | Typ | Usuń | Dodaj |
|---|---|---|---|
| `@` (zoo24.pl) | A | `185.253.212.22` | `216.198.79.1` **oraz** `64.29.17.1` (alternatywa: jeden rekord `76.76.21.21`) |
| `www` | A → CNAME | A `185.253.212.22` | CNAME `cd04d9a33aa4e0ad.vercel-dns-017.com.` |
| `@` | TXT | — | `google-site-verification=…` (z GSC, krok 7) — dodatkowy rekord TXT obok SPF |
Propagacja: zwykle minuty–kilka godzin. Vercel sam wystawi certyfikat HTTPS.

## D. Google Search Console i Ahrefs — właściciel + orkiestrator
6. Po propagacji: orkiestrator sprawdza `https://zoo24.pl` (smoke test, preflight `--url`), `www` → 308, HTTPS.
7. **GSC**: search.google.com/search-console → *Dodaj usługę* → **Domena** `zoo24.pl` → skopiuj rekord TXT → dodaj w aftermarket (tabela C) → *Zweryfikuj*.
   Alternatywa (prefiks URL): metoda „tag HTML” → wartość `content` przekazać orkiestratorowi → `ZOO24_GSC_VERIFICATION` w Vercel.
   Następnie: *Mapy witryn* → `https://zoo24.pl/sitemap.xml`.
8. **Windsor.ai**: podłączyć konektor Google Search Console dla `zoo24.pl` (agregaty do raportów; bez danych osobowych).
9. **Ahrefs Webmaster Tools** (bezpłatnie): ahrefs.com/webmaster-tools → *Add project* → **Import z Google Search Console** (najszybciej, po kroku 7) albo meta tag (`ZOO24_AHREFS_VERIFICATION`) / DNS TXT. Potem Site Audit i raport linków przychodzących.

## E. Po starcie — orkiestrator (dzień 1–7)
- Monitoring: Vercel runtime errors, 404 na dawnych URL (GSC → Strony), indeksacja (Inspekcja URL dla `/`, `/uslugi/*`, `/blog/*`).
- Ahrefs: linki przychodzące do dawnych URL sklepu → propozycje 301 tylko do równoważnych treści (polityka R1–R12, akceptacja właściciela).
- Pierwszy raport tygodniowy: GSC (kliknięcia/wyświetlenia), kliknięcia do firm, zgłoszenia.

## Wycofanie (rollback)
- Szybko: w aftermarket przywrócić A `185.253.212.22` dla `@` i `www` (MX/TXT nietknięte).
- Aplikacja: Vercel env `ZOO24_ENV=staging` + redeploy (noindex wszędzie) albo *Instant Rollback* do poprzedniego wdrożenia.

## Czego start NIE obejmuje (osobne zgody)
Publikacja postów FB/IG (Mode 1, Meta), płatne narzędzia i reklamy, mapa 301 dawnych URL (każda para do akceptacji), konto Instagram w Windsor.ai.

## Panel redakcji po starcie
`/admin` w produkcji zwraca 404 (brak logowania — ADR-003). Moderacja: lokalnie `npm run dev` z `ZOO24_ENV=local` oraz `ZOO24_SUPABASE_URL` + `ZOO24_SUPABASE_SECRET_KEY` w `.env.local` (plik poza Git) — panel pracuje na produkcyjnej bazie. Reset danych na bazie Supabase jest zablokowany w kodzie.
