"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createComment, deleteComment } from "@/app/actions/community";
import { CornerDownRight, MessageCircle, Trash2 } from "lucide-react";

export type CommentNode = {
  id: string;
  author: string;
  authorId: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  isMine: boolean;
  children: CommentNode[];
};

type Props = {
  postId: string;
  comments: CommentNode[];
  canInteract: boolean;
};

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

function CommentItem({
  postId,
  node,
  canInteract,
  depth,
}: {
  postId: string;
  node: CommentNode;
  canInteract: boolean;
  depth: number;
}) {
  const router = useRouter();
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const indent = Math.min(depth, 3) * 16;

  function submitReply() {
    if (!reply.trim()) return;
    setError(null);
    start(async () => {
      const r = await createComment(postId, reply, node.id);
      if ("error" in r && r.error) {
        setError(r.error);
        return;
      }
      setReply("");
      setReplying(false);
      router.refresh();
    });
  }

  function onDelete() {
    setError(null);
    start(async () => {
      const r = await deleteComment(node.id);
      if ("error" in r && r.error) {
        setError(r.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div style={{ marginLeft: indent }} className="space-y-2">
      <div
        className={`rounded-xl border bg-white p-3 shadow-sm ${
          depth > 0
            ? "border-slate-100 bg-slate-50/60"
            : "border-slate-200"
        }`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {depth > 0 && (
              <CornerDownRight
                className="h-3 w-3 text-slate-400"
                aria-hidden
              />
            )}
            <span className="font-semibold text-slate-900">{node.author}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{formatTime(node.createdAt)}</span>
          </div>
          {node.isMine && (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
              title="Delete comment"
            >
              <Trash2 className="h-3 w-3" aria-hidden />
              Delete
            </button>
          )}
        </div>
        <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700">
          {node.content}
        </p>
        {canInteract && (
          <button
            type="button"
            onClick={() => setReplying((r) => !r)}
            className="mt-2 text-[11px] font-semibold text-coral-700 hover:text-coral-900"
          >
            {replying ? "Cancel" : "Reply"}
          </button>
        )}
      </div>

      {replying && canInteract && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            placeholder={`Reply to ${node.author}…`}
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={submitReply}
              disabled={pending || !reply.trim()}
              className="rounded-full bg-coral-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-coral-700 disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send"}
            </button>
            <button
              type="button"
              onClick={() => {
                setReplying(false);
                setReply("");
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            {error && (
              <span className="text-[11px] text-rose-700" role="alert">
                {error}
              </span>
            )}
          </div>
        </div>
      )}

      {node.children.length > 0 && (
        <div className="space-y-2">
          {node.children.map((child) => (
            <CommentItem
              key={child.id}
              postId={postId}
              node={child}
              canInteract={canInteract}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentThread({ postId, comments, canInteract }: Props) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    if (!text.trim()) return;
    setError(null);
    start(async () => {
      const r = await createComment(postId, text, null);
      if ("error" in r && r.error) {
        setError(r.error);
        return;
      }
      setText("");
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <MessageCircle className="h-3.5 w-3.5" aria-hidden />
        Comments
        <span className="text-slate-400">({comments.length})</span>
      </div>

      {comments.length === 0 ? (
        <p className="text-xs text-slate-500">
          No comments yet
          {canInteract ? " — be the first to reply." : "."}
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((node) => (
            <CommentItem
              key={node.id}
              postId={postId}
              node={node}
              canInteract={canInteract}
              depth={0}
            />
          ))}
        </div>
      )}

      {canInteract ? (
        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2.5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Add a comment…"
            className="w-full resize-none rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={pending || !text.trim()}
              className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {pending ? "Sending…" : "Comment"}
            </button>
            {error && (
              <span className="text-[11px] text-rose-700" role="alert">
                {error}
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-slate-500">
          Sign in to join the conversation.
        </p>
      )}
    </div>
  );
}
