"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const VALID_CATEGORIES = [
  "General",
  "Adventure",
  "Cultural",
  "Relaxing",
  "Food",
  "Tips",
] as const;

export type PostCategory = (typeof VALID_CATEGORIES)[number];

export type CreatePostInput = {
  title: string;
  content: string;
  category?: string;
  imageUrl?: string;
};

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createPost(input: CreatePostInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in to share a post." as const };

  const title = input.title.trim();
  const content = input.content.trim();
  if (!content) return { error: "Your post can't be empty." as const };
  if (title.length > 120) {
    return { error: "Title is too long (max 120 characters)." as const };
  }

  let category: string | null = null;
  if (input.category && input.category.trim().length > 0) {
    const match = VALID_CATEGORIES.find(
      (c) => c.toLowerCase() === input.category!.trim().toLowerCase(),
    );
    category = match ?? "General";
  }

  let imageUrl: string | null = null;
  if (input.imageUrl && input.imageUrl.trim().length > 0) {
    if (!isHttpUrl(input.imageUrl.trim())) {
      return { error: "The image URL must start with http or https." as const };
    }
    imageUrl = input.imageUrl.trim();
  }

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    title: title || null,
    content,
    category,
    image_url: imageUrl,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  revalidatePath("/community");
  return { success: true as const };
}

export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in to like posts." as const };

  const { data: existing } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("post_likes")
      .insert({ post_id: postId, user_id: user.id });
  }

  revalidatePath("/community");
  return { success: true as const };
}

export async function createComment(
  postId: string,
  content: string,
  parentCommentId?: string | null,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in to comment." as const };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Your comment can't be empty." as const };
  if (trimmed.length > 2000) {
    return { error: "Comment is too long (max 2000 characters)." as const };
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content: trimmed,
    parent_comment_id: parentCommentId ?? null,
  });

  if (error) return { error: error.message };
  revalidatePath("/community");
  return { success: true as const };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in." as const };

  // RLS allows owner OR admin (migration 005). We don't restrict here so
  // that admins can moderate; non-admin non-owners get 0 rows + no error.
  const { error, count } = await supabase
    .from("comments")
    .delete({ count: "exact" })
    .eq("id", commentId);

  if (error) return { error: error.message };
  if ((count ?? 0) === 0) {
    return {
      error: "You don't have permission to delete this comment." as const,
    };
  }
  revalidatePath("/community");
  return { success: true as const };
}

export async function deletePost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in." as const };

  const { error, count } = await supabase
    .from("posts")
    .delete({ count: "exact" })
    .eq("id", postId);

  if (error) return { error: error.message };
  if ((count ?? 0) === 0) {
    return {
      error: "You don't have permission to delete this post." as const,
    };
  }
  revalidatePath("/community");
  return { success: true as const };
}

export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in to follow users." as const };
  if (user.id === targetUserId) {
    return { error: "You can't follow yourself." as const };
  }

  const { data: existing } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", user.id)
    .eq("following_id", targetUserId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("follows")
      .delete()
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId);
  } else {
    await supabase
      .from("follows")
      .insert({ follower_id: user.id, following_id: targetUserId });
  }

  revalidatePath("/community");
  revalidatePath(`/profile/${targetUserId}`);
  return { success: true as const };
}
