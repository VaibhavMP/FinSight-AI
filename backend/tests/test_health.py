"""
Tests for the health endpoint.
"""


def test_health_check(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "timestamp" in data
    assert data["service"] == "FinSight AI Backend"
