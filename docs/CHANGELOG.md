# Changelog implementacji

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
