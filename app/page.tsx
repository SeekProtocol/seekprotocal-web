import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import SplineScene from "@/components/shared/SplineScene";
import BetaForm from "@/components/shared/BetaForm";
import VideoBackground from "@/components/shared/VideoBackground";
import MetricsSection from "@/components/shared/MetricsSection";

export const metadata: Metadata = {
  title:
    "Seek Protocol | The First AR & AI Platform on Solana - Redefining Innovation",
  description:
    "Explore a new reality with Seek Protocol ($SEEK). Hunt location-based airdrops, collect NFTs in augmented reality, earn crypto rewards, and explore the world with AI companions on Solana.",
  openGraph: {
    title: "Seek Protocol | AR & AI Platform on Solana",
    description:
      "The first AR and AI platform on Solana. Transform your world into a blockchain-powered playground. Hunt airdrops, collect NFTs, and explore with AI companions.",
    url: "/",
    images: [
      {
        url: "https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png",
        width: 1200,
        height: 630,
        alt: "Seek Protocol - Explore a New Reality with AR & AI on Solana",
      },
    ],
  },
  twitter: {
    title: "Seek Protocol | AR & AI Platform on Solana",
    description:
      "Hunt location-based airdrops, collect NFTs in AR, and earn crypto rewards. The first AR & AI platform on Solana.",
  },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <div className="page-bg">
        <SplineScene
          url="https://prod.spline.design/XOzWv5kao0gKP7SK/scene.splinecode"
          className="hero-background-video"
        />
        <div className="hero-background-overlay"></div>
      </div>
      <div className="page-wrapper">
        <div className="home-hero">
          <Navigation />
          <section className="hero-01">
            <div className="container">
              <div className="hero-01-wrap">
                <div className="hero-01-text-wrap">
                  <h1 className="h1 home_heading hero-animate-1">
                    Explore a New Reality with{" "}
                    <span className="text-gradient">Seek Protocol</span>
                  </h1>
                  <div className="subheading-wrap hero-animate-2">
                    <p className="subtitle">
                      The first AR and AI platform on Solana that transforms your
                      world into a blockchain-powered playground. Hunt for airdrops,
                      collect NFTs, and explore with AI companions in real locations.
                      Transform your surroundings into a playground of crypto
                      airdrops, NFTs, AI companions, and immersive AR experiences.
                    </p>
                  </div>
                  <div className="hero-animate-3">
                    <div className="app-buttons">
                      <a
                        href="https://apps.apple.com/app/seekar/id6752813761"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-link w-inline-block"
                      >
                        <div className="app-link_gradient"></div>
                        <div className="app-link_wrap">
                          <img
                            src="/images/app-store.svg"
                            loading="lazy"
                            alt="Download on App Store"
                            className="app-link_image"
                          />
                        </div>
                      </a>
                      <a
                        href="https://play.google.com/store/apps/details?id=com.seekar.seekar&pcampaignid=web_share"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-link w-inline-block"
                      >
                        <div className="app-link_gradient is-blue"></div>
                        <div className="app-link_wrap">
                          <img
                            src="/images/google-play.svg"
                            loading="lazy"
                            alt="Get it on Google Play"
                            className="app-link_image"
                          />
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Video Section */}
        <section className="video">
          <div className="container">
            <div className="video_wrap">
              <div className="video_component" style={{ clipPath: "none" }}>
                <div className="video_embed w-embed w-iframe">
                  <div style={{ position: "relative", paddingTop: "56.25%" }}>
                    <iframe
                      src="https://iframe.mediadelivery.net/embed/489466/c8d77fab-0226-48ca-b725-ed922933a6c5?autoplay=true&loop=true&muted=true&preload=true&responsive=true"
                      loading="eager"
                      style={{
                        border: 0,
                        position: "absolute",
                        top: 0,
                        height: "100%",
                        width: "100%",
                      }}
                      allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="is-1">
          <div className="container">
            <div className="section-background-header">
              <div className="section-background-header-inner">
                <div className="container">
                  <div className="service-heading-wrap">
                    <h2 className="h2">
                      Unlimited <span className="text-gradient">Possibilities!</span>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            <div className="position-relative">
              <div className="container">
                <div className="benefits-layout">
                  <div className="benefits-container">
                    <div className="w-layout-grid benefits-grid">
                      <div className="benefits-placeholder"></div>
                      <BenefitCard
                        title="Augmented reality"
                        description="Transform any location into an interactive treasure hunt with AR technology that brings digital assets to life."
                      />
                      <BenefitCard
                        title="Seek-to-Earn"
                        description="Convert your daily movement into rewards. Every step, run, and adventure leads to airdrops and other hidden treasures."
                      />
                      <div className="benefits-placeholder"></div>
                      <div className="benefits-placeholder"></div>
                      <BenefitCard
                        title="Live Events"
                        description="Join real-world gatherings enhanced with AR rewards, from local meetups to massive city-wide treasure hunts."
                      />
                      <BenefitCard
                        title="Creator Tools"
                        description="Our drag & drop tool empowers anyone to deploy AR campaigns, distribute NFTs, tokens, and assets and engage audiences at scale."
                      />
                      <div className="benefits-placeholder"></div>
                      <div className="benefits-placeholder"></div>
                      <BenefitCard
                        title="Geofencing Tech"
                        description="Precise GPS-based asset placement with 30-meter accuracy, enabling location-verified rewards and experiences."
                      />
                      <BenefitCard
                        title="Quests"
                        description="Dynamic missions that adapt to your location, skill level, and preferences with escalating rewards and challenges."
                      />
                      <div className="benefits-placeholder"></div>
                    </div>
                  </div>
                  <div className="benefits-column">
                    <div className="benefits-sticky">
                      <div className="hero-section-app-container">
                        <div className="hero-section-phone-holder">
                          <img
                            sizes="(max-width: 1320px) 100vw, 1320px"
                            srcSet="/images/iPhone---Hand_1-p-500.png 500w, /images/iPhone---Hand_1-p-800.png 800w, /images/iPhone---Hand_1-p-1080.png 1080w, /images/iPhone---Hand_1iPhone---Hand.webp 1320w"
                            alt="SeekAR App"
                            src="/images/iPhone---Hand_1iPhone---Hand.webp"
                            loading="eager"
                            className="hero-section-phone-image-5"
                          />
                          <div className="hero-section-phone-screenshot-holder">
                            <VideoBackground
                              poster="/videos/video-poster-00001.jpg"
                              mp4="/videos/video-transcode.mp4"
                              webm="/videos/video-transcode.webm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three Paths - Services Cards */}
        <section className="three-paths">
          <div className="container">
            <div className="three-paths-wrap">
              <div className="three-paths-top-wrap">
                <h2 data-w-id="paths-title" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="h2">
                  The future of location based interactions
                </h2>
                <p data-w-id="paths-desc" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="paragraph-03 text-gray-color">
                  Experience the revolutionary convergence of key technologies.
                  Each innovation seamlessly integrates to transform your physical
                  world into a gamified earning ecosystem where every step has
                  value, every location holds potential, and every adventure rewards
                  you with real digital assets
                </p>
              </div>
              <div className="services_sticky">
                <ServiceCard
                  variant="is-1"
                  iconSrc="/images/ChatGPT-Image-27-aug-2025-15_04_54.avif"
                  iconSrcSet="/images/ChatGPT-Image-27-aug-2025-15_04_54ChatGPT-Image-27-aug-2025,-15_04_53.avif 500w, /images/ChatGPT-Image-27-aug-2025-15_04_54.avif 1024w"
                  title="Location-based Airdrops"
                  description="Geofencing technology enables precise placement of digital assets at specific GPS coordinates. From city centers to hidden gems, every location becomes a potential reward zone. Exclusive NFTs, token airdrops, and limited collectibles await discovery."
                  imageSrc="/images/Ontwerp-zonder-titel-11_1.avif"
                  imageSrcSet="/images/Ontwerp-zonder-titel-11_1Ontwerp-zonder-titel-(11).avif 500w, /images/Ontwerp-zonder-titel-11_1.avif 1024w"
                />
                <ServiceCard
                  variant="is-2"
                  iconSrc="/images/ChatGPT-Image-27-aug-2025-15_29_38.avif"
                  iconSrcSet="/images/ChatGPT-Image-27-aug-2025-15_29_38ChatGPT-Image-27-aug-2025,-15_29_37.avif 500w, /images/ChatGPT-Image-27-aug-2025-15_29_38.avif 1024w"
                  title="Immersive AR-Technology"
                  description="Experience next-generation augmented reality that seamlessly blends digital assets with your physical environment. Our advanced AR engine delivers stunning 3D visualizations, real-time environmental mapping, and persistent world anchoring. Watch NFTs come to life, see tokens floating in mid-air, and interact with digital objects as if they were truly there."
                  imageSrc="/images/Ontwerp-zonder-titel-6_1.avif"
                  imageSrcSet="/images/Ontwerp-zonder-titel-6_1Ontwerp-zonder-titel-(6).avif 500w, /images/Ontwerp-zonder-titel-6_1.avif 1024w"
                />
                <ServiceCard
                  variant="is-3"
                  iconSrc="/images/ChatGPT-Image-27-aug-2025-17_29_20.avif"
                  iconSrcSet="/images/ChatGPT-Image-27-aug-2025-17_29_20ChatGPT-Image-27-aug-2025,-17_29_19.avif 500w, /images/ChatGPT-Image-27-aug-2025-17_29_20.avif 1024w"
                  title="AI-Powered Personalization"
                  description="Your AI companion doesn't just guide you, it sees what you see through AR, analyzes your environment, and provides real-time contextual insights. Imagine an AI that recognizes landmarks to reveal local food spots, suggests optimal walking routes based on your play style, and even generates personalized AR content on the fly."
                  imageSrc="/images/Ontwerp-zonder-titel-10_1.avif"
                  imageSrcSet="/images/Ontwerp-zonder-titel-10_1Ontwerp-zonder-titel-(10).avif 500w, /images/Ontwerp-zonder-titel-10_1.avif 1024w"
                />
                <ServiceCard
                  variant="is-4"
                  iconSrc="/images/ChatGPT-Image-27-aug-2025-22_42_13.avif"
                  iconSrcSet="/images/ChatGPT-Image-27-aug-2025-22_42_13ChatGPT-Image-27-aug-2025,-22_42_12.avif 500w, /images/ChatGPT-Image-27-aug-2025-22_42_13ChatGPT-Image-27-aug-2025,-22_42_12.avif 800w, /images/ChatGPT-Image-27-aug-2025-22_42_13.avif 1024w"
                  title="Move-to-Earn Meets Live Events"
                  description="Join massive live AR events where thousands of players converge for real-world meetups with digital rewards. Picture music festivals where exclusive rewards drop to attendees, sports events with location-locked collectibles, or city-wide treasure hunts with prize pools."
                  imageSrc="/images/Ontwerp-zonder-titel-13_1.avif"
                  imageSrcSet="/images/Ontwerp-zonder-titel-13_1Ontwerp-zonder-titel-(13).avif 500w, /images/Ontwerp-zonder-titel-13_1.avif 1024w"
                />
              </div>
            </div>
            <div className="app-buttons" style={{ justifyContent: "center", display: "flex" }}>
              <a
                href="https://apps.apple.com/app/seekar/id6752813761"
                target="_blank"
                rel="noopener noreferrer"
                className="app-link w-inline-block"
              >
                <div className="app-link_gradient"></div>
                <div className="app-link_wrap">
                  <img src="/images/app-store.svg" loading="lazy" alt="App Store" className="app-link_image" />
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.seekar.seekar&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="app-link w-inline-block"
              >
                <div className="app-link_gradient is-blue"></div>
                <div className="app-link_wrap">
                  <img src="/images/google-play.svg" loading="lazy" alt="Google Play" className="app-link_image" />
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* Three Paths to Progress */}
        <section className="three-paths">
          <div className="container">
            <div className="three-paths-wrap">
              <div className="three-paths-top-wrap">
                <h2 data-w-id="three-progress-title" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="h2">
                  Three paths to progress
                </h2>
              </div>
              <div className="three-paths-bottom-wrap">
                <div className="three-paths-image-wrap">
                  <div>
                    <SplineScene
                      url="https://prod.spline.design/7PYSi9YzDasrFQrI/scene.splinecode"
                      className="three-path-spline"
                    />
                  </div>
                </div>
                <div className="path-wrap">
                  <div className="absolute-path parth-01">
                    <h2 className="h4">Blockchain Powered</h2>
                    <p className="paragraph-03 text-gray-color">
                      Every NFT, token, and in-game asset is secured on the
                      blockchain. That means real ownership, provable fairness, and
                      rewards you can actually use — inside and outside SeekAR.
                    </p>
                  </div>
                  <div className="absolute-path parth-03">
                    <h2 className="h4 text-black">AI-Powered</h2>
                    <img src="/images/Subtract.svg" loading="lazy" alt="" className="image-path" />
                    <p className="paragraph-03 text-black">
                      Our AI learns how you explore and play — giving you smarter
                      location tips, personalized quests, and rewards that actually
                      matter. The more you move, the better it gets.
                    </p>
                  </div>
                  <div className="absolute-path parth-02">
                    <h2 className="h4">Proof of Location</h2>
                    <p className="paragraph-03 text-gray-color">
                      Every step you take is proof. Our system confirms your
                      real-world location to unlock tokens, NFTs, and other digital
                      assets— no cheating, just real rewards for real engagement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Crypto Assets Section */}
        <section className="section_home-header">
          <div className="padding-section-xxlarge">
            <div className="padding-global z-index-2">
              <div className="home-header_component">
                <div className="phone_row">
                  <div className="phone_coin-wrap">
                    <img
                      src="/images/coin-optimized.gif"
                      loading="lazy"
                      alt="SEEK coin"
                      className="phone_coin"
                      style={{ transform: "translate3d(0, 0, 0)" }}
                    />
                  </div>
                  <img
                    src="/images/modern-smartphone-with-reflective-screen-clean-design_1.avif"
                    loading="lazy"
                    sizes="(max-width: 2000px) 100vw, 2000px"
                    srcSet="/images/modern-smartphone-with-reflective-screen-clean-design_1modern-smartphone-with-reflective-screen-clean-design.avif 500w, /images/modern-smartphone-with-reflective-screen-clean-design_1modern-smartphone-with-reflective-screen-clean-design.avif 800w, /images/modern-smartphone-with-reflective-screen-clean-design_1.avif 2000w"
                    alt="Smartphone"
                    className="phone_image"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="padding-section-xxlarge"></div>
          <div className="home-header_imgs-wrapper">
            <div className="home-header_imgs-wrap" style={{ visibility: "visible" }}>
              {[
                { src: "official-trump-cryptocurrency-14325720-11625811.webp", cls: "_1", alt: "Trump cryptocurrency" },
                { src: "fartcoin-cryptocurrency-14325725-11625815.webp", cls: "_2", alt: "Fartcoin cryptocurrency" },
                { src: "popcat-cryptocurrency-12315804-10033435.webp", cls: "_3", alt: "Popcat cryptocurrency" },
                { src: "pudgy-penguins-crypto-13701312-11009751.webp", cls: "_4", alt: "Pudgy Penguins cryptocurrency" },
                { src: "virtuals-protocol-crypto-13701310-11009749.webp", cls: "_5", alt: "Virtuals Protocol cryptocurrency" },
                { src: "bonk-cryptocurrency.avif", cls: "_6", alt: "BONK cryptocurrency" },
                { src: "bitcoin-2.avif", cls: "_7", alt: "Bitcoin" },
                { src: "dogwifhat-cryptocurrency-11686723-9554873.webp", cls: "_8", alt: "Dogwifhat cryptocurrency" },
              ].map((coin) => (
                <div key={coin.cls} className={`home-header_img-wrap ${coin.cls}`} style={{ visibility: "visible" }}>
                  <img loading="lazy" src={`/images/${coin.src}`} alt={coin.alt} className="home-header_img" style={{ visibility: "visible" }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Built to Scale */}
        <section className="our-progress">
          <div className="container">
            <div className="our-progress-wrap">
              <div className="our-progress-left-wrap">
                <div className="our-progress-heading-wrap">
                  <h2 data-w-id="scale-title" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="h2">
                    BUILT TO SCALE WITH YOU
                  </h2>
                  <p data-w-id="scale-desc" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="paragraph-03 text-gray-color">
                    Whether you&apos;re launching a project or exploring your city,
                    Seek Protocol fuels your journey with immersive tech, verified
                    presence, and real rewards.
                  </p>
                </div>
                <div data-w-id="scale-btn" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="our-progress-button-wrap">
                  <Link href="/contact" className="button-01 w-inline-block">
                    <div className="button-text-icon-wrap">
                      <div className="button-text-wrapper">
                        <div className="paragraph-02 text-black">Interested?</div>
                        <div className="paragraph-02 text-black">Interested?</div>
                      </div>
                      <div className="button-icon-wrapper">
                        <img src="/images/Button-Icon-1.svg" loading="lazy" alt="" className="button-icon" />
                      </div>
                    </div>
                    <div className="hover-color"></div>
                  </Link>
                </div>
              </div>
              <div className="our-progress-left-wrapper">
                <div className="approach-line-wrap">
                  <div className="approach-line"></div>
                </div>
                <div className="our-progress-right-wrap">
                  {[
                    { title: "Seamless Onboarding", desc: "Fast-track for users, creators, and businesses. From creating social wallets to first AR events — we make onboarding feel like play, not paperwork." },
                    { title: "Project Launch Integration", desc: "Whether you're a meme coin or a mission-driven project, plug into our AR, AI, and reward layers. Launch events, token spawns, or NFT quests — geo-based and gamified." },
                    { title: "Business Portal Activation", desc: "Local stores, global brands — onboard into the Seek ecosystem. Drop exclusive deals, location-based rewards, and drive real-world foot traffic with digital incentives." },
                    { title: "Engagement Engine", desc: "Referral quests, leaderboard streaks, and guild missions — a full suite of tools to drive daily, weekly, and social engagement across users." },
                    { title: "Cross-Platform Rollout", desc: "Expanding across Solana Mobile, and Android/iOS. One profile, one wallet, endless Seek experiences — anywhere, anytime." },
                  ].map((item) => (
                    <div key={item.title} className="our-progress-list">
                      <h4 className="h4">{item.title}</h4>
                      <p className="paragraph-03 text-gray-color">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured On */}
        <section className="testimonial">
          <div className="container">
            <div className="testimonial-wrap">
              <div className="testimonial-top-wrap">
                <h3 data-w-id="featured-title" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="h3">
                  FEATURED ON:
                </h3>
              </div>
              <div className="testimonial-bottom-wrap">
                <div className="testimonial-logo-wrap">
                  {[
                    { src: "binance.svg", cls: "", alt: "Binance" },
                    { src: "99bitcoins-logo.svg", cls: "is-invert", alt: "99Bitcoins" },
                    { src: "67c89abf51d51e6df6b2dab6_cryptodaily.avif", cls: "", alt: "Crypto Daily" },
                    { src: "AP_logo_PNG_1.avif", cls: "is-invert is-large", alt: "Associated Press" },
                    { src: "benzinga-logo.avif", cls: "is-invert", alt: "Benzinga" },
                    { src: "accessnewswire-logo-Photoroom.avif", cls: "is-invert is-large", alt: "AccessNewsWire" },
                    { src: "cointelegraph.svg", cls: "is-larger", alt: "CoinTelegraph" },
                    { src: "Coinmarketcap_svg_logo.svg", cls: "is-invert is-large", alt: "CoinMarketCap" },
                    { src: "bitcoin-mgzn.avif", cls: "is-larger", alt: "Bitcoin Magazine" },
                    { src: "company_logo_street_insider.avif", cls: "is-invert is-large", alt: "Street Insider" },
                    { src: "Business-insider-logo.avif", cls: "", alt: "Business Insider" },
                    { src: "cryptonews-seeklogo.avif", cls: "is-invert", alt: "CryptoNews" },
                    { src: "digital-journal-logo.avif", cls: "is-invert", alt: "Digital Journal" },
                    { src: "Morningstar_Logo.svg.avif", cls: "", alt: "Morningstar" },
                    { src: "Newsbtc.avif", cls: "is-invert", alt: "NewsBTC" },
                  ].map((logo) => (
                    <div key={logo.src} className="testimonial-logo-list">
                      <img src={`/images/${logo.src}`} loading="lazy" alt={logo.alt} className={`testimonial-logo ${logo.cls}`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics */}
        <MetricsSection />

        {/* CTA / Beta Form */}
        <section className="cta-v2">
          <div className="container">
            <div className="cta-v2-wrap">
              <div className="cta-v2-top-wrap align-center">
                <p className="paragraph-03 text-primary">Join our beta</p>
                <div className="heading-wrap cta-v2-heading">
                  <h3 className="h2">Get ready to seek!</h3>
                </div>
                <div className="sub-heading-wrap cta-v2-sub-heading">
                  <p className="paragraph-03 text-gray-color">
                    Step into a new reality where the world becomes your
                    playground. SeekAR transforms your surroundings into an
                    interactive adventure, blending the latest AR technology with
                    real-world exploration. Track down hidden treasures, collect
                    valuable digital rewards, and conquer dynamic quests!
                  </p>
                </div>
              </div>
              <div className="cta-v2-bottom-wrap">
                <BetaForm />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

function BenefitCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="expetise-card-list">
      <div className="expertise-card-text-wrap">
        <div className="expetise-card-text">
          <h3 className="h4">{title}</h3>
          <p className="paragraph-03 text-gray-color">{description}</p>
        </div>
      </div>
      <div className="border-square" style={{ transform: "translate3d(-1%, -90%, 0)" }}></div>
      <div className="glow-main-block">
        <div style={{ opacity: 0 }} className="glow-block"></div>
      </div>
    </div>
  );
}

function ServiceCard({
  variant,
  iconSrc,
  iconSrcSet,
  title,
  description,
  imageSrc,
  imageSrcSet,
}: {
  variant: string;
  iconSrc: string;
  iconSrcSet: string;
  title: string;
  description: string;
  imageSrc: string;
  imageSrcSet: string;
}) {
  return (
    <div className={`services_card ${variant}`}>
      <div className="services_card_content">
        <div className="services_card_number">
          <img
            src={iconSrc}
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 1024px"
            srcSet={iconSrcSet}
            alt={`${title} icon`}
          />
        </div>
        <h3 data-w-id={`svc-${variant}-title`} style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="h3">
          {title}
        </h3>
        <p data-w-id={`svc-${variant}-desc`} style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="paragraph-03 text-gray-color">
          {description}
        </p>
      </div>
      <div className="services_card_hero">
        <img
          src={imageSrc}
          loading="lazy"
          sizes="(max-width: 1024px) 100vw, 1024px"
          srcSet={imageSrcSet}
          alt={title}
          className="services_card_image"
        />
      </div>
    </div>
  );
}
