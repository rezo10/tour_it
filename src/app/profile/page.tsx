import Link from "next/link";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Avatar } from "@/components/profile/Avatar";
import {
  UserPlansList,
  type UserPlanRow,
} from "@/components/profile/UserPlansList";
import {
  UserPostsList,
  type UserPostRow,
} from "@/components/profile/UserPostsList";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="mt-2 text-sm text-slate-600">
            Profiles are temporarily unavailable.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to view and edit your profile.
          </p>
          <Link
            href="/login?next=/profile"
            className="mt-6 inline-block rounded-full bg-coral-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-700"
          >
            Sign in →
          </Link>
        </div>
      </div>
    );
  }

  const [{ data: profile }, { data: rawPlans }, { data: rawPosts }, followers, following] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, bio, avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("plans")
        .select("id, title, country, city, trip_type, is_public, preferences, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(10),
      supabase
        .from("posts")
        .select("id, title, content, category, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("follows")
        .select("follower_id", { count: "exact", head: true })
        .eq("following_id", user.id),
      supabase
        .from("follows")
        .select("following_id", { count: "exact", head: true })
        .eq("follower_id", user.id),
    ]);

  const followerCount = followers.count ?? 0;
  const followingCount = following.count ?? 0;

  const plans: UserPlanRow[] = (rawPlans ?? []).map((p) => {
    const prefs = (p.preferences ?? {}) as { day_count?: number };
    return {
      id: String(p.id),
      title: p.title,
      country: p.country,
      city: p.city,
      tripType: p.trip_type,
      isPublic: !!p.is_public,
      days: typeof prefs.day_count === "number" ? prefs.day_count : 3,
      updatedAt: p.updated_at,
    };
  });

  const posts: UserPostRow[] = (rawPosts ?? []).map((p) => ({
    id: String(p.id),
    title: p.title,
    content: p.content,
    category: p.category,
    createdAt: p.created_at,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar url={profile?.avatar_url ?? null} size="lg" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {profile?.display_name ?? user.email}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{user.email}</p>
            {profile?.bio && (
              <p className="mt-2 max-w-xl text-sm text-slate-700">
                {profile.bio}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 sm:justify-start">
              <span>
                <span className="text-base font-semibold text-slate-900">
                  {followerCount}
                </span>{" "}
                followers
              </span>
              <span>
                <span className="text-base font-semibold text-slate-900">
                  {followingCount}
                </span>{" "}
                following
              </span>
              <span>
                <span className="text-base font-semibold text-slate-900">
                  {plans.length}
                </span>{" "}
                plans
              </span>
              <span>
                <span className="text-base font-semibold text-slate-900">
                  {posts.length}
                </span>{" "}
                posts
              </span>
            </div>
          </div>
        </div>
        <ProfileForm
          email={user.email ?? ""}
          displayName={profile?.display_name ?? null}
          bio={profile?.bio ?? null}
          avatarUrl={profile?.avatar_url ?? null}
        />
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            My plans
          </h2>
          <UserPlansList
            plans={plans}
            emptyLabel="You haven’t saved any plans yet. Open the planner to create one."
          />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            My posts
          </h2>
          <UserPostsList
            posts={posts}
            emptyLabel="You haven’t shared any community posts yet."
          />
        </section>
      </div>
    </div>
  );
}
