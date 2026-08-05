"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { SeekMark } from "@/components/brand/SeekLogo";
import { RARITY_COLOUR, RARITY_LABEL, type Drop, type Rarity } from "@/lib/globe-drops";
import { RARITY_LADDER, RETRY_DECAY } from "@/content/collectibles";

const SeekGlobe = dynamic(() => import("@/components/three/SeekGlobe"), { ssr: false });

/** Hubs offered as jump targets, in the order they read best on the dial. */
const HUBS = ["Amsterdam", "London", "Lagos", "Dubai", "Singapore", "Tokyo", "New York", "São Paulo"];

const RARITIES: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

type Haul = { caught: number; missed: number; xp: number };

export default function GlobeSection() {
  const t = useTranslations("globe");
  const [feed, setFeed] = useState<Drop[]>([]);
  const [selected, setSelected] = useState<Drop | null>(null);
  const [total, setTotal] = useState(0);
  const [haul, setHaul] = useState<Haul>({ caught: 0, missed: 0, xp: 0 });
  const [rolling, setRolling] = useState<null | "win" | "lose">(null);
  const [filter, setFilter] = useState<Rarity | null>(null);
  const [tally, setTally] = useState<Record<string, number>>({});
  const [zoom, setZoom] = useState(0);
  const focusRef = useRef<string | null>(null);
  // Read every frame by the globe's loop, so it must be a ref rather than
  // state — re-rendering the section on every zoom tick would be wasteful.
  // The state alongside it only drives the readout and the button states.
  const zoomRef = useRef(0);
  /** Where the zoom was before a coin was opened, so closing can restore it. */
  const zoomBeforeSelect = useRef<number | null>(null);

  const onCollect = useCallback((drop: Drop) => {
    setFeed((prev) => [drop, ...prev].slice(0, 24));
    setTotal((prev) => prev + 1);
    setTally((prev) => ({ ...prev, [drop.city.name]: (prev[drop.city.name] ?? 0) + 1 }));
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    const next = Math.min(1, Math.max(0, level));
    zoomRef.current = next;
    setZoom(next);
  }, []);

  const onSelect = useCallback(
    (drop: Drop | null) => {
      setSelected(drop);
      setRolling(null);
      if (!drop) return;
      // Opening a drop travels to it: swing the city to the front and come in
      // close, so the card and the globe are talking about the same place.
      if (zoomBeforeSelect.current === null) zoomBeforeSelect.current = zoomRef.current;
      focusRef.current = drop.city.name;
      setZoomLevel(Math.max(zoomRef.current, 0.8));
    },
    [setZoomLevel]
  );

  const closeDrop = useCallback(() => {
    setSelected(null);
    setRolling(null);
    if (zoomBeforeSelect.current !== null) {
      setZoomLevel(zoomBeforeSelect.current);
      zoomBeforeSelect.current = null;
    }
  }, [setZoomLevel]);

  useEffect(() => {
    setTotal(Math.floor(Math.random() * 400) + 2400);
  }, []);

  const nudgeZoom = useCallback(
    (by: number) => {
      // A manual zoom means the visitor has taken over; drop the restore point.
      zoomBeforeSelect.current = null;
      setZoomLevel(Number((zoomRef.current + by).toFixed(2)));
    },
    [setZoomLevel]
  );

  /** Roll the visitor's own attempt against the app's real odds. */
  const attempt = useCallback((drop: Drop) => {
    const won = Math.random() < RARITY_LADDER[drop.rarity].base;
    setRolling(won ? "win" : "lose");
    setHaul((prev) => ({
      caught: prev.caught + (won ? 1 : 0),
      missed: prev.missed + (won ? 0 : 1),
      xp: prev.xp + (won ? drop.xp : 0),
    }));
  }, []);

  const shown = useMemo(
    () => (filter ? feed.filter((d) => d.rarity === filter) : feed).slice(0, 5),
    [feed, filter]
  );

  /** Busiest cities this session, from the pickups that have come in. */
  const leaders = useMemo(
    () =>
      Object.entries(tally)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    [tally]
  );

  return (
    <div className="globe-layout">
      <div className="globe-stage">
        {/* The live marker belongs on the map, not boxed in the panel. The
            mark itself is the beacon: it pulses a halo the way a drop pings on
            the app's own map, which a plain dot never said. */}
        <span className="globe-live">
          <span className="globe-live-beacon" aria-hidden="true">
            <SeekMark size={18} gradientId="globe-live-mark" />
          </span>
          {t("liveLabel")}
        </span>

        <SeekGlobe
          onCollect={onCollect}
          onSelect={onSelect}
          focusRef={focusRef}
          zoomRef={zoomRef}
          zoomDepth={0.28}
        />

        {/* Same shape as the map HUD in the app. */}
        <div className="globe-zoom" role="group" aria-label="Zoom">
          <button
            type="button"
            onClick={() => nudgeZoom(0.25)}
            disabled={zoom >= 1}
            aria-label="Zoom in"
          >
            +
          </button>
          <span className="globe-zoom-divider" />
          <button
            type="button"
            onClick={() => nudgeZoom(-0.25)}
            disabled={zoom <= 0}
            aria-label="Zoom out"
          >
            −
          </button>
        </div>

        <span className="t-mono-sm globe-scale">
          {zoom === 0 ? "Whole earth" : `Zoom ${Math.round(zoom * 100)}%`}
        </span>

        {leaders.length > 0 && (
          <div className="globe-leaders">
            <span className="t-mono-sm globe-leaders-title">Busiest right now</span>
            <ol>
              {leaders.map(([city, count], i) => (
                <li key={city}>
                  <span className="globe-leaders-rank">{i + 1}</span>
                  <button type="button" onClick={() => (focusRef.current = city)}>
                    {city}
                  </button>
                  <em>{count}</em>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="globe-hubs" role="group" aria-label="Jump to a city">
          {HUBS.map((city) => (
            <button
              key={city}
              type="button"
              className="globe-hub"
              onClick={() => (focusRef.current = city)}
            >
              {city}
            </button>
          ))}
        </div>

        <p className="t-mono-sm globe-hint">{t("dragHint")}</p>
      </div>

      <aside className="globe-panel glass">
        {selected ? (
          <DropCard
            drop={selected}
            rolling={rolling}
            onAttempt={() => attempt(selected)}
            onClose={closeDrop}
            t={t}
          />
        ) : (
          <>
            <div className="globe-panel-head">
              <h3 className="t-h3 globe-panel-title">{t("panelTitle")}</h3>
              <p className="t-small">{t("panelDesc")}</p>
            </div>

            <div className="globe-panel-metrics">
              <div>
                <span className="t-mono-sm">{t("todayLabel")}</span>
                <span className="t-num globe-metric">{total.toLocaleString("en-US")}</span>
              </div>
              <div>
                <span className="t-mono-sm">Your haul</span>
                <span className="t-num globe-metric">
                  {haul.caught}
                  {haul.xp > 0 && (
                    <em className="globe-metric-sub">
                      {" · "}
                      {haul.xp.toLocaleString("en-US")} XP
                    </em>
                  )}
                </span>
              </div>
            </div>

            <div className="globe-filters" role="group" aria-label="Filter by rarity">
              <button
                type="button"
                className="globe-filter"
                data-active={filter === null || undefined}
                onClick={() => setFilter(null)}
              >
                All
              </button>
              {RARITIES.map((rarity) => (
                <button
                  key={rarity}
                  type="button"
                  className="globe-filter"
                  data-active={filter === rarity || undefined}
                  style={{ ["--rarity" as string]: RARITY_LADDER[rarity].colour }}
                  onClick={() => setFilter(filter === rarity ? null : rarity)}
                >
                  {RARITY_LADDER[rarity].label}
                </button>
              ))}
            </div>

            <ul className="globe-feed" aria-live="polite" aria-relevant="additions">
              {shown.length === 0 && (
                <li className="globe-feed-empty t-small">
                  {filter ? `No ${RARITY_LADDER[filter].label.toLowerCase()} pickups yet` : t("waiting")}
                </li>
              )}
              {shown.map((drop) => (
                <li key={drop.id} className="globe-feed-row">
                  <img className="globe-feed-coin" src={drop.coin.image} alt="" />
                  <span className="globe-feed-place">
                    {drop.city.name}
                    <span className="t-mono-sm globe-feed-country">{drop.city.country}</span>
                  </span>
                  <span className="globe-feed-kind t-small">
                    @{drop.seeker} · {drop.coin.symbol}
                  </span>
                  <span
                    className="globe-feed-amount t-mono-sm"
                    style={{ color: RARITY_COLOUR[drop.rarity] }}
                  >
                    +{drop.xp} XP
                  </span>
                </li>
              ))}
            </ul>

            <p className="t-mono-sm globe-panel-foot">{t("clickHint")}</p>
          </>
        )}
      </aside>
    </div>
  );
}

function DropCard({
  drop,
  rolling,
  onAttempt,
  onClose,
  t,
}: {
  drop: Drop;
  rolling: null | "win" | "lose";
  onAttempt: () => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const colour = RARITY_COLOUR[drop.rarity];
  const ladder = RARITY_LADDER[drop.rarity];

  return (
    <div className="drop-card" style={{ ["--rarity" as string]: colour }}>
      <button type="button" className="drop-card-close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <span className="drop-card-rarity">{RARITY_LABEL[drop.rarity]}</span>

      <div className="drop-card-hero" data-state={rolling ?? undefined}>
        {/* The coin the pin was actually carrying. */}
        <img src={drop.coin.image} alt="" className="drop-card-coin" />
        <span className="drop-card-halo" aria-hidden="true" />
      </div>

      <h3 className="t-h3 drop-card-kind">{drop.coin.name}</h3>
      <p className="t-small drop-card-where">
        {drop.kind} · {drop.city.name}, {drop.city.country} · {drop.ago}s ago
      </p>

      <dl className="drop-card-stats">
        <div>
          <dt className="t-mono-sm">{t("seekerLabel")}</dt>
          <dd>@{drop.seeker}</dd>
        </div>
        <div>
          <dt className="t-mono-sm">{t("xpGained")}</dt>
          <dd className="drop-card-xp">+{drop.xp.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt className="t-mono-sm">Catch chance</dt>
          <dd>{Math.round(ladder.base * 100)}%</dd>
        </div>
        <div>
          <dt className="t-mono-sm">Units</dt>
          <dd>
            {drop.amount} × ${drop.coin.symbol}
          </dd>
        </div>
      </dl>

      {rolling ? (
        <p className="drop-card-outcome" data-win={rolling === "win" || undefined}>
          {rolling === "win"
            ? `Caught it · +${drop.xp.toLocaleString("en-US")} XP`
            : `It got away · ${Math.round(ladder.base * RETRY_DECAY * 100)}% on a retry`}
        </p>
      ) : (
        <button type="button" className="btn btn-brand btn-sm drop-card-try" onClick={onAttempt}>
          Try to catch it
        </button>
      )}

      <p className="t-mono-sm drop-card-foot">{t("verified")}</p>
    </div>
  );
}
