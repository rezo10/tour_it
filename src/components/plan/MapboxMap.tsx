"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { ItineraryPlan } from "@/types/itinerary";

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

    const pts = plan.days.flatMap((d) => d.activities);
    if (pts.length === 0) return;

    mapboxgl.accessToken = token;

    const lngs = pts.map((p) => p.lng);
    const lats = pts.map((p) => p.lat);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
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

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    for (const p of pts) {
      new mapboxgl.Marker({ color: "#0d9488" })
        .setLngLat([p.lng, p.lat])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setText(p.name))
        .addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [plan, token]);

  if (!token) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-950">
        <p className="font-medium">Mapbox token yok</p>
        <p className="mt-2 text-xs text-amber-900/90">
          `.env.local` içine{" "}
          <code className="rounded bg-amber-200/60 px-1">
            NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
          </code>{" "}
          ekleyip dev sunucusunu yeniden başlat.
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
