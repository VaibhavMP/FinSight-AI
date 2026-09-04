# FinSight AI — Evaluation & Testing

## Backend Test Suite

```bash
cd backend
python -m pytest tests/ -v
```

### Test Coverage

| Test File | Description |
|-----------|-------------|
| `test_auth.py` | Registration, login, JWT validation, protected routes, password hashing |
| `test_documents.py` | Upload (PDF, unsupported types), auth required, listing |
| `test_conversations.py` | Create, list, message retrieval, auth |
| `test_chat.py` | Chat without docs, conversation creation, auth, compare validation |
| `test_health.py` | Health check endpoint |
| `test_query_classifier.py` | All 6 query modes + edge cases |

### Test Results
```
31 passed in 23.69s
```

## Frontend Build Verification

```bash
cd frontend
npm run build
```

Produces production-ready static files in `dist/`.

## Integration Testing

| Feature | Status |
|---------|--------|
| User registration | ✅ Tested |
| User login | ✅ Tested |
| Protected routes | ✅ Tested |
| Document upload (PDF) | ✅ Tested |
| Document upload (unsupported type) | ✅ Tested |
| Document upload (unauthenticated) | ✅ Tested |
| Query classification (casual) | ✅ Tested |
| Query classification (RAG) | ✅ Tested |
| Query classification (analysis) | ✅ Tested |
| Query classification (comparison) | ✅ Tested |
| Query classification (risk) | ✅ Tested |
| Query classification (metrics) | ✅ Tested |
| Chat endpoint | ✅ Tested |
| Conversation management | ✅ Tested |
| Health check | ✅ Tested |
| Frontend build | ✅ Verified |

## Evaluation Criteria

### 1. Grounded Responses
All RAG responses are grounded in retrieved document context. The system
does not fabricate financial numbers — if context is insufficient, the
answer explicitly states this.

### 2. Citation Accuracy
Every document-grounded response includes citations with:
- Document filename
- Page number
- Section name
- Relevant excerpt

### 3. Query Routing Accuracy
The query classifier routes to the correct mode based on intent patterns.

### 4. Conversation Memory
Follow-up questions use `ConversationBufferMemory` and are reformulated
before retrieval.

### 5. Multi-document Comparison
The comparison endpoint retrieves from multiple document collections and
presents structured comparisons.

## Future Evaluation

- End-to-end RAG pipeline testing with real documents
- Citation accuracy verification against source documents
- Financial metric extraction accuracy
- Risk classification precision
- Performance benchmarking (response time, throughput)
