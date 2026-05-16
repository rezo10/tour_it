/**
 * Mapbox GL map for the planner. Drops a numbered marker for every
 * activity in the generated itinerary and auto-fits the view to the
 * bounding box of those markers. Runs in the browser only — the parent
 * loads this component dynamically with `ssr: false`.
 */
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ItineraryPlan } from "@/types/itinerary";

// Accept either of two env var spellings to keep deployments tolerant.
function getToken(): string {
  return (
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_API_TOKEN?.trim() ||
    ""
  );
}

type Props = {
  plan: ItineraryPlan;
};

export function MapboxMap({ plan }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const token = getToken();

  useEffect(() => {
    if (!containerRef.current || !token) return;

    // Flatten "day → activities" into a single list of points to plot.
    const pts = plan.days.flatMap((d) => d.activities);
    if (pts.length === 0) return;

    mapboxgl.accessToken = token;

    // Compute the bounding box that contains every marker.
    const lngs = pts.map((p) => p.lng);
    const lats = pts.map((p) => p.lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    // Special-case a single coincident point so fitBounds doesn't NaN out.
    const singlePoint = minLng === maxLng && minLat === maxLat;

    const map = singlePoint
      ? new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [minLng, minLat],
          zoom: 12,
        })
      : new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/streets-v12",
          bounds: [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          fitBoundsOptions: { padding: 48, maxZoom: 14 },
        });

    mapRef.current = map;

    // Zoom + pan controls in the corner.
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Drop a teal marker for every activity, with a popup carrying its name.
    for (const p of pts) {
      new mapboxgl.Marker({ color: "#0d9488" })
        .setLngLat([p.lng, p.lat])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setText(p.name))
        .addTo(map);
    }

    // Tear down on unmount or whenever the plan changes — Mapbox doesn't
    // free its WebGL context automatically.
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [plan, token]);

  if (!token) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-950">
        <p className="font-medium">Mapbox token missing</p>
        <p className="mt-2 text-xs text-amber-900/90">
          Add{" "}
          <code className="rounded bg-amber-200/60 px-1">
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </code>{" "}
          to <code className="rounded bg-amber-200/60 px-1">.env.local</code>{" "}
          and restart the dev server.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
      <div className="relative z-10 flex items-center justify-between border-b border-white/40 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <p className="text-sm font-medium text-slate-800">{plan.city}</p>
        <span className="rounded-full bg-coral-600/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          Mapbox
        </span>
      </div>
      <div ref={containerRef} className="min-h-[280px] flex-1 w-full" />
    </div>
  );
}
