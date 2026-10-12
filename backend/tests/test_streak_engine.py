import os
import sqlite3
from datetime import datetime, timezone, timedelta, date
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from database import (
    init_db,
    get_connection,
    get_db_path,
    get_effective_today,
    get_streak_state,
    save_streak_state,
    get_completed_dates,
    complete_task_in_db,
    toggle_task_in_db,
    fetch_all_tasks,
    create_task_in_db,
)
from streak_rules import evaluate_streak, FREEZE_CONFIG
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


# --- Pure streak rules tests ---

def test_consecutive_day_increment():
    state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-11",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
    }
    today = "2026-10-12"
    completed = {"2026-10-12"}
    new_state = evaluate_streak(state, today, completed)

    assert new_state["current_streak"] == 15
    assert new_state["longest_streak"] == 18
    assert new_state["last_active_date"] == "2026-10-12"
    assert new_state["prev_streak"] == 14
    assert new_state["prev_longest"] == 18
    assert new_state["prev_last_active_date"] == "2026-10-11"


def test_same_day_no_double_increment():
    state = {
        "current_streak": 15,
        "longest_streak": 18,
        "last_active_date": "2026-10-12",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": 14,
        "prev_longest": 18,
        "prev_last_active_date": "2026-10-11",
    }
    today = "2026-10-12"
    completed = {"2026-10-12"}
    new_state = evaluate_streak(state, today, completed)

    assert new_state["current_streak"] == 15
    assert new_state["longest_streak"] == 18
    assert new_state["last_active_date"] == "2026-10-12"


def test_consecutive_pending_when_not_active():
    state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-11",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
    }
    today = "2026-10-12"
    completed = set()
    new_state = evaluate_streak(state, today, completed)

    # Days diff is 1, not active today: streak is pending, stays 14
    assert new_state["current_streak"] == 14
    assert new_state["longest_streak"] == 18
    assert new_state["last_active_date"] == "2026-10-11"


def test_missed_day_resets_to_zero():
    state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-10",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
    }
    today = "2026-10-12"  # 2 days diff
    completed = set()
    new_state = evaluate_streak(state, today, completed)

    assert new_state["current_streak"] == 0
    assert new_state["longest_streak"] == 18
    assert new_state["last_active_date"] == "2026-10-10"


def test_missed_day_then_active_starts_at_1():
    state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-10",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
    }
    today = "2026-10-12"  # 2 days diff
    completed = {"2026-10-12"}
    new_state = evaluate_streak(state, today, completed)

    assert new_state["current_streak"] == 1
    assert new_state["longest_streak"] == 18
    assert new_state["last_active_date"] == "2026-10-12"
    assert new_state["prev_streak"] == 14
    assert new_state["prev_last_active_date"] == "2026-10-10"


def test_longest_updates_when_exceeded():
    state = {
        "current_streak": 18,
        "longest_streak": 18,
        "last_active_date": "2026-10-11",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
    }
    today = "2026-10-12"
    completed = {"2026-10-12"}
    new_state = evaluate_streak(state, today, completed)

    assert new_state["current_streak"] == 19
    assert new_state["longest_streak"] == 19
    assert new_state["last_active_date"] == "2026-10-12"


def test_negative_days_diff_unchanged():
    state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-12",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
    }
    today = "2026-10-10"  # past date
    completed = {"2026-10-10"}
    new_state = evaluate_streak(state, today, completed)

    assert new_state == state


def test_evaluate_twice_is_idempotent():
    state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-11",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
    }
    today = "2026-10-12"
    completed = {"2026-10-12"}

    first_eval = evaluate_streak(state, today, completed)
    second_eval = evaluate_streak(state, today, completed)
    assert first_eval == second_eval

    # Sequential evaluation on the result of the first evaluation
    third_eval = evaluate_streak(first_eval, today, completed)
    assert third_eval == first_eval


def test_complete_then_uncomplete_restores_streak():
    state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-11",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
    }
    today = "2026-10-12"

    # Complete task today (14 -> 15)
    completed_state = evaluate_streak(state, today, {"2026-10-12"})
    assert completed_state["current_streak"] == 15
    assert completed_state["last_active_date"] == "2026-10-12"
    assert completed_state["prev_streak"] == 14
    assert completed_state["prev_last_active_date"] == "2026-10-11"

    # Uncomplete task today (15 -> 14)
    uncompleted_state = evaluate_streak(completed_state, today, set())
    assert uncompleted_state["current_streak"] == 14
    assert uncompleted_state["longest_streak"] == 18
    assert uncompleted_state["last_active_date"] == "2026-10-11"
    assert uncompleted_state["prev_streak"] is None
    assert uncompleted_state["prev_last_active_date"] is None


def test_complete_uncomplete_recomplete():
    state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-11",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
    }
    today = "2026-10-12"

    # 1. Complete -> 15
    s1 = evaluate_streak(state, today, {"2026-10-12"})
    assert s1["current_streak"] == 15

    # 2. Uncomplete -> 14
    s2 = evaluate_streak(s1, today, set())
    assert s2["current_streak"] == 14
    assert s2["last_active_date"] == "2026-10-11"

    # 3. Recomplete -> 15
    s3 = evaluate_streak(s2, today, {"2026-10-12"})
    assert s3["current_streak"] == 15
    assert s3["last_active_date"] == "2026-10-12"
    assert s3["prev_streak"] == 14
    assert s3["prev_last_active_date"] == "2026-10-11"


def test_seed_row_has_no_snapshot_and_uncomplete_does_nothing():
    seed_state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-12",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
    }
    today = "2026-10-12"
    # No tasks active, days_diff == 0, but snapshot is None
    result = evaluate_streak(seed_state, today, set())

    assert result["current_streak"] == 14
    assert result["longest_streak"] == 18
    assert result["last_active_date"] == "2026-10-12"
    assert result["prev_last_active_date"] is None


def test_input_state_not_mutated():
    original = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-11",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
    }
    original_copy = dict(original)

    evaluate_streak(original, "2026-10-12", {"2026-10-12"})
    assert original == original_copy


# --- Date parsing and validation tests ---

def test_today_override_env_var(monkeypatch):
    monkeypatch.setenv("ASTUTO_OVERRIDE_TODAY", "2026-10-25")
    assert get_effective_today() == "2026-10-25"
    assert get_effective_today(client_date=None) == "2026-10-25"

    monkeypatch.setenv("ASTUTO_OVERRIDE_TODAY", "invalid-date")
    with pytest.raises(ValueError):
        get_effective_today()


def test_client_date_invalid_rejected():
    with pytest.raises(ValueError):
        get_effective_today("invalid-date")

    with pytest.raises(ValueError):
        get_effective_today("2026-13-40")


def test_client_date_more_than_1_day_from_utc_rejected():
    with pytest.raises(ValueError, match="more than 1 day"):
        get_effective_today("2099-01-01")

    with pytest.raises(ValueError, match="more than 1 day"):
        get_effective_today("2020-01-01")


# --- Database operations & migrations ---

def test_database_seed_first_run():
    state = get_streak_state()
    assert state is not None
    assert state["current_streak"] == 14
    assert state["longest_streak"] == 18
    assert state["freezes_held"] == 2
    assert state["last_active_date"] == get_effective_today()
    assert state["prev_streak"] is None
    assert state["prev_longest"] is None
    assert state["prev_last_active_date"] is None


def test_old_tasks_table_migrates_completed_date_column(tmp_path, monkeypatch):
    old_db = tmp_path / "old_schema.db"
    monkeypatch.setenv("ASTUTO_DB_PATH", str(old_db))

    # Create old tasks schema without completed_date
    conn = sqlite3.connect(old_db)
    conn.execute(
        """
        CREATE TABLE tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            source TEXT,
            source_url TEXT,
            estimated_minutes INTEGER,
            slot TEXT,
            time_label TEXT,
            completed INTEGER DEFAULT 0,
            optional INTEGER DEFAULT 0,
            tags TEXT
        )
        """
    )
    conn.execute(
        """
        INSERT INTO tasks (id, title, completed) VALUES ('old-task-1', 'Old Task', 1)
        """
    )
    conn.commit()
    conn.close()

    # Run init_db which should detect and add completed_date
    init_db()

    conn = sqlite3.connect(old_db)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(tasks)")
    columns = [row[1] for row in cursor.fetchall()]
    assert "completed_date" in columns

    cursor.execute("SELECT completed_date FROM tasks WHERE id = 'old-task-1'")
    row = cursor.fetchone()
    assert row[0] is None
    conn.close()


def test_task_completion_records_date():
    today = get_effective_today()
    task = complete_task_in_db("variables-refresher", completion_date=today)
    assert task["completed"] is True
    assert task["completedDate"] == today

    completed_dates = get_completed_dates()
    assert today in completed_dates


def test_toggle_off_clears_date():
    today = get_effective_today()
    # First complete it
    complete_task_in_db("variables-refresher", completion_date=today)
    assert today in get_completed_dates()

    # Toggle it off
    toggled = toggle_task_in_db("variables-refresher", completion_date=today)
    assert toggled["completed"] is False
    assert toggled["completedDate"] is None
    assert today not in get_completed_dates()


# --- FastAPI TestClient endpoint tests ---

def test_stats_endpoint_returns_streak_fields():
    client = TestClient(app)
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()

    assert "streak" in data
    streak = data["streak"]
    assert streak["currentDays"] == 14
    assert streak["personalBest"] == 18
    assert streak["freezeCount"] == 2
    assert "lastActiveDate" in streak
    assert streak["lastActiveDate"] == get_effective_today()

    # Existing stats fields preserved
    assert "predictedMastery" in data
    assert "dailyRetention" in data
    assert "weeklyMinutes" in data
    assert "roadmap" in data
    assert "learningProgress" in data


def test_stats_endpoint_400_on_bad_date():
    client = TestClient(app)
    # Bad date format
    res1 = client.get("/api/stats?client_date=invalid-date")
    assert res1.status_code == 400

    # More than 1 day from UTC
    res2 = client.get("/api/stats?client_date=2099-01-01")
    assert res2.status_code == 400


def test_complete_and_toggle_endpoints_sync_streak(monkeypatch):
    # Set effective today to yesterday, seed row will have yesterday as last active
    yesterday = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
    today = datetime.now(timezone.utc).date().isoformat()

    client = TestClient(app)

    # Put streak state at yesterday
    state = get_streak_state()
    state["last_active_date"] = yesterday
    state["current_streak"] = 14
    save_streak_state(state)

    # 1. Complete a task with client_date=today
    res = client.post("/api/tasks/lecture-review/complete", params={"client_date": today})
    assert res.status_code == 200

    # Stats should now reflect streak 15
    stats_res = client.get("/api/stats", params={"client_date": today})
    assert stats_res.status_code == 200
    assert stats_res.json()["streak"]["currentDays"] == 15
    assert stats_res.json()["streak"]["lastActiveDate"] == today

    # 2. Toggle that same task off
    toggle_res = client.post("/api/tasks/lecture-review/toggle", params={"client_date": today})
    assert toggle_res.status_code == 200
    assert toggle_res.json()["completed"] is False

    # Streak should be restored to 14
    stats_res2 = client.get("/api/stats", params={"client_date": today})
    assert stats_res2.status_code == 200
    assert stats_res2.json()["streak"]["currentDays"] == 14
    assert stats_res2.json()["streak"]["lastActiveDate"] == yesterday
