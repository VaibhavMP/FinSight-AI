"""
Tests for conversation endpoints.
"""
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


def test_create_conversation(client):
    token = get_auth_token(client)
    resp = client.post(
        "/api/conversations/",
        json={"title": "Test Conversation"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["title"] == "Test Conversation"


def test_list_conversations(client):
    token = get_auth_token(client)
    client.post(
        "/api/conversations/",
        json={"title": "Test Conv 1"},
        headers={"Authorization": f"Bearer {token}"},
    )
    resp = client.get("/api/conversations/", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert len(resp.json()) >= 1


def test_list_conversations_unauthorized(client):
    resp = client.get("/api/conversations/")
    assert resp.status_code == 401


def test_get_messages_empty(client):
    token = get_auth_token(client)
    create_resp = client.post(
        "/api/conversations/",
        json={"title": "Test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    conv_id = create_resp.json()["id"]

    resp = client.get(
        f"/api/conversations/{conv_id}/messages",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json() == []
