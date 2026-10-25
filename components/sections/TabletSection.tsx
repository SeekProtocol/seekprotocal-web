import { useTranslations } from "next-intl";
import { listCopy } from "@/lib/content-i18n";
import { ScreenSlides, TabletTilt } from "@/components/app/DeviceMockups";
import { AR_SLIDES } from "@/content/devices";

/**
 * The app on iPad and Android tablets.
 *
 * Phone first, tablet as well: the copy says the app is made for the phone in
 * your pocket and also runs properly on a tablet, not that it is a tablet app.
 * The screen is AR, because a catch on a large screen is the thing a tablet
 * shows best: a Rare, an Epic and a Legendary drop, the app's own iPad render
 * over a CC0 street photo of Haarlem (credit in the store kit's
 * PHOTO-CREDIT.txt; the store screenshots use the same three).
 */
export default function TabletSection() {
  const t = useTranslations("tabletSection");

  return (
    <div className="tablet-band" id="ipad">
      <div className="tablet-band-stage reveal">
        <span className="tablet-band-glow" aria-hidden="true" />
        <TabletTilt label={t("tabletLabel")}>
          <ScreenSlides slides={AR_SLIDES} sizes="(max-width: 768px) 80vw, 520px" />
        </TabletTilt>
      </div>

      <div className="sec-head reveal">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="t-h2">{t("title")}</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          {t("lead")}
        </p>
        <ul className="showcase-points">
          {listCopy(t, "points").map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
