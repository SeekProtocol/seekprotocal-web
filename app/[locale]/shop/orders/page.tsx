import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import OrdersMount from "@/components/shop/OrdersMount";

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "shop.history"});
  return {title: t("title"), description: t("lead"), robots: {index: false, follow: false}};
}

export default async function OrdersPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shop.history");
  return <>
    <section className="page-head shop-page-head"><div className="shell"><div className="page-head-inner">
      <p className="eyebrow">SeekAR Shop</p><h1 className="t-h1 page-head-title">{t("title")}</h1><p className="t-lead">{t("lead")}</p>
    </div></div></section>
    <section className="section section-tight"><div className="shell"><OrdersMount /></div></section>
  </>;
}
