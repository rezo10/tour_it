/**
 * Per-request Supabase session refresh, called from the root middleware
 * (src/middleware.ts). Refreshes the auth cookies if needed and gates
 * access to authenticated-only routes like /plan.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  // Default response we'll return if nothing needs redirecting.
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url, anonKey } = getSupabasePublicEnv();

  // Mirror request cookies in/out so Supabase can rotate the session token.
  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Reflect new cookies on the incoming request copy first…
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // …then rebuild the response so downstream handlers see them too.
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Pull the current user (also triggers any pending token refresh).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Guard: /plan is sign-in only. Bounce anonymous visitors to /login.
  if (!user && request.nextUrl.pathname.startsWith("/plan")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", "/plan");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
