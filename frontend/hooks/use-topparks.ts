"use client";

import { useState, useCallback } from "react";

const API_BASE =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
    : "http://localhost:8000";

export interface TopParkRow {
  locality: string;
  county: string;
  state: string;
  total_observed: number;
  latitude: number;
  longitude: number;
}

export function useTopParks() {
  const [data, setData] = useState<TopParkRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/stats/topparks`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as TopParkRow[];
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load top parks");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { load, data, isLoading, error };
}
