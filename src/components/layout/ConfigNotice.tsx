/**
 * Renders a small notice only when Supabase isn't configured (i.e. when
 * NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are missing).
 * In production the file should never render anything visible, because the
 * environment is always configured.
 */
export function ConfigNotice({
  supabaseConfigured,
}: {
  supabaseConfigured: boolean;
}) {
  if (supabaseConfigured) return null;

  return (
    <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
      <span className="font-semibold">Configuration required.</span>{" "}
      <span>
        Add{" "}
        <code className="rounded bg-amber-100 px-1">
          NEXT_PUBLIC_SUPABASE_URL
        </code>{" "}
        and{" "}
        <code className="rounded bg-amber-100 px-1">
          NEXT_PUBLIC_SUPABASE_ANON_KEY
        </code>{" "}
        to <code className="rounded bg-amber-100 px-1">.env.local</code> and
        restart the dev server.
      </span>
    </div>
  );
}
