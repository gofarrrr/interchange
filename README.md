# INTERCHANGE — działająca implementacja v1.6

**Status: wersja do przeglądu zespołowego, nie zatwierdzona publikacja.**

36 tematów o transformacji AI, sześć linii, własna mapa SVG i spokojne strony do czytania. To rzeczywisty interfejs HTML/CSS/JavaScript z pełną treścią, a nie obraz makiety. Projekt realizuje kierunek „Everything is neutral except the network”.

## Zmiany v1.6 — semantyczny silnik wyszukiwania Jev (TypeSafe)

Wydanie v1.6 zastępuje dawne wyszukiwanie leksykalne semantycznym rankingiem **Jev** od TypeSafe AI (według wzorca z projektu `read.atharvashah.com` Atharvy Shaha):
- **Jeden uniwersalny ranking:** wyszukiwanie analizuje kontekstowe znaczenie zapytania i szereguje jednocześnie całą bazę **36 stacji** oraz **40 źródeł** (76 pozycji).
- **Procent dopasowania (% match):** każda znaleziona stacja i źródło wyświetla typowane prawdopodobieństwo (`0–100% match`) wraz z graficznym wskaźnikiem siły korelacji.
- **Filtrowanie zakładek:** szybkie przełączanie widoku między wszystkimi pozycjami (`All`), samymi problemami (`Stations`) a autorami/literaturą (`Sources`).
- **Endpoint serverless (`api/search.js`):** obsługa zapytań z modelu Jev z wbudowanym deterministycznym fallbackiem zapewniającym ciągłość działania.

## Zmiany v1.5 — operacyjne wzbogacenie 6 stacji (Emergence Capital / Julien Bek / Konstantine Buhler)

Wydanie v1.5 dodaje 3 rodziny źródeł (**S47**, **S48**, **S49**) oraz 7 perspektyw dowodowych:
- **AI-01**: budżety narzędzi vs pracy ($500 mld SaaS vs $10 bln usług); copilot sprzedaje narzędzie, autopilot sprzedaje gotową pracę (**S47** / Julien Bek).
- **AI-05**: metryka HURT (Human Unit Review Time) mierząca czas ludzkiej rewizji na jednostkę deliverable'a jako twardy wskaźnik dojrzałości autonomii (**S48** / Emergence Capital).
- **AI-06**: pułapka Mirage PMF przy niesubsydiowanym ludzkim nadzorze i kosztach inferencji (uczciwy COGS a marże 30–50%) (**S48**) oraz paradoks Jevonsa w myśleniu maszynowym — spadek kosztu kognicji indukuje eksponencjalny popyt na analizę (**S49** / Konstantine Buhler).
- **AI-09**: paired engineering — inżynierowie oprogramowania bezpośrednio obok ekspertów domenowych w pętli dostarczania, zamieniający wyjątki w kod i ewaluacje (**S48** / Emergence Capital).
- **AI-13**: utowarowienie surowej inteligencji modeli (drafting, synteza) przy trwałej wartości osądu operacyjnego, kontekstu decyzyjnego i odpowiedzialności powierniczej (**S47** / Julien Bek).
- **AI-29**: autorskie platformy delivery rozbijają liniową zależność zatrudnienia i przychodów, dążąc do marż 70–80% (**S48** / Emergence Capital).

Łącznie: 40 rodzin źródeł i 81 przypisanych perspektyw.

## Zmiany v1.4 — operacyjne wzbogacenie 4 stacji (Bartek Pucek / Thinking Companies)

Wydanie v1.4 dodaje rodzinę źródeł **S46** (Bartek Pucek — *Thinking Companies*) oraz 4 perspektywy dowodowe:
- **AI-02**: iluzja lokalnego copilota i wzmacnianie sprzeczności między silosami (sprzedaż deklarująca terminy, których zakupy nie mogą spełnić).
- **AI-07**: rozpakowanie wiązki stanowiskowej (*job bundle*) a granica odpowiedzialności i uprawnień (*fiduciary anchor* / Bérenger Teboul-Danguin: klient kupuje kogoś, kto odpowiada za wynik).
- **AI-28**: filtr marnotrawstwa przy tanim myśleniu maszynowym (tani koszt kognitywny ułatwia produkcję niepotrzebnych analiz; kryterium: czy wysiłek zmienia decyzję lub wynik).
- **AI-31**: przejście od sprzedaży narzędzi do pracujących procesów (Julien Bek) oraz compounding delivery i utrwalanie metod operacyjnych po wdrożeniu (Emergence Capital).

Łącznie: 37 rodzin źródeł i 74 przypisane perspektywy.

## Zmiany v1.3 — operacyjne wzbogacenie 9 stacji (Ismail / Ju / Sehgal)

Wydanie v1.3 jest bezpośrednią realizacją zasady żywego przewodnika (*living guide, not a finished checklist*): 36 stacji stanowi stabilną strukturę problemów, a nowe materiały pogłębiają je przez dodanie pożytecznego nowego lensu, kwalifikacji, wyzwania, kontrargumentu lub praktycznej alternatywy — z celem głębszego zrozumienia, a nie dłuższego spisu literatury.

Dodano 5 nowych rodzin źródeł (S41–S45) oraz 10 przypisanych perspektyw dowodowych do 9 stacji, wzbogacając diagnozy i pytania o warunki kontekstowe (AI-04), kulturę metryk wejściowych i rolę kontr-przypadku (AI-05), utratę ścieżki terminowania (AI-13), inwersję warstwy danych (AI-14), rejestrację śladów decyzyjnych oraz kontrargument Alloy Partners dot. delayeringu (AI-17), stopniowaną autoryzację i klin powierniczy (AI-24), wąskie gardła w kolejkach zatwierdzeń, niezmieniony cycle time oraz analizę monotoniczności zadań Haranga Ju (AI-28), instytucjonalną ochronę kontr-tezy w pilotach (AI-30) oraz koszty migracji i własność dziennika zdarzeń Ishaana Sehgala / Omnara (AI-32). Łącznie: 36 rodzin źródeł i 70 przypisanych perspektyw.

[Zasady aktualizowania i atrybucji](docs/ORIGINS-AND-UPDATES.md) · [Tekst About](ABOUT.md) · [Changelog](docs/CHANGELOG.md)

## Otwórz od razu

Otwórz **`INTERCHANGE.html`** w przeglądarce. To jeden samodzielny plik zawierający wszystkie strony, style, wyszukiwanie i nawigację. Nie wymaga instalacji ani uruchamiania serwera. Do otwierania oryginalnych źródeł potrzebny jest internet.

Podgląd załącznika w komunikatorze może nie wykonywać JavaScript. W takim przypadku zapisz plik na komputerze i otwórz go w zwykłej przeglądarce. Zakładki są lokalne; przy zablokowanej pamięci przeglądarki interfejs informuje o ograniczeniu.

## Uruchom projekt lokalnie

Wymagany Node.js **22.12 lub nowszy**. Domyślna ścieżka nie wymaga `npm install`:

```sh
cd interchange-app
npm run dev
```

Otwórz `http://localhost:4173/`. Polecenie buduje stronę, uruchamia serwer i obserwuje zmiany w `src/` oraz `content/`. Po przebudowaniu odśwież przeglądarkę; nie ma automatycznego HMR.

Aby tylko obsłużyć już zbudowane pliki:

```sh
npm start
```

Aby odtworzyć `dist/` i samodzielny plik HTML:

```sh
npm run build
```

## Co działa

- Sześć ciągłych tras SVG i wszystkie 36 stacji; podgląd po najechaniu/fokusie, wybór linii, przejście do artykułu.
- 36 pełnych dokumentów: diagnoza, pytania, perspektywy źródłowe, możliwe działania, ograniczenia, przykłady hipotetyczne i powiązane tematy.
- Pełny indeks, wyszukiwanie lokalne, katalog oryginalnych źródeł, trzy ścieżki czytania i cztery proponowane powiązania.
- Mobilna lista stacji na pionowej linii, obsługa klawiatury, ograniczonego ruchu oraz użyteczny indeks bez JavaScript.
- Zapisywanie tematów w tej przeglądarce, kopiowanie linku i szablonu roboczego; bez kont i analityki.
- Budowanie statycznych stron, walidacja danych, testy, kontrola linków wewnętrznych, obsługa subścieżki i blokada niezatwierdzonej publikacji.

Wersja zawiera **58 stron**, **37 rodzin źródłowych z dostarczonymi publicznymi URL** i **74 przypisane perspektywy**. Te liczby nie oznaczają niezależnej weryfikacji źródeł. Treść i interfejs pozostają po angielsku, zgodnie z materiałem wejściowym. Instrukcja dla zespołu jest po polsku.

## Architektura — ważne rozróżnienie

**Uruchomiona i przetestowana ścieżka:** statyczny kompilator Node, HTML, autorski SVG, CSS oraz JavaScript sprawdzany przez TypeScript. Wyszukiwanie jest lokalne i deterministyczne.

**Opcjonalny adapter:** w `astro/` jest integracja z Astro, wykorzystująca te same szablony i dane. Nie została skompilowana w tym środowisku, ponieważ instalacja pakietów npm była niedostępna. Pagefind nie jest aktywnym silnikiem tej wersji. Nie przedstawiamy adaptera jako przetestowanego wdrożenia Astro.

Pełne wyjaśnienie i ścieżka migracji: [IMPLEMENTATION](docs/IMPLEMENTATION.md).

## Orientacja w repozytorium

| Ścieżka | Znaczenie |
|---|---|
| `INTERCHANGE.html` | Samodzielna, klikalna wersja do przeglądu |
| `dist/` | Gotowe strony i zasoby do serwowania HTTP |
| `content/about.json` | Edytowalne pochodzenie projektu i zasady aktualizowania |
| `content/stations/` | 36 oddzielnych rekordów tematów |
| `content/evidence/` | Przypisane perspektywy i ich ograniczenia |
| `content/sources/` | Tytuły, autorzy, URL i status kontroli źródeł |
| `src/data/map-layout.json` | Współrzędne tras, stacji i etykiet |
| `src/data/transfers.json` | Osobne relacje redakcyjne |
| `src/render.mjs` | Komponenty i szablony renderowane do HTML |
| `src/scripts/` | Interakcje przeglądarkowe i router wersji jednoplikowej |
| `src/styles/style.css` | Tokeny, layout, responsywność i stany interakcji |
| `scripts/` | Build, serwer, walidacja i kontrola linków |
| `tests/`, `reports/` | Testy i wyniki faktycznych uruchomień |
| `screenshots/` | Zrzuty działającej implementacji, nie generowane makiety |

## Przed publikacją

Ta wersja nie została umieszczona pod publicznym adresem. Wszystkie tematy są nadal robocze. Polecenie `npm run build:public` **celowo kończy się błędem**, dopóki treść, źródła i odpowiednie fragmenty nie przejdą wymaganych kontroli. Nie usuwaj blokady tylko po to, aby build przeszedł.

`noindex` nie zabezpiecza dostępu. Zespołowy preview umieszczaj za kontrolą dostępu hostingu. Nigdy nie publikuj całego repozytorium jako katalogu strony; serwuj tylko `dist/`.

## Dokumenty dla zespołu

[Implementacja i zgodność z PRD](docs/IMPLEMENTATION.md) · [Edycja treści](docs/CONTENT-EDITING.md) · [Wdrożenie](docs/DEPLOYMENT.md) · [Raport testów](docs/TEST-REPORT.md) · [Zmiany](docs/CHANGELOG.md)


## Najlepszy sposób udostępniania

Do przeglądu: GitHub + chroniony Vercel Preview. Do szybkiego jednorazowego share: upload zawartości `dist/` do Vercel Drop. Po zatwierdzeniu: własna domena i automatyczny deployment z `main`. Szczegóły: [DEPLOYMENT](docs/DEPLOYMENT.md).
