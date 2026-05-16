# Melih Yurt — Frontend (kabuk, ana sayfa, ortak UI)

Tüm sitede görünen **çerçeve**, **renk sistemi**, **ana sayfa** ve modüller arası **paylaşılan UI**.

---

## Dosyalar (alfabetik)

### Global & layout
- `src/app/layout.tsx`
- `src/app/globals.css`
- `postcss.config.mjs`
- `src/components/layout/ConfigNotice.tsx`
- `src/components/layout/MainShell.tsx`
- `src/components/layout/SiteFooter.tsx`
- `src/components/layout/SiteHeader.tsx`
- `src/components/layout/SignOutButton.tsx`

### Ana sayfa
- `src/app/page.tsx`
- `src/components/home/HeroDiscoveryRail.tsx`
- `src/lib/places/seasonalPicks.ts`

### Giriş
- `src/app/login/page.tsx`
- `src/app/login/login-form.tsx`

### Ortak bileşenler
- `src/components/CityImage.tsx`
- `src/components/common/AdminBadge.tsx`
- `src/lib/getCityImage.ts`
- `src/lib/geo/countryName.ts`

### Statik asset
- `public/` *(logo, svg)*
- `src/app/icon.png`

### Config (görünümle ilgili kısımlar)
- `next.config.ts`

---

## UI soruları — dosya eşlemesi

| Ekran parçası | Dosya |
|---------------|--------|
| Üst menü, nav linkleri | `SiteHeader.tsx` |
| Footer | `SiteFooter.tsx` |
| Arka plan / font / tema renkleri | `globals.css` + `layout.tsx` |
| Ana sayfa hero & bölümler | `page.tsx` + `HeroDiscoveryRail.tsx` |
| Giriş formu görünümü | `login-form.tsx` |
| Şehir kapak fotoğrafı (kartlarda) | `CityImage.tsx` |

---

## Başka modüllere dokunma

Plan / Explore / Community / Utility / Profile **sayfa içerikleri** kendi ownership README’lerinde — sen sadece `MainShell` ve global stilden sorumlusun; modül içi butonlar için ilgili kişiye yönlendir.
