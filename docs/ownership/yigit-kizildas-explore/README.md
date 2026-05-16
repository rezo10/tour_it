# Yiğit Kızıldaş — Explore Module

**Route:** `/explore`  
**Ana sayfa:** “Recent public plans” veri kaynağı

---

## Dosyalar (alfabetik)

### Routes
- `src/app/explore/page.tsx`

### Components
- `src/components/explore/PlanCard.tsx`

### Lib
- `src/lib/plans/publicPlans.ts`
- `src/lib/mock-data.ts` *(yalnızca `ExplorePlanCard` tipi)*

---

## Kısmi paylaşım

- `src/app/page.tsx` → **Melih** (sayfa düzeni) · senin `fetchPublicPlanCards({ limit: 3 })` çağrın bu dosyada
- Plan detay linki `/plan?id=` → **Mustafa** (Planner)
