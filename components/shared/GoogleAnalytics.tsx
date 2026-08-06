/**
 * Google Consent Mode v2, in its advanced form, for GA4.
 *
 * Everything here turns on one rule: the consent defaults have to be in the
 * dataLayer before the tag reads it. gtag.js is loaded from the last line of
 * the block that sets them, which is the only ordering that makes the rest of
 * it true.
 *
 * **Advanced rather than basic.** The tag loads on every visit instead of
 * waiting for a yes. That sounds like the weaker position and is not: with
 * every consent type defaulted to denied, Google is forbidden from writing a
 * cookie or reading an identifier until the banner says otherwise. What it does
 * send in the meantime is a cookieless ping, which is how it models the
 * visitors and conversions that a basic setup simply loses. Nothing is stored
 * on the reader's device before they have chosen — that promise is unchanged
 * and it is the one the banner actually makes.
 *
 * The trade is that a request goes to Google before anyone has clicked. Loading
 * a script is not storing or reading anything on the device, which is why this
 * is the standard EU implementation, but it is a judgement worth knowing you
 * have made rather than one to discover later.
 *
 * `wait_for_update: 500` holds the tag for half a second so a returning reader
 * whose choice is already in the cookie has it applied before the first hit
 * goes out, rather than sending one denied hit and correcting afterwards.
 *
 * CookieConsent sends `consent update` when the banner is answered and when a
 * stored choice is read back. It loads nothing: with the tag always present,
 * granting consent is a message, not an installation.
 *
 * **On Tag Manager.** GTM-59RP4R4B was wired in here and taken out again. The
 * container was empty, and an empty container is 111 KB on every page load
 * against a homepage already carrying 235 KB of its own and measuring a 6.2s
 * LCP on a phone. Routing GA4 through it would not have won that back either:
 * GTM loads gtag.js itself, so the container is always additive. Direct is the
 * lightest arrangement there is.
 *
 * Put it back when there is something for it to carry — a Meta or LinkedIn
 * pixel, conversion tracking across several ad platforms, or marketing needing
 * to add tags without a deploy. Two things it needed, both easy to forget:
 * googletagmanager.com on `frame-src` in vercel.json for the noscript iframe,
 * and no GA4 configuration tag inside the container while the `gtag('config')`
 * below still runs, or every page view is counted twice.
 *
 * The id is written out and overridable. A GA4 measurement id is public by
 * design — it ships in the page source, names a property rather than
 * authorising anything against it, and cannot be used to read the data. Leaving
 * it to the environment is how the site went live with an empty measurement id
 * and no analytics at all.
 */

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ERQZV9BXQV';

/**
 * Runs before the tag. Order inside it is the whole point:
 * dataLayer, then gtag, then the defaults, then — and only then — gtag.js.
 */
const consentBootstrap = `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{
  'ad_storage':'denied',
  'ad_user_data':'denied',
  'ad_personalization':'denied',
  'analytics_storage':'denied',
  'functionality_storage':'denied',
  'personalization_storage':'denied',
  'security_storage':'granted',
  'wait_for_update':500
});
gtag('set','ads_data_redaction',true);
gtag('set','url_passthrough',true);
gtag('js',new Date());
gtag('config','${GA_MEASUREMENT_ID}',{
  anonymize_ip:true,
  cookie_flags:'SameSite=Lax;Secure'
});
(function(d,i){var g=d.createElement('script');g.async=true;
g.src='https://www.googletagmanager.com/gtag/js?id='+i;
var f=d.getElementsByTagName('script')[0];f.parentNode.insertBefore(g,f);})(document,'${GA_MEASUREMENT_ID}');
`;

export default function GoogleAnalytics() {
  /* One inline script, with gtag.js injected from inside it rather than
     rendered as its own <script src>.

     Rendered as an element, React hoists it: in the built HTML it landed at
     byte 2007, six kilobytes above the consent defaults at 6804, with nothing
     but `async` finishing its download late to keep the ordering right. That
     holds until a warm cache makes it not hold, and then GA4 initialises with
     no defaults set and may write before the banner is answered.

     Injecting it from the last line of the block that sets the defaults makes
     the ordering structural instead of probable. */
  return <script dangerouslySetInnerHTML={{ __html: consentBootstrap }} />;
}
