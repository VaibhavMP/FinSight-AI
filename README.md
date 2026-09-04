# FinSight AI

# Agentic RAG-Based Financial Document Intelligence & Analysis Platform

> **FinSight AI** is an agentic RAG-powered financial intelligence platform that enables
> users to upload financial documents, ask context-aware questions, analyze financial
> performance, compare multiple reports, extract risks and insights, and receive
> evidence-backed answers with document-level citations.

---

## 🚀 Quick Start

### Local (No API Keys Required)

FinSight AI works out-of-the-box locally **without any external API keys**. When no
`COHERE_API_KEY` is set, the platform automatically falls back to a local HuggingFace
GPT-2 model for generation and `all-mpnet-base-v2` for embeddings.

```bash
# Clone the repository
git clone https://github.com/VaibhavMP/FinSight-AI.git
cd FinSight-AI

# No .env needed for local-first mode — just run:
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &

cd ../frontend
npm install --legacy-peer-deps
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

> First GPT-2 invocation may take 30–60 s on CPU (model is cached after first load).
> For production-quality, fast responses, set `COHERE_API_KEY` in `.env`.

### Docker (Recommended for Production)

```bash
cp .env.example .env
# Edit .env with your API keys and database credentials
docker compose up --build
```

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Architecture](#-architecture)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Local Development](#-local-development)
- [RAG Pipeline](#-rag-pipeline)
- [Agent Architecture](#-agent-architecture)
- [Financial Analysis](#-financial-analysis)
- [Database Architecture](#-database-architecture)
- [API Endpoints](#-api-endpoints)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Docker](#-docker)
- [Testing](#-testing)
- [Financial Disclaimer](#-financial-disclaimer)
- [Credits & Attribution](#-credits--attribution)

---

## 🔍 Overview

Financial reports contain vast amounts of information distributed across hundreds of
pages. Analysts, investors, and researchers manually search for:

- Revenue, profit, expenses, debt, assets, liabilities, cash flow
- Risks, management commentary, growth prospects, financial ratios
- Future outlook and strategic initiatives

**FinSight AI** allows users to upload financial documents (PDF, DOCX, TXT) and
interact with them naturally using an AI financial research agent. The agent:

1. Classifies the query type (casual, RAG, analysis, comparison, risk, metrics)
2. Reformulates follow-up questions using conversation memory
3. Retrieves relevant evidence from a Chroma vector database
4. Generates grounded answers with document-level citations
5. Extracts financial metrics and classifies risks

This project is a transformation of the open-source
[AgenticRAG](https://github.com/MohammedAly22/AgenticRAG) project,
rebuilt as a full-stack financial intelligence platform with React frontend,
FastAPI backend, and MySQL database.

---

## 🎯 Problem Statement

Financial reports contain huge amounts of information distributed across hundreds of
pages. Users often need to manually search for:

- Revenue
- Profit
- Expenses
- Debt
- Assets
- Liabilities
- Cash Flow
- Risks
- Management Commentary
- Growth
- Financial Ratios
- Future Outlook

**FinSight AI** solves this by allowing users to upload documents and interact with
them naturally using an AI financial research agent.

---

## 🏗️ Architecture

```
                        FINSIGHT AI
                          │
                          ▼
        ┌───────────────────────────────┐
        │       React Frontend          │
        │    TypeScript + Vite          │
        │   Tailwind + Framer Motion    │
        └─────────────┬─────────────────┘
                      │ REST API
                      ▼
        ┌───────────────────────────────┐
        │       FastAPI Backend          │
        └─────────────┬─────────────────┘
                      │
        ┌─────────────┼──────────────────┐
        │             │                   │
        ▼             ▼                    ▼
     MySQL       Agentic RAG          Financial
   Database        Engine            Analysis
        │             │                   │
        │             ▼                   │
        │          Chroma DB             │
        │             │                  │
        │             ▼                  │
        │             LLM                │
        │                                │
        └──────────────┬─────────────────┘
                       ▼
                Final Response
                       │
                       ▼
                Citations + Evidence
```

### Component Layers

| Layer | Technology | Responsibility |
|-------|-----------|----------------|
| Frontend | React, TypeScript, Vite | UI, state management, animations |
| API | FastAPI, Pydantic | REST endpoints, validation, auth |
| Auth | JWT, bcrypt | Authentication and authorization |
| ORM | SQLAlchemy | MySQL database ORM |
| Memory | ConversationBufferMemory | Conversational context retention |
| Router | Query Classification | Routes queries to appropriate mode |
| Retrieval | Chroma, MMR | Vector similarity search |
| Embeddings | Cohere `embed-english-v3-0` or HuggingFace `all-mpnet-base-v2` | Text embeddings |
| Generation | Cohere `ChatCohere` or local `GPT-2` via HuggingFacePipeline | LLM response generation |
| Storage | MySQL, Chroma | Structured data + vectors |

---

## ✨ Features

### Core
- ✅ Agentic RAG with intelligent query routing
- ✅ Conversational memory (follow-up questions)
- ✅ Query reformulation for context-aware retrieval
- ✅ Document-level citations with page numbers and sections
- ✅ Multi-document comparison
- ✅ Financial metric extraction
- ✅ AI-powered risk classification
- ✅ JWT authentication with bcrypt
- ✅ Responsive React frontend with night-sky UI
- ✅ Animated AI agent visualization
- ✅ Docker deployment

### Financial Analysis
- ✅ Revenue, EBITDA, Net Income, EPS extraction
- ✅ Balance sheet items (assets, liabilities, debt, equity)
- ✅ Cash flow analysis (operating, free cash flow)
- ✅ Margin calculations (operating, net)
- ✅ Risk classification (Financial, Operational, Market, Regulatory, Liquidity, Debt, Strategic)
- ✅ Multi-document comparison with charts
- ✅ Financial metrics dashboard

### Supported Documents
- ✅ PDF (primary — Annual Reports, Quarterly Reports, etc.)
- ✅ DOCX (Investor Presentations, Research Reports)
- ✅ TXT (Earnings Call Transcripts, Notes)

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Lucide React | Icons |
| Recharts | Data visualization |
| Axios | HTTP client |
| React Router | Client-side routing |

### Backend
| Technology | Purpose |
|-----------|---------|
| Python 3.12+ | Language |
| FastAPI | API framework |
| Pydantic | Data validation |
| SQLAlchemy | ORM |
| PyMySQL | MySQL driver |
| JWT (python-jose) | Authentication |
| bcrypt | Password hashing |
| LangChain | RAG framework |
| Chroma | Vector database |
| Cohere | LLM + embeddings |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| MySQL 8.0 | Structured data |
| Chroma | Vector embeddings |
| Docker | Containerization |
| Docker Compose | Orchestration |

### LLM Providers
| Provider | Default | Notes |
|---------|---------|-------|
| Cohere (cloud) | Production | Fast, high-quality responses. Requires `COHERE_API_KEY` |
| HuggingFace GPT-2 | Local fallback | Runs on CPU, no API key needed. Slower (~30–60 s/response) |

---

## 🏠 Local Development

### Running Without API Keys

FinSight AI can run entirely locally without Cohere or OpenAI API keys. In this mode:

- **LLM**: HuggingFace GPT-2 (`gpt2`) via `HuggingFacePipeline` — CPU-only, first call ~30–60 s
- **Embeddings**: HuggingFace `all-mpnet-base-v2`
- **Database**: SQLite fallback (`finsight_dev.db`) when MySQL is unavailable
- **Vector Store**: ChromaDB (local, persists to `backend/chroma_db/`)

```bash
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend (separate terminal)
cd ../frontend
npm install --legacy-peer-deps
npm run dev
```

Then run the end-to-end test:

```bash
cd ../backend
python test_e2e.py
```

---

## 🔬 RAG Pipeline

```
Financial Document
       ↓
Text Extraction (PyMuPDF)
       ↓
Document Cleaning
       ↓
Page Detection
       ↓
Chunking (RecursiveCharacterTextSplitter)
       ↓
Metadata Enrichment (document_id, filename, company, page, section)
       ↓
Embeddings (Cohere / HuggingFace all-mpnet-base-v2)
        ↓
Chroma Vector Store
        ↓
Query Reformulation (if follow-up)
        ↓
MMR Retriever
        ↓
Relevant Context
        ↓
LLM (ChatCohere / local GPT-2)
        ↓
Grounded Answer
        ↓
Citations
```

---

## 🤖 Agent Architecture

### Query Router

The AI agent classifies each user query into one of six modes:

| Mode | Trigger | Action |
|------|---------|--------|
| **Casual** | "Hello", "Thanks" | Natural response without retrieval |
| **RAG** | "What was the revenue in FY2025?" | Retrieve + answer with citations |
| **Analysis** | "Why did profitability decline?" | Retrieve + analyze relationships + explain |
| **Comparison** | "Compare Apple and Microsoft" | Multi-document retrieval + comparison table |
| **Risk** | "What are the major risks?" | Retrieve + classify risks |
| **Metrics** | "Show financial metrics" | Extract structured financial data |

### Conversation Memory

Uses LangChain's `ConversationBufferMemory` to retain context across turns.
Follow-up questions like "What about the previous year?" are reformulated
internally before retrieval.

### Query Reformulation

When a follow-up depends on prior context, an LLM reformulates it into a
self-contained query. The original chain-of-thought is **not** exposed to users —
only a safe activity trace is shown.

### Activity Trace (Safe)

```
✓ Understanding query
✓ Selecting relevant documents
✓ Searching financial evidence
✓ Evaluating sources
✓ Generating grounded response
```

---

## 📊 Financial Analysis

### Extractable Metrics

| Metric | Description |
|--------|-------------|
| Revenue | Total revenue / turnover |
| Revenue Growth | Year-over-year change |
| Gross Profit | Revenue minus COGS |
| Operating Income | EBIT |
| Operating Margin | Operating income / revenue |
| EBITDA | Earnings before interest, taxes, depreciation, amortization |
| Net Income | Bottom-line profit |
| Net Profit Margin | Net income / revenue |
| EPS | Earnings per share |
| Assets | Total assets |
| Liabilities | Total liabilities |
| Debt | Total debt obligations |
| Equity | Shareholders' equity |
| Cash Flow | Net cash flow |
| Operating Cash Flow | Cash from operations |
| Free Cash Flow | Operating cash flow minus capex |

### Risk Classification

| Category | Description |
|----------|-------------|
| Financial Risk | Debt, liquidity, credit risks |
| Operational Risk | Business operations, supply chain |
| Market Risk | Competitive, pricing, demand risks |
| Regulatory Risk | Compliance, legal, regulatory exposure |
| Liquidity Risk | Cash flow, short-term obligations |
| Debt Risk | Borrowing, interest rate exposure |
| Strategic Risk | Competition, market position, reputation |

---

## 🗄 Database Architecture

### MySQL (Structured Data)

| Table | Description |
|-------|-------------|
| `users` | User accounts, password hashes, roles |
| `documents` | Uploaded document metadata, processing status |
| `conversations` | Chat conversation metadata |
| `messages` | Individual messages in conversations |

**Note**: PostgreSQL is **not** used in this project. All structured data
is stored in MySQL.

### Chroma (Vector Data)

- Stores document chunks as vector embeddings
- Each document gets a dedicated collection (`doc_{id}`)
- Embeddings are NOT stored in MySQL — only metadata references

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, return JWT |
| GET | `/api/health` | Health check |
| GET | `/api/documents` | List user's documents |
| POST | `/api/documents/upload` | Upload a document |
| POST | `/api/documents/{id}/process` | Process document (extract, chunk, embed, index) |
| DELETE | `/api/documents/{id}` | Delete document |
| GET | `/api/conversations` | List user's conversations |
| POST | `/api/conversations` | Create conversation |
| GET | `/api/conversations/{id}/messages` | Get conversation messages |
| POST | `/api/chat` | Send a query to the AI agent |
| POST | `/api/compare` | Compare multiple documents |

### Chat Response Schema

```json
{
  "answer": "Revenue increased by 12% during FY2025...",
  "agent_mode": "rag",
  "sources": [
    {
      "document": "Annual Report 2025.pdf",
      "page": 42,
      "section": "Consolidated Income Statement",
      "excerpt": "...",
      "document_id": 1,
      "company": "Apple Inc."
    }
  ],
  "metrics": [],
  "conversation_id": 5,
  "reasoning_steps": null
}
```

---

## ⚙️ Installation

### Prerequisites

- Python 3.12+
- Node.js 20+
- Cohere API key (optional — local GPT-2 fallback works without it)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

> No `.env` file required — the app auto-detects missing API keys and falls back
> to local HuggingFace models and SQLite.

### Frontend Setup

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `MYSQL_HOST` | MySQL host (default: `localhost`) — set to empty to use SQLite |
| `MYSQL_PORT` | MySQL port (default: `3306`) |
| `MYSQL_USER` | MySQL user (default: `finsight`) |
| `MYSQL_PASSWORD` | MySQL password |
| `MYSQL_DATABASE` | MySQL database name |
| `JWT_SECRET_KEY` | Secret key for JWT signing |
| `COHERE_API_KEY` | **Optional** — Cohere API key for LLM + embeddings. Falls back to local GPT-2 |
| `LLM_PROVIDER` | `cohere` or `local` (auto-detected if `COHERE_API_KEY` not set) |
| `LLM_MODEL` | LLM model name |
| `EMBEDDING_PROVIDER` | Embedding provider |
| `CHROMA_PERSIST_DIRECTORY` | Chroma DB persistence path |

---

## 🐳 Docker

```bash
# Start all services
docker compose up --build

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Run backend only
docker compose up backend mysql
```

Services:
- **frontend**: Nginx serving React app on port 5173→80
- **backend**: FastAPI on port 8000
- **mysql**: MySQL 8.0 on port 3306

---

## 🧪 Testing

```bash
cd backend
python -m pytest tests/ -q
```

**31 tests passing** covering authentication, documents, chat routing, and query
classification.

### End-to-End Test

```bash
cd backend
python test_e2e.py
```

Validates the full stack: login → upload → process → chat:

| Step | Result |
|------|--------|
| Login | OK |
| Upload | Document indexed |
| Process | Chunks embedded & stored in Chroma |
| Casual chat | GPT-2 response generated |
| RAG chat | Retrieved context with citations |
| Risk chat | Risk classification (graceful fallback) |

Frontend build verification:
```bash
cd frontend
npm run build
```

---

## ⚠️ Financial Disclaimer

> FinSight AI provides document-based financial analysis for informational and
> research purposes only. It is not financial, investment, legal, or tax advice.
> Users should independently verify any results and consult qualified professionals
> before making decisions. The platform extracts information from user-uploaded
> documents and does not fabricate financial figures.

---

## 🙏 Credits & Attribution

This project is built upon and extends the
[AgenticRAG](https://github.com/MohammedAly22/AgenticRAG) open-source project
by **Mohammed Aly22**. The following components were migrated from AgenticRAG
with significant enhancements for financial domain analysis:

- RAG agent architecture (ReAct-style with tool calling)
- Conversational memory (ConversationBufferMemory)
- Query reformulation pipeline
- Chroma vector database integration
- Cohere LLM and embedding integration
- Document chunking (RecursiveCharacterTextSplitter)
- PDF loading (PyMuPDFLoader)
- Rate-limited batch embedding processing

See [LICENSE](LICENSE) for the MIT license with attribution.

---

## 🗺 Future Enhancements

- Multi-modal analysis (tables, charts from PDFs)
- Advanced re-ranking for retrieval
- Long-term memory persistence
- Comparative financial ratio analysis
- Export to Excel/PDF reports
- Multi-user collaboration
- Advanced financial modeling

---
