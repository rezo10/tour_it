"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/profile";

type Props = {
  email: string;
  displayName: string | null;
  bio: string | null;
};

export function ProfileForm({ email, displayName, bio }: Props) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setMsg(null);
    const r = await updateProfile(formData);
    setPending(false);
    if ("error" in r && r.error) {
      setMsg(r.error);
      return;
    }
    setMsg("Profil güncellendi.");
  }

  return (
    <form action={onSubmit} className="mt-8 space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700">E-posta</label>
        <p className="mt-1 text-sm text-slate-600">{email}</p>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Nick (üst menüde @ ile görünür)
        </span>
        <input
          name="display_name"
          defaultValue={displayName ?? ""}
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
          placeholder="ör. gezgin_ayşe"
          minLength={2}
          maxLength={32}
        />
        <p className="mt-1 text-xs text-slate-500">
          2–32 karakter; Türkçe harf ve rakam kullanabilirsin (boşluk yok).
        </p>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-slate-700">Bio</span>
        <textarea
          name="bio"
          defaultValue={bio ?? ""}
          rows={4}
          className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
          placeholder="Kısa bir tanıtım…"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-coral-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-coral-700 disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </button>
      {msg && (
        <p className="text-sm text-coral-800" role="status">
          {msg}
        </p>
      )}
    </form>
  );
}
