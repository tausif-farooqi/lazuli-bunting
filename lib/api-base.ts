/** Base URL for the FastAPI backend (no trailing slash). Avoids `//api` when env ends with `/`. */
export function getApiBaseUrl(): string {
  const raw =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
      : "http://localhost:8000";
  return raw.replace(/\/+$/, "");
}
