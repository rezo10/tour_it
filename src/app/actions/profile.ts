"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Oturum gerekli" as const };
  }

  const display_name = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (display_name.length > 0) {
    if (display_name.length < 2 || display_name.length > 32) {
      return { error: "Nick 2–32 karakter olmalı." as const };
    }
    if (!/^[\p{L}\p{N}._-]+$/u.test(display_name)) {
      return {
        error:
          "Nick yalnızca harf, rakam, nokta, alt çizgi ve tire içerebilir." as const,
      };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: display_name || null,
      bio: bio || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { success: true as const };
}
