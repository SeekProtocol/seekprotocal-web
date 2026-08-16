import { SeekMark } from "@/components/brand/SeekLogo";

/**
 * The SEEK mark, as the thing that says something is live.
 *
 * It replaced `.dot-live`, a pulsing blue circle, in the four places that badge
 * a live state: the drop card, the clan board, the film's HUD tag and the
 * deploy console's plate. A dot said "something is happening" without saying
 * whose, and these are the four spots on the site where a reader is looking at
 * the product doing something.
 *
 * `.dot-live` itself stays, and is still right in the two places it is left:
 * the hero's signal-lock readout, where it is a GPS indicator rather than a
 * badge, and the descent's eyebrow, where it is a typographic bullet and the
 * mark would fight the heading beside it.
 *
 * ## Why the id is a prop
 *
 * `SeekMark` fills from a `linearGradient` it defines itself, and SVG ids are
 * global to the document. Two marks on one page with the same id is invalid
 * markup, and a third that changed its stops would silently repaint the others.
 * Every call site passes its own.
 */
export default function LiveMark({ id, size = 13 }: { id: string; size?: number }) {
  return (
    <span className="mark-live" aria-hidden="true">
      <SeekMark size={size} gradientId={id} />
    </span>
  );
}
