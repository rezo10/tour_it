"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/app/actions/community";
import { Image as ImageIcon, PenLine } from "lucide-react";

const CATEGORIES = [
  "General",
  "Adventure",
  "Cultural",
  "Relaxing",
  "Food",
  "Tips",
];

export function PostComposer() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setSuccess(null);
    setPending(true);
    try {
      const r = await createPost({
        title,
        content,
        category,
        imageUrl: imageUrl.trim() || undefined,
      });
      if ("error" in r && r.error) {
        setError(r.error);
        return;
      }
      setTitle("");
      setContent("");
      setImageUrl("");
      setShowImage(false);
      setSuccess("Post shared with the community.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 text-coral-700">
        <PenLine className="h-4 w-4" aria-hidden />
        <h2 className="text-sm font-semibold uppercase tracking-wide">
          Share with the community
        </h2>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Title</span>
        <input
          type="text"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A short headline — e.g. 'Three days in Lisbon's Alfama'"
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Your post</span>
        <textarea
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={5000}
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
          placeholder="Tell the community what made this trip memorable…"
        />
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setShowImage((s) => !s)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-coral-300 hover:text-coral-700"
        >
          <ImageIcon className="h-3.5 w-3.5" aria-hidden />
          {showImage ? "Remove image" : "Add image URL"}
        </button>
      </div>

      {showImage && (
        <label className="mt-3 block">
          <span className="text-xs font-medium text-slate-600">
            Image URL (https://…)
          </span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
          />
        </label>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <button
          type="submit"
          disabled={pending || !content.trim()}
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? "Sharing…" : "Share post"}
        </button>
        {error && (
          <span className="text-xs font-medium text-rose-700" role="alert">
            {error}
          </span>
        )}
        {success && (
          <span className="text-xs font-medium text-emerald-700" role="status">
            {success}
          </span>
        )}
      </div>
    </form>
  );
}
