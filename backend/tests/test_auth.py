"""
Tests for authentication endpoints.
"""
import pytest
from app.core.security import hash_password, verify_password
from app.models.user import User, UserRole


def test_password_hashing():
    password = "testpassword123"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "User registered successfully"
    assert data["user_id"] is not None


def test_register_duplicate_email(client):
    client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/auth/register",
        json={"name": "Another", "email": "test@example.com", "password": "password456"},
    )
    assert response.status_code == 400


def test_login_success(client):
    # Register
    client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"},
    )
    # Login
    response = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"},
    )
    response = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_protected_route_without_token(client):
    response = client.get("/api/documents/")
    assert response.status_code == 401


def test_protected_route_with_token(client):
    client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"},
    )
    login_resp = client.post(
        "/api/auth/login",
        data={"username": "test@example.com", "password": "password123"},
    )
    token = login_resp.json()["access_token"]

    response = client.get(
        "/api/documents/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200


def test_get_registered_user_in_db(client, db):
    client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "password123"},
    )
    user = db.query(User).filter(User.email == "test@example.com").first()
    assert user is not None
    assert user.name == "Test User"
    assert user.role == UserRole.user
