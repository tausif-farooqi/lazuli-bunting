"use client";

import { useState, useCallback } from "react";

import { getApiBaseUrl } from "@/lib/api-base";

const API_BASE = getApiBaseUrl();

export interface AnnualSummaryRow {
  obs_year: number;
  total_sightings: number;
}

export interface StateSummaryRow {
  state: string;
  total_sightings: number;
}

export interface CountySummaryRow {
  county: string;
  total_sightings: number;
}

export function useAnnualSummary() {
  const [data, setData] = useState<AnnualSummaryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/stats/annualsummary`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as AnnualSummaryRow[];
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load annual summary");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { load, data, isLoading, error };
}

export function useStateStats() {
  const [data, setData] = useState<StateSummaryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (year: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_BASE}/api/stats/state`);
      url.searchParams.set("year", String(year));
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as StateSummaryRow[];
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load state stats");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { load, data, isLoading, error };
}

export function useCountyStats() {
  const [data, setData] = useState<CountySummaryRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (state: string, year: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_BASE}/api/stats/counties`);
      url.searchParams.set("state", state);
      url.searchParams.set("year", String(year));
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as CountySummaryRow[];
      setData(Array.isArray(json) ? json : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load county stats");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { load, data, isLoading, error };
}
