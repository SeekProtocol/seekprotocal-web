import type { Metadata } from "next";
import { getMultilingualAlternates } from "@/lib/seo";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import styles from "./privacy-policy.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Privacy Policy",
    description:
      "Read the Seek Protocol and SeekAR privacy policy. Learn how we collect, use, and protect your personal data, location information, and blockchain wallet details.",
    openGraph: {
      title: "Privacy Policy - Seek Protocol",
      description:
        "Seek Protocol's privacy policy. How we handle your data, location info, and wallet details in SeekAR.",
      url: `/${locale}/privacy-policy`,
      images: [
        {
          url: "https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png",
          width: 1200,
          height: 630,
          alt: "Seek Protocol Privacy Policy",
        },
      ],
    },
    twitter: {
      title: "Privacy Policy - Seek Protocol",
      description:
        "How Seek Protocol handles your data, location info, and wallet details in the SeekAR app.",
      images: [
        {
          url: "https://cdn.prod.website-files.com/689dda35eca0c273668f15aa/68b7ea7afbe50cfcdef0c342_SeekAR%20(30).png",
          width: 1200,
          height: 630,
          alt: "Seek Protocol Privacy Policy",
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: getMultilingualAlternates("/privacy-policy", locale),
  };
}

export default function PrivacyPolicyPage() {
  return (
    <div className="page-wrapper">
      <Navigation />
      <section className="change-log">
        <div className="container">
          <div className="change-log-wrap">
            <div className="change-log-top">
              <div className="hero-top-wrap">
                <div className="hero-01-text-wrap">
                  <h1 className={`h1 ${styles.pageTitle}`}>Privacy Policy</h1>
                </div>
              </div>
            </div>
            <div className="change-log-bottom">
              <div className={`rich-text-block w-richtext ${styles.content}`}>
                <p className={styles.subtitle}>
                  SeekAR — Block Protocol LLC
                  <br />
                  Effective: August 12, 2025
                </p>

                <h2>Introduction</h2>
                <p>
                  This Privacy Policy applies to the SeekAR mobile application
                  (referred to throughout this document as &quot;the
                  Application&quot;), developed and maintained by Block Protocol LLC
                  (referred to as &quot;the Service Provider&quot;) as a free service
                  for mobile devices. The Application is provided on an &quot;AS
                  IS&quot; basis.
                </p>
                <p>
                  This policy describes in full the personal data that the Application
                  collects, how that data is used and retained, with whom it may be
                  shared, and the rights available to users with respect to their
                  personal information. By downloading and using the Application, you
                  consent to the data practices described herein. This policy should be
                  reviewed regularly, as it may be updated from time to time.
                </p>

                <h2>Part I — Information Collection and Use</h2>
                <p>
                  The Application collects information when you download and use it.
                  This includes technical data gathered automatically by the
                  Application, such as your device&apos;s Internet Protocol (IP)
                  address, the pages or sections of the Application you visit, the time
                  and date of your visits, the duration of time spent on those pages,
                  and information about the operating system running on your mobile
                  device.
                </p>
                <p>
                  Beyond this automatically collected technical data, the Application
                  collects several categories of personal information as described in
                  detail below.
                </p>

                <h3>1. Personal Information</h3>
                <p>
                  The Application collects personally identifiable information
                  including your name, email address, and user identifiers (User IDs).
                  Your name is collected to support core app functionality, including
                  personalizing the user interface and identifying your account within
                  the platform. Your email address is collected to enable account
                  creation, authentication, and the delivery of service-related
                  communications. User IDs — unique identifiers assigned to each
                  account or session — are used to support app functionality, conduct
                  internal analytics regarding how the Application is used, enforce
                  security and fraud prevention measures, deliver advertising or
                  marketing communications, and manage account-level features and
                  permissions.
                </p>
                <p>
                  The Service Provider may use the information you provide to contact
                  you from time to time in order to deliver important notices, required
                  disclosures, and marketing promotions. For a better experience while
                  using the Application, the Service Provider may require you to submit
                  certain personally identifiable information including, but not limited
                  to, your email address, User ID, age, and name. This information will
                  be retained and used as described in this Privacy Policy.
                </p>

                <h3>2. Location Data</h3>
                <p>
                  The Application collects both approximate and precise location data
                  from your device.
                </p>
                <p>
                  Approximate location data, which identifies your general geographic
                  area without pinpointing your exact position, is collected to support
                  core app functionality and to conduct internal analytics regarding how
                  users engage with location-based features across different geographic
                  regions. This general location data also helps the Service Provider
                  deliver advertising or marketing relevant to your region and provide
                  basic personalization of content and experiences.
                </p>
                <p>
                  Precise location data — meaning exact geographic coordinates derived
                  from GPS or equivalent technologies — is collected for a broader set
                  of purposes that reflect the location-centric nature of the
                  Application. These purposes include supporting augmented reality and
                  other core features that depend on exact real-world positioning,
                  conducting detailed usage analytics, transmitting relevant developer
                  communications based on your location, applying security and fraud
                  prevention measures tied to geographic activity patterns, enabling
                  location-targeted advertising and marketing, personalizing content and
                  experiences to your precise environment, and managing account features
                  or service conditions that depend on geographic parameters.
                </p>

                <h3>3. Messages</h3>
                <p>
                  The Application collects emails and other in-app messages. Both types
                  of messaging data are collected exclusively to support core app
                  functionality, including communication between users and the platform
                  and the delivery of service-related notifications or interactions
                  within the Application&apos;s ecosystem.
                </p>

                <h3>4. Photos and Videos</h3>
                <p>
                  The Application collects photos and videos from your device. This
                  data is used to support app functionality, particularly in the context
                  of augmented reality features that require access to the device camera
                  and media library for overlaying digital content onto physical
                  environments or capturing moments within the Application&apos;s
                  interactive experiences.
                </p>

                <h3>5. Health and Fitness Information</h3>
                <p>
                  The Application collects health-related information and
                  fitness-related information. Both categories are used exclusively to
                  support app functionality, enabling the Application to integrate
                  physical activity or health context into its experiences where
                  relevant, and to support gamified real-world engagement features that
                  interact with your personal health or fitness profile.
                </p>

                <h3>6. App Performance and Diagnostic Data</h3>
                <p>
                  The Application collects technical data related to its own
                  performance, including crash logs, diagnostic information, and other
                  app performance metrics. Crash logs are collected by default in order
                  to identify, diagnose, and resolve technical failures that affect the
                  user experience. Diagnostic information and other performance data are
                  collected optionally, and are used to monitor, maintain, and improve
                  the stability and responsiveness of the Application over time. All of
                  this data is used solely in support of app functionality and service
                  improvement.
                </p>

                <h3>7. Files and Documents</h3>
                <p>
                  The Application may optionally collect files and documents stored on
                  or accessible from your device. This collection occurs only in
                  contexts where your interaction with the Application directly involves
                  files or documents, and the data collected in this way is used solely
                  to support core app functionality.
                </p>

                <h2>Part II — Third-Party Access and Data Sharing</h2>
                <p>
                  Only aggregated, anonymized data is periodically transmitted to
                  external services to assist the Service Provider in improving the
                  Application and their services. The Service Provider may share your
                  information with third parties in the ways described in this section.
                </p>
                <p>
                  The Application may disclose both user-provided and automatically
                  collected information when required to do so by law — for example, in
                  response to a subpoena or similar legal process — or when the Service
                  Provider believes in good faith that disclosure is necessary to
                  protect their rights, protect your safety or the safety of others,
                  investigate fraud, or respond to a government request. Information may
                  also be shared with trusted service providers who work on the Service
                  Provider&apos;s behalf, who do not have independent use of the
                  information disclosed to them, and who have agreed to adhere to the
                  rules set forth in this Privacy Policy.
                </p>
                <p>
                  Beyond those general circumstances, the Application shares specific
                  categories of data with third-party service providers and partners as
                  follows.
                </p>

                <h3>1. Location Data</h3>
                <p>
                  Approximate location data is shared with third parties to support app
                  functionality, enable advertising or marketing relevant to a
                  user&apos;s general region, and provide personalized content and
                  experiences based on geographic context.
                </p>
                <p>
                  Precise location data is shared for a broader range of purposes,
                  including supporting core app functionality, conducting analytics,
                  enabling developer communications tied to location, preventing fraud
                  and ensuring security compliance, delivering targeted advertising and
                  marketing, personalizing the user experience, and managing account
                  features that depend on geographic parameters.
                </p>

                <h3>2. Device Identifiers and Other IDs</h3>
                <p>
                  Device identifiers and similar technical identifiers are shared with
                  third parties to support app functionality that depends on
                  device-level recognition, to enforce security measures and prevent
                  fraudulent activity, and to support advertising and marketing systems
                  that rely on device-level targeting to deliver relevant promotions and
                  measure campaign effectiveness.
                </p>

                <h3>3. Third-Party Service Providers</h3>
                <p>
                  The Application integrates third-party services that have their own
                  privacy policies governing how they handle data received from the
                  Application. The Service Provider encourages users to review those
                  policies directly. The third-party service providers currently used by
                  the Application are:
                </p>
                <ul role="list">
                  <li>
                    <a href="https://www.google.com/policies/privacy/">
                      Google Play Services
                    </a>
                  </li>
                  <li>
                    <a href="https://unity3d.com/legal/privacy-policy">Unity</a>
                  </li>
                  <li>
                    <a href="https://www.mapbox.com/legal/privacy">Mapbox</a>
                  </li>
                </ul>

                <h2>Part III — Opt-Out Rights</h2>
                <p>
                  You may stop all collection of information by the Application at any
                  time by uninstalling it. You may use the standard uninstall processes
                  available on your mobile device or through the applicable mobile
                  application marketplace.
                </p>

                <h2>Part IV — Data Retention</h2>
                <p>
                  The Service Provider will retain user-provided data for as long as
                  you use the Application and for a reasonable period thereafter in
                  order to fulfill legitimate operational, legal, or administrative
                  needs. If you would like the Service Provider to delete user-provided
                  data that you have submitted through the Application, please contact
                  them at{" "}
                  <a href="mailto:support@seekprotocol.ai">
                    support@seekprotocol.ai
                  </a>{" "}
                  and they will respond within a reasonable timeframe.
                </p>

                <h2>Part V — Children</h2>
                <p>
                  The Service Provider does not use the Application to knowingly
                  solicit data from or market to children under the age of 13. The
                  Application is not directed at anyone under the age of 13, and the
                  Service Provider does not knowingly collect personally identifiable
                  information from children in that age group. If the Service Provider
                  discovers that a child under 13 has provided personal information, it
                  will be deleted from their servers immediately. If you are a parent or
                  guardian and you believe your child has provided personal information
                  to the Application, please contact the Service Provider at{" "}
                  <a href="mailto:support@seekprotocol.ai">
                    support@seekprotocol.ai
                  </a>{" "}
                  so that they may take the necessary corrective action.
                </p>

                <h2>Part VI — Security</h2>
                <p>
                  The Service Provider is committed to safeguarding the confidentiality
                  and integrity of your information. Physical, electronic, and
                  procedural safeguards are maintained to protect the information that
                  the Service Provider processes and retains through the Application.
                </p>

                <h2>Part VII — User Rights and Data Deletion</h2>
                <p>
                  Users have the right to request deletion of their account and all
                  associated data. Such requests may be submitted through the SeekAR
                  website at:{" "}
                  <a href="https://www.seekprotocol.ai/">
                    https://www.seekprotocol.ai/
                  </a>
                </p>
                <p>
                  It should be noted that the Service Provider does not currently
                  provide an automated in-application mechanism for submitting deletion
                  requests. All requests must be submitted through the website link
                  above or by contacting the Service Provider directly at{" "}
                  <a href="mailto:support@seekprotocol.ai">
                    support@seekprotocol.ai
                  </a>
                  . The Service Provider will respond to all such requests within a
                  reasonable timeframe.
                </p>
                <p>
                  For a full understanding of how your personal data is managed,
                  stored, and processed, users are encouraged to consult this Privacy
                  Policy in its entirety at{" "}
                  <a href="https://www.seekprotocol.ai/en/privacy-policy">
                    https://www.seekprotocol.ai/en/privacy-policy
                  </a>
                  .
                </p>

                <h2>Part VIII — Changes to This Policy</h2>
                <p>
                  This Privacy Policy may be updated from time to time for any reason.
                  The Service Provider will notify you of any changes by updating this
                  page with the new Privacy Policy and, where appropriate, through
                  notifications within the Application. You are advised to review this
                  Privacy Policy regularly. Continued use of the Application following
                  the posting of changes constitutes your acceptance of those changes.
                </p>

                <h2>Your Consent</h2>
                <p>
                  By using the Application, you consent to the processing of your
                  information as described in this Privacy Policy, as it exists now and
                  as it may be amended by the Service Provider in the future.
                </p>

                <h2>Contact</h2>
                <p>
                  If you have any questions regarding your privacy while using the
                  Application, or if you have questions about the data practices
                  described in this policy, please contact the Service Provider at:
                </p>
                <p>
                  Block Protocol L.L.C-FZ
                  <br />
                  Meydan Grandstand, 6th floor
                  <br />
                  Meydan Road, Nad AlSheba
                  <br />
                  Dubai, United Arab Emirates
                </p>
                <p>
                  Email:{" "}
                  <a href="mailto:support@seekprotocol.ai">
                    support@seekprotocol.ai
                  </a>
                  <br />
                  Website:{" "}
                  <a href="https://www.seekprotocol.ai">
                    https://www.seekprotocol.ai
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
