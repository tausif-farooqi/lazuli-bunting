"""
Lazuli Bunting Tracker — FastAPI backend.
"""
import os
import re
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Load .env
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app = FastAPI(
    title="Lazuli Bunting Tracker API",
    description="Predictions from eBird seasonal hotspots"
)

# Vercel Fix: Allow all origins so the Next.js frontend can connect in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env")
    return create_client(url, key)

def _slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-") or "hotspot"

@app.get("/api/predictions")
def get_predictions(
    latitude: float = Query(..., description="User latitude"),
    longitude: float = Query(..., description="User longitude"),
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    radius_miles: float = Query(10.0, ge=0.1, le=50, description="Search radius in miles"),
    years_limit: int = Query(5, ge=1, le=20, description="Years of data to consider"),
) -> list[dict[str, Any]]:
    
    # 1. Stateless Supabase Call
    supabase = _get_supabase()
    try:
        response = (
            supabase.rpc(
                "get_seasonal_hotspots",
                {
                    "user_lat": latitude,
                    "user_lon": longitude,
                    "target_month": month,
                    "radius_miles": radius_miles,
                    "years_limit": years_limit,
                },
            ).execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")
    
    rows = response.data or []

    # 2. Format Response for Frontend
    results: list[dict[str, Any]] = []
    for row in rows:
        locality = row.get("locality") or "Unknown"
        results.append({
            "location": {
                "id": _slug(locality),
                "name": locality,
                "region": row.get("location_full") or "",
                "latitude": float(row.get("latitude", 0)) if "latitude" in row else 0,
                "longitude": float(row.get("longitude", 0)) if "longitude" in row else 0,
                "baseSightings": row.get("total_sightings", 0),
                "habitat": "eBird hotspot",
            },
            "distance": float(row.get("distance_miles", 0)),
            "totalSightings": int(row.get("total_sightings", 0)),
            "reliabilityScore": min(
                99, int(round(float(row.get("reliability_score", 0))))
            ),
        })
    return results

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}