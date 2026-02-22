# PreventAI FastAPI Backend

## Setup
```powershell
cd C:\Users\hp\preventai-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements-fastapi.txt
```

## Environment
```powershell
Copy-Item .env.fastapi.example .env -Force
```

Set `GROQ_API_KEY` in `.env`.

## Run
```powershell
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

## Tests
```powershell
pytest -q tests_fastapi
```

## API Endpoints
- `GET /`
- `GET /api/test`
- `GET /api/health`
- `POST /api/analyze/adult`
- `POST /api/analyze/pregnant`
