"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/profile";

type Props = {
  email: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
};

export function ProfileForm({ email, displayName, bio, avatarUrl }: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setMsg(null);
    setError(null);
    const r = await updateProfile(formData);
    setPending(false);
    if ("error" in r && r.error) {
      setError(r.error);
      return;
    }
    setMsg("Profile updated.");
  }

  return (
    <form action={onSubmit} className="mt-8 space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700">Email</label>
        <p className="mt-1 text-sm text-slate-600">{email}</p>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Username (shown in the header as @username)
        </span>
        <input
          name="display_name"
          defaultValue={displayName ?? ""}
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
          placeholder="e.g. trail_traveller"
          minLength={2}
          maxLength={32}
        />
        <p className="mt-1 text-xs text-slate-500">
          2–32 characters; letters, numbers, dot (.), underscore (_) and
          hyphen (-).
        </p>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Profile photo URL
        </span>
        <input
          name="avatar_url"
          type="url"
          defaultValue={avatarUrl ?? ""}
          placeholder="https://example.com/me.jpg"
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
        />
        <p className="mt-1 text-xs text-slate-500">
          Paste a direct link to your photo. Leave blank to use the default
          avatar.
        </p>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Bio</span>
        <textarea
          name="bio"
          defaultValue={bio ?? ""}
          rows={4}
          maxLength={500}
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
          placeholder="A short introduction…"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-coral-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
      {msg && (
        <p className="text-sm font-medium text-emerald-700" role="status">
          {msg}
        </p>
      )}
      {error && (
        <p className="text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
