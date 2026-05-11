import { Tag } from "lucide-react";

export type UserPostRow = {
  id: string;
  title: string | null;
  content: string;
  category: string | null;
  createdAt: string;
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

export function UserPostsList({
  posts,
  emptyLabel,
}: {
  posts: UserPostRow[];
  emptyLabel: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-600">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((p) => (
        <li
          key={p.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            {p.title && (
              <p className="text-sm font-semibold text-slate-900">{p.title}</p>
            )}
            {p.category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-coral-50 px-2 py-0.5 text-[10px] font-medium text-coral-800">
                <Tag className="h-3 w-3" aria-hidden />
                {p.category}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-slate-700">
            {p.content}
          </p>
          <p className="mt-2 text-[11px] text-slate-400">
            {formatTime(p.createdAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
