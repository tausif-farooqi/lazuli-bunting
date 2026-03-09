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

CREATE OR REPLACE FUNCTION public.get_seasonal_hotspots(
    user_lat double precision,
    user_lon double precision,
    target_month integer,
    radius_miles double precision DEFAULT 10.0,
    years_limit integer DEFAULT 5)
    RETURNS TABLE(
        locality text, 
        location_full text, 
        distance_miles numeric, 
        total_sightings bigint, 
        years_present bigint, 
        reliability_score numeric
    ) 
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
    ROWS 1000
    SET search_path=public, extensions
AS $BODY$
BEGIN
    RETURN QUERY
    WITH sightings_with_weights AS (
        -- 1. Apply a decay weight to each sighting based on how many years ago it occurred.
        -- 2026 (current year) = 1.0, 2025 = 0.8, 2024 = 0.64, etc.
        SELECT 
            s.locality,
            s.county,
            s.state,
            s.geom,
            s.observation_date,
            POWER(0.8, EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM s.observation_date)) as recency_weight
        FROM public.lazuli_bunting s
        WHERE 
            s.observation_date >= (CURRENT_DATE - (years_limit || ' years')::interval)
            AND EXTRACT(MONTH FROM s.observation_date) = target_month
            AND ST_DWithin(
                s.geom, 
                ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography, 
                radius_miles * 1609.34
            )
    )
    SELECT 
        sw.locality::TEXT,
        (MAX(sw.county) || ', ' || MAX(sw.state))::TEXT as location_full,
        ROUND(
            (ST_Distance(
                sw.geom, 
                ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
            ) / 1609.34)::numeric, 
            2
        ) as distance_miles,
        COUNT(*) as total_sightings,
        COUNT(DISTINCT EXTRACT(YEAR FROM sw.observation_date)) as years_present,
        -- 2. New Weighted Score:
        -- (Sum of weights * 5) adds volume but favors recent years.
        -- (Years present * 10) rewards consistent annual return.
        -- Capped at 100.0.
        LEAST(100.0, ROUND(
            (SUM(sw.recency_weight) * 5) + 
            (COUNT(DISTINCT EXTRACT(YEAR FROM sw.observation_date)) * 10), 
            2
        ))::numeric as reliability_score
    FROM sightings_with_weights sw
    GROUP BY sw.locality, sw.geom
    ORDER BY reliability_score DESC, distance_miles ASC;
END;
$BODY$;

ALTER FUNCTION public.get_seasonal_hotspots(double precision, double precision, integer, double precision, integer)
    OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.get_seasonal_hotspots(double precision, double precision, integer, double precision, integer) TO PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_seasonal_hotspots(double precision, double precision, integer, double precision, integer) TO anon;

GRANT EXECUTE ON FUNCTION public.get_seasonal_hotspots(double precision, double precision, integer, double precision, integer) TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_seasonal_hotspots(double precision, double precision, integer, double precision, integer) TO postgres;

GRANT EXECUTE ON FUNCTION public.get_seasonal_hotspots(double precision, double precision, integer, double precision, integer) TO service_role;