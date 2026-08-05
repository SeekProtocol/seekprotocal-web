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
  const ladder = RARITY_LADDER[coin.rarity];
  const thisAttempt = ladder.base * Math.pow(RETRY_DECAY, attempt - 1);

  return (
    <div className="scr scr-spawn" style={{ ["--rarity" as string]: ladder.colour }}>
      <StatusBar />

      <button type="button" className="scr-back" onClick={onBack}>
        ‹ Map
      </button>

      <div className="spawn-hero">
        <span className="spawn-hero-glow" aria-hidden="true" />
        <img src={coin.image} alt="" className="spawn-hero-coin" />
      </div>

      <div className="spawn-head">
        <span className="spawn-rarity">{ladder.label}</span>
        <h2 className="spawn-name">{coin.name}</h2>
        <p className="spawn-symbol">${coin.symbol}</p>
      </div>

      <div className="spawn-stats">
        <div>
          <span className="spawn-stat-label">Distance</span>
          <span className="spawn-stat-value">In range</span>
        </div>
        <div>
          <span className="spawn-stat-label">This attempt</span>
          <span className="spawn-stat-value" style={{ color: ladder.colour }}>
            {Math.round(thisAttempt * 100)}%
          </span>
        </div>
        <div>
          <span className="spawn-stat-label">Attempts left</span>
          <span className="spawn-stat-value">
            {MAX_ATTEMPTS - attempt + 1} of {MAX_ATTEMPTS}
          </span>
        </div>
      </div>

      <div className="spawn-note">
        <span className="spawn-note-dot" />
        <p>
          Charging the ring raises this. The retry after it is worth 0.65 of the
          first.
        </p>
      </div>

      <button type="button" className="scr-cta" onClick={onCatch}>
        Catch it
      </button>
    </div>
  );
}
