## ZOO24 — etap operacyjny (sekcja do scalenia, nie zamiennik CLAUDE.md)

Czytaj `zoo24-ops/ops/OPERATIONS.md` i specyfikacje w `zoo24-ops/ops/spec/` przed pracą operacyjną. Nowe role `zoo24-ops-*` obsługują istniejący serwis: build, content, growth, knowledge, social, SEO. Zachowaj dotychczasowych agentów i ograniczenia praw/sekretów/danych.

Po udokumentowanej aktywacji polityki dopuszczone rutynowe działania mają działać samodzielnie. Dotychczasowe „każda operacja wymaga nowego pytania właściciela” zastąp tylko w zakresie faktycznej zgody. Pozostałe ograniczenia pozostają; plik tekstowy nie przyznaje uprawnień kont i nie pozwala obejść blokad narzędzia.

Rozróżniaj tworzenie szkicu, review redaktora, zlecenie działania i potwierdzony wynik. Nowe treści merytoryczne muszą mieć właściwe źródła i kontrolę człowieka; publikacja zatwierdzonej wersji jest automatyczna. Nie udawaj, że AI reviewer jest człowiekiem. Właściciel nie musi pełnić roli redaktora.

Aktywna polityka, budżet i sekrety są chronione poza zapisem autonomicznych ról. Narzędzia wykonujące akcje sprawdzają zasób, wersję, zgodę, źródła i limity po stronie serwera. Po timeout przed retry ustal skutek. Przy pauzie sprawdź także posty zaplanowane u dostawcy.

Używaj rzeczywistego runtime; cloud scheduled tasks mogą działać bez laptopa po konfiguracji i przetestowaniu, Desktop i /loop mają ograniczenia. Tylko jeden dispatcher zadania. Utrzymuj trwały stan oraz raport `ops/runtime/INSTALL_STATUS.md`. W historycznych danych 100k+/mies. nie widź aktualnej analityki.
