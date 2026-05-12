/**
 * Server actions for the Community module: creating posts and comments,
 * toggling likes and follows, deleting posts/comments (with admin
 * moderation via RLS). Each action validates auth + input, then defers
 * permission checks to the database's RLS policies.
 */
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Closed list of post categories; anything else is normalised to "General".
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

// Minimal URL sanitiser — only http/https schemes are accepted as images.
function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Create a new community post under the calling user. */
export async function createPost(input: CreatePostInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in to share a post." as const };

  // Trim + validate the basic fields before inserting.
  const title = input.title.trim();
  const content = input.content.trim();
  if (!content) return { error: "Your post can't be empty." as const };
  if (title.length > 120) {
    return { error: "Title is too long (max 120 characters)." as const };
  }

  // Normalise the category against the closed list above.
  let category: string | null = null;
  if (input.category && input.category.trim().length > 0) {
    const match = VALID_CATEGORIES.find(
      (c) => c.toLowerCase() === input.category!.trim().toLowerCase(),
    );
    category = match ?? "General";
  }

  // Optional image URL — kept only when it's a real http(s) link.
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

/**
 * Toggle the calling user's like on a post. If a row already exists we
 * remove it (unlike); otherwise we insert it (like).
 */
export async function toggleLike(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in to like posts." as const };

  // Look up the existing like row, if any.
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

  // Refresh the cached community feed so the new count shows up.
  revalidatePath("/community");
  return { success: true as const };
}

/**
 * Add a comment (or reply) to a post. `parentCommentId` is set when the
 * UI is replying to an existing comment — this is what turns the flat
 * comments table into a nested thread on read.
 */
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

/**
 * Toggle follow/unfollow for another user. Self-follow is rejected
 * client-side here and also via a CHECK constraint on the follows table.
 */
export async function toggleFollow(targetUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to sign in to follow users." as const };
  if (user.id === targetUserId) {
    return { error: "You can't follow yourself." as const };
  }

  // Is there an existing follow row for this (follower, target) pair?
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

  // Both pages display follower counts; revalidate them now.
  revalidatePath("/community");
  revalidatePath(`/profile/${targetUserId}`);
  return { success: true as const };
}
