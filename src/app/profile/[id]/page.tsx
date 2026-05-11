import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/profile/Avatar";
import { FollowButton } from "@/components/profile/FollowButton";
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

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, bio, avatar_url")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const isOwn = user?.id === profile.id;

  const [
    { data: rawPlans },
    { data: rawPosts },
    followers,
    following,
    myFollow,
  ] = await Promise.all([
    supabase
      .from("plans")
      .select("id, title, country, city, trip_type, is_public, preferences, updated_at")
      .eq("user_id", profile.id)
      .eq("is_public", true)
      .order("updated_at", { ascending: false })
      .limit(10),
    supabase
      .from("posts")
      .select("id, title, content, category, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    user
      ? supabase
          .from("follows")
          .select("follower_id")
          .eq("follower_id", user.id)
          .eq("following_id", profile.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const followerCount = followers.count ?? 0;
  const followingCount = following.count ?? 0;
  const initiallyFollowing = !!myFollow.data;

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

  const displayName =
    profile.display_name?.trim() || `traveller_${profile.id.slice(0, 6)}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar url={profile.avatar_url ?? null} size="lg" alt={displayName} />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              @{displayName}
            </h1>
            {profile.bio && (
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
                public plans
              </span>
            </div>
          </div>
          {isOwn ? (
            <Link
              href="/profile"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-coral-300 hover:text-coral-700"
            >
              Edit profile
            </Link>
          ) : user ? (
            <FollowButton
              targetUserId={profile.id}
              initiallyFollowing={initiallyFollowing}
            />
          ) : (
            <Link
              href={`/login?next=/profile/${profile.id}`}
              className="inline-flex items-center rounded-full bg-coral-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-700"
            >
              Sign in to follow
            </Link>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Public plans
          </h2>
          <UserPlansList
            plans={plans}
            emptyLabel={`@${displayName} hasn’t shared any public plans yet.`}
          />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Recent posts
          </h2>
          <UserPostsList
            posts={posts}
            emptyLabel={`@${displayName} hasn’t posted yet.`}
          />
        </section>
      </div>
    </div>
  );
}
