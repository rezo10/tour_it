# Tour It — Ekip Dosya Sorumlulukları

> **Önemli:** Kaynak kodun fiziksel yeri değişmedi (`src/` yapısı aynı). Bu klasör, sunum ve code review günü **kim hangi dosyadan sorumlu** hızlıca bulabilsin diye hazırlandı. Uygulama davranışı değişmez.

## Hızlı yönlendirme

| Kişi | Modül | Detaylı liste |
|------|--------|----------------|
| **Ege Özbil** | Profile + Supabase | [ownership/ege-ozbil-profile-supabase/README.md](ownership/ege-ozbil-profile-supabase/README.md) |
| **Mustafa Hakan Durgut** | Planner | [ownership/mustafa-durgut-planner/README.md](ownership/mustafa-durgut-planner/README.md) |
| **Umut Alp Dargün** | Utility | [ownership/umut-dargun-utility/README.md](ownership/umut-dargun-utility/README.md) |
| **Gökce Yıldırım** | Community | [ownership/gokce-yildirim-community/README.md](ownership/gokce-yildirim-community/README.md) |
| **Yiğit Kızıldaş** | Explore | [ownership/yigit-kizildas-explore/README.md](ownership/yigit-kizildas-explore/README.md) |
| **Melih Yurt** | Frontend (kabuk & ortak UI) | [ownership/melih-yurt-frontend/README.md](ownership/melih-yurt-frontend/README.md) |

Derin inceleme (ne silersek ne gider, nasıl ekleriz): [CODE_REVIEW.md](CODE_REVIEW.md)

---

## Proje ağacı (sorumluluk renkleri)

```
tour_it-main/
├── supabase/                          → Ege
├── public/                            → Melih
├── docs/
│   ├── TEAM_OWNERSHIP.md              → bu dosya
│   ├── CODE_REVIEW.md
│   └── ownership/                     → kişi başına README
│
└── src/
    ├── middleware.ts                  → Ege
    ├── app/
    │   ├── layout.tsx                 → Melih
    │   ├── globals.css                → Melih
    │   ├── page.tsx                   → Melih (ana sayfa)
    │   ├── plan/                      → Mustafa
    │   ├── explore/                   → Yiğit
    │   ├── community/                 → Gökce
    │   ├── utility/                   → Umut
    │   ├── profile/                   → Ege
    │   ├── login/                     → Melih
    │   ├── auth/callback/             → Ege
    │   ├── actions/
    │   │   ├── plan.ts                → Mustafa
    │   │   ├── profile.ts             → Ege
    │   │   └── community.ts           → Gökce
    │   └── api/
    │       ├── itinerary/             → Mustafa
    │       └── utility/               → Umut
    │
    ├── components/
    │   ├── layout/                    → Melih
    │   ├── home/                      → Melih
    │   ├── plan/                      → Mustafa
    │   ├── explore/                   → Yiğit
    │   ├── community/                 → Gökce
    │   ├── utility/                   → Umut
    │   ├── profile/                   → Ege
    │   ├── common/                    → Melih
    │   └── CityImage.tsx              → Melih
    │
    ├── lib/
    │   ├── supabase/                  → Ege
    │   ├── auth/                      → Ege
    │   ├── itinerary/                 → Mustafa
    │   ├── plans/                     → Yiğit
    │   ├── community/                 → Gökce
    │   ├── utility/                   → Umut
    │   ├── places/                    → Melih
    │   ├── geo/                       → Melih
    │   ├── getCityImage.ts            → Melih
    │   └── mock-data.ts               → Yiğit
    │
    ├── data/
    │   └── popularCities.ts           → Mustafa (birincil) · Umut (okur)
    │
    └── types/
        ├── itinerary.ts               → Mustafa
        └── planner.ts                 → Mustafa
```

---

## Ortak / paylaşılan dosyalar

| Dosya | Birincil sorumlu | Diğerleri |
|-------|------------------|-----------|
| `src/data/popularCities.ts` | Mustafa (Planner formu) | Umut (Utility şehir seçici) |
| `src/components/CityImage.tsx` | Melih | Mustafa, Yiğit, Umut, Melih (kartlarda kullanır) |
| `src/app/page.tsx` (Recent public plans bölümü) | Melih (layout) | Yiğit (`fetchPublicPlanCards` verisi) |
| `src/components/profile/UserPlansList.tsx` | Ege (liste UI) | Mustafa (`/plan?id=` hedefi) |

Bu dosyalarda değişiklik yapmadan önce ilgili iki kişiyi bilgilendirin.

---

## Sunum günü: “Şu buton / renk nerede?”

| Soru | İlk bakılacak dosya |
|------|---------------------|
| Header, menü, logo | `src/components/layout/SiteHeader.tsx` |
| Site renkleri (coral, cream, navy) | `src/app/globals.css` |
| Generate itinerary butonu | `src/components/plan/PlanWorkspace.tsx` |
| Explore filtre chip’leri | `src/app/explore/page.tsx` |
| Community post paylaş | `src/components/community/PostComposer.tsx` |
| Profil düzenle | `src/components/profile/ProfileForm.tsx` |
| Hava / kur widget | `src/components/utility/UtilityWorkspace.tsx` |

Tam UI rehberi: Melih’in ownership README’si.
