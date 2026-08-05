import { useTranslations } from "next-intl";
import { StatusBar } from "@/components/app/PhoneFrame";
import {
  MAX_ATTEMPTS,
  RARITY_LADDER,
  RETRY_DECAY,
  type Collectible,
} from "@/content/collectibles";

/** The spawn card: what it is, how rare, and what your odds actually are. */
export default function SpawnScreen({
  coin,
  attempt,
  onBack,
  onCatch,
}: {
  coin: Collectible;
  attempt: number;
  onBack: () => void;
  onCatch: () => void;
}) {
  const t = useTranslations("spawnScreen");
  const rarity = useTranslations("rarity");
  const ladder = RARITY_LADDER[coin.rarity];
  const thisAttempt = ladder.base * Math.pow(RETRY_DECAY, attempt - 1);

  return (
    <div className="scr scr-spawn" style={{ ["--rarity" as string]: ladder.colour }}>
      <StatusBar />

      <button type="button" className="scr-back" onClick={onBack}>
        {t("back")}
      </button>

      <div className="spawn-hero">
        <span className="spawn-hero-glow" aria-hidden="true" />
        <img src={coin.image} alt="" className="spawn-hero-coin" />
      </div>

      <div className="spawn-head">
        <span className="spawn-rarity">{rarity(coin.rarity)}</span>
        <h2 className="spawn-name">{coin.name}</h2>
        <p className="spawn-symbol">${coin.symbol}</p>
      </div>

      <div className="spawn-stats">
        <div>
          <span className="spawn-stat-label">{t("distance")}</span>
          <span className="spawn-stat-value">{t("inRange")}</span>
        </div>
        <div>
          <span className="spawn-stat-label">{t("thisAttempt")}</span>
          <span className="spawn-stat-value" style={{ color: ladder.colour }}>
            {Math.round(thisAttempt * 100)}%
          </span>
        </div>
        <div>
          <span className="spawn-stat-label">{t("attemptsLeft")}</span>
          <span className="spawn-stat-value">
            {t("attemptsOf", { left: MAX_ATTEMPTS - attempt + 1, total: MAX_ATTEMPTS })}
          </span>
        </div>
      </div>

      <div className="spawn-note">
        <span className="spawn-note-dot" />
        <p>{t("note")}</p>
      </div>

      <button type="button" className="scr-cta" onClick={onCatch}>
        {t("cta")}
      </button>
    </div>
  );
}
