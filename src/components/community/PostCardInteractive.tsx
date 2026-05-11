"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleLike } from "@/app/actions/community";
import { CommentThread, type CommentNode } from "./CommentThread";
import { Heart, MessageCircle, Tag } from "lucide-react";

type Props = {
  id: string;
  author: string;
  authorId: string;
  timeLabel: string;
  title: string | null;
  content: string;
  category: string | null;
  imageUrl: string | null;
  likes: number;
  comments: CommentNode[];
  canInteract: boolean;
  likedByMe: boolean;
};

export function PostCardInteractive({
  id,
  author,
  authorId,
  timeLabel,
  title,
  content,
  category,
  imageUrl,
  likes,
  comments,
  canInteract,
  likedByMe,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [imageBroken, setImageBroken] = useState(false);
  const [open, setOpen] = useState(false);

  function onLike() {
    if (!canInteract || pending) return;
    start(async () => {
      await toggleLike(id);
      router.refresh();
    });
  }

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
            <Link
              href={`/profile/${authorId}`}
              className="text-sm font-semibold text-slate-900 hover:text-coral-700"
            >
              {author}
            </Link>
            <p className="text-xs text-slate-500">{timeLabel}</p>
          </div>
          {category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-coral-50 px-2.5 py-0.5 text-[11px] font-medium text-coral-800">
              <Tag className="h-3 w-3" aria-hidden />
              {category}
            </span>
          )}
        </div>

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
          />
        )}
      </div>
    </article>
  );
}
