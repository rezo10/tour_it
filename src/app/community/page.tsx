import Link from "next/link";
import { PostCardInteractive } from "@/components/community/PostCardInteractive";
import { PostComposer } from "@/components/community/PostComposer";
import type { CommentNode } from "@/components/community/CommentThread";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PenLine } from "lucide-react";

function formatTime(iso: string) {
  const d = new Date(iso);
  const diff = Math.max(0, Date.now() - d.getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString();
}

type PostRow = {
  id: string;
  title: string | null;
  content: string;
  category: string | null;
  image_url: string | null;
  created_at: string;
  user_id: string;
  profiles: { display_name: string | null; role: string | null } | null;
};

type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  profiles: { display_name: string | null; role: string | null } | null;
};

function buildCommentTree(
  rows: CommentRow[],
  currentUserId: string | null,
): Map<string, CommentNode[]> {
  const byId = new Map<string, CommentNode>();
  for (const c of rows) {
    byId.set(c.id, {
      id: c.id,
      author: c.profiles?.display_name?.trim() || c.user_id.slice(0, 8),
      authorId: c.user_id,
      authorIsAdmin: c.profiles?.role === "admin",
      content: c.content,
      createdAt: c.created_at,
      parentId: c.parent_comment_id,
      isMine: currentUserId === c.user_id,
      children: [],
    });
  }
  const roots = new Map<string, CommentNode[]>();
  for (const c of rows) {
    const node = byId.get(c.id);
    if (!node) continue;
    if (c.parent_comment_id) {
      const parent = byId.get(c.parent_comment_id);
      if (parent) {
        parent.children.push(node);
        continue;
      }
    }
    const list = roots.get(c.post_id) ?? [];
    list.push(node);
    roots.set(c.post_id, list);
  }
  return roots;
}

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Community
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            The community feed is temporarily unavailable. Please try again in
            a moment.
          </p>
        </header>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let viewerIsAdmin = false;
  if (user) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    viewerIsAdmin = viewerProfile?.role === "admin";
  }

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, title, content, category, image_url, created_at, user_id, profiles ( display_name, role )",
    )
    .order("created_at", { ascending: false })
    .limit(40);

  let posts: PostRow[] = [];
  if (!postsError && postsData?.length) {
    posts = postsData.map((r) => {
      const raw = r as unknown as Omit<PostRow, "profiles"> & {
        profiles:
          | { display_name: string | null; role: string | null }
          | { display_name: string | null; role: string | null }[]
          | null;
      };
      const profiles = Array.isArray(raw.profiles)
        ? raw.profiles[0] ?? null
        : raw.profiles;
      return { ...raw, profiles };
    });
  }

  const postIds = posts.map((p) => p.id);
  const likeCount: Record<string, number> = {};
  const myLikes = new Set<string>();
  const commentRoots = new Map<string, CommentNode[]>();

  if (postIds.length > 0) {
    const { data: likesRows } = await supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", postIds);

    for (const id of postIds) likeCount[id] = 0;
    if (likesRows) {
      for (const l of likesRows) {
        likeCount[l.post_id] = (likeCount[l.post_id] ?? 0) + 1;
        if (user && l.user_id === user.id) {
          myLikes.add(l.post_id);
        }
      }
    }

    const { data: commentRows } = await supabase
      .from("comments")
      .select(
        "id, post_id, user_id, parent_comment_id, content, created_at, profiles ( display_name, role )",
      )
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    if (commentRows) {
      const normalized: CommentRow[] = commentRows.map((c) => {
        const raw = c as unknown as Omit<CommentRow, "profiles"> & {
          profiles:
            | { display_name: string | null; role: string | null }
            | { display_name: string | null; role: string | null }[]
            | null;
        };
        const profiles = Array.isArray(raw.profiles)
          ? raw.profiles[0] ?? null
          : raw.profiles;
        return { ...raw, profiles };
      });
      const tree = buildCommentTree(normalized, user?.id ?? null);
      for (const [k, v] of tree) commentRoots.set(k, v);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Community
          </h1>
          <p className="mt-2 text-slate-600">
            Share itinerary stories, photos and tips. Like, comment and follow
            other travellers.
          </p>
        </div>
        {!user && (
          <Link
            href="/login?next=/community"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <PenLine className="h-4 w-4" aria-hidden />
            Sign in to post
          </Link>
        )}
      </header>

      {user && <PostComposer />}

      {postsError && (
        <p
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="alert"
        >
          We couldn&apos;t load the community feed. Please refresh the page.
        </p>
      )}

      <div className="space-y-4">
        {posts.length === 0 && !postsError ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center">
            <p className="text-sm font-semibold text-slate-900">
              No posts yet
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Be the first to share a trip story. Use the composer above (after
              signing in) to start the conversation.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCardInteractive
              key={post.id}
              id={post.id}
              author={
                post.profiles?.display_name?.trim() || post.user_id.slice(0, 8)
              }
              authorId={post.user_id}
              authorIsAdmin={post.profiles?.role === "admin"}
              timeLabel={formatTime(post.created_at)}
              title={post.title}
              content={post.content}
              category={post.category}
              imageUrl={post.image_url}
              likes={likeCount[post.id] ?? 0}
              comments={commentRoots.get(post.id) ?? []}
              canInteract={!!user}
              likedByMe={myLikes.has(post.id)}
              isMine={user?.id === post.user_id}
              viewerIsAdmin={viewerIsAdmin}
            />
          ))
        )}
      </div>
    </div>
  );
}
