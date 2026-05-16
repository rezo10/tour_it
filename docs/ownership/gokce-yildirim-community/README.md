# Gökce Yıldırım — Community Module

**Route:** `/community`

---

## Dosyalar (alfabetik)

### Routes
- `src/app/community/page.tsx`

### Server actions
- `src/app/actions/community.ts`

### Components
- `src/components/community/CommentThread.tsx`
- `src/components/community/PostCardInteractive.tsx`
- `src/components/community/PostComposer.tsx`

### Lib
- `src/lib/community/feed.ts`

---

## Veritabanı (inceleme)

Community tabloları `posts`, `comments`, `post_likes` → şema dosyalarında **Ege** (Supabase) ile birlikte review edilir:
- `supabase/schema.sql` (ilgili bölüm)
- `supabase/migrations/004_community_and_avatars.sql`
