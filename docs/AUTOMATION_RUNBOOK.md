# ZOO24 — runbook automatyzacji SEO + Social Media

**Wersja:** 1.2 | **Status:** wymagania do implementacji, nie aktywna usługa | **Strefa czasu:** `Europe/Warsaw`.

## Cel i podział obowiązków

Właściciel nie może codziennie pilnować SEO i social. **Claude Code** buduje i testuje moduły oraz odpowiada za ich rozwój, ale po zamknięciu sesji **nie wykonuje zadań w tle**. System cykliczny wymaga osobnego uruchomienia: chroniony backend, scheduler/queue lub zatwierdzone narzędzie do publikacji w Meta. Bez autoryzacji i infrastruktury działa tylko demonstracja.

| Rola | Praca operacyjna | Ograniczenie |
|---|---|---|
| `zoo24-seo` | analiza GSC, URL, canonical, indeksacji, content backlog, linkowanie, raport i alerty | rekomenduje redirecty, nie zmienia 301 na produkcji bez zgody |
| `zoo24-social` | posty FB/IG, plan 14-dniowy, dobór sprawdzonych źródeł, UTM, komentarze do triage, tygodniowy learning loop | drafty bez praw i akceptacji nie trafiają do API |
| `zoo24-analytics` | aktualny 28-dniowy baseline, oddzielne odczyty GSC/GA4/Meta, atrybucja | `N/A`, gdy brak danych; nigdy prognozy z dawnych 100k |
| Scheduler/backend | pobiera agregaty po prawidłowym OAuth, publikuje APPROVED, tworzy logi i alerty | NIE działa w F1 na realnych kontach |
| Redaktor/moderator | weryfikuje fakty, prawa, wątpliwe komentarze, kryzysy | preferowana usługa zewnętrzna po relaunchu |
| Właściciel | 1 raport tygodniowo, 1 zatwierdzenie kalendarza /14 dni, wyjątki i budżet | pierwsze tygodnie wymagają więcej czasu |

## 1. Wymagane legalne integracje

- GSC: dedykowana właściwość domenowa/URL prefix z dostępem wyłącznie do odczytu. GA4: raporty agregowane, bez dawnych klientów. Nie obiecuj dawnych danych, jeśli retencja je wyklucza.
- Facebook: istniejący **Page**, prawidłowe uprawnienia aplikacji i osoby zarządzającej. Instagram: konto profesjonalne, zgodne z aktualnie wybranym wariantem Meta API: Instagram Login albo Facebook Login (w drugim wariancie wymagane powiązanie z FB Page). Metryki i formaty postów zależą od API/uprawnień; sprawdź na etapie wdrożenia.
- Nie stosuj logowania przez boty, nie zgrywaj cookies, nie omijaj uprawnień API i nie wysyłaj tokenów do Claude ani Git. Sekrety trzymane serwerowo; rotacja i revocation plan.
- Jeśli integracji brak: bezpieczny workflow `export CSV -> human schedules in Meta Business Suite -> manual publication proof`; nie deklarować "auto published".

## 2. Harmonogram zadań i reakcje

| Interwał | Job ID | Co robi | Usterka i eskalacja |
|---|---|---|---|
| Codziennie 07:00 | `seo_health_daily` | statusy najważniejszych URL, 404/5xx, canonical, robots/sitemap, alarmy; bez automatycznych produkcyjnych 301 | dwa kolejne krytyczne błędy -> alert do operatora |
| Codziennie 08:00 | `social_queue_daily` | plan do 7 dni, prawa do assetów, status OAuth, brakujące akceptacje | brak praw/statusu = hold; nie publikować awaryjnie |
| W zaplanowanej godzinie | `social_publish_approved` | zablokuj rekord, sprawdź approved/license/valid_token/kill_switch, opublikuj przez oficjalne API, zapisz external ID | idempotent retry z backoff; bez lawiny zaległych wpisów |
| Poniedziałek 08:00 | `weekly_kpi_report` | agregaty GSC/GA4/Meta: 28 dni i tydzień, top URL/treści, social -> katalog -> outbound, koszty, N/A przy braku danych | nie alarmuj o "0" bez źródła |
| Co 14 dni | `content_calendar_batch` | 14-dniowy kalendarz 2–3 posty/tydzień/kanał, wersje FB i IG, link do źródła, UTM, podpisy i materiały | czeka na review i akceptację batch; brak odpowiedzi = nie publikuj |
| Co 2 tygodnie | `seo_content_batch` | 2–4 priorytety SEO na podstawie realnego ruchu, weryfikacja dawnych i nowych tematów, źródła i prawa | brak danych = 3 hipotezy testowalne, nie fakty |
| Miesięcznie | `quality_and_cost_review` | ocena jakości CTR/engagement, kosztów, nieaktualnych firm, użycia API i ROI afiliacji/premium | powyżej limitu budżetu -> stop nowych płatnych akcji |

Zadania `07:00`/`08:00` to **proponowany** harmonogram, nie istniejące automatyzacje. Działanie wymaga wdrożenia, testów oraz decyzji o kosztach i operatorze. Wszystkie daty w bazie zapisuj w UTC, wyświetlaj `Europe/Warsaw` z poprawną obsługą DST.

## 3. State machine, approval i bezpieczeństwo

- Content pipeline: `idea -> draft -> fact_check -> rights_check -> needs_review -> approved -> scheduled -> published/failed`. Stany `draft`, `needs_review` i brak `rights_check` zawsze blokują produkcyjne wysłanie. Odmowa powoduje `rejected` z audytem.
- Batch 14 dni zatwierdza **zamrożone wersje** postów (copy, grafika, link, CTA, disclosure, platforma, czas) i podpis osoby uprawnionej; edycja po zatwierdzeniu cofa wpis do `needs_review`.
- Tryb `Mode 0`: offline, mock API, brak zewnętrznych działań. `Mode 1`: oficjalne API + scheduler dla pozycji zatwierdzonych. `Mode 2`: ograniczony autopilot evergreen dopiero po odrębnej pisemnej zgodzie i udokumentowanym review procedur; nie dla kwestii medycznych, firm sponsorowanych, zdjęć odbiorców i kryzysów.
- Każde wywołanie publikacji musi mieć `idempotency_key`, lock/lease na rekordzie, minimalne uprawnienia, ograniczenia retry i obsługę wygaśnięcia tokenów. Zachowuj `external_post_id` dopiero po potwierdzeniu z API; kontroluj duplikaty po timeout.
- `Kill switch` admin-only działa natychmiast i blokuje nowe publish/retry; opcja anulowania kolejki przyszłych zaplanowanych wpisów. Zakaz hurtowej publikacji zaległych postów po wznowieniu.
- Moderacja nie odpowiada automatycznie na DM, komentarze o zdrowiu, skargi, roszczenia o stare zakupy, dane osobowe i wątki kryzysowe. Powiadom człowieka, pilne sprawy szybciej niż zwykły tydzień raportowy.

## 4. Ruch, atrybucja i zysk

- Właściciel deklaruje **historycznie 100k+ wejść organicznych/miesiąc** i kilkanaście tys. obserwujących Meta; zapisuj jako `historical_owner_claim`, odrębnie od `current_baseline_28d` i `recovered_traffic`.
- Osobno mierz: `gsc_clicks`, `ga4_organic_sessions`, `legacy_url_landing_sessions`, `new_content_landing_sessions`, `facebook_reach`, `facebook_link_clicks`, `facebook_sessions`, `instagram_reach`, `instagram_link_clicks`, `instagram_sessions`, `article_to_directory`, `business_outbound`, `affiliate_outbound`, `provider_claim`, `paid_profiles`, `MRR`, `costs`, `owner_minutes`.
- UTM `utm_source=facebook` / `utm_source=instagram`, `utm_medium=organic_social`; `utm_campaign=zoo24_relaunch_2026` dla premiery; nie zapisuj adresów e-mail ani nazw użytkowników w UTM. IG ma inne mechanizmy linkowania niż FB; uwzględnij link w bio i ograniczenia formatu.
- Raport ma zawierać źródło i datę dla każdego KPI oraz `N/A` dla braków. Brak aktywnego połączenia nie może generować `0`, `+100%` ani wyliczonego "zasięgu" z follower count.
- Warianty monetyzacji: wartościowe artykuły zakupowe z transparentną afiliacją; lokalny katalog z jawnymi wizytówkami premium; sponsorowane posty tylko oznaczone i zgodne z prawem. Nie opieraj ofert reklamowych na historycznym traffic-u.

## 5. DoD — testy obowiązkowe

1. GSC i Meta mock fixtures; brak danych -> `N/A`, a nie zero; obecne 28 dni i historyczne benchmarki nie są mieszane.
2. SEO: relewantne 301/308 z ręczną akceptacją; brak redirect-to-home dla niepowiązanych produktów, brak redirect loops, sitemap bez demo, realne 404/410, canonical wskazuje 200.
3. Social: żaden post `draft`/`needs_review`/bez praw nie wysyła się do API. Zmieniony po akceptacji wraca do kolejki. Dwa jednoczesne uruchomienia joba => jeden post.
4. Security: niepoprawne/wygasłe tokeny nie trafią do logu, brak uprawnień => bezpieczny stop, kill switch => 0 kolejnych publikacji. Nie automatyzuj logowania do FB/IG.
5. 14-dniowy kalendarz zawiera FB/IG copy, src, alt, prawa do assetów, disclosure, URL+UTM i status. Raport tygodniowy ma źródła, daty i realne dowody.
6. QA dokumentuje komendy testów, status `PASS/FAIL/N/A` i brak integracji produkcyjnych, jeśli nie skonfigurowano ich z uprawnieniami.

## 6. Rekomendowany przegląd 15-min (przygotowany automatycznie)

```text
[ZOO24] TYDZIEŃ YYYY-WW
SEO: organic sessions = ..., GSC clicks = ...; legacy = ...; top 3 naprawy = ...
FB: reach = ..., traffic = ... | IG: reach = ..., traffic = ...
Social: zatwierdzonych/planowanych = .../...; najbliższy batch = ...
Katalog: outbound = ... | Afiliacja = ... | Premium MRR = ...
Koszty = ... | Czas właściciela = ... | Ryzyka pilne = ...
AKCEPTACJE (maks. 3): 1) ... 2) ... 3) ...
```

Rzeczywisty raport ma również pola źródła danych; `N/A` przy brakach. Redaktor/moderator odpowiada za kontrolę jakości, nie właściciel w każdej sprawie.
