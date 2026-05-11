"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { toggleFollow } from "@/app/actions/community";
import { UserMinus, UserPlus } from "lucide-react";

type Props = {
  targetUserId: string;
  initiallyFollowing: boolean;
};

export function FollowButton({ targetUserId, initiallyFollowing }: Props) {
  const router = useRouter();
  const [following, setFollowing] = useState(initiallyFollowing);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onClick() {
    setError(null);
    start(async () => {
      const r = await toggleFollow(targetUserId);
      if ("error" in r && r.error) {
        setError(r.error);
        return;
      }
      setFollowing((f) => !f);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
          following
            ? "border border-slate-300 bg-white text-slate-800 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
            : "bg-coral-600 text-white shadow-sm hover:bg-coral-700"
        }`}
      >
        {following ? (
          <>
            <UserMinus className="h-4 w-4" aria-hidden />
            Following
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" aria-hidden />
            Follow
          </>
        )}
      </button>
      {error && (
        <span className="text-[11px] font-medium text-rose-700" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
