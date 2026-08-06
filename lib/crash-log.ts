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

    /* The snapshot and the timestamp are the breadcrumb's, not now's: the point
       of the entry is where the page was before it went, not where it is after. */
    const entry: CrashEntry = {
      ...crumb,
      kind: "reload",
      message: `page came back as "${nav.type}" — fields below are the last state before it`,
    };
    window.localStorage.setItem(KEY, JSON.stringify([entry, ...log].slice(0, MAX_ENTRIES)));
  } catch {
    /* As everywhere else here: a logger must never be the thing that throws. */
  }
}

export function recordBreadcrumb() {
  if (typeof window === "undefined") return;
  try {
    const rest = readCrashLog().filter((e) => e.kind !== "breadcrumb");
    const entry: CrashEntry = {
      at: new Date().toISOString(),
      kind: "breadcrumb",
      message: "last known state",
      ...snapshot(),
    };
    window.localStorage.setItem(
      KEY,
      JSON.stringify([entry, ...rest].slice(0, MAX_ENTRIES)),
    );
  } catch {
    /* ignored, as above */
  }
}
