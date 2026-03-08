-- These objects were created manually using the Supabase UI.

-- Table: public.lazuli_bunting

-- DROP TABLE IF EXISTS public.lazuli_bunting;

CREATE TABLE IF NOT EXISTS public.lazuli_bunting
(
    id character varying COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    observed_count bigint,
    country_code character varying COLLATE pg_catalog."default",
    state character varying COLLATE pg_catalog."default",
    county character varying COLLATE pg_catalog."default",
    locality character varying COLLATE pg_catalog."default",
    locality_id character varying COLLATE pg_catalog."default",
    latitude numeric,
    longitude numeric,
    observation_date date,
    observation_time time without time zone,
    observer character varying COLLATE pg_catalog."default",
    comments text COLLATE pg_catalog."default",
    common_name character varying COLLATE pg_catalog."default",
    checklist_id character varying COLLATE pg_catalog."default",
    geom geography(Point,4326),
    CONSTRAINT lazuli_bunting_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.lazuli_bunting
    OWNER to postgres;

ALTER TABLE IF EXISTS public.lazuli_bunting
    ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.lazuli_bunting TO anon;

GRANT ALL ON TABLE public.lazuli_bunting TO authenticated;

GRANT ALL ON TABLE public.lazuli_bunting TO postgres;

GRANT ALL ON TABLE public.lazuli_bunting TO service_role;

COMMENT ON TABLE public.lazuli_bunting
    IS 'Lazuli Bunting sightings from eBird (2016 to 2026)';
-- Index: idx_lazuli_geom_gist

-- DROP INDEX IF EXISTS public.idx_lazuli_geom_gist;

CREATE INDEX IF NOT EXISTS idx_lazuli_geom_gist
    ON public.lazuli_bunting USING gist
    (geom)
    WITH (fillfactor=90, buffering=auto)
    TABLESPACE pg_default;
-- Index: idx_lazuli_observation_date

-- DROP INDEX IF EXISTS public.idx_lazuli_observation_date;

CREATE INDEX IF NOT EXISTS idx_lazuli_observation_date
    ON public.lazuli_bunting USING btree
    (observation_date DESC NULLS FIRST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;
-- Index: idx_lazuli_observation_month

-- DROP INDEX IF EXISTS public.idx_lazuli_observation_month;

CREATE INDEX IF NOT EXISTS idx_lazuli_observation_month
    ON public.lazuli_bunting USING btree
    (EXTRACT(month FROM observation_date) ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE OR REPLACE FUNCTION get_seasonal_hotspots(
    user_lat FLOAT, 
    user_lon FLOAT, 
    target_month INT, 
    radius_miles FLOAT DEFAULT 10.0,
    years_limit INT DEFAULT 5
)
RETURNS TABLE (
    locality TEXT,
    location_full TEXT, -- New: Concatenated County, State
    distance_miles NUMERIC,
    total_sightings BIGINT,
    years_present BIGINT,
    reliability_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.locality::TEXT,
        -- Concatenate County and State (e.g., "Alameda, CA")
        (MAX(s.county) || ', ' || MAX(s.state))::TEXT as location_full,
        ROUND((ST_Distance(s.geom, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography) / 1609.34)::numeric, 2) as distance_miles,
        COUNT(*) as total_sightings,
        COUNT(DISTINCT EXTRACT(YEAR FROM s.observation_date)) as years_present,
        -- Weighted Reliability Score
        ROUND(
            (COUNT(*) * 0.4) + 
            (COUNT(DISTINCT EXTRACT(YEAR FROM s.observation_date)) * 10 * 0.6), 
            2
        ) as reliability_score
    FROM public.lazuli_bunting s
    WHERE 
        s.observation_date >= (CURRENT_DATE - (years_limit || ' years')::interval)
        AND EXTRACT(MONTH FROM s.observation_date) = target_month
        AND ST_DWithin(s.geom, ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography, radius_miles * 1609.34)
    GROUP BY s.locality, s.geom
    ORDER BY reliability_score DESC;
END;
$$ LANGUAGE plpgsql;