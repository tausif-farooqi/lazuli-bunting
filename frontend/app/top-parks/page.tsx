"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import { useEffect, useRef, useState, useCallback } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import type { MapRef } from "react-map-gl/mapbox";
import { Crown, Trophy, MapPin, Bird } from "lucide-react";
import { useTopParks, type TopParkRow } from "@/hooks/use-topparks";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SiteNav } from "@/components/site-nav";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

// ─── Rank colour palette ──────────────────────────────────────────────────────

const MEDAL_COLORS = {
  1: { bg: "#EAB308", border: "#FDE68A", glow: "rgba(234,179,8,0.55)", label: "Gold" },
  2: { bg: "#94A3B8", border: "#E2E8F0", glow: "rgba(148,163,184,0.55)", label: "Silver" },
  3: { bg: "#B45309", border: "#FCD34D", glow: "rgba(180,83,9,0.55)", label: "Bronze" },
} as const;

// A palette for ranks 4-20
const PIN_COLORS = [
  "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7",
  "#EC4899", "#14B8A6", "#10B981", "#84CC16",
  "#F59E0B", "#EF4444", "#06B6D4", "#0EA5E9",
  "#64748B", "#D97706", "#7C3AED", "#DC2626", "#0891B2",
];

// ─── Map marker components ────────────────────────────────────────────────────

function CrownMarker({
  rank,
  isSelected,
  onClick,
}: {
  rank: 1 | 2 | 3;
  isSelected: boolean;
  onClick: () => void;
}) {
  const c = MEDAL_COLORS[rank];
  const size = rank === 1 ? 48 : rank === 2 ? 40 : 36;
  const iconSize = Math.round(size * 0.45);

  return (
    <div
      className="relative flex cursor-pointer items-center justify-center"
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      {/* Selection glow ring */}
      {isSelected && (
        <span
          className="absolute inset-0 animate-ping rounded-full"
          style={{ backgroundColor: c.glow, transform: "scale(1.4)" }}
        />
      )}
      {/* Persistent subtle pulse */}
      <span
        className="absolute inset-0 animate-pulse rounded-full"
        style={{ backgroundColor: c.glow }}
      />
      {/* Main marker */}
      <div
        className="relative flex items-center justify-center rounded-full shadow-xl"
        style={{
          width: size,
          height: size,
          backgroundColor: c.bg,
          border: `3px solid ${c.border}`,
          boxShadow: `0 0 ${isSelected ? 20 : 10}px ${c.glow}, 0 4px 12px rgba(0,0,0,0.4)`,
        }}
      >
        <Crown
          style={{ width: iconSize, height: iconSize, color: "white" }}
        />
      </div>
    </div>
  );
}

function PulseMarker({
  rank,
  park,
  maxObserved,
  isSelected,
  onClick,
}: {
  rank: number;
  park: TopParkRow;
  maxObserved: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const color = PIN_COLORS[(rank - 4) % PIN_COLORS.length];
  // Scale the pulse ring 28-48px based on total_observed
  const outerSize = Math.round(28 + (park.total_observed / (maxObserved || 1)) * 20);

  return (
    <div
      className="relative flex cursor-pointer items-center justify-center"
      style={{ width: outerSize, height: outerSize }}
      onClick={onClick}
    >
      {/* Pulse ring */}
      <span
        className="absolute inset-0 animate-ping rounded-full opacity-70"
        style={{ backgroundColor: color + "50" }}
      />
      {/* Dot */}
      <div
        className={cn(
          "relative z-10 flex items-center justify-center rounded-full border-2 border-white font-bold text-white shadow-lg",
          isSelected && "ring-2 ring-white ring-offset-1",
        )}
        style={{
          width: 26,
          height: 26,
          backgroundColor: color,
          fontSize: 10,
          boxShadow: isSelected
            ? `0 0 12px ${color}, 0 2px 8px rgba(0,0,0,0.4)`
            : "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {rank}
      </div>
    </div>
  );
}

// ─── Sidebar card ─────────────────────────────────────────────────────────────

function LeaderboardCard({
  rank,
  park,
  isSelected,
  onClick,
}: {
  rank: number;
  park: TopParkRow;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isMedal = rank <= 3;
  const medalColors = isMedal ? MEDAL_COLORS[rank as 1 | 2 | 3] : null;
  const pinColor = !isMedal ? PIN_COLORS[(rank - 4) % PIN_COLORS.length] : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border p-3 text-left transition-all duration-200 hover:shadow-md",
        isSelected
          ? "border-primary bg-primary/10 shadow-md"
          : "border-border bg-card hover:border-primary/40 hover:bg-card/80",
      )}
    >
      <div className="flex items-center gap-3">
        {/* Rank badge */}
        <div
          className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-xs font-bold text-white shadow"
          style={{
            backgroundColor: medalColors?.bg ?? pinColor ?? "#6B7280",
            border: medalColors ? `2px solid ${medalColors.border}` : "2px solid rgba(255,255,255,0.3)",
            boxShadow: medalColors ? `0 0 8px ${medalColors.glow}` : undefined,
          }}
        >
          {isMedal ? (
            <Crown style={{ width: 16, height: 16 }} />
          ) : (
            <span style={{ fontSize: 11 }}>{rank}</span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground leading-tight">
            {park.locality}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {park.county}, {park.state}
          </p>
        </div>

        {/* Sightings count */}
        <div className="flex-none text-right">
          <p className="text-sm font-bold text-foreground">
            {park.total_observed.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">sightings</p>
        </div>
      </div>

      {/* Medal label for top 3 */}
      {isMedal && (
        <div
          className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: medalColors!.bg }}
        >
          <Crown style={{ width: 10, height: 10 }} />
          {medalColors!.label}
        </div>
      )}
    </button>
  );
}

// ─── Loading / Error states ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-card">
      <div className="relative">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-sky-100 p-1.5">
            <Bird className="h-5 w-5 animate-pulse text-sky-600" />
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Loading Hall of Fame…</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <MapPin className="h-10 w-10 text-destructive/60" />
      <p className="font-medium text-destructive">Failed to load data</p>
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function NoTokenState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-muted/40 p-8 text-center">
      <MapPin className="h-10 w-10 text-muted-foreground/50" />
      <p className="font-semibold text-foreground">Mapbox token not configured</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Add{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
          NEXT_PUBLIC_MAPBOX_TOKEN
        </code>{" "}
        to your <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">.env</code> file to enable the map.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TopParksPage() {
  const { load, data: parks, isLoading, error } = useTopParks();
  const mapRef = useRef<MapRef>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    load();
  }, [load]);

  const maxObserved = parks.length > 0 ? Math.max(...parks.map((p) => p.total_observed)) : 1;

  const handleSelectPark = useCallback(
    (idx: number) => {
      setSelectedIdx(idx);
      const park = parks[idx];
      if (park && mapRef.current) {
        mapRef.current.flyTo({
          center: [park.longitude, park.latitude],
          zoom: 10,
          duration: 1800,
          essential: true,
        });
      }
      // Scroll the sidebar card into view
      const card = cardRefs.current[idx];
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    },
    [parks],
  );

  return (
    <main
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - 44px)" }}
    >
      {/* Page header */}
      <header className="relative flex-none overflow-hidden bg-black">
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="/images/lazuli-bunting-hero.jpg"
            alt=""
            fill
            className="object-cover object-center opacity-[0.15]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black" />
        </div>
        <div className="relative z-10 mx-auto max-w-none px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-yellow-500/20 p-2.5 ring-1 ring-yellow-400/40">
                <Trophy className="h-7 w-7 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white md:text-2xl">
                  Hall of Fame — Top 20 Parks
                </h1>
                <p className="text-sm text-gray-400">
                  The highest-sighting Lazuli Bunting hotspots across North America
                </p>
              </div>
            </div>
            <SiteNav />
          </div>
        </div>
      </header>

      {/* Map + Sidebar */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Map */}
        <div className="relative min-h-[240px] flex-1">
          {isLoading && (
            <div className="absolute inset-0 z-10">
              <LoadingState />
            </div>
          )}
          {error && !isLoading && (
            <div className="absolute inset-0 z-10 bg-card">
              <ErrorState message={error} />
            </div>
          )}
          {!MAPBOX_TOKEN && !isLoading && !error && (
            <div className="absolute inset-0 z-10">
              <NoTokenState />
            </div>
          )}

          {MAPBOX_TOKEN && (
            <Map
              ref={mapRef}
              mapboxAccessToken={MAPBOX_TOKEN}
              initialViewState={{
                longitude: -98.35,
                latitude: 39.5,
                zoom: 3.2,
              }}
              style={{ width: "100%", height: "100%" }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
            >
              <NavigationControl position="bottom-right" />

              {parks.map((park, idx) => {
                const rank = idx + 1;
                const isSelected = selectedIdx === idx;

                return (
                  <Marker
                    key={`${park.locality}-${idx}`}
                    longitude={park.longitude}
                    latitude={park.latitude}
                    anchor="center"
                  >
                    {rank <= 3 ? (
                      <CrownMarker
                        rank={rank as 1 | 2 | 3}
                        isSelected={isSelected}
                        onClick={() => handleSelectPark(idx)}
                      />
                    ) : (
                      <PulseMarker
                        rank={rank}
                        park={park}
                        maxObserved={maxObserved}
                        isSelected={isSelected}
                        onClick={() => handleSelectPark(idx)}
                      />
                    )}
                  </Marker>
                );
              })}
            </Map>
          )}

          {/* Map attribution bar (always visible) */}
          {selectedIdx !== null && parks[selectedIdx] && (
            <div className="pointer-events-none absolute bottom-8 left-4 z-10 max-w-[240px] rounded-xl border border-white/20 bg-black/70 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs font-semibold text-yellow-400">
                #{selectedIdx + 1} Selected
              </p>
              <p className="mt-0.5 text-sm font-bold text-white leading-snug">
                {parks[selectedIdx].locality}
              </p>
              <p className="text-xs text-gray-300">
                {parks[selectedIdx].county}, {parks[selectedIdx].state}
              </p>
              <p className="mt-1 text-xs font-semibold text-sky-400">
                {parks[selectedIdx].total_observed.toLocaleString()} sightings
              </p>
            </div>
          )}
        </div>

        {/* Leaderboard sidebar */}
        <div
          ref={sidebarRef}
          className="flex w-full flex-col overflow-hidden border-t border-border bg-background lg:w-80 lg:border-t-0 lg:border-l"
        >
          {/* Sidebar header */}
          <div className="flex-none border-b border-border bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <h2 className="text-sm font-bold text-foreground">Leaderboard</h2>
              {parks.length > 0 && (
                <span className="ml-auto rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                  Top {parks.length}
                </span>
              )}
            </div>
            {!isLoading && !error && parks.length > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Click any card to fly to that park on the map
              </p>
            )}
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-yellow-200 border-t-yellow-500" />
                  <p className="mt-3 text-xs text-muted-foreground">Loading…</p>
                </div>
              </div>
            )}
            {error && !isLoading && (
              <div className="p-4">
                <p className="text-xs text-destructive">{error}</p>
              </div>
            )}
            {!isLoading && !error && parks.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <MapPin className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No parks found</p>
              </div>
            )}
            {!isLoading && !error && parks.length > 0 && (
              <div className="space-y-2 p-3">
                {parks.map((park, idx) => (
                  <div
                    key={`card-${idx}`}
                    ref={(el) => {
                      cardRefs.current[idx] = el;
                    }}
                  >
                    <LeaderboardCard
                      rank={idx + 1}
                      park={park}
                      isSelected={selectedIdx === idx}
                      onClick={() => handleSelectPark(idx)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
