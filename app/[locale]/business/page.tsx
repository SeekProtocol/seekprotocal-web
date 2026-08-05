import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getMultilingualAlternates } from "@/lib/seo";
import { MEASUREMENT, USE_CASES } from "@/content/business";
import DeployConsole from "@/components/business/DeployConsole";
import AttentionFunnel from "@/components/business/AttentionFunnel";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "For business",
    description:
      "Place rewards at your own coordinates and measure who actually arrived. Seek Protocol turns digital campaigns into verified footfall for retail, events, token projects and cities.",
    alternates: getMultilingualAlternates("/business", locale),
  };
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <section className="page-head">
        <div className="grid-field" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="shell">
          <div className="page-head-inner">
            <p className="eyebrow">For business</p>
            <h1 className="t-h1 page-head-title">
              Buy arrivals, not <span className="text-gradient">impressions</span>
            </h1>
            <p className="t-lead">
              Digital advertising can put your logo in front of someone in
              milliseconds. It cannot get them to walk three streets over. Place
              a reward at your door and pay for the people who reach it.
            </p>
            <div className="btn-row" style={{ marginTop: "2rem" }}>
              <Link href="/contact" className="btn btn-brand btn-lg">
                Talk to us
              </Link>
              <Link href="/whitepaper" className="btn btn-outline btn-lg">
                How verification works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">The argument</p>
            <h2 className="t-h2">Where the counting stops</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>
              Spend the same money two ways and the funnels look comparable
              until the last row. One of them is counted. The other is a model,
              and it is the row every campaign is judged on.
            </p>
          </div>

          <div className="reveal" style={{ marginTop: "3rem" }}>
            <AttentionFunnel />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section section-sunken">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">Use cases</p>
            <h2 className="t-h2">Four ways people use it</h2>
          </div>

          <div className="usecase-grid">
            {USE_CASES.map((useCase) => (
              <article key={useCase.id} className="card card-hover usecase reveal">
                <div className="usecase-head">
                  <span className="t-mono">{useCase.label}</span>
                  <span className="chip chip-brand">{useCase.metric}</span>
                </div>
                <h3 className="t-h3 usecase-title">{useCase.title}</h3>
                <p className="t-body">{useCase.body}</p>
                <ul className="usecase-list">
                  {useCase.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="sec-head reveal">
            <p className="eyebrow">Setup</p>
            <h2 className="t-h2">Four decisions, no engineering</h2>
            <p className="t-lead" style={{ marginTop: "1.25rem" }}>
              This is the whole flow. Make the four choices and publish, and see
              what each one does to the ground you are holding and the price of
              a person at your door.
            </p>
          </div>

          <div className="reveal" style={{ marginTop: "3rem" }}>
            <DeployConsole />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="measure-layout">
            <div className="sec-head reveal">
              <p className="eyebrow">Measurement</p>
              <h2 className="t-h2">What you get, and what you do not</h2>
              <p className="t-body" style={{ marginTop: "1.25rem" }}>
                Location data is the most sensitive category there is. You
                receive the counts you need to judge a campaign, and nothing
                that would let you follow an individual around.
              </p>
            </div>

            <div className="wp-specs reveal">
              {MEASUREMENT.map((row) => (
                <div key={row.label} className="wp-spec-row">
                  <span className="t-mono">{row.label}</span>
                  <span className="wp-spec-value">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="cta-band reveal">
            <div className="cta-band-inner">
              <p className="eyebrow eyebrow-center">Get started</p>
              <h2 className="t-h2 cta-band-title">Put something at your door</h2>
              <p className="t-body">
                The self-serve portal is in progress. Until it lands, we set
                campaigns up with you directly. Tell us the location and what
                you want to place.
              </p>
              <div className="btn-row">
                <Link href="/contact" className="btn btn-brand btn-lg">
                  Start a conversation
                </Link>
                <Link href="/roadmap" className="btn btn-outline btn-lg">
                  See when self-serve ships
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
