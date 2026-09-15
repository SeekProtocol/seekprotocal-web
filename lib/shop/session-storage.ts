/** Browser lifetime policy. Server authorization still belongs to Supabase/RLS. */
export const SHOP_IDLE_MS = 30 * 60_000;
export const SHOP_MAX_SESSION_MS = 8 * 60 * 60_000;
export type SessionEnd = "expired" | "signed-out";
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type Entry = {
  version: 1;
  sessionId: string;
  startedAt: number;
  lastActivityAt: number;
  value: string | null;
  reason: SessionEnd | null;
  endedIds: string[];
};

// This claim identifies a browser session across token refreshes. It does not
// authorize anything; the API must continue validating the actual JWT.
function tokenSessionId(token: string): string | null {
  try {
    const part = token.split(".")[1];
    const claims = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof claims.session_id === "string" && claims.session_id ? claims.session_id : null;
  } catch { return null; }
}
function accessToken(value: string | null): string | null {
  try {
    const data = JSON.parse(value ?? "null");
    return typeof data?.access_token === "string" ? data.access_token : null;
  } catch { return null; }
}

/** One atomic entry shares deadlines and sign-out across tabs. No token survives
 * expiry. A tombstone also rejects a late refresh of an ended session. */
export function createShopSessionStorage(
  storage: StorageLike,
  authKey: string,
  {now = Date.now, onChange = () => {}, onEnd = () => {}}: {
    now?: () => number;
    onChange?: () => void;
    onEnd?: (token: string | null, reason: SessionEnd) => void;
  } = {},
) {
  const policyKey = `${authKey}:shop-lifetime-v1`;
  function read(): Entry | null {
    try {
      const entry = JSON.parse(storage.getItem(policyKey) ?? "null");
      if (entry?.version !== 1 || typeof entry.sessionId !== "string" ||
          !Number.isFinite(entry.startedAt) || !Number.isFinite(entry.lastActivityAt) ||
          entry.startedAt > entry.lastActivityAt ||
          !(entry.value === null || typeof entry.value === "string") ||
          ![null, "expired", "signed-out"].includes(entry.reason) ||
          !Array.isArray(entry.endedIds) || !entry.endedIds.every((id: unknown) => typeof id === "string")) return null;
      return entry;
    } catch { return null; }
  }
  function write(entry: Entry) {
    storage.setItem(policyKey, JSON.stringify(entry));
    onChange();
  }
  function end(entry: Entry, reason: SessionEnd) {
    if (!entry.value) return;
    const token = accessToken(entry.value);
    write({...entry, value: null, reason, endedIds: [...new Set([...entry.endedIds, entry.sessionId])].slice(-32)});
    onEnd(token, reason);
  }
  function expired(entry: Entry) {
    const time = now();
    return time < entry.lastActivityAt || time - entry.lastActivityAt >= SHOP_IDLE_MS ||
      time - entry.startedAt >= SHOP_MAX_SESSION_MS;
  }
  function current(): Entry | null {
    // Old sessions have no trustworthy activity deadline. Require one fresh
    // login on upgrade, rather than assigning an old login a new lifetime.
    const legacy = storage.getItem(authKey);
    if (legacy) {
      storage.removeItem(authKey);
      if (!read()) {
        const token = accessToken(legacy);
        const id = token ? tokenSessionId(token) : null;
        write({version: 1, sessionId: id ?? "legacy", startedAt: now(), lastActivityAt: now(),
          value: null, reason: "expired", endedIds: id ? [id] : []});
        onEnd(token, "expired");
      }
    }
    const entry = read();
    if (!entry?.value) return null;
    const token = accessToken(entry.value);
    if (!token || tokenSessionId(token) !== entry.sessionId || expired(entry)) {
      end(entry, "expired");
      return null;
    }
    return entry;
  }
  return {
    policyKey,
    getItem(key: string): string | null {
      return key === authKey ? current()?.value ?? null : storage.getItem(key);
    },
    setItem(key: string, value: string) {
      if (key !== authKey) { storage.setItem(key, value); return; }
      // Check the old deadline before handling an SDK refresh/write.
      current();
      const previous = read();
      const token = accessToken(value);
      const id = token ? tokenSessionId(token) : null;
      if (!id || previous?.endedIds.includes(id)) return;
      if (previous?.sessionId === id) {
        if (previous.value) write({...previous, value});
        return;
      }
      const time = now();
      write({version: 1, sessionId: id, startedAt: time, lastActivityAt: time, value, reason: null,
        endedIds: previous ? [...new Set([...previous.endedIds, previous.sessionId])].slice(-32) : []});
    },
    removeItem(key: string) {
      if (key !== authKey) { storage.removeItem(key); return; }
      const entry = current();
      if (entry) end(entry, "signed-out");
    },
    /** Only genuine input calls this; refresh, polling and focus do not. */
    activity() {
      const entry = current();
      if (!entry) return;
      // Coalesce frequent scroll/input events while checking expiry every time.
      if (now() - entry.lastActivityAt >= 1000) write({...entry, lastActivityAt: now()});
    },
    accepts(token: string) {
      const entry = current();
      return !!entry && tokenSessionId(token) === entry.sessionId;
    },
    remaining() {
      const entry = current();
      return entry ? Math.max(0, Math.min(entry.lastActivityAt + SHOP_IDLE_MS, entry.startedAt + SHOP_MAX_SESSION_MS) - now()) : null;
    },
    reason(): SessionEnd | null { current(); return read()?.reason ?? null; },
    signOut() { const entry = current(); if (entry) end(entry, "signed-out"); },
  };
}
