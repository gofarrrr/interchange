# Treść, źródła i zatwierdzanie

## Trzy rodzaje rekordów

**Temat:** jeden plik w `content/stations/`, np. `20-enforced-agent-permissions.json`. Zawiera permanentne ID, numer, slug, pełny i krótki tytuł, podsumowanie, diagnozę, pytania, działania, przykład hipotetyczny, ograniczenia, miary oraz referencje do źródeł i perspektyw.

**Źródło:** plik `content/sources/S01.json` itd. Zawiera autora/organizację, tytuł, typ, datę w postaci dostarczonej, `original_url`, ograniczenia i wewnętrzny status kontroli.

**Perspektywa:** plik w `content/evidence/`. Zawiera jedno ograniczone twierdzenie lub perspektywę, `source_id`, warstwę atrybucji, kwalifikację/ograniczenie i lokalizator oryginalnego fragmentu.

Dane nie są przepisywane automatycznie z wcześniejszych Markdown. Aby uniknąć dwóch źródeł prawdy, edytuj rekordy JSON w tej implementacji. Przejście na Markdown/MDX wymaga oddzielnego importera z zachowaniem ID.

## Co edytować ostrożnie

Nie zmieniaj ID i numeru. Nie przenoś stacji między liniami dla symetrii. Zmiana sluga zmienia adres; przed publikacją starych adresów wymaga to strategii przekierowań. Tytuł można zmienić bez zmiany sluga.

Krótkie nazwy są przeznaczone do mapy. Pełne nazwy i dłuższa treść należą do strony dokumentu. Nie wpisuj HTML do rekordów; tekst jest celowo escapowany. Pełne źródła i prywatne notatki nie należą do katalogu `public/`.

## Atrybucja

Zachowaj rozróżnienie: wypowiedź autora źródła, dostarczona synteza redakcyjna oraz propozycja działania. Nie zamieniaj syntezy w cytat. Ograniczenia muszą być widoczne przy perspektywie, a nie tylko w odległej bibliografii.

Wersja bazowa v1.1 zawierała 36 tematów, 31 rodzin źródeł z URL i 60 połączonych perspektyw (w v1.3 rozszerzona o 5 rodzin źródeł S41–S45 i 10 perspektyw do łącznie 36 rodzin i 70 perspektyw). W bazowym imporcie v1.1 wyłączono 9 rodzin bez publicznego URL i 15 perspektyw bez takiego oryginału, jak również książki, PDF i wewnętrzne nazwy plików; późniejsze kuratorskie dodatki są rejestrowane osobno zgodnie z zasadami living guide. Pełny pierwotny import opisuje `src/data/import-report.json`.

## Statusy

Obecnie wszystkie rekordy wymagają kontroli. Działający link nie dowodzi poprawności przypisanego twierdzenia. Odnośnik `#page=` do odziedziczonego PDF nie oznacza ponownej weryfikacji strony.

Publiczna publikacja wymaga dla każdej stacji:

1. `publication_status: "approved"` oraz `review.status: "approved"`, niepustego `review.approved_by` i prawidłowej daty `review.approved_at`;
2. co najmniej jednej przypisanej, zatwierdzonej perspektywy z zatwierdzeniem redakcyjnym i oryginalnym lokalizatorem;
3. źródła tej perspektywy z `review.status: "checked"`, `review.checked_by` i datą `review.checked_at`;
4. `public_locator.kind` innego niż `unverified` oraz niepustego `public_locator.value`.

Są to zapisy wykonanej pracy redakcyjnej, nie przełączniki służące omijaniu kontroli. Nie wpisuj fikcyjnego nazwiska ani daty. Nie zatwierdzaj źródła na podstawie samego dostępnego URL.

Cztery przesiadki mają własny `review` w `src/data/transfers.json`. Propozycje są widoczne w preview, ale nie w projekcji publicznej. Geometria nie może sama ustanowić nowej relacji.

## Codzienny przepływ

```sh
npm run validate
npm test
npm run build
npm run check:links
```

Otwórz artykuł, sprawdź oryginał i lokalizator, przejrzyj etykiety atrybucji, ograniczenia oraz wygląd mobilny. Po faktycznym zatwierdzeniu całego wydania uruchom `npm run build:public`. Obecny snapshot prawidłowo blokuje to polecenie.

Blokada builda ogranicza przypadkową publikację, ale nie zastępuje polityki hostingu, przeglądu redakcyjnego ani kontroli dostępu. Preview zawiera już czytelną roboczą treść, dlatego nie należy udostępniać go publicznie bez decyzji właściciela.

## Pochodzenie projektu i rozwijanie stacji — v1.1

Treść About jest w `content/about.json`. Posty Marka Ajzenstadta i Alexa Liebermana są wskazane jako inspiracja do syntezy 36 stacji, a nie dowód dla każdego twierdzenia. [Pełne zasady](ORIGINS-AND-UPDATES.md) opisują dodawanie nowych perspektyw i kontrargumentów.

Po istotnej zmianie twierdzenia cofnij zatwierdzenie zmienionej stacji i odpowiednich perspektyw do `pending`; ponowne zatwierdzenie ma dotyczyć nowej wersji. Kontrola linku, data builda ani kolejny cytat nie oznaczają ponownej kontroli całej stacji. Nowe treści mają zwiększać rozumienie, nie tylko liczbę linków.
