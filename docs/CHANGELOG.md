# Changelog implementacji

## v1.3 — 26 września 2026

Wzbogacono 9 stacji o nowe perspektywy badawcze i operacyjne na podstawie materiałów Salima Ismaila, pracy Haranga Ju oraz eseju i wystąpienia Ishaana Sehgala (Omnara):
- Dodano 5 rekordów źródeł (`content/sources/S41.json` do `S45.json`): wystąpienie wideo o mierzeniu strategii AI (S41), manuskrypt „The Organizational Singularity” v25 (S42), wideo o tanich mikrodecyzjach (S43), preprint akademicki Haranga Ju o monotoniczności zadań (S44) oraz esej techniczny Ishaana Sehgala / Omnara „The Log Is the Agent” (S45).
- Dodano 10 ograniczonych perspektyw dowodowych (`content/evidence/`): `ismail-contextual-conditionals`, `ismail-narrative-inversion`, `ismail-validator-loop`, `ismail-data-plane-inversion`, `ismail-decision-traces`, `ismail-graduated-authority`, `ismail-congestion-coordination`, `ju-monotonicity-coordination`, `ismail-pilot-disconfirmation`, `sehgal-log-portability`.
- Wzbogacono stacje:
  - **AI-04**: dodano przestrzeń warunków kontekstowych („intelligence as an if-statement”) między sztywnymi regułami a autonomicznymi agentami.
  - **AI-05**: wprowadzono powiązanie metryk wejściowych z kulturą decyzyjną opartą na narracjach (zamiast dowodach), brak roli broniącej kontr-przypadku oraz eliminację rankingów zużycia tokenów.
  - **AI-13**: wprowadzono przejście od rutynowej bramki do walidacji wyjątków oraz ostrzeżenie przed zniszczeniem ścieżki terminowania (junior loop).
  - **AI-14**: sformułowano napięcie architektoniczne między doraźnymi ekstraktami danych na potrzeby use case'u a inwersją warstwy danych i przenośnością semantyki.
  - **AI-17**: dodano rejestrację śladów decyzyjnych (decision traces) jako precedensu, bariery zaufania przy ujawnianiu wiedzy milczącej oraz przytoczono kontrargument przypisywany Alloy Partners o ryzyku utraty niewidocznej pracy integracyjnej przy agresywnym delayeringu (lekcja z reengineeringu lat 90.).
  - **AI-24**: wprowadzono stopniowaną autoryzację (graduated authority) zdobywaną telemetrycznie oraz klin powierniczy (fiduciary wedge) zastrzegający nieodwracalne decyzje dla ludzi.
  - **AI-28**: wyjaśniono symptom kongestii (przyspieszenie zadań przy niezmienionym cycle time firmy), wprowadzono analizę monotoniczności Ju (ze ścisłym rozróżnieniem 74% workflowów APQC vs 42% zadań O*NET oraz zastrzeżeniem, że monotoniczność dotyczy poprawności, nie jakości) oraz ostrożność interpretacyjną wokół wskaźnika override rate.
  - **AI-30**: wzbogacono pytanie diagnostyczne o instytucjonalną ochronę dla roli prezentującej kontr-tezę przy kryteriach zatrzymania pilota.
  - **AI-32**: rozszerzono analizę kosztów zmiany dostawcy o rejestr zdarzeń i telemetrię operacyjną (`sehgal-log-portability`), przypisując tezę bezpośrednio do źródła Ishaan Sehgal / Omnara (S45) z zachowaniem manuskryptu Ismaila (S42) jako wtórnej adaptacji.
- Wszystkie nowe rekordy źródeł (S41–S45) posiadają zweryfikowany dostęp publiczny (`access: "verified-public"`), a ich recenzje redakcyjne pozostają w statusie `pending` zgodnie z fail-closed regułą bramki publikacyjnej. Struktura 6 linii i 36 stacji pozostała nienaruszona.

## v1.2 — 25 września 2026

Usunięto kolizję między niebieską linią sieci a linkiem „How it works” na szerokich viewportach. Przyczyną było osobne powiększanie hero od 1500 px, które przesuwało CTA w dół przy niezmienionej geometrii mapy. Duży desktop zachowuje teraz ten sam rytm typograficzny, a linki hero otrzymały neutralny kartograficzny halo/maskę, dzięki czemu linia nie może obniżać czytelności tekstu przy różnicach fontów i renderingu.

Dodano regresyjny test kolizji: na szerokościach 1280, 1365, 1440, 1536 i 1600 px próbkuje on geometrię wszystkich tras SVG w screen coordinates i sprawdza, że żadna trasa nie przecina obszaru CTA wraz z buforem.

Rozszerzono dokumentację wdrożenia o rekomendowany workflow udostępniania: GitHub + chronione Vercel Preview do bieżących przeglądów, własna domena po zatwierdzeniu, oraz Cloudflare Pages jako alternatywa dla statycznego hostingu.

## v1.1 — 25 września 2026

Dodano pochodzenie projektu w About: Mark Ajzenstadt i Alex Lieberman z bezpośrednimi linkami do wskazanych postów na X. Dodano opis żywego, rozwijanego przez kuratora przewodnika: nowe źródła mogą poszerzać, kwalifikować i korygować stacje oraz wnosić inne perspektywy i praktyczne alternatywy.

Treść redakcyjna jest edytowana w `content/about.json`, walidowana i wspólnie renderowana do static builda oraz samodzielnego HTML. Sekcja `_provenance` nie trafia do publicznego kodu. Dodano testy atrybucji, bezpiecznych URL, braku wycieku metadanych i zachowania obu wersji.

Nie zmieniono mapy, 36 ID, treści stacji, geometrii, liczby źródeł/perspektyw ani statusów zatwierdzeń. Nie uruchomiono automatycznych aktualizacji ani publikacji.

## v1.0 — 25 września 2026

### Z dokumentacji do kodu

Powstało 58 statycznych stron, 36 osobnych rekordów tematów, autorska mapa sześciu linii, mobilny pasek stacji i rzeczywista ścieżka przejścia do oryginalnych źródeł. Zbudowano też samodzielny HTML do przeglądu bez instalacji.

### Warstwa wizualna

Jasne tło, neutralna typografia i cienkie podziały zastępują dawny card-heavy prototype. Nie wykorzystano wygenerowanych makiet, zdjęć miasta, gradientów, AI glow ani dekoracyjnych ilustracji. Kolor opisuje trasy. Artykuły mają jedną główną kolumnę i normalny scroll; nie ma tabów chowających zasadniczy tekst.

### Sieć

36 ID zachowano bez zmiany przypisania. Zaimplementowano wiele rozłożonych skrzyżowań, osobne mostkowanie przebiegu linii oraz cztery przerywane połączenia proponowane w dokumentacji. Geometria i relacje pozostają oddzielnymi rekordami.

### Interakcje

Wybór linii, preview stacji, index/search, lokalne zakładki, kopiowanie odnośnika i szablonu, ścieżki czytania, powiązane tematy, źródła, klawiatura, ograniczenie ruchu i no-JS index. Obsługa subścieżek oraz osobnych canonical stron.

### Treść i status

Przeniesiono dostarczone sformułowania, nie dopisując nowych badań. Dane autora są projektowane na jawnie określone pola strony. Wykluczono niepodlinkowane rodziny źródeł oraz wewnętrzne ścieżki i dokumenty. Żadnego tematu ani źródła nie uznano automatycznie za zatwierdzone.

### Świadome odstępstwo techniczne

Ponieważ instalacja npm była niedostępna, działający build wykorzystuje Node bez zewnętrznych zależności, zamiast uzależniać cały rezultat od nieuruchomionego Astro. Dostarczono osobny, nieprzetestowany adapter Astro. Pagefind pozostaje kierunkiem opcjonalnej migracji; działająca wyszukiwarka jest lokalna i nie korzysta z AI.

### Pozostałe zadania przed produkcją

Kontrola oryginalnych fragmentów i zatwierdzenie treści; decyzja o nazwie/domenie/fontach; testy w docelowych przeglądarkach i rzeczywistym hostingu; audyt dostępności; konfiguracja bezpieczeństwa/deploymentu. Opcjonalnie: uruchomienie adaptera Astro i przełączenie wyszukiwania na Pagefind.
