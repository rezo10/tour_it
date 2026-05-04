export function PrototypeBanner({
  supabaseConfigured,
}: {
  supabaseConfigured: boolean;
}) {
  if (!supabaseConfigured) {
    return (
      <div className="border-b border-amber-300 bg-amber-100 px-4 py-2.5 text-center text-xs text-amber-950">
        <span className="font-semibold">Supabase bağlı değil.</span>{" "}
        <span>
          <code className="rounded bg-amber-200/80 px-1">package.json</code>{" "}
          ile aynı klasörde{" "}
          <code className="rounded bg-amber-200/80 px-1">.env.local</code>{" "}
          oluştur; içine Supabase Dashboard → Project Settings → API&apos;den{" "}
          <code className="rounded bg-amber-200/80 px-1">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          ve{" "}
          <code className="rounded bg-amber-200/80 px-1">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          yapıştır. Şablon:{" "}
          <code className="rounded bg-amber-200/80 px-1">.env.example</code>.
          Kaydettikten sonra{" "}
          <code className="rounded bg-amber-200/80 px-1">npm run dev</code>{" "}
          ile sunucuyu yeniden başlat.
        </span>
      </div>
    );
  }

  return (
    <div className="border-b border-coral-200/80 bg-gradient-to-r from-coral-50 to-cream-100 px-4 py-2 text-center text-xs text-navy-800/90">
      <span className="font-medium">Supabase bağlı</span>
      <span className="text-coral-800/80">
        {" "}
        — Giriş ve planner taslağı bu projeye yazılıyor. Veritabanı için SQL
        Editor&apos;de{" "}
        <code className="rounded bg-coral-100/80 px-1">supabase/schema.sql</code>{" "}
        dosyasını çalıştır.
      </span>
    </div>
  );
}
