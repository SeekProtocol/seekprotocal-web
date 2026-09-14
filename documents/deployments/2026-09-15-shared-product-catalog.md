# Gedeelde productcatalogus — 15 september 2026

## Status

De catalogus is gepubliceerd in Supabase-project `ukoqxyoogjouhdqhtiei` als `public.shop_products`. Migraties `20260915120000_shared_shop_catalog.sql` en `20260915130000_all_products_web_checkout.sql` zijn toegepast. Live gecontroleerd: dezelfde elf producten in app- en webcatalogus, correcte prijzen en weigering van anonieme wijzigingen en auditinzage. Het actieve Pass-seizoen hoort bij `seekar_pass_s1` en eindigt op 25 oktober 2026.

Gepubliceerd: `solana-checkout` versie 21, `radom-checkout` versie 7 en `shop-dev-grant` versie 101. De aparte Arena-engine-migratie `20260913080000` is niet toegepast.

De web- en appcode zijn aangepast maar nog niet gecommit, gepusht of als frontend/app-update gepubliceerd. Bestaande geïnstalleerde apps krijgen de nieuwe dynamische productweergave pas na een app-update. Hun huidige koopflow blijft compatibel met de nieuwe server.

## Beheer

Beheer producten in Supabase → Table Editor → `public.shop_products`.

- `id`, `key`, `kind`: vaste productidentiteit; maak voor een ander product een nieuwe rij.
- `price_cents`, `currency`: prijs in hele centen, USD of EUR.
- `fulfillment`: wat de server toekent. Packs gebruiken bijvoorbeeld `{"kind":"pack","packs":5}`. Boosts/bundels bevatten een lijst `grants` met `powerupKey` en `quantity`. Een Pass verwijst via zijn productsoort naar het actieve seizoen en de bestaande Pass-regels.
- `active`, `web_enabled`, `dappstore_enabled`: verkoopbeschikbaarheid. Uitzetten verwijdert een product uit de betreffende verkoopcatalogus.
- `sort_order`: volgorde in de catalogus. `name`, `title_key`, `subtitle_key`, `description`: productnaam en presentatie; bestaande vertalingen worden in de app hergebruikt.
- `revision`, `updated_at`: automatisch beheerd.

Alle elf bestaande appproducten staan nu ook in de webcatalogus: drie kaartpacks (USD), de Pass, zes boosts en de boostbundel (EUR). Nieuwe actieve producten van deze vier ondersteunde soorten verschijnen standaard in beide catalogi; een beheerder kan een kanaal bewust uitschakelen. Nieuwe productidentiteiten, prijzen en hoeveelheden binnen deze soorten hebben geen nieuwe productlijst in de client nodig. Een volledig nieuwe productsoort of nieuw boosteffect vereist wel bijpassende toekenningslogica. Native appstores behouden hun eigen SKU-registratievereisten.

Een actieve dashboardbeheerder kan catalogusrijen invoegen en wijzigen. Gewone accounts kunnen dat niet. Producten worden uitgezet, niet verwijderd. Iedere wijziging legt de oude en nieuwe waarden vast in de bestaande, onveranderbare `shop_audit_events`, inclusief de ingelogde beheerder waar beschikbaar.

## Prijzen, bestelling en levering

App en web lezen `shop_catalog(channel)`. De server leest dezelfde tabel bij een offerte of nieuwe bestelling. Er zijn geen actieve vaste prijs- of grantlijsten meer in de clients of betaalfuncties.

Nieuwe clients sturen de bekeken productversie mee. Als de prijs of inhoud ondertussen is veranderd, wordt het aanmaken geweigerd en moet de koper de actuele aanbieding bekijken. Het invoegen van de bestelling controleert de productversie opnieuw onder een databasevergrendeling. Bestaande clients zonder versie krijgen een door de server vastgelegde versie.

Elke nieuwe bestelling bewaart `catalog_revision` en `product_snapshot`; prijs en oorspronkelijke toekenning kunnen daarna niet gewijzigd worden. Oude bestellingen zijn aangevuld met uitsluitend de eerder opgeslagen feiten, gemarkeerd als `legacy`, zonder een huidige catalogusprijs te verzinnen. Bestelgeschiedenis leest de oorspronkelijke productnaam, inhoud, prijs en valuta uit die snapshot. Zo blijft een aankoop van € 8,99 ook in de geschiedenis € 8,99, naast de historische interne USD-waarde.

Betaling en levering van bestaande bestellingen gebruiken de vastgelegde inhoud. Wijzigen of uitzetten van een product verandert dus niet wat een eerdere koper ontvangt. Een optionele Friends ID bepaalt de ontvanger; zonder invoer ontvangt het account van de login de aankoop. Dit geldt voor kaartpacks, boosts, bundels, de Pass en zijn inbegrepen perk. De database kent alles atomair toe en registreert `product_delivered` met bestelling, ontvanger, productversie en inhoud. Herhaalde betaalmeldingen leveren niet opnieuw. Bij een leverfout blijft de bevestigde betaling bewaard en kan de bestaande herstelroute opnieuw leveren.

Voor een Pass wordt vóór betaling het actuele seizoen en de ontvanger gecontroleerd. Een bestaande actieve Pass, een te kort resterend seizoen of een andere openstaande Pass-bestelling voor dezelfde ontvanger blokkeert de nieuwe bestelling. Een databasevergrendeling voorkomt ook twee gelijktijdige bestellingen via verschillende betaalmethoden.

Radom ontvangt de oorspronkelijke productprijs en valuta, plus reeds bekende naam/e-mail. Een EUR-product wordt als eenmalige EUR-aankoop aangeboden. Het verzoek is gecontroleerd tegen de [officiële Radom Checkout Session API](https://docs.radom.com/api/checkout-session/create-checkout-session/). SOL wordt afzonderlijk berekend voor het gekozen product en zijn valuta; een offerte van een ander product wordt niet weergegeven.

## Controles

Deze uitbreiding:

- Web: 12 tests, TypeScript, gerichte lintcontrole en productiebuild (276 pagina’s) geslaagd.
- Backend: 36 tests voor catalogus, Pass-controles, grants, ontvanger, audit, Radom (ook EUR) en webverificatie geslaagd. Typecontrole van beide betaalfuncties geslaagd.
- Database: 55 asserties geslaagd. Alle elf producten via beide betaalmethoden aan een Friends ID geleverd, inclusief dubbele betaalmeldingen, correcte ontvanger, één toekenningsaudit, herstel na een mislukte bundeltoekenning en nieuwe producten standaard zichtbaar in beide catalogi.
- Twee gelijktijdige Pass-bestellingen voor één ontvanger: exact één aangemaakt, de andere vóór betaling geweigerd.
- Live: beide catalogi bevatten elf producten met dezelfde prijzen en valuta; actief Pass-seizoen bevestigd; anonieme wijziging en auditinzage geweigerd; beide betaalfuncties ACTIVE.
- Browser: ingelogde lokale shop met de live catalogus visueel gecontroleerd op desktop en op 390 px mobiel. Elf productkeuzes, Pass van € 8,99, boostbundel van € 4,99, vooraf ingevuld account, standaardontvanger bij lege Friends ID, beide betaalmethoden en een echte SOL-offerte bevestigd. Mobiel geen horizontale overloop. Browser teruggezet naar normale afmetingen en de shop.

De eerdere cataloguswijziging had daarnaast geslaagde app-TypeScriptcontrole en vier appcatalogustests, vijftien databasecatalogusasserties en de bestaande ontvanger-/audittests op verse en bestaande structuur.

Geen echte betaling uitgevoerd en geen nieuwe frontend- of apprelease gepubliceerd. De database en betaalfuncties zijn live; de nieuwe productweergave is lokaal beschikbaar op `http://localhost:3005/nl/shop`. Commit/push zijn in deze uitbreiding niet uitgevoerd.
