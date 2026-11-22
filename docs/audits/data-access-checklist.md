# ZOO24 — checklista brakujących dostępów do danych (F0, RCV-01 / DATA-01)

Stan: 2026-11-22 · Opracował: `zoo24-analytics` · Wszystkie pozycje: **BRAK**

## Zasady dla każdej pozycji
- Dostęp tylko do odczytu, nadawany przez uprawnionego administratora w panelu danej usługi. **Nigdy** nie podawaj hasła, tokenu, klucza API, cookies ani kodu 2FA w czacie, zgłoszeniu, repo ani logach. Sekrety tylko w zewnętrznym menedżerze sekretów; w repo wyłącznie `.env.example` z pustymi kluczami.
- Eksportujemy tylko agregaty. Zakaz: dane dawnych klientów, adresy, e-maile, telefony, zamówienia, listy mailingowe, treść DM/komentarzy, User-ID, Client-ID, IP, nazwy użytkowników.
- Brak dostępu = `N/A` z `access_status`. Nigdy `0`.
- Brak odpowiedzi właściciela = brak zgody. Podłączenie API (F2/F3) wymaga osobnej zgody, nawet przy dostępie read-only.
- CSV: UTF-8, separator `,`, daty ISO `YYYY-MM-DD`, informacja o strefie (UTC / Europe/Warsaw).

| # | Źródło | Kto nadaje | Minimalny zakres (read-only) | Format eksportu (kolumny) | Uwagi i ryzyka | Status |
|---|---|---|---|---|---|---|
| 1 | Google Search Console zoo24.pl (najlepiej właściwość domenowa) | właściciel weryfikacji domeny | użytkownik z uprawnieniem **ograniczonym** | `gsc_performance_pages.csv`: date, page, clicks, impressions, ctr, position · `gsc_performance_queries.csv`: date, query, clicks, impressions, ctr, position · `gsc_page_query.csv` (top 500): page, query, clicks, impressions, position, period_start, period_end · `gsc_indexing.csv`: page, coverage_state, last_crawl · `gsc_links_top_pages.csv`, `gsc_links_top_domains.csv` · zrzut „Ręczne działania” i „Usunięcia” | GSC przechowuje ok. 16 mies. (do weryfikacji w dokumentacji Google). Oferta sklepu zatrzymana 17.02.2025 wg Ceneo [S2] → okres szczytu prawdopodobnie poza oknem. **Eksport jak najszybciej.** | BRAK |
| 2 | GA4 (+ archiwalne eksporty UA, jeśli istnieją) | administrator usługi GA4 | rola Viewer | `ga4_landing_channel.csv`: date, landing_page, session_default_channel_group, session_source, session_medium, session_campaign, sessions, engaged_sessions, key_events · `ga4_events.csv`: date, event_name, page_path, event_count · `ga4_monthly_channel.csv`: month, channel_group, sessions | UA nie zbiera danych; historia tylko z wcześniejszych eksportów. Thresholding/Consent Mode ukrywa małe liczby. | BRAK |
| 3 | Facebook Page Insights (Meta Business Suite) | administrator strony/portfolio | dostęp do Strony z zakresem Insights (bez publikacji i wiadomości) | `meta_fb_daily.csv`: date, followers_total, reach, views_or_impressions, engagements, link_clicks · `meta_fb_posts.csv`: post_id, published_at, format, reach, engagements, link_clicks (bez treści komentarzy) | Nazwy metryk zmieniają się z wersją API; historia 90/180/365 dni. Brak metryki = `null`. | BRAK |
| 4 | Instagram Professional Insights | administrator konta IG/portfolio | statystyki (bez DM i publikacji) | `meta_ig_daily.csv`: date, followers_total, reach, views_or_impressions, profile_visits, link_in_bio_clicks · `meta_ig_media.csv`: media_id, published_at, media_type, reach, saves, engagements | Potwierdzić typ konta (Professional) i powiązanie z FB Page. Liczba fanów może być sumą kont. | BRAK |
| 5 | Backlinki | właściciel (eksport GSC + opcjonalnie własna licencja narzędzia) | eksport; agent nie kupuje subskrypcji | `backlinks.csv`: target_url, referring_domain, first_seen, last_seen, link_type, anchor_text, source_tool | Bez scrapowania i kupowania linków. | BRAK |
| 6 | Sitemap, backup i logi starego sklepu | właściciel domeny/hostingu | tylko struktura URL, bez bazy klientów | `legacy_urls_inventory.csv`: old_path, page_type, last_http_status, last_modified, in_sitemap · `server_logs_agg.csv`: date, path, status, hits, bot_family | Kopia bazy z danymi klientów **nie może** trafić do repo. Strona główna publicznie zwraca 403. | BRAK |
| 7 | Koszty (hosting, domena, narzędzia, API, scheduler) | właściciel | zestawienie bez danych kart | `costs_monthly.csv`: month, vendor, category, amount_pln_net, vat, billing_cycle, notes | Zakaz włączania billingu bez zgody. | BRAK |
| 8 | Przychody z afiliacji | właściciel kont partnerskich | agregaty z panelu | `affiliate_monthly.csv`: month, program, clicks_reported, approved_commission_pln, pending_commission_pln, reversed_pln | Klik ≠ prowizja. Programy jeszcze nie istnieją. | BRAK |
| 9 | Przychody premium | właściciel / system płatności po wdrożeniu | agregaty | `premium_monthly.csv`: month, active_paying, trials, mrr_net_pln, refunds_pln, churned | Bez potwierdzenia z rozliczeń = `N/A`. | BRAK |
| 10 | Prawa i tożsamość aktywów (GO/NO-GO) | właściciel + `zoo24-compliance` | potwierdzenie kontroli domeny, FB, IG, logo, treści | `asset_rights.csv`: asset, controller, proof_type, verified_at | Bez tego nie używać danych historycznych w komunikacji. | BRAK |

## Kolejność odblokowania
1. Prawa (10) → 2. GSC (1; okno retencji się kurczy) → 3. GA4 → 4. Meta FB/IG → 5. Sitemap/backup → 6. Backlinki → 7–9 przy F2.
