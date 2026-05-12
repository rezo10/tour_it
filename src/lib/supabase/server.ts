/**
 * Server-side Supabase client used inside Server Components, route handlers
 * and Server Actions. Wires the session cookies from Next's request scope so
 * that auth.getUser() can identify the calling user.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function createClient() {
  // Read the incoming request's cookies (next/headers gives us the live store).
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();

  // Bind cookie read/write into the SSR helper so Supabase can refresh the
  // access token transparently on every request.
  return createServerClient(url, anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            // Persist the (possibly refreshed) auth cookies back to the response.
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component; ignore if middleware already set cookies.
          }
        },
      },
    },
  );
}
