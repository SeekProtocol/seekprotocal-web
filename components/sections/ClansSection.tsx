import Image from "next/image";
import { useFormatter, useTranslations } from "next-intl";
import { withCopy } from "@/lib/content-i18n";
import LiveMark from "@/components/brand/LiveMark";
import { CLANS } from "@/content/app-features";

const MEDALS = ["/app/medals/gold.png", "/app/medals/silver.png", "/app/medals/bronze.png"];

/** Clan table, with the app's own emblems and podium medals. */
export default function ClansSection() {
  const t = useTranslations("clansSection");
  const format = useFormatter();
  const clans = withCopy(useTranslations("clans"), CLANS, ["name"]);

  return (
    <div className="clans-layout">
      <div className="clans-copy">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="t-h2">{t("title")}</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          {t("lead")}
        </p>

        <div className="clan-stats">
          <div className="clan-stat">
            <span className="t-num clan-stat-value">16</span>
            <span className="t-mono-sm">{t("statClans")}</span>
          </div>
          <div className="clan-stat">
            <span className="t-num clan-stat-value">E2E</span>
            <span className="t-mono-sm">{t("statChat")}</span>
          </div>
          <div className="clan-stat">
            <span className="t-num clan-stat-value">5</span>
            <span className="t-mono-sm">{t("statRanks")}</span>
          </div>
        </div>
      </div>

      <div className="clan-board">
        <div className="clan-board-head">
          <span className="t-mono">{t("tableTitle")}</span>
          <span className="chip chip-live">
            <LiveMark id="clans-live" />
            {t("thisSeason")}
          </span>
        </div>

        <ol className="clan-list">
          {clans.map((clan, i) => (
            <li key={clan.id} className="clan-row" data-podium={i < 3 || undefined}>
              <span className="clan-rank">
                {i < 3 ? (
                  <Image src={MEDALS[i]} alt={t("rankAlt", { rank: clan.rank })} width={28} height={28} />
                ) : (
                  <span className="t-mono">{String(clan.rank).padStart(2, "0")}</span>
                )}
              </span>
              <Image
                className="clan-emblem"
                width={38}
                height={38}
                src={`/app/clans/${clan.img}`}
                alt=""
                loading="lazy"
              />
              <span className="clan-name">{clan.name}</span>
              <span className="clan-members t-mono-sm">{format.number(clan.members)}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
