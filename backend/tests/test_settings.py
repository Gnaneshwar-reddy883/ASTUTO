import pytest
from fastapi.testclient import TestClient

from database import init_db
from main import app


@pytest.fixture(autouse=True)
def setup_temp_db(tmp_path, monkeypatch):
    """
    Ensure every test uses a temporary SQLite database and never touches backend/astuto.db.
    """
    test_db = tmp_path / "test_astuto.db"
    monkeypatch.setenv("ASTUTO_DB_PATH", str(test_db))
    monkeypatch.delenv("ASTUTO_OVERRIDE_TODAY", raising=False)
    init_db()
    yield test_db


def test_get_settings_defaults():
    client = TestClient(app)
    response = client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()

    # Assert 4 new default identity fields exist
    assert "name" in data
    assert data["name"] == ""
    assert "skill" in data
    assert data["skill"] == ""
    assert "durationDays" in data
    assert data["durationDays"] == 90
    assert "startDate" in data
    assert data["startDate"] is None

    # Assert existing preferences exist
    assert data["tone"] == "gentle"
    assert "reminders" in data
    assert data["reminders"]["daily"] is True
    assert "slots" in data
    assert isinstance(data["slots"], list)
    assert len(data["slots"]) == 4


def test_put_settings_partial_update():
    client = TestClient(app)

    # Update only the new identity fields
    payload = {
        "name": "Alex",
        "skill": "Python for Data Science",
        "durationDays": 60,
        "startDate": "2026-11-01",
    }
    response = client.put("/api/settings", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["name"] == "Alex"
    assert data["skill"] == "Python for Data Science"
    assert data["durationDays"] == 60
    assert data["startDate"] == "2026-11-01"

    # Ensure existing slots and tone were merged without destruction
    assert data["tone"] == "gentle"
    assert "slots" in data
    assert len(data["slots"]) == 4

    # Verify persistence via subsequent GET
    get_response = client.get("/api/settings")
    assert get_response.status_code == 200
    persisted = get_response.json()
    assert persisted["name"] == "Alex"
    assert persisted["skill"] == "Python for Data Science"
    assert persisted["durationDays"] == 60
    assert persisted["startDate"] == "2026-11-01"
    assert len(persisted["slots"]) == 4


def test_put_settings_further_partial_update_preserves_identity():
    client = TestClient(app)

    # First update identity
    client.put(
        "/api/settings",
        json={"name": "Alex", "skill": "Rust", "durationDays": 45, "startDate": "2026-10-15"},
    )

    # Now update only tone
    response = client.put("/api/settings", json={"tone": "savage"})
    assert response.status_code == 200
    data = response.json()

    assert data["tone"] == "savage"
    assert data["name"] == "Alex"
    assert data["skill"] == "Rust"
    assert data["durationDays"] == 45
    assert data["startDate"] == "2026-10-15"
    assert len(data["slots"]) == 4


def test_stats_dynamic_goals_reflect_settings():
    client = TestClient(app)

    # Configure custom duration and slots
    custom_settings = {
        "durationDays": 30,
        "slots": [
            {"id": "morning", "label": "Morning", "minutes": 15, "startTime": "8:00 AM"},
            {"id": "evening", "label": "Evening", "minutes": 25, "startTime": "7:00 PM"},
        ],
    }
    client.put("/api/settings", json=custom_settings)

    # dailyMinutes = 15 + 25 = 40
    # weeklyGoalMinutes = 40 * 7 = 280
    # active_slots = 2
    # taskGoal = 30 * 2 = 60
    stats_response = client.get("/api/stats")
    assert stats_response.status_code == 200
    stats = stats_response.json()

    assert stats["weeklyGoalMinutes"] == 280
    assert stats["learningProgress"]["taskGoal"] == 60

