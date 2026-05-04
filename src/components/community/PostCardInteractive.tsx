"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleLike } from "@/app/actions/community";
import { Heart, MessageCircle } from "lucide-react";

type Props = {
  id: string;
  author: string;
  timeLabel: string;
  content: string;
  likes: number;
  comments: number;
  canInteract: boolean;
  likedByMe: boolean;
};

export function PostCardInteractive({
  id,
  author,
  timeLabel,
  content,
  likes,
  comments,
  canInteract,
  likedByMe,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function onLike() {
    if (!canInteract || pending) return;
    start(async () => {
      await toggleLike(id);
      router.refresh();
    });
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{author}</p>
          <p className="text-xs text-slate-500">{timeLabel}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
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
          title={canInteract ? "Beğen" : "Beğenmek için giriş yap"}
        >
          <Heart
            className={`h-4 w-4 ${likedByMe ? "fill-rose-500 text-rose-500" : "text-rose-400"}`}
            aria-hidden
          />
          {likes}
        </button>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-4 w-4 text-accent-500" aria-hidden />
          {comments}
        </span>
        {!canInteract && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
            Beğeni için giriş
          </span>
        )}
      </div>
    </article>
  );
}
