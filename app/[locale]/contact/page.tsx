import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getMultilingualAlternates, OG_IMAGE } from "@/lib/seo";
import ContactForm from "@/components/shared/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Contact Us - Get in Touch",
    description:
      "Contact the Seek Protocol team for partnerships, inquiries, beta access, or collaboration opportunities. Reach out to learn more about SeekAR and $SEEK on Solana.",
    openGraph: {
      title: "Contact Seek Protocol",
      description:
        "Get in touch with the Seek Protocol team for partnerships, beta access, and collaboration on AR & AI experiences on Solana.",
      url: `/${locale}/contact`,
      images: [OG_IMAGE],
    },
    twitter: {
      title: "Contact Seek Protocol",
      description:
        "Reach out to the Seek Protocol team for partnerships, beta access, and collaboration opportunities.",
      images: [OG_IMAGE],
    },
    alternates: getMultilingualAlternates("/contact", locale),
  };
}

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
    <>
      <section className="page-head">
        <div className="grid-field" aria-hidden="true" />
        <div className="noise-layer" aria-hidden="true" />
        <div className="shell">
          <div className="page-head-inner">
            <p className="eyebrow">Contact</p>
            <h1 className="t-h1 page-head-title">{t("getInTouch")}</h1>
            <p className="t-lead">{t("formDesc")}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="contact-layout">
            <div className="contact-form-wrap reveal">
              <ContactForm />
            </div>

            <aside className="contact-aside reveal">
              <div className="card">
                <p className="t-mono" style={{ marginBottom: "0.75rem" }}>
                  Elsewhere
                </p>
                <ul className="contact-links">
                  <li>
                    <a
                      href="https://x.com/seekprotocol"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      X / Twitter
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://t.me/+Nrn7K1pRN9M3OTU0"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Telegram
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://seekprotocol.gitbook.io/seekprotocol"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Documentation
                    </a>
                  </li>
                </ul>
              </div>

              <div className="card">
                <p className="t-mono" style={{ marginBottom: "0.75rem" }}>
                  Registered office
                </p>
                <p className="t-small">
                  Block Protocol L.L.C-FZ
                  <br />
                  Meydan Grandstand, 6th floor
                  <br />
                  Meydan Road, Nad Al Sheba
                  <br />
                  Dubai, U.A.E.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
