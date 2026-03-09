"use client";

import { useState } from "react";
import { PredictionForm } from "@/components/prediction-form";
import { ResultsList } from "@/components/results-list";
import { BirdInfoCard } from "@/components/bird-info-card";
import { usePredictions } from "@/hooks/use-predictions";
import { toast } from "@/hooks/use-toast";
import { Bird, Search, MapPin, Binoculars } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [searchMonth, setSearchMonth] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const { getPredictions, results, isLoading } = usePredictions();

  const handleSubmit = async (data: {
    years: number;
    month: number;
    latitude: number;
    longitude: number;
  }) => {
    setSearchMonth(data.month);
    try {
      const predictions = await getPredictions({
        latitude: data.latitude,
        longitude: data.longitude,
        month: data.month,
        years: data.years,
      });
      setHasSearched(true);
      if (predictions.length === 0) {
        toast({
          title: "No hotspots found",
          description:
            "Try a larger radius, different month, or another location.",
          variant: "destructive",
        });
      }
    } catch {
      setHasSearched(true);
      toast({
        title: "Could not load predictions",
        description:
          "The server may be offline or the request failed. Check that the backend is running on port 8000.",
        variant: "destructive",
      });
    }
  };

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
      {/* Header */}
      <header className="relative z-10 bg-black">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/20">
              <Bird className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Lazuli Bunting Finder
              </h1>
              <p className="mt-1 text-gray-400">
                Predict sighting locations across North America
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Feature highlights bar */}
      <div className="relative z-10 border-b border-border bg-gradient-to-r from-amber-50 via-sky-50 to-emerald-50">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-8 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="rounded-full bg-sky-100 p-1">
              <Binoculars className="h-4 w-4 text-sky-600" />
            </div>
            <span>Historical sighting data</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <div className="rounded-full bg-amber-100 p-1">
              <MapPin className="h-4 w-4 text-amber-600" />
            </div>
            <span>Distance calculations</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
            <div className="rounded-full bg-emerald-100 p-1">
              <Search className="h-4 w-4 text-emerald-600" />
            </div>
            <span>Reliability scoring</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          {/* Left Column - Form */}
          <aside className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                    <Search className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Search Parameters
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <PredictionForm onSubmit={handleSubmit} isLoading={isLoading} />
              </div>
            </div>

            <BirdInfoCard />
          </aside>

          {/* Right Column - Results */}
          <section className="min-h-[400px]">
            {isLoading ? (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-12">
                <div className="relative">
                  <div className="h-20 w-20 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-sky-100 p-2">
                      <Bird className="h-6 w-6 animate-pulse text-sky-600" />
                    </div>
                  </div>
                </div>
                <p className="mt-6 font-medium text-foreground">
                  Analyzing historical sighting data...
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Searching hotspots across western North America
                </p>
              </div>
            ) : hasSearched && results.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">
                          Top Predicted Locations
                        </h2>
                        <p className="text-sm text-emerald-100">
                          {results.length} hotspots found
                        </p>
                      </div>
                    </div>
                    <div className="rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur-sm">
                      Sorted by probability
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <ResultsList results={results} month={searchMonth} />
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-200 bg-gradient-to-br from-sky-50/50 via-white to-amber-50/50 p-12 text-center">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-sky-100/50 blur-xl" />
                  <div className="relative rounded-full bg-gradient-to-br from-sky-100 to-amber-100 p-6">
                    <Bird className="h-12 w-12 text-sky-600" />
                  </div>
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  Ready to find Lazuli Buntings
                </h3>
                <p className="mt-3 max-w-sm text-muted-foreground">
                  Enter your location and search parameters to discover the best
                  spots for observing these beautiful songbirds in your area. The 
                  results are based on historical eBird observations of Lazuli Buntings
                  from 2016 to 2026.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                    Bright blue plumage
                  </span>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                    Orange-rust breast
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                    Melodious song
                  </span>
                </div>
              </div>
            )}
          </section>
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
