# ZOO24 — specyfikacja dashboardu 28-dniowego (1 ekran)

Wersja F0 · Opracował `zoo24-analytics` · Źródła: MASTER_PLAN §12, SEO_SOCIAL_RECOVERY §2.2, §5, §6.3, AUTOMATION_RUNBOOK §4.
F1 = fixtures/brak danych (N/A); live dopiero po zgodzie właściciela. Implementacja: `lib/analytics/kpi.ts`, `app/admin/page.tsx`.

## 1. Reguły nadrzędne
1. Każda wartość to obiekt `{ key, value, unit, periodStart, periodEnd, dataSource, accessStatus, lastVerifiedAt, historicalOrCurrent, notes }` (zgodny z `docs/analytics-baseline.template.csv`).
2. `accessStatus` ∈ `connected | export_manual | no_access | not_implemented | api_metric_unavailable | demo`.
3. **Brak źródła = "N/A" + powód.** Nigdy `0`, `+100%` ani szacunek. `0` tylko przy `connected`/`export_manual` i pełnym okresie.
4. **`historical_owner_claim` to osobne pole** poza siatką KPI („100k+ wejść organicznych/mies., kilkanaście tys. obserwujących FB/IG — deklaracja właściciela, niezweryfikowana”). Nie uczestniczy w obliczeniach, deltach ani statusach.
5. **Porównania tylko current vs current**: 28 pełnych dni vs poprzednie 28, to samo źródło i definicja. Zakaz porównań GSC clicks ↔ GA4 sessions i bieżących ↔ claim. Pierwszy okres = baseline bez delty.
6. Okres: 28 pełnych dni kończących się na D-3 (opóźnienie GSC). UTC w bazie, wyświetlanie Europe/Warsaw.
7. Status kafla: `OK | Do akceptacji | Problem | N/A`. Brak tez o „karze Google” bez dowodu z GSC.

## 2. KPI
**Organic:** `gsc_clicks`, `gsc_impressions`, `ga4_organic_sessions`, `legacy_url_landing_sessions` (start na URL z decyzją 200 lub na celu zatwierdzonego 301), `new_content_landing_sessions`. Nie sumować z `gsc_clicks`.
**Odzyskiwane URL:** `legacy_top5[i]` (path, gsc_clicks, delta 28d, decision, http_status), `redirects_pending_approval`.
**Social (FB/IG osobno):** `*_followers_total` (nie = aktywni odbiorcy), `*_reach`, `*_views`, `*_engagements`, `*_link_clicks`, `*_sessions` (GA4 z UTM), `social_published_vs_approved`. Nie wyliczać zasięgu z liczby fanów.
**Katalog:** `business_site_outbound`, `business_phone_outbound`, `business_outbound` (= suma; nie rezerwacja), `article_to_directory`, `affiliate_outbound` (nie prowizje), `provider_claims`.
**Przychody:** `affiliate_revenue_approved`, `affiliate_revenue_pending`, `premium_paid_profiles`, `premium_mrr_net`.
**Koszty i czas:** `costs_month`, `owner_minutes` (wpis ręczny), `incidents_rights`, `incidents_technical`.

## 3. UTM
- FB: `utm_source=facebook&utm_medium=organic_social&utm_campaign=zoo24_relaunch_2026&utm_content=<post_id>`
- IG: `utm_source=instagram&...&utm_content=<post_id|bio>`
- Tylko `[a-z0-9_-]`; walidator odrzuca e-mail, telefon, `@`. Brak UTM na linkach wewnętrznych.

## 4. Ograniczenia atrybucji (stopka)
In-app browsery gubią referrer; Consent Mode i thresholding; Meta link_clicks ≠ sesje GA4; GSC clicks ≠ GA4 sessions; Discover/News osobno; outbound ≠ rezerwacja; model atrybucji GA4 może zmieniać przypisanie wstecz.

## 5. Testy jakości danych (DoD)
1. `no_access` → „N/A + powód”, nigdy 0. 2. Claim poza deltami. 3. Delta tylko przy tym samym źródle i pełnych okresach. 4. Walidator UTM odrzuca PII. 5. `business_outbound = site + phone`. 6. DEMO nie trafia do raportu live. 7. Każdy kafel ma `lastVerifiedAt`; starsze niż 7 dni = `stale`.

## 6. Układ
Wiersz 0: pasek claim (szary) + status połączeń. Wiersz 1: Organic. Wiersz 2: top 5 URL + redirecty do akceptacji | Social FB/IG. Wiersz 3: Katalog. Wiersz 4: Pieniądze i czas. Stopka: ograniczenia atrybucji, maks. 3 decyzje.

## 7. Alerty (planowane, wymagają schedulera — dziś nie działają)
Spadek >30% 7d vs 7d przy podłączonym źródle → checklista: HTTP/5xx, robots/sitemap, canonical/noindex, ostatnie wdrożenia, tag GA4, opóźnienie GSC, sezonowość, Ręczne działania. Bez dowodu: „przyczyna nieustalona”.

## Ryzyka pomiarowe
1. Retencja GSC (~16 mies.) i brak UA → szczyt 100k+ może pozostać na stałe niezweryfikowany; eksportować GSC jak najszybciej.
2. Zaniżona atrybucja social (in-app browsery, zgody) → pokazywać obie miary obok siebie.
3. Fałszywe zera i mieszanie baseline'ów → twarde testy N/A i delty current vs current.
