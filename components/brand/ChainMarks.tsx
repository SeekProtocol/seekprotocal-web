/**
 * A mark per settlement chain.
 *
 * These are the networks' own official marks, supplied as SVG and inlined here
 * rather than served as files: each is under 2 KB, and inlining means the strip
 * paints with the page instead of five extra requests arriving after it.
 *
 * ## They are badges, not glyphs
 *
 * Every one of them is a filled circle with the mark knocked out of it, in the
 * network's own colours. That is why nothing here takes `currentColor` and why
 * nothing here should ever be given a filter: the site already learned that
 * lesson from `twitter.svg`, which is a purple disc rather than a glyph, and
 * inverting it for the dark theme turned it green. See the seventh pass.
 *
 * The tile they sit in draws no plate behind them for the same reason. A
 * rounded square under a circular badge is two backgrounds arguing.
 *
 * ## Gradient ids are namespaced, and have to be
 *
 * The supplied files both declare `id="linear-gradient"`. SVG ids are global to
 * the document, so inlining two of them unchanged means the second one's fill
 * resolves to the first one's definition and BNB comes out Arbitrum navy. Every
 * id below carries its chain's name.
 */

type MarkProps = { size?: number };

/** The Ethereum octahedron, black on the off-white disc. */
function EthereumMark({ size = 34 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <circle cx="100" cy="100" r="100" fill="#f2f2f2" />
      <g fill="#111">
        <path d="m99.99 127.24-33.6-19.85 33.6 47.36 33.63-47.36z" />
        <path d="m133.6 101.02-33.61 19.86-33.61-19.86 33.61-55.77z" />
      </g>
    </svg>
  );
}

/** Solana's three bars, white on purple. */
function SolanaMark({ size = 34 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <circle cx="100" cy="100" r="100" fill="#7044cf" />
      <g fill="#fff">
        <path d="m69.2 118.86a2.87 2.87 0 0 1 2.1-.88h73a1.54 1.54 0 0 1 1.46 1.63 1.6 1.6 0 0 1 -.41 1l-14.42 14.39a3 3 0 0 1 -2.1.88h-73a1.49 1.49 0 0 1 -1.05-2.65z" />
        <path d="m69.2 65a3 3 0 0 1 2.1-.89h73a1.5 1.5 0 0 1 1.05 2.55l-14.42 14.48a3 3 0 0 1 -2.1.88h-73a1.55 1.55 0 0 1 -1.46-1.63 1.6 1.6 0 0 1 .41-1z" />
        <path d="m130.93 91.76a2.92 2.92 0 0 0 -2.1-.89h-73a1.55 1.55 0 0 0 -1.46 1.63 1.58 1.58 0 0 0 .41 1l14.42 14.35a2.92 2.92 0 0 0 2.1.89h73a1.5 1.5 0 0 0 1.05-2.55z" />
      </g>
    </svg>
  );
}

/** The BNB square of squares, white on the gold ramp. */
function BnbMark({ size = 34 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="mark-bnb-disc" gradientUnits="userSpaceOnUse" x1="100" x2="100" y1="200" y2="0">
          <stop offset="0" stopColor="#c28900" />
          <stop offset="1" stopColor="#ffce59" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#mark-bnb-disc)" />
      <path
        d="m78.31 91.06 21.69-21.7 21.75 21.75 12.63-12.63-34.38-34.38-34.33 34.32zm-34.21 8.94 12.63-12.63 12.63 12.63-12.63 12.63zm34.21 9 21.69 21.64 21.75-21.75 12.63 12.63-34.38 34.39-34.33-34.33zm52.33-9 12.63-12.63 12.64 12.63-12.64 12.63zm-17.78 0-12.86 12.8-12.8-12.8 2.23-2.24 1.12-1.11 9.45-9.45z"
        fill="#fff"
        fillRule="evenodd"
      />
    </svg>
  );
}

/** Arbitrum's arb inside its hexagon, on the navy disc. */
function ArbitrumMark({ size = 34 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="mark-arb-disc" gradientUnits="userSpaceOnUse" x1="100" x2="100" y1="200" y2="0">
          <stop offset="0" stopColor="#141e2b" />
          <stop offset="1" stopColor="#3b577d" />
        </linearGradient>
        <linearGradient id="mark-arb-blue" gradientUnits="userSpaceOnUse" x1="108.9" x2="119.14" y1="120.71" y2="152.16">
          <stop offset="0" stopColor="#12aaff" />
          <stop offset="1" stopColor="#0b689c" />
        </linearGradient>
        <linearGradient id="mark-arb-blue-2" gradientUnits="userSpaceOnUse" x1="119.29" x2="138.23" y1="87.44" y2="140.87">
          <stop offset="0" stopColor="#12aaff" />
          <stop offset="1" stopColor="#0b689c" />
        </linearGradient>
        <linearGradient id="mark-arb-hex" gradientUnits="userSpaceOnUse" x1="100" x2="100" y1="170.12" y2="29.88">
          <stop offset="0" stopColor="#87b0cc" />
          <stop offset="1" stopColor="#a9dbff" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#mark-arb-disc)" />
      <path
        d="m110.4 110.7-6.82 18.66a3.41 3.41 0 0 0 0 1.62l11.7 32.02 13.52-7.8-16.25-44.5a1.11 1.11 0 0 0 -2.15 0z"
        fill="url(#mark-arb-blue)"
      />
      <path
        d="m124.06 79.36a1.17 1.17 0 0 0 -1.49-.72 1.12 1.12 0 0 0 -.72.72l-6.85 18.64a3.41 3.41 0 0 0 0 1.62l19.5 52.47 13.53-7.8-23.67-65z"
        fill="url(#mark-arb-blue-2)"
      />
      <path
        d="m100 38.53a2 2 0 0 1 1 0l51.49 29.71a2 2 0 0 1 1 1.69v59.49a2 2 0 0 1 -1 1.69l-51.49 29.78a1.94 1.94 0 0 1 -2 0l-51.5-29.45a1.83 1.83 0 0 1 -1-1.69v-59.56a1.87 1.87 0 0 1 1-1.62l51.5-29.78a1.78 1.78 0 0 1 1 0zm0-8.65a11 11 0 0 0 -5.33 1.37l-51.56 29.75a10.53 10.53 0 0 0 -5.33 9.17v59.55a10.54 10.54 0 0 0 5.33 9.3l51.56 29.77a11.05 11.05 0 0 0 10.66 0l51.56-29.79a10.55 10.55 0 0 0 5.33-9.17v-59.64a10.51 10.51 0 0 0 -5.33-9.19l-51.62-29.75a10.81 10.81 0 0 0 -5.27-1.37z"
        fill="url(#mark-arb-hex)"
      />
      <path d="m65.87 152.18 4.74-13.01 9.56 7.87-8.91 8.19z" fill="#213147" />
      <g fill="#fff">
        <path d="m95.64 66h-13a2.32 2.32 0 0 0 -2.14 1.43l-28.16 76.88 13.53 7.69 30.88-84.54a1.16 1.16 0 0 0 -.75-1.46 1.3 1.3 0 0 0 -.33-.07z" />
        <path d="m118.53 66h-13a2.33 2.33 0 0 0 -2.21 1.49l-32.06 87.74 13.53 7.77 34.72-95.57a1.1 1.1 0 0 0 -.51-1.43 1 1 0 0 0 -.48-.1z" />
      </g>
    </svg>
  );
}

/**
 * The open end of the roster: a plus, not a logo.
 *
 * The one mark here that *is* a glyph, so it takes `currentColor` and themes
 * with the tile. The strip used to stop at four logos, which made it read as
 * the list of chains that work rather than as four examples of chains that do.
 */
export function AnyChainMark({ size = 34 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 5.6v12.8M5.6 12h12.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Anything not drawn above: a ring carrying the network's initial. */
function FallbackMark({ letter, size = 34 }: MarkProps & { letter: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <text
        x="12"
        y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontSize="10"
        fontWeight="600"
        fontFamily="var(--font-mono)"
      >
        {letter}
      </text>
    </svg>
  );
}

const MARKS: Record<string, (props: MarkProps) => React.ReactElement> = {
  ethereum: EthereumMark,
  solana: SolanaMark,
  bnb: BnbMark,
  arbitrum: ArbitrumMark,
};

export function ChainMark({ id, name, size }: { id: string; name: string; size?: number }) {
  const Mark = MARKS[id];
  if (Mark) return <Mark size={size} />;
  return <FallbackMark letter={name.slice(0, 1)} size={size} />;
}
