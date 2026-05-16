# Ege Özbil — Profile Module & Supabase

**Route:** `/profile` · `/profile/[id]` · `/login` (auth akışı)  
**Veritabanı:** `supabase/`

---

## Dosyalar (alfabetik)

### Routes
- `src/app/profile/page.tsx`
- `src/app/profile/[id]/page.tsx`
- `src/app/auth/callback/route.ts`

### Server actions
- `src/app/actions/profile.ts`

### Components
- `src/components/profile/Avatar.tsx`
- `src/components/profile/FollowButton.tsx`
- `src/components/profile/ProfileForm.tsx`
- `src/components/profile/UserPlansList.tsx`
- `src/components/profile/UserPostsList.tsx`

### Supabase & auth
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/env.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/auth/role.ts`
- `src/middleware.ts`

### Database
- `supabase/schema.sql`
- `supabase/migrations/002_erd_schema.sql`
- `supabase/migrations/003_nickname_metadata.sql`
- `supabase/migrations/004_community_and_avatars.sql`
- `supabase/migrations/005_admin_role.sql`

---

## İlgili ama başka modülde kalan

- `src/app/login/page.tsx` → **Melih** (UI kabuğu)
- `src/app/login/login-form.tsx` → **Melih**
- Plan listesinde link `/plan?id=` → hedef **Mustafa** (Planner)
