# Checkout, Friends ID en bestelonderzoek — 14 september 2026

## Resultaat en publicatiestatus

De lokale webshop heeft een checkout met een besteloverzicht, ontvangercontrole, keuze tussen Radom en een Solana-wallet, en een bestelbewijs. Het ingelogde e-mailadres wordt compact getoond; er zijn geen extra invulvelden voor naam, e-mail, adres of telefoonnummer. Bekende naam en e-mail worden automatisch aan Radom doorgegeven. Friends ID is het enige tekstveld, blijft optioneel zichtbaar en kan vóór betaling worden aangepast. De server controleert die code opnieuw bij het aanmaken van de bestelling. Zonder code ontvangt het ingelogde account de packs.

De backend is gepubliceerd in Supabase-project `ukoqxyoogjouhdqhtiei`:

- Migratie `20260914120000_shop_recipient_and_audit.sql` toegepast.
- `solana-checkout` versie 19, `radom-checkout` versie 5 en `solana-order-reconcile` versie 14: ACTIVE.
- Nieuwe ordervelden en audittabel zijn live beschikbaar. Anonieme toegang tot audits, ontvangercontrole en beheerfuncties wordt geweigerd. Alle drie Edge Functions weigeren verzoeken zonder geldige aanmelding.
- Radoms officiële webhooktest na publicatie: `success: true`, HTTP 200. De bijbehorende `webhook_ignored`-registratie is live teruggelezen uit de audit (2026-09-14 01:35:53 UTC).
- Frontend is lokaal gewijzigd; de publieke website is niet gepubliceerd.
- De aparte migratie `20260913080000_arena_engine_revision_and_balance.sql` is niet toegepast. De bestaande Arena-toegangscontroles voor koper en de overige app-producten blijven behouden. Ook de ontvanger moet Arena kunnen gebruiken.

## Mijn bestellingen

De webshop heeft een aparte pagina `/{locale}/shop/orders`, bereikbaar via **Mijn bestellingen** naast de accountgegevens en vanuit de checkout. De bestaande loginmethoden keren na aanmelden terug naar deze pagina. De checkout toont de voorraad en een link naar de geschiedenis; de oude lijst van tien recente bestellingen is vervangen.

De pagina toont webshoporders (`channel = web`) van de koper, inclusief orders die via Friends ID aan een ander account zijn geleverd. Per bestelling staan product, opgeslagen prijs, datum, betaalmethode, ontvanger, betaalstatus en leverstatus. Uitklappen toont de volledige referentie en bestel-, betaal- en toekenningsdatums. Een bevestigde betaling zonder `fulfilled_at` blijft zichtbaar als betaald met toekenning in behandeling. Verlopen orders beloven geen levering.

Oudere orders zijn bereikbaar in pagina's van twintig, gesorteerd op datum en UUID. De zichtbare pagina ververst iedere twintig seconden zolang de tab zichtbaar is, bij terugkeer naar de tab en via **Status vernieuwen**. Mislukt vernieuwen, dan blijft bestaande informatie staan met een melding dat de status mogelijk verouderd is. Bij uitloggen of accountwissel wordt de privéweergave verwijderd en worden lopende leesverzoeken gestopt.

De bestaande databasepolicy `solana_orders_own` blijft de toegangsgrens; er is geen nieuwe backendpublicatie nodig. De pagina gebruikt het normale klanttoken, geen beheersleutel, en is uitgesloten van zoekmachine-indexering. In een tijdelijke PostgreSQL-database met de oorspronkelijke tabel en policy zijn negen controles geslaagd: eigen orders lezen, andermans filters/directe referenties weigeren, paginering bij gelijke datums, geen betaalstatus kunnen wijzigen, accountwissel en geweigerde anonieme toegang. Browsercontrole met fictieve orders: desktop en mobiel, Nederlands en Duits, donker/licht, lege/laden/fouttoestand, betaling zonder levering, levering na vernieuwen en uitklapbare gegevens. De vijf nieuwe status-tests en drie bestaande wachtrijtests slagen. Deze controle is geen nieuwe echte aankoop of live klanttest.

## Welke informatie wordt bewaard?

`solana_orders.user_id` blijft de koper en bepaalt wie het privébestelbewijs mag lezen. `beneficiary_user_id` bepaalt aan welk account de packs worden toegekend. `checkout_snapshot` bewaart de contactgegevens, ingevoerde Friends ID en het gecontroleerde ontvangende profiel zoals ze bij de aankoop waren. Dit pakket aan gegevens kan achteraf niet worden veranderd.

`shop_audit_events` is een append-only dossier. De registratie omvat:

- Aangemelde checkoutverzoeken, geweigerde verzoeken, gecontroleerde en ongeldige ontvangers.
- Bestelling, product, prijs, koper, ontvanger en herhaalde aanvragen met dezelfde aanvraagreferentie.
- Start van een Radom-aanvraag, bekende sessiereferentie, onzekere providerantwoorden en webhookontvangst.
- Door de server bij Radom of op de blockchain gecontroleerde betaalinformatie.
- Elke wijziging van bestelstatus, elke daadwerkelijk toegekende packcredit en latere wijzigingen aan die credits.
- Mislukte toekenningen, herstelpogingen en hun resultaat.
- Wallet openen, annuleren, onzekere walletuitkomst, ingediende transactie en betaaldoorverwijzing, voor zover de browser die melding kon versturen. Deze gebeurtenissen hebben bron `web_client` en gelden nooit als betaalbewijs.

Toegangstokens, API-sleutels, webhookverificatiesleutels, Turnstile-tokens en volledige requestheaders worden niet als auditgegevens opgeslagen. De audittabel bevat geen verwijzingen die bij verwijdering van een order of account het dossier mee verwijderen. Bestaande orders kregen een expliciet gelabelde `migration_snapshot`; er wordt geen historische gebeurtenisgeschiedenis verzonnen.

## Een aankoop onderzoeken

Vraag de bestelreferentie uit het bestelbewijs. Als de betaalpagina niet kon worden aangemaakt, kan de klant een aanvraagreferentie zien. Beide zijn doorzoekbaar.

Voor een aangemelde dashboardbeheerder:

```ts
const {data, error} = await supabase.rpc('shop_audit_lookup', {
  _query: 'BESTELREFERENTIE_OF_AANVRAAGREFERENTIE',
  _before_id: null,
});
```

Dezelfde zoekfunctie accepteert ook koper-e-mail, Friends ID met of zonder `#`, koper- of ontvanger-UUID, Radom-sessie-ID en transactiesignatuur. De uitkomst bevat de gekoppelde bestel-, aanvraag-, betaal- en toekenningsgebeurtenissen. Resultaten staan van nieuw naar oud, maximaal 500 per pagina. Gebruik de laagste ontvangen `id` als `_before_id` om verder terug te lezen. De rolcontrole gebeurt in de database via het bestaande `is_dashboard_admin()`.

Een bevoegde operator kan in Supabase zelf de tabel `shop_audit_events` filteren op `order_id` of `request_id`. Er is in deze wijziging geen afzonderlijke beheerinterface gebouwd.

```ts
const {data, error} = await supabase.rpc('shop_orders_needing_attention');
```

Dit toont maximaal 200 oude-eerst bestellingen die betaald maar niet toegekend zijn, betalingen na een eerdere coin-terugbetaling, of Radom-orders die na twee minuten nog geen gekoppelde providersessie hebben.

Controleer in een dossier achtereenvolgens:

1. Wie betaalde en welk ontvangend account bij de bestelling is vastgezet.
2. Of de betaalreferentie door de server is gecontroleerd. Een URL met `paid=1`, een browsermelding of alleen een ontvangen webhook is geen betaalbewijs.
3. Of `paid_at` is gevuld en welke betaalgegevens zijn bewaard.
4. Of `fulfilled_at` is gevuld en of het aantal `pack_insert`-gebeurtenissen en hun ontvanger overeenkomen met de bestelling.
5. Bij een leveringsfout: de gebeurtenis `fulfillment_failed`, de foutcode en latere `settlement_result`-gebeurtenissen.

Bij een normale toekenningsstoring blijft de order betaald en zonder leveringsbevestiging. De bestaande reconciler probeert opnieuw. Geef niet los extra packs bij: herstel via dezelfde order, zodat de bescherming tegen dubbele toekenning blijft gelden.

Een onzekere Radom-create-aanvraag wordt niet blind opnieuw verstuurd. Het order-ID staat in de metadata van de aanvraag. Zoek bij Radom die ordermetadata of de in `provider_created` bewaarde sessie-ID terug voordat er iets wordt hersteld. Betaalde orders na een coin-terugbetaling en onzekere, niet gekoppelde providersessies vereisen onderzoek; ze worden niet automatisch aan een andere klant toegekend.

## Compatibiliteit en betaling

De nieuwe frontend stuurt een vaste aanvraag-ID per betaalpoging plus de bevestigde ontvanger. Een identieke retry hergebruikt de bestaande order; gewijzigde product-, provider- of ontvangergegevens worden geweigerd. Bestaande gepubliceerde webclients zonder ontvangercontract kunnen blijven kopen voor hun eigen account. De server maakt daarvoor de eigen accountsnapshot en markeert `legacy_self_checkout`.

Radom ontvangt de bekende naam en koper-e-mail via de gedocumenteerde `travelRuleFields.name` en `travelRuleFields.emailAddress`. Er worden geen onbekende adres- of identiteitsgegevens ingevuld. Zie de [officiële checkout-API](https://docs.radom.com/api/checkout-session/create-checkout-session/).

Localhost in development behoudt de eerder gemaakte ondertekende serverproxy zonder Turnstile. De productiecontrole blijft actief. Localhost gebruikt echte betaalproviders; er is tijdens deze werkzaamheden geen echte aankoop of betaling uitgevoerd.

## Validatie

- Productiebuild van de website: geslaagd, 276 pagina's inclusief Mijn bestellingen in alle negen talen. De tijdelijke previews met fictieve gegevens zijn verwijderd.
- TypeScript en scoped ESLint: geslaagd. Deno typecheck en scoped lint: geslaagd.
- 32 relevante backendtests geslaagd: ontvangercontrole, oude webclient, retrygedrag, Radom, Solana-betaalbewijs en productie/lokale verificatie. De drie bestaande verificatiewachtrijtests zijn ook geslaagd.
- Tijdelijke PostgreSQL-databases: verse installatie én upgrade met bestaande order; per scenario 22 expliciete SQL-asserties plus controles op verboden toegang en onveranderbaarheid.
- Acht gelijktijdige afhandelingsverzoeken gaven per scenario exact vijf packs, één keer, met vijf auditrecords van de echte credits.
- Een gesimuleerde toekenningsfout liet geen gedeeltelijke packs achter, bewaarde de betaling en werd daarna via dezelfde order hersteld.
- Browser: desktop 1280 px en mobiel 390 px, donkere en lichte weergave, Nederlands/Engels/Duits, ongeldige Friends ID, ander account, lege Friends ID en afzonderlijke betaal-/leverstatus gecontroleerd. Geen horizontale overflow.
- Na vereenvoudiging van de contactgegevens opnieuw gecontroleerd: alleen Friends ID is een tekstveld; bekende naam en koper-e-mail blijven beschikbaar voor Radom bij zowel eigen als ander ontvangend account. Desktop en mobiel zonder horizontale overflow. De vijf bestaande Radom-tests, inclusief de prefill-payload, slagen.

Herhalen van de databasetests met een lokale PostgreSQL-testserver:

```sh
PSQL=/opt/homebrew/opt/postgresql@17/bin/psql \
PGHOST=/private/tmp/seek-checkout-work PGPORT=55441 \
python3 tests/shop/run-database-tests.py
```

De runner maakt alleen eigen willekeurig benoemde testdatabases aan, weigert externe databasehosts en verwijdert alleen die zelf aangemaakte databases. Hij moet vanuit de SeekAR-repository worden uitgevoerd.
