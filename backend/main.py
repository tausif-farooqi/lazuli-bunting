"""
Lazuli Bunting Tracker — FastAPI backend.
GET /api/predictions calls Supabase get_seasonal_hotspots RPC and returns
results in the shape expected by frontend results-list.tsx (PredictionResult[]).
"""
import os
import re
from pathlib import Path
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
import asyncpg
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

# Load .env from repo root (parent of backend/)
load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def _get_db_url() -> str:
    url = os.environ.get("SUPABASE_DB_URL")
    if not url:
        raise ValueError("SUPABASE_DB_URL is not set in the environment")
    return url


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.pool = await asyncpg.create_pool(_get_db_url(), min_size=1, max_size=5)
    try:
        yield
    finally:
        await app.state.pool.close()


app = FastAPI(
    title="Lazuli Bunting Tracker API",
    description="Predictions from eBird seasonal hotspots",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def _slug(s: str) -> str:
    """Stable id from locality name."""
    return re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-") or "hotspot"


@app.get("/api/predictions")
async def get_predictions(
    latitude: float = Query(..., description="User latitude"),
    longitude: float = Query(..., description="User longitude"),
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    radius_miles: float = Query(10.0, ge=0.1, le=10, description="Search radius in miles"),
    years_limit: int = Query(5, ge=1, le=20, description="Years of data to consider"),
) -> list[dict[str, Any]]:
    """
    Returns seasonal hotspot predictions for Lazuli Bunting.
    Response shape matches frontend PredictionResult[] (location, distance, totalSightings, reliabilityScore).
    """
    pool: asyncpg.Pool = app.state.pool
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT locality, location_full, distance_miles, total_sightings, years_present, reliability_score "
            "FROM get_seasonal_hotspots($1, $2, $3, $4, $5)",
            latitude,
            longitude,
            month,
            radius_miles,
            years_limit,
        )

    # Map RPC columns to the TypeScript PredictionResult / SightingLocation interface
    results: list[dict[str, Any]] = []
    for row in rows:
        locality = row["locality"] or "Unknown"
        results.append({
            "location": {
                "id": _slug(locality),
                "name": locality,
                "region": row["location_full"] or "",
                "latitude": 0,
                "longitude": 0,
                "baseSightings": row["total_sightings"],
                "habitat": "eBird hotspot",
            },
            "distance": float(row["distance_miles"]),
            "totalSightings": int(row["total_sightings"]),
            "reliabilityScore": min(99, int(round(float(row["reliability_score"])))),
        })
    return results


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
