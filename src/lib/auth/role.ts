/**
 * Server-only helper for reading the caller's admin status from the
 * `profiles.role` column. UI gating + server actions consume this to decide
 * whether to show moderation affordances and to enforce permission.
 */
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
    // Identify the calling user from the request's session cookie.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // Look up the role column for this profile row.
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    // Any failure → treat as non-admin. Never elevate on errors.
    if (error || !data) return false;
    return data.role === "admin";
  } catch {
    return false;
  }
}
