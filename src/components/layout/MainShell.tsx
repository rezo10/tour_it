/**
 * MainShell sits inside the root layout and wraps every page with the
 * site-wide chrome — config notice, header, and footer. It also handles
 * the single profile read needed to render the header (user name, avatar
 * and admin badge).
 */
import { ConfigNotice } from "@/components/layout/ConfigNotice";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function MainShell({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();

  // Header user payload — null when not signed in or Supabase isn't configured.
  let user: {
    id: string;
    email: string;
    nick: string | null;
    avatarUrl: string | null;
    isAdmin: boolean;
  } | null = null;
  if (configured) {
    const supabase = await createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (u) {
      // One small select gives us everything the header needs in one round-trip.
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name, avatar_url, role")
        .eq("id", u.id)
        .maybeSingle();
      const raw = prof?.display_name?.trim();
      user = {
        id: u.id,
        email: u.email ?? "",
        nick: raw && raw.length > 0 ? raw : null,
        avatarUrl: prof?.avatar_url ?? null,
        isAdmin: prof?.role === "admin",
      };
    }
  }

  return (
    <>
      <ConfigNotice supabaseConfigured={configured} />
      <SiteHeader user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
