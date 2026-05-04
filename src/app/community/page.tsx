import Link from "next/link";
import { PostCardInteractive } from "@/components/community/PostCardInteractive";
import { PostComposer } from "@/components/community/PostComposer";
import { mockCommunityPosts } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { PenLine } from "lucide-react";

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.max(0, now - d.getTime());
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day} gün önce`;
  return d.toLocaleDateString();
}

export default async function CommunityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  type Row = {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: { display_name: string | null } | null;
  };

  let rows: Row[] = [];
  let likeCount: Record<string, number> = {};
  let commentCount: Record<string, number> = {};
  let myLikes = new Set<string>();

  const { data: fromDb, error } = await supabase
    .from("posts")
    .select(
      "id, content, created_at, user_id, profiles ( display_name )",
    )
    .order("created_at", { ascending: false })
    .limit(40);

  if (!error && fromDb?.length) {
    rows = fromDb.map((r) => {
      const raw = r as {
        id: string;
        content: string;
        created_at: string;
        user_id: string;
        profiles:
          | { display_name: string | null }
          | { display_name: string | null }[]
          | null;
      };
      const profiles = Array.isArray(raw.profiles)
        ? raw.profiles[0] ?? null
        : raw.profiles;
      return {
        id: raw.id,
        content: raw.content,
        created_at: raw.created_at,
        user_id: raw.user_id,
        profiles,
      };
    });
    const ids = rows.map((r) => r.id);

    const { data: likesRows } = await supabase
      .from("post_likes")
      .select("post_id, user_id")
      .in("post_id", ids);

    for (const id of ids) {
      likeCount[id] = 0;
      commentCount[id] = 0;
    }
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
      .select("post_id")
      .in("post_id", ids);

    if (commentRows) {
      for (const c of commentRows) {
        commentCount[c.post_id] = (commentCount[c.post_id] ?? 0) + 1;
      }
    }
  }

  const useMock = rows.length === 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Community
          </h1>
          <p className="mt-2 text-slate-600">
            Gönderiler Supabase&apos;te saklanır; beğeni ve yorumlar RLS ile
            korunur.
          </p>
        </div>
        {!user && (
          <Link
            href="/login?next=/community"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <PenLine className="h-4 w-4" aria-hidden />
            Gönderi için giriş
          </Link>
        )}
      </header>

      {user && <PostComposer />}

      <div className="space-y-4">
        {useMock
          ? mockCommunityPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-5 text-sm text-slate-600"
              >
                <p className="font-medium text-slate-800">Örnek veri</p>
                <p className="mt-2 text-slate-600">{post.excerpt}</p>
                <p className="mt-2 text-xs text-slate-500">
                  Tablolar hazırsa yukarıdaki listede gerçek gönderiler görünür.
                </p>
              </article>
            ))
          : rows.map((post) => (
              <PostCardInteractive
                key={post.id}
                id={post.id}
                author={
                  post.profiles?.display_name?.trim() ||
                  post.user_id.slice(0, 8)
                }
                timeLabel={formatTime(post.created_at)}
                content={post.content}
                likes={likeCount[post.id] ?? 0}
                comments={commentCount[post.id] ?? 0}
                canInteract={!!user}
                likedByMe={myLikes.has(post.id)}
              />
            ))}
      </div>
    </div>
  );
}
