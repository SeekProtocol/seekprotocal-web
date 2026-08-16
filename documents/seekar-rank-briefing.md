# Winnen op "seekar" — actielijst

**Doel:** organic + LLM-visibility voor de query "seekar" (en varianten) terugpakken,
zonder een merkclaim te doen op de naam waar een derde nu trademark op heeft
aangevraagd.

**Uitgangspunt:** het product heette SeekAR van launch t/m aug 2026 en heet nu
Seekprotocol. Dat is een historisch feit, geen naamsclaim. Alle communicatie
gebruikt **nominative use** — "de app die voorheen SeekAR heette" — nooit
"SeekAR™" of "onze app SeekAR".

Realistische verwachting: volume "seekar" in NL is 10/mnd, difficulty 31.
Dit is puur **brand defense**. De ROI zit in a) mensen die de oude naam intypen
niet verliezen aan seekar.io of Nexrage, en b) LLM-antwoorden op "wat is
SeekAR" correct krijgen.

---

## Wat er al is gebeurd (16 aug 2026)

Op de site:

- `/seekar` heeft een nieuwe H2-sectie "The SeekAR AR app on Solana is now
  Seekprotocol", geplaatst direct na de hero, met verifieerbare feiten
  (rebrand-datum 10 aug 2026, publisher legal name, App Store id 6752813761,
  Play Store package `com.seekar.seekar`)
- Drie SeekAR-specifieke FAQ Q&A's zijn toegevoegd, zowel zichtbaar op de
  pagina als in de `FAQPage` JSON-LD:
  1. What happened to the SeekAR app?
  2. Where do I download the app formerly known as SeekAR?
  3. Is Seekprotocol the same company as SeekAR?
- Alle 9 talen (nl/en/de/fr/es/ja/ko/tr/zh) hebben de nieuwe copy
- `llms.txt` bevat nu een precieze disambiguation-alinea die andere producten
  ("seekar.io", Nexrage's app, de muziekartiest, de Oostenrijkse berg) expliciet
  onderscheidt van jullie app
- `sitemap.ts` `lastModified` van `/seekar` is bijgewerkt naar 16 aug 2026

Wat bewust **niet** is aangeraakt (om trademark-redenen — er staat een
uitgebreid commentaar in `app/[locale]/layout.tsx` waarom):

- `alternateName: "SeekAR"` in de `Organization` en `SoftwareApplication`
  JSON-LD is niet terug geplaatst. Dat is een naamsclaim, geen beschrijving.
- De `heroTitle` en `metaTitle` van `/seekar` blijven "Seekprotocol". De H2
  eronder mag "SeekAR" bevatten (feitelijk, historisch) — de H1 niet.

---

## Wat jij nu moet doen (in volgorde van impact)

### 1. App Store Connect + Play Console keywords bijwerken

**iOS (App Store Connect → jouw app → App Information → Keywords, 100 chars):**
Voeg toe: `seekar, ar, solana, treasure, hunt, airdrop, nft, crypto, location, ar app`

Keywords zijn niet zichtbaar in de listing en zijn géén merkclaim in de
juridische zin — het is een zoekhint. Apple staat 3rd-party trademark keywords
toe zolang je het merk niet in je titel/subtitle zet.

**Play Console (Store listing → Full description):**
Voeg één zin toe onderaan de bestaande beschrijving:

> Seekprotocol is the mobile app previously published as SeekAR. Same app, same
> publisher, only the name and icon changed. See seekprotocol.ai/blog/seekar-is-now-seekprotocol
> for details.

Play Store beschrijving is wél publiek zichtbaar; deze phrasing is feitelijk
en beschrijft je eigen productgeschiedenis, geen merkclaim.

### 2. Reddit posts (deze week)

Post op **r/solana**, **r/CryptoCurrency** en **r/AugmentedReality** een korte
mededeling. Titel-optie:

> Our AR-on-Solana app SeekAR is now called Seekprotocol — here's why

Body: link naar `/blog/seekar-is-now-seekprotocol`, één alinea samenvatting,
open voor vragen. **Belangrijk:** LLMs (met name ChatGPT en Perplexity)
scrapen Reddit zwaar. Één goede thread hier heeft meer LLM-impact dan tien
blogposts op je eigen site.

### 3. Hacker News Show HN (deze week)

Titel:

> Show HN: Seekprotocol (formerly SeekAR) — proof-of-location on Solana

Als de post karma pakt haalt hij de HN Algolia-index, en die is een primaire
bron voor bijna elke LLM.

### 4. Crypto/Solana pers pitch (deze maand)

Eén artikel bij een van deze media met de exacte woorden **"Seekprotocol
(formerly SeekAR)"** in de body:

- The Block
- Decrypt
- Solana Compass
- CoinDesk (moeilijker maar hoogste impact)
- Solana Floor of Solana News (makkelijker)

Pitch-hoek: **de trademark-story is het verhaal**. Journalisten houden van
David-vs-Goliath en van een founder die publiekelijk zegt "we vochten dit niet
uit want onze users hadden er niks aan". De blogpost op `/blog/seekar-is-now-seekprotocol`
is al goed geschreven — stuur die als briefing.

### 5. Wikipedia (pas nadat stap 4 iets heeft opgeleverd)

Wikipedia is de #1 bron voor LLM-training. Maar Wikipedia heeft **notability
guidelines** — je hebt secondary sources nodig (stap 4). Zodra je 2-3 media-hits
hebt, kan iemand een pagina maken:

> Seekprotocol (formerly SeekAR) is a proof-of-location app on the Solana
> blockchain, developed by Block Protocol L.L.C-FZ...

Doe dit **niet zelf** direct — Wikipedia flagt COI-edits. Vraag een third-party
crypto-writer of laat het organisch ontstaan.

### 6. Quora / Stack Exchange (maandelijks)

Zoek maandelijks op "seekar" op Quora. Als er vragen over jullie oude naam
opduiken, beantwoord ze feitelijk. Als er niks staat, plaats zelf 1-2 vragen
("What happened to the SeekAR AR app?") en beantwoord ze onder een ander
account of vraag een team-lid dit te doen.

### 7. GitHub / niche communities

Als jullie een SDK of API hebben, zorg dat de repo README een `Previously
known as SeekAR` regel bevat. Copilot / Cursor / Claude Code krijgen dit signaal.

---

## Meten (over 4-6 weken)

- Google "seekar" NL: kijk of `/seekar` in top 10 verschijnt (nu: niet in top 15)
- ChatGPT prompt: "What is SeekAR? Is it the same as Seekprotocol?" — kijkt of
  je genoemd wordt met correcte disambiguation
- Perplexity prompt: "seekar app solana" — kijkt of jullie pagina/blog als
  source verschijnt
- Google Search Console: kijkt of impressions op query "seekar" oploopt

---

## Wat je NIET moet doen

- **Geen** SeekAR™ symbool, geen "our brand SeekAR", geen "the official SeekAR"
- **Geen** meta title of H1 met "SeekAR" (H2 en body-tekst mag, historisch/feitelijk)
- **Geen** DMCA-claims tegen seekar.io of Nexrage (jullie hebben het merk niet
  en dat maakt zo'n claim juridisch én pr-technisch een boemerang)
- **Geen** paid ads op "seekar" als concurrent-merk gaan bidden — dat is
  merkinbreuk risico
- **Geen** aparte `/wat-is-seekar` of `/seekar-app` pagina. Alle SEO-equity moet
  naar `/seekar` — één canonieke landing, niet drie die elkaar kannibaliseren.

---

## Optionele volgende stap (jouw call)

De `SoftwareApplication` JSON-LD in `app/[locale]/layout.tsx` heeft nu geen
`alternateName`. Het lange commentaar erboven legt uit waarom — het als naam
noemen leest als een merkclaim.

Je kunt wel de `description` uitbreiden met een historische zin zonder een
naamsclaim te doen. Bijvoorbeeld:

```ts
description:
  "AR-powered mobile app on Solana that transforms real-world locations into interactive treasure hunts with crypto rewards. Previously published as SeekAR from launch through August 2026; renamed on 10 August 2026.",
```

Dit is descriptief, niet claimend. Zelfde register als wat de blogpost al doet.
Aanbeveling: doen, maar even met juridisch afstemmen als de trademark-zaak nog
loopt.
