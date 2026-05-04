import { PrototypeBanner } from "@/components/layout/PrototypeBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function MainShell({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();

  let user: { email: string; nick: string | null } | null = null;
  if (configured) {
    const supabase = await createClient();
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (u) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", u.id)
        .maybeSingle();
      const raw = prof?.display_name?.trim();
      user = {
        email: u.email ?? "",
        nick: raw && raw.length > 0 ? raw : null,
      };
    }
  }

  return (
    <>
      <PrototypeBanner supabaseConfigured={configured} />
      <SiteHeader user={user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
