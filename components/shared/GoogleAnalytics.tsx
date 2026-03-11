/**
 * Google Analytics 4 — Google Consent Mode v2 integration.
 *
 * Consent defaults are set as an inline script to avoid render-blocking.
 * The actual GA4 script is loaded dynamically by the CookieConsent
 * component only after the user gives consent.
 *
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID in your environment variables.
 */

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

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
