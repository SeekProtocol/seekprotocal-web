/**
 * A crash log that survives the reload.
 *
 * The two failures on the phone leave different traces, and neither survives
 * long enough to read. A thrown exception paints the error boundary, but a tap on
 * "try again" or a swipe away takes the message with it. A memory kill is worse:
 * Safari drops the tab and reloads, so the console is wiped before anyone can
 * look, and attaching Web Inspector does not help because the connection dies
 * with the tab.
 *
 * localStorage survives both. Entries are written as they happen and read back
 * afterwards on the same phone, with no cable and no Mac.
 *
 * Nothing leaves the device. This is a local ring buffer, not telemetry: no
 * network call, no identifier, and only the technical fields below.
 */

const KEY = "seek:crashlog";
/** Bounded so a loop cannot fill the origin's storage quota. */
const MAX_ENTRIES = 12;
const MAX_STACK = 1200;

export type CrashEntry = {
  at: string;
  kind: "error" | "rejection" | "boundary" | "breadcrumb" | "reload";
  message: string;
  source?: string;
  stack?: string;
  url: string;
  /** State at the moment of writing, which is what a memory kill needs. */
  scrollY: number;
  viewport: string;
  dpr: number;
  canvases: number;
  megapixels: number;
  /**
   * The shared renderer's offscreen drawing buffer, in megapixels.
   *
   * `canvases`/`megapixels` count only canvases in the document, and the stage
   * renders into one that never is — so those two read 0 while the largest GPU
   * allocation on the page sits invisible. The stage stamps its buffer size on
   * `window.__seekStageMP` whenever it grows; absent means no scene has ever
   * been built in this document, which is itself worth knowing.
   */
  stageMegapixels?: number;
  memoryMB?: number;
  /**
   * How the document this was written in left, which is the whole difference
   * between a crash and a reader pressing refresh.
   *
   * `live` is the default a scroll breadcrumb carries: still running, no exit
   * seen. If a breadcrumb is still saying `live` when the next document starts,
   * the one before it went without being asked — nothing ran, `pagehide` never
   * fired, and that is what a memory kill looks like from in here.
   *
   * `unload` and `bfcache` are both orderly. `pagehide` fired, so the document
   * was told it was going: a refresh, a tap on back, a link. Those are not
   * crashes, and until this field existed there was no way to tell them apart
   * from one — `performance.navigation.type` reports "reload" for a deliberate
   * pull-to-refresh and "back_forward" for an ordinary back tap, exactly as it
   * does after a kill.
   *
   * `hidden` sits between the two. The reader switched tab or app and the page
   * went to the background, which visibilitychange reports reliably where
   * pagehide stays silent. A tab that dies while hidden was evicted by iOS's
   * routine housekeeping — every backgrounded Safari tab risks that, on any
   * site — and counting those as crashes had the log blaming the page for
   * kills that happen to everyone. Only a kill while `live` is the bug.
   */
  exit?: "live" | "unload" | "bfcache" | "hidden";
  /**
   * Which build of the site this document was served by.
   *
   * Vercel stamps it on <html> and returns it on every RSC response as
   * `x-nextjs-deployment-id`. Next compares the two, and when they disagree —
   * which happens the moment a deploy lands while someone has the page open —
   * it reloads the whole document so the reader is not left running half of one
   * build and half of another. Scrolling is enough to trigger the check: links
   * entering the viewport are prefetched, and the prefetch is what carries the
   * newer id back.
   *
   * That reload is indistinguishable from a reader pressing refresh. Both fire
   * pagehide, both come back as navigation type "reload". The only thing that
   * separates them is that the build changed underneath, which is exactly what
   * this field records. Two entries 4 seconds apart in the log were read as a
   * reader refreshing twice; with this they would have named themselves.
   */
  deployment?: string;
};

/**
 * Reads the build id before React can take it off.
 *
 * Vercel writes `data-dpl-id` on <html>, and React removes attributes it did
 * not render when it hydrates the root — the bisect flags were lost exactly
 * this way and had to be reapplied on mount. This runs in <head>, before the
 * body is parsed, so it reads the value while it is still there and parks it
 * somewhere hydration does not touch.
 */
export const deploymentInitScript = `(function(){try{window.__seekDeployment=document.documentElement.getAttribute("data-dpl-id")||"";}catch(e){}})();`;

function deployment(): string | undefined {
  const id = (window as unknown as { __seekDeployment?: string }).__seekDeployment;
  return id || undefined;
}

function snapshot() {
  const canvases = Array.from(document.querySelectorAll("canvas"));
  const mp = canvases.reduce((sum, c) => sum + (c.width * c.height) / 1e6, 0);
  /* Chrome only; Safari does not expose it. Recorded when present because it is
     the number that settles whether a reload was a memory kill. */
  const mem = (performance as { memory?: { usedJSHeapSize: number } }).memory;
  /* Written by lib/three-stage.ts when its offscreen buffer grows. */
  const stageMP = (window as unknown as { __seekStageMP?: number }).__seekStageMP;
  return {
    url: location.pathname + location.hash,
    scrollY: Math.round(window.scrollY),
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    dpr: window.devicePixelRatio,
    canvases: canvases.length,
    megapixels: Number(mp.toFixed(2)),
    ...(stageMP !== undefined ? { stageMegapixels: stageMP } : {}),
    ...(mem ? { memoryMB: Math.round(mem.usedJSHeapSize / 1048576) } : {}),
    ...(deployment() ? { deployment: deployment() } : {}),
  };
}

export function readCrashLog(): CrashEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CrashEntry[]) : [];
  } catch {
    return [];
  }
}

export function clearCrashLog() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* Private browsing refuses writes. Nothing to recover from. */
  }
}

export function record(
  kind: CrashEntry["kind"],
  message: string,
  extra: { source?: string; stack?: string } = {},
) {
  if (typeof window === "undefined") return;
  try {
    const entry: CrashEntry = {
      at: new Date().toISOString(),
      kind,
      message: String(message).slice(0, 500),
      ...(extra.source ? { source: extra.source } : {}),
      ...(extra.stack ? { stack: String(extra.stack).slice(0, MAX_STACK) } : {}),
      ...snapshot(),
    };
    const next = [entry, ...readCrashLog()].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Quota or private browsing. A logger must never be the thing that throws. */
  }
}

/**
 * A breadcrumb, kept to one entry that is overwritten rather than appended.
 *
 * A memory kill gives no warning, so the only way to know where the reader was
 * is to have written it down beforehand. This keeps the most recent position and
 * scene count under a single slot, so it cannot crowd out real errors in the
 * twelve the buffer holds.
 */
/**
 * Keeps the breadcrumb that was left behind when the page reloaded itself.
 *
 * Without this the log destroys its own evidence. The breadcrumb is a single
 * overwritten slot, and the first thing that happens after a reload is another
 * breadcrumb, so the position the reader was at when the tab died is gone
 * before anyone can open /diag and look at it.
 *
 * So on startup the surviving breadcrumb is copied into a kept entry first,
 * stamped with how the browser says it got here, and only then is the slot
 * allowed to move on. Called once from CrashLog, before the first breadcrumb.
 *
 * It reports the navigation type rather than claiming a cause, because a
 * deliberate pull-to-refresh also reads as "reload". What separates the two is
 * what sits next to this entry in the log:
 *
 *  - a `reload` on its own, at a deep scrollY, is a silent kill: Safari
 *    dropping the tab under memory pressure, which throws nothing.
 *  - a `reload` directly above an `error` or `boundary` is an exception, and
 *    that entry names the line.
 */
export function recordReload() {
  if (typeof window === "undefined") return;
  try {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    /* A first visit is "navigate" and has nothing to explain. Only a repeat
       entry into the same document is worth a line. */
    if (nav?.type !== "reload" && nav?.type !== "back_forward") return;

    const log = readCrashLog();
    const crumb = log.find((e) => e.kind === "breadcrumb");
    if (!crumb) return;

    /* Whether the document before this one was told it was going.
       `pagehide` writes unload or bfcache into the breadcrumb; a breadcrumb
       still reading `live` means nothing ran on the way out. Entries written
       before this field existed have no `exit` at all, and those stay
       "unknown" rather than being counted either way. */
    const exit = crumb.exit;

    /* Whether the build changed while the reader was away. This used to be
       checked first and to outrank every other reading, and on 17 August it
       buried a kill: the revival after a kill is itself a load, and that load
       can be served a different deployment than the page it replaces — a stale
       document out of a cache, or a deploy that landed in the meantime. So a
       changed build is consistent with a crash, and the one signal that is not
       is `exit` still reading `live`. Next's skew reload is an ordinary
       navigation and fires pagehide like any other, so a breadcrumb that never
       saw pagehide belongs to a page that was never navigated away from. The
       exit field decides; the deployment only annotates. */
    const wasRedeployed =
      crumb.deployment !== undefined &&
      deployment() !== undefined &&
      crumb.deployment !== deployment();

    const verdict =
      exit === "live"
        ? `KILLED — the page before this went without notice (nav "${nav.type}", no pagehide).${
            wasRedeployed
              ? " The build also changed before it came back; a redeploy reload would have fired pagehide, so the new id arrived with the revival rather than causing the exit."
              : ""
          } Fields below are its last state.`
        : exit === "hidden"
          ? `EVICTED IN BACKGROUND — the tab was hidden when it went (nav "${nav.type}", no pagehide). Safari reclaims hidden tabs as routine housekeeping on any site; this is memory pressure, but not the live, in-hand crash being hunted. Fields below are its last state.`
          : wasRedeployed
          ? `REDEPLOYED — the site shipped a new build while this page was open, so Next reloaded the whole document. Not a crash. Fields below are its last state.`
          : exit === undefined
            ? `came back as "${nav.type}" — no exit was recorded, so this one cannot be called either way`
            : `left cleanly (${exit}) — a refresh or a back tap, and the build did not change. Fields below are its last state.`;

    /* The snapshot and the timestamp are the breadcrumb's, not now's: the point
       of the entry is where the page was before it went, not where it is after. */
    const entry: CrashEntry = {
      ...crumb,
      kind: "reload",
      message: verdict,
    };
    window.localStorage.setItem(KEY, JSON.stringify([entry, ...log].slice(0, MAX_ENTRIES)));
  } catch {
    /* As everywhere else here: a logger must never be the thing that throws. */
  }
}

export function recordBreadcrumb(exit: CrashEntry["exit"] = "live") {
  if (typeof window === "undefined") return;
  try {
    const rest = readCrashLog().filter((e) => e.kind !== "breadcrumb");
    const entry: CrashEntry = {
      at: new Date().toISOString(),
      kind: "breadcrumb",
      message: exit === "live" ? "last known state" : `left cleanly (${exit})`,
      ...snapshot(),
      exit,
    };
    window.localStorage.setItem(
      KEY,
      JSON.stringify([entry, ...rest].slice(0, MAX_ENTRIES)),
    );
  } catch {
    /* ignored, as above */
  }
}
