"use client";

import { useEffect, useMemo, useState } from "react";
import { CityImage } from "@/components/CityImage";
import {
  popularCities,
  placeKey,
  parsePlaceKey,
  type PopularCity,
} from "@/data/popularCities";
import {
  formatOffsetWallClock,
  offsetShortLabel,
} from "@/lib/utility/cityClock";
import {
  Clock3,
  CloudSun,
  Coins,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";

const DEFAULT: PopularCity =
  popularCities.find((p) => p.city === "Istanbul" && p.cc === "TR") ??
  popularCities[0]!;

const FX_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "TRY",
  "JPY",
  "CHF",
  "AUD",
  "CAD",
] as const;

function formatRate(rate: number): string {
  if (!Number.isFinite(rate)) return "—";
  if (rate >= 100) return rate.toFixed(2);
  if (rate >= 1) return rate.toFixed(4);
  return rate.toFixed(6);
}

export function UtilityWorkspace() {
  const countries = useMemo(
    () =>
      [...new Set(popularCities.map((p) => p.country))].sort((a, b) =>
        a.localeCompare(b, "en"),
      ),
    [],
  );

  const [countryName, setCountryName] = useState(DEFAULT.country);
  const citiesHere = useMemo(
    () => popularCities.filter((p) => p.country === countryName),
    [countryName],
  );

  const [selected, setSelected] = useState<PopularCity>(DEFAULT);
  const [manualQuery, setManualQuery] = useState("");
  /** Non-empty value = use OpenWeather's `q` directly. */
  const [activeManual, setActiveManual] = useState<string | null>(null);

  const [weather, setWeather] = useState<{
    temp?: number;
    description?: string;
    error?: string;
  } | null>(null);

  const [fxFrom, setFxFrom] = useState<string>("USD");
  const [fxTo, setFxTo] = useState<string>("EUR");
  const [fx, setFx] = useState<{
    rate?: number;
    date?: string;
    label?: string;
    error?: string;
  } | null>(null);

  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loadingFx, setLoadingFx] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const [meta, setMeta] = useState<{
    city: string;
    country: string;
    countryCode: string;
    timezone: number;
  } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadWeather() {
      setLoadingWeather(true);
      try {
        const wUrl = activeManual?.trim()
          ? `/api/utility/weather?q=${encodeURIComponent(activeManual.trim())}`
          : `/api/utility/weather?city=${encodeURIComponent(
              selected.city,
            )}&cc=${encodeURIComponent(selected.cc)}`;
        const res = await fetch(wUrl);
        const json = (await res.json()) as {
          city?: string;
          temp?: number;
          description?: string;
          error?: string;
          country?: string;
          countryCode?: string;
          timezone?: number;
        };
        if (cancelled) return;
        if (!res.ok) {
          setWeather({
            error:
              json.error ??
              "We couldn't fetch the weather for that location. Try another city.",
          });
          setMeta(null);
          return;
        }
        setWeather({
          temp: json.temp,
          description: json.description,
        });
        setMeta({
          city: json.city ?? selected.city,
          country: json.country || selected.country,
          countryCode: json.countryCode ?? selected.cc,
          timezone: json.timezone ?? 0,
        });
      } catch {
        if (!cancelled) {
          setWeather({
            error:
              "Network error. Check your connection and try again.",
          });
          setMeta(null);
        }
      } finally {
        if (!cancelled) setLoadingWeather(false);
      }
    }
    void loadWeather();
    return () => {
      cancelled = true;
    };
  }, [selected, activeManual]);

  useEffect(() => {
    let cancelled = false;
    async function loadFx() {
      if (fxFrom === fxTo) {
        setFx({
          rate: 1,
          label: `1 ${fxFrom} = 1 ${fxTo}`,
        });
        return;
      }
      setLoadingFx(true);
      try {
        const res = await fetch(
          `/api/utility/fx?from=${encodeURIComponent(
            fxFrom,
          )}&to=${encodeURIComponent(fxTo)}`,
        );
        const json = (await res.json()) as {
          rate?: number;
          date?: string;
          label?: string;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok) {
          setFx({
            error: json.error ?? "Unable to fetch the current exchange rate.",
          });
          return;
        }
        setFx({
          rate: json.rate,
          date: json.date,
          label:
            typeof json.rate === "number"
              ? `1 ${fxFrom} = ${formatRate(json.rate)} ${fxTo}`
              : json.label,
        });
      } catch {
        if (!cancelled) {
          setFx({ error: "Network error. Couldn't reach Frankfurter." });
        }
      } finally {
        if (!cancelled) setLoadingFx(false);
      }
    }
    void loadFx();
    return () => {
      cancelled = true;
    };
  }, [fxFrom, fxTo]);

  function onCountryChange(name: string) {
    setCountryName(name);
    const first = popularCities.find((p) => p.country === name);
    if (first) {
      setSelected(first);
      setActiveManual(null);
    }
  }

  function onCityKeyChange(key: string) {
    const p = parsePlaceKey(key);
    if (p) {
      setSelected(p);
      setCountryName(p.country);
      setActiveManual(null);
    }
  }

  function applyManualSearch() {
    const q = manualQuery.trim();
    if (!q) {
      setActiveManual(null);
      return;
    }
    setActiveManual(q);
  }

  function clearManual() {
    setManualQuery("");
    setActiveManual(null);
  }

  const displayCity = meta?.city ?? selected.city;
  const displayCountry = meta?.country ?? selected.country;
  const tzSec = meta?.timezone ?? 0;
  const timeFormatted = formatOffsetWallClock(now.getTime(), tzSec);
  const tzLabel = meta ? offsetShortLabel(meta.timezone) : "—";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Travel utilities
        </h1>
        <p className="mt-2 text-slate-600">
          Live weather from OpenWeather, daily ECB exchange rates from
          Frankfurter and the local time of any selected city — all without
          having to sign in.
        </p>
      </header>

      <div className="relative mb-8 h-44 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <CityImage
          city={displayCity}
          country={displayCountry}
          sizes="(max-width: 1200px) 100vw, 1200px"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/15 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/85">
            {displayCountry}
          </p>
          <p className="text-2xl font-bold text-white drop-shadow-sm">
            {displayCity}
          </p>
          {activeManual && (
            <p className="mt-1 text-xs text-cream-100">
              Custom search: {activeManual}
            </p>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-coral-800">
            <MapPin className="h-4 w-4" aria-hidden />
            <h2 className="text-sm font-semibold">Pick from popular cities</h2>
          </div>
          <p className="text-xs text-slate-500">
            {popularCities.length} cities indexed; narrow by country.
          </p>
          <label className="block text-sm font-medium text-slate-700">
            Country
          </label>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
            value={countryName}
            onChange={(e) => onCountryChange(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="block text-sm font-medium text-slate-700">
            City
          </label>
          <select
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
            value={placeKey(selected)}
            onChange={(e) => onCityKeyChange(e.target.value)}
          >
            {citiesHere.map((p) => (
              <option key={placeKey(p)} value={placeKey(p)}>
                {p.city}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-accent-800">
            <Search className="h-4 w-4" aria-hidden />
            <h2 className="text-sm font-semibold">Search any city</h2>
          </div>
          <p className="text-xs text-slate-500">
            Use the OpenWeather format{" "}
            <code className="rounded bg-slate-100 px-1">City</code>,{" "}
            <code className="rounded bg-slate-100 px-1">country code</code>{" "}
            (e.g. <code className="rounded bg-slate-100 px-1">Tromso,no</code>,{" "}
            <code className="rounded bg-slate-100 px-1">Melbourne,au</code>).
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyManualSearch();
              }}
              placeholder="e.g. Bergen, no"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-coral-500/30 focus:border-coral-400 focus:ring-2"
            />
            <button
              type="button"
              onClick={() => applyManualSearch()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-coral-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-700"
            >
              <Search className="h-4 w-4" aria-hidden />
              Search
            </button>
          </div>
          {activeManual && (
            <button
              type="button"
              onClick={() => clearManual()}
              className="text-xs font-medium text-coral-700 underline-offset-2 hover:underline"
            >
              Clear custom search
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-coral-700">
            <CloudSun className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Weather
            </h2>
          </div>
          {loadingWeather ? (
            <Loader2 className="mt-4 h-8 w-8 animate-spin text-coral-600" />
          ) : weather?.error ? (
            <p className="mt-4 text-sm text-amber-800">{weather.error}</p>
          ) : (
            <>
              <p className="mt-4 text-3xl font-semibold text-slate-900">
                {weather?.temp != null ? `${Math.round(weather.temp)}°C` : "—"}
              </p>
              <p className="text-sm capitalize text-slate-600">
                {weather?.description || "—"} · {displayCity}
              </p>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2 text-accent-700">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5" aria-hidden />
              <h2 className="text-sm font-semibold uppercase tracking-wide">
                Currency
              </h2>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <select
              aria-label="From currency"
              value={fxFrom}
              onChange={(e) => setFxFrom(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-accent-400"
            >
              {FX_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="text-slate-400">→</span>
            <select
              aria-label="To currency"
              value={fxTo}
              onChange={(e) => setFxTo(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-accent-400"
            >
              {FX_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {loadingFx ? (
            <Loader2 className="mt-4 h-8 w-8 animate-spin text-accent-600" />
          ) : fx?.error ? (
            <p className="mt-4 text-sm text-amber-800">{fx.error}</p>
          ) : (
            <>
              <p className="mt-4 font-mono text-xl font-semibold text-slate-900">
                {fx?.label ?? "—"}
              </p>
              <p className="text-sm text-slate-600">
                Frankfurter (ECB) {fx?.date ? `· ${fx.date}` : ""}
              </p>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Clock3 className="h-5 w-5" aria-hidden />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              Local time
            </h2>
          </div>
          {loadingWeather && !meta ? (
            <Loader2 className="mt-4 h-8 w-8 animate-spin text-slate-600" />
          ) : (
            <>
              <p className="mt-4 font-mono text-2xl font-semibold text-slate-900">
                {meta ? timeFormatted : "—"}
              </p>
              <p className="text-sm text-slate-600">
                {meta ? tzLabel : "Loading…"}
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
