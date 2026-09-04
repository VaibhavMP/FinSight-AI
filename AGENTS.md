# Agent Instructions

## Project Overview
FinSight AI — Local RAG-powered financial document analysis (no external API keys needed).

## Run Commands

### Backend (from `backend/`)
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (from `frontend/`)
```bash
npm run dev
```

### Tests (from `backend/`)
```bash
python -m pytest tests/ -q
```

### E2E Test (from `backend/`)
```bash
python test_e2e.py
```

## Environment
- No COHERE_API_KEY / OPENAI_API_KEY set → falls back to local HuggingFace GPT-2
- Local LLM is slow on CPU (~30-60s per response); RAG mode with retrieved context may timeout
- SQLite fallback used (no MySQL running locally)
- ChromaDB stores vectors in `backend/chroma_db/`

## Ports
- Frontend: http://localhost:5173
- Backend:  http://localhost:8000
- API Docs: http://localhost:8000/docs
