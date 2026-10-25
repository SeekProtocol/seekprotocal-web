import Image from "next/image";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { listCopy, withCopy } from "@/lib/content-i18n";
import WatchShow, { type WatchShowCopy } from "@/components/sections/WatchShow";
import { STEP_LADDER } from "@/content/devices";

/**
 * Steps, and the two watch apps that carry them.
 *
 * Two halves on purpose. The top is the mechanic, which works from the phone
 * alone through Apple Health or Health Connect; the watches below are a way
 * to see it and, on Apple Watch, to record a walk. Leading with the watches
 * would read as "needs a watch", and it does not.
 *
 * Every figure is the app's own (`lib/steps/ladder.ts`), and the watch faces
 * are rebuilt from the watch apps' layout, live (WatchShow).
 */
export default function StepsSection() {
  const t = useTranslations("stepsSection");
  const format = useFormatter();
  const locale = useLocale();
  const rarity = useTranslations("rarity");
  const ladder = withCopy(t, STEP_LADDER.map((tier) => ({ ...tier })), ["reward"]);

  /* Raw, not formatted: the faces fill the placeholders on every tick, on the
     client, where the message files are not shipped. */
  const face = (key: string) => t.raw(`face.${key}`) as string;
  const faceCopy: WatchShowCopy = {
    today: face("today"),
    steps: face("steps"),
    walk: face("walk"),
    streak: face("streak"),
    best: face("best"),
    byHour: face("byHour"),
    toNext: face("toNext"),
    nextStreak: face("nextStreak"),
    end: face("end"),
    rewards: {
      fitness: t("fitness.reward"),
      xpBoost: t("xpBoost.reward"),
      spawnLure: t("spawnLure.reward"),
    },
    tierSteps: t.raw("stepsCount") as string,
    chipUnlocked: face("chipUnlocked"),
    chipXp: face("chipXp"),
    chipKcal: face("chipKcal"),
    chipStreak: face("chipStreak"),
    collection: face("collection"),
    caughtToday: face("caughtToday"),
    chipCaught: face("chipCaught"),
    rarity: {
      common: rarity("common"),
      uncommon: rarity("uncommon"),
      rare: rarity("rare"),
      epic: rarity("epic"),
      legendary: rarity("legendary"),
    },
    label: face("label"),
  };

  return (
    <div className="steps-band" id="steps">
      <div className="steps-layout">
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

        <div className="reveal">
          <ol className="steps-ladder" aria-label={t("ladderLabel")}>
            {ladder.map((tier, i) => (
              <li key={tier.id} style={{ ["--tier" as string]: i }}>
                <span className="steps-ladder-icon">
                  <Image src={tier.icon} alt="" width={96} height={96} />
                </span>
                <span className="steps-ladder-count">
                  {t("stepsCount", { count: format.number(tier.steps) })}
                </span>
                <span className="steps-ladder-reward">{tier.reward}</span>
                <span className="steps-ladder-bar" aria-hidden="true" />
              </li>
            ))}
          </ol>
          <p className="t-mono-sm steps-ladder-note">{t("ladderNote")}</p>
        </div>
      </div>

      <div className="wrist">
        <div className="reveal">
          <WatchShow copy={faceCopy} locale={locale} />
        </div>

        <div className="wrist-copy">
          <div className="sec-head-center reveal">
            <p className="eyebrow eyebrow-center">{t("watchEyebrow")}</p>
            <h3 className="t-h2 wrist-title">{t("watchTitle")}</h3>
            <p className="t-lead" style={{ marginTop: "1rem" }}>
              {t("watchLead")}
            </p>
          </div>

          <div className="wrist-cards">
            {(["apple", "wear"] as const).map((platform, i) => (
              <article
                key={platform}
                className="wrist-card reveal"
                style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}
              >
                <p className="t-mono-sm wrist-card-kicker">{t(`${platform}.kicker`)}</p>
                <h4 className="wrist-card-title">{t(`${platform}.title`)}</h4>
                <ul className="showcase-points">
                  {listCopy(t, `${platform}.points`).map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <p className="t-mono-sm wrist-card-req">{t(`${platform}.requires`)}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
