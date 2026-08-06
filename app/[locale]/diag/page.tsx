import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import DiagView from "./DiagView";

/**
 * The crash log, readable on the phone that crashed.
 *
 * Not linked from anywhere and kept out of the index. It is a tool, not a page:
 * it holds no content anyone searched for, and a diagnostics view in the results
 * would be a poor first impression of the site.
 */
export const metadata: Metadata = {
  title: "Diagnostics",
  robots: { index: false, follow: false, nocache: true },
};

export default async function DiagPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DiagView />;
}
