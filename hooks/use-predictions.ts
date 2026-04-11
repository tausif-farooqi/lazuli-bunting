"use client";

import { useState, useCallback } from "react";
import { getApiBaseUrl } from "@/lib/api-base";
import type { PredictionResult } from "@/lib/mock-sightings";

const API_BASE = getApiBaseUrl();

export interface PredictionParams {
  latitude: number;
  longitude: number;
  month: number;
  years: number;
  radiusMiles?: number;
}

export function usePredictions() {
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPredictions = useCallback(async (params: PredictionParams) => {
    setError(null);
    setIsLoading(true);
    const radius = params.radiusMiles ?? 10;
    const url = new URL(`${API_BASE}/api/predictions`);
    url.searchParams.set("latitude", String(params.latitude));
    url.searchParams.set("longitude", String(params.longitude));
    url.searchParams.set("month", String(params.month));
    url.searchParams.set("radius_miles", String(radius));
    url.searchParams.set("years_limit", String(params.years));

    try {
      const res = await fetch(url.toString());
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as PredictionResult[];
      setResults(Array.isArray(data) ? data : []);
      return data;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not reach the predictions API.";
      setError(message);
      setResults([]);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { getPredictions, results, isLoading, error };
}
