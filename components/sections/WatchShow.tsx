"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Watch } from "@/components/app/DeviceMockups";
import Image from "next/image";
import { SeekMark } from "@/components/brand/SeekLogo";
import { RARITY_LADDER, collectible, type Rarity } from "@/content/collectibles";

/**
 * Four watches running the Seek watch apps, live.
 *
 * The faces are rebuilt from the watch apps' own layout rather than shown as
 * screenshots, so they can move: `targets/watch/ContentView.swift` and
 * `WalkViews.swift` in the app repo for the Apple Watch (the ladder ring is a
 * 270 degree arc from the lower left, 12 pt wide, with each tier's powerup on
 * the arc where it is earned), and the Wear OS screen and tile for the two
 * Galaxy Watches. Sizes are the watches' own points.
 *
 * One clock drives everything, on a 24 second loop: the day's steps climb
 * past 10,000 and Fitness is earned, a walk runs with its clock, distance,
 * heart rate and calories (and a coin is caught on the way), the day's catches
 * drop into the collection one by one up to a Legendary SOL, and the streak
 * ticks over to the next day. Small
 * cards beside the watches call out what was just earned, one at a time, so
 * on a phone they can share one spot.
 *
 * The clock runs only while the stage is on screen, at 20 updates a second,
 * and touches nothing outside this subtree. Reduced motion holds one frame.
 */

const LOOP = 24_000;
const TIERS = [
  { key: "fitness", steps: 10_000 },
  { key: "xpBoost", steps: 16_000 },
  { key: "spawnLure", steps: 24_000 },
] as const;
const TOP = 24_000;
const FROM = 8_960;
const TO = 12_480;
/**
 * The day's catches, in the order they drop in on the collection page. Coin
 * art and rarity colours are the site's own (`content/collectibles.ts`), the
 * same coins the collectibles section shows.
 */
const CAUGHT = [
  { key: "bonk", count: 4 },
  { key: "seek", count: 3 },
  { key: "pengu", count: 2 },
  { key: "zcat", count: 1 },
  { key: "jupiter", count: 1 },
  { key: "solana", count: 1 },
].map((c) => ({ ...c, coin: collectible(c.key) }));
const CAUGHT_AT = 12_500;
const CAUGHT_EVERY = 550;
const LEGENDARY_AT = CAUGHT_AT + (CAUGHT.length - 1) * CAUGHT_EVERY;
const HOURS = [0, 0, 0, 0, 0, 0, 0.12, 0.35, 0.62, 0.4, 0.28, 0.55, 0.9, 0.48, 0.3, 0.42, 0.66, 1, 0.58, 0.36, 0.22, 0.1, 0, 0];

export type WatchShowCopy = {
  today: string;
  steps: string;
  walk: string;
  streak: string;
  best: string;
  byHour: string;
  toNext: string;
  nextStreak: string;
  end: string;
  rewards: Record<(typeof TIERS)[number]["key"], string>;
  tierSteps: string;
  chipUnlocked: string;
  chipXp: string;
  chipKcal: string;
  chipStreak: string;
  collection: string;
  caughtToday: string;
  chipCaught: string;
  rarity: Record<Rarity, string>;
  label: string;
};

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const fill = (s: string, values: Record<string, string | number>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ""));

/** Everything the faces show, at a moment of the loop. */
function frame(t: number) {
  const walkT = Math.max(0, Math.min(6, (t - 6000) / 1000));
  const today = FROM + (TO - FROM) * ease((t - 400) / 4000);
  const steps = Math.round(t < 6000 ? today : TO + walkT * 80);
  return {
    t,
    page: t < 6000 ? 0 : t < 12_000 ? 1 : t < 18_000 ? 2 : 3,
    steps,
    walkSeconds: 32 * 60 + 18 + Math.floor(walkT),
    km: 2.46 + walkT * 0.012,
    kcal: Math.round(148 + walkT * 2),
    heart: 112 + Math.round(3 * Math.sin(t / 380)),
    streak: t >= 19_000 ? 12 : 11,
    streakBar: t >= 19_000 ? 12 / 14 : 11 / 14,
    caught: CAUGHT.filter((_, i) => t >= CAUGHT_AT + i * CAUGHT_EVERY).length,
    toast: t > 8200 && t < 10_400,
    bars: ease(t / 2600),
    xp: Math.round(40 * ease((t - 3700) / 1200)) + Math.round(25 * ease((t - 9300) / 1400)),
    reset: t > LOOP - 450,
  };
}

type Frame = ReturnType<typeof frame>;

export default function WatchShow({ copy, locale }: { copy: WatchShowCopy; locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(4800);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: number | undefined;
    let origin = performance.now() - 4800;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && timer === undefined) {
        origin = performance.now();
        timer = window.setInterval(() => setT((performance.now() - origin) % LOOP), 50);
      } else if (!entry.isIntersecting && timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer !== undefined) window.clearInterval(timer);
    };
  }, []);

  const f = frame(t);
  const n = new Intl.NumberFormat(locale);
  const fmt = (v: number) => n.format(v);
  const next = TIERS.find((tier) => f.steps < tier.steps) ?? TIERS[2];
  const toNext = fill(copy.toNext, { count: fmt(next.steps - f.steps), reward: copy.rewards[next.key] });
  const ctx = { f, copy, fmt, toNext };

  return (
    <div className="wrist-stage" ref={ref} role="img" aria-label={copy.label} data-reset={f.reset || undefined}>
      <Watch model="galaxyGold" className="wrist-far-left">
        <WearTile {...ctx} />
      </Watch>
      <Watch model="series" className="wrist-left">
        <ByHour {...ctx} />
      </Watch>
      <Watch model="ultra" className="wrist-center">
        <div className="wf-pages" style={{ ["--page" as string]: f.page } as CSSProperties}>
          <Today {...ctx} />
          <WalkRunning {...ctx} />
          <Collection {...ctx} />
          <Streak {...ctx} />
        </div>
        <CoinToast show={f.toast} coin={CAUGHT[0].coin} />
        <span className="wf-dots">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} data-on={i === f.page || undefined} />
          ))}
        </span>
      </Watch>
      <Watch model="galaxyBlack" className="wrist-right">
        <WearToday {...ctx} />
      </Watch>

      <Chip show={f.steps >= 10_000 && f.t < 3600} at="chip-a" icon={<Dumbbell />}>
        {fill(copy.chipUnlocked, { reward: copy.rewards.fitness })}
      </Chip>
      <Chip show={(f.t > 3800 && f.t < 5900) || (f.t > 9400 && f.t < 11_700)} at="chip-b" icon={<Bolt />} accent>
        {fill(copy.chipXp, { xp: f.xp })}
      </Chip>
      <Chip show={f.t > 6800 && f.t < 9200} at="chip-c" icon={<Flame />}>
        {fill(copy.chipKcal, { kcal: f.kcal })}
      </Chip>
      <Chip
        show={f.t > LEGENDARY_AT + 150 && f.t < 17_800}
        at="chip-a"
        icon={<Image src={CAUGHT[5].coin.image} alt="" width={64} height={64} sizes="32px" />}
        plain
      >
        <span className="wrist-chip-stack">
          {fill(copy.chipCaught, { coin: CAUGHT[5].coin.symbol })}
          <small style={{ color: RARITY_LADDER[CAUGHT[5].coin.rarity].colour }}>{copy.rarity[CAUGHT[5].coin.rarity]}</small>
        </span>
      </Chip>
      <Chip show={f.t > 19_200 && f.t < 23_400} at="chip-d" icon={<Flame />}>
        {fill(copy.chipStreak, { n: f.streak })}
      </Chip>
    </div>
  );
}

type Ctx = { f: Frame; copy: WatchShowCopy; fmt: (v: number) => string; toNext: string };

function Chip({
  show,
  at,
  icon,
  accent = false,
  plain = false,
  children,
}: {
  show: boolean;
  at: string;
  icon: ReactNode;
  accent?: boolean;
  plain?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`wrist-chip ${at}`}
      data-show={show || undefined}
      data-accent={accent || undefined}
      data-plain={plain || undefined}
      aria-hidden="true"
    >
      <span className="wrist-chip-icon">{icon}</span>
      {children}
    </span>
  );
}

/* ── Apple Watch pages ─────────────────────────────────────────────────────── */

function Header({ title, time = "10:09" }: { title: string; time?: string }) {
  return (
    <div className="wf-head">
      <SeekMark size={17} gradientId="wf-mark" />
      <span className="wf-title">{title}</span>
      <span className="wf-time">{time}</span>
    </div>
  );
}

function Today({ f, copy, fmt, toNext }: Ctx) {
  return (
    <div className="wf-page wf-glow-blue">
      <Header title={copy.today} />
      <LadderRing steps={f.steps} size={124} label={copy.steps} fmt={fmt} />
      <div className="wf-pill">
        <Moon />
        <span>{toNext}</span>
      </div>
    </div>
  );
}

function WalkRunning({ f, copy, fmt, toNext }: Ctx) {
  const mm = Math.floor(f.walkSeconds / 60);
  const ss = String(f.walkSeconds % 60).padStart(2, "0");
  const next = TIERS.find((tier) => f.steps < tier.steps) ?? TIERS[2];
  const prev = TIERS[TIERS.indexOf(next) - 1]?.steps ?? 0;
  return (
    <div className="wf-page wf-glow-green">
      <Header title={copy.walk} />
      <div className="wf-clock">
        {mm}:{ss}
      </div>
      <div className="wf-metrics">
        <span>
          <MapIcon /> {f.km.toFixed(2)} km
        </span>
        <span className="wf-heart">
          <Heart /> {f.heart}
        </span>
        <span>
          <Flame /> {fmt(f.kcal)} kcal
        </span>
      </div>
      <div className="wf-next">
        <Moon />
        <span>{toNext}</span>
      </div>
      <span className="wf-bar">
        <i style={{ width: `${((f.steps - prev) / (next.steps - prev)) * 100}%` }} />
      </span>
      <div className="wf-buttons">
        <span className="wf-btn">
          <Pause />
        </span>
        <span className="wf-btn wf-btn-end">{copy.end}</span>
      </div>
    </div>
  );
}

type Coin = ReturnType<typeof collectible>;

/** A catch arriving as a notification over whatever page is showing. */
function CoinToast({ show, coin }: { show: boolean; coin: Coin }) {
  return (
    <span className="wf-toast" data-show={show || undefined} style={{ ["--rarity" as string]: RARITY_LADDER[coin.rarity].colour } as CSSProperties}>
      <Image src={coin.image} alt="" width={64} height={64} sizes="40px" />
      <b>+1 {coin.symbol}</b>
    </span>
  );
}

/** The day's catches, landing one by one. */
function Collection({ f, copy }: Ctx) {
  const total = CAUGHT.slice(0, f.caught).reduce((sum, c) => sum + c.count, 0);
  return (
    <div className="wf-page wf-glow-violet">
      <Header title={copy.collection} />
      <p className="wf-caught" key={total}>
        {fill(copy.caughtToday, { n: total })}
      </p>
      <div className="wf-coins">
        {CAUGHT.map(({ key, count, coin }, i) => (
          <span
            key={key}
            className="wf-coin"
            data-in={i < f.caught || undefined}
            data-legendary={coin.rarity === "legendary" || undefined}
            style={{ ["--rarity" as string]: RARITY_LADDER[coin.rarity].colour } as CSSProperties}
          >
            <span className="wf-coin-art">
              <Image src={coin.image} alt="" width={96} height={96} sizes="48px" />
            </span>
            <small>{coin.symbol}</small>
            <i>×{count}</i>
          </span>
        ))}
      </div>
    </div>
  );
}

function Streak({ f, copy }: Ctx) {
  return (
    <div className="wf-page wf-glow-orange">
      <Header title={copy.streak} />
      <div className="wf-streak" key={f.streak}>
        <span className="wf-flame">🔥</span>
        <span className="wf-streak-n">{f.streak}</span>
      </div>
      <p className="wf-mono wf-center">{fill(copy.best, { n: 20 })}</p>
      <div className="wf-card">
        <div className="wf-card-row">
          <Moon />
          <span>{fill(copy.nextStreak, { day: 14, reward: copy.rewards.xpBoost })}</span>
        </div>
        <span className="wf-bar">
          <i style={{ width: `${f.streakBar * 100}%` }} />
        </span>
      </div>
    </div>
  );
}

function ByHour({ f, copy, fmt }: Ctx) {
  const done = f.steps >= 10_000;
  return (
    <div className="wf-page wf-glow-green">
      <Header title={copy.byHour} />
      <div className="wf-chart">
        {HOURS.map((h, i) => (
          <i key={i} style={{ height: `${h * 100 * Math.min(1, Math.max(0, f.bars * 1.6 - i / 24))}%` }} />
        ))}
      </div>
      <div className="wf-axis">
        <span>0</span>
        <span>6</span>
        <span>12</span>
        <span>18</span>
      </div>
      <div className="wf-km">
        <MapIcon /> {(f.steps * 0.00071).toFixed(1)} km
      </div>
      <div className="wf-row">
        <Badge earned={done}>
          <Dumbbell />
        </Badge>
        <span>
          <b>{copy.rewards.fitness}</b>
          <small>{fill(copy.tierSteps, { count: fmt(10_000) })}</small>
        </span>
        <span className="wf-row-state" data-done={done || undefined}>
          {done ? <Check /> : <Lock />}
        </span>
      </div>
      <div className="wf-row">
        <Badge earned={false}>
          <Moon />
        </Badge>
        <span>
          <b>{copy.rewards.xpBoost}</b>
          <small>{fill(copy.tierSteps, { count: fmt(16_000) })}</small>
        </span>
        <span className="wf-row-state">
          <Lock />
        </span>
      </div>
    </div>
  );
}

/* ── Wear OS ────────────────────────────────────────────────────────────────── */

function WearToday({ f, copy, fmt, toNext }: Ctx) {
  return (
    <div className="wf-page wf-round wf-glow-blue">
      <span className="wf-wear-time">10:09</span>
      <span className="wf-wear-head">
        <SeekMark size={14} gradientId="wf-mark-w" />
        {copy.today}
      </span>
      <LadderRing steps={f.steps} size={132} label={copy.steps} fmt={fmt} />
      <div className="wf-pill wf-pill-wear">
        <Moon />
        <span>{toNext}</span>
      </div>
    </div>
  );
}

function WearTile({ f, copy, fmt, toNext }: Ctx) {
  const next = TIERS.find((tier) => f.steps < tier.steps) ?? TIERS[2];
  const p = Math.min(1, f.steps / next.steps);
  return (
    <div className="wf-page wf-round wf-tile">
      <svg viewBox="0 0 227 227" className="wf-tile-ring" aria-hidden="true">
        <circle cx="113.5" cy="113.5" r="104" pathLength={100} className="wf-track" />
        <circle
          cx="113.5"
          cy="113.5"
          r="104"
          pathLength={100}
          className="wf-tile-progress"
          strokeDasharray={`${p * 100} 100`}
          transform="rotate(-90 113.5 113.5)"
        />
      </svg>
      <div className="wf-tile-body">
        <span className="wf-mono">{copy.today}</span>
        <span className="wf-tile-n">{fmt(f.steps)}</span>
        <span className="wf-mono">{copy.steps}</span>
        <span className="wf-tile-next">{toNext}</span>
      </div>
    </div>
  );
}

/* ── The ladder ring ────────────────────────────────────────────────────────── */

/** ContentView.swift's LadderRing: 270 degrees clockwise from 135, line 12. */
function LadderRing({ steps, size, label, fmt }: { steps: number; size: number; label: string; fmt: (v: number) => string }) {
  const line = 12;
  const r = (size - line) / 2;
  const c = size / 2;
  const p = Math.min(1, steps / TOP);
  const icons = [<Dumbbell key="d" />, <Moon key="m" />, <Scope key="s" />];
  return (
    <div className="wf-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          {/* Along the screen's x axis, so mint at the arc's start and violet at
              its end: undo the circle's own rotation. */}
          <linearGradient id={`wf-ring-${size}`} x1="0" x2="1" y1="0" y2="0" gradientTransform="rotate(-135 0.5 0.5)">
            <stop offset="0" stopColor="#02eaa9" />
            <stop offset="0.5" stopColor="#049efd" />
            <stop offset="1" stopColor="#d04cfb" />
          </linearGradient>
        </defs>
        <circle cx={c} cy={c} r={r} pathLength={360} className="wf-track" strokeDasharray="270 360" transform={`rotate(135 ${c} ${c})`} />
        <circle
          cx={c}
          cy={c}
          r={r}
          pathLength={360}
          fill="none"
          stroke={`url(#wf-ring-${size})`}
          strokeWidth={line}
          strokeLinecap="round"
          strokeDasharray={`${Math.max(0.6, 270 * p)} 360`}
          transform={`rotate(135 ${c} ${c})`}
        />
      </svg>
      {TIERS.map((tier, i) => {
        const a = ((135 + (270 * tier.steps) / TOP) * Math.PI) / 180;
        return (
          <span key={tier.key} className="wf-tier" style={{ left: c + r * Math.cos(a), top: c + r * Math.sin(a) }}>
            <Badge earned={steps >= tier.steps}>{icons[i]}</Badge>
          </span>
        );
      })}
      <span className="wf-ring-n">
        <b>{fmt(steps)}</b>
        <small>{label}</small>
      </span>
    </div>
  );
}

function Badge({ earned, children }: { earned: boolean; children: ReactNode }) {
  return (
    <span className="wf-badge" data-earned={earned || undefined}>
      {children}
      {earned && (
        <span className="wf-badge-check">
          <Check />
        </span>
      )}
    </span>
  );
}

/* ── Glyphs, in place of the SF Symbols the watch app uses ─────────────────── */

const G = ({ children, fill: f = false }: { children: ReactNode; fill?: boolean }) => (
  <svg viewBox="0 0 24 24" className="wf-glyph" aria-hidden="true" fill={f ? "currentColor" : "none"} stroke={f ? "none" : "currentColor"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
const Dumbbell = () => (
  <G>
    <path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12" />
  </G>
);
const Moon = () => (
  <G fill>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    <path d="M17 3l.7 1.6L19.3 5l-1.6.7L17 7.3l-.7-1.6L14.7 5l1.6-.4z" />
  </G>
);
const Scope = () => (
  <G>
    <circle cx="12" cy="12" r="7" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </G>
);
const MapIcon = () => (
  <G fill>
    <path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" />
  </G>
);
const Heart = () => (
  <G fill>
    <path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z" />
  </G>
);
const Flame = () => (
  <G fill>
    <path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8a7 7 0 0 0 7 7z" />
  </G>
);
const Bolt = () => (
  <G fill>
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </G>
);
const Check = () => (
  <G>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </G>
);
const Lock = () => (
  <G fill>
    <path d="M7 10V8a5 5 0 0 1 10 0v2h1v11H6V10zm2 0h6V8a3 3 0 0 0-6 0z" />
  </G>
);
const Pause = () => (
  <G fill>
    <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
  </G>
);
