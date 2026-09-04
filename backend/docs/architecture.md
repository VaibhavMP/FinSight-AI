# FinSight AI — Architecture Document

## Overview

FinSight AI is a full-stack agentic RAG financial intelligence platform.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                      │
│  TypeScript + Vite + Tailwind + Framer Motion          │
│  Pages: Landing, Auth, Dashboard, Documents,          │
│  Chat, Compare, Insights, Settings                     │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTPS / REST API
┌─────────────────────────▼───────────────────────────────┐
│                    FastAPI Backend                      │
│  app/                                                    │
│  ├── api/      — REST endpoints (auth, docs, chat)      │
│  ├── core/      — config, database, security, auth      │
│  ├── models/    — SQLAlchemy models (User, Document...)  │
│  ├── schemas/   — Pydantic request/response models      │
│  ├── documents/ — PDF/DOCX/TXT loading, chunking       │
│  ├── embeddings/ — Cohere/HF embedding factory         │
│  ├── indexing/  — Chroma vector store wrapper          │
│  ├── rag/       — Query classifier, reformulation,     │
│  │                 RAG agent                          │
│  ├── financial/ — Metric extraction, risk analysis     │
│  └── services/  — Orchestration (RAGService)           │
└─────────────────────────┬───────────────────────────────┘
             │           │                         │
┌────────────▼──┐ ┌──────▼────────┐ ┌────────────▼──────┐
│     MySQL     │ │    Chroma     │ │   LLM (Cohere)    │
│  users,docs,  │ │  Vector store  │ │  command-a-03-25 │
│  conversations │ │  document      │ │  embed-v4.0      │
│  messages      │ │  embeddings    │ │                  │
└───────────────┘ └────────────────┘ └──────────────────┘
```

## Component Migration from AgenticRAG

Components retained from the source project:

| Source File | FinSight AI | Enhancement |
|-------------|-------------|-------------|
| `src/rag_agent.py` | `app/rag/agent.py` | Added financial system prompt, multi-document support |
| `src/chunking.py` | `app/documents/chunking.py` | Tuned chunk sizes for financial documents |
| `src/data_loading.py` | `app/documents/data_loading.py` | Added DOCX and TXT support, section detection |
| `src/indexing.py` | `app/indexing/vector_store.py` | Per-document collections for multi-doc comparison |
| `src/embeddings/cohere_embeddings.py` | `app/embeddings/cohere_embeddings.py` | Same interface |
| `src/llms/cohere_llm.py` | `app/llms/cohere_llm.py` | Same interface |
| `src/memory` (in rag_agent.py) | `app/rag/agent.py` | Retained ConversationBufferMemory |

## Agent Routing

```
User Query
   │
   ▼
Query Classifier
   │
   ├─ Casual → LLM (no retrieval)
   ├─ RAG → Reformulate → Retrieve → LLM → Answer + Citations
   ├─ Analysis → Reformulate → Retrieve → Analyze → LLM → Explanation + Citations
   ├─ Comparison → Retrieve from multiple docs → Compare → Table + Charts + Citations
   ├─ Risk → Retrieve → Classify → Structured risk list + Citations
   └─ Metrics → Retrieve → Extract → Structured metrics table + Citations
```

## Data Flow

1. User uploads PDF → Backend saves to disk → DocumentProcessor runs:
   - PyMuPDFLoader extracts text per page
   - Metadata enrichment (document_id, filename, page_number, section, company)
   - RecursiveCharacterTextSplitter creates chunks
   - Cohere/HF embeddings generated
   - Chunks added to Chroma collection (`doc_{id}`)
   - Processing status updated in MySQL
2. User asks question → Chat endpoint:
   - Query classified into mode
   - Optional reformulation using chat history
   - MMR retrieval from relevant document collections
   - LLM generates grounded answer
   - Citations extracted from retrieved chunks
   - Conversation + message saved to MySQL

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens for authentication (7-day expiry)
- Protected routes via FastAPI dependency injection
- File validation (type, size limits)
- CORS configured
- No API keys in frontend
- `.env` excluded from git
