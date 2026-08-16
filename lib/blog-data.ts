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
  {
    /* The slug still says "solana" and stays that way. It is the published
       URL of an article from December 2025, and renaming it to match the copy
       would break every inbound link to buy a tidier path. The title and the
       body are current; the address is history. */
    slug: "what-is-seek-protocol-first-ar-ai-platform-solana",
    title: "What is Seekprotocol? The AR & AI Layer for Every Chain",
    excerpt:
      "Discover how Seekprotocol is pioneering the intersection of augmented reality, artificial intelligence, geolocation, and GameFi, for assets on any chain.",
    content: [
      "In a world where the boundaries between physical and virtual realities are increasingly blurred, Seekprotocol emerges as a pioneer at the intersection of AI, augmented reality (AR), geolocation, and GameFi. It is the first project to integrate all four technologies into a single, cohesive ecosystem, and it does it without asking a project to leave the chain it is already on.",
      "Seekprotocol is not just another blockchain project. It is the ultimate user acquisition platform, enabling creators and projects to distribute their tokenized assets to users on-chain in a gamified and engaging way. Through its flagship app Seekprotocol, users experience an ever-evolving treasure hunt with infinite replayability and a continuous stream of new rewards.",
      "The Seek Panel empowers creators and projects to distribute tokenized assets to users through gamified experiences. Whether you are a meme token creator looking to add real-world utility, a web3 game seeking new players, or an Ethereum, Solana, BNB Smart Chain or Arbitrum project wanting to introduce your token to new audiences, Seekprotocol provides the tools to do it in an innovative way.",
      "At the core of the platform is $SEEK, the native token essential for launching campaigns within the Seekprotocol app. Integrating assets into the ecosystem drives demand for $SEEK, creating positive buying pressure and fostering sustainable growth.",
      "With Seekprotocol's crypto-native user base of individuals passionate about cutting-edge technologies and GameFi, the platform becomes an ideal gateway for new projects looking for an audience, whichever ecosystem they launched in. The foundation is built on driving demand, expanding reach, attracting players, and providing real utility, all through the power of location-based augmented reality.",
      "The technology stack combines geospatial mapping with real-time location tracking, advanced AR rendering with spatial computing, blockchain-powered reward distribution, and instant sync across all users worldwide. This makes Seekprotocol not just a concept, but a fully functional platform transforming how we interact with the world around us.",
    ],
    image: "/images/Ontwerp-zonder-titel-11_1.avif",
    imageWidth: 1024,
    imageHeight: 1024,
    imageSrcSet:
      "/images/Ontwerp-zonder-titel-11_1Ontwerp-zonder-titel-(11).avif 500w, /images/Ontwerp-zonder-titel-11_1.avif 1024w",
    imageAlt: "Seekprotocol, the AR platform for assets on any chain",
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
      "What sets Seekprotocol apart from other AR applications is its deep integration with blockchain technology. Every AR interaction is backed by real on-chain assets. When you collect an NFT in augmented reality, you are not just playing a game, you are acquiring a verifiable digital asset secured on chain, with real ownership and provable fairness.",
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
      "Every NFT, token, and in-game asset within Seekprotocol is secured on the chain it was issued on, meaning real ownership, provable fairness, and rewards you can actually use, both inside and outside of Seekprotocol. This is not just a new proof mechanism; it is a new paradigm for how we validate real-world human activity on-chain.",
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
