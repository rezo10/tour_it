/**
 * Root Next.js middleware. Runs on every request that isn't a static asset
 * (see matcher below) and delegates Supabase session refresh + protected-
 * route gating to lib/supabase/middleware.ts.
 */
import { type NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // No keys configured? Skip Supabase entirely so dev still works.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Skip static assets and image optimization files — they don't need
     * an auth session and would slow down every request otherwise.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
