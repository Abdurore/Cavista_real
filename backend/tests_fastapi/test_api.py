from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"healthy": True}


def test_adult_analyze() -> None:
    response = client.post(
        "/api/analyze/adult",
        json={"age": 45, "weight": 85, "height": 172, "bloodPressure": 140},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "risk_score" in body
    assert "risk_level" in body


def test_pregnant_analyze() -> None:
    response = client.post(
        "/api/analyze/pregnant",
        json={"age": 34, "weight": 70, "weeks": 22},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert "risk_score" in body
    assert "risk_level" in body
