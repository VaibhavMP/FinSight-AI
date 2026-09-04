"""End-to-end test demonstrating the full FinSight AI workflow."""
import requests
import io
import json

BASE = "http://localhost:8000"

print("=" * 60)
print("FinSight AI - End-to-End Test")
print("=" * 60)

# 1. Login
resp = requests.post(f"{BASE}/api/auth/login", data={
    "username": "test@finsight.ai",
    "password": "Password123!",
})
if resp.status_code != 200:
    # Register first
    requests.post(f"{BASE}/api/auth/register", json={
        "name": "Test User", "email": "test@finsight.ai", "password": "Password123!"
    })
    resp = requests.post(f"{BASE}/api/auth/login", data={
        "username": "test@finsight.ai",
        "password": "Password123!",
    })

token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print("\n[1/5] LOGIN: OK")

# 2. Upload document
txt = b"""Annual Report 2025 - TechCorp Inc.

Revenue: $50,000,000 in FY2025.
Net Income: $8,000,000 in FY2025.
Total Assets: $200,000,000
Total Liabilities: $120,000,000
Debt: $50,000,000
Equity: $80,000,000
Operating Cash Flow: $12,000,000

Risk Factors:
- Market Risk: Intense competition in the tech sector.
- Regulatory Risk: New data privacy laws may impact operations.
- Liquidity Risk: Reliance on short-term financing.

Management Discussion:
The company achieved strong growth in FY2025 driven by AI product adoption.
"""

resp = requests.post(
    f"{BASE}/api/documents/upload",
    files={"file": ("annual_report_2025.txt", io.BytesIO(txt), "text/plain")},
    data={"company": "TechCorp", "document_type": "annual_report"},
    headers=headers,
)
doc = resp.json()
print(f"[2/5] UPLOAD: doc_id={doc['id']}, status={doc['processing_status']}")

# 3. Process document
resp = requests.post(f"{BASE}/api/documents/{doc['id']}/process", headers=headers)
if resp.status_code == 200:
    r = resp.json()
    print(f"[3/5] PROCESS: pages={r.get('page_count')}, chunks={r.get('chunk_count')}, collection={r.get('collection_id')}")
else:
    print(f"[3/5] PROCESS: status {resp.status_code} - {resp.text[:100]}")

# 4. Chat - Casual
resp = requests.post(
    f"{BASE}/api/chat/",
    json={"query": "Hello, how are you?"},
    headers=headers,
)
chat = resp.json()
print(f"[4/5] CHAT (casual): mode={chat['agent_mode']}, answer={chat['answer'][:80]}")
conv_id = chat.get("conversation_id")

# 5. Chat - RAG
resp = requests.post(
    f"{BASE}/api/chat/",
    json={"query": "What was the revenue?", "document_ids": [doc["id"]], "conversation_id": conv_id},
    headers=headers,
)
if resp.status_code == 200:
    chat2 = resp.json()
    print(f"[5/5] CHAT (RAG): mode={chat2['agent_mode']}, answer={chat2['answer'][:80]}")
    print(f"       Sources: {len(chat2['sources'])}")
    for s in chat2["sources"][:2]:
        print(f"       - {s['document']} (p. {s['page']}, section: {s['section']})")
else:
    print(f"[5/5] CHAT (RAG): status {resp.status_code}")

# 6. Chat - Risk
resp = requests.post(
    f"{BASE}/api/chat/",
    json={"query": "What are the major risks?", "document_ids": [doc["id"]], "conversation_id": conv_id},
    headers=headers,
)
if resp.status_code == 200:
    chat3 = resp.json()
    print(f"[6/6] CHAT (Risk): mode={chat3['agent_mode']}")
    print(f"       Metrics: {len(chat3['metrics'])}")
else:
    print(f"[6/6] CHAT (Risk): status {resp.status_code}")

# List documents
resp = requests.get(f"{BASE}/api/documents/", headers=headers)
docs = resp.json()
print(f"\n[Documents] {len(docs)} document(s) in library")
for d in docs:
    print(f"  - {d['filename']} ({d['company']}) - {d['processing_status']}")

print("\n" + "=" * 60)
print("FinSight AI is running!")
print(f"  Frontend:  http://localhost:5173")
print(f"  Backend:   http://localhost:8000")
print(f"  API Docs:  http://localhost:8000/docs")
print("=" * 60)
