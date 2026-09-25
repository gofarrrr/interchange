# Raport wykonanych kontroli — v1.1 — 25 września 2026

## Wynik

| Kontrola | Faktyczny wynik |
|---|---|
| Build Node | 58 stron; 36 stacji, sześć linii |
| Testy jednostkowe Node | 29/29 zaliczonych, w tym 10 nowych testów About |
| Testy interfejsu Playwright / Chromium | 17/17 dotychczasowych + 6/6 nowych testów About; zero błędów JavaScript |
| Linki wewnętrzne | 1418 sprawdzonych; zero brakujących plików/kotwic |
| HTTP root | Wszystkie 58 stron i pięć współdzielonych zasobów odpowiadają prawidłowo |
| HTTP subścieżka `/field-guide/` | Wszystkie 58 stron, aktywa i granica BASE_PATH sprawdzone |
| Dodatkowe odpowiedzi serwera | 404, POST 405, HEAD bez treści; brak dostępu do plików autora |
| TypeScript | `strict`, `checkJs`, `noEmit` dla skryptów przeglądarki — bez błędów |
| Blokada publicznego wydania | Kod wyjścia 1, 72 przyczyny blokady; istniejący preview nieuszkodzony |

## Nowe kontrole v1.1

About: obaj autorzy, ich handle i dokładne URL; rozróżnienie inspiracji i dowodów; widoczny opis rozwijania przewodnika; kotwice w wersji offline; dostępność linków z klawiatury; brak widgetów X; statyczny About bez JavaScript; brak poziomego przepełnienia przy sześciu szerokościach. Zweryfikowano również, że prywatne notatki `_provenance` nie trafiają do projekcji publicznej, a niebezpieczne URL lub brakujące dane zatrzymują walidację.

`reports/about-browser-tests.json` zawiera 6 nowych wyników. To sprawdzenie interfejsu, nie ponowna weryfikacja wszystkich materiałów źródłowych. Wyszukiwarkowy indeks dokładnych postów X potwierdził nazwiska i tytuły; bezpośrednie pobranie postów zwróciło 403. Szczegóły w `ORIGINS-AND-UPDATES.md`.

## Co obejmują testy przeglądarkowe

Wszystkie 36 stacji, podgląd, wybór linii bez przesunięcia geometrii, wejście klawiaturą, perspektywy i link PDF, wyszukiwanie i Escape, filtrowanie indeksu/źródeł, zapisane tematy, ścieżka czytania, 404, dostępne nazwy kontrolek oraz pełny indeks przy wyłączonym JavaScript.

Sprawdzono brak poziomego przepełnienia dla strony głównej, stacji 20, indeksu i katalogu źródeł przy **320, 390, 768, 1024, 1280 i 1600 CSS px**. Sprawdzono funkcjonalną mobilną listę stacji i wyłączenie przejść przy `prefers-reduced-motion`.

## Granice testów — istotne

Testy UI wykonywały `page.set_content()` na rzeczywistym samodzielnym pliku HTML. Dzięki temu sprawdzono wygenerowane DOM, CSS, skrypty i lokalne przejścia, **nie** pełny scenariusz nawigacji HTTP w przeglądarce.

HTTP sprawdzono osobno prawdziwym serwerem Node i klientem Python urllib. Ten test nie zastępuje ostatniego smoke testu URL/refresh/back-forward na docelowym hostingu.

Udany zapis do localStorage był sprawdzany przy użyciu jawnego in-memory test double, ponieważ izolowany dokument nie ma normalnego origin. Osobno sprawdzono faktyczną ścieżkę zablokowanego storage i komunikat dla użytkownika. Trwałość po zamknięciu przeglądarki na docelowej domenie wymaga końcowej kontroli.

Nie wykonano: Safari, Firefox, ręcznej sesji z czytnikiem ekranu, formalnego audytu WCAG, rzeczywistego zoom 200–400%, Lighthouse/Core Web Vitals, kompilacji adaptera Astro, aktywnej integracji Pagefind ani ponownej kontroli wszystkich zewnętrznych oryginałów. Nie jest to certyfikacja dostępności ani zgoda na publikację materiałów.

## Rozmiary aktualnego builda

- JavaScript interakcji: 16,159 bajtów; 5,105 bajtów gzip.
- CSS: 36,484 bajty.
- Współdzielone dane wyszukiwania/podglądów: 92,485 bajtów.
- Zero zależności runtime, obrazów w tle, filmów, żądań fontów i skryptów analitycznych.

Rozmiar JavaScript powyżej nie obejmuje współdzielonych danych. Około 1,2 MB pojedynczego HTML zawiera wszystkie dokumenty naraz; typowy serwis HTTP nie wysyła całej treści przy każdym wejściu.

## Odtworzenie

```sh
npm test
npm run validate
npm run build
npm run check:links
python tests/http-checks.py
```

Testy UI wymagają Python Playwright i przeglądarki:

```sh
pip install playwright
playwright install chromium
python tests/browser-checks.py
```

Zmienna `CHROMIUM_BIN` pozwala wskazać istniejący Chromium. TypeScript można uruchomić przez `npm run typecheck` po lokalnym zainstalowaniu TypeScript. W środowisku wykonania użyto już zainstalowanego kompilatora 5.8.3.

Surowe wyniki: `reports/browser-tests.json`, `http-tests.json`, `http-subpath.json`, `local-links.json`, `subpath-links.json`, `unit-tests.log`, `public-gate.log` i `typecheck.log`. Zrzuty w `screenshots/` pochodzą z tych samych zbudowanych stron.
