/**
 * Google Consent Mode v2, in its advanced form, for GA4 and Tag Manager.
 *
 * Everything here turns on one rule: the consent defaults have to be in the
 * dataLayer before any Google tag reads it. Both tags below are loaded from
 * this file, after that block and never before it, which is the only ordering
 * that makes the rest of it true.
 *
 * **Advanced rather than basic.** The tags load on every visit instead of
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
 * `wait_for_update: 500` holds the tags for half a second so a returning reader
 * whose choice is already in the cookie has it applied before the first hit
 * goes out, rather than sending one denied hit and correcting afterwards.
 *
 * CookieConsent sends `consent update` when the banner is answered and when a
 * stored choice is read back. It no longer loads anything: with the tags always
 * present, granting consent is a message, not an installation.
 *
 * Ids are written out and overridable. A GA4 measurement id and a GTM container
 * id are both public by design — they ship in the page source, name a property
 * rather than authorise anything against it, and cannot be used to read the
 * data. Leaving them to the environment is how the site went live with an empty
 * measurement id and no analytics at all.
 */

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ERQZV9BXQV';

const GTM_CONTAINER_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-59RP4R4B';

/**
 * Runs before either tag. Order inside it is the whole point:
 * dataLayer, then gtag, then the defaults, then — and only then — the tags.
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
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');
(function(d,i){var g=d.createElement('script');g.async=true;
g.src='https://www.googletagmanager.com/gtag/js?id='+i;
var f=d.getElementsByTagName('script')[0];f.parentNode.insertBefore(g,f);})(document,'${GA_MEASUREMENT_ID}');
`;

export default function GoogleAnalytics() {
  /* One inline script, and gtag.js injected from inside it rather than rendered
     as its own <script src>.

     Rendered as an element, React hoists it: it lands near the top of <head>,
     several kilobytes above the consent defaults, and the only thing keeping
     the defaults in front of it is that `async` usually finishes downloading
     later. Measured in the built HTML — gtag.js at byte 2007, the defaults at
     6804. Usually is not a guarantee, and a warm cache is exactly the case
     where it stops being true; GA4 would then initialise with no defaults set
     and could write a cookie before the banner had been answered.

     Injecting it from the last line of the block that sets the defaults makes
     the ordering structural instead of probable. */
  return <script dangerouslySetInnerHTML={{ __html: consentBootstrap }} />;
}

/**
 * The GTM fallback for readers without JavaScript. Belongs immediately after
 * the opening <body> tag, which is why it is a separate export rather than part
 * of the component above — that one renders in <head>, where an iframe cannot go.
 *
 * Needs googletagmanager.com on `frame-src` in the CSP. It was not there, and
 * the frame was blocked outright until it was added.
 */
export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
