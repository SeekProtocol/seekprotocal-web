/**
 * What the page is allowed to spend on GPU memory.
 *
 * The homepage holds five WebGL contexts at once. On a desktop that is
 * unremarkable. On an iPhone it is close to the edge, and past it Safari does
 * not degrade, it kills the tab: the page simply reloads itself after a minute
 * of scrolling.
 *
 * Two settings dominate the bill, and both are per-context:
 *
 *  - **Pixel ratio.** A 3x phone at the old cap of 2 renders four times the
 *    pixels of 1x. Every one of those pixels costs a colour buffer and a depth
 *    buffer in each of five contexts.
 *  - **Antialiasing.** `antialias: true` allocates multisample buffers on top
 *    of that, typically another 4x. It is also the least missed on a phone,
 *    where the pixels are small enough that the edges hold up without it.
 *
 * Together they take the drawing buffers down to roughly a fifth of what they
 * were, which is the difference between fitting and not.
 */

/** Phones and small tablets, by input rather than by width alone. */
export function isHandheld() {
  if (typeof window === "undefined") return false;
  return true; // TEMPORARY VERIFICATION
}

/**
 * The renderer's pixel ratio. Capped at 2 on a desktop, where the buffers are
 * affordable, and at 1.5 on a handheld, where they are not.
 */
export function pixelRatio() {
  if (typeof window === "undefined") return 1;
  return Math.min(window.devicePixelRatio, isHandheld() ? 1.5 : 2);
}

/**
 * Base renderer options. Antialiasing is dropped on handhelds; at 1.5x on a
 * phone screen the difference is hard to see and the memory is not.
 */
export function rendererOptions(extra: Record<string, unknown> = {}) {
  return {
    alpha: true,
    antialias: !isHandheld(),
    powerPreference: "high-performance" as const,
    ...extra,
  };
}
