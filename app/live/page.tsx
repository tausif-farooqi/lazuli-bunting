"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Binoculars, Radio } from "lucide-react";
import Image from "next/image";
import { SiteNav } from "@/components/site-nav";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useLiveSightings, type LiveSighting } from "@/hooks/use-live-sightings";

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS_OPTIONS = [3, 5, 7] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00Z");
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return dateStr;
  }
}

// ─── Status Card ─────────────────────────────────────────────────────────────

function StatusCard({ sighting, index }: { sighting: LiveSighting; index: number }) {
  const isMajor = sighting.count >= 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.045, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col gap-2 rounded-xl border bg-card/70 p-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md",
        isMajor
          ? "border-yellow-500/50 ring-1 ring-yellow-500/50 bg-yellow-50/20 dark:bg-yellow-900/10"
          : "border-border",
      )}
    >
      {/* Top row: major crown (left) + count (right) */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-h-[24px]">
          {isMajor && (
            <>
              <Crown className="h-4 w-4 flex-none text-yellow-500" />
              <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">
                Major Sighting
              </span>
            </>
          )}
        </div>
        <span
          className="font-mono text-2xl font-bold leading-none tabular-nums text-foreground"
          aria-label={`${sighting.count} birds`}
        >
          {sighting.count}
        </span>
      </div>

      {/* Center: location + county */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold leading-tight text-foreground">
          {sighting.location}
        </p>
        <p className="truncate text-xs text-muted-foreground">{sighting.county}</p>
      </div>

      {/* Bottom: date + subId badges */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">{formatDate(sighting.date)}</p>
        {sighting.subIds.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sighting.subIds.map((id) => (
              <a
                key={id}
                href={`https://ebird.org/checklist/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Badge
                  variant="secondary"
                  className="cursor-pointer px-1.5 py-0 text-[10px] font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {id}
                </Badge>
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ daysBack }: { daysBack: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="col-span-full flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border bg-card p-16 text-center"
    >
      <div className="rounded-full bg-muted p-5">
        <Binoculars className="h-10 w-10 text-muted-foreground/60" />
      </div>
      <div>
        <p className="text-base font-semibold text-foreground">
          The buntings are lying low.
        </p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          Try increasing the date range or check back later.
        </p>
      </div>
      <Badge variant="secondary" className="text-xs">
        Checked last {daysBack} days
      </Badge>
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingGrid() {
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="h-36 animate-pulse rounded-xl border border-border bg-muted/40"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </>
  );
}

// ─── State Navigator ──────────────────────────────────────────────────────────

function StateNavigator({
  states,
  totalCount,
  selectedState,
  onSelectState,
}: {
  states: { name: string; count: number }[];
  totalCount: number;
  selectedState: string | null;
  onSelectState: (state: string | null) => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5">
      <button
        onClick={() => onSelectState(null)}
        className={cn(
          "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors text-left",
          selectedState === null
            ? "bg-primary/10 font-semibold text-primary"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <span>All States</span>
        <span className="ml-2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-muted-foreground">
          {totalCount}
        </span>
      </button>

      <div className="my-1 border-t border-border" />

      {states.map(({ name, count }) => (
        <button
          key={name}
          onClick={() => onSelectState(name === selectedState ? null : name)}
          className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors text-left",
            selectedState === name
              ? "bg-primary/10 font-semibold text-primary"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          )}
        >
          <span className="truncate">{name || "Unknown"}</span>
          <span className="ml-2 flex-none rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-muted-foreground">
            {count}
          </span>
        </button>
      ))}
    </nav>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LivePage() {
  const [daysBack, setDaysBack] = useState<(typeof DAYS_OPTIONS)[number]>(3);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const { load, data, isLoading, error } = useLiveSightings();
  const gridRef = useRef<HTMLDivElement>(null);
  const stateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    load(daysBack);
  }, [load, daysBack]);

  // Ordered list of states with per-state sighting counts
  const stateSummary = useMemo(() => {
    return Object.entries(data)
      .map(([name, sightings]) => ({ name, count: sightings.length }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [data]);

  const totalCount = useMemo(
    () => stateSummary.reduce((s, st) => s + st.count, 0),
    [stateSummary],
  );

  // Which states to render in the main grid
  const visibleStates = useMemo(
    () => (selectedState ? [[selectedState, data[selectedState] ?? []]] as const : Object.entries(data)),
    [data, selectedState],
  );

  const visibleCount = useMemo(
    () => visibleStates.reduce((s, [, sightings]) => s + sightings.length, 0),
    [visibleStates],
  );

  function handleStateSelect(state: string | null) {
    setSelectedState(state);
    if (state && stateRefs.current[state]) {
      stateRefs.current[state]!.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (!state && gridRef.current) {
      gridRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const isEmpty = !isLoading && !error && Object.keys(data).length === 0;

  return (
    <main className="relative flex flex-col overflow-hidden" style={{ height: "calc(100vh - 44px)" }}>
      {/* Faded background image */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Image
          src="/images/lazuli-bunting-hero.jpg"
          alt=""
          fill
          className="object-cover object-center opacity-[0.12]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 flex-none overflow-hidden bg-black">
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
              <div className="rounded-xl bg-sky-500/20 p-2.5 ring-1 ring-sky-400/40">
                <Radio className="h-7 w-7 text-sky-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white md:text-2xl">
                  Live Status Board
                </h1>
                <p className="text-sm text-gray-400">
                  Recent Lazuli Bunting sightings from eBird
                </p>
              </div>
            </div>
            <SiteNav />
          </div>
        </div>
      </header>

      {/* ── Toolbar ── */}
      <div className="relative z-10 flex-none border-b border-border bg-gradient-to-r from-sky-50 via-white to-amber-50 px-4 py-2 dark:from-muted/30 dark:via-background dark:to-muted/30">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Show last:</span>
          <Tabs
            value={String(daysBack)}
            onValueChange={(v) => {
              setDaysBack(Number(v) as (typeof DAYS_OPTIONS)[number]);
              setSelectedState(null);
            }}
          >
            <TabsList className="h-8">
              {DAYS_OPTIONS.map((d) => (
                <TabsTrigger key={d} value={String(d)} className="text-xs px-3">
                  {d} days
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {!isLoading && visibleCount > 0 && (
            <span className="ml-auto text-xs text-muted-foreground">
              {visibleCount} sighting{visibleCount !== 1 ? "s" : ""}
              {selectedState ? ` in ${selectedState}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Body: Sidebar + Grid ── */}
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-52 flex-none flex-col overflow-hidden border-r border-border bg-background lg:flex">
          <div className="flex-none border-b border-border bg-muted/30 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              State Navigator
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? (
              <div className="space-y-1.5 p-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-7 animate-pulse rounded-md bg-muted/50" />
                ))}
              </div>
            ) : stateSummary.length > 0 ? (
              <StateNavigator
                states={stateSummary}
                totalCount={totalCount}
                selectedState={selectedState}
                onSelectState={handleStateSelect}
              />
            ) : (
              <p className="p-3 text-xs text-muted-foreground">No data</p>
            )}
          </div>
        </aside>

        {/* Main grid */}
        <div ref={gridRef} className="flex-1 overflow-y-auto">
          {error && (
            <div className="m-6 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="font-medium text-destructive">Failed to load sightings</p>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              <LoadingGrid />
            </div>
          )}

          {isEmpty && (
            <div className="grid grid-cols-1 gap-3 p-4">
              <EmptyState daysBack={daysBack} />
            </div>
          )}

          {!isLoading && !error && !isEmpty && (
            <AnimatePresence mode="wait">
              <div key={`${daysBack}-${selectedState ?? "all"}`} className="p-4 space-y-6">
                {visibleStates.map(([state, sightings]) => (
                  <section
                    key={state}
                    ref={(el) => {
                      stateRefs.current[state] = el;
                    }}
                  >
                    {/* State heading */}
                    <div className="mb-3 flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-foreground">{state || "Unknown"}</h2>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                        {sightings.length}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {sightings.map((sighting, idx) => (
                        <StatusCard
                          key={`${sighting.location}-${sighting.date}-${idx}`}
                          sighting={sighting}
                          index={idx}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </main>
  );
}
