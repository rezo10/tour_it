/**
 * Compact list of saved plans shown on a user's profile. Pure render
 * component — the parent page does the Supabase read and maps rows
 * into the `UserPlanRow` shape this component expects.
 */
import Link from "next/link";
import { Calendar, Globe2, Lock } from "lucide-react";

export type UserPlanRow = {
  id: string;
  title: string;
  country: string;
  city: string;
  tripType: string;
  isPublic: boolean;
  days: number;
  updatedAt: string;
};

export function UserPlansList({
  plans,
  emptyLabel,
}: {
  plans: UserPlanRow[];
  emptyLabel: string;
}) {
  if (plans.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-600">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {plans.map((p) => (
        <li key={p.id}>
          <Link
            href={`/plan?id=${p.id}`}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-coral-300 hover:shadow-md"
          >
            <div>
              <p className="text-sm font-semibold text-slate-900">{p.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                {p.city}, {p.country} · {p.tripType}
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <Calendar className="h-3 w-3" aria-hidden />
                {p.days} {p.days === 1 ? "day" : "days"}
                <span className="text-slate-300">·</span>
                {p.isPublic ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <Globe2 className="h-3 w-3" aria-hidden /> Public
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <Lock className="h-3 w-3" aria-hidden /> Private
                  </span>
                )}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
