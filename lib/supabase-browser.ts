import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The browser client for the shop, and nothing else on the site.
 *
 * Same project as the app, so a player signs in here with the account they
 * play with and the pack credits land on that account. PKCE, because the
 * OAuth round trip comes back to a page rather than a native scheme, and the
 * code in the URL is exchanged here on the client (`detectSessionInUrl`).
 *
 * One instance per tab. supabase-js keeps the session in localStorage and
 * refreshes it on a timer; a second client would run a second timer against
 * the same storage.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let client: SupabaseClient | null = null;

export function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        flowType: "pkce",
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
