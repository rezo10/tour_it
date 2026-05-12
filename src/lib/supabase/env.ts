/**
 * Centralised access to the public Supabase env vars. Both the server and
 * the browser need these, so they live behind a single getter that also
 * detects unfilled .env.example placeholders.
 */

/**
 * Read NEXT_PUBLIC_* environment values exposed by Next to both server and
 * client builds. Placeholders from .env.example are treated as "not
 * configured" so the app can render a friendly notice instead of crashing.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return { url, anonKey };
}

/**
 * True only when both env vars are present AND don't look like the unedited
 * placeholders from .env.example.
 */
export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabasePublicEnv();
  if (!url || !anonKey) return false;
  // Guard against shipping the template values to production.
  if (url.includes("YOUR_PROJECT_REF")) return false;
  if (anonKey === "your_anon_key") return false;
  return true;
}
