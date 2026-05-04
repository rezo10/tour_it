"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { ItineraryPanel } from "@/components/plan/ItineraryPanel";
import {
  savePlanToDatabase,
  type PlanPreferences,
} from "@/app/actions/plan";
import {
  friendlyNetworkError,
  friendlyPlanGenerateError,
} from "@/lib/itinerary/apiErrors";
import type { ItineraryPlan } from "@/types/itinerary";
import { PlaceCoverImage } from "@/components/places/PlaceCoverImage";
import { Loader2, Save, Sparkles } from "lucide-react";

const MapboxMap = dynamic(
  () =>
    import("@/components/plan/MapboxMap").then((m) => ({
      default: m.MapboxMap,
    })),
  { ssr: false, loading: () => <MapLoading /> },
);

function MapLoading() {
  return (
    <div className="flex h-[min(70vh,720px)] min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
      <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
    </div>
  );
}

const countries = ["Portugal", "Japan", "Italy", "Peru", "Denmark"];
const cities: Record<string, string[]> = {
  Portugal: ["Lisbon", "Porto"],
  Japan: ["Kyoto", "Tokyo"],
  Italy: ["Florence", "Rome"],
  Peru: ["Cusco", "Lima"],
  Denmark: ["Copenhagen", "Aarhus"],
};
const tripTypes = ["Cultural", "Relaxing", "Adventure", "Nature", "Urban"];

export function PlanPrototypeClient() {
  const [country, setCountry] = useState(countries[0]);
  const [city, setCity] = useState(cities[countries[0]][0]);
  const [tripType, setTripType] = useState(tripTypes[0]);
  const [days, setDays] = useState(3);
  const [walking, setWalking] = useState(50);
  const [nightlife, setNightlife] = useState(30);
  const [audience, setAudience] = useState<"any" | "family" | "solo">("any");
  const [environment, setEnvironment] = useState<"mixed" | "indoor" | "outdoor">(
    "mixed",
  );
  const [showResult, setShowResult] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [savePublic, setSavePublic] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCountry = (c: string) => {
    setCountry(c);
    setCity(cities[c][0]);
  };

  async function handleGenerate() {
    setAiError(null);
    setSaveMsg(null);
    setAiLoading(true);
    try {
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          city,
          tripType,
          days,
          walking,
          nightlife,
          audience,
          environment,
        }),
      });

      const data = (await res.json()) as {
        plan?: ItineraryPlan;
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        setAiError(
          friendlyPlanGenerateError(res.status, {
            error: data.error,
            code: data.code,
          }),
        );
        setShowResult(false);
        setItinerary(null);
        return;
      }

      if (!data.plan) {
        setAiError("Plan gelmedi. Tekrar üretmeyi dene.");
        return;
      }

      setItinerary(data.plan);
      setShowResult(true);
    } catch {
      setAiError(friendlyNetworkError());
      setShowResult(false);
      setItinerary(null);
    } finally {
      setAiLoading(false);
    }
  }

  const prefs: PlanPreferences = {
    walking,
    nightlife,
    audience,
    environment,
  };

  async function handleSave() {
    if (!itinerary) {
      setSaveMsg("Önce Tour It ile plan üret.");
      return;
    }
    setSaveMsg(null);
    setSaving(true);
    try {
      const r = await savePlanToDatabase(itinerary, prefs, savePublic);
      if ("error" in r && r.error) {
        setSaveMsg(r.error);
        return;
      }
      if ("success" in r && r.success) {
        setSavePublic(false);
        setSaveMsg(
          savePublic
            ? "Plan kaydedildi ve Explore’da herkese açık."
            : "Plan hesabına kaydedildi (yalnızca sen).",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Plan your trip
        </h1>
        <p className="mt-2 text-slate-600">
          Tour It ile günlük plan üret, Mapbox&apos;ta durakları gör; kaydı
          Supabase&apos;e yaz.
        </p>
        {aiError && (
          <p
            className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
            role="alert"
          >
            {aiError}
          </p>
        )}
      </header>

      <div className="relative mb-8 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <PlaceCoverImage
          city={city}
          country={country}
          height={200}
          width={1600}
          priority
          variant="hero"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
              {country}
            </p>
            <p className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              {city}
            </p>
            <p className="mt-1 text-sm text-white/90">
              {tripType} · {days} gün
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Trip basics
            </h2>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Country
                </span>
                <select
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
                  value={country}
                  onChange={(e) => handleCountry(e.target.value)}
                  disabled={aiLoading}
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">City</span>
                <select
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={aiLoading}
                >
                  {cities[country].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Trip type
                </span>
                <select
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
                  value={tripType}
                  onChange={(e) => setTripType(e.target.value)}
                  disabled={aiLoading}
                >
                  {tripTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  Number of days
                </span>
                <input
                  type="number"
                  min={1}
                  max={14}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  disabled={aiLoading}
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Preferences
            </h2>
            <div className="mt-4 space-y-5">
              <div>
                <div className="flex justify-between text-sm text-slate-700">
                  <span>Walking intensity</span>
                  <span className="text-slate-500">{walking}%</span>
                </div>
                <input
                  type="range"
                  className="mt-2 w-full accent-coral-600"
                  value={walking}
                  onChange={(e) => setWalking(Number(e.target.value))}
                  disabled={aiLoading}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm text-slate-700">
                  <span>Nightlife interest</span>
                  <span className="text-slate-500">{nightlife}%</span>
                </div>
                <input
                  type="range"
                  className="mt-2 w-full accent-coral-600"
                  value={nightlife}
                  onChange={(e) => setNightlife(Number(e.target.value))}
                  disabled={aiLoading}
                />
              </div>
              <fieldset>
                <legend className="text-sm font-medium text-slate-700">
                  Travel style
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["any", "Balanced"],
                      ["family", "Family-friendly"],
                      ["solo", "Solo-friendly"],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAudience(v)}
                      disabled={aiLoading}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        audience === v
                          ? "bg-coral-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      } ${aiLoading ? "pointer-events-none opacity-50" : ""}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-medium text-slate-700">
                  Indoor / outdoor
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(
                    [
                      ["mixed", "Mixed"],
                      ["indoor", "More indoor"],
                      ["outdoor", "More outdoor"],
                    ] as const
                  ).map(([v, label]) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setEnvironment(v)}
                      disabled={aiLoading}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        environment === v
                          ? "bg-accent-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      } ${aiLoading ? "pointer-events-none opacity-50" : ""}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={aiLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:from-coral-600 hover:to-coral-700 disabled:opacity-60"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden />
              )}
              {aiLoading ? "Tour It oluşturuyor…" : "Tour It ile üret"}
            </button>

            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={savePublic}
                onChange={(e) => setSavePublic(e.target.checked)}
                className="rounded border-slate-300 accent-coral-600"
              />
              Kaydederken Explore&apos;da herkese aç
            </label>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !itinerary}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              {saving ? "Kaydediliyor…" : "Planı veritabanına kaydet"}
            </button>
            {saveMsg && (
              <p className="text-center text-xs text-slate-600" role="status">
                {saveMsg}
              </p>
            )}
          </div>
        </aside>

        <section className="min-h-[560px]">
          {!showResult || !itinerary ? (
            <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
              <p className="max-w-sm text-sm text-slate-600">
                Formu doldurup{" "}
                <span className="font-semibold text-slate-800">
                  Tour It ile üret
                </span>{" "}
                de — günlük program ve harita burada açılır.
              </p>
            </div>
          ) : (
            <div className="grid h-[min(70vh,720px)] gap-4 lg:grid-cols-2 lg:grid-rows-1">
              <div className="min-h-0 lg:min-h-full">
                <ItineraryPanel plan={itinerary} />
              </div>
              <div className="min-h-0 lg:min-h-full">
                <MapboxMap plan={itinerary} />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
