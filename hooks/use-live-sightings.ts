"use client";

import { useState, useCallback } from "react";

import { getApiBaseUrl } from "@/lib/api-base";

const API_BASE = getApiBaseUrl();

export interface LiveSighting {
  location: string;
  county: string;
  state: string;
  date: string;
  count: number;
  subIds: string[];
}

export interface LiveSightingsByState {
  [state: string]: LiveSighting[];
}

interface ApiResponse {
  metadata: {
    days_back: number;
    cached: boolean;
    generated_at: string;
  };
  data: LiveSightingsByState;
}

export function useLiveSightings() {
  const [data, setData] = useState<LiveSightingsByState>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (daysBack: number = 3) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/live-sightings?days_back=${daysBack}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as ApiResponse;
      setData(json?.data && typeof json.data === "object" ? json.data : {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load live sightings");
      setData({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { load, data, isLoading, error };
}
