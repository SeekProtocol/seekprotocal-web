import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/shared/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us - Get in Touch",
  description:
    "Contact the Seek Protocol team for partnerships, inquiries, beta access, or collaboration opportunities. Reach out to learn more about SeekAR and $SEEK on Solana.",
  openGraph: {
    title: "Contact Seek Protocol",
    description:
      "Get in touch with the Seek Protocol team for partnerships, beta access, and collaboration on AR & AI experiences on Solana.",
    url: "/contact",
    images: [
      {
        url: "https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png",
        width: 1200,
        height: 630,
        alt: "Contact Seek Protocol",
      },
    ],
  },
  twitter: {
    title: "Contact Seek Protocol",
    description:
      "Reach out to the Seek Protocol team for partnerships, beta access, and collaboration opportunities.",
    images: [
      {
        url: "https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png",
        width: 1200,
        height: 630,
        alt: "Contact Seek Protocol",
      },
    ],
  },
  alternates: { canonical: "/contact" },
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent />;
}

function ContactContent() {
  const t = useTranslations("contact");

  return (
    <div className="page-wrapper">
      <Navigation />
      <section className="contact-us">
        <div className="container is-small">
          <div className="contact-us-wrap">
            <div className="contact-top-wrap">
              <h1
                data-w-id="contact-title"
                style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                className="h1 _01"
              >
                {t("getInTouch")}
              </h1>
            </div>
            <div className="contact-bottom-wrap">
              <div
                data-w-id="contact-form"
                style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                className="contact-bottom-right-wrap"
              >
                <div className="from-heading">
                  <p className="paragraph-03 text-gray-color">{t("formDesc")}</p>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
