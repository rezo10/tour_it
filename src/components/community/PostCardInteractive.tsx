/**
 * The interactive card for a single community post. Renders the
 * author + metadata, the image (if any) and content, plus the like
 * button, comment toggle, and admin/owner delete control. The nested
 * <CommentThread> is lazy-mounted only when the user opens it.
 */
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePost, toggleLike } from "@/app/actions/community";
import { CommentThread, type CommentNode } from "./CommentThread";
import { AdminBadge } from "@/components/common/AdminBadge";
import { Heart, MessageCircle, Tag, Trash2 } from "lucide-react";

type Props = {
  id: string;
  author: string;
  authorId: string;
  authorIsAdmin?: boolean;
  timeLabel: string;
  title: string | null;
  content: string;
  category: string | null;
  imageUrl: string | null;
  likes: number;
  comments: CommentNode[];
  canInteract: boolean;
  likedByMe: boolean;
  isMine: boolean;
  viewerIsAdmin: boolean;
};

export function PostCardInteractive({
  id,
  author,
  authorId,
  authorIsAdmin = false,
  timeLabel,
  title,
  content,
  category,
  imageUrl,
  likes,
  comments,
  canInteract,
  likedByMe,
  isMine,
  viewerIsAdmin,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  // Fall back to text-only if the supplied image URL fails to load.
  const [imageBroken, setImageBroken] = useState(false);
  // Comments stay collapsed until the user explicitly toggles them.
  const [open, setOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Owner OR admin can delete. The server action enforces this via RLS.
  const canDelete = isMine || viewerIsAdmin;

  function onLike() {
    if (!canInteract || pending) return;
    start(async () => {
      await toggleLike(id);
      router.refresh();
    });
  }

  function onDelete() {
    if (!canDelete || pending) return;
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleteError(null);
    start(async () => {
      const r = await deletePost(id);
      if ("error" in r && r.error) {
        setDeleteError(r.error);
        return;
      }
      router.refresh();
    });
  }

  // Recursive count so nested replies are included in the badge total.
  const totalComments = (function count(nodes: CommentNode[]): number {
    return nodes.reduce(
      (acc, n) => acc + 1 + count(n.children),
      0,
    );
  })(comments);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {imageUrl && !imageBroken && (
        <div className="relative h-48 w-full bg-slate-100">
          <Image
            src={imageUrl}
            alt={title ?? "Community post image"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 640px"
            onError={() => setImageBroken(true)}
            unoptimized
          />
        </div>
      )}

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Link
                href={`/profile/${authorId}`}
                className="text-sm font-semibold text-slate-900 hover:text-coral-700"
              >
                {author}
              </Link>
              {authorIsAdmin && <AdminBadge compact />}
            </div>
            <p className="text-xs text-slate-500">{timeLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            {category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-coral-50 px-2.5 py-0.5 text-[11px] font-medium text-coral-800">
                <Tag className="h-3 w-3" aria-hidden />
                {category}
              </span>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                title={
                  isMine
                    ? "Delete your post"
                    : "Delete this post (admin moderation)"
                }
              >
                <Trash2 className="h-3 w-3" aria-hidden />
                Delete
              </button>
            )}
          </div>
        </div>
        {deleteError && (
          <p
            className="mt-2 rounded-lg bg-rose-50 px-2 py-1 text-xs text-rose-700"
            role="alert"
          >
            {deleteError}
          </p>
        )}

        {title && (
          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            {title}
          </h3>
        )}
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
          {content}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <button
            type="button"
            onClick={onLike}
            disabled={!canInteract || pending}
            className={`inline-flex items-center gap-1 rounded-lg px-1 transition ${
              canInteract
                ? "hover:bg-rose-50 hover:text-rose-600"
                : "cursor-not-allowed opacity-70"
            }`}
            title={canInteract ? "Like this post" : "Sign in to like"}
          >
            <Heart
              className={`h-4 w-4 ${
                likedByMe ? "fill-rose-500 text-rose-500" : "text-rose-400"
              }`}
              aria-hidden
            />
            {likes}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-1 rounded-lg px-1 transition hover:bg-coral-50 hover:text-coral-700"
          >
            <MessageCircle className="h-4 w-4 text-accent-500" aria-hidden />
            {totalComments}
            <span className="ml-1 hidden text-[11px] font-medium text-slate-500 sm:inline">
              {open ? "Hide" : "Show"}
            </span>
          </button>
          {!canInteract && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
              Sign in to interact
            </span>
          )}
        </div>

        {open && (
          <CommentThread
            postId={id}
            comments={comments}
            canInteract={canInteract}
            viewerIsAdmin={viewerIsAdmin}
          />
        )}
      </div>
    </article>
  );
}
