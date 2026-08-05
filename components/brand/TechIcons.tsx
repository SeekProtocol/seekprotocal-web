/**
 * Icons for the four core technologies.
 *
 * The set they replaced was generic marketing clip-art, four shapes that said
 * nothing about what the cards underneath them claim. These are drawn for the
 * specific thing each card describes: a coordinate on the ground, a camera
 * finding a surface, a token settling to a ledger, a network agreeing at once.
 *
 * All four sit on the same 24-unit grid at the same 1.5 stroke, and take their
 * colour from the tile, so they theme with everything else. Nothing is filled
 * except the accents that carry a second weight.
 */

type IconProps = { size?: number };

function Frame({ size = 22, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** A pin standing at a coordinate, with the claim radius drawn on the ground. */
export function GeospatialIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M12 2.6c-2.85 0-5.15 2.3-5.15 5.15 0 3.6 5.15 9.15 5.15 9.15s5.15-5.55 5.15-9.15c0-2.85-2.3-5.15-5.15-5.15Z" />
      <circle cx="12" cy="7.65" r="1.85" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="19.6" rx="8" ry="2.35" strokeDasharray="1.6 2.4" opacity="0.6" />
      <path d="M12 17v2.6" opacity="0.6" />
    </Frame>
  );
}

/** Camera brackets closing on a surface, with the asset anchored inside them. */
export function ARIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M3 8.4V5.2A2.2 2.2 0 0 1 5.2 3h3.2" />
      <path d="M15.6 3h3.2A2.2 2.2 0 0 1 21 5.2v3.2" />
      <path d="M21 15.6v3.2a2.2 2.2 0 0 1-2.2 2.2h-3.2" />
      <path d="M8.4 21H5.2A2.2 2.2 0 0 1 3 18.8v-3.2" />
      <path d="M12 7.6 15.5 12 12 16.4 8.5 12Z" />
      <path d="M9.3 18.4h5.4" strokeDasharray="1.4 2" opacity="0.55" />
    </Frame>
  );
}

/** A token settling down onto the two blocks that record it. */
export function RewardsIcon(props: IconProps) {
  return (
    <Frame {...props}>
      {/* The coin reads as a coin at 22px only if it stays a ring with a
          centre. A currency glyph inside it turned to mush. */}
      <circle cx="12" cy="6.2" r="3.6" />
      <circle cx="12" cy="6.2" r="1.25" fill="currentColor" stroke="none" />
      <path d="M9.5 9 7.2 12.4M14.5 9l2.3 3.4" opacity="0.6" />
      <rect x="2.9" y="13.4" width="7.2" height="7.2" rx="1.9" />
      <rect x="13.9" y="13.4" width="7.2" height="7.2" rx="1.9" />
      <path d="M10.1 17h3.8" opacity="0.6" />
    </Frame>
  );
}

/** The network coming to agreement, with the state landing in one step. */
export function SyncIcon(props: IconProps) {
  return (
    <Frame {...props}>
      <path d="M4.3 12a7.7 7.7 0 0 1 13.1-5.45" />
      <path d="M17.6 3.4v3.3h-3.3" />
      <path d="M19.7 12a7.7 7.7 0 0 1-13.1 5.45" />
      <path d="M6.4 20.6v-3.3h3.3" />
      <path d="M12.9 8.6 10 12.5h2.1L11.1 15.9l3.1-4.2h-2.1Z" fill="currentColor" stroke="none" />
    </Frame>
  );
}

export const TECH_ICONS = {
  geospatial: GeospatialIcon,
  ar: ARIcon,
  rewards: RewardsIcon,
  sync: SyncIcon,
} as const;

export type TechIconName = keyof typeof TECH_ICONS;
