"use client";

import { PredictionResult } from "@/lib/mock-sightings";
import { MapPin, Eye, TrendingUp, Navigation } from "lucide-react";

interface ResultsListProps {
  results: PredictionResult[];
  month: number;
}

const monthNames = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getReliabilityBadge(score: number) {
  if (score >= 75) {
    return {
      label: "Excellent",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
  } else if (score >= 50) {
    return {
      label: "Good",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    };
  } else {
    return {
      label: "Moderate",
      className: "bg-slate-100 text-slate-600 border-slate-200",
    };
  }
}

function getRankColor(index: number) {
  if (index === 0) return "bg-gradient-to-br from-amber-400 to-amber-500 text-amber-950";
  if (index === 1) return "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800";
  if (index === 2) return "bg-gradient-to-br from-orange-300 to-orange-400 text-orange-900";
  return "bg-gradient-to-br from-sky-400 to-sky-500 text-white";
}

export function ResultsList({ results, month }: ResultsListProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Showing predictions for {monthNames[month]}
      </p>

      <div className="space-y-3">
        {results.map((result, index) => {
          const badge = getReliabilityBadge(result.reliabilityScore);
          const rankColor = getRankColor(index);

          return (
            <div
              key={result.location.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-sky-300 hover:shadow-md hover:shadow-sky-100"
            >
              {/* Rank Badge */}
              <div className={`absolute -left-1 -top-1 flex h-8 w-8 items-center justify-center rounded-br-xl text-sm font-bold shadow-sm ${rankColor}`}>
                {index + 1}
              </div>

              <div className="ml-6">
                {/* Location Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {result.location.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {result.location.region}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-sky-100 p-1.5">
                      <Navigation className="h-3.5 w-3.5 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {result.distance.toLocaleString()} mi
                      </p>
                      <p className="text-xs text-muted-foreground">Distance</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-amber-100 p-1.5">
                      <Eye className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {result.totalSightings.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Sightings</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-emerald-100 p-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {result.reliabilityScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">Reliability</p>
                    </div>
                  </div>
                </div>

                {/* Habitat Tag */}
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                    <MapPin className="h-3 w-3" />
                    {result.location.habitat}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
