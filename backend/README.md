# Lazuli Bunting API

Uses the **Supabase REST/PostgREST** client (no direct Postgres connection or connection pooling).

## Environment

In `.env` (repo root) set:

- **SUPABASE_URL** — Project URL (e.g. `https://xxxx.supabase.co`)
- **SUPABASE_SERVICE_KEY** or **SUPABASE_ANON_KEY** — Project API key (Settings → API in Supabase dashboard)

## Run

From repo root (so `.env` is found):

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Windows:** If you get `PermissionError` on `virtual_file.log`, the `--reload` file watcher is the cause. Omit `--reload` (command above). Restart the server manually after code changes.

**With auto-reload** (Unix, or Windows from a path that doesn’t trigger the watcher bug):

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000  
- Docs: http://localhost:8000/docs  
- Health: http://localhost:8000/health  
