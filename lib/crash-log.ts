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
   */
  exit?: "live" | "unload" | "bfcache";
};

function snapshot() {
  const canvases = Array.from(document.querySelectorAll("canvas"));
  const mp = canvases.reduce((sum, c) => sum + (c.width * c.height) / 1e6, 0);
  /* Chrome only; Safari does not expose it. Recorded when present because it is
     the number that settles whether a reload was a memory kill. */
  const mem = (performance as { memory?: { usedJSHeapSize: number } }).memory;
  return {
    url: location.pathname + location.hash,
    scrollY: Math.round(window.scrollY),
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    dpr: window.devicePixelRatio,
    canvases: canvases.length,
    megapixels: Number(mp.toFixed(2)),
    ...(mem ? { memoryMB: Math.round(mem.usedJSHeapSize / 1048576) } : {}),
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
    const verdict =
      exit === undefined
        ? `came back as "${nav.type}" — no exit was recorded, so this one cannot be called either way`
        : exit === "live"
          ? `KILLED — the page before this went without notice (nav "${nav.type}", no pagehide). Fields below are its last state.`
          : `left cleanly (${exit}) — a refresh or a back tap, not a crash. Fields below are its last state.`;

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
