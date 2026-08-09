/**
 * The XP mark, as the app draws it.
 *
 * Not invented here. `CatchResultSheet` writes a reward as
 * `<GradientGlyph icon={Lightning} size={13} /> +{xp} XP`, and GradientGlyph
 * uses the glyph as an alpha mask over the brand ramp, so the bolt itself is
 * gradient-filled rather than sitting on a tinted chip. This is that, in SVG.
 *
 * The path is phosphor's Lightning at weight `fill`, lifted from the icon the
 * app actually imports rather than redrawn, so the two cannot drift. Its native
 * artboard is 256 square.
 *
 * The ramp runs mint to blue to magenta on the diagonal, which is
 * `BRAND_GRADIENT` in `components/ui/GradientGlyph.tsx` — note that it is the
 * site's ramp read backwards: the site writes magenta first, the app writes
 * mint first, and this follows the app because this is the app's mark.
 */

/** phosphor Lightning, weight fill, viewBox 256. */
const BOLT =
  "m213.85 125.46-112 120a8 8 0 0 1-13.69-7l14.66-73.33-57.63-21.64a8 8 0 0 1-3-13l112-120a8 8 0 0 1 13.69 7l-14.7 73.41 57.63 21.61a8 8 0 0 1 3 12.95Z";

export default function XpBolt({
  size = 14,
  /**
   * Distinguishes the gradient from any other instance on the page. SVG
   * gradient ids are document-global, so two bolts sharing one would have the
   * second silently take the first's stops.
   */
  id = "xp-bolt",
  className = "",
}: {
  size?: number;
  id?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-ramp`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#02EAA9" />
          <stop offset="50%" stopColor="#049EFD" />
          <stop offset="100%" stopColor="#D04CFB" />
        </linearGradient>
      </defs>
      <path d={BOLT} fill={`url(#${id}-ramp)`} />
    </svg>
  );
}
