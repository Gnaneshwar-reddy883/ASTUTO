import os
import json
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
    log_active_date,
    get_activity_log,
)
from streak_rules import evaluate_streak, FREEZE_CONFIG, prune_frozen_dates
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
    # Branch B: freezes_held is set to 0 to test gap reset behavior when no freezes protect the gap.
    state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-10",
        "freezes_held": 0,
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
    # Branch B: freezes_held is set to 0 to test that an active day after an unprotected gap starts a new streak of 1.
    state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-10",
        "freezes_held": 0,
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


# --- Branch B Streak Freeze Tests ---

def test_missed_one_day_plain_app_open_preserves_streak_without_consuming_freeze():
    state = {
        "current_streak": 5,
        "longest_streak": 10,
        "last_active_date": "2026-10-10",
        "freezes_held": 1,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    today = "2026-10-12"  # 1 day missed (2026-10-11)
    completed = set()
    new_state = evaluate_streak(state, today, completed)

    # Streak is preserved, but freeze is NOT consumed until a completion occurs
    assert new_state["current_streak"] == 5
    assert new_state["longest_streak"] == 10
    assert new_state["freezes_held"] == 1
    assert new_state["frozen_dates"] == "[]"
    assert new_state["last_active_date"] == "2026-10-10"


def test_missed_one_day_active_today_consumes_freeze_and_increments():
    state = {
        "current_streak": 5,
        "longest_streak": 10,
        "last_active_date": "2026-10-10",
        "freezes_held": 1,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    today = "2026-10-12"
    completed = {"2026-10-12"}
    new_state = evaluate_streak(state, today, completed)

    assert new_state["current_streak"] == 6
    assert new_state["longest_streak"] == 10
    assert new_state["freezes_held"] == 0
    assert json.loads(new_state["frozen_dates"]) == ["2026-10-11"]
    assert new_state["last_active_date"] == "2026-10-12"
    assert new_state["prev_streak"] == 5
    assert new_state["prev_last_active_date"] == "2026-10-10"
    assert new_state["prev_freezes_held"] == 1
    assert new_state["prev_frozen_dates"] == "[]"


def test_missed_three_days_plain_app_open_with_one_freeze_shows_zero_without_consuming():
    state = {
        "current_streak": 5,
        "longest_streak": 10,
        "last_active_date": "2026-10-10",
        "freezes_held": 1,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    today = "2026-10-14"  # 3 days missed (11, 12, 13) > 1 freeze held
    completed = set()
    new_state = evaluate_streak(state, today, completed)

    # Streak resets to 0, no freezes consumed per PRD
    assert new_state["current_streak"] == 0
    assert new_state["longest_streak"] == 10
    assert new_state["freezes_held"] == 1
    assert new_state["frozen_dates"] == "[]"


def test_missed_three_days_with_only_one_freeze_then_active_starts_at_one():
    state = {
        "current_streak": 5,
        "longest_streak": 10,
        "last_active_date": "2026-10-10",
        "freezes_held": 1,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    today = "2026-10-14"
    completed = {"2026-10-14"}
    new_state = evaluate_streak(state, today, completed)

    # Gap larger than freezes held: consume nothing and start new streak at 1
    assert new_state["current_streak"] == 1
    assert new_state["longest_streak"] == 10
    assert new_state["freezes_held"] == 1
    assert new_state["frozen_dates"] == "[]"
    assert new_state["last_active_date"] == "2026-10-14"


def test_exact_enough_freezes_for_gap():
    state = {
        "current_streak": 14,
        "longest_streak": 18,
        "last_active_date": "2026-10-10",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    today = "2026-10-13"  # 2 missed days: 11 and 12
    completed = {"2026-10-13"}
    new_state = evaluate_streak(state, today, completed)

    assert new_state["current_streak"] == 15
    assert new_state["longest_streak"] == 18
    assert new_state["freezes_held"] == 0
    assert json.loads(new_state["frozen_dates"]) == ["2026-10-11", "2026-10-12"]
    assert new_state["last_active_date"] == "2026-10-13"


def test_milestone_earns_freeze_at_7():
    state = {
        "current_streak": 6,
        "longest_streak": 6,
        "last_active_date": "2026-10-11",
        "freezes_held": 1,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    today = "2026-10-12"
    completed = {"2026-10-12"}
    new_state = evaluate_streak(state, today, completed)

    assert new_state["current_streak"] == 7
    assert new_state["longest_streak"] == 7
    assert new_state["freezes_held"] == 2


def test_milestone_at_14_capped_at_two():
    state = {
        "current_streak": 13,
        "longest_streak": 13,
        "last_active_date": "2026-10-11",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    today = "2026-10-12"
    completed = {"2026-10-12"}
    new_state = evaluate_streak(state, today, completed)

    assert new_state["current_streak"] == 14
    assert new_state["longest_streak"] == 14
    assert new_state["freezes_held"] == 2  # Capped at 2


def test_milestone_at_14_earns_freeze_if_below_cap():
    state = {
        "current_streak": 13,
        "longest_streak": 13,
        "last_active_date": "2026-10-11",
        "freezes_held": 1,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    today = "2026-10-12"
    completed = {"2026-10-12"}
    new_state = evaluate_streak(state, today, completed)

    assert new_state["current_streak"] == 14
    assert new_state["longest_streak"] == 14
    assert new_state["freezes_held"] == 2  # Earned +1 up to cap


def test_milestone_right_after_freeze_bridged_gap():
    state = {
        "current_streak": 6,
        "longest_streak": 6,
        "last_active_date": "2026-10-10",
        "freezes_held": 1,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    today = "2026-10-12"  # Missed 2026-10-11
    completed = {"2026-10-12"}
    new_state = evaluate_streak(state, today, completed)

    # 1 freeze consumed for gap (1 -> 0), milestone at streak 7 reached (+1 freeze: 0 -> 1)
    assert new_state["current_streak"] == 7
    assert new_state["longest_streak"] == 7
    assert new_state["freezes_held"] == 1
    assert json.loads(new_state["frozen_dates"]) == ["2026-10-11"]


def test_evaluate_twice_is_idempotent_with_freeze():
    state = {
        "current_streak": 5,
        "longest_streak": 10,
        "last_active_date": "2026-10-10",
        "freezes_held": 1,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    today = "2026-10-12"
    completed = {"2026-10-12"}

    first_eval = evaluate_streak(state, today, completed)
    second_eval = evaluate_streak(first_eval, today, completed)
    assert first_eval == second_eval
    assert second_eval["current_streak"] == 6
    assert second_eval["freezes_held"] == 0
    assert json.loads(second_eval["frozen_dates"]) == ["2026-10-11"]


def test_streak_saved_by_freeze_does_not_double_count():
    state = {
        "current_streak": 5,
        "longest_streak": 10,
        "last_active_date": "2026-10-10",
        "freezes_held": 2,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    # 1. Plain app open on 2026-10-12 (missed 2026-10-11)
    am_eval = evaluate_streak(state, "2026-10-12", set())
    assert am_eval["current_streak"] == 5
    assert am_eval["freezes_held"] == 2  # Not yet consumed

    # 2. Complete task on 2026-10-12
    pm_eval = evaluate_streak(am_eval, "2026-10-12", {"2026-10-12"})
    # Streak increments once to 6 (frozen day preserved 5, active day added 1, not 7)
    assert pm_eval["current_streak"] == 6
    assert pm_eval["freezes_held"] == 1
    assert json.loads(pm_eval["frozen_dates"]) == ["2026-10-11"]

    # 3. Subsequent evaluation on the same day does not double increment
    re_eval = evaluate_streak(pm_eval, "2026-10-12", {"2026-10-12"})
    assert re_eval["current_streak"] == 6
    assert re_eval["freezes_held"] == 1


def test_gap_bridged_by_freeze_and_milestone_then_uncomplete_restores_everything():
    state = {
        "current_streak": 6,
        "longest_streak": 6,
        "last_active_date": "2026-10-10",
        "freezes_held": 1,
        "frozen_dates": "[]",
        "prev_streak": None,
        "prev_longest": None,
        "prev_last_active_date": None,
        "prev_freezes_held": None,
        "prev_frozen_dates": None,
    }
    today = "2026-10-12"  # Gap at 2026-10-11

    # 1. Complete task today: bridges gap, increments to 7 (milestone), consumes 1 freeze, awards 1 freeze
    completed_state = evaluate_streak(state, today, {"2026-10-12"})
    assert completed_state["current_streak"] == 7
    assert completed_state["longest_streak"] == 7
    assert completed_state["last_active_date"] == "2026-10-12"
    assert completed_state["freezes_held"] == 1
    assert json.loads(completed_state["frozen_dates"]) == ["2026-10-11"]
    assert completed_state["prev_streak"] == 6
    assert completed_state["prev_longest"] == 6
    assert completed_state["prev_last_active_date"] == "2026-10-10"
    assert completed_state["prev_freezes_held"] == 1
    assert completed_state["prev_frozen_dates"] == "[]"

    # 2. Uncomplete task today: restores all five fields from undo snapshot
    uncompleted_state = evaluate_streak(completed_state, today, set())
    assert uncompleted_state["current_streak"] == 6
    assert uncompleted_state["longest_streak"] == 6
    assert uncompleted_state["last_active_date"] == "2026-10-10"
    assert uncompleted_state["freezes_held"] == 1
    assert uncompleted_state["frozen_dates"] == "[]"
    assert uncompleted_state["prev_streak"] is None
    assert uncompleted_state["prev_longest"] is None
    assert uncompleted_state["prev_last_active_date"] is None
    assert uncompleted_state["prev_freezes_held"] is None
    assert uncompleted_state["prev_frozen_dates"] is None


def test_prune_frozen_dates_to_last_30_days():
    raw_dates = ["2026-09-01", "2026-09-12", "2026-10-11"]
    pruned = prune_frozen_dates(raw_dates, reference_date="2026-10-12", max_age_days=30)
    # 2026-09-01 is 41 days old -> pruned
    # 2026-09-12 is exactly 30 days old -> kept
    # 2026-10-11 is 1 day old -> kept
    assert pruned == ["2026-09-12", "2026-10-11"]


def test_sqlite_round_trip_frozen_dates_and_prev_freezes_held():
    sample_state = {
        "current_streak": 7,
        "longest_streak": 8,
        "last_active_date": "2026-10-12",
        "freezes_held": 1,
        "frozen_dates": ["2026-10-11"],
        "prev_streak": 6,
        "prev_longest": 8,
        "prev_last_active_date": "2026-10-10",
        "prev_freezes_held": 2,
        "prev_frozen_dates": "[]",
    }
    save_streak_state(sample_state)

    fetched = get_streak_state()
    assert fetched is not None
    assert fetched["current_streak"] == 7
    assert fetched["longest_streak"] == 8
    assert fetched["last_active_date"] == "2026-10-12"
    assert fetched["freezes_held"] == 1
    assert json.loads(fetched["frozen_dates"]) == ["2026-10-11"]
    assert fetched["prev_streak"] == 6
    assert fetched["prev_longest"] == 8
    assert fetched["prev_last_active_date"] == "2026-10-10"
    assert fetched["prev_freezes_held"] == 2
    assert fetched["prev_frozen_dates"] == "[]"


def test_migration_old_streak_state_table_adds_new_columns(tmp_path, monkeypatch):
    old_db = tmp_path / "old_streak_schema.db"
    monkeypatch.setenv("ASTUTO_DB_PATH", str(old_db))

    conn = sqlite3.connect(old_db)
    # Create Branch A schema without prev_freezes_held and prev_frozen_dates
    conn.execute(
        """
        CREATE TABLE streak_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            current_streak INTEGER NOT NULL,
            longest_streak INTEGER NOT NULL,
            last_active_date TEXT,
            freezes_held INTEGER NOT NULL,
            frozen_dates TEXT DEFAULT '[]',
            prev_streak INTEGER,
            prev_longest INTEGER,
            prev_last_active_date TEXT,
            updated_at TEXT
        )
        """
    )
    conn.execute(
        """
        INSERT INTO streak_state (
            id, current_streak, longest_streak, last_active_date, freezes_held, frozen_dates
        ) VALUES (1, 5, 5, '2026-10-10', 1, '[]')
        """
    )
    conn.commit()
    conn.close()

    # Run init_db which should detect and add prev_freezes_held and prev_frozen_dates
    init_db()

    conn = sqlite3.connect(old_db)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(streak_state)")
    columns = [row[1] for row in cursor.fetchall()]
    assert "prev_freezes_held" in columns
    assert "prev_frozen_dates" in columns
    conn.close()

    # Verify get_streak_state works on migrated DB
    migrated_state = get_streak_state()
    assert migrated_state is not None
    assert migrated_state["current_streak"] == 5
    assert migrated_state["prev_freezes_held"] is None
    assert migrated_state["prev_frozen_dates"] is None


def test_stats_endpoint_returns_frozen_dates():
    client = TestClient(app)
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "streak" in data
    assert "frozenDates" in data["streak"]
    assert isinstance(data["streak"]["frozenDates"], list)


def test_reshuffle_leaves_freezes_held_in_db_unchanged():
    client = TestClient(app)
    # Ensure DB streak state has 2 freezes
    state = get_streak_state()
    state["freezes_held"] = 2
    save_streak_state(state)

    res = client.post("/api/plan/reshuffle", json={"mode": "spread", "use_freezes": True})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["freezesUsed"] == 0
    assert data["remainingFreezes"] == 2

    # Assert directly on the DB that freezes_held was not modified
    db_state = get_streak_state()
    assert db_state["freezes_held"] == 2


def test_log_active_date_deduplicates_and_orders():
    # Calling log_active_date multiple times for the same date only creates one row (INSERT OR IGNORE works)
    log_active_date("2026-10-12")
    log_active_date("2026-10-10")
    log_active_date("2026-10-12")
    log_active_date("2026-10-11")
    log_active_date("2026-10-10")

    dates = get_activity_log()
    assert dates == ["2026-10-10", "2026-10-11", "2026-10-12"]

    # Verify directly with a count query
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM active_dates WHERE date = '2026-10-12'")
    assert cursor.fetchone()[0] == 1
    cursor.execute("SELECT COUNT(*) FROM active_dates")
    assert cursor.fetchone()[0] == 3
    conn.close()


def test_activity_log_endpoint_returns_expected_structure():
    client = TestClient(app)
    # Empty log initially
    res = client.get("/api/activity-log")
    assert res.status_code == 200
    data = res.json()
    assert "activeDates" in data
    assert isinstance(data["activeDates"], list)

    # Log some dates
    log_active_date("2026-10-05")
    log_active_date("2026-10-06")

    res2 = client.get("/api/activity-log")
    assert res2.status_code == 200
    assert res2.json() == {"activeDates": ["2026-10-05", "2026-10-06"]}


def test_task_complete_and_toggle_logs_to_activity_log():
    client = TestClient(app)
    today = get_effective_today()

    # Complete a task
    res = client.post("/api/tasks/lecture-review/complete", params={"client_date": today})
    assert res.status_code == 200

    log_res = client.get("/api/activity-log")
    assert log_res.status_code == 200
    assert today in log_res.json()["activeDates"]

    # Toggle off does NOT remove the active date
    toggle_res = client.post("/api/tasks/lecture-review/toggle", params={"client_date": today})
    assert toggle_res.status_code == 200
    assert toggle_res.json()["completed"] is False

    log_res2 = client.get("/api/activity-log")
    assert today in log_res2.json()["activeDates"]

