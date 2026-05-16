/**
 * Community feed loaders. Fetches posts and comments without PostgREST
 * profile embeds so a broken FK join does not hide the entire feed.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type CommunityPostRow = {
  id: string;
  title: string | null;
  content: string;
  category: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: { display_name: string | null; role: string | null } | null;
};

export type CommunityCommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  profiles: { display_name: string | null; role: string | null } | null;
};

type ProfileSnippet = {
  id: string;
  display_name: string | null;
  role: string | null;
};

async function loadProfileMap(
  supabase: SupabaseClient,
  userIds: string[],
): Promise<Map<string, { display_name: string | null; role: string | null }>> {
  const map = new Map<
    string,
    { display_name: string | null; role: string | null }
  >();
  if (userIds.length === 0) return map;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .in("id", userIds);

  for (const p of (profiles ?? []) as ProfileSnippet[]) {
    map.set(p.id, { display_name: p.display_name, role: p.role });
  }
  return map;
}

export async function loadCommunityPosts(
  supabase: SupabaseClient,
  limit = 40,
): Promise<{ posts: CommunityPostRow[]; error: string | null }> {
  const { data: rows, error } = await supabase
    .from("posts")
    .select(
      "id, title, content, category, image_url, created_at, user_id",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return {
      posts: [],
      error:
        "We couldn't load the community feed. Please refresh the page.",
    };
  }

  if (!rows?.length) {
    return { posts: [], error: null };
  }

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const profileMap = await loadProfileMap(supabase, userIds);

  const posts: CommunityPostRow[] = rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    category: r.category,
    image_url: r.image_url,
    created_at: r.created_at,
    user_id: r.user_id,
    profiles: profileMap.get(r.user_id) ?? null,
  }));

  return { posts, error: null };
}

export async function loadCommunityComments(
  supabase: SupabaseClient,
  postIds: string[],
): Promise<CommunityCommentRow[]> {
  if (postIds.length === 0) return [];

  const { data: rows, error } = await supabase
    .from("comments")
    .select(
      "id, post_id, user_id, parent_comment_id, content, created_at",
    )
    .in("post_id", postIds)
    .order("created_at", { ascending: true });

  if (error || !rows?.length) return [];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const profileMap = await loadProfileMap(supabase, userIds);

  return rows.map((r) => ({
    id: r.id,
    post_id: r.post_id,
    user_id: r.user_id,
    parent_comment_id: r.parent_comment_id,
    content: r.content,
    created_at: r.created_at,
    profiles: profileMap.get(r.user_id) ?? null,
  }));
}
