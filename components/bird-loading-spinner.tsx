"use client";

import { Bird } from "lucide-react";
import { cn } from "@/lib/utils";

interface BirdLoadingSpinnerProps {
  /** Optional message shown below the spinner. */
  message?: string;
  /** Extra classes applied to the outer wrapper. Use to control height/layout. */
  className?: string;
}

/**
 * BirdLoadingSpinner – shared loading indicator used across pages.
 * Renders a spinning ring with a pulsing Bird icon at the centre
 * and an optional descriptive message below.
 */
export function BirdLoadingSpinner({
  message = "Loading data…",
  className,
}: BirdLoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-sky-100 p-1.5">
            <Bird className="h-5 w-5 animate-pulse text-sky-600" />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
