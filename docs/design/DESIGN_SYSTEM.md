# ZOO24 — system projektowy (v1, 2026-11-22)

**Charakter:** przyjazny, wiarygodny, uporządkowany. Jak dobrze prowadzona przychodnia sąsiedzka, nie jak marketplace z banerami. Ciepłe, jasne tło; głęboki petrol jako kolor marki; jeden koralowy akcent dla najważniejszego działania na ekranie.

## 1. Decyzje i uzasadnienie
| Decyzja | Dlaczego |
|---|---|
| Petrol `#0e4f5c` jako kolor marki (wcześniej granat logo) | brief: głęboka zieleń/petrol; spokój i zaufanie, dobrze kontrastuje z koralem; koło logo przekolorowane z `#1e3a5f` → petrol, kształt i koral bez zmian (ADR-010) |
| Koral `#b8461f` tylko dla 1 głównego CTA na ekranie | ciepły, „opiekuńczy” akcent z logo; przyciemniony vs logo (`#ef6c4a`): biały tekst 5,34:1 (`#d4552d` miał tylko 4,09:1 — poprawione po QA) |
| Tło `#faf7f2` (ciepła kość słoniowa), karty białe | lżejsze od szarości, „domowe”; karty odcinają się bez ciężkich cieni |
| Bricolage Grotesque (nagłówki) + Inter (tekst), `latin-ext` | charakterystyczne, przyjazne nagłówki; Inter — wysoka czytelność, pełne polskie znaki; self-hosting przez `next/font` (bez zapytań do Google, brak CLS dzięki `display: swap` + metrykom) |
| Motyw: łapa z poduszką-sercem; wzór drobnych łapek `.paw-pattern` tylko w hero | rozpoznawalny, oszczędny; nie konkuruje z treścią |
| Ikony: `lucide-react` | spójna, liniowa, czytelna; tree-shaking |
| Bez zdjęć stockowych w F1 | prawa i pochodzenie muszą być w rejestrze; w miejscu zdjęć: ilustracyjne kafle z ikoną i nazwą kategorii; zdjęcia firm wyłącznie od firm (backlog) |

## 2. Tokeny (`app/globals.css`, blok `@theme`)
- **Kolory:** `brand` / `brand-dark` / `brand-soft` / `brand-tint`; `accent` / `accent-dark` / `accent-soft`; `canvas`, `surface`, `ink`, `ink-muted`, `line`, `line-strong`; statusy `ok`, `warn`, `danger`, `info`, `demo` (+ `-soft`). Klasy Tailwind: `bg-brand`, `text-ink-muted`, `border-line`…
- **Typografia:** `font-sans` (Inter), nagłówki `h1–h3` automatycznie `--font-display`. Skala: h1 `text-3xl sm:text-4xl`, h2 `text-2xl sm:text-3xl`, lead `text-lg text-ink-muted`, tekst 16–17 px, interlinia 1,6 (artykuł 1,75, kolumna `--container-prose` ≈ 68 znaków).
- **Zaokrąglenia:** `--radius-sm` 8, `-md` 12 (przyciski, pola), `-lg` 18 (karty), `-xl` 28 (hero).
- **Cienie:** `--shadow-card`, `--shadow-raised`. **Ruch:** `--ease-out`, ≤ 200 ms; `prefers-reduced-motion` wyłącza animacje.
- **Szerokości:** `--container-page` 72 rem, `--container-prose` 42 rem. Marginesy boczne 16 px (mobile) / 24 px.

## 3. Komponenty (`components/ui`, import `@/components/ui`)
| Komponent | Użycie / zasady |
|---|---|
| `Button`, `ButtonLink`, `buttonClasses()` | warianty `primary` (petrol), `accent` (koral — max 1 na ekran), `secondary`, `ghost`, `danger`, `link`; rozmiary `md`/`lg` ≥ 44 px, `sm` tylko w panelu |
| `Badge` + `DemoBadge`, `DataCheckedBadge`, `SponsoredBadge`, `PendingBadge` | zawsze tekst + ikona; „Dane sprawdzone” ≠ ocena jakości usług; reklama zawsze „Reklama · wyróżnienie płatne” |
| `Container`, `Section`, `SectionHeading`, `PageHeader`, `Breadcrumbs`, `Card` | układ stron; jeden `h1` na stronę (w `PageHeader` lub hero) |
| `Alert` (`info`/`ok`/`warn`/`danger`/`unavailable`), `EmptyState`, `Skeleton`, `LoadingRegion` | `unavailable` = integracja niepodłączona; pusty stan zawsze mówi „co dalej” |
| `Field`, `Input`, `Textarea`, `Select`, `Checkbox`, `ErrorSummary`, `Honeypot`, `describedBy()` | etykieta zawsze widoczna; błąd pod polem + podsumowanie na górze; `aria-invalid`, `aria-describedby`; opcjonalne pola oznaczone „(opcjonalnie)” |
| `components/site/*` | `SiteHeader` (sticky, menu mobilne z Esc i `aria-expanded`), `SiteFooter`, `Logo` |
| `TrackLink` | link z agregowanym pomiarem (`/api/event`), bez cookies |

## 4. Wzorce
- **Treść i ton:** proste polskie zdania, druga osoba („Znajdź”, „Sprawdź”). Uczciwie o ograniczeniach: „Telefon: brak potwierdzonych danych”, „Integracja niepodłączona”.
- **Stany:** każdy widok z danymi ma stan pusty, błąd i (jeśli asynchroniczny) ładowanie ze szkieletem o stałej wysokości.
- **Liczby w panelu:** wartość + okres + źródło + aktualność; „0” tylko gdy źródło podłączone, inaczej „N/A — powód”.
- **Dostępność:** kontrast ≥ 4,5:1 (tekst) / 3:1 (elementy UI), widoczny fokus (koral 3 px), skip-link, cele ≥ 44 px, informacja nie tylko kolorem, reflow do 320 px.
- **Wydajność:** strony publiczne renderowane na serwerze, minimum JS (klientowe tylko: menu, geolokalizacja, formularze z `useActionState`), fonty self-hosted, brak obrazów rastrowych w F1, stałe wymiary elementów.
