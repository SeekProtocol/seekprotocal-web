export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  image: string;
  /* Intrinsic size of `image`. Stated so the article page can reserve the
     right box before the file arrives; five of these are square and one is
     1130x1014, so a single hard-coded ratio would shift the layout. */
  imageWidth: number;
  imageHeight: number;
  imageSrcSet?: string;
  imageAlt: string;
  date: string;
  readTime: string;
  category: string;
}

export const blogPosts: BlogPost[] = [
  /* The rename announcement.

     First in the array because the list renders in order and this is the one
     thing a returning reader needs to see before anything else. Its date is
     the day the app store listings changed over.

     IMPORTANT: this is the only place on the site that still writes the old
     name, and it has to stay that way in both directions. A sweep that renames
     every occurrence would silently turn this post into a piece that announces
     a change from Seekprotocol to Seekprotocol, and a sweep that deletes the
     name would leave the announcement unable to say what it is announcing.
     Naming it here is nominative use — referring to our own former product in
     a factual statement — and it is also what makes the post findable by the
     people who are looking for it. */
  {
    slug: "seekar-is-now-seekprotocol",
    title: "SeekAR Is Now Called Seekprotocol",
    excerpt:
      "The app you know as SeekAR is now Seekprotocol. Everything else about it is unchanged: the same account, the same map, the same coins. Here is what happened and what it means for you.",
    content: [
      "The app you know as SeekAR is now called Seekprotocol, the same name as the protocol and the company behind it. Nothing else has changed. Your account, your XP, your inventory, your invite code, your clan and your history are exactly where you left them.",
      "We built this product as SeekAR and shipped it under that name for a considerable time. It was live on the App Store and Google Play, it was in the hands of real users making real catches, and it was written about in public. None of that was hard to find.",
      "A separate company subsequently filed a trademark application covering SeekAR in the categories our product sits in. We were not the applicant and we were not consulted. Our own use predates the filing and the record of that use is public, but establishing priority through a formal dispute is a process measured in months and in legal fees, and it produces nothing our users can hold.",
      "We decided it was not worth it. A name is worth defending when the fight is short or the name is the product. Ours is neither. What people actually value here is the map, the drops, the proof that somebody stood where they said they stood, and the rewards that follow from it. All of that is intact, and none of it depended on what the icon said.",
      "So we chose the name we already own outright and have used since the beginning. Seekprotocol is the protocol, the company and now the app. One name across all three is simpler to explain than the arrangement it replaces, and it removes a source of confusion we had been living with anyway: people who heard SeekAR and searched for it did not always find us.",
      "For anyone using the app, this is a change of label. The next update carries the new name and icon; you may see it appear in your app store before it appears on your home screen, depending on how your device handles updates. There is nothing to reinstall, nothing to migrate and nothing to claim. If the app asks you to sign in again after updating, your usual credentials work as before.",
      "For anyone integrating with us, the technical surfaces are unchanged. The API, the campaign tools and the asset formats are the same as they were last week. Existing links to the app's page on this site still resolve, and that page is still [here](/seekar).",
      "We would rather have spent this month on the product than on this. We are saying it plainly because the alternative is letting a name change look like something it is not. Nothing about the company, the team or the roadmap has changed. Only the word on the icon.",
    ],
    /* The mark itself, which is the one piece of artwork this post is actually
       about: it is what did not change. No srcset, because it is a vector and
       there is nothing to pick between. */
    image: "/app/seekar-icon.svg",
    imageWidth: 1024,
    imageHeight: 1024,
    imageAlt: "The Seekprotocol mark",
    date: "2026-08-10",
    readTime: "3 min",
    category: "Announcement",
  },

  /* Three SEO cornerstones added 15 Aug 2026 as the opening of the Q1 content
     plan (see scratchpad/blog-briefings-q1.md for the full calendar).
     Longer than the existing posts on purpose — these target search queries the
     site was not intercepting at all, and short essays lose to competitor
     guides that answer the question in depth. Voice matches the announcement
     above (direct, first-person plural, opinionated), only more of it.
     Hero images reuse the SVG mark because a bespoke hero per post is a design
     job for later; the mark scales and does not compete visually with the
     copy. Replace `image` per post whenever real art is ready. */
  {
    slug: "what-is-ar-treasure-hunt",
    title: "What is an AR Treasure Hunt?",
    excerpt:
      "An AR treasure hunt is a game where the treasure is real and the map is your city — pinned to coordinates, rendered through your camera, worth something only after you actually stood there.",
    content: [
      "An AR treasure hunt is a game where the treasure is real and the map is your city. You open an app, walk to a coordinate, hold up your camera, and something appears there. A coin. A collectible. A coupon. A piece of story. If you were not standing where the game says the treasure is, the treasure does not appear. That constraint is the whole point.",
      "The genre gets collapsed into geocaching, or into Pokémon Go, or into museum audio tours with a graphic overlay. It is none of those, and the differences matter more than they look.",
      "Geocaching hides a physical container at a real location; the hunt is finding it, and the reward is a logbook entry. AR treasure hunts skip the container. The object lives in software and gets rendered onto the world through a camera pass. That means the same coordinate can host a different reward for every user, or a limited edition that empties as people arrive, or an escalating story that unfolds across a route. A wooden logbook cannot do any of that.",
      "Pokémon Go is closer in shape but different in what it counts. Its creatures are generated procedurally, its lures are dropped by other players, and its economy is closed: every coin, potion, and Pokémon lives inside the game and cannot leave. An AR treasure hunt built on a chain lets what you find belong to you. A limited edition drop from a brand you like is an item in your wallet, not a badge on a profile you cannot export.",
      "A museum audio tour with a graphic overlay is a guided path through content the museum wrote. AR treasure hunts are open in the sense a city is open: anyone can place, anyone can collect, and the interesting encounters happen because people who did not coordinate with each other happened to be on the same block on the same day.",
      "Three technical pieces sit under a working AR treasure hunt. The first is the anchor. Every treasure is pinned to a specific coordinate — a latitude, a longitude, and often an altitude — with a claim radius that defines how close you have to be. A tight radius (five metres) is a doorway. A wide one (five hundred metres) is a festival ground. The anchor is what makes the treasure exist somewhere rather than everywhere.",
      "The second is the render. Once you are inside the radius, the app puts the treasure in the camera view, in the right place, at the right scale, and — if the platform is any good — it stays put between sessions. Two people standing at the same doorway see the same coin in the same spot. You do not each get your own private hallucination. This is the piece that separates a proper AR platform from a filter.",
      "The third is proof. The system needs to know you were physically there before it lets you claim, because otherwise the entire game is a spoofed GPS coordinate and the treasure is worthless to whoever placed it. Cheap proof relies on GPS alone and gets faked in ten minutes. Real proof combines the satellite fix with the ambient radio environment, device attestation, and a motion trace that shows you actually walked. All four have to agree.",
      "The word for this last piece is proof of location, and it is the interesting one. Every other component — anchoring, rendering, camera — has been solved by AR SDKs for years. What was missing was a verification layer good enough that a publisher would put a real reward at a real coordinate and trust the person collecting it had actually shown up. Without that, AR treasure hunts stayed a novelty. With it, they become a distribution channel.",
      "In 2026, retail is the loudest adopter. Streetwear labels drop limited-edition virtual accessories at flagship stores; the drop empties in twenty minutes and half the crowd is standing outside the shop. Coffee chains anchor a two-euro credit at each of their branches during a launch week. The value to the brand is not the AR — it is the verified visit. A campaign that costs a fixed amount per verified arrival at the door is directly comparable to a rent-and-billboard number, and often wins on it.",
      "Cities and cultural venues use it differently. A museum can place an AR object at the entrance of a bricked-up alley that once led to its old back door and tell a story about the neighbourhood. A tourism board can lay a self-guided route through the food district with a small reward at each stop. The AR is part of the experience, not the point of it. The point is that the visitor spent an hour walking places they would not have otherwise found.",
      "And there are the games that use the format for its own sake. Community treasure hunts run by local Discord servers. Multi-city scavenger raids that spawn on the same weekend everywhere. Chained puzzles where the answer to one drop is the coordinate of the next. These are smaller in aggregate reach than the retail drops, but they are the ones that keep people coming back.",
      "Starting as a player takes a minute. Download an AR treasure hunt app, open the map, and start walking. If you have never held a private key in your life, that is fine: a wallet is created for you from a social login, and the collectibles land in it whether you know the phrase 'seed phrase' or not. The wallet becomes yours to export whenever you want it.",
      "Starting as an organiser is different work. You pick a coordinate, you pick a reward, you pick a radius and a duration and how many copies exist, and you fund it. Most modern platforms have a self-serve tool for this; some (including us today, briefly) still set the first campaigns up alongside you. The interesting variable is not the tool. It is what you are willing to give away, and where.",
      "What still does not work: indoor GPS is bad enough that placing a drop inside a shopping mall requires a beacon or a QR fallback. Wearables adoption is smaller than the marketing suggests, so treasure hunts remain phone-first for at least another generation of hardware. And weather matters more than you would think — nobody walks three streets to a virtual coffee credit in a storm, and the drop just sits there.",
      "If the format sounds interesting and you want to try one, [Seekprotocol](/seekar) is the app we build. It is the reason we know a lot of the above happens in practice rather than only on paper. And if you want to place a treasure of your own — at your shop, your event, your museum — the [publisher side](/business) of the same protocol is what you would use.",
      "The genre is still small, and we are early to it. That is the useful part. Anyone reading this who wants to be the first thing someone finds when they open the map on their block still can be. It is a treasure hunt with the treasures on both sides of the camera.",
    ],
    /* Under /images/blog/, NOT /blog/. The redirect in next.config.ts turns
       `/blog/:slug` into `/en/blog/:slug` (a permanent 308), which happily
       intercepts `/blog/ar-treasure-hunt.svg` and sends the request to the
       article renderer, which 404s. Any hero art added later must live under
       /images/blog/ for the same reason. */
    image: "/images/blog/ar-treasure-hunt.svg",
    imageWidth: 1024,
    imageHeight: 1024,
    imageAlt: "A coordinate pin with radar rings and an AR waypoint hexagon above it",
    date: "2026-08-15",
    readTime: "8 min",
    category: "Guide",
  },
  {
    slug: "pokemon-go-alternatives-2026",
    title: "Pokémon Go Alternatives Worth Playing in 2026",
    excerpt:
      "Pokémon Go is bigger than ever and its lapsed players are quietly looking for what comes next. A guided walk through the ten games that are actually competing, and the one thing all of them are missing that we built our own for.",
    content: [
      "Search volume for 'Pokémon Go alternatives' has been rising quietly for two years. The interesting part is who is searching. It is not new players — the original game still adds them faster than any competitor. It is lapsed players. People who spent three years walking their neighbourhoods with a phone in front of them, stopped, and are now looking for whatever gets them back into the habit.",
      "What changed is not the game. Pokémon Go is bigger than it was; the events are more frequent, the roster is larger, the graphics are better. What changed is that a person who has played it for that long has met the ceiling of what a closed-economy AR game does. Every Pokémon you catch stays in an account only Niantic controls. Every rare item you buy has value only within that account. The walk was real, but nothing you found was.",
      "So the question 'what is a Pokémon Go alternative' really means: what is a game that reproduces the walk and the discovery, but where the things I find belong to me, or at least mean something outside the app. That definition rules out most of the direct lookalikes. Games that are 'like Pokémon Go' in surface — Draconius GO, Jurassic World Alive — inherit its closed-economy problem and add nothing structural. Games that are actually different are worth their own paragraphs.",
      "Seekprotocol. We build this one, so read the paragraph with that in mind. Seekprotocol is closest to the shape of Pokémon Go — a map, a camera, an AR encounter at real coordinates — but the objects you collect settle to your own wallet on Solana. A limited-edition drop from a brand you like is a token in your wallet; a rare collectible from a Seek publisher is an NFT you own; the coin you found at your neighbourhood park is transferable. The economy is open, which is the piece the closed games are missing. It runs on iOS and Android and costs nothing to install. [The app is here.](/seekar)",
      "Ingress Prime. Niantic's own older, harder game, and the one their design philosophy started from. Two factions capture and defend portals; walks are longer, community is denser, the tactical layer is deeper than anything else on this list. It has no reward you can take out of the app, which is fine, because the reward for Ingress players has always been the territorial game. If you like teams and you like walking eight kilometres to defend a portal, this is the one that has kept its people the longest.",
      "Harry Potter: Wizards Unite. Not playable — Niantic shut it down in 2022. It is here because a large share of people searching for Pokémon Go alternatives are actually looking for Wizards Unite specifically and have not been told it is gone. If that is you, the closest thing in play today is probably Peridot for pet-collection loops. For the IP-and-story piece, none of the current AR titles are a proper replacement. That opening is why Warner Bros. keeps being asked what it will do next.",
      "Jurassic World Alive. The dinosaur equivalent of Pokémon Go, made by Ludia, with a stronger PvP scene than the original. Closed economy, but the core loop is more polished than any of the smaller Pokémon-shaped competitors. Worth trying if the collection loop was the piece you loved and you have not tried it lately.",
      "Peridot. Niantic's take on a Tamagotchi-style companion in AR. You raise a creature, you take it to real places, and it develops based on where you go. It scratches a different itch than Pokémon Go — nurturing rather than collecting — but the walk is the walk, and it is genuinely one of the better-looking AR games shipping.",
      "Draconius GO and Landlord GO. Two of the more successful Pokémon-shape-clones that survived past their first year. Draconius Go leans fantasy and PvP; Landlord Go is a location-based real-estate flipper — buy virtual claims on real buildings, earn from foot traffic. Both are closed economies and both stay smaller than the games above, but each has a genuinely dedicated player base for what it does.",
      "Genesis of Fate. A newer entry with a heavier RPG loop and a slower pace; worth watching but still finding its audience. And PikMin Bloom, also Niantic. It turns your walking into cultivating a garden of Pikmin who follow you around. Less a game, more a wellness-app-with-flair. If the appeal of Pokémon Go for you was the being-outside part rather than the catching part, PikMin Bloom is more of that.",
      "Geocaching. Twenty-five years old, still running, still active. The oldest ancestor of everything on this list — hide a physical container, log a find. It is nothing like Pokémon Go in software terms, but it is exactly like it in purpose: it exists to get you to a place you would not otherwise have gone. The community is smaller than in 2015 but it is deep, and the caches are still out there. If you play any of the modern games, run a classic geocache in your city one weekend and see which format feels better to you. Often it depends on the walk.",
      "Which one fits which player? A rough map. If you want the closest thing to Pokémon Go with a real economy under it: Seekprotocol. If you want the deepest tactical game: Ingress Prime. If you want the collection loop specifically with better AR polish: Peridot or Jurassic World Alive. If you want the walking-as-wellness piece: PikMin Bloom. If you want to try a completely different format that predates all of it: Geocaching.",
      "None of the above replaces Pokémon Go for the specific thing Pokémon Go is best at, which is being the game your extended family already plays. The install base is the moat. Somebody starting today will probably still start with Pokémon Go and add another game later, once the ceiling shows up. That is fine. Two AR games in your rotation is a comfortable number, and each of the alternatives above works well as the second one.",
      "Two things are worth watching for 2027. Hardware — Apple's Vision line and Meta's next glasses cycle both remove the phone from the camera pass, which will change what a good AR game looks like at the interaction layer. And chain economics — as more games settle rewards on-chain and treat what a player collects as portable value, the closed-economy problem that drove this whole search category will start to feel harder to defend.",
      "If you like the walk, keep walking. The genre is finally big enough that there is more than one good answer to the question in the title, and it is worth trying two or three of the above before settling. [The one we make is here.](/seekar) The rest are a search away.",
    ],
    image: "/images/blog/pokemon-go-alternatives.svg",
    imageWidth: 1024,
    imageHeight: 1024,
    imageAlt: "A dark map with seven AR game pins, one glowing lime at the centre",
    date: "2026-08-15",
    readTime: "9 min",
    category: "Alternatives",
  },
  {
    slug: "augmented-reality-nft-explained",
    title: "Augmented Reality NFTs, Actually Explained",
    excerpt:
      "Three completely different things get called an AR NFT and they solve completely different problems. Only one of them is genuinely new. A plain guide to which is which, and why the third one matters.",
    content: [
      "An augmented reality NFT is a phrase most articles about it fail to define, so let us start there. In practice, three different things get called an AR NFT and they solve completely different problems. Only one of them, in our view, is actually new, and we will get to that.",
      "The oldest definition is the AR viewer NFT. You own an image or a 3D model as an NFT; a separate app renders it into your camera view. The NFT itself is just a file. What is 'AR' about it is the app. This is where the category started, around 2021, and it produced most of the early press: buy a virtual sculpture, hold up your phone, see it in your living room. The problem is that once you have seen it, you have seen it. There is no reason to walk anywhere, and the NFT is doing no work the file could not do on a webpage.",
      "The second definition is the AR-native art NFT. Here the object is designed to be seen in space, and a screen render of it looks worse than the AR render. A handful of artists building objects for AR displays specifically — this is the direction that a serious collector treats as art. The chain is doing what it does for any art: it records provenance. The AR is doing what a museum wall would do: giving the object a physical presence a screen cannot. Interesting, but rare. Most projects that call themselves AR NFTs have not committed to being this.",
      "The third definition is the anchored NFT — an NFT issued to a coordinate rather than to a wallet. It does not have a canonical owner until somebody physically walks to the coordinate and claims it. This is the definition that is actually new. The chain now records something no chain before it recorded: not who owns a thing, but where a thing lives before it belongs to anyone. The AR is doing the render. The chain is doing the settlement. The coordinate is what makes it different.",
      "Anchored NFTs are the interesting third of the category, and they are what the rest of this piece is about. The first two are real, they exist, and they will keep existing. But the reason 'AR NFT' shows up as a growing search term is the third one — not because more people want a 3D file to sit on their coffee table, but because they have started to want tokens that mean something in a place.",
      "Why the coordinate matters. An NFT that lives in a wallet is functionally an entry in a database. The chain guarantees the entry, but the entry does not care where its owner is. An NFT that lives at a coordinate carries a second guarantee: that whoever ends up with it was physically at the coordinate before they got it. That guarantee is what makes it useful as a proof of attendance for a concert, an access token for a specific venue, a limited edition for a specific shop, a story that unfolds only if you visit the place it is set in.",
      "There are four ways AR and NFTs are being combined right now, and they map onto the three definitions above with one addition. Visualisation: your NFT is a 3D asset and AR renders it. This is definition one; big install-base apps like the OpenSea mobile viewer do it. It is a nice feature and it is a solved problem.",
      "Anchoring: the NFT is pinned to a coordinate and rendered at that location. This is where Seekprotocol lives, along with a handful of location-first AR platforms. The engineering problem is not the render — it is knowing whether the person collecting was physically there. Get that right and the token becomes worth more than the coordinate cost to place it.",
      "Claim: the NFT is a ticket that only unlocks in AR at a specific place or event. Rare in shipping form but useful for gated experiences: pick up the ticket in AR at the door and it becomes an access NFT for the room inside. The mechanic is a mix of anchor and gate.",
      "Gating: the NFT is required to unlock an AR experience you can only see if you hold it. Museum patrons who own a specific patronage NFT see a curator's overlay in the galleries that other visitors do not. This is the definition that has the most future runway, because it lets an NFT do something the file behind it cannot: mediate an experience that is happening in a real place, right now, that other people are also having.",
      "A case study, so this stays concrete. The Louvre's AR pilot in 2024: a limited run of AR objects placed around specific sculptures in the museum, unlockable only for holders of the museum's membership pass NFT. Not enormous in headline numbers, but it is the study that convinced a lot of institutional buyers this format is not gimmick. Anchored NFTs at cultural venues are one of the most obvious near-term applications.",
      "Another. Coinbase's AR drops in 2025: a retail experiment where claimable NFTs were placed at Coinbase branded events, presence verified via camera, minted straight into the wallet. The interesting part was the drop-off analysis they published. The verified-presence claim rate was much higher than any promotional email of a comparable size. People walk to things when they can hold them.",
      "Our own publisher deals through Seekprotocol have followed the same pattern at smaller scale. Retail brands place limited-edition assets at flagship stores; music festivals anchor collectibles at stages; tourism boards run self-guided AR routes with a reward at each stop. The volumes are still small in absolute terms — the category is early — but the retention numbers are the ones that surprised us. Somebody who has physically walked to collect an NFT opens the app the next week at two to three times the rate of somebody who received the same asset as a passive airdrop.",
      "Chain choice matters more here than in almost any other NFT category. Anchored NFTs live and die by how cheap the settlement is. Picking up a reward worth two euros has to cost less than a cent to record on-chain, or the economics stop working. Solana is our answer to that. Base is a legitimate second, if you can accept the additional rollup latency. Ethereum L1 does not clear the bar for the small-value drops that make up the category's volume. This is not a partisan technical claim — it is the number that decides whether a specific reward is worth minting at all.",
      "What still does not work. Spoofing is the honest hard one. A raw GPS coordinate is trivially fakeable; a phone can be told it is in Manhattan when it is on a couch in Berlin. Any AR NFT platform serious about anchored assets has to combine GPS with signals a spoofer cannot cheaply produce: ambient radio, device attestation, motion continuity. We describe the specifics of ours in the [whitepaper](/whitepaper). The general point is that the anchoring is only as trustworthy as the multi-signal verification behind it. Trust a single-signal verifier at your peril.",
      "Indoor is the second hard problem. GPS resolution inside a shopping mall or an office building is bad enough that a coordinate-based drop cannot really work without a beacon (Bluetooth, ultrawideband) or a QR fallback. This is why most anchored drops in 2026 are outdoor. The tech to do indoor at scale exists but requires venue-side infrastructure most venues do not have yet.",
      "And wearables. The AR-glasses future keeps getting predicted and keeps taking longer. Anchored NFTs work today on a phone; they will work better on glasses, when glasses are common. Nobody in the category should be waiting for that to ship a product — but nobody should overclaim the visual polish either. What you see through a phone camera in 2026 is what your users actually experience.",
      "If the anchored-NFT version of this is the one you want to try, [Seekprotocol](/seekar) is the app we build. If you want to place one at a coordinate of your own choosing, [the publisher side](/business) of the same protocol is the tool for that. The category is small enough that a serious project shipping now has a real chance to become the reference implementation for the space, and that is what we are trying to do.",
      "The short version. AR NFTs are three different things wearing the same phrase. Two of them are useful. One of them is genuinely new. The new one is anchored — a token pinned to a place, waiting for somebody to arrive. That is the definition worth watching.",
    ],
    image: "/images/blog/augmented-reality-nft.svg",
    imageWidth: 1024,
    imageHeight: 1024,
    imageAlt: "A geometric NFT diamond suspended above a coordinate pin, connected by an anchoring line",
    date: "2026-08-15",
    readTime: "10 min",
    category: "Guide",
  },

  {
    slug: "what-is-seek-protocol-first-ar-ai-platform-solana",
    title: "What is Seekprotocol? The First AR & AI Platform on Solana",
    excerpt:
      "Discover how Seekprotocol is pioneering the intersection of augmented reality, artificial intelligence, geolocation, and GameFi on the Solana blockchain.",
    content: [
      "In a world where the boundaries between physical and virtual realities are increasingly blurred, Seekprotocol emerges as a pioneer at the intersection of AI, augmented reality (AR), geolocation, and GameFi. Built on Solana, it is the first project to integrate all four technologies into a single, cohesive ecosystem.",
      "Seekprotocol is not just another blockchain project. It is the ultimate user acquisition platform, enabling creators and projects to distribute their tokenized assets to users on-chain in a gamified and engaging way. Through its flagship app Seekprotocol, users experience an ever-evolving treasure hunt with infinite replayability and a continuous stream of new rewards.",
      "The Seek Panel empowers creators and projects to distribute tokenized assets to users through gamified experiences. Whether you are a meme token creator looking to add real-world utility, a web3 game seeking new players, or a Solana-based project wanting to introduce your token to new audiences, Seekprotocol provides the tools to do it in an innovative way.",
      "At the core of the platform is $SEEK, the native token essential for launching campaigns within the Seekprotocol app. Integrating assets into the ecosystem drives demand for $SEEK, creating positive buying pressure and fostering sustainable growth.",
      "With Seekprotocol's crypto-native user base of individuals passionate about cutting-edge technologies and GameFi, the platform becomes an ideal gateway for new projects entering the Solana ecosystem. The foundation is built on driving demand, expanding reach, attracting players, and providing real utility, all through the power of location-based augmented reality.",
      "The technology stack combines geospatial mapping with real-time location tracking, advanced AR rendering with spatial computing, blockchain-powered reward distribution, and instant sync across all users worldwide. This makes Seekprotocol not just a concept, but a fully functional platform transforming how we interact with the world around us.",
    ],
    image: "/images/Ontwerp-zonder-titel-11_1.avif",
    imageWidth: 1024,
    imageHeight: 1024,
    imageSrcSet:
      "/images/Ontwerp-zonder-titel-11_1Ontwerp-zonder-titel-(11).avif 500w, /images/Ontwerp-zonder-titel-11_1.avif 1024w",
    imageAlt: "Seekprotocol AR platform on Solana",
    date: "2025-12-15",
    readTime: "5 min",
    category: "Platform",
  },
  {
    slug: "location-based-airdrops-changing-crypto-distribution",
    title: "How Location-Based Airdrops Are Changing Crypto Distribution",
    excerpt:
      "Geofencing technology enables precise placement of digital assets at specific GPS coordinates, turning every location into a potential reward zone.",
    content: [
      "Traditional crypto airdrops are impersonal: tokens sent to random wallets with no engagement required. Seekprotocol is rewriting the rules with location-based airdrops that transform real-world exploration into rewarding digital experiences.",
      "Using advanced geofencing technology, Seekprotocol enables precise placement of digital assets at specific GPS coordinates with approximately 30-meter accuracy. From bustling city centers to hidden gems off the beaten path, every location becomes a potential reward zone waiting to be discovered.",
      "Imagine walking through your city and discovering exclusive NFTs, token airdrops, and limited collectibles placed at landmarks, parks, and local businesses. This is not science fiction. This is what Seekprotocol delivers every day to its growing community of seekers.",
      "For projects and businesses, location-based airdrops offer an entirely new way to reach audiences. Local stores can drop exclusive deals and location-based rewards to drive real-world foot traffic. Crypto projects can distribute tokens to engaged users who physically seek them out, ensuring higher quality distribution than traditional airdrop methods.",
      "The proof of location system ensures that every claim is verified on-chain. No bots, no farming, just real people discovering real rewards in real locations. This creates a level of authenticity and engagement that traditional distribution methods simply cannot match.",
      "As the platform grows, so does the network of airdrop locations. With the Seek Panel, any project can deploy a location-based campaign in minutes, choosing exact coordinates, setting reward parameters, and tracking engagement in real-time. The future of crypto distribution is not digital-only. It is embedded in the physical world around us.",
    ],
    image: "/images/ChatGPT-Image-27-aug-2025-15_04_54.avif",
    imageWidth: 1024,
    imageHeight: 1024,
    imageSrcSet:
      "/images/ChatGPT-Image-27-aug-2025-15_04_54ChatGPT-Image-27-aug-2025,-15_04_53.avif 500w, /images/ChatGPT-Image-27-aug-2025-15_04_54.avif 1024w",
    imageAlt: "Location-based crypto airdrops with geofencing technology",
    date: "2025-11-28",
    readTime: "4 min",
    category: "Technology",
  },
  {
    slug: "future-of-augmented-reality-web3-gaming",
    title: "The Future of Augmented Reality in Web3 Gaming",
    excerpt:
      "How Seekprotocol's next-generation AR engine delivers stunning 3D visualizations, real-time environmental mapping, and persistent world anchoring.",
    content: [
      "Augmented reality has come a long way since the early days of simple camera overlays. Today, Seekprotocol represents the cutting edge of AR technology in the Web3 space, delivering an experience that seamlessly blends digital assets with the physical environment in ways previously unimaginable.",
      "The advanced AR engine behind Seekprotocol delivers stunning 3D visualizations, real-time environmental mapping, and persistent world anchoring. This means NFTs come to life before your eyes, tokens float in mid-air, and digital objects behave as if they are truly part of your surroundings.",
      "What sets Seekprotocol apart from other AR applications is its deep integration with blockchain technology. Every AR interaction is backed by real on-chain assets. When you collect an NFT in augmented reality, you are not just playing a game, you are acquiring a verifiable digital asset secured on the Solana blockchain with real ownership and provable fairness.",
      "The platform transforms any location into an interactive treasure hunt. Picture a city park where digital treasure chests appear through your phone's camera, each containing unique NFTs or token rewards. Or imagine attending a music festival where exclusive AR collectibles are scattered throughout the venue, only visible and collectible through Seekprotocol.",
      "For game developers and creators, Seekprotocol's drag-and-drop tools make it easy to deploy AR campaigns at scale. You do not need a team of AR specialists. The platform handles the complex spatial computing, leaving creators free to focus on designing engaging experiences and distributing their digital assets.",
      "The future of Web3 gaming is not confined to screens. It extends into the world around us, turning every street corner, park bench, and landmark into a potential gaming arena. With Seekprotocol, that future is already here.",
    ],
    image: "/images/Ontwerp-zonder-titel-6_1.avif",
    imageWidth: 1024,
    imageHeight: 1024,
    imageSrcSet:
      "/images/Ontwerp-zonder-titel-6_1Ontwerp-zonder-titel-(6).avif 500w, /images/Ontwerp-zonder-titel-6_1.avif 1024w",
    imageAlt: "Augmented reality Web3 gaming experience",
    date: "2025-11-10",
    readTime: "5 min",
    category: "AR & Gaming",
  },
  {
    slug: "ai-companions-seekar-personalized-exploration",
    title: "AI Companions: How Seekprotocol Personalizes Your Exploration",
    excerpt:
      "Your AI companion sees what you see through AR, analyzes your environment, and provides real-time contextual insights for a truly personalized adventure.",
    content: [
      "Artificial intelligence in Seekprotocol goes far beyond basic chatbot functionality. The AI companion integrated into the platform is a context-aware guide that fundamentally transforms how users explore and interact with the world around them.",
      "Your AI companion does not just guide you. It sees what you see through augmented reality, analyzes your environment, and provides real-time contextual insights. Imagine an AI that recognizes landmarks to reveal local food spots, suggests optimal walking routes based on your play style, and even generates personalized AR content on the fly.",
      "The AI learns how you explore and play, continuously improving its recommendations. The more you move and interact, the better it gets at predicting what rewards you will enjoy, which quests match your skill level, and where the most rewarding locations are based on your preferences and history.",
      "Dynamic quests are a perfect example of AI personalization in action. Rather than static missions that every user experiences the same way, Seekprotocol's quests adapt to your location, skill level, and preferences, offering escalating rewards and challenges that feel uniquely crafted for you.",
      "For businesses and projects leveraging the Seek Panel, AI personalization means their campaigns reach the right users at the right time. The platform's intelligence ensures that airdrops and rewards are surfaced to users most likely to engage, maximizing the impact of every campaign.",
      "The combination of AI, AR, and blockchain creates something truly unprecedented: a digital companion that understands your physical world, enhances it with personalized digital content, and rewards your every discovery with verifiable on-chain assets. This is not the future. It is happening now with Seekprotocol.",
    ],
    image: "/images/Ontwerp-zonder-titel-10_1.avif",
    imageWidth: 1024,
    imageHeight: 1024,
    imageSrcSet:
      "/images/Ontwerp-zonder-titel-10_1Ontwerp-zonder-titel-(10).avif 500w, /images/Ontwerp-zonder-titel-10_1.avif 1024w",
    imageAlt: "AI-powered personalization in Seekprotocol",
    date: "2025-10-22",
    readTime: "4 min",
    category: "AI & Innovation",
  },
  {
    slug: "move-to-earn-live-events-new-era-engagement",
    title: "Move-to-Earn Meets Live Events: A New Era of Engagement",
    excerpt:
      "From music festivals with exclusive AR drops to city-wide treasure hunts with prize pools. Discover how Seekprotocol is redefining real-world engagement.",
    content: [
      "The move-to-earn concept has captured the imagination of the crypto community, but Seekprotocol takes it to an entirely new level by combining physical movement rewards with massive live events that bring communities together in the real world.",
      "At its core, seek-to-earn converts your daily movement into tangible rewards. Every step, run, and adventure leads to airdrops and other hidden treasures. But the real magic happens when this individual experience scales up to live events where thousands of players converge for real-world meetups with digital rewards.",
      "Picture music festivals where exclusive AR rewards drop to attendees, visible only through Seekprotocol. Imagine sports events with location-locked collectibles that can only be claimed by those who are physically present. Envision city-wide treasure hunts with substantial prize pools where entire communities compete and collaborate.",
      "These are not hypothetical scenarios. They represent the core vision of Seekprotocol's event platform. Time-limited community events bring masses together in a format reminiscent of Pokémon Go raids, but with a Web3 twist: every reward is a real, tradeable on-chain asset.",
      "For event organizers and brands, this creates unprecedented engagement opportunities. A local coffee shop can host a mini treasure hunt that drives foot traffic. A major brand can sponsor a city-wide event that generates massive visibility. A crypto project can launch a real-world activation that builds genuine community connections.",
      "The combination of physical movement, social interaction, augmented reality, and blockchain rewards creates an engagement loop that is simply unmatched in the current landscape. As users refer friends, climb leaderboards, complete guild missions, and participate in streak challenges, the ecosystem grows stronger with every event.",
    ],
    image: "/images/Ontwerp-zonder-titel-13_1.avif",
    imageWidth: 1024,
    imageHeight: 1024,
    imageSrcSet:
      "/images/Ontwerp-zonder-titel-13_1Ontwerp-zonder-titel-(13).avif 500w, /images/Ontwerp-zonder-titel-13_1.avif 1024w",
    imageAlt: "Move-to-earn live events with AR rewards",
    date: "2025-10-05",
    readTime: "5 min",
    category: "Events & Community",
  },
  {
    slug: "proof-of-location-blockchain-verified-discovery",
    title: "Proof of Location: Blockchain-Verified Real-World Discovery",
    excerpt:
      "Every step you take is proof. How Seekprotocol's on-chain verification confirms your real-world location to unlock tokens, NFTs and digital assets.",
    content: [
      "In the world of blockchain, proof mechanisms are everything. Bitcoin has proof of work, Ethereum moved to proof of stake, and now Seekprotocol introduces proof of location, a revolutionary verification system that bridges the physical and digital worlds.",
      "The concept is elegant in its simplicity: every step you take is proof. The system confirms your real-world location to unlock tokens, NFTs, and other digital assets. No cheating, no spoofing, just real rewards for real engagement in real locations.",
      "Proof of location creates verifiable on-chain records of your discoveries, building a permanent legacy of adventure on the blockchain. Each location you visit, each airdrop you collect, and each quest you complete is immutably recorded, creating a unique explorer profile that grows more valuable over time.",
      "The technology behind this system combines GPS-based precision with blockchain verification. With sub-meter accuracy and dynamic geofencing, the platform knows exactly where assets are placed and verifies that users are physically present before allowing claims. This eliminates the bot problem that plagues traditional airdrops.",
      "For the broader blockchain ecosystem, proof of location opens up entirely new use cases. Businesses can verify customer visits. Event organizers can confirm attendance. Tourism boards can incentivize exploration of specific areas. The applications extend far beyond gaming into real-world commerce and engagement.",
      "Every NFT, token, and in-game asset within Seekprotocol is secured on the Solana blockchain, meaning real ownership, provable fairness, and rewards you can actually use, both inside and outside of Seekprotocol. This is not just a new proof mechanism; it is a new paradigm for how we validate real-world human activity on-chain.",
    ],
    image: "/images/Three-Pillars_1Three-Pillars.avif",
    imageWidth: 1130,
    imageHeight: 1014,
    imageAlt: "Proof of location blockchain verification",
    date: "2025-09-18",
    readTime: "4 min",
    category: "Blockchain",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllSlugs(): string[] {
  return blogPosts.map((post) => post.slug);
}
