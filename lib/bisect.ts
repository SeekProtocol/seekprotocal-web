/**
 * Switches for finding out what is killing the tab, by turning things off.
 *
 * The crash log got as far as it can. It says the kill is real, that nothing
 * threw, and that no WebGL context was alive when it happened. It cannot say
 * what *was* costing, because iOS exposes no memory API: Safari gives a web
 * page no way to ask how close it is to the edge it is about to be pushed over.
 *
 * So the remaining move is subtraction. Each flag below removes one suspect
 * from the page. Scroll the same way with a flag on: if the kill stops, the
 * thing that flag removed is implicated, and if it does not, that suspect is
 * cleared. Four tests of a couple of minutes each settle what no amount of
 * reasoning from a desktop has managed all day.
 *
 *   ?fx=off       no filter, backdrop-filter or blend mode
 *   ?anim=off     no animation, transition or will-change
 *   ?img=off      images take their space but are not painted
 *   ?3d=off       no WebGL scene is built at all
 *   ?effects=off  SiteEffects mounts nothing: no observers, no listeners
 *   ?tail=off     the back half of the page is not rendered, halving its height
 *   ?cf=off       no Turnstile widget, and its script is never fetched
 *
 * `cf` was added last and should have been first. Turnstile is failing with a
 * 401 in production and retrying on its own schedule, forever, inside an iframe
 * on another origin — so it is the one thing on the page that none of the flags
 * above could reach, and every one of those tests still had it running. Its
 * console output is the loudest thing on the page and it was mistaken for noise
 * twice, including by me.
 *
 * They combine: `?fx=off&anim=off` turns off both.
 *
 * `tail` is the odd one and the only one that changes the scroll under test.
 * That is deliberate: once the things *on* the page have each been cleared, how
 * much page there is becomes the suspect, and the only way to ask that question
 * is to make it shorter.
 *
 * Applied before first paint, from an attribute on the document element, so a
 * flag is in force for the very first frame rather than arriving after one.
 * Absent from the markup and off unless asked for, so this costs a reader who
 * never uses it nothing but the attribute check.
 */

export const BISECT_FLAGS = [
  "fx",
  "anim",
  "img",
  "3d",
  "effects",
  "tail",
  "cf",
  /* ?rootclip=off — html and body drop their `overflow-x: clip`. The clip on
     the root is the one property that changes how WebKit configures the
     scrolling and tiling machinery itself, and the reduced-motion scroll leak
     (~1.2 MB per scroll event, measured 18 Aug) survived every content-level
     subtraction — filters, animations, images, whole sections — which points
     at machinery rather than content. This was once "tested" by setting
     overflow inline from the inspector console; that test was worthless for
     the same reason the pacemaker injection was: a reload wipes the console's
     work and nothing in the recording proves it was in force. A flag set
     before first paint is provable. The page may scroll sideways while it is
     on; that is acceptable in a diagnostic. */
  "rootclip",
] as const;

/**
 * Runs in <head> before the body is parsed. Kept to one statement per flag and
 * wrapped in a try, because anything that throws here would take the page with
 * it and this is a diagnostic, not a feature.
 */
export const bisectInitScript = `(function(){try{var p=new URLSearchParams(location.search);${JSON.stringify(
  BISECT_FLAGS,
)}.forEach(function(k){if(p.get(k)==="off"){document.documentElement.setAttribute("data-off-"+k,"");}});}catch(e){}})();`;

/** Whether a flag is in force. Reads the attribute the script above set. */
export function isOff(flag: (typeof BISECT_FLAGS)[number]) {
  if (typeof document === "undefined") return false;
  return document.documentElement.hasAttribute(`data-off-${flag}`);
}

/**
 * Puts the attributes back after hydration.
 *
 * The pre-paint script sets them on <html>, and React takes them off again: it
 * reconciles the root element against the attributes it rendered, and these are
 * not among them. `data-theme` survives the same treatment only because it is
 * written into the JSX as well, which these cannot be — the page is statically
 * generated, and reading a query parameter on the server would make it dynamic
 * for every reader, flag or no flag.
 *
 * So the script covers the first frame and this covers the rest. Applying it
 * twice is free; the attribute is either there or it is not.
 */
export function applyBisectFlags() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    for (const flag of BISECT_FLAGS) {
      const attr = `data-off-${flag}`;
      if (params.get(flag) === "off") document.documentElement.setAttribute(attr, "");
      else document.documentElement.removeAttribute(attr);
    }
  } catch {
    /* A diagnostic must never be the thing that breaks the page. */
  }
}
