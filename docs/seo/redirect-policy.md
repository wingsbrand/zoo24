# ZOO24 — polityka redirectów i indeksacji (reguły dla redirect plannera)

**Wersja:** 1.0 | **Data:** 22.11.2026 | **Właściciel:** `zoo24-seo` | **Implementacja:** `zoo24-builder` (`lib/seo/redirect-plan/`, RCV-03)
**Źródło:** `docs/SEO_SOCIAL_RECOVERY.md` §3.1, §8; `docs/MASTER_PLAN.md` §1, §4; `docs/audits/recovery-audit.md`.
Planner **waliduje i proponuje**; nigdy sam nie wdraża mapy na produkcję. Wynik produkcyjny wymaga osobnej zgody właściciela.

## 1. Model wejścia

Wiersz = rekord z `docs/audits/old-url-inventory.csv`. Pola używane przez reguły:
`old_path, segment, proposed_action, target_path, current_http_status, content_rights_verified, semantic_match_explanation, reviewer, approved_at, status`.

- `segment` ∈ `A/brand | B/editorial | C/product-intent | D/service-adjacent | E/expired`
- `proposed_action` ∈ `keep_200 | edit_200 | redirect_301 | redirect_308 | gone_410 | not_found_404`
- `status` ∈ `draft | needs_review | approved | rejected`
- `content_rights_verified` ∈ `yes | no | unknown`

Normalizacja ścieżek przed porównaniem: lowercase hosta, bez `#`, bez `utm_*|gclid|fbclid`, jedna wersja `https` + host, bez końcowego `/` (poza `/`).

## 2. Redirect 301/308 — dozwolony tylko gdy WSZYSTKIE warunki spełnione

| ID | Warunek | Błąd przy niespełnieniu |
|---|---|---|
| R1 | `status == approved` **i** `approved_at` niepuste **i** `reviewer` niepusty | `NOT_APPROVED` |
| R2 | `target_path` niepusty i różny od `old_path` (po normalizacji) | `MISSING_TARGET` / `SELF_REDIRECT` |
| R3 | target istnieje w rejestrze stron i jego status w momencie walidacji == `200` (nie 3xx/404/410/5xx) | `TARGET_NOT_200` |
| R4 | target nie jest `noindex`, nie jest DEMO, nie jest draftem | `TARGET_NOT_INDEXABLE` |
| R5 | target != `/` dla każdego segmentu poza `A/brand` (np. stara strona główna) | `TARGET_IS_HOME` |
| R6 | dla `segment == C/product-intent`: target **nie** pasuje do `^/$`, `^/poradniki$`, `^/uslugi(/.*)?$`, `^/firma/.*`, ani do listy hubów `HUB_PATHS` (konfigurowalna) | `PRODUCT_TO_HUB` |
| R7 | dla segmentów `B` i `D`: target nie pasuje do `^/uslugi/.*` ani `^/firma/.*` (intencja informacyjna nie trafia na listing) | `INTENT_SHIFT` |
| R8 | `semantic_match_explanation` niepuste, min. 30 znaków | `INTENT_NOT_DOCUMENTED` |
| R9 | target nie jest źródłem innego redirectu (max 1 hop; brak łańcuchów) | `CHAIN` |
| R10 | brak cyklu w grafie redirectów (DFS po całej mapie) | `LOOP` |
| R11 | `segment != E/expired` | `EXPIRED_REDIRECT` |
| R12 | `old_path` występuje w mapie tylko raz | `DUPLICATE_SOURCE` |

`redirect_308` — te same reguły; dodatkowo zalecane tylko, gdy trzeba zachować metodę HTTP (dla starych stron GET używać 301).

Rekord niespełniający R1–R12 → odrzucony z mapy; planner nie zamienia go automatycznie na inny status, tylko zwraca błąd do przeglądu.

## 3. 200 / 404 / 410

| Akcja | Warunki | Błąd |
|---|---|---|
| `keep_200` / `edit_200` | `content_rights_verified == yes`; strona renderuje realną treść; segment ∈ `A,B,D` (lub `C` tylko jako autorski poradnik, bez ceny/koszyka/„Kup”) | `RIGHTS_UNVERIFIED`, `PSEUDO_SHOP` |
| `gone_410` | treść **celowo i trwale** usunięta: segment `E`, wycofany produkt/marka w `C`, treść bez praw, której nie odtworzymy | — |
| `not_found_404` | domyślnie, gdy brak odpowiednika i brak pewności co do trwałości; także URL spoza TOP 500 bez linków zewnętrznych | — |
| fallback | rekord bez decyzji lub z błędem walidacji → serwowane `404` (nigdy 200, nigdy redirect) | — |

Strony 404/410: pomocna treść (wyszukiwarka, linki do poradników), ale **status HTTP musi być 404/410**. Odpowiedź 200 z treścią „nie znaleziono” = błąd `SOFT_404`.

`PSEUDO_SHOP` — blokada, jeśli strona dla starego URL produktowego zawiera: cenę, dostępność, przycisk zakupu/koszyka, schema `Product` z `offers`, lub link afiliacyjny bez oznaczenia.

## 4. Limity masowe i alarmy

Progi domyślne (konfiguracja, do strojenia po realnych danych):

| ID | Reguła | Próg | Skutek |
|---|---|---|---|
| M1 | udział redirectów do jednego targetu w całej mapie | > 5% wszystkich redirectów **i** ≥ 10 źródeł | `WARN_TARGET_CONCENTRATION` — wymaga ręcznego potwierdzenia całej grupy |
| M2 | liczba źródeł `C/product-intent` do jednego targetu | > 20 | `BLOCK_PRODUCT_FANIN` — mapa nie przechodzi walidacji |
| M3 | udział redirectów w całej mapie (redirect / wszystkie rekordy) | > 60% | `WARN_REDIRECT_RATIO` — podejrzenie blanket redirectu |
| M4 | dowolny redirect na `/` z segmentu ≠ A | ≥ 1 | `BLOCK` (patrz R5) |
| M5 | rozmiar jednej partii zatwierdzenia | > 50 wierszy | `WARN_BATCH_SIZE` — podzielić partię |
| M6 | zmiana mapy względem poprzedniej zatwierdzonej wersji | > 100 wierszy lub > 20% | wymaga nowego zatwierdzenia właściciela całej wersji |

Każde uruchomienie plannera zapisuje raport: liczba rekordów per akcja, per segment, lista błędów/ostrzeżeń, hash wersji mapy. Raport nie zawiera danych osobowych.

## 5. Canonical, sitemap, noindex

**Canonical**
- C1: każda indeksowalna strona 200 ma canonical absolutny `https://` do siebie lub do zatwierdzonego preferowanego URL.
- C2: canonical nigdy nie wskazuje na URL 3xx/404/410/noindex.
- C3: parametry (`?q=`, filtry, sortowanie, paginacja bez wartości) → canonical do wersji bazowej lub `noindex`.

**Sitemap**
- S1: tylko strony `200`, indeksowalne, `published`, z canonical do siebie.
- S2: wyklucza: DEMO, draft/needs_review, `noindex`, redirecty, 404/410, puste kombinacje miasto×usługa, wyniki wyszukiwania, panel admina.
- S3: `lastmod` = data realnej zmiany treści, nie data generacji.

**noindex / DEMO / staging**
- N1: każdy rekord z flagą `is_demo` → `noindex,nofollow` (meta + `X-Robots-Tag`), widoczna etykieta „DEMO”, wykluczony z sitemap i linkowania z indeksowalnych stron.
- N2: środowisko ≠ `production` → globalnie `X-Robots-Tag: noindex, nofollow` + `robots.txt` `Disallow: /` + ochrona dostępu; sitemap nie jest serwowana.
- N3: production → `robots.txt` nie blokuje stron publicznych; zmienna środowiska (np. `SITE_ENV`) sterująca N2 ma bezpieczny default = `noindex`.
- N4: listing miasto×usługa poniżej progu podaży realnych firm (`MIN_LISTINGS`, konfigurowalny) → `noindex`, poza sitemap.

## 6. Wymagane testy (minimum, fixtures oznaczone DEMO)

1. Redirect bez `approved` → odrzucony (`NOT_APPROVED`).
2. Target 404/410/3xx → `TARGET_NOT_200`; łańcuch A→B→C → `CHAIN`; A→B→A → `LOOP`.
3. Karta `C` → `/`, `/poradniki`, `/uslugi/groomer/warszawa` → `PRODUCT_TO_HUB`.
4. 25 kart `C` → ten sam poradnik → `BLOCK_PRODUCT_FANIN`.
5. Rekord bez decyzji → 404 (nie 200, nie redirect).
6. `gone_410` zwraca 410; strona błędu nie zwraca 200.
7. Sitemap nie zawiera DEMO/draft/noindex/redirectów; staging zwraca `noindex`.
8. Brak `semantic_match_explanation` → `INTENT_NOT_DOCUMENTED`.
