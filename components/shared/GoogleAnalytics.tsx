/**
 * Google Analytics 4 — Google Consent Mode v2 integration.
 *
 * Consent defaults are set as an inline script to avoid render-blocking.
 * The actual GA4 script is loaded dynamically by the CookieConsent
 * component only after the user gives consent.
 *
 * The property is written out below rather than left to the environment.
 * NEXT_PUBLIC_GA_MEASUREMENT_ID was never set on the deployment, so the id was
 * the empty string, loadGoogleAnalytics() returned on its first line, and the
 * site has never sent a single event. Everything downstream of it — the banner,
 * the cookie, Consent Mode — was working perfectly on a measurement id that did
 * not exist.
 *
 * A GA4 measurement id is not a secret. It is handed to every visitor in the
 * page source by design, it identifies a property rather than authorising
 * anything against it, and it cannot be used to read the data. Keeping it in
 * the environment bought nothing and cost the entire integration.
 *
 * The environment still wins where it is set, so a staging deployment can point
 * at its own property without touching this file.
 */

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ERQZV9BXQV';

export default function GoogleAnalytics() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
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
          window.__GA_MEASUREMENT_ID='${GA_MEASUREMENT_ID}';
        `,
      }}
    />
  );
}
