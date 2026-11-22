# Weryfikacja dostarczonego pakietu

Data: 22.11.2026. Zakres: pliki instrukcji i konfiguracji, bez wykonania na aplikacji.

- PASS — sześć unikalnych definicji agentów i poprawny YAML frontmatter.
- PASS — składnia przykładowych JSON i zgodność sześciu nazw ról z promptami.
- PASS — wszystkie harmonogramy i zgody produkcyjne domyślnie nieaktywne.
- PASS — brak wpisanych haseł, tokenów i identyfikatorów prywatnych kont; pola niewiadome null/N/A.
- PASS — odsyłacze do sześciu promptów istnieją, bloki Markdown zamknięte.
- PASS — spójność planu oceniona niezależnie w trzech zakresach: runtime/uprawnienia, treści/knowledge/social, SEO/growth; istotne uwagi uwzględnione.
- N/A — nie wykonano wdrożenia serwisu, podłączenia kont, rzeczywistej publikacji, testu API ani pomiaru kosztów w środowisku użytkownika.
- N/A — scenariusze ACCEPTANCE.md są zadaniami dla Claude w istniejącym repo, nie już zaliczonymi testami produktu.

Pakiet ma być instalowany addytywnie. Definicje narzędzi oraz harmonogramy wymagają dostosowania do faktycznego runtime i uprawnień przed live.
