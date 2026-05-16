# Mustafa Hakan Durgut — Planner Module

**Route:** `/plan` · `/plan?id=<uuid>`  
**API:** `POST /api/itinerary`

---

## Dosyalar (alfabetik)

### Routes
- `src/app/plan/page.tsx`

### API
- `src/app/api/itinerary/route.ts`

### Server actions
- `src/app/actions/plan.ts`

### Components
- `src/components/plan/ItineraryPanel.tsx`
- `src/components/plan/MapboxMap.tsx`
- `src/components/plan/PlanWorkspace.tsx`

### Lib & types
- `src/lib/itinerary/apiErrors.ts`
- `src/lib/itinerary/preferences.ts`
- `src/lib/itinerary/schema.ts`
- `src/lib/itinerary/sliderSteps.ts`
- `src/types/itinerary.ts`
- `src/types/planner.ts`

### Data
- `src/data/popularCities.ts` *(Utility ile paylaşımlı — birincil sahip: Planner)*

---

## İlgili ama başka modülde kalan

- `src/components/profile/UserPlansList.tsx` → **Ege** (profilde listeler, senin `/plan` sayfasına link verir)
- `src/components/CityImage.tsx` → **Melih** (plan hero görseli)
