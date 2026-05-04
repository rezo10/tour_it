import Link from "next/link";
import { UserCircle } from "lucide-react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Profil</h1>
          <p className="mt-2 text-sm text-slate-600">
            Profili düzenlemek için giriş yap.
          </p>
          <Link
            href="/login?next=/profile"
            className="mt-6 inline-block text-sm font-semibold text-coral-700 hover:text-coral-900"
          >
            Giriş yap →
          </Link>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-coral-100 to-cream-100 text-coral-700">
            <UserCircle className="h-14 w-14" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Profil</h1>
            <p className="mt-1 text-sm text-slate-600">
              Görünen ad ve bio Supabase&apos;teki{" "}
              <code className="rounded bg-slate-100 px-1 text-xs">profiles</code>{" "}
              tablosunda tutulur.
            </p>
          </div>
        </div>
        <ProfileForm
          email={user.email ?? ""}
          displayName={profile?.display_name ?? null}
          bio={profile?.bio ?? null}
        />
      </div>
    </div>
  );
}
