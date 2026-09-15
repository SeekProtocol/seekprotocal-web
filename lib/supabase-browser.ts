import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createShopSessionStorage } from "@/lib/shop/session-storage";

/** One client per browser tab; the shop shares accounts with the mobile app. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SHOP_SESSION_EVENT = "shop-session-changed";
let client: SupabaseClient | null = null;
let policy: ReturnType<typeof createShopSessionStorage> | null = null;

export function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getShopSessionPolicy() {
  if (!policy && typeof window !== "undefined") {
    const key = `sb-${new URL(SUPABASE_URL).hostname.split(".")[0]}-auth-token`;
    policy = createShopSessionStorage(window.localStorage, key, {
      onChange: () => queueMicrotask(() => window.dispatchEvent(new Event(SHOP_SESSION_EVENT))),
      onEnd: (token) => {
        // Clear browser credentials and private UI first, even offline. Revoke
        // only this JWT's session: the player's mobile login stays independent.
        // This is the same public JWT logout call used by auth.signOut('local').
        if (token) queueMicrotask(() => { void client?.auth.admin.signOut(token, "local").catch(() => {}); });
      },
    });
  }
  return policy;
}

export function signOutShop() {
  getShopSessionPolicy()?.signOut();
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: getShopSessionPolicy() ?? undefined,
      },
    });
  }
  return client;
}
