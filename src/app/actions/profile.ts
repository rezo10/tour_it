/**
 * Server action that updates the calling user's profile row. Reads the
 * fields out of a FormData payload submitted from the ProfileForm and
 * applies basic validation before writing to Supabase.
 */
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Accept only real http/https URLs as profile photos.
function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You need to sign in to update your profile." as const };
  }

  // Read + normalise the three editable fields.
  const display_name = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatar_url = String(formData.get("avatar_url") ?? "").trim();

  // display_name rules: optional, but if provided must look username-y.
  if (display_name.length > 0) {
    if (display_name.length < 2 || display_name.length > 32) {
      return {
        error: "Username must be between 2 and 32 characters." as const,
      };
    }
    if (!/^[\p{L}\p{N}._-]+$/u.test(display_name)) {
      return {
        error:
          "Username can only contain letters, numbers, dot, underscore and hyphen." as const,
      };
    }
  }

  // Optional avatar URL: must be a real http(s) link, else clear it.
  let nextAvatar: string | null = null;
  if (avatar_url.length > 0) {
    if (!isHttpUrl(avatar_url)) {
      return {
        error: "Profile photo URL must start with http or https." as const,
      };
    }
    nextAvatar = avatar_url;
  }

  // Write the update — RLS ensures users can only update their own row.
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: display_name || null,
      bio: bio || null,
      avatar_url: nextAvatar,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  // Refresh both views that show the user's profile.
  revalidatePath("/profile");
  revalidatePath(`/profile/${user.id}`);
  return { success: true as const };
}
