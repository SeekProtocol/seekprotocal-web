"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { StatusBar } from "@/components/app/PhoneFrame";
import { RARITY_LADDER, type Collectible } from "@/content/collectibles";
import type { CatchOutcome } from "@/components/app/AppWalkthrough";

const SPARKS = Array.from({ length: 14 }, (_, i) => i);

/** What the roll came back with, and the odds it was rolled against. */
export default function ResultScreen({
  coin,
  outcome,
  canRetry,
  onRetry,
  onContinue,
  onBack,
}: {
  coin: Collectible;
  outcome: CatchOutcome;
  canRetry: boolean;
  onRetry: () => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const t = useTranslations("resultScreen");
  const ladder = RARITY_LADDER[coin.rarity];

  return (
    <div
      className="scr scr-result"
      data-caught={outcome.caught || undefined}
      style={{ ["--rarity" as string]: ladder.colour }}
    >
      <StatusBar />

      <div className="result-hero">
        {outcome.caught && (
          <span className="result-burst" aria-hidden="true">
            {SPARKS.map((i) => (
              <i key={i} style={{ ["--a" as string]: `${(360 / SPARKS.length) * i}deg` }} />
            ))}
          </span>
        )}
        <span className="result-glow" aria-hidden="true" />
        <Image src={coin.image} alt="" width={130} height={130} className="result-coin" />
      </div>

      <p className="result-verdict">{outcome.caught ? t("caught") : t("escaped")}</p>
      <h2 className="result-name">
        {outcome.caught ? `${outcome.units}× ${coin.symbol}` : coin.name}
      </h2>

      <div className="result-rows">
        <div>
          <span>{t("ringCharged")}</span>
          <b>{Math.round(outcome.charge * 100)}%</b>
        </div>
        <div>
          <span>{t("chance")}</span>
          <b>{Math.round(outcome.chance * 100)}%</b>
        </div>
        <div>
          <span>{t("xp")}</span>
          <b style={{ color: outcome.caught ? ladder.colour : undefined }}>
            {outcome.caught ? `+${outcome.xp}` : "0"}
          </b>
        </div>
        <div>
          <span>{t("gameValue")}</span>
          <b>
            {outcome.caught
              ? `$${(outcome.units * ladder.value).toFixed(2)}`
              : "$0.00"}
          </b>
        </div>
      </div>

      <p className="result-note">
        {outcome.caught
          ? t("noteCaught")
          : canRetry
            ? t("noteRetry")
            : t("noteGone")}
      </p>

      {outcome.caught ? (
        <button type="button" className="scr-cta" onClick={onContinue}>
          {t("openWallet")}
        </button>
      ) : canRetry ? (
        <button type="button" className="scr-cta" onClick={onRetry}>
          {t("tryAgain")}
        </button>
      ) : (
        <button type="button" className="scr-cta" onClick={onBack}>
          {t("backToMap")}
        </button>
      )}
    </div>
  );
}
