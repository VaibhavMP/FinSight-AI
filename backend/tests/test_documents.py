"""
Tests for document upload, listing, and deletion endpoints.
"""
import io
import pytest


def get_auth_token(client, email="test@example.com", password="password123"):
    client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": email, "password": password},
    )
    resp = client.post(
        "/api/auth/login",
        data={"username": email, "password": password},
    )
    return resp.json()["access_token"]


def test_list_documents_empty(client):
    token = get_auth_token(client)
    resp = client.get("/api/documents/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json() == []


def test_upload_pdf(client):
    token = get_auth_token(client)
    # Create a minimal PDF file
    pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF"
    resp = client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(pdf_content), "application/pdf")},
        data={"company": "Test Corp", "document_type": "annual_report"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["filename"] == "test.pdf"
    assert data["company"] == "Test Corp"
    assert data["document_type"] == "annual_report"
    assert data["processing_status"] == "uploaded"


def test_upload_unsupported_file(client):
    token = get_auth_token(client)
    resp = client.post(
        "/api/documents/upload",
        files={"file": ("test.exe", io.BytesIO(b"binary"), "application/octet-stream")},
        data={"company": "Test", "document_type": "other"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400


def test_upload_without_auth(client):
    resp = client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(b"%PDF-1.4"), "application/pdf")},
        data={"company": "Test", "document_type": "other"},
    )
    assert resp.status_code == 401


def test_list_documents_after_upload(client):
    token = get_auth_token(client)
    pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n190\n%%EOF"
    client.post(
        "/api/documents/upload",
        files={"file": ("test.pdf", io.BytesIO(pdf_content), "application/pdf")},
        data={"company": "Test Corp", "document_type": "annual_report"},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.get("/api/documents/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert len(resp.json()) == 1
    assert resp.json()[0]["filename"] == "test.pdf"
