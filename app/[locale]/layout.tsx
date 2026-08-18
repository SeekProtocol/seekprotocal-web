import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { clientMessages } from "@/i18n/client-messages";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getMultilingualAlternates, OG_IMAGE, baseUrl } from "@/lib/seo";
import SiteEffects from "@/components/shared/SiteEffects";
import CrashLog from "@/components/shared/CrashLog";
import CookieConsent from "@/components/shared/CookieConsent";
import GoogleAnalytics from "@/components/shared/GoogleAnalytics";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { ThemeProvider, themeInitScript } from "@/components/theme/ThemeProvider";
import { bisectInitScript } from "@/lib/bisect";
import { deploymentInitScript } from "@/lib/crash-log";
import "../globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});




export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#05070e" },
  ],
};

const localeToOgLocale: Record<string, string> = {
  en: "en_US",
  nl: "nl_NL",
  de: "de_DE",
  es: "es_ES",
  fr: "fr_FR",
  zh: "zh_CN",
  ja: "ja_JP",
  ko: "ko_KR",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(baseUrl),
    // Google truncates the SERP title around 60 characters. The previous
    // default ran to 76, so "Redefining Innovation" was never shown.
    title: {
      default: "Seekprotocol | AR & AI Treasure Hunts for Real Rewards",
      template: "%s | Seekprotocol",
    },
    description:
      "Experience the future with $SEEK, the AR and AI layer for rewards that live in a place. Hunt location-based drops, collect NFTs, redeem vouchers, win real-world goods and explore with AI companions. A reward can be a token on any chain, or nothing to do with a chain at all.",
    keywords: [
      "Seekprotocol",
      "$SEEK",
      "Seekprotocol",
      "augmented reality",
      "AR platform",
      "multi-chain",
      "multi-chain",
      "chain-agnostic",
      "on-chain rewards",
      "Ethereum",
      "Solana",
      "BNB Smart Chain",
      "Arbitrum",
      "blockchain",
      "location-based airdrops",
      "NFT",
      "crypto rewards",
      "seek-to-earn",
      "move-to-earn",
      "proof of location",
      "AI companion",
      "AR treasure hunt",
      "Web3 gaming",
      "geofencing",
      "AR experiences",
      "cross-chain NFT",
      "crypto gaming",
    ],
    authors: [{ name: "Seekprotocol", url: "https://www.seekprotocol.ai" }],
    creator: "Seekprotocol",
    publisher: "Block Protocol L.L.C-FZ",
    category: "Technology",
    openGraph: {
      title: "Seekprotocol | AR & AI Treasure Hunts for Real Rewards",
      description:
        "Hunt location-based drops, collect NFTs, redeem vouchers and win real-world goods. The AR and AI layer that anchors a reward to a real place, on any chain or none at all.",
      type: "website",
      locale: localeToOgLocale[locale] || "en_US",
      alternateLocale: Object.entries(localeToOgLocale)
        .filter(([loc]) => loc !== locale)
        .map(([, ogLocale]) => ogLocale),
      url: `/${locale}`,
      siteName: "Seekprotocol",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      site: "@Seekprotocol",
      creator: "@Seekprotocol",
      title: "Seekprotocol | AR & AI Treasure Hunts for Real Rewards",
      description:
        "Hunt location-based drops, collect NFTs, redeem vouchers and win real-world goods. The AR and AI layer that anchors a reward to a real place, on any chain or none at all.",
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: getMultilingualAlternates("/", locale),
    icons: {
      icon: "/images/favicon.png",
      apple: "/images/webclip.png",
    },
    other: {
      "application-name": "Seekprotocol",
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/* The three Noto CJK families that used to be declared here were dead weight.
   They were instantiated, their `variable` was set as a class on <html> for
   zh/ja/ko, and no CSS rule ever read --font-noto-sans-sc/jp/kr: the base rules
   resolve --font-body, --font-display and --font-mono, which map to DM Sans,
   Inter Tight and JetBrains Mono. So three Google families at four weights each
   were fetched and declared to style nothing.

   They were also declared with subsets: ["latin"], which for a CJK face ships
   no CJK glyphs at all, so even wired up they could not have done the job.
   Chinese, Japanese and Korean fall back to the reader's system font today and
   still do. Giving those locales real typography is a separate piece of work,
   and it starts with the right subset. */

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      /* The pre-paint script in <head> overwrites this before anything is
         drawn. It only has to match the provider's own initial state so the
         server and the first client render agree. */
      data-theme="dark"
      suppressHydrationWarning
      className={`${dmSans.variable} ${interTight.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        {/* Sets the theme before first paint so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Diagnostic switches (?fx=off, ?anim=off, ?img=off, ?3d=off). Before
            first paint for the same reason: a flag has to hold for frame one. */}
        <script dangerouslySetInnerHTML={{ __html: bisectInitScript }} />
        {/* Reads the build id off <html> before React hydrates it away, so the
            crash log can tell a deploy-triggered reload from a reader's. */}
        <script dangerouslySetInnerHTML={{ __html: deploymentInitScript }} />
        {/* Consent Mode defaults, then GA4. In <head> and last among these,
            because the defaults have to reach the dataLayer before the tag
            reads it, that ordering is what keeps Google from writing anything
            to the device before the banner is answered. */}
        <GoogleAnalytics />
      </head>
      <body>
        <NextIntlClientProvider messages={clientMessages(messages)}>
          {/* First in the tree so its listeners are attached before anything
              below it has had a chance to throw. Renders nothing. */}
          <CrashLog />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "@id": "https://www.seekprotocol.ai/#organization",
                    name: "Seekprotocol",
                    /* No alternateName. It held the app's old name, which was a
                       useful thing to tell Google while the two differed and is
                       a claim on a mark we do not hold now that they do not. */
                    url: "https://www.seekprotocol.ai",
                    /* Google requires a logo of at least 112px on its shortest
                       side. The favicon is 32px, so it was being discarded. */
                    logo: {
                      "@type": "ImageObject",
                      url: "https://www.seekprotocol.ai/images/webclip.png",
                      width: 256,
                      height: 256,
                    },
                    legalName: "Block Protocol L.L.C-FZ",
                    description:
                      "The AR and AI layer for rewards that live in a place: tokens on any chain, vouchers, real-world goods. Hunt location-based drops, collect NFTs, and explore with AI companions.",
                    sameAs: [
                      "https://x.com/Seekprotocol",
                      "https://t.me/seekprotocol",
                      "https://discord.gg/seekprotocol",
                    ],
                    contactPoint: {
                      "@type": "ContactPoint",
                      contactType: "customer support",
                      email: "support@seekprotocol.ai",
                      url: "https://www.seekprotocol.ai/en/contact",
                      availableLanguage: routing.locales.map((loc) => loc),
                    },
                    foundingLocation: {
                      "@type": "Place",
                      name: "Dubai, UAE",
                    },
                  },
                  {
                    "@type": "WebSite",
                    "@id": "https://www.seekprotocol.ai/#website",
                    url: `https://www.seekprotocol.ai/${locale}`,
                    name: "Seekprotocol",
                    publisher: {
                      "@id": "https://www.seekprotocol.ai/#organization",
                    },
                    description:
                      "The AR and AI layer for rewards that live in a place, turning real-world exploration into rewards worth collecting.",
                    inLanguage: locale,
                    availableLanguage: routing.locales.map((loc) => ({
                      "@type": "Language",
                      name: loc,
                    })),
                  },
                  /* The app node: what the thing is, and who publishes it.
                     Named, addressable and pointed at its own page, so the
                     graph has somewhere to send a reader looking for the app
                     rather than the protocol.

                     It used to carry `alternateName` variants of the old name,
                     including one with a trademark symbol on it. Those are gone
                     with the rename. Asserting a mark we do not hold would be a
                     claim rather than a description, and structured data is
                     read as a statement of fact about the thing it describes.
                     The old name is explained once, in the announcement post,
                     and is not carried as a name anywhere on the site. */
                  {
                    "@type": "SoftwareApplication",
                    "@id": "https://www.seekprotocol.ai/#seekar",
                    name: "Seekprotocol",
                    url: `https://www.seekprotocol.ai/${locale}/seekar`,
                    operatingSystem: "iOS, Android",
                    applicationCategory: "GameApplication",
                    description:
                      "AR-powered mobile app that turns real-world locations into interactive treasure hunts. Rewards range from tokens on any chain to vouchers and physical goods.",
                    publisher: {
                      "@id": "https://www.seekprotocol.ai/#organization",
                    },
                    offers: {
                      "@type": "Offer",
                      price: "0",
                      priceCurrency: "USD",
                    },
                    installUrl: [
                      "https://apps.apple.com/app/seekar/id6752813761",
                      "https://play.google.com/store/apps/details?id=com.seekar.seekar",
                    ],
                    sameAs: [
                      "https://apps.apple.com/app/seekar/id6752813761",
                      "https://play.google.com/store/apps/details?id=com.seekar.seekar",
                    ],
                  },
                ],
              }),
            }}
          />
          {/* No copy/context/select-blocking script here on purpose.

              A previous version registered listeners for `contextmenu`, `copy`,
              `cut`, `selectstart` and the Ctrl/Cmd shortcuts for C/X/A/U/S, all
              set to `preventDefault`. It was removed for four separate reasons
              and should not come back without addressing all of them:

              1. LLM discoverability. robots.txt explicitly allows OAI-SearchBot,
                 ChatGPT-User, PerplexityBot, Claude-User, Claude-SearchBot,
                 Google-Extended, Applebot-Extended, GPTBot, ClaudeBot and
                 anthropic-ai. That policy is a public bet that being quotable in
                 an assistant's answer is worth more than withholding the
                 content. A user who cannot copy a sentence from this site into
                 their AI chat is a user who cannot ask their AI about us, the
                 script contradicted the file we ship next to it.

              2. Accessibility. Screen readers and assistive tech expect the
                 selection model to work. Blocking selectstart breaks translation
                 tools, read-aloud modes and the built-in accessibility features
                 on every platform.

              3. Discoverability for humans. Ctrl/Cmd+S is used to save reading
                 for later; Ctrl/Cmd+U is used by any developer or partner
                 evaluating whether to integrate. Blocking them cost curiosity
                 for no gain.

              4. It did not protect anything. Anyone motivated to copy the copy
                 already used the browser DevTools or `view-source:`, neither of
                 which the listeners could reach. The people it blocked were the
                 casual readers who would have quoted us. */}
          <ThemeProvider>
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <SiteHeader />
            <CookieConsent>
              <main id="main-content">{children}</main>
            </CookieConsent>
            <SiteFooter />
            <SiteEffects />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
