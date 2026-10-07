# BNB en Ethereum in de eigen checkout

De checkout ondersteunt nu native BNB op BNB Smart Chain (chain 56) en native ETH op Ethereum (chain 1), naast SOL, USDC en USDT op Solana. USDT/USDC op EVM-netwerken vallen buiten deze toevoeging. Beide EVM-netwerken gebruiken het door Michael opgegeven ontvangstadres `0xd55f3e07ee55f3644a93E26E569fF7e0Ea193de8`.

## Status

Lokaal gebouwd en getest. De voorbeeldpagina `/nl/cart-check` toont alle vijf betaalopties. De echte checkout biedt BNB/ETH alleen aan wanneer het betreffende netwerk is geconfigureerd. Er zijn in deze taak geen contracten op publieke ketens gepubliceerd, geen echte betalingen verstuurd en geen Supabase-wijzigingen uitgerold. Live werking is nog niet bevestigd.

## Betaling en herstel

- Een EIP-1193-wallet, zoals MetaMask of Rabby, vraagt de koper om toestemming. Meerdere browserwallets worden via EIP-6963 gevonden. De geselecteerde wallet wisselt zo nodig naar chain 1/56; netwerk en account worden voor verzending opnieuw gecontroleerd.
- De server bepaalt het bedrag met een verse koers. Alle betaalbedragen reizen als decimale strings en worden als gehele wei verwerkt. De bestaande orderkolom begrenst een order tot `9223372036854775807` wei (circa 9,22 BNB/ETH); grotere orders worden geweigerd. Geen stille afronding van JSON-nummers.
- Een klein `NativeShopPayment`-contract stuurt de betaling in dezelfde transactie door naar de vastgelegde treasury en schrijft daarna een ontvangstbewijs met de unieke orderreferentie. Geen eigenaar, upgradepad, token-approval of merchant-private-key. Rechtstreekse losse transfers zonder orderreferentie zijn geen shopbetaling.
- De backend controleert chain-ID, de exacte gecompileerde contractcode, treasury, succesvolle transactie, canonical block hash, orderreferentie, log index, bedrag en tijdstip. Alleen `finalized`-blokken kunnen levering activeren.
- De betaalregistratie is uniek op `(chain_id, transaction_hash, log_index)`. De registratie en levering lopen onder een orderlock. Gedeeltelijke betalingen tellen op; overbetaling blijft zichtbaar. Een te late betaling blijft geregistreerd voor support. Een tijdelijke leverfout bewaart de betaling en kan opnieuw worden verwerkt.
- Een begrensde logscan bewaart zijn voortgang en vindt betalingen ook zonder een door de browser doorgestuurde hash. Bij een RPC-fout blijft dezelfde pagina opnieuw controleerbaar. De bestaande cron en herstelknop verwerken zowel Solana als EVM.
- Het inclusietijdstip bepaalt of de betaling binnen de prijsperiode viel, niet het latere bevestigingstijdstip. Een vervallen EVM-order biedt pas opnieuw bestellen aan als de definitieve scan de betaalperiode plus twee minuten heeft doorlopen. Zo wordt wachten op Ethereum-finaliteit niet aangezien voor een mislukte betaling.

## Bronnen in de gekoppelde backend

Repository: `/Users/michaeldevries/Projects/seekar-app`.

- `supabase/contracts/NativeShopPayment.sol`: contract en zelfstandige compiler-/ketentests.
- `supabase/functions/_shared/shop-evm-payment.ts`: netwerkcontrole, bewijscontrole en herstel.
- `supabase/functions/_shared/shop-evm-contract.json`: gepinde ABI en bytecode, solc 0.8.30, optimizer 200, Paris EVM.
- `supabase/migrations/20261007130000_direct_evm_shop.sql`: ledger, onveranderlijke betaalgegevens, exacte tekstbedragen, atomische levering en rechten.
- `supabase/functions/solana-checkout/index.ts`: gedeelde checkout met netwerkgebonden offertes; naam blijft behouden voor bestaande appclients.

## Nog nodig voor activering

1. De contractbron en operationele instellingen beoordelen. De lokale tests zijn geen onafhankelijke smart-contractaudit.
2. Vanuit `supabase/contracts` de vastgepinde ontwikkelhulpmiddelen installeren en `npm test` uitvoeren. `npm run prepare` maakt uitsluitend twee **ongetekende** deployment-transacties met de opgegeven treasury; het script kan niet ondertekenen of versturen. De wallet-eigenaar moet elk contract op het juiste netwerk publiceren en de getoonde gasvergoeding goedkeuren.
3. Na definitieve publicatie de contractadressen vastleggen. De backend vergelijkt bij het aanmaken en controleren van een betaling de runtime bytecode en treasury met de verwachte waarden.
4. Supabase-secrets instellen volgens `supabase/contracts/shop-evm.env.example`: `SHOP_EVM_TREASURY_ADDRESS`, `SHOP_BNB_PAYMENT_CONTRACT`, `SHOP_ETH_PAYMENT_CONTRACT`, `SHOP_BNB_RPC_URL`, `SHOP_ETH_RPC_URL` en bij voorkeur onafhankelijke fallback-URL's. Providers moeten `finalized`, historische receipts/code en `eth_getLogs` ondersteunen. Providercredentials mogen niet in browservariabelen staan.
5. Eerst de eerdere Solana-migratie en daarna de EVM-migratie toepassen, vervolgens `solana-checkout` en `solana-order-reconcile` publiceren. De website met de nieuwe ontvangstkolommen daarna uitrollen. Bestaande orderverwerking en de minuutcron controleren.
6. Met toestemming per netwerk een kleine echte bestelling uitvoeren: walletbetaling, serverbevestiging, exact één levering aan de gekozen account en herstel na het sluiten van de browser onafhankelijk controleren.

## Uitgevoerde controles

- 79 frontendtests geslaagd, inclusief exacte 18-decimale bedragen, contract-ABI-fixture, netwerk/accountcontrole, afgewezen walletwissel en wachten op finaliteit. Dit totaal omvat ook tests die gelijktijdig aan het project zijn toegevoegd.
- 73 relevante backendtests geslaagd, inclusief bestaande Solana/Radom-, checkout- en autorisatiecontroles en zeven nieuwe EVM-scenario's.
- Drie contracttests geslaagd op lokale EVM-ketens met chain-ID 1 en 56: exacte doorstorting, ontvangstbewijs, ongeldige/lege betaling, geweigerde treasury en bytecodegelijkheid. Dit simuleert geen werkelijke mainnet-consensus.
- Werkelijke PostgreSQL-migraties en zowel Solana- als EVM-scenario's geslaagd: deelbetalingen, replay, netwerkisolatie, meerdere logs in één transactie, late finaliteit, te late betaling, overbetaling en service-only rechten.
- Acht gelijktijdige EVM-bevestigingen resulteerden in één betaalrecord, vijf testpacks en één leveringsgebeurtenis.
- TypeScript, Deno-check, gerichte lintcontrole en productiebuild (954 pagina's) geslaagd. De brede repositorylint heeft 22 bestaande fouten buiten de gewijzigde checkout; die is dus niet groen.
- Browsercontrole op 319 px: vijf selecteerbare betaalrijen van 64 px, correcte netwerk-/fee-tekst voor BNB en ETH, geen horizontale overloop. Voorbeeld: `payment-options-bnb-ethereum-2026-10-07.png`.

## Technische referenties

- [EIP-1193: walletinterface](https://eips.ethereum.org/EIPS/eip-1193)
- [EIP-6963: meerdere browserwallets](https://eips.ethereum.org/EIPS/eip-6963)
- [EIP-3326: netwerk wisselen](https://eips.ethereum.org/EIPS/eip-3326)
- [Ethereum JSON-RPC](https://ethereum.org/developers/docs/apis/json-rpc/)
- [BNB Chain walletconfiguratie](https://docs.bnbchain.org/bnb-smart-chain/developers/wallet-configuration/)
- [BNB Chain finaliteit en settlement](https://www.bnbchain.org/en/blog/what-sub-second-finality-means-for-bsc-settlement)
