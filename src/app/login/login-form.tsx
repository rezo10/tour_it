"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Mode = "signin" | "signup";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/plan";
  const authError = searchParams.get("error");

  const [mode, setMode] = useState<Mode>("signin");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(
    authError === "auth" ? "Session could not be established. Try signing in again." : null,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      setMessage(
        "Supabase anahtarları yok. tour_it-main klasöründe .env.local oluşturup NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini yapıştır; ardından npm run dev ile yeniden başlat.",
      );
      return;
    }
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    const origin = window.location.origin;

    try {
      if (mode === "signup") {
        const nick = nickname.trim();
        if (nick.length < 2 || nick.length > 32) {
          setMessage("Nick 2–32 karakter olmalı.");
          return;
        }
        if (!/^[\p{L}\p{N}._-]+$/u.test(nick)) {
          setMessage(
            "Nick yalnızca harf (Türkçe dahil), rakam, nokta, alt çizgi ve tire içerebilir; boşluk olmaz.",
          );
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
            data: {
              display_name: nick,
            },
          },
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        if (data.session) {
          router.replace(next);
          router.refresh();
          return;
        }
        setMessage(
          "Hesabını onaylamak için e-postanı kontrol et; ardından giriş yapabilirsin.",
        );
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      router.replace(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {mode === "signin" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Use your Supabase project credentials and run{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            supabase/schema.sql
          </code>{" "}
          for planner sync.
        </p>

        <div className="mt-6 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setMessage(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === "signin"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage(null);
            }}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign up
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {message && (
            <p
              className="rounded-xl border border-coral-200 bg-coral-50 px-3 py-2 text-sm text-coral-900"
              role="alert"
            >
              {message}
            </p>
          )}
          {mode === "signup" && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Nick (sitede görünecek)
              </span>
              <input
                type="text"
                required={mode === "signup"}
                value={nickname}
                onChange={(e) =>
                  setNickname(e.target.value.replace(/\s/g, ""))
                }
                placeholder="ör. gezgin_ayse"
                minLength={2}
                maxLength={32}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
                autoComplete="username"
              />
              <p className="mt-1 text-xs text-slate-500">
                2–32 karakter; Türkçe harf, rakam, . _ - (boşluksuz)
              </p>
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">E-posta</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-coral-600 hover:to-coral-700 disabled:opacity-60"
          >
            {loading
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                type="button"
                className="font-medium text-coral-700 hover:underline"
                onClick={() => setMode("signup")}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-coral-700 hover:underline"
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>
            </>
          )}
        </p>
        <p className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
