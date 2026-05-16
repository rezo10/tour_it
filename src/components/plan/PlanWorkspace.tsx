/**
 * The full planner workspace mounted at /plan. Houses the form
 * (country / city / trip-type / preferences), calls the /api/itinerary
 * endpoint to generate a plan via Gemini, and renders the resulting
 * itinerary alongside an interactive Mapbox map.
 */
"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ItineraryPanel } from "@/components/plan/ItineraryPanel";
import {
  loadPlanFromDatabase,
  savePlanToDatabase,
  type PlanPreferences,
} from "@/app/actions/plan";
import {
  friendlyNetworkError,
  friendlyPlanGenerateError,
} from "@/lib/itinerary/apiErrors";
import {
  snapPreferenceSlider,
  PREFERENCE_SLIDER_STEPS,
} from "@/lib/itinerary/sliderSteps";
import type { ItineraryPlan } from "@/types/itinerary";
import { CityImage } from "@/components/CityImage";
import { popularCities, type PopularCity } from "@/data/popularCities";
import { summarizePreferences } from "@/lib/itinerary/preferences";
import { Loader2, Sparkles } from "lucide-react";

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

const tripTypes = [
  "Cultural",
  "Relaxing",
  "Adventure",
  "Nature",
  "Urban",
] as const;

const DEFAULT_CITY: PopularCity =
  popularCities.find((p) => p.city === "Lisbon") ?? popularCities[0]!;

function snapSlider(value: number) {
  return snapPreferenceSlider(value);
}

export function PlanWorkspace() {
  const searchParams = useSearchParams();
  const planIdFromUrl = searchParams.get("id");

  const countries = useMemo(
    () =>
      [...new Set(popularCities.map((p) => p.country))].sort((a, b) =>
        a.localeCompare(b, "en"),
      ),
    [],
  );

  const [country, setCountry] = useState<string>(DEFAULT_CITY.country);
  const citiesHere = useMemo(
    () => popularCities.filter((p) => p.country === country),
    [country],
  );
  const [city, setCity] = useState<string>(DEFAULT_CITY.city);

  const [tripType, setTripType] = useState<string>(tripTypes[0]);
  const [days, setDays] = useState<number>(3);
  const [walking, setWalking] = useState<number>(50);
  const [nightlife, setNightlife] = useState<number>(25);
  const [audience, setAudience] = useState<"any" | "family" | "solo">("any");
  const [environment, setEnvironment] = useState<
    "mixed" | "indoor" | "outdoor"
  >("mixed");

  const [showResult, setShowResult] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryPlan | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [savePublic, setSavePublic] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  function handleCountry(c: string) {
    setCountry(c);
    const first = popularCities.find((p) => p.country === c);
    if (first) setCity(first.city);
  }

  useEffect(() => {
    const savedPlanId = planIdFromUrl;
    if (!savedPlanId) return;

    let cancelled = false;

    async function loadSavedPlan() {
      setLoadError(null);
      setLoadingPlan(true);
      const result = await loadPlanFromDatabase(savedPlanId as string);
      if (cancelled) return;

      if ("error" in result) {
        setLoadError(result.error);
        setLoadingPlan(false);
        return;
      }

      setCountry(result.plan.country);
      setCity(result.plan.city);
      setTripType(result.plan.tripType);
      setDays(result.dayCount);
      setWalking(snapSlider(result.preferences.walking));
      setNightlife(snapSlider(result.preferences.nightlife));
      setAudience(
        result.preferences.audience === "family" ||
          result.preferences.audience === "solo"
          ? result.preferences.audience
          : "any",
      );
      setEnvironment(
        result.preferences.environment === "indoor" ||
          result.preferences.environment === "outdoor"
          ? result.preferences.environment
          : "mixed",
      );
      setSavePublic(result.isPublic);
      setItinerary(result.plan);
      setShowResult(true);
      setLoadingPlan(false);
    }

    void loadSavedPlan();

    return () => {
      cancelled = true;
    };
  }, [planIdFromUrl]);

  async function persistPlan(plan: ItineraryPlan) {
    setSaveMsg(null);
    setSaveError(null);
    setSaving(true);
    try {
      const r = await savePlanToDatabase(plan, prefs, savePublic);
      if ("error" in r && r.error) {
        setSaveError(r.error);
        return;
      }
      if ("success" in r && r.success) {
        setSaveMsg(
          savePublic
            ? "Plan saved automatically — visible in Explore."
            : "Plan saved automatically to your profile.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerate() {
    setAiError(null);
    setSaveMsg(null);
    setSaveError(null);
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
        setAiError("The planner couldn't return an itinerary. Please try again.");
        return;
      }

      setItinerary(data.plan);
      setShowResult(true);
      await persistPlan(data.plan);
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

  const preferenceTokens = useMemo(
    () => summarizePreferences({ walking, nightlife, audience, environment }),
    [walking, nightlife, audience, environment],
  );

  const busy = aiLoading || saving || loadingPlan;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Plan your trip
        </h1>
        <p className="mt-2 text-slate-600">
          Pick a destination and your preferences. Tour It will draft a
          day-by-day itinerary you can preview on the map and save to your
          profile.
        </p>
        {(aiError || loadError) && (
          <p
            className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
            role="alert"
          >
            {aiError ?? loadError}
          </p>
        )}
      </header>

      <div className="relative mb-8 h-[200px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <CityImage
          city={city}
          country={country}
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
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
              {tripType} · {days} {days === 1 ? "day" : "days"}
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
                  disabled={busy}
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
                  disabled={busy}
                >
                  {citiesHere.map((c) => (
                    <option key={`${c.city}-${c.cc}`} value={c.city}>
                      {c.city}
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
                  disabled={busy}
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
                  onChange={(e) =>
                    setDays(Math.max(1, Math.min(14, Number(e.target.value))))
                  }
                  disabled={busy}
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
                  min={0}
                  max={100}
                  step={25}
                  list="walking-steps"
                  value={walking}
                  onChange={(e) =>
                    setWalking(snapSlider(Number(e.target.value)))
                  }
                  disabled={busy}
                />
                <datalist id="walking-steps">
                  {PREFERENCE_SLIDER_STEPS.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
                <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400">
                  {PREFERENCE_SLIDER_STEPS.map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-slate-700">
                  <span>Nightlife interest</span>
                  <span className="text-slate-500">{nightlife}%</span>
                </div>
                <input
                  type="range"
                  className="mt-2 w-full accent-coral-600"
                  min={0}
                  max={100}
                  step={25}
                  list="nightlife-steps"
                  value={nightlife}
                  onChange={(e) =>
                    setNightlife(snapSlider(Number(e.target.value)))
                  }
                  disabled={busy}
                />
                <datalist id="nightlife-steps">
                  {PREFERENCE_SLIDER_STEPS.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
                <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400">
                  {PREFERENCE_SLIDER_STEPS.map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>
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
                      disabled={busy}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        audience === v
                          ? "bg-coral-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      } ${busy ? "pointer-events-none opacity-50" : ""}`}
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
                      disabled={busy}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        environment === v
                          ? "bg-accent-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      } ${busy ? "pointer-events-none opacity-50" : ""}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={savePublic}
                onChange={(e) => setSavePublic(e.target.checked)}
                className="rounded border-slate-300 accent-coral-600"
                disabled={busy}
              />
              Share publicly in Explore
            </label>

            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-coral-500 to-coral-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:from-coral-600 hover:to-coral-700 disabled:opacity-60"
            >
              {aiLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden />
              )}
              {aiLoading
                ? "Generating itinerary…"
                : saving
                  ? "Saving plan…"
                  : "Generate itinerary"}
            </button>

            <p
              className="text-center text-[11px] font-medium uppercase tracking-wide text-slate-500"
              aria-live="polite"
            >
              {preferenceTokens.join("  ·  ")}
            </p>

            {saveMsg && (
              <p
                className="text-center text-xs font-medium text-emerald-700"
                role="status"
              >
                {saveMsg}
              </p>
            )}
            {saveError && (
              <p
                className="text-center text-xs font-medium text-rose-700"
                role="alert"
              >
                {saveError}
              </p>
            )}
          </div>
        </aside>

        <section className="min-h-[560px]">
          {loadingPlan ? (
            <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 p-8 text-center">
              <Loader2
                className="h-10 w-10 animate-spin text-coral-600"
                aria-hidden
              />
              <p className="mt-4 text-sm text-slate-600">Loading your plan…</p>
            </div>
          ) : !showResult || !itinerary ? (
            <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center">
              <Sparkles
                className="h-10 w-10 text-coral-400"
                aria-hidden
              />
              <p className="mt-4 max-w-sm text-sm text-slate-600">
                Fill in the form on the left and press{" "}
                <span className="font-semibold text-slate-800">
                  Generate itinerary
                </span>{" "}
                — your day-by-day plan and the map view will open here. Plans
                are saved automatically to your profile.
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
