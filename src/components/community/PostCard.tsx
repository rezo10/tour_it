import type { CommunityPost } from "@/lib/mock-data";
import { Heart, MessageCircle } from "lucide-react";

type Props = {
  post: CommunityPost;
};

export function PostCard({ post }: Props) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">{post.author}</p>
          <p className="text-xs text-slate-500">{post.timeAgo}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{post.excerpt}</p>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Heart className="h-4 w-4 text-rose-400" aria-hidden />
          {post.likes}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-4 w-4 text-accent-500" aria-hidden />
          {post.comments}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
          Sign in to interact
        </span>
      </div>
    </article>
  );
}
