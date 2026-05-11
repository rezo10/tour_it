"use client";

import Image from "next/image";
import { useState } from "react";
import { placeCoverImageUrl } from "@/lib/places/placeImage";

type Props = {
  city: string;
  country: string;
  className?: string;
  /** Piksel — `next/image` fill için sabit yükseklik */
  height?: number;
  /** Piksel — kaynak çözünürlüğü */
  width?: number;
  priority?: boolean;
  /** Alt gradient yerine düz renk (metin kartlarda ayrıdaysa) */
  variant?: "hero" | "subtle";
};

export function PlaceCoverImage({
  city,
  country,
  className = "",
  height = 200,
  width = 1200,
  priority = false,
  variant = "hero",
}: Props) {
  const [broken, setBroken] = useState(false);
  const h = Math.max(64, height);
  const src = placeCoverImageUrl(city, country, width, Math.max(160, Math.round(h * (width / 1200))));

  if (broken) {
    return (
      <div
        className={`relative w-full overflow-hidden bg-gradient-to-br from-coral-200/80 via-cream-100 to-navy-50 ${className}`}
        style={{ height: h }}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden ${className}`}
      style={{ height: h }}
    >
      <Image
        src={src}
        alt={`${city}, ${country} — travel cover photo`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 960px"
        priority={priority}
        onError={() => setBroken(true)}
      />
      <div
        className={
          variant === "subtle"
            ? "pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent"
            : "pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-900/15 to-transparent"
        }
        aria-hidden
      />
    </div>
  );
}
