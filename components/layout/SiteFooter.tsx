import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SeekLogo from "@/components/brand/SeekLogo";
import CookieConsentButton from "@/components/shared/CookieConsentButton";

/**
 * Every internal link here is `prefetch={false}`, and the reason is the whole
 * footer's position on the page.
 *
 * A `<Link>` left on the default prefetches as soon as it enters the viewport,
 * and Next 16 does not do that in one request: measured on production at
 * 393x852, a single scroll to the bottom of the homepage fired **40 RSC
 * requests, four per route across ten routes**, from the nine links below plus
 * the one in the page body. There is only one visible link per route on a
 * phone; the four are Next fetching the route's segments separately.
 *
 * Cold, that is about 3.3 MB of RSC payload — the whitepaper alone is 132 KB —
 * fetched, parsed and then held in the client router cache. It buys nothing.
 * The footer sits at the end of a 20,000px page, so anyone who reaches it has
 * already read the site, and the odds that they then want all nine of these are
 * low. Worse, the cost lands at exactly the scroll depth where the one crash
 * the log could vouch for happened: scrollY 16928, with no canvas alive and
 * nothing thrown.
 *
 * **`false` means no prefetch at all, not "prefetch later".** It is tempting to
 * assume hover and touch still warm the link — they do not. In next@16.2,
 * `app-dir/link.js` derives `prefetchEnabled = prefetchProp !== false`, and
 * both `onMouseEnter` and `onTouchStart` return early on `!prefetchEnabled`.
 * There is no intent-only mode: the prop is full prefetch, viewport prefetch,
 * or nothing. Checked in the installed source rather than assumed, because the
 * first version of this comment claimed the opposite.
 *
 * So the trade is real and is being made deliberately. A footer link now costs
 * an ordinary client navigation — measured at about 1.3 s cold against a local
 * production build, less in production behind the CDN — instead of resolving
 * from cache. That is the price for taking 3.3 MB of fetching and parsing off
 * the one gesture every reader performs, on the pass where the tab was dying.
 * Nine links nobody has clicked yet do not get to cost that.
 *
 * The header's desktop nav is deliberately left prefetching. It is the primary
 * navigation, it is on screen from the first frame rather than arriving under a
 * scroll, and it is `display: none` on a handheld, so it never runs on the
 * device this is about.
 */

const COLUMNS = [
  {
    key: "product",
    links: [
      { href: "/seekar", key: "seekar" },
      { href: "/ecosystem", key: "ecosystem" },
      { href: "/whitepaper", key: "whitepaper" },
      { href: "/roadmap", key: "roadmap" },
      { href: "/business", key: "business" },
    ],
  },
  {
    key: "company",
    links: [
      { href: "/about", key: "about" },
      { href: "/blog", key: "blog" },
      { href: "/contact", key: "contact" },
    ],
  },
] as const;

const EXTERNAL = [
  { href: "https://dashboard.seekprotocol.ai/", key: "tokenDashboard" },
] as const;

/* The stores are the point of the whole site, so they get their own badges
   rather than sitting in a list of text links between the token dashboard and
   the privacy policy. */
const STORES = [
  {
    href: "https://apps.apple.com/app/seekar/id6752813761",
    img: "/images/app-store.svg",
    alt: "Download on the App Store",
  },
  {
    href: "https://play.google.com/store/apps/details?id=com.seekar.seekar",
    img: "/images/google-play.svg",
    alt: "Get it on Google Play",
  },
] as const;

/* Drawn inline rather than loaded as artwork.
   Both shipped SVGs bake in their own brand colour *and* their own filled
   disc: `twitter.svg` is a #9407CB circle with the mark knocked out of it. Any
   filter that makes one of them fit the footer destroys the other, and
   inverting the purple is what turned it green. As glyphs in `currentColor`
   they are one weight, one colour, and they theme with everything else. */
const SOCIALS = [
  {
    href: "https://x.com/seekprotocol",
    label: "X",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117Z",
  },
  {
    href: "https://t.me/+Nrn7K1pRN9M3OTU0",
    label: "Telegram",
    path: "M21.94 4.3 2.9 11.64c-1.3.52-1.29 1.25-.24 1.57l4.88 1.52 1.87 5.74c.23.62.11.87.76.87.5 0 .72-.23 1-.5l2.37-2.3 4.93 3.64c.91.5 1.56.24 1.79-.84l3.24-15.3c.33-1.32-.5-1.92-1.36-1.53ZM8.6 14.24l10.56-6.66c.53-.32 1.01-.15.61.2l-9.04 8.16-.35 3.76Z",
  },
] as const;

export default function SiteFooter() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <Link href="/" prefetch={false} aria-label="Seekprotocol">
              <SeekLogo markSize={34} gradientId="seek-logo-footer" />
            </Link>
            <p className="t-body site-footer-blurb">{t("description")}</p>
            <div className="store-buttons site-footer-stores">
              {STORES.map((store) => (
                <a
                  key={store.href}
                  href={store.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="store-button"
                >
                  <img src={store.img} alt={store.alt} width={140} height={32} loading="lazy" />
                </a>
              ))}
            </div>

            <div className="site-footer-socials">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="site-footer-social"
                  aria-label={social.label}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={social.path} fill="currentColor" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="site-footer-cols">
            {COLUMNS.map((column) => (
              <div key={column.key} className="site-footer-col">
                <h2 className="t-mono site-footer-col-title">{t(column.key)}</h2>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      {/* See the note on prefetch at the top of this file. */}
                      <Link href={link.href} prefetch={false} className="site-footer-link">
                        {tn(link.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="site-footer-col">
              <h2 className="t-mono site-footer-col-title">{t("resources")}</h2>
              <ul>
                {EXTERNAL.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="site-footer-link"
                    >
                      {t(link.key)}
                      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                        <path
                          d="M2 8L8 2M8 2H3.2M8 2v4.8"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p className="t-mono-sm site-footer-legal-address">{t("address")}</p>
          <div className="site-footer-legal">
            <span className="t-mono-sm">{t("copyright")}</span>
            <Link
              href="/privacy-policy"
              prefetch={false}
              className="t-mono-sm site-footer-legal-link"
            >
              {t("privacyPolicy")}
            </Link>
            <Link
              href="/terms-conditions"
              prefetch={false}
              className="t-mono-sm site-footer-legal-link"
            >
              {t("termsOfService")}
            </Link>
            <CookieConsentButton className="t-mono-sm site-footer-legal-link" />
          </div>
        </div>
      </div>
    </footer>
  );
}
