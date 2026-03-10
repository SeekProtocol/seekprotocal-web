import type { Metadata } from "next";
import Link from "next/link";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import SplineScene from "@/components/shared/SplineScene";
import BetaForm from "@/components/shared/BetaForm";

export const metadata: Metadata = {
  title: "About Us - Meet the Team Behind SeekAR",
  description:
    "Meet the Seek Protocol team building the future of location-based AR experiences on Solana. Discover our mission, core technologies, values, and the people behind $SEEK and SeekAR.",
  openGraph: {
    title: "About Seek Protocol - The Team Behind SeekAR",
    description:
      "Discover how Seek Protocol bridges physical and digital worlds through location-based AR technology, blockchain rewards, and AI-powered exploration on Solana.",
    url: "/about",
    images: [
      {
        url: "https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png",
        width: 1200,
        height: 630,
        alt: "About Seek Protocol - AR & AI Platform on Solana",
      },
    ],
  },
  twitter: {
    title: "About Seek Protocol - Meet the SeekAR Team",
    description:
      "Meet the team building the future of location-based AR experiences on Solana. AR technology, blockchain rewards, and AI-powered exploration.",
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
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
        <Navigation />

        {/* Hero */}
        <section className="about-hero">
          <div className="container">
            <div className="about-hero-wrap">
              <div className="hero-top-wrap">
                <div className="hero-01-text-wrap">
                  <h1
                    data-w-id="about-hero-title"
                    style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                    className="h1 front-size-22"
                  >
                    Discover the Future of Location-Based Digital Experiences
                  </h1>
                  <p
                    data-w-id="about-hero-desc"
                    style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                    className="paragraph-03 text-gray-color"
                  >
                    SeekProtocol transforms real-world exploration into rewarding
                    adventures through advanced augmented reality and blockchain
                    technology.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="about-hero-bottom-wrap">
            <img
              className="about-bg"
              src="/images/ChatGPT-Image-10-sep-2025-02_18_11.png"
              alt="Seek Protocol augmented reality experience"
              sizes="(max-width: 1536px) 100vw, 1536px"
              loading="lazy"
              srcSet="/images/ChatGPT-Image-10-sep-2025-02_18_11-p-500.png 500w, /images/ChatGPT-Image-10-sep-2025-02_18_11-p-800.png 800w, /images/ChatGPT-Image-10-sep-2025-02_18_11-p-1080.png 1080w, /images/ChatGPT-Image-10-sep-2025-02_18_11.png 1536w"
            />
            <div className="container about-into-card-wrap">
              <div
                data-w-id="about-card"
                style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                className="about-into-card"
              >
                <div className="heading-about">
                  <h2 className="h2 text-black _02">Why Seek Protocol?</h2>
                </div>
                <div className="details-about">
                  <p className="paragraph-03 text-black _01">
                    While others build apps, we&apos;re building a revolution.
                    SeekProtocol bridges the gap between physical and digital worlds
                    through location-based AR technology that turns every step into
                    an opportunity. Our decentralized reward system ensures that
                    exploration pays off – literally. We&apos;re not just creating
                    experiences; we&apos;re pioneering a new economy where real-world
                    discovery generates real value. With sub-meter precision tracking,
                    stunning AR visualizations, and blockchain rewards, we&apos;re
                    making the invisible visible and the impossible profitable.
                  </p>
                </div>
                <div className="about-button-wrap">
                  <Link href="/contact" className="button-01 w-variant-ae89c003-9ca6-5eb5-7340-85db27fb3748 w-inline-block">
                    <div className="button-text-icon-wrap">
                      <div className="button-text-wrapper">
                        <div className="paragraph-02 text-black">Let&apos;s Connect</div>
                        <div className="paragraph-02 text-black">Let&apos;s Connect</div>
                      </div>
                      <div className="button-icon-wrapper">
                        <img src="/images/Button-Icon-1.svg" loading="lazy" alt="" className="button-icon" />
                      </div>
                    </div>
                    <div className="hover-color"></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="values">
          <div className="container">
            <div className="values-wrap">
              <div className="values-top-wrap">
                <p data-w-id="values-label" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="paragraph-03 text-primary">Our Values</p>
                <h2 data-w-id="values-title" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="h2">WHAT DRIVES US</h2>
              </div>
              <div className="values-bottom-wrap">
                {[
                  { title: "Location Intelligence", desc: "Precision geospatial technology with sub-meter accuracy that responds to your every movement in real-time." },
                  { title: "AR Innovation", desc: "State-of-the-art augmented reality that seamlessly blends digital treasures with your physical world." },
                  { title: "Social Discovery", desc: "Team up with nearby explorers for multiplied rewards and shared achievements." },
                  { title: "Cross-Chain Rewards", desc: "Earn multiple airdrops, NFTs, and other digital assets across different blockchain networks." },
                  { title: "Proof of Exploration", desc: "Verifiable on-chain records of your discoveries create a permanent legacy of adventure." },
                ].map((item) => (
                  <div key={item.title} className="values-card">
                    <h4 className="h4"><strong>{item.title}</strong></h4>
                    <p className="paragraph-03 text-gray-color">{item.desc}</p>
                    <div className="glow-main-block"><div style={{ opacity: 0 }} className="glow-block"></div></div>
                  </div>
                ))}
                <div className="values-card _01">
                  <h4 className="h4">Ready to Seek?</h4>
                  <div className="glow-main-block"><div style={{ opacity: 0 }} className="glow-block"></div></div>
                  <Link href="/contact" className="button-01 w-inline-block">
                    <div className="button-text-icon-wrap">
                      <div className="button-text-wrapper">
                        <div className="paragraph-02 text-black">Start Exploring</div>
                        <div className="paragraph-02 text-black">Start Exploring</div>
                      </div>
                      <div className="button-icon-wrapper"><img src="/images/Button-Icon-1.svg" loading="lazy" alt="" className="button-icon" /></div>
                    </div>
                    <div className="hover-color"></div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Technologies */}
        <section className="marketing">
          <div className="container">
            <div className="marketing-wrap">
              <div className="marketing-top-wrap">
                <div className="marketing-heading-text">
                  <div className="heading-wrap marketing-heading-wrap"><h2 className="h2">CORE TECHNOLOGIES WE DEPLOY</h2></div>
                  <div className="sub-heading-wrap marketing-sub-heading-wrap">
                    <p className="paragraph-03 text-gray-color">At SeekProtocol, we understand that exploration needs purpose. We don&apos;t offer one-size-fits-all experiences – we create dynamic, location-aware adventures for every user.</p>
                  </div>
                </div>
              </div>
              <div className="marketing-bottom-wrap">
                {[
                  { icon: "Marketing-Icon--4.svg", title: "GEOSPATIAL MAPPING", desc: "Real-time location tracking with dynamic geofencing that creates context-aware experiences." },
                  { icon: "Marketing-Icon--3.svg", title: "AR RENDERING", desc: "Advanced rendering mechanics and spatial computing for immersive augmented reality." },
                  { icon: "Marketing-Icon--1.svg", title: "BLOCKCHAIN REWARDS", desc: "Real rewards for real exploration & engagement." },
                  { icon: "Marketing-Icon--2.svg", title: "INSTANT SYNC", desc: "Real-time updates across all players - see discoveries happen live as they occur worldwide." },
                ].map((item) => (
                  <div key={item.title} className="marketing-box-list">
                    <div className="marketing-icon-wrap"><img src={`/images/${item.icon}`} loading="lazy" alt="" className="fit-cover" /></div>
                    <div className="marketing-details">
                      <h3 className="h3">{item.title}</h3>
                      <p className="paragraph-03 text-gray-color">{item.desc}</p>
                    </div>
                    <div className="glow-main-block"><div style={{ opacity: 0 }} className="glow-block"></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Three Pillars */}
        <section className="three-pillars">
          <div className="container">
            <div className="three-pillars-wrap">
              <div className="three-pillars-top-wrap">
                <h1 data-w-id="pillars-title" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="h1">THREE PILLARS OF SUCCESS</h1>
                <p data-w-id="pillars-desc" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="paragraph-03 text-gray-color">At the core of SeekProtocol are three revolutionary technologies that transform how we interact with the world.</p>
              </div>
              <div className="three-pillars-bottom-wrap">
                <div className="three-pillars-image-wrap"><img src="/images/Three-Pillars_1Three-Pillars.avif" loading="lazy" alt="Three Pillars" className="fit-cover _01" /></div>
                <div className="three-pillars-text-wrap">
                  <div className="three-pillars-card absolute-pillars">
                    <h2 className="h4">Augmented Reality</h2>
                    <p className="paragraph-03 text-gray-color text-mobile-white">Cutting-edge AR that reveals hidden digital layers invisible to the naked eye.</p>
                  </div>
                  <div className="absolute-path absolute-pillars-03">
                    <h2 className="h4 text-black">Location Precision</h2>
                    <p className="paragraph-03 text-black">Sub-meter accurate GPS with dynamic geofencing that knows exactly where airdrops are placed.</p>
                    <img src="/images/Subtract.svg" loading="lazy" alt="" className="image-path" />
                  </div>
                  <div className="three-pillars-card absolute-pillars-01">
                    <h3 className="h4">Reward Distribution</h3>
                    <p className="paragraph-03 text-gray-color text-mobile-white">Decentralized pools that ensure fair, instant, and transparent earnings for every SeekAR user.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Approach */}
        <section className="approach">
          <div className="container">
            <div className="approach-wrap">
              <div data-w-id="approach-left" style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }} className="approach-left-wrap">
                <div className="approach-left-text-wrap">
                  <p className="paragraph-03 text-primary">Our Approach</p>
                  <div className="approach-heading">
                    <h2 className="h2">WHERE EXPLORATION MEETS REWARDS</h2>
                    <p className="paragraph-03 text-gray-color">Every location has untold value. Our job? To unlock it in ways that captivate, reward, and keep seekers coming back for more.</p>
                  </div>
                </div>
              </div>
              <div className="approach-bottom-wrap">
                <div className="approach-line-wrap"><div className="approach-line"></div></div>
                <div className="approach-text-wrap">
                  {[
                    { title: "Treasure Hunts That Excite", desc: "Dynamic, location-based challenges.", point: "_01" },
                    { title: "AR Experiences That Amaze", desc: "Immersive digital overlays on reality.", point: "_02" },
                    { title: "Reward Pools That Pay", desc: "Community-driven earning opportunities.", point: "_03" },
                    { title: "Social Features That Connect", desc: "Multi-user exploration and collaboration.", point: "_04" },
                    { title: "Analytics That Inform", desc: "Real-time insights on exploration patterns.", point: "_05" },
                    { title: "Events That Unite", desc: "Time-limited community events that bring the mass together, imagine Pokémon-Go Raids, Web3 style.", point: "_06" },
                    { title: "Collaborations That Create", desc: "User-generated content and challenges.", point: "_07" },
                  ].map((item) => (
                    <div key={item.title} className="approach-text-list">
                      <h4 className="h4">{item.title}</h4>
                      <div className="point-text-wrap">
                        <p className="paragraph-03 text-gray-color">{item.desc}</p>
                        <div className={`point-wrap ${item.point}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section team-one">
          <div className="w-layout-blockcontainer container w-container">
            <div className="team-wrapper">
              <div className="secondary-title-wrap team">
                <h2 data-w-id="team-title" style={{ opacity: 0 }} className="h2 max-width">Our Amazing Team</h2>
              </div>
              <div className="team-v1-grid">
                {[
                  { name: "Don Reijke", role: "Founder & CTO", img: "Don-Reijke.avif", linkedin: "https://www.linkedin.com/in/don-reijke-09630921b/" },
                  { name: "Lukas Novotny", role: "COO", img: "Lukas-Novotny.avif", linkedin: "#" },
                  { name: "Senna Kabbaj", role: "CCO", img: "Senna-Kabbaj.avif", linkedin: "https://www.linkedin.com/in/sennakabbaj/" },
                  { name: "Tristan Wesenhagen", role: "Business Development & Strategy Lead", img: "Tristan-Wesenhagen_1.avif", linkedin: "https://www.linkedin.com/in/sdewansingh/" },
                  { name: "Jonathan Ladislas", role: "Strategic Advisor", img: "Jonathan-Ladislas_1.avif", linkedin: "https://www.linkedin.com/in/martin-patzer-92885a295/" },
                  { name: "Martin Patzer", role: "Community Manager", img: "Martin-Patzer.avif", linkedin: "https://www.linkedin.com/in/martin-patzer-92885a295/" },
                  { name: "Vitor Souza", role: "Lead AI Engineer & Game Development", img: "Vitor-Souza.avif", linkedin: "#" },
                  { name: "Wilson Bueres", role: "3D Design & Animations", img: "Wilson-Bueres.avif", linkedin: "#" },
                  { name: "Samuel Pinheiro", role: "Blockchain & Game Development", img: "Samuel-Pinheiro.avif", linkedin: "#" },
                  { name: "Mateus Henrique", role: "Game Development", img: "Mateus-Henrique.avif", linkedin: "#" },
                  { name: "Twan Kersting", role: "Innovation Strategist", img: "Twan-Kersting.avif", linkedin: "#" },
                ].map((member) => (
                  <div key={member.name} className="team-v1-wrap">
                    <div className="team-v1-img-wrap"><img loading="lazy" src={`/images/${member.img}`} alt={member.name} className="team-v1-img" /></div>
                    <div className="team-v1-author-wrap">
                      <div className="team-v1-author-inner-wrap">
                        <div className="team-v1-author-name">{member.name}</div>
                        <div className="team-v1-author-bio">{member.role}</div>
                      </div>
                      <div className="team-v1-social-wrap">
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="team-v1-social-link w-inline-block">
                          <img loading="lazy" src="/images/Linkdin-Image.svg" alt="LinkedIn" className="team-v1-social-img" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Beta Form */}
        <section className="cta-v2">
          <div className="container">
            <div className="cta-v2-wrap">
              <div className="cta-v2-top-wrap align-center">
                <p className="paragraph-03 text-primary">Join our beta</p>
                <div className="heading-wrap cta-v2-heading"><h3 className="h2">Get ready to seek!</h3></div>
                <div className="sub-heading-wrap cta-v2-sub-heading">
                  <p className="paragraph-03 text-gray-color">Step into a new reality where the world becomes your playground. SeekAR transforms your surroundings into an interactive adventure, blending the latest AR technology with real-world exploration.</p>
                </div>
              </div>
              <div className="cta-v2-bottom-wrap"><BetaForm /></div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
