# Uruchomienie i wdrożenie

## Trzy różne rezultaty

| Rezultat | Do czego służy | Status |
|---|---|---|
| `INTERCHANGE.html` | Lokalny przegląd bez instalacji | Gotowy |
| `dist/` | Obsługa HTTP i chroniony preview dla zespołu | Gotowy i sprawdzony przez HTTP |
| Wydanie publiczne | Indeksowany serwis pod docelową domeną | Zablokowane do czasu kontroli treści |

Nie skonfigurowano domeny, konta hostingowego ani publicznego deploymentu.

## Lokalnie

```sh
npm run dev
# http://localhost:4173/
```

Alternatywnie `npm run build` i `npm start`. Serwer nasłuchuje na `0.0.0.0`, dlatego na urządzeniu współdzielącym sieć należy uwzględnić lokalny firewall. To prosty serwer podglądowy; do produkcji użyj statycznego hostingu z własnym TLS, kontrolą dostępu, cache i polityką nagłówków.

## Chroniony preview

Buduj `npm run build` i jako katalog publikacji wskaż **wyłącznie `dist/`**. Włącz kontrolę dostępu po stronie dostawcy. `noindex`, `robots.txt` i napis „Research preview” nie chronią plików przed odczytem.

Nie ustawiaj całego `interchange-app/` jako webroot. `content/`, testy, dokumentacja i pliki autora nie są publiczną częścią serwisu.

## Subścieżka

Sprawdzony wariant `/field-guide/`:

```sh
BASE_PATH=/field-guide/ OUT_DIR=dist-subpath node scripts/build.mjs --no-offline
BASE_PATH=/field-guide/ OUT_DIR=dist-subpath node scripts/serve.mjs
```

Adres lokalny: `http://localhost:4173/field-guide/`. Przy hostingu statycznym zamontuj katalog wyjściowy pod tą samą ścieżką. Nie zmieniaj BASE_PATH dopiero po kompilacji, ponieważ dotyczy również URL w HTML i indeksie wyszukiwania.

PowerShell używa innej składni ustawiania środowiska:

```powershell
$env:BASE_PATH="/field-guide/"
$env:OUT_DIR="dist-subpath"
node scripts/build.mjs --no-offline
node scripts/serve.mjs
```

`.env.example` jest opisem zmiennych, nie automatycznie ładowaną konfiguracją. Domyślne skrypty czytają środowisko procesu. W CI ustaw zmienne w konfiguracji joba.

## Wydanie publiczne po zatwierdzeniu treści

```sh
SITE_URL=https://twoja-domena.example BASE_PATH=/field-guide/ npm run build:public
```

`SITE_URL` jest przykładem do zastąpienia rzeczywistą domeną. Polecenie obecnie kończy się blokadą, zgodnie z oczekiwaniem. Udany publiczny build generuje canonical URL i sitemapę przy podaniu SITE_URL. Nie przenosi propozycji przesiadek ani odziedziczonego niezweryfikowanego mapowania PDF do publikacji.

Po uruchomieniu sprawdź bezpośrednie wejście na stację, odświeżenie, link ze źródłem i `#page=`, 404, aktywa pod subścieżką i działanie klawiatury w docelowym hostingu. Nie należy wprowadzać globalnego fallbacku SPA do `index.html`: każda strona ma własny dokument.

## Nagłówki i zasoby

Lokalny serwer wysyła Content-Security-Policy, `nosniff` i Referrer-Policy. Hosting statyczny nie odziedziczy ich sam z kodu serwera — skonfiguruj równoważne nagłówki u dostawcy. Wersja hostowana potrzebuje skryptów i zasobów z własnej domeny; style zawierają deklaracje inline dla kolorów linii. Wersja jednoplikowa zawiera dodatkowo skrypty inline i nie jest przewidziana do serwowania z restrykcyjną polityką skryptów bez odpowiedniej adaptacji.

Pliki fontów nie są dołączone. Interfejs wybiera dostępny lokalnie Geist, Inter lub font systemowy. Docelowa typografia wymaga decyzji zespołu o licencjach/hostingu i ponownego przeglądu układu.


## Rekomendowany sposób udostępniania

### Teraz — review link

Dla tej wersji najlepszy workflow to **GitHub + Vercel Preview**. Repozytorium jest źródłem prawdy, każda gałąź/PR dostaje osobny adres do przeglądu, a produkcyjny adres pozostaje nietknięty. Włącz Vercel Authentication dla previewów, ponieważ obecne treści są nadal research preview.

Jeżeli potrzebujesz linku w kilka minut bez zakładania repozytorium, zbuduj `dist/`, spakuj **zawartość** tego katalogu i przeciągnij ZIP/folder do Vercel Drop. To jest dobre do demonstracji, ale nie do stałego procesu aktualizacji.

### Docelowo — stały publiczny adres

Po zatwierdzeniu treści użyj Git-backed deploymentu z własną domeną. Preferencja:

1. `interchange.twojadomena.pl` lub `twojadomena.pl/interchange/` jako publiczny adres;
2. `main` = produkcja;
3. każda zmiana źródła powstaje na osobnej gałęzi i ma preview URL;
4. po source/editorial review merge do `main`;
5. build publiczny korzysta z `build:public`, `SITE_URL` i właściwego `BASE_PATH`;
6. previewy pozostają chronione i `noindex`.

To wspiera założenie „living guide”: dodanie nowego źródła jest normalną, recenzowalną zmianą treści, a nie ręcznym wrzucaniem kolejnego ZIP-a.

### Alternatywa — Cloudflare Pages

Cloudflare Pages jest dobrym drugim wyborem dla czysto statycznego hostingu. Łączy się z GitHubem, tworzy preview deploye i pozwala chronić previewy przez Cloudflare Access. Wybierz go zamiast Vercela, jeśli cały DNS/edge/security i tak trzymasz w Cloudflare albo chcesz maksymalnie prostą warstwę statyczną.
