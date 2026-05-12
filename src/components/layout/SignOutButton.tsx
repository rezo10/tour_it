/**
 * Small client-side button that signs the current user out via the
 * browser Supabase client, then refreshes the route tree and routes
 * back to the home page.
 */
"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    // refresh() invalidates server-component caches (so the header no
    // longer shows the previous user), then we navigate home.
    router.refresh();
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
    >
      Sign out
    </button>
  );
}
