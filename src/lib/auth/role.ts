import { createClient } from "@/lib/supabase/server";

/**
 * Returns true when the currently signed-in user has profiles.role = 'admin'.
 * Returns false for guests, missing profile rows, or any read error — the
 * UI/server actions must NEVER fall back to "true" if the lookup fails.
 *
 * Server-only.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) return false;
    return data.role === "admin";
  } catch {
    return false;
  }
}
