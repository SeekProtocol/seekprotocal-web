/**
 * Whitepaper content.
 *
 * ⚠️  PLACEHOLDER FIGURES — everything under `TOKENOMICS`, `TOKEN_FACTS`,
 * `VESTING` and the supply numbers below is illustrative structure, not Seek
 * Protocol's actual tokenomics. Replace with the real allocation, vesting and
 * supply before publishing, then set `DRAFT_FIGURES` to false to hide the
 * notice rendered on the page.
 *
 * Everything else is sourced. Where a chapter quotes a number about the game,
 * the app's own migrations and edge functions are the authority, not this file.
 *
 * House rule, carried over from the app: no em dashes in user-facing copy.
 */
export const DRAFT_FIGURES = true;

export type Chapter = {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  blocks: Block[];
};

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "callout"; text: string }
  | { kind: "specs"; rows: { label: string; value: string }[] }
  | { kind: "tokenomics" }
  | { kind: "stack" }
  | { kind: "confidence" }
  | { kind: "economy" }
  | { kind: "calculator" }
  | { kind: "timeline" }
  | { kind: "catch" }
  | { kind: "vesting" }
  | { kind: "glossary" };

export const WHITEPAPER_META = {
  version: "v1.5",
  updated: "August 2026",
  /* About 5,100 words of prose, plus nine figures that are worth playing with.
     Recount if chapters are added: `words / 220` is the prose figure. */
  readingTime: "28 min",
};

export const CHAPTERS: Chapter[] = [
  {
    id: "summary",
    index: "01",
    eyebrow: "Executive summary",
    title: "A protocol for things that exist in a place",
    blocks: [
      {
        kind: "p",
        text: "The internet made every digital object available everywhere at once. That was the point, and it worked. But it also stripped digital things of the one property that makes physical things feel valuable: being somewhere in particular. A concert ticket matters because it admits you to a room. A landmark matters because you have to travel to it.",
      },
      {
        kind: "p",
        text: "Seek Protocol puts location back into digital assets. A token, an NFT, or a reward can be issued to a set of coordinates rather than to a wallet, and it stays there until someone physically stands within its radius and proves it. We call that proof of location, and it is the primitive the rest of the protocol is built on.",
      },
      {
        kind: "p",
        text: "The consumer surface is **SeekAR**, a mobile app on iOS and Android that renders these assets in augmented reality. You walk, your phone shows what is nearby, and you collect what you find. Underneath, settlement happens on Solana, chosen for transaction costs low enough that picking up a small reward does not cost more than the reward is worth.",
      },
      {
        kind: "callout",
        text: "The short version: we make digital assets that can only be claimed from a specific place, verify that someone was actually there, and settle it on-chain in under a second for a fraction of a cent.",
      },
      { kind: "h", text: "What this document covers" },
      {
        kind: "p",
        text: "Sixteen chapters, in four movements. The first three set out the problem and the primitive that answers it. Chapters four to seven are the machine: how a claim travels, how the layers fit, and what the app does with them. Eight to eleven are the economy, from who pays for placement through to who decides the parameters. The last five are the things a whitepaper usually leaves out, which are the attacks, the privacy cost, the regulatory position and the honest limits.",
      },
      {
        kind: "p",
        text: "Several figures are playable. The verification model, the claim timeline, the catch roll and the budget calculator all run the arithmetic the protocol runs, with the same constants, so you can disagree with the design rather than with a diagram of it.",
      },
    ],
  },
  {
    id: "problem",
    index: "02",
    eyebrow: "The problem",
    title: "Attention is cheap online and expensive in the street",
    blocks: [
      {
        kind: "p",
        text: "Two groups have a problem that turns out to be the same problem viewed from opposite ends.",
      },
      { kind: "h", text: "Brands and venues cannot buy footfall" },
      {
        kind: "p",
        text: "Digital advertising can put an image in front of someone in milliseconds. It cannot get them to walk three streets over. Conversion from an impression to a physical visit is the weakest link in the entire retail and events funnel, and it is measured badly, usually by asking people at the till whether they saw an ad.",
      },
      {
        kind: "p",
        text: "The industry's answer has been modelling. Panels of opted-in devices are extrapolated to a population, and the resulting store-visit figure is reported alongside impressions and clicks as though it came from the same kind of counter. It did not. One number is an event and the other is an estimate, and campaigns are judged on the estimate.",
      },
      { kind: "h", text: "Crypto projects cannot find real users" },
      {
        kind: "p",
        text: "Airdrops are the standard tool for distribution, and they are farmed. A wallet costs nothing to create, so any reward that can be claimed by a wallet will be claimed by thousands of wallets belonging to a handful of people. Projects respond with ever more elaborate eligibility rules, which mostly filter out ordinary users while sophisticated farmers adapt.",
      },
      {
        kind: "p",
        text: "Both problems dissolve if you can prove a human being was in a specific place at a specific time. Footfall becomes measurable because arrival is the event being recorded. Airdrop farming becomes expensive because a wallet is free but travel is not, and nobody is in forty cities at once.",
      },
      {
        kind: "specs",
        rows: [
          { label: "Cost to create a wallet", value: "Effectively zero" },
          { label: "Cost to be somewhere", value: "Time, distance, physical presence" },
          { label: "What that difference buys", value: "A sybil resistance mechanism grounded in physics" },
        ],
      },
      { kind: "h", text: "Why this is buildable now and was not before" },
      {
        kind: "p",
        text: "Three things had to arrive at once. Phones had to carry dual-frequency GNSS, depth-aware cameras and hardware-backed attestation as standard rather than as flagship features. Settlement had to get cheap enough that a reward worth a few cents survives being moved, which ruled out every chain until fees fell below a cent. And people had to be willing to point a camera at a street and see something rendered into it, which a decade of AR in games has quietly settled.",
      },
    ],
  },
  {
    id: "proof-of-location",
    index: "03",
    eyebrow: "Core primitive",
    title: "Proof of location",
    blocks: [
      {
        kind: "p",
        text: "Proof of location is the claim that a given device was inside a given radius during a given window, made credible enough that something of value can be released on the strength of it.",
      },
      {
        kind: "p",
        text: "No single signal is trustworthy on its own. Raw GPS can be spoofed by any rooted device with a mock location provider. So the protocol scores a claim across several independent signals and requires the combination to be coherent, because faking one signal is easy and faking all of them consistently is not.",
      },
      { kind: "h", text: "Signals we combine" },
      {
        kind: "list",
        items: [
          "**GNSS fix**, the raw satellite position with its reported accuracy, plus the constellation and satellite count, which spoofers frequently get wrong.",
          "**Ambient radio**, the set of nearby Wi-Fi SSIDs and cell towers, matched against what the protocol expects to see at those coordinates. Radio environments are hard to fabricate and change slowly.",
          "**Device attestation**, Play Integrity on Android and DeviceCheck or App Attest on iOS, confirming the app is genuine and the OS is not compromised.",
          "**Motion continuity**, the accelerometer trace between the previous confirmed position and this one. A claim that you moved 400 km in 90 seconds without a matching motion profile is rejected.",
          "**Temporal plausibility**, where arrival times are checked against the travel time implied by your last confirmed location.",
        ],
      },
      {
        kind: "p",
        text: "Each signal contributes to a confidence score. Assets set the score they require: a low-value quest reward might accept a moderate score, while a high-value drop at a ticketed event can demand device attestation and a matching radio environment. Claims below the threshold are refused, and repeated refusals from one device raise the threshold for that device.",
      },
      { kind: "confidence" },
      {
        kind: "callout",
        text: "The goal is not perfect proof, which is unobtainable on consumer hardware. It is to make forgery cost more than the reward is worth, the same standard that keeps card payments workable.",
      },
      { kind: "h", text: "Why the signals are weighted rather than required" },
      {
        kind: "p",
        text: "A rule that demands every signal is a rule that refuses honest users. Underground stations lose GNSS. New buildings have radio environments the map has never seen. A phone two OS versions behind can fail attestation for reasons that have nothing to do with fraud. Weighting lets an asset say how much evidence its value deserves, and lets an honest claim survive one bad signal without letting a forged claim survive four.",
      },
      {
        kind: "specs",
        rows: [
          { label: "Default claim radius", value: "30 m" },
          { label: "Configurable range", value: "5 m to 500 m per asset" },
          { label: "Typical confirmation", value: "Sub-second on Solana" },
          { label: "Attestation", value: "Play Integrity, App Attest" },
          { label: "Refusal handling", value: "Recorded per device, raises that device's bar" },
        ],
      },
    ],
  },
  {
    id: "lifecycle",
    index: "04",
    eyebrow: "Mechanics",
    title: "What actually happens when you claim something",
    blocks: [
      {
        kind: "p",
        text: "The previous chapter describes the evidence. This one follows a single claim from the moment you reach for an asset to the moment it is in your wallet, because the order of operations is where most of the design decisions live.",
      },
      { kind: "timeline" },
      { kind: "h", text: "The boundary that matters" },
      {
        kind: "p",
        text: "Look at where the stages change machine. Everything sensitive happens in the first three: the position, the radio scan, the motion trace, the attestation. None of it leaves your phone in raw form. What crosses to the verifier is a signed claim, and what crosses from the verifier to the chain is a signed attestation that the claim met its threshold.",
      },
      {
        kind: "p",
        text: "This is why verification is off-chain. It is not a scaling compromise. Putting the scoring on-chain would mean publishing the inputs, and the inputs are a description of where you are standing and what wireless networks are around you.",
      },
      { kind: "h", text: "What happens when it fails" },
      {
        kind: "list",
        items: [
          "**Below threshold**: the claim is refused, the asset stays on the map, and nothing is written to the chain. The refusal is recorded against the device.",
          "**Repeated refusals**: the required score for that device rises. A device that has failed six claims in an hour is not treated like one that has failed none.",
          "**Settlement failure**: the claim is held and retried rather than dropped. An asset that has been won and not delivered is a bug that costs trust, so the queue is designed to step a stuck payout aside rather than block the ones behind it.",
          "**Expiry mid-claim**: assets carry a window, and a claim that arrives after it closes is refused even at a perfect score. The window is part of the asset, not a network condition.",
        ],
      },
      {
        kind: "callout",
        text: "A claim is a lock, not a lookup. Two people reaching for the last unit of an asset at the same moment must not both be told they got it, so the check takes the lock before it decides anything.",
      },
    ],
  },
  {
    id: "architecture",
    index: "05",
    eyebrow: "Architecture",
    title: "How the layers fit together",
    blocks: [
      {
        kind: "p",
        text: "The protocol is four layers. Each one can be reasoned about, and replaced, on its own.",
      },
      { kind: "stack" },
      {
        kind: "p",
        text: "The separation matters most at the boundary between location and settlement. Location verification is probabilistic and happens off-chain, because it depends on sensor data that has no business being public. What reaches the chain is a signed attestation that a claim met its threshold, not your movement history.",
      },
      { kind: "h", text: "What is stored, and where" },
      {
        kind: "list",
        items: [
          "**On-chain**: asset definitions, their coordinates and radii, claim records, and token transfers. Public and permanent.",
          "**Off-chain**: raw sensor readings, radio fingerprints, and device attestations. Retained only as long as needed to score a claim and resolve disputes, then discarded.",
          "**On device**: your position history and AR anchor data. It stays on your phone unless you explicitly share it.",
        ],
      },
      { kind: "h", text: "Why Solana" },
      {
        kind: "p",
        text: "The requirement is unusual for a chain: very high transaction count, very low value per transaction, and a confirmation fast enough that a person standing in the street does not notice it. Someone picking up a reward worth twenty cents cannot pay ten cents to receive it, and will not stand still for thirty seconds waiting. That combination rules out most of the field on cost and the rest on latency.",
      },
      {
        kind: "p",
        text: "The trade is real and worth stating. Solana has had outages, and a chain that stops means claims that queue. The protocol treats settlement as a step that can fail and retry rather than one that always succeeds, which is the right design regardless of chain but is not optional on this one.",
      },
      { kind: "h", text: "What runs where" },
      {
        kind: "specs",
        rows: [
          { label: "Position, sensors, AR anchors", value: "On the device, never uploaded raw" },
          { label: "Scoring and threshold", value: "Protocol verifier, off-chain" },
          { label: "Asset definitions and claims", value: "Solana, public" },
          { label: "Media and coin artwork", value: "Cached on device, served from object storage" },
          { label: "Spawn announcements", value: "Server-authoritative, never client-declared" },
        ],
      },
    ],
  },
  {
    id: "seekar",
    index: "06",
    eyebrow: "Application",
    title: "SeekAR, the consumer surface",
    blocks: [
      {
        kind: "p",
        text: "SeekAR is where the protocol becomes something a person can use without knowing any of the above. It opens to a map of what is nearby, and holding up the camera renders those assets in place through the AR engine.",
      },
      { kind: "h", text: "What the app does" },
      {
        kind: "list",
        items: [
          "**Discover**, a live map of drops, quests and events within walking distance, filtered by what you actually care about.",
          "**Collect**, where you point the camera, see the asset anchored in the world, reach out and take it. Settlement happens in the background.",
          "**Guide**, an AI companion that reads your surroundings through the camera and suggests routes, explains what you are looking at, and adapts to how you play.",
          "**Hold**, a built-in wallet created from a social login, so a first-time user is not asked to write down a seed phrase before they can pick anything up.",
        ],
      },
      {
        kind: "p",
        text: "The onboarding constraint drives more design decisions than any other. Most people who will ever use SeekAR have never held a private key. If the first thirty seconds involve the word 'mnemonic', they leave. So the wallet is created silently and can be exported later by anyone who wants custody.",
      },
      { kind: "h", text: "The walk to the drop" },
      {
        kind: "p",
        text: "Assets sit tens to a couple of hundred metres away, which is a distance where a map is enough and a route is overkill. Marking a spawn draws a straight line from you to it. The line is dashed deliberately: it is a bearing, not a route, it knows nothing about buildings, and over that distance the bearing usually is the walk. It clears itself once you are inside catching range, where the ring takes over.",
      },
      {
        kind: "p",
        text: "Spawns expire within the hour. That is a game decision with a protocol consequence: a marker restored on the next launch would point at nothing, so the app does not persist one.",
      },
      { kind: "h", text: "Anchoring, and what AR is for here" },
      {
        kind: "p",
        text: "The camera pass is not decoration and it is not the verification either. It does two things. It puts the asset at a believable place in the world so that reaching for it is an action rather than a button press, and it gives the motion signal something to be consistent with, because a person walking around an anchored object moves like a person and a spoofer holding a phone still does not.",
      },
    ],
  },
  {
    id: "play",
    index: "07",
    eyebrow: "The loop",
    title: "What keeps someone walking",
    blocks: [
      {
        kind: "p",
        text: "A protocol that pays for arrival still needs a reason for the first arrival. Nobody walks four streets for a mechanism. The game layer is the demand side of the network, and it is designed with the same honesty as the verification: the odds are published, they are computed on the server, and the client is never asked what happened.",
      },
      { kind: "h", text: "The catch" },
      {
        kind: "p",
        text: "Reaching an asset does not hand it to you. A charge ring runs while you hold the tap, and the quality of that charge feeds a multiplier. Then the server rolls. You get two attempts on a spawn, and the retry is worth 0.65 of the first, which is the number that makes a second chance feel like a second chance rather than a consolation.",
      },
      { kind: "catch" },
      { kind: "h", text: "The terms nobody usually publishes" },
      {
        kind: "p",
        text: "Most games hide the modifiers. There is no reason to here, because the interesting property is that skill nudges and never decides. The charge ring is a multiplier between 0.85 and 1.0, so a perfect tap on a legendary is still a legendary, and a fumbled tap on a common is still probably a common.",
      },
      {
        kind: "list",
        items: [
          "**Level bonus**, a flat 0.3 points of chance per player level, across ten levels from Seeker to Legend.",
          "**Cold streak**, a pity timer worth 2 points per consecutive miss and capped at 12, which applies to the retry as well as across coins.",
          "**Streak penalty**, 4 points per consecutive success on the same coin and capped at 20, so farming one spawn point gets worse rather than better.",
          "**Clan bonus**, capped at 5 points, earned by the clan rather than the player.",
          "**Power-ups**, bought or won, which multiply the base chance before every other term is added.",
        ],
      },
      {
        kind: "callout",
        text: "The floor is 5% and the ceiling is 95%. Nothing stacks to a guarantee, and nothing stacks to a wall.",
      },
      { kind: "h", text: "Progression, and what it is for" },
      {
        kind: "p",
        text: "Levels, badges, clans, twelve-hour challenges and weekly goals exist to give the walk a shape longer than one drop. They also do protocol work: a player with a level, a clan and a streak has an account with a history, and a history is expensive to fabricate at scale. Progression is a second cost imposed on the farmer that costs the honest player nothing, because they were going to play anyway.",
      },
      {
        kind: "specs",
        rows: [
          { label: "Attempts per spawn", value: "2" },
          { label: "Retry multiplier", value: "×0.65" },
          { label: "Charge ring range", value: "×0.85 to ×1.00" },
          { label: "Chance floor and ceiling", value: "5% and 95%" },
          { label: "XP on a catch", value: "30 to 140" },
          { label: "XP on a miss", value: "5 to 15" },
          { label: "Levels", value: "Ten, Seeker to Legend" },
        ],
      },
    ],
  },
  {
    id: "creators",
    index: "08",
    eyebrow: "Supply side",
    title: "Who places the assets",
    blocks: [
      {
        kind: "p",
        text: "A location-based network is worthless if the locations are empty. The protocol therefore treats asset placement as a first-class product, not an internal tool.",
      },
      { kind: "h", text: "Three kinds of publisher" },
      {
        kind: "list",
        items: [
          "**Brands and venues** use the business portal to place offers at their own premises and measure who actually arrived. The unit they buy is a verified visit, not an impression.",
          "**Token projects and NFT communities** distribute to people rather than to wallets, using geography as the filter that farming cannot cheaply defeat.",
          "**Event organisers** turn a festival, match or conference into a claimable map for the duration of the event, with assets that expire when it ends.",
        ],
      },
      {
        kind: "p",
        text: "All three use the same campaign builder: drop a pin, set the radius, choose the asset and quantity, set the confidence threshold and the window, fund it, publish. No integration work, and no contract to write.",
      },
      {
        kind: "callout",
        text: "For a venue, the metric that matters is cost per verified arrival. It is the first footfall number in digital marketing that is measured at the door rather than inferred from a survey.",
      },
      { kind: "calculator" },
      { kind: "h", text: "The density problem" },
      {
        kind: "p",
        text: "Supply and demand here are geographic, which makes the usual marketplace advice useless. A thousand assets spread evenly across a country is an empty map everywhere. The same thousand in one city is a reason to leave the house. Placement pricing is therefore weighted by demand for the area rather than being flat, so a saturated high street costs more to hold than a quiet one, and the protocol subsidises the streets that need traffic instead of the ones that already have it.",
      },
    ],
  },
  {
    id: "token",
    index: "09",
    eyebrow: "Token",
    title: "$SEEK and what it is for",
    blocks: [
      {
        kind: "p",
        text: "$SEEK is the settlement and coordination asset of the protocol. It exists because the network has to move value between parties who do not know each other, a brand in one country funding a reward claimed by a stranger in another, and because the cost of placing assets should scale with demand for the places being used.",
      },
      { kind: "h", text: "Utility" },
      {
        kind: "list",
        items: [
          "**Campaign funding**, where publishers denominate and fund rewards in $SEEK.",
          "**Placement fees**, a fee per placed asset, weighted by radius, duration and the demand for that area.",
          "**Staking for priority**, where staked $SEEK raises a publisher's placement priority when several campaigns compete for the same coordinates.",
          "**Rewards**, with the majority of protocol fees flowing back to the people doing the walking.",
          "**Governance**, covering parameter changes, treasury allocation and the confidence thresholds for high-value claims.",
        ],
      },
      { kind: "economy" },
      { kind: "tokenomics" },
      { kind: "h", text: "Supply over time" },
      {
        kind: "p",
        text: "An allocation chart says who holds what and nothing about when. The schedule below is the more useful figure, because the risk in a token is rarely the split, it is the cliff.",
      },
      { kind: "vesting" },
      {
        kind: "p",
        text: "The design intent is that fee flow tracks real activity rather than speculation: the protocol earns when assets are placed and claimed, which only happens when someone is willing to pay for a verified visit.",
      },
      { kind: "h", text: "What the token deliberately does not do" },
      {
        kind: "list",
        items: [
          "It does not fix a rate between a caught game unit and a token. The game values a catch; the market values the token; the protocol does not pretend to bridge the two.",
          "It is not required to play. Catching, XP and challenges are free, and a player who never touches the token still generates the arrivals a publisher is paying for.",
          "It does not gate placement behind a minimum holding. Staking buys priority when campaigns compete, not the right to publish at all.",
        ],
      },
    ],
  },
  {
    id: "revenue",
    index: "10",
    eyebrow: "Business model",
    title: "How the protocol earns, and from whom",
    blocks: [
      {
        kind: "p",
        text: "A whitepaper that describes a token and not a business is describing half a system. There are two revenue lines and they come from opposite sides of the network, which is deliberate: neither side alone would keep it running.",
      },
      { kind: "h", text: "Placement, paid by publishers" },
      {
        kind: "p",
        text: "The primary line. A publisher funds the rewards and pays a placement fee on top, weighted by how much ground the asset holds, for how long, and how contested that ground is. This is the fee that scales with the value the network creates, because it is charged against the thing publishers are actually buying, which is arrival.",
      },
      { kind: "h", text: "The pass and the shop, paid by players" },
      {
        kind: "p",
        text: "Optional, and bounded on purpose. A seasonal pass runs for ninety days and tilts spawn weighting towards rarer coins, with a weekly rare claim and a boost included. Individual boosts are sold separately: a rare boost, a spawn magnet, an XP multiplier, or a bundle of all three.",
      },
      {
        kind: "specs",
        rows: [
          { label: "SeekAR Pass", value: "€8.99 per 90-day season" },
          { label: "Rare boost, spawn magnet", value: "€1.99 each, 30 minutes" },
          { label: "XP boost", value: "€0.99, 30 minutes" },
          { label: "Boost bundle", value: "€4.99, one of each" },
        ],
      },
      {
        kind: "callout",
        text: "Core catching, XP, challenges and platform achievements stay free, permanently. A paid tier that gates the loop would break the only thing publishers are buying, which is people turning up.",
      },
      { kind: "h", text: "Why the split is the right shape" },
      {
        kind: "p",
        text: "Player spending is elastic, seasonal and capped by how much a person will pay for a hobby. Publisher spending is a marketing line item, judged against a cost per arrival that has a real alternative to be compared with. The first keeps the lights on early, when there are more players than campaigns. The second is what the business becomes, and it only works if the first never degrades into pay-to-win, because a network of paying players who all catch everything reports arrivals that are worth nothing to the venue.",
      },
    ],
  },
  {
    id: "governance",
    index: "11",
    eyebrow: "Governance",
    title: "Who decides the numbers",
    blocks: [
      {
        kind: "p",
        text: "This protocol has an unusually large number of tunable constants: radius bounds, confidence thresholds, placement fee weighting, the share of fees returned to seekers, and the catch ladder itself. Each of them is a policy decision dressed as a configuration value, and pretending otherwise is how protocols end up governed by whoever last edited a file.",
      },
      { kind: "h", text: "The staged position, honestly stated" },
      {
        kind: "p",
        text: "Governance is not live. Parameters today are set by the core team and changed through migrations that are recorded and reviewable. We are not going to describe that as decentralised, because it is not.",
      },
      {
        kind: "p",
        text: "The reason for the delay is not reluctance. Voting on an economy with no volume is theatre: turnout is low, a handful of holders decide, and the decisions being made are about parameters nobody has enough data to judge. Governance becomes meaningful when there is real fee flow, because then a parameter change has a measurable consequence someone can argue about.",
      },
      { kind: "h", text: "What will be governed, and what will not" },
      {
        kind: "list",
        items: [
          "**Governed**: fee weighting, the seeker share of protocol fees, treasury allocation, radius bounds, and the confidence thresholds available to high-value assets.",
          "**Governed with a delay**: anything that changes the value of assets already placed. A campaign funded under one fee schedule should finish under it.",
          "**Not governed**: the privacy commitments in chapter thirteen. Retention limits and the refusal to publish movement data are not parameters, and a vote is not a legitimate way to weaken them.",
          "**Not governed**: individual claim outcomes. A refused claim is a matter for dispute resolution, not a ballot.",
        ],
      },
      {
        kind: "callout",
        text: "A governance system that can vote away its own users' privacy is not a safeguard, it is an attack surface with a quorum.",
      },
    ],
  },
  {
    id: "security",
    index: "12",
    eyebrow: "Risk",
    title: "Attacks, limits, and what we do not claim",
    blocks: [
      {
        kind: "p",
        text: "A protocol that pays people for being somewhere invites people to lie about being somewhere. Being specific about the attacks is more useful than asserting the system is secure.",
      },
      { kind: "h", text: "Attacks we defend against" },
      {
        kind: "list",
        items: [
          "**GPS spoofing**, mitigated by requiring the radio environment and motion trace to corroborate the fix, and by device attestation that detects tampered OS builds.",
          "**Sybil farming**, mitigated by the physical cost of travel and by per-device claim limits within a radius and time window.",
          "**Relay attacks**, where a real device at the location signs for a remote user, mitigated by binding attestation to the app instance and the session, and by rate-limiting claims per device.",
          "**Emulator farms**, mitigated by attestation, which emulators fail, and by motion traces that are statistically distinguishable from real walking.",
          "**Client-declared spawns**, prevented rather than mitigated: only the server announces what exists and where, so a modified client can lie about what it sees and gain nothing.",
          "**Double claims**, prevented by taking a lock before the claim is evaluated, so two people reaching for the last unit cannot both be told they got it.",
        ],
      },
      { kind: "h", text: "Limits we accept" },
      {
        kind: "p",
        text: "A sufficiently determined attacker with modified hardware and physical presence at one location can extract more value from that location than an honest user would. We bound the damage with per-location caps rather than pretending it is impossible. Indoor positioning remains materially less accurate than outdoor, so indoor assets use wider radii and lean harder on radio fingerprinting. And no consumer device can prove a human rather than a device was present: a phone in a delivery van still moves like a phone in a pocket.",
      },
      { kind: "h", text: "Risks that are not attacks" },
      {
        kind: "list",
        items: [
          "**Platform dependency**. Attestation is Apple's and Google's to give. A policy change at either could weaken the strongest signal in the stack overnight, and there is no version of this that routes around the operating system.",
          "**Chain availability**. A halted chain means queued claims. The protocol retries rather than drops, but a person standing in the street does not experience a retry as success.",
          "**Physical safety**. Rewarding people for going places puts people in places. Assets are placed at road junctions rather than inside building footprints, high-value drops avoid private property, and the app carries a safety notice. This is a design constraint, not a disclaimer.",
        ],
      },
      {
        kind: "callout",
        text: "We are building an economic deterrent, not a cryptographic guarantee. Where the two are confused, users get hurt.",
      },
    ],
  },
  {
    id: "privacy",
    index: "13",
    eyebrow: "Privacy",
    title: "Location data is the most sensitive data there is",
    blocks: [
      {
        kind: "p",
        text: "A record of where someone goes reveals their home, their work, their health, their religion and their relationships. Building a network on location claims means accepting responsibility for that, and the responsible design is to hold as little of it as possible.",
      },
      {
        kind: "list",
        items: [
          "Continuous tracking is never required. The app asks for a position when you attempt a claim, not in the background.",
          "Raw sensor and radio data is used to score a claim and then discarded on a short retention clock.",
          "What is written on-chain is that a claim at a public coordinate succeeded, the same information as a shop knowing someone redeemed a voucher.",
          "Your movement history stays on your device. The protocol does not need it and does not want it.",
          "Publishers receive aggregate counts, never individual traces.",
        ],
      },
      { kind: "h", text: "The problem we have not solved" },
      {
        kind: "p",
        text: "Because claim records are public and permanent by nature of the chain, a determined observer can correlate claims made by the same wallet across locations. That is a genuine weakness and it is inherent to settling on a public ledger. Users who want to avoid it should use separate wallets for separate contexts, and the app makes that easy rather than burying it, but a default that requires the user to know about the problem is not a fix.",
      },
      {
        kind: "callout",
        text: "The honest summary: we minimise what we hold, we do not sell what we hold, and there is one correlation attack against the public record that we can reduce but not eliminate.",
      },
    ],
  },
  {
    id: "compliance",
    index: "14",
    eyebrow: "Jurisdiction",
    title: "Regulation, and where this sits",
    blocks: [
      {
        kind: "p",
        text: "Three regimes touch this protocol at once, which is unusual and worth being explicit about rather than leaving to a footnote.",
      },
      { kind: "h", text: "Data protection" },
      {
        kind: "p",
        text: "Location is special category adjacent under most modern data protection law, and the protocol is built to the strictest reading rather than the most convenient one. Position is collected for a stated purpose at the moment of a claim, retained only as long as scoring and dispute resolution require, and never combined into a movement profile. Where a regime grants deletion rights, the off-chain record can be deleted; the on-chain claim record cannot, which is a limitation of the ledger and is disclosed rather than glossed.",
      },
      { kind: "h", text: "Token classification" },
      {
        kind: "p",
        text: "$SEEK is designed as a utility and coordination asset, and the utility described in chapter nine is real rather than decorative. That is a design position, not a legal conclusion. Classification differs by jurisdiction, changes over time, and is not something a whitepaper can settle by asserting it. Availability is therefore restricted where local rules require it.",
      },
      { kind: "h", text: "Rewards, chance and the line into gambling" },
      {
        kind: "p",
        text: "The catch involves a roll, which puts it near a line that varies by country. Two properties keep it on the right side in most regimes and are held deliberately: participation costs nothing, and the paid items adjust odds and rates rather than being wagers with a variable payout. A pass buys weighting and a boost buys a multiplier; neither is a stake that can be lost. Where a jurisdiction reads it differently, the paid tier is withheld rather than argued with.",
      },
      {
        kind: "specs",
        rows: [
          { label: "Off-chain personal data", value: "Deletable on request" },
          { label: "On-chain claim record", value: "Permanent, disclosed as such" },
          { label: "Age gate", value: "Applied at signup, enforced for paid items" },
          { label: "Paid items", value: "Withheld in jurisdictions that classify them as wagers" },
        ],
      },
    ],
  },
  {
    id: "roadmap",
    index: "15",
    eyebrow: "Direction",
    title: "What is built and what is next",
    blocks: [
      {
        kind: "p",
        text: "SeekAR is live on iOS and Android with location-based drops, AR rendering and the social wallet. The verification stack currently runs the GNSS, attestation and motion-continuity signals; radio fingerprinting is in staged rollout. Attestation is enforced behind a flag, which is the honest state of it: the refusal path is built and the enforcement switch has not been thrown for every surface.",
      },
      {
        kind: "p",
        text: "The drag-and-drop campaign builder is built. Next is the self-serve business portal that opens placement beyond managed partnerships, and the arrival analytics that go with it. Alongside that sit the token generation event, live event mode, seasons and object scanning. Governance follows once there is enough real fee flow for parameter decisions to be meaningful, for the reasons set out in chapter eleven.",
      },
      { kind: "h", text: "What we are not promising" },
      {
        kind: "list",
        items: [
          "A date for governance. It is gated on volume, and volume is not a date.",
          "Indoor accuracy parity. It is a hard problem and the honest answer is wider radii indoors for the foreseeable future.",
          "A cross-chain deployment. The latency and cost requirements in chapter five are narrow, and a second chain that does not meet them would be a marketing decision rather than a technical one.",
        ],
      },
      {
        kind: "p",
        text: "The full phase-by-phase breakdown lives on the roadmap page, which is kept current as things ship.",
      },
    ],
  },
  {
    id: "glossary",
    index: "16",
    eyebrow: "Reference",
    title: "Glossary",
    blocks: [
      {
        kind: "p",
        text: "Terms used throughout this document, with the meaning they carry here rather than the one they carry in general.",
      },
      { kind: "glossary" },
    ],
  },
];

/** ⚠️ PLACEHOLDER: replace with the real distribution before publishing. */
export const TOKENOMICS = [
  { label: "Community rewards", value: 34, color: "#5d74f9", note: "Earned by seekers through collection and quests" },
  { label: "Ecosystem & partners", value: 20, color: "#e341f9", note: "Campaign subsidies, venue onboarding, integrations" },
  { label: "Team & contributors", value: 16, color: "#8f5cf7", note: "4-year vest, 12-month cliff" },
  { label: "Treasury", value: 14, color: "#4fd1e0", note: "Governed reserve for protocol development" },
  { label: "Liquidity", value: 10, color: "#7fe7d4", note: "Exchange and on-chain market depth" },
  { label: "Early backers", value: 6, color: "#a8b0c8", note: "2-year vest, 6-month cliff" },
];

/** ⚠️ PLACEHOLDER: replace with the real token facts. */
export const TOKEN_FACTS = [
  { label: "Ticker", value: "$SEEK" },
  { label: "Chain", value: "Solana (SPL)" },
  { label: "Total supply", value: "1,000,000,000" },
  { label: "Emission", value: "Fixed, no further minting" },
];

/**
 * ⚠️ PLACEHOLDER — replace with the real schedule before publishing.
 *
 * `unlockAtTge` is the share of that allocation liquid at launch, `cliff` the
 * months before anything further moves, and `vest` the months it takes to
 * release the rest linearly after the cliff.
 */
export const VESTING = [
  { label: "Community rewards", share: 34, color: "#5d74f9", unlockAtTge: 0.08, cliff: 0, vest: 48 },
  { label: "Ecosystem & partners", share: 20, color: "#e341f9", unlockAtTge: 0.1, cliff: 3, vest: 36 },
  { label: "Team & contributors", share: 16, color: "#8f5cf7", unlockAtTge: 0, cliff: 12, vest: 48 },
  { label: "Treasury", share: 14, color: "#4fd1e0", unlockAtTge: 0.05, cliff: 6, vest: 36 },
  { label: "Liquidity", share: 10, color: "#7fe7d4", unlockAtTge: 1, cliff: 0, vest: 0 },
  { label: "Early backers", share: 6, color: "#a8b0c8", unlockAtTge: 0, cliff: 6, vest: 24 },
];

export const GLOSSARY = [
  {
    term: "Proof of location",
    definition:
      "The claim that a device was inside a given radius during a given window, scored across several independent signals and credible enough to release value on. Probabilistic, never absolute.",
  },
  {
    term: "Confidence score",
    definition:
      "The combined result of scoring a claim's signals. Each asset sets the score it requires, so a quest reward and a ticketed drop can share a verifier and not share a bar.",
  },
  {
    term: "Claim radius",
    definition:
      "The distance from an asset's coordinates within which it can be taken. Default 30 m, configurable from 5 m to 500 m, and the single biggest lever a publisher has over both cost and meaning.",
  },
  {
    term: "Drop",
    definition:
      "An asset placed at coordinates, waiting to be claimed. Carries a quantity, a window, a confidence threshold and a radius.",
  },
  {
    term: "Spawn",
    definition:
      "A drop as the game presents it: announced by the server, visible on the map, expiring within the hour, and worth two catch attempts.",
  },
  {
    term: "Attestation",
    definition:
      "A signed statement from the operating system that the app is genuine and the device untampered. Play Integrity on Android, App Attest on iOS. The strongest signal in the stack and the one the protocol does not control.",
  },
  {
    term: "Radio fingerprint",
    definition:
      "The set of Wi-Fi networks and cell towers visible from a position, matched against what should be visible there. Slow to change and hard to fabricate, which is what makes it useful.",
  },
  {
    term: "Motion continuity",
    definition:
      "The accelerometer trace between one confirmed position and the next. Catches the claim that teleports, because moving 400 km in 90 seconds leaves no matching motion profile.",
  },
  {
    term: "Verified arrival",
    definition:
      "A claim that met its threshold inside a publisher's radius. The unit a publisher buys, and the reason the cost figure on a campaign is counted rather than modelled.",
  },
  {
    term: "Placement fee",
    definition:
      "What a publisher pays to hold ground, weighted by radius, duration and demand for the area. Distinct from the reward, which is what the seeker receives.",
  },
  {
    term: "Cold streak",
    definition:
      "The pity timer. Two points of catch chance per consecutive miss, capped at twelve, applied to the retry as well as across coins.",
  },
  {
    term: "Streak penalty",
    definition:
      "The opposite lever. Four points off per consecutive success on the same coin, capped at twenty, so a single spawn point gets worse to farm rather than better.",
  },
  {
    term: "Seeker",
    definition:
      "A person who walks to assets and claims them. Also the first of ten player levels, the last being Legend.",
  },
  {
    term: "$SEEK",
    definition:
      "The settlement and coordination asset. Funds campaigns, pays placement fees, buys placement priority through staking, and carries the governance vote once governance is live.",
  },
];
