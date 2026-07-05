"use client";

import { cn } from "@/lib/utils";

interface BirdSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

/**
 * BirdSpinner – a themed loading animation for the Lazuli Bunting app.
 * Renders a radar-pulse ring with a Lazuli Bunting silhouette at the center.
 * All colours are sourced from design tokens so it works in dark & light mode.
 */
export function BirdSpinner({
  className,
  size = "md",
  label = "Loading sightings…",
}: BirdSpinnerProps) {
  const sizeCls = {
    sm: "h-16 w-16",
    md: "h-28 w-28",
    lg: "h-40 w-40",
  }[size];

  const svgSize = { sm: 64, md: 112, lg: 160 }[size];
  const birdScale = { sm: 0.55, md: 1, lg: 1.45 }[size];

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-4", className)}
      role="status"
      aria-label={label}
    >
      {/* Radar + bird */}
      <div className={cn("relative", sizeCls)}>
        {/* Outermost pulse ring */}
        <span
          className="absolute inset-0 rounded-full border border-sky-400/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
          style={{ animationDelay: "0ms" }}
        />
        {/* Middle pulse ring */}
        <span
          className="absolute inset-[12%] rounded-full border border-sky-400/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
          style={{ animationDelay: "350ms" }}
        />
        {/* Inner static ring */}
        <span className="absolute inset-[25%] rounded-full border border-sky-500/60" />

        {/* Center disc */}
        <span className="absolute inset-[30%] rounded-full bg-sky-500/10 ring-1 ring-sky-400/40" />

        {/* Bird SVG silhouette */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 32"
          width={svgSize * 0.56}
          height={svgSize * 0.37}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ transform: `translate(-50%, -50%) scale(${birdScale})` }}
          aria-hidden="true"
        >
          {/*
            Lazuli Bunting-style songbird silhouette in flight.
            Drawn on a 48×32 canvas, wings mid-stroke.
          */}
          <path
            className="fill-sky-400"
            d="
              M24 14
              C21 10, 14 7, 6 9
              C10 9, 13 11, 16 13
              C12 12, 8 13, 4 16
              C8 15, 13 14, 17 15
              C14 16, 11 19, 10 23
              C13 19, 17 17, 20 17
              C21 19, 22 21, 24 22
              C26 21, 27 19, 28 17
              C31 17, 35 19, 38 23
              C37 19, 34 16, 31 15
              C35 14, 40 15, 44 16
              C40 13, 36 12, 32 13
              C35 11, 38 9, 42 9
              C34 7, 27 10, 24 14
              Z
            "
          />
          {/* Eye */}
          <circle cx="23" cy="15.5" r="1" className="fill-background" />
        </svg>
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-muted-foreground animate-pulse">{label}</p>
    </div>
  );
}
