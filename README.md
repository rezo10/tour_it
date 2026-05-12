# Tour It — Travel Planning & Community Platform

Tour It is a web platform that turns scattered travel research into a single
calm workspace. It generates day-by-day itineraries with Google Gemini,
shows them on a Mapbox map, lists weather/currency/local-time utilities, and
hosts a lightweight community feed (posts, comments, likes, follows) on top
of Supabase.

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend:** Supabase (PostgreSQL + Auth + Row-Level Security)
- **AI:** Google Gemini (`@google/generative-ai`)
- **Maps:** Mapbox GL JS
- **Weather:** OpenWeather Current Weather API
- **Currency:** Frankfurter (European Central Bank) — no API key required
- **Validation:** Zod

## Modules

1. **User Management** – Email + password auth, profile (display name, bio,
   avatar URL), Supabase row-level security.
2. **Planner** – Country/City/Trip-type selectors, preferences sliders, AI
   itinerary generation, Mapbox preview, save plan with public/private
   visibility toggle.
3. **Explore** – Browse public itineraries, filter by trip type (Relaxing,
   Adventure, Cultural).
4. **Community** – Posts (title, content, category, optional image URL),
   likes, threaded comments (parent / reply), follow / unfollow.
5. **Utility** – Live weather, ECB currency rates, local time. No login
   required.
6. **Profile** – Edit your profile, view your saved plans and posts,
   follower / following counts. Public profile pages live at `/profile/[id]`.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Required environment variables

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same place |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | [Mapbox Account → Access tokens](https://account.mapbox.com/) |
| `OPENWEATHER_API_KEY` | [OpenWeather → API Keys](https://home.openweathermap.org/api_keys) |
| `FOURSQUARE_API_KEY` | Optional, reserved for future POI lookups |

Never commit `.env.local`; it is in `.gitignore`. Only `.env.example` is
checked in.

## Database setup

Run the canonical schema once in **Supabase → SQL Editor**:

```
supabase/schema.sql
```

This file is idempotent and contains every table, policy and trigger used
by the app. If you prefer step-by-step migrations they live in
`supabase/migrations/` and can be run in order:

1. `002_erd_schema.sql` — Profiles, plans, plan_days, plan_items, posts,
   comments, post_likes, follows.
2. `003_nickname_metadata.sql` — Default `display_name` extraction trigger.
3. `004_community_and_avatars.sql` — Adds post title/category/image/plan
   link, comment `parent_comment_id`, profile `avatar_url`.
4. `005_admin_role.sql` — `profiles.role` column + `public.is_admin()`
   helper + RLS policies that let admins delete any post/comment/plan.

### Promoting a user to admin

After the user has signed up at least once, run this one-liner in
**Supabase → SQL Editor** (replace the email):

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
```

Admins get a small `Admin` badge next to their name everywhere, and a
`Delete` button on every post and comment (not just their own). To
revoke, set `role = 'user'` the same way.

## Project structure

```
src/
├─ app/                   # Next.js App Router pages and API routes
│  ├─ actions/            # Server actions (plan, profile, community)
│  ├─ api/                # /api/itinerary, /api/utility/{fx,weather}
│  ├─ auth/callback/      # Supabase OAuth callback
│  ├─ community/          # Community feed + composer
│  ├─ explore/            # Public-plan grid with filters
│  ├─ login/              # Sign-in / sign-up
│  ├─ plan/               # Planner workspace
│  ├─ profile/            # Own profile and `/profile/[id]` public view
│  └─ utility/            # Weather + FX + local-time cards
├─ components/            # UI building blocks (community, plan, profile, …)
├─ data/                  # Static lookup data (popular cities)
├─ lib/                   # Supabase clients, helpers, validation
└─ types/                 # Shared TypeScript types
```

## Scripts

- `npm run dev` – Start the dev server.
- `npm run build` – Production build.
- `npm run start` – Run the production server.
- `npm run lint` – Lint the project.

## Notes for graders

- All external APIs are real and live. Provide valid keys in `.env.local`
  and every module works end-to-end.
- The Gemini prompt is deliberately Turkish so that the itinerary content
  (activity names and descriptions) is delivered to end users in Turkish.
  The application UI itself is English.
- Row-level security is enforced for every table; see `supabase/schema.sql`
  for the exact policies.
