# Growth experiments — F0 (bieżące dane: N/A)

> Opracował agent `zoo24-growth`. 100k+/mies. i kilkanaście tys. fanów to niezweryfikowana historia, nie baseline. Punkt odniesienia: pierwsze 28 dni GSC/GA4/Meta po uzyskaniu dostępu. Zakładamy możliwy przychód 0 zł na starcie. Klik ≠ rezerwacja ≠ sprzedaż.

## Lejki
**L1 — dawne intencje produktowe:** zapytanie produktowe → zachowany/przerobiony poradnik lub porównanie (200 albo zatwierdzony 301) → `affiliate_outbound` (oznaczony) → rozliczona prowizja. Ryzyko: zmiany programów, jakość treści, scaled content. Koszt: redakcja każdego tekstu.
**L2 — SEO lokalne + social → katalog:** landing miasto×usługa (tylko z realną podażą) / post z UTM → profil → `business_site_outbound` / `business_phone_outbound` → claim → premium po walidacji.

## Eksperymenty
| # | Hipoteza | Metryka | Min. próba / czas | Stop / pivot | Zgoda |
|---|---|---|---|---|---|
| E1 | Wartościowe dawne URL po przeróbce na poradnik odzyskują kliknięcia | GSC clicks na dawne URL vs recovery baseline | TOP 10–20 URL wg GSC; 2× 28 dni po indeksacji | brak wzrostu w 2 oknach → 404/410 lub inny temat | mapa redirectów, prawa do tekstów |
| E2 | Poradniki produktowe dają rozliczone prowizje | `affiliate_outbound` + rozliczone prowizje | ≥5 poradników; 90 dni | kliki są, prowizji 0 → wycofać afiliację | program, oznaczenia, compliance |
| E3 | 1 miasto × 1 kategoria z podażą generuje realne wyjścia | qualified outbound / sesja landingu | 30–40 profili, 60 dni po indeksacji | 0 kliknięć → zmiana miasta/kategorii | publikacja landingów, źródła danych |
| E4 | Relaunch FB/IG daje sesje, nie tylko zasięg | `fb_sessions`/`ig_sessions`, `article_to_directory` | 12–18 postów / 6 tyg. | brak sesji UTM po 2 iteracjach → 1 post/tydz. lub pauza | Mode 1, uprawnienia Meta, kalendarz |
| E5 | Firmy zapłacą za jawne wyróżnienie (cena = hipoteza z MASTER_PLAN) | claims → deklaracje → paying providers | 10 rozmów → ≥2 deklaracje → 3 pilotaże | <2/10 → korekta oferty, bez billingu | cennik, regulamin; tylko legalny kanał |

Partner kit pokazuje wyłącznie zmierzone agregaty z ostatnich 28 dni — bez „zasięgu 100k”.

## Eventy F1
`legacy_landing_view`, `article_to_directory_click`, `business_site_outbound`, `business_phone_outbound`, `affiliate_outbound`, `provider_claim_submit` (nazwa do zatwierdzenia), `premium_offer_view`, `premium_interest_submit`. UTM bez PII.

## Priorytet
E1 > E3 > E4 > E5 > E2 (E2 dopiero gdy E1 pokaże ruch).

## Czego nie robić
Kupowanie fanów/ruchu/linków; cold mailing/DM; spam w grupach; ukryta afiliacja; płatna pozycja udająca ranking; promowanie zakładów weterynaryjnych; masowe strony AI miasto×usługa; masowe 301 produktów na homepage; import dawnej listy mailingowej; prognozy z historycznych 100k; raportowanie kliknięć jako rezerwacji.
