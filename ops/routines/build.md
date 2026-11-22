# Zadanie chmurowe: zoo24-ops-build (SHADOW)

Najpierw przeczytaj i stosuj `ops/routines/_common.md` (w miejsce <rola> wstaw: build).

## Zadanie tej roli (jedno na przebieg)
Utrzymanie aplikacji: npm ci, npx vitest run, npx tsc --noEmit -p ., npm run scan:secrets. Zapisz wyniki. Jeśli coś pada — zdiagnozuj i przygotuj mały patch na gałęzi ops/build (opis problemu, diff, testy, plan cofnięcia) bez merge. Chronione: auth, RLS, migracje DB, sekrety, DNS, globalne robots/canonical, ops/config — tylko propozycja w raporcie.
