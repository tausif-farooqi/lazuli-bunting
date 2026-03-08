# Lazuli Bunting API

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
