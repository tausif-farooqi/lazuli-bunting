"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart2, Map, MapPin, Bird, RefreshCw } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import {
  useAnnualSummary,
  useStateStats,
  useCountyStats,
} from "@/hooks/use-stats";
import { cn } from "@/lib/utils";
import Image from "next/image";

const chartConfig: ChartConfig = {
  total_sightings: {
    label: "Sightings",
    color: "var(--chart-1)",
  },
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

function LoadingState({ message = "Loading data…" }: { message?: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card">
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

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <div className="space-y-2">
        <p className="font-medium text-destructive">Failed to load data</p>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="default" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      ) : null}
    </div>
  );
}

function EmptyDataState({ message }: { message: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-muted/30 p-8 text-center">
      <p className="font-medium text-foreground">No data</p>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ─── Level 1: Annual Summary ──────────────────────────────────────────────────

function AnnualSummaryChart({
  onYearClick,
}: {
  onYearClick: (year: number) => void;
}) {
  const { load, data, isLoading, error } = useAnnualSummary();

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) return <LoadingState message="Loading annual sightings data…" />;
  if (error) return <ErrorState message={error} onRetry={() => load()} />;
  if (!data.length) return <EmptyDataState message="No annual data available." />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Click a bar to explore state-level sightings for that year.
      </p>
      <ChartContainer
        config={chartConfig}
        className="[aspect-ratio:unset] h-[380px] w-full"
      >
        <BarChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="obs_year"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v.toLocaleString()}
            width={64}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="total_sightings"
            fill="var(--color-total_sightings)"
            radius={[4, 4, 0, 0]}
            cursor="pointer"
            activeBar={{ fill: "var(--chart-2)", opacity: 1 }}
            onClick={(entry: { obs_year: number }) => onYearClick(entry.obs_year)}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

// ─── Level 2: State drill-down ────────────────────────────────────────────────

function StateChart({
  year,
  onStateClick,
}: {
  year: number;
  onStateClick: (state: string) => void;
}) {
  const { load, data, isLoading, error } = useStateStats();

  useEffect(() => {
    load(year);
  }, [load, year]);

  const chartHeight = Math.max(320, data.length * 40);

  if (isLoading) return <LoadingState message={`Loading state data for ${year}…`} />;
  if (error) return <ErrorState message={error} onRetry={() => load(year)} />;
  if (!data.length)
    return <EmptyDataState message={`No state data available for ${year}.`} />;

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Click a bar to explore county-level sightings in that state.
      </p>
      <div style={{ height: chartHeight }}>
        <ChartContainer
          config={chartConfig}
          className="h-full w-full [aspect-ratio:unset]"
        >
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 8, right: 56, bottom: 8, left: 8 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => v.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="state"
              width={160}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="total_sightings"
              fill="var(--color-total_sightings)"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              activeBar={{ fill: "var(--chart-2)", opacity: 1 }}
              onClick={(entry: { state: string }) => onStateClick(entry.state)}
            >
              <LabelList
                dataKey="total_sightings"
                position="right"
                formatter={(v: number) => v.toLocaleString()}
                style={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

// ─── Level 3: County drill-down ───────────────────────────────────────────────

function CountyChart({ state, year }: { state: string; year: number }) {
  const { load, data, isLoading, error } = useCountyStats();

  useEffect(() => {
    load(state, year);
  }, [load, state, year]);

  const chartHeight = Math.max(320, data.length * 36);

  if (isLoading)
    return <LoadingState message={`Loading county data for ${state}, ${year}…`} />;
  if (error) return <ErrorState message={error} onRetry={() => load(state, year)} />;
  if (!data.length)
    return (
      <EmptyDataState
        message={`No county data found for ${state} in ${year}.`}
      />
    );

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Sightings by county in {state} for {year}.
      </p>
      <div style={{ height: chartHeight }}>
        <ChartContainer
          config={chartConfig}
          className="h-full w-full [aspect-ratio:unset]"
        >
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 8, right: 56, bottom: 8, left: 8 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => v.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="county"
              width={120}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="total_sightings"
              fill="var(--color-total_sightings)"
              radius={[0, 4, 4, 0]}
            >
              <LabelList
                dataKey="total_sightings"
                position="right"
                formatter={(v: number) => v.toLocaleString()}
                style={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}

// ─── Main page content (uses useSearchParams) ─────────────────────────────────

function StatsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const yearParam = searchParams.get("year");
  const stateParam = searchParams.get("state");

  const year = yearParam ? parseInt(yearParam, 10) : null;
  const state = stateParam ?? null;

  const level = year === null ? 1 : state === null ? 2 : 3;

  const handleYearClick = (y: number) => router.push(`/stats?year=${y}`);
  const handleStateClick = (s: string) =>
    router.push(`/stats?year=${year}&state=${encodeURIComponent(s)}`);
  const handleBackToAnnual = () => router.push("/stats");
  const handleBackToState = () => router.push(`/stats?year=${year}`);

  const cardGradient =
    level === 1
      ? "bg-gradient-to-r from-sky-500 to-cyan-500"
      : level === 2
        ? "bg-gradient-to-r from-emerald-500 to-teal-500"
        : "bg-gradient-to-r from-amber-500 to-orange-500";

  const cardTitle =
    level === 1
      ? "Annual Sightings Summary"
      : level === 2
        ? `Sightings by State — ${year}`
        : `Sightings by County — ${state}, ${year}`;

  const cardSubtitle =
    level === 1
      ? "10-year view of Lazuli Bunting observations across North America"
      : level === 2
        ? `Click a state bar to drill down by county`
        : `All counties with recorded sightings in ${year}`;

  const CardIcon =
    level === 1 ? BarChart2 : level === 2 ? Map : MapPin;

  return (
    <main className="relative min-h-screen bg-background">
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

      {/* Page header */}
      <header className="relative z-10 bg-black">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20">
                <BarChart2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white md:text-2xl">
                  Sightings Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                  Explore historical eBird observations — drill down by year, state, and county
                </p>
              </div>
            </div>
            <SiteNav />
          </div>
        </div>
      </header>

      {/* Breadcrumb bar */}
      <div className="relative z-10 border-b border-border bg-gradient-to-r from-amber-50 via-sky-50 to-emerald-50">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          {level === 1 ? (
            <span className="text-sm font-medium text-foreground">All Years</span>
          ) : level === 2 ? (
            <>
              <button
                onClick={handleBackToAnnual}
                className="text-sm text-primary hover:underline"
              >
                All Years
              </button>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-foreground">{year}</span>
            </>
          ) : (
            <>
              <button
                onClick={handleBackToAnnual}
                className="text-sm text-primary hover:underline"
              >
                All Years
              </button>
              <span className="text-muted-foreground">/</span>
              <button
                onClick={handleBackToState}
                className="text-sm text-primary hover:underline"
              >
                {year}
              </button>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-foreground">{state}</span>
            </>
          )}
        </div>
      </div>

      {/* Chart card */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {/* Card header */}
          <div className={cn("px-6 py-4", cardGradient)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                  <CardIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{cardTitle}</h2>
                  <p className="text-sm text-white/80">{cardSubtitle}</p>
                </div>
              </div>
              {level > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={level === 2 ? handleBackToAnnual : handleBackToState}
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                  Back
                </Button>
              )}
            </div>
          </div>

          {/* Chart content */}
          <div className="p-6">
            {level === 1 ? (
              <AnnualSummaryChart onYearClick={handleYearClick} />
            ) : level === 2 && year !== null ? (
              <StateChart year={year} onStateClick={handleStateClick} />
            ) : year !== null && state !== null ? (
              <CountyChart year={year} state={state} />
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-8 border-t border-border bg-gradient-to-r from-sky-50 via-white to-amber-50">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Data based on historical eBird observations. Predictions are for
            planning purposes only.
          </p>
        </div>
      </footer>
    </main>
  );
}

// ─── Loading fallback ─────────────────────────────────────────────────────────

function StatsLoadingFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
    </main>
  );
}

// ─── Page export (Suspense wraps useSearchParams consumer) ────────────────────

export default function StatsPage() {
  return (
    <Suspense fallback={<StatsLoadingFallback />}>
      <StatsContent />
    </Suspense>
  );
}
