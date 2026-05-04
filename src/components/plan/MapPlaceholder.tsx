import type { ItineraryPlan } from "@/types/itinerary";
import { MapPin } from "lucide-react";

type Props = {
  plan: ItineraryPlan;
};

export function MapPlaceholder({ plan }: Props) {
  const pins = plan.days.flatMap((d) => d.activities);

  return (
    <div className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage: `
            linear-gradient(180deg, rgba(14,165,233,0.12) 0%, rgba(20,184,166,0.08) 100%),
            repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(148,163,184,0.15) 31px, rgba(148,163,184,0.15) 32px),
            repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(148,163,184,0.12) 31px, rgba(148,163,184,0.12) 32px)
          `,
        }}
      />
      <div className="relative z-10 flex items-center justify-between border-b border-white/40 bg-white/70 px-4 py-3 backdrop-blur-sm">
        <p className="text-sm font-medium text-slate-800">
          Map view — {plan.city}
        </p>
        <span className="rounded-full bg-coral-600/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Mapbox-ready
        </span>
      </div>
      <div className="relative z-10 flex flex-1 flex-col p-4">
        <div className="relative flex-1 rounded-xl border border-dashed border-coral-300/60 bg-gradient-to-br from-white/80 to-coral-50/40 p-4">
          <p className="text-xs text-slate-600">
            In production, Mapbox GL JS will plot itinerary stops. Pins below
            mirror the structured JSON from the planner.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {pins.slice(0, 6).map((p) => (
              <div
                key={p.name + p.order}
                className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-sm ring-1 ring-slate-200/80"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-coral-600" />
                <span className="truncate font-medium">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
