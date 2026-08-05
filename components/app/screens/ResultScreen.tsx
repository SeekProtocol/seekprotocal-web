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
        <img src={coin.image} alt="" className="result-coin" />
      </div>

      <p className="result-verdict">{outcome.caught ? "Caught" : "It got away"}</p>
      <h2 className="result-name">
        {outcome.caught ? `${outcome.units}× ${coin.symbol}` : coin.name}
      </h2>

      <div className="result-rows">
        <div>
          <span>Ring charged</span>
          <b>{Math.round(outcome.charge * 100)}%</b>
        </div>
        <div>
          <span>Chance this attempt</span>
          <b>{Math.round(outcome.chance * 100)}%</b>
        </div>
        <div>
          <span>XP</span>
          <b style={{ color: outcome.caught ? ladder.colour : undefined }}>
            {outcome.caught ? `+${outcome.xp}` : "0"}
          </b>
        </div>
        <div>
          <span>Game value</span>
          <b>
            {outcome.caught
              ? `$${(outcome.units * ladder.value).toFixed(2)}`
              : "$0.00"}
          </b>
        </div>
      </div>

      <p className="result-note">
        {outcome.caught
          ? "A caught unit is a game unit. What it pays out in real tokens is the market's business."
          : canRetry
            ? "One more attempt, worth 0.65 of the first."
            : "That spawn is gone. Another will be along."}
      </p>

      {outcome.caught ? (
        <button type="button" className="scr-cta" onClick={onContinue}>
          Open wallet
        </button>
      ) : canRetry ? (
        <button type="button" className="scr-cta" onClick={onRetry}>
          Try again
        </button>
      ) : (
        <button type="button" className="scr-cta" onClick={onBack}>
          Back to the map
        </button>
      )}
    </div>
  );
}
