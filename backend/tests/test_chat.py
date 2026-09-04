"""
Tests for the chat endpoint and RAG service.
"""
import pytest
from unittest.mock import patch, MagicMock


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


def test_chat_without_documents(client):
    """Casual chat should work without document selection."""
    token = get_auth_token(client)
    resp = client.post(
        "/api/chat/",
        json={"query": "Hello, how are you?"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
    assert data["agent_mode"] in ("casual", "rag", "analysis")


def test_chat_creates_conversation(client):
    token = get_auth_token(client)
    resp = client.post(
        "/api/chat/",
        json={"query": "Hello"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "conversation_id" in data
    assert data["conversation_id"] is not None


def test_chat_unauthorized(client):
    resp = client.post(
        "/api/chat/",
        json={"query": "Hello"},
    )
    assert resp.status_code == 401


def test_compare_requires_two_documents(client):
    token = get_auth_token(client)
    resp = client.post(
        "/api/compare/",
        json={"document_ids": [1], "metrics": ["revenue"]},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 400


def test_compare_unauthorized(client):
    resp = client.post(
        "/api/compare/",
        json={"document_ids": [1, 2], "metrics": ["revenue"]},
    )
    assert resp.status_code == 401
