import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OpenApp } from "@/components/open/OpenApp";

/**
 * A link that opens the app, or its store when the app is not there.
 *
 * Mails and posts link here (seekprotocol.ai/en/open) because the app has no
 * universal links yet. The work happens on the device, in OpenApp.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "openApp" });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function OpenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OpenApp />;
}
