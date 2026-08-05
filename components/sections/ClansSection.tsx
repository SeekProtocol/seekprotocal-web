import { CLANS } from "@/content/app-features";

const MEDALS = ["/app/medals/gold.png", "/app/medals/silver.png", "/app/medals/bronze.png"];

/** Clan table, with the app's own emblems and podium medals. */
export default function ClansSection() {
  return (
    <div className="clans-layout">
      <div className="clans-copy">
        <p className="eyebrow">Clans</p>
        <h2 className="t-h2">Nobody covers a city alone</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          Found a clan or join one, pool what everyone collects, and climb the
          table together. Chat is end-to-end encrypted, and messages can be set
          to disappear when a conversation should not outlive itself.
        </p>

        <div className="clan-stats">
          <div className="clan-stat">
            <span className="t-num clan-stat-value">16</span>
            <span className="t-mono-sm">Founding clans</span>
          </div>
          <div className="clan-stat">
            <span className="t-num clan-stat-value">E2E</span>
            <span className="t-mono-sm">Encrypted chat</span>
          </div>
          <div className="clan-stat">
            <span className="t-num clan-stat-value">5</span>
            <span className="t-mono-sm">Clan ranks</span>
          </div>
        </div>
      </div>

      <div className="clan-board">
        <div className="clan-board-head">
          <span className="t-mono">Clan table</span>
          <span className="chip chip-live">
            <span className="dot-live" />
            This season
          </span>
        </div>

        <ol className="clan-list">
          {CLANS.map((clan, i) => (
            <li key={clan.name} className="clan-row" data-podium={i < 3 || undefined}>
              <span className="clan-rank">
                {i < 3 ? (
                  <img src={MEDALS[i]} alt={`Rank ${clan.rank}`} loading="lazy" />
                ) : (
                  <span className="t-mono">{String(clan.rank).padStart(2, "0")}</span>
                )}
              </span>
              <img
                className="clan-emblem"
                src={`/app/clans/${clan.img}`}
                alt=""
                loading="lazy"
              />
              <span className="clan-name">{clan.name}</span>
              <span className="clan-members t-mono-sm">
                {clan.members.toLocaleString("en-US")}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
