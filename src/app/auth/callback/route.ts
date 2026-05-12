/**
 * OAuth / magic-link callback endpoint. Supabase redirects the browser here
 * with a one-time `code` query param after a successful provider sign-in;
 * we exchange that for a real session cookie and then bounce the user to
 * the page they originally requested (defaults to /plan).
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Where to land after a successful exchange (set when the login link was created).
  const next = searchParams.get("next") ?? "/plan";

  if (code) {
    const supabase = await createClient();
    // Swap the short-lived OTP code for an access/refresh token pair.
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Anything that goes wrong — missing/expired code or exchange error —
  // sends the user back to /login with a flag we can show as a toast.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
