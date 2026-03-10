import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services - AR, AI & Blockchain Solutions",
  description:
    "Explore Seek Protocol's services: location-based AR airdrops, AI-powered personalization, immersive AR experiences, move-to-earn gaming, creator tools, and blockchain reward distribution on Solana.",
  openGraph: {
    title: "Seek Protocol Services - AR, AI & Blockchain Solutions",
    description:
      "Location-based AR airdrops, AI-powered personalization, immersive experiences, move-to-earn, and blockchain rewards. Discover what Seek Protocol can do.",
    url: "/services",
    images: [
      {
        url: "https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png",
        width: 1200,
        height: 630,
        alt: "Seek Protocol Services",
      },
    ],
  },
  twitter: {
    title: "Seek Protocol Services - AR, AI & Blockchain",
    description:
      "AR airdrops, AI personalization, move-to-earn, and blockchain rewards on Solana. Explore Seek Protocol's full service offering.",
  },
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className="page-wrapper">
      {/* Hero */}
      <section className="service-hero">
        <div className="container">
          <div className="service-hero-wrap">
            <div className="hero-top-wrap">
              <div className="hero-01-text-wrap">
                <h1
                  data-w-id="services-title"
                  style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                  className="h1"
                >
                  OUR EXPERTISE, YOUR GROWTH
                </h1>
                <p
                  data-w-id="services-desc"
                  style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                  className="paragraph-03 text-gray-color"
                >
                  Seek Protocol delivers cutting-edge AR, AI, and blockchain solutions
                  on Solana. We&apos;re not just building technology—we&apos;re your
                  partners in transforming real-world engagement.
                </p>
              </div>
              <div
                data-w-id="services-btn"
                style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                className="hero-01-bottom-wrap"
              >
                <Link href="/contact" className="button-01 w-inline-block">
                  <div className="button-text-icon-wrap">
                    <div className="button-text-wrapper">
                      <div className="paragraph-02 text-black">Let&apos;s Contact</div>
                      <div className="paragraph-02 text-black">Let&apos;s Contact</div>
                    </div>
                    <div className="button-icon-wrapper">
                      <img src="/images/Button-Icon-1.svg" loading="lazy" alt="" className="button-icon" />
                    </div>
                  </div>
                  <div className="hover-color"></div>
                </Link>
              </div>
            </div>
            <div className="expertise-bottom-wrap">
              {[
                { title: "Business Strategy", desc: "Tailored strategies that align business goals with digital growth." },
                { title: "Visual Direction", desc: "We create cohesive and timeless brand identities that capture your vision." },
                { title: "Website Creation", desc: "Fully responsive websites built with speed and elegance in mind." },
                { title: "Content Solutions", desc: "Capture attention and drive growth with strong content direction." },
                { title: "Campaign Execution", desc: "Launch high-performance marketing across digital channels and platforms." },
                { title: "UI/UX Systems", desc: "Design seamless, functional user journeys across devices and flows." },
                { title: "Growth Tactics", desc: "Strategic methods designed to elevate brand visibility and scale." },
                { title: "Copywriting", desc: "We create cohesive and timeless brand identities that capture your vision." },
                { title: "Business Strategy", desc: "Tailored strategies that align business goals with digital growth." },
              ].map((item, idx) => (
                <div key={`${item.title}-${idx}`} className="expetise-card-list">
                  <div className="expertise-card-text-wrap">
                    <div className="expetise-card-text">
                      <h3 className="h4">{item.title}</h3>
                      <p className="paragraph-03 text-gray-color">{item.desc}</p>
                    </div>
                    <div className="expetise-card-button">
                      <Link href="/contact" className="button-04 w-inline-block">
                        <div className="button-text-icon-wrap _01">
                          <div className="button-text-wrapper">
                            <div className="paragraph-02">Details</div>
                            <div className="paragraph-02 text-black">Details</div>
                          </div>
                          <div className="button-icon-wrapper">
                            <img loading="lazy" src="/images/Button-Icon-Blue.svg" alt="" className="button-icon _001" />
                            <img loading="lazy" src="/images/Button-Icon-1.svg" alt="" className="button-icon _01" />
                          </div>
                        </div>
                        <div className="hover-color bg-primary-color _01"></div>
                      </Link>
                    </div>
                  </div>
                  <div className="border-square" style={{ transform: "translate3d(-1%, -90%, 0)" }}></div>
                  <div className="glow-main-block">
                    <div style={{ opacity: 0 }} className="glow-block"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="custom-solution">
        <div className="container">
          <div className="custom-solution-wrap">
            <div className="custom-solution-top-wrap">
              <div className="heading-top-full-wrap">
                <div className="heading-wrap solution-heading">
                  <h2 className="h2">Pricing – Flexible for Every Service</h2>
                </div>
                <div className="sub-heading-wrap solution-sub-heading">
                  <p className="paragraph-03 text-gray-color">
                    We understand that each business has a unique budget, which is
                    why our pricing is based on the module you select.
                  </p>
                  <p className="paragraph-03">
                    Ready to discuss your project in detail?
                  </p>
                </div>
              </div>
              <div
                data-w-id="pricing-btn"
                style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                className="heading-top-button-wrap"
              >
                <Link href="/contact" className="button-01 cta-call-button w-inline-block">
                  <div className="button-text-icon-wrap">
                    <div className="button-icon-wrapper">
                      <img loading="lazy" alt="" src="/images/calendar-plus-02.svg" className="button-icon" />
                    </div>
                    <div className="button-text-wrapper">
                      <div className="paragraph-02 text-black">Schedule a consultation</div>
                      <div className="paragraph-02 text-black">Schedule a consultation</div>
                    </div>
                  </div>
                  <div className="hover-color"></div>
                </Link>
              </div>
            </div>
            <div className="custom-solution-bottom-wrap _02">
              {[
                { icon: "Net-Icon.svg", title: "Small Module", desc: "Ideal for smaller logos and brief messages." },
                { icon: "sun.svg", title: "Medium Module", desc: "Offers more space for your branding content." },
                { icon: "container.svg", title: "Large Module", desc: "The most prominent placement on the map." },
              ].map((item) => (
                <div key={item.title} className="custom-solution-box">
                  <div className="custom-solution-icon-wrap">
                    <img src={`/images/${item.icon}`} loading="lazy" alt={item.title} className="icon" />
                  </div>
                  <div className="solution-details">
                    <h3 className="h4">{item.title}</h3>
                    <p className="paragraph-03 text-gray-color">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who We Work With */}
      <section className="we-work">
        <div className="container">
          <div className="we-work-wrrap">
            <div
              data-w-id="work-top"
              style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
              className="we-work-top-wrap"
            >
              <h2 className="h2">Who We Work With</h2>
              <Link href="/contact" className="button-01 w-inline-block">
                <div className="button-text-icon-wrap">
                  <div className="button-text-wrapper">
                    <div className="paragraph-02 text-black">Let&apos;s Contact</div>
                    <div className="paragraph-02 text-black">Let&apos;s Contact</div>
                  </div>
                  <div className="button-icon-wrapper">
                    <img src="/images/Button-Icon-1.svg" loading="lazy" alt="" className="button-icon" />
                  </div>
                </div>
                <div className="hover-color"></div>
              </Link>
            </div>
            <div className="we-work-bottom-wrap">
              {[
                { icon: "Work-Icon.svg", title: "Small Businesses & Startups", desc: "Creating your voice and making sure it gets heard." },
                { icon: "Work-Icon-4.svg", title: "E-commerce Brands", desc: "Writing compelling product descriptions that convert." },
                { icon: "Work-Icon-1.svg", title: "Agencies & Consultants", desc: "Building authority with high-value content." },
                { icon: "Work-Icon-2.svg", title: "Local Businesses", desc: "Helping you connect with customers in Prague and beyond." },
                { icon: "Work-Icon-3.svg", title: "Large Corporations", desc: "Writing clear, effective messaging that strengthens your brand." },
              ].map((item) => (
                <div key={item.title} className="work-list">
                  <div className="work-icon-wrap">
                    <img src={`/images/${item.icon}`} loading="lazy" alt={item.title} className="fit-cover" />
                  </div>
                  <div className="work-text-wrap">
                    <h4 className="h4">{item.title}</h4>
                    <p className="paragraph-03 text-gray-color">{item.desc}</p>
                  </div>
                  <div className="glow-main-block">
                    <div className="glow-block"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-v1">
        <div className="container">
          <div className="cta-v1-wrap">
            <div className="cta-v1-text-wrap">
              <div className="paragraph-01 text-primary-color">Let&apos;s Connect</div>
              <h2 className="h1 align-center">
                HAVE AN IDEA OR NEED TO START A PROJECT?
              </h2>
            </div>
            <div className="cta-v1-button-wrap">
              <Link href="/contact" className="button-01 cta-button w-inline-block">
                <div className="button-text-icon-wrap">
                  <div className="button-text-wrapper">
                    <div className="paragraph-02 text-black">Let&apos;s Contact</div>
                    <div className="paragraph-02 text-black">Let&apos;s Contact</div>
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
      </section>
    </div>
  );
}
