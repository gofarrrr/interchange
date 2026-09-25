# Implementacja i zgodność z PRD

## Co dostarczono

To funkcjonalna statyczna aplikacja do przeglądu. Każdy temat ma własny URL oraz własny dokument HTML. Czytanie nie zależy od mapy, konta ani usługi AI. Domyślny build jest deterministyczny względem rekordów i geometrii; jedynie znacznik czasu raportu zmienia się między buildami.

```text
content/stations + evidence + sources
                   │
          validate + public gate
                   │
        allowlisted public projection
                   │
src/data/layout ─── renderer ─── lines, journeys, transfers
                   │
           HTML + SVG + CSS
                   │
       dist/             INTERCHANGE.html
   canonical URLs        local hash routes
```

Dane merytoryczne, redakcyjne relacje i współrzędne są oddzielone. Przesunięcie stacji w SVG nie zmienia znaczenia tematu. Samo skrzyżowanie linii nie oznacza przesiadki. Cztery relacje pozostają oznaczone jako propozycje i nie przechodzą automatycznie do publicznej projekcji.

## Sprawdzona ścieżka wykonania

`npm run build` uruchamia `scripts/build.mjs`, który używa tylko biblioteki standardowej Node. Nie ma zależności runtime. `src/render.mjs` generuje wszystkie komponenty i strony. `src/scripts/app.js` dodaje interakcje do istniejącego HTML. Dane wyszukiwania i preview są oddzielnym współdzielonym zasobem.

Domyślna strona używa normalnych linków i ładowania dokumentów przez przeglądarkę. Jednoplikowy `INTERCHANGE.html` zawiera te same wygenerowane fragmenty, style i skrypty oraz ma mały dodatkowy router hash. Jest przeznaczony do przeglądu, nie do zastępowania canonical URL w publicznym serwisie.

Kod przeglądarki korzysta z JSDoc i deklaracji `src/types.d.ts`. Jest objęty ścisłym `checkJs`/`noEmit` TypeScript. Nie jest to aplikacja napisana w całości w plikach `.ts`; moduły kompilatora są `.mjs` i są sprawdzane testami Node.

## Różnice wobec rekomendowanego stosu PRD

| Obszar | PRD | Wykonanie v1.0 | Powód / konsekwencja |
|---|---|---|---|
| Generator | Astro | Działający Node static compiler + opcjonalny adapter Astro | Pobranie npm było niedostępne; dostarczono działający build zamiast zależnej od instalacji obietnicy |
| Wyszukiwanie | Pagefind | Lokalny indeks 36 tematów i deterministyczne rankingowanie | Działa offline, bez instalacji i bez usług; Pagefind wymaga osobnej integracji runtime |
| Treści | Markdown / structured content | Oddzielne JSON dla tematów, źródeł i perspektyw | Zachowana dostarczona projekcja strukturalna; JSON jest obecnie źródłem prawdy |
| Font | Geist Sans + Geist Mono | Lokalne Geist/Inter, dalej system sans/mono | Brak plików fontów i brak żądań do zewnętrznego hosta; metryki zależą od fontów odbiorcy |
| Przesiadki | Zatwierdzone relacje | Cztery jawnie proponowane połączenia przerywane | Nie nadano fikcyjnego zatwierdzenia redakcyjnego |
| Artykuł | Elastyczna sekwencja dokumentowa | Sekcje odpowiadające faktycznym polom materiału | Nie dopisano brakujących twierdzeń dla wypełnienia szablonu |
| Mobile | Pionowy pasek linii | Lista wyboru linii i pionowe stacje przy szerokości ≤1200px | Zamiast zmniejszania nieczytelnego desktopowego schematu |

## Adapter Astro — co jest, a czego nie ma

`astro/astro.config.mjs` i `astro/pages/[...path].astro` stanowią adapter tych samych danych i renderera. Polecenie `npm run build:astro` przygotowuje publiczne zasoby i uruchamia lokalnie zainstalowany Astro. `PUBLIC_RELEASE=1` włącza blokadę publikacji także w tej ścieżce.

**Nie uruchomiono kompilacji adaptera.** W `package.json` znajdują się opcjonalne dla domyślnego builda zależności deweloperskie. Nie ma pliku lock wygenerowanego przez udaną instalację. Zespół powinien wykonać instalację, ustalić dokładne wersje, zatwierdzić lockfile i uruchomić build w swojej infrastrukturze. Przed takim sprawdzeniem nie należy wybierać adaptera jako ścieżki produkcyjnej.

`npm run search:pagefind` jest wyłącznie narzędziem do wygenerowania dodatkowego indeksu po instalacji Pagefind. **Nie przełącza interfejsu wyszukiwania na Pagefind.** Integracja asynchronicznego API Pagefind, stanów ładowania/błędu i rankingu jest osobnym, jeszcze niewykonanym zadaniem.

## Komponenty

Renderer zawiera: nagłówek, mapę sieci, legendę, wybór linii, pionowy pasek trasy, wiersz stacji, stronę dokumentu, wiersz źródła, perspektywę z ograniczeniem, indeks, ścieżki czytania, powiązania, wyszukiwarkę, zapisane tematy i 404. Dane treści są kodowane bezpiecznie do HTML; niedozwolone protokoły URL i nieznane ID powodują błąd walidacji.

Przy rozbudowie można wydzielić funkcje renderera do osobnych komponentów bez zmiany modelu danych. Nie trzeba wprowadzać Reacta, CMS lub grafowej bazy danych, aby utrzymać obecny zakres.

## Design w kodzie

`style.css` jest źródłem tokenów warstwy UI. Kolory sześciu tras w `src/data/lines.json` odpowiadają tokenom CSS; przy zmianie palety aktualizuj obydwa miejsca i wykonaj przegląd kontrastu. Nasycenie części zieleni/czerwieni/cyjanu zostało przygaszone względem propozycji PRD. Żółta trasa ma cienkie ciemniejsze obramowanie dla odróżnienia od jasnego tła. To nie jest certyfikacja dostępności.

Geometria ma odcinki poziome, pionowe i pod kątem 45°. Białe obwódki rozdzielają skrzyżowania bez przesiadki. Etykiety są poziome; pełna nazwa jest w podglądzie i indeksie. Skupienie na linii nie przestawia geometrii. Brak animowanych pociągów i ciągłego ruchu.

## Ograniczenia funkcjonalne

Zapisywanie jest lokalne, bez synchronizacji. W pojedynczym pliku URL jest ścieżką na urządzeniu, więc nie stanowi publicznego linku do wysłania innym. Wersja serwowana HTTP ma zwykłe adresy do udostępniania. Wyszukiwanie, zapis i podglądy wymagają JavaScript; treść, linki i pełny indeks nie.

Nie wdrożono kont, analityki, chatbotów, automatycznych streszczeń, CMS ani automatycznego zatwierdzania źródeł. Nie dodano płatnych fontów, obrazów źródłowych ani pełnych cudzych publikacji.

## v1.1 — pochodzenie i żywy przewodnik

Dodano `content/about.json` jako osobny rekord redakcyjny. `src/about.mjs` waliduje go i projektuje jawnie dozwolone pola; `src/url.mjs` zawiera współdzielony walidator URL. Prywatna sekcja `_provenance` nie jest renderowana ani eksportowana. Kompilacja tworzy `ABOUT.md` z tego samego rekordu.

About pokazuje dwie inspiracje z X i wyjaśnia model rozwijania stacji: nowe niuanse, perspektywy, kontrargumenty i podejścia. Link z katalogu Sources prowadzi do tych podziękowań. Nie dodano X SDK, embedu, automatycznego feeda ani monitorowania. Mapa, stacje i dane źródłowe są niezmienione względem v1.0.
