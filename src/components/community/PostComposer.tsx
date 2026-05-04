"use client";

import { useState } from "react";
import { createPost } from "@/app/actions/community";

export function PostComposer() {
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMsg(null);
    const r = await createPost(text);
    setPending(false);
    if ("error" in r && r.error) {
      setMsg(r.error);
      return;
    }
    setText("");
    setMsg("Paylaşıldı.");
  }

  return (
    <form onSubmit={submit} className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="sr-only" htmlFor="post-content">
        Gönderi
      </label>
      <textarea
        id="post-content"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
        placeholder="Toplulukla bir şey paylaş…"
      />
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {pending ? "Gönderiliyor…" : "Paylaş"}
        </button>
        {msg && <span className="text-xs text-coral-700">{msg}</span>}
      </div>
    </form>
  );
}
