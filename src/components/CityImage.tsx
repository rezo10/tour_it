/**
 * Reusable city/destination cover image. Looks up a photo via Unsplash
 * (cached per session in lib/getCityImage.ts), shows a skeleton until
 * the URL resolves, and falls back to a Mapbox-style placeholder if the
 * final URL fails to load.
 */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CITY_IMAGE_FALLBACK_URL,
  getCityImage,
} from "@/lib/getCityImage";

type Props = {
  city: string;
  country: string;
  /** Defaults to `{city}, {country}`. */
  alt?: string;
  /** Extra classes applied to the rendered <Image>. */
  className?: string;
  /** Hint Next.js to preload (use sparingly, for above-the-fold images). */
  priority?: boolean;
  /**
   * Optional `sizes` override. Defaults to the spec-recommended responsive
   * value for general card layouts.
   */
  sizes?: string;
};

const DEFAULT_SIZES =
  "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";

/**
 * Dynamic, cached city/destination cover photo.
 *
 * Always render inside a parent that is `relative` with `overflow-hidden`
 * and has a defined size — the underlying <Image> uses Next.js `fill`.
 */
export function CityImage({
  city,
  country,
  alt,
  className,
  priority,
  sizes,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Coerce empty inputs so the lookup helper still has something to search.
    const safeCity = city?.trim() ? city : "travel";
    const safeCountry = country?.trim() ? country : "destination";
    void getCityImage(safeCity, safeCountry).then((url) => {
      // Guard against setting state after the component has unmounted.
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [city, country]);

  // Pulsing placeholder while the Unsplash URL is in flight.
  if (!src) {
    return (
      <div
        className={`absolute inset-0 h-full w-full animate-pulse bg-gray-200 dark:bg-gray-700 ${
          className ?? ""
        }`}
        aria-hidden
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt ?? `${city}, ${country}`}
      fill
      sizes={sizes ?? DEFAULT_SIZES}
      priority={priority}
      className={`object-cover ${className ?? ""}`}
      onError={() => setSrc(CITY_IMAGE_FALLBACK_URL)}
    />
  );
}
