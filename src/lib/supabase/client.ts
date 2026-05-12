/**
 * Browser-side Supabase client used inside Client Components and event
 * handlers. Reads cookies via @supabase/ssr so it shares the session with
 * the server client created in lib/supabase/server.ts.
 */
import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export function createClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
