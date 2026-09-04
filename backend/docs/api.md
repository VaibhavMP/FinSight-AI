# FinSight AI — API Documentation

Base URL: `http://localhost:8000`

All endpoints under `/api/` (except health). Protected endpoints require
`Authorization: Bearer <JWT_TOKEN>`.

## Authentication

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{"message": "User registered successfully", "user_id": 1}
```

### POST /api/auth/login
Login and receive JWT token.

**Request Body (form-encoded):**
```
username=john@example.com&password=password123
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

## Documents

### GET /api/documents
List user's documents.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "filename": "annual_report_2025.pdf",
    "company": "Apple Inc.",
    "document_type": "annual_report",
    "upload_date": "2025-01-15T10:30:00",
    "processing_status": "completed",
    "page_count": 120,
    "file_size_bytes": 5242880,
    "chroma_collection_id": "doc_1"
  }
]
```

### POST /api/documents/upload
Upload a document file.

**Request:** multipart form
- `file`: PDF, DOCX, or TXT file
- `company`: Company name (optional)
- `document_type`: One of the document type enum values

**Response:** `200 OK` — Document metadata

### POST /api/documents/{id}/process
Trigger document processing (extraction, chunking, embedding, indexing).

**Response:**
```json
{
  "status": "completed",
  "page_count": 120,
  "chunk_count": 150,
  "collection_id": "doc_1"
}
```

### DELETE /api/documents/{id}
Delete a document and remove from Chroma.

## Conversations

### GET /api/conversations
List user's conversations.

### POST /api/conversations
Create a new conversation.

**Request Body:**
```json
{"title": "Revenue Analysis"}
```

### GET /api/conversations/{id}/messages
Get messages in a conversation.

## Chat

### POST /api/chat
Send a query to the AI agent.

**Request Body:**
```json
{
  "query": "What was the company's revenue in FY2025?",
  "conversation_id": 1,
  "document_ids": [1, 2],
  "show_reasoning": false
}
```

**Response:** `200 OK`
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
      "company": "Apple Inc.",
      "document_type": "annual_report",
      "chunk_id": ""
    }
  ],
  "metrics": [],
  "conversation_id": 1,
  "reasoning_steps": null
}
```

### Agent Modes

| Mode | Description |
|------|-------------|
| `casual` | No retrieval, natural conversation |
| `rag` | Retrieve + answer with citations |
| `analysis` | Retrieve + analyze relationships |
| `comparison` | Multi-doc comparison with charts |
| `risk` | Risk extraction and classification |
| `metrics` | Financial metric extraction |

## Comparison

### POST /api/compare
Compare multiple documents on selected metrics.

**Request Body:**
```json
{
  "document_ids": [1, 2],
  "metrics": ["revenue", "net_income", "ebitda"]
}
```

## Health

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "service": "FinSight AI Backend"
}
```
