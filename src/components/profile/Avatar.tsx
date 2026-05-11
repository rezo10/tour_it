"use client";

import Image from "next/image";
import { useState } from "react";
import { UserCircle } from "lucide-react";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { px: number; cls: string }> = {
  sm: { px: 36, cls: "h-9 w-9" },
  md: { px: 56, cls: "h-14 w-14" },
  lg: { px: 96, cls: "h-24 w-24" },
};

export function Avatar({
  url,
  size = "md",
  alt = "Profile photo",
}: {
  url: string | null;
  size?: Size;
  alt?: string;
}) {
  const [broken, setBroken] = useState(false);
  const { px, cls } = SIZES[size];

  if (!url || broken) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral-100 to-cream-100 text-coral-700 ${cls}`}
        aria-label="Default profile avatar"
      >
        <UserCircle className="h-3/4 w-3/4" aria-hidden />
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={px}
      height={px}
      className={`shrink-0 rounded-full object-cover ring-2 ring-coral-200/60 ${cls}`}
      onError={() => setBroken(true)}
      unoptimized
    />
  );
}
