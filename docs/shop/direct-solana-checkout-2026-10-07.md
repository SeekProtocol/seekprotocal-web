# Directe Solana-checkout — 7 oktober 2026

## Aanvulling: BNB en Ethereum

De vervolgimplementatie voegt native BNB en ETH toe. Zie [status, controles en activering](direct-evm-checkout-2026-10-07.md). De onderstaande notities beschrijven de eerdere Solana-fase.

Status: lokaal gebouwd en getest in `seekprotocal-web` en `seekar-app`. Geen productiepublicatie, migratie op productie of echte testbetaling uitgevoerd. Dit is fase 1: SOL, USDC en USDT op Solana vanuit een gekoppelde wallet. BNB Chain, Ethereum, BTC en betalingen vanaf exchanges vallen buiten deze fase.

## Gedrag

- Het betaalscherm biedt de door de server ingeschakelde munten. Prijs, ontvanger, mint en leverinhoud worden op de server bepaald. Wisselen van munt levert een nieuwe bestelreferentie op. De website bevat geen treasury-sleutel en tekent niet voor de koper.
- De koper tekent een directe SOL-overboeking of een SPL `TransferChecked`. Zo nodig wordt de tokenrekening van de ontvanger aangemaakt. Geen token approval of swap. De unieke bestelreferentie staat op de betaalinstructie.
- Alleen succesvolle **finalized** transacties op mainnet tellen mee. Controle gebeurt op de specifieke transactie, referentie, echte tokenmint, tokenprogramma en ontvangen bedrag. Een algemene stijging van het walletsaldo is geen betaalbewijs.
- Ieder betaalbewijs heeft een unieke transactiehandtekening. De database bewaart bewijs en betalingen per bestelling. Hetzelfde bewijs kan geen tweede bestelling of oude SOL-order betalen. Het betaalregister is niet wijzigbaar of verwijderbaar via de service API.
- Deelbetalingen tellen op. Voldoende ontvangst binnen de geldige termijn levert één keer aan het vastgelegde account. Een mislukte levering houdt de betaalde status vast voor een volgende poging. De database vergrendelt de bestelling tijdens afhandeling.
- Een tijdige betaling die pas later wordt gevonden, blijft geldig. Transactietijd is leidend; de controletijd is dat niet. Er geldt dezelfde marge van twee minuten na de vijf minuten geldige offerte als bij de bestaande SOL-route.
- Te late betalingen blijven geregistreerd voor support en worden niet automatisch tegen een oude koers geleverd. Onderbetaling, overbetaling en andere uitzonderingen zijn zichtbaar bij de bon. Niet nogmaals betalen wordt expliciet vermeld bij een onzekere betaling.
- De scanner bewaart zijn paginapositie en slaat onleesbare transacties niet over. Een tweede RPC kan overnemen bij uitval. De cron claimt maximaal acht orders tegelijk met een lease; oude orders blijven met een lagere controlefrequentie in herstel.
- Oude Radom-orders en de bestaande native SOL/coin-route blijven ondersteund. Deze wijziging publiceert geen native app-update.

## Bestanden

Website: `components/shop/{Storefront,CheckoutLayout,OrderReceipt}.tsx`, `lib/shop/{payment-assets,payment-transaction,checkout,order-history}.ts`, vertalingen en `tests/payment.test.mjs`.

Backend in `seekar-app`: nieuwe `_shared/shop-solana-{assets,payment}.ts`, aangepaste `solana-checkout`, `solana-order-reconcile` en `_shared/solana-order-settlement.ts`. Schema: `supabase/migrations/20261007120000_direct_solana_shop.sql`.

Next.js en zijn ESLint-config zijn bijgewerkt naar 16.3.8; de bestaande kritieke auditmeldingen zijn daarmee verdwenen. `buffer` is expliciet gemaakt voor de standaard SPL-instructies. De unsigned transacties zijn vergeleken met vastgelegde berichten uit de officiële Solana SDK. Next.js genereerde bij de lokale preview `AGENTS.md` en `CLAUDE.md`.

## Uitgevoerde controles

- 70 frontendtests geslaagd, inclusief mint/netwerk/bedragcontrole, exacte eenheden en transactieberichten voor de drie munten.
- 62 backendtests geslaagd: nieuwe betaalcontrole plus bestaande prijzen, winkelmand, ontvanger, Radom, native SOL en webauthenticatie.
- TypeScript, gerichte ESLint-controle en Deno-checks van beide functies geslaagd.
- Productiebuild geslaagd: 954 pagina's gegenereerd. Alle 31 talen hebben dezelfde vertaalstructuur.
- Echte tijdelijke PostgreSQL-database met de shopmigraties: deelbetaling, dubbele melding, hergebruik van een handtekening, verkeerd account/mint/ontvanger, te late betaling, tijdige betaling na verloop, annulering tegelijk met betaling, overbetaling, leverfout en herstel, rollen en batchclaims geslaagd. Bestaande Radom-hersteltests slagen op hetzelfde schema.
- Acht onafhankelijke gelijktijdige databaseverbindingen melden dezelfde betaling: één betaalbewijs, vijf bedoelde packs, één leverevent.
- Desktop en 390px mobiele preview gecontroleerd met fictieve bestellingen; alle muntkeuzes werken, geen horizontale overflow en geen browserconsolefouten. De preview verricht geen betalingen en is buiten development uitgeschakeld.

Herhaalbare backendfixtures en controles staan in `supabase/tests/build-direct-shop-fixture.py`, `direct-solana-shop.sql` en `direct-solana-shop-concurrency.py`. De concurrencytest verwacht een lege **wegwerpdatabase** met de fixture en gebruikt `psql` plus `PGHOST`, `PGPORT` en `PGDATABASE`. Nooit op productie uitvoeren.

## Voor livegang

1. Verifieer de bestaande treasury en het Solana-mainnet van de RPC's. Backend: `SOLANA_TREASURY_ADDRESS`, `SOLANA_RPC_URL`, bij voorkeur `SOLANA_RPC_FALLBACK_URL` van een andere aanbieder. Browser: bestaande `NEXT_PUBLIC_SOLANA_RPC_URL`. Geen private sleutel nodig.
2. Stel `SHOP_SOLANA_ASSETS` expliciet in, bijvoorbeeld `SOL,USDC,USDT`; leeg schakelt nieuwe directe verkoop uit. De standaard is deze drie munten. De bestaande `solana_shop`-featureflag blijft ook vereist. Bestaande betaalcontrole blijft werken bij gepauzeerde verkoop.
3. Controleer de koersbron. `COINGECKO_API_KEY` gebruikt de bestaande demo-API; de API ondersteunt zonder sleutel geen gegarandeerde capaciteit. Oude/onbruikbare koersen en stablecoins buiten USD 0,98–1,02 blokkeren nieuwe offertes. Er is nog geen tweede koersbron.
4. Pas uitsluitend de nieuwe migratie toe, publiceer daarna `solana-checkout` en `solana-order-reconcile`, vervolgens de website. De website leest nieuwe kolommen: de migratie moet dus eerst bestaan. Behoud de bestaande JWT- en cronbeveiliging.
5. Voer geautoriseerde kleine betalingen uit met een echte wallet voor elke ingeschakelde munt, inclusief de eerste SPL-betaling naar de treasury. Controleer ontvangst, exacte levering, bestelgeschiedenis en herstel nadat de browser sluit. Live walletgedrag en de volledige productieketen zijn nog niet bewezen.
6. Controleer meerdere bestaande croncycli. Richt een melding in voor cronfouten, betaalde maar niet geleverde orders, oplopende wachtijd en `payment_review_reason`. Fallback bij RPC-uitval is lokaal gesimuleerd; productiecapaciteit, loadtests en externe alarmering zijn nog niet ingericht of bewezen.
7. Handel resterende pakketmeldingen af vóór de kwalificatie enterprise-ready. `npm audit --omit=dev` rapporteerde na de updates **0 kritiek, 13 hoog en 10 middel**. De hoge meldingen komen uit de bestaande `braces`-keten via Solana/mobile-wallet/React Native-afhankelijkheden; aanwezigheid in de dependencyboom is nog geen bewijs van bereikbaarheid in de website. Er is geen volledige bereikbaarheidsonderzoek of onafhankelijke beveiligingsaudit uitgevoerd.

Support kan het bestaande auditlog gebruiken en, met serverrechten, de onderstaande query. Deelbetalingen en te late betalingen worden niet automatisch teruggestort. Overbetalingen na reeds afgeronde levering worden niet voortdurend opnieuw gescand; onderzoek die op de chain.

```sql
select id, status, mint, amount_base_units, payment_received_base_units,
       payment_review_reason, paid_at, fulfilled_at, checked_at, failure_reason
from public.solana_orders
where payment_protocol = 'solana-reference-v1'
  and (payment_review_reason is not null or (paid_at is not null and fulfilled_at is null))
order by created_at;
```

Terugdraaien van verkoop: schakel nieuwe munten/verkoop uit of zet de vorige website terug, maar laat de nieuwe migratie en herstelcode staan zolang directe betalingen kunnen binnenkomen. Verwijder geen betalingsbewijzen. Publicatie van de oude website kan opnieuw Radom-checkouts aanbieden en moet een bewuste keuze zijn.
