import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

# Load credentials from .env file
load_dotenv()
DB_URL = os.getenv("SUPABASE_DB_URL")

if not DB_URL:
    raise ValueError("DB_URL not found in .env file!")

def pump_data(file_path):
    # Read the TSV (eBird data is usually tab-separated)
    # We use usecols to only bring in the columns we actually want
    target_cols = ['GLOBAL_UNIQUE_IDENTIFIER', 'OBSERVATION_COUNT', 'COUNTRY_CODE', 'STATE', 'COUNTY', 
                   'LOCALITY', 'LOCALITY_ID', 'LATITUDE', 'LONGITUDE', 'OBSERVATION_DATE', 'TIME_OBSERVATIONS_STARTED', 
                   'OBSERVER_ID', 'SPECIES_COMMENTS', 'COMMON_NAME', 'SAMPLING_EVENT_IDENTIFIER']
    
    print(f"Reading {file_path}...")
    df = pd.read_csv(file_path, sep='\t', usecols=target_cols)

    # Use a MAPPING DICTIONARY for mapping the file column names to the DB column names.
    col_map = {
        'GLOBAL_UNIQUE_IDENTIFIER': 'id',
        'OBSERVATION_COUNT': 'observed_count',
        'COUNTRY_CODE': 'country_code',
        'STATE': 'state',
        'COUNTY': 'county',
        'LOCALITY': 'locality',
        'LOCALITY_ID': 'locality_id',
        'LATITUDE': 'latitude',
        'LONGITUDE': 'longitude',
        'OBSERVATION_DATE': 'observation_date',
        'TIME_OBSERVATIONS_STARTED': 'observation_time',
        'OBSERVER_ID': 'observer',
        'SPECIES_COMMENTS': 'comments',
        'COMMON_NAME': 'common_name',
        'SAMPLING_EVENT_IDENTIFIER': 'checklist_id'
    }

    # Rename using the map
    df = df.rename(columns=col_map)
    
    # Handle 'X' in counts (eBird uses 'X' when a bird was present but not counted)
    df['observed_count'] = pd.to_numeric(df['observed_count'], errors='coerce').fillna(1)
    df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
    df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')

    # Connect and Upload
    engine = create_engine(DB_URL)
    print("Uploading to Supabase...")
    df.to_sql('lazuli_bunting', engine, if_exists='append', index=False, chunksize=1000)
    print("Success! Data is live.")

if __name__ == "__main__":
    pump_data('./raw_data/ebd_US_lazbun_201601_202603_relJan-2026.tsv')