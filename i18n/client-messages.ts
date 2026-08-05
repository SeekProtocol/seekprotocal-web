import type { AbstractIntlMessages } from "next-intl";

/**
 * Which message namespaces have to reach the browser.
 *
 * The catalogue is 121KB in English and 170KB in Japanese. Handing all of it to
 * NextIntlClientProvider serialised the whole thing into the RSC payload, which
 * was 180KB of a 257KB document, 70 per cent of the HTML, on every page and in
 * every locale. Most of it was never read there: a server component calls
 * getTranslations and resolves its copy during the render, so its words are
 * already in the markup and do not need to be sent again as data.
 *
 * Only the namespaces below are read by a component that runs in the browser.
 * Filtering to them takes the payload down by about two thirds. The largest
 * exclusions are `whitepaper` at 35KB and `privacyPolicyPage` at 15KB, both of
 * which are rendered entirely on the server.
 *
 * IMPORTANT, and the reason this list is written out rather than inferred: a
 * client component asking for a namespace that is not here throws
 * MISSING_MESSAGE at runtime and takes the page down with it. If you add
 * `useTranslations("something")` to a file carrying "use client", add the
 * namespace here in the same commit. Every call site today passes a string
 * literal, so the set is knowable by grepping for it:
 *
 *   grep -rln "use client" components app | xargs grep -ohE "useTranslations\(['\"][^'\"]+['\"]"
 *
 * Note the quote-agnostic pattern. Deriving this list with a double-quote-only
 * grep the first time silently missed CookieConsent and CookieConsentButton,
 * which write 'use client' and useTranslations('cookies') with single quotes,
 * and the cookie banner lost its copy on all eight locales.
 */
export const CLIENT_NAMESPACES = [
  "achievements",
  "allocations",
  "appChrome",
  "arSection",
  "badges",
  "catchScreen",
  "collectiblesSection",
  "confidenceSignals",
  "confidenceTiers",
  "cookies",
  "deploy",
  "dropKinds",
  "economyStages",
  "featureGroups",
  "forms",
  "funnel",
  "globe",
  "glossary",
  "home",
  "languageSwitcher",
  "mobiSection",
  "nav",
  "notFound",
  "offers",
  "powerups",
  "progression",
  "ranks",
  "rarity",
  "resultScreen",
  "socialSection",
  "stackLayers",
  "timelineStages",
  "tokenFacts",
  "videoReveal",
  "walkthrough",
  "walletScreen",
  "whitepaperFigures",
  "worldDescent",
] as const;

/**
 * Narrow a catalogue to the namespaces above.
 *
 * Missing keys are skipped rather than emitted as undefined, so a namespace that
 * a locale has not been given yet behaves exactly as it did before this existed:
 * next-intl reports it missing when something asks for it, instead of failing
 * earlier and somewhere less obvious.
 */
export function clientMessages(all: AbstractIntlMessages): AbstractIntlMessages {
  const picked: Record<string, AbstractIntlMessages[string]> = {};
  for (const namespace of CLIENT_NAMESPACES) {
    if (namespace in all) picked[namespace] = all[namespace];
  }
  return picked;
}
