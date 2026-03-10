import type { Metadata } from "next";
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
  },
  twitter: {
    title: "Contact Seek Protocol",
    description:
      "Reach out to the Seek Protocol team for partnerships, beta access, and collaboration opportunities.",
  },
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
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
                Get in Touch
              </h1>
            </div>
            <div className="contact-bottom-wrap">
              <div
                data-w-id="contact-form"
                style={{ opacity: 0, transform: "translate3d(0, 20%, 0)", filter: "blur(3px)" }}
                className="contact-bottom-right-wrap"
              >
                <div className="from-heading">
                  <p className="paragraph-03 text-gray-color">
                    Fill out the form below, and we&apos;ll get back to you ASAP.
                  </p>
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
