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
      default: "Seek Protocol | The First AR & AI Platform on Solana",
      template: "%s | Seek Protocol",
    },
    description:
      "Experience the future with $SEEK, the first AR and AI platform on Solana. Hunt location-based airdrops, collect NFTs, explore with AI companions, and earn real crypto rewards through immersive augmented reality experiences.",
    keywords: [
      "Seek Protocol",
      "$SEEK",
      "SeekAR",
      "augmented reality",
      "AR platform",
      "Solana",
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
      "Solana NFT",
      "crypto gaming",
    ],
    authors: [{ name: "Seek Protocol", url: "https://www.seekprotocol.ai" }],
    creator: "Seek Protocol",
    publisher: "Block Protocol L.L.C-FZ",
    category: "Technology",
    openGraph: {
      title: "Seek Protocol | The First AR & AI Platform on Solana",
      description:
        "Hunt location-based airdrops, collect NFTs, and explore with AI companions. The first AR & AI platform on Solana transforming real-world exploration into crypto rewards.",
      type: "website",
      locale: localeToOgLocale[locale] || "en_US",
      alternateLocale: Object.entries(localeToOgLocale)
        .filter(([loc]) => loc !== locale)
        .map(([, ogLocale]) => ogLocale),
      url: `/${locale}`,
      siteName: "Seek Protocol",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      site: "@SeekProtocol",
      creator: "@SeekProtocol",
      title: "Seek Protocol | The First AR & AI Platform on Solana",
      description:
        "Hunt location-based airdrops, collect NFTs, and explore with AI companions. The first AR & AI platform on Solana transforming real-world exploration into crypto rewards.",
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
      "application-name": "Seek Protocol",
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
      </head>
      <body>
        <NextIntlClientProvider messages={clientMessages(messages)}>
          {/* First in the tree so its listeners are attached before anything
              below it has had a chance to throw. Renders nothing. */}
          <CrashLog />
          <GoogleAnalytics />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "@id": "https://www.seekprotocol.ai/#organization",
                    name: "Seek Protocol",
                    alternateName: "SeekAR",
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
                      "The first AR and AI platform on Solana. Hunt location-based airdrops, collect NFTs, and explore with AI companions.",
                    sameAs: [
                      "https://x.com/SeekProtocol",
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
                    name: "Seek Protocol",
                    publisher: {
                      "@id": "https://www.seekprotocol.ai/#organization",
                    },
                    description:
                      "The first AR and AI platform on Solana transforming real-world exploration into crypto rewards.",
                    inLanguage: locale,
                    availableLanguage: routing.locales.map((loc) => ({
                      "@type": "Language",
                      name: loc,
                    })),
                  },
                  {
                    "@type": "SoftwareApplication",
                    name: "SeekAR",
                    operatingSystem: "iOS, Android",
                    applicationCategory: "GameApplication",
                    description:
                      "AR-powered mobile app on Solana that transforms real-world locations into interactive treasure hunts with crypto rewards.",
                    offers: {
                      "@type": "Offer",
                      price: "0",
                      priceCurrency: "USD",
                    },
                    installUrl: [
                      "https://apps.apple.com/app/seekar/id6752813761",
                      "https://play.google.com/store/apps/details?id=com.seekar.seekar",
                    ],
                  },
                ],
              }),
            }}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `document.addEventListener('contextmenu',function(e){e.preventDefault()});document.addEventListener('copy',function(e){e.preventDefault()});document.addEventListener('cut',function(e){e.preventDefault()});document.addEventListener('selectstart',function(e){e.preventDefault()});document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&(e.key==='c'||e.key==='x'||e.key==='a'||e.key==='u'||e.key==='s')){e.preventDefault()}});`,
            }}
          />
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
