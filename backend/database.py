import os
import sqlite3
import json
import uuid
from datetime import datetime, timezone, date
from pathlib import Path
from typing import Optional, Dict, Any, Set, List

# Path to the SQLite database file (stored in the backend folder by default)
def get_db_path() -> Path:
    override = os.getenv("ASTUTO_DB_PATH")
    if override:
        return Path(override)
    return Path(__file__).parent / "astuto.db"

DB_PATH = get_db_path()

INITIAL_TASKS = [
    {
        "id": "variables-refresher",
        "title": "Variables & Scope Refresher",
        "source": "freeCodeCamp · Python",
        "sourceUrl": "https://www.freecodecamp.org/",
        "estimatedMinutes": 20,
        "slot": "morning",
        "timeLabel": "8:15 AM",
        "completed": True,
        "optional": False,
        "tags": ["Global vs local", "Closures"],
    },
    {
        "id": "lecture-review",
        "title": "Review today's lecture notes",
        "source": "Your study notes",
        "sourceUrl": "https://www.notion.so/",
        "estimatedMinutes": 15,
        "slot": "college",
        "timeLabel": "1:30 PM",
        "completed": False,
        "optional": False,
        "tags": ["Quick recall"],
    },
    {
        "id": "list-comprehensions",
        "title": "List Comprehensions & 4 Practice Drills",
        "source": "Real Python · Practice",
        "sourceUrl": "https://realpython.com/",
        "estimatedMinutes": 40,
        "slot": "evening",
        "timeLabel": "7:30 PM",
        "completed": False,
        "optional": False,
        "tags": ["Matrix flattening", "Filtered key-value maps", "Performance profiling"],
    },
    {
        "id": "flashcard-recall",
        "title": "Flashcard Recall",
        "source": "Anki deck · 15 data structure cards",
        "sourceUrl": "https://apps.ankiweb.net/",
        "estimatedMinutes": 10,
        "slot": "evening",
        "timeLabel": "After practice",
        "completed": False,
        "optional": True,
        "tags": ["Optional"],
    },
    {
        "id": "daily-review",
        "title": "Write one takeaway from today",
        "source": "Daily reflection",
        "sourceUrl": "https://www.notion.so/",
        "estimatedMinutes": 5,
        "slot": "night",
        "timeLabel": "Before bed",
        "completed": False,
        "optional": True,
        "tags": ["Reflection"],
    },
]

def get_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row  # Access columns by name like a dictionary
    return conn

def get_effective_today(client_date: Optional[str] = None) -> str:
    """
    (1) env ASTUTO_OVERRIDE_TODAY if set,
    (2) validated client_date,
    (3) date.today().isoformat().
    Validation: must parse with date.fromisoformat, otherwise raise ValueError.
    client_date must be within 1 day of the server UTC date, otherwise raise ValueError.
    The env override must also parse.
    When the override is set, print one warning line at startup: "WARNING: ASTUTO_OVERRIDE_TODAY is set (dev only)".
    """
    if client_date is not None:
        try:
            c_date = date.fromisoformat(client_date)
        except Exception as e:
            raise ValueError(f"Invalid client_date format: {client_date}") from e

        server_utc_date = datetime.now(timezone.utc).date()
        if abs((c_date - server_utc_date).days) > 1:
            raise ValueError("client_date is more than 1 day from server UTC date")

    override = os.getenv("ASTUTO_OVERRIDE_TODAY")
    if override:
        try:
            return date.fromisoformat(override).isoformat()
        except Exception as e:
            raise ValueError(f"Invalid ASTUTO_OVERRIDE_TODAY format: {override}") from e

    if client_date is not None:
        return date.fromisoformat(client_date).isoformat()

    return date.today().isoformat()

def init_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        # Create the tasks table if it does not already exist
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                source TEXT,
                source_url TEXT,
                estimated_minutes INTEGER,
                slot TEXT,
                time_label TEXT,
                completed INTEGER DEFAULT 0,
                completed_date TEXT DEFAULT NULL,
                optional INTEGER DEFAULT 0,
                tags TEXT
            )
            """
        )

        # For existing databases, ensure completed_date column exists
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [row[1] for row in cursor.fetchall()]
        if "completed_date" not in columns:
            cursor.execute("ALTER TABLE tasks ADD COLUMN completed_date TEXT DEFAULT NULL")

        # If the table is empty, seed it with initial tasks
        cursor.execute("SELECT COUNT(*) FROM tasks")
        count = cursor.fetchone()[0]
        if count == 0:
            for task in INITIAL_TASKS:
                cursor.execute(
                    """
                    INSERT INTO tasks (
                        id, title, source, source_url, estimated_minutes, slot, time_label, completed, completed_date, optional, tags
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
                    """,
                    (
                        task["id"],
                        task["title"],
                        task["source"],
                        task["sourceUrl"],
                        task["estimatedMinutes"],
                        task["slot"],
                        task["timeLabel"],
                        1 if task["completed"] else 0,
                        1 if task["optional"] else 0,
                        json.dumps(task["tags"]),
                    ),
                )

        # Create the settings table if it does not already exist
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
            """
        )

        # Create the streak_state table if it does not already exist
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS streak_state (
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
        cursor.execute("SELECT COUNT(*) FROM streak_state")
        streak_count = cursor.fetchone()[0]
        if streak_count == 0:
            # DEV DEMO SEED, not real-user defaults
            effective_today = get_effective_today()
            now_iso = datetime.now(timezone.utc).isoformat()
            cursor.execute(
                """
                INSERT INTO streak_state (
                    id, current_streak, longest_streak, last_active_date, freezes_held, frozen_dates,
                    prev_streak, prev_longest, prev_last_active_date, updated_at
                ) VALUES (1, 14, 18, ?, 2, '[]', NULL, NULL, NULL, ?)
                """,
                (effective_today, now_iso),
            )

        conn.commit()

def get_streak_state() -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM streak_state WHERE id = 1")
        row = cursor.fetchone()
        if not row:
            return None
        return {
            "id": row["id"],
            "current_streak": row["current_streak"],
            "longest_streak": row["longest_streak"],
            "last_active_date": row["last_active_date"],
            "freezes_held": row["freezes_held"],
            "frozen_dates": row["frozen_dates"],
            "prev_streak": row["prev_streak"],
            "prev_longest": row["prev_longest"],
            "prev_last_active_date": row["prev_last_active_date"],
            "updated_at": row["updated_at"],
        }

def save_streak_state(state: Dict[str, Any]):
    now_iso = datetime.now(timezone.utc).isoformat()
    frozen_dates_val = state.get("frozen_dates", "[]")
    if isinstance(frozen_dates_val, (list, set)):
        frozen_dates_val = json.dumps(list(frozen_dates_val))
    elif frozen_dates_val is None:
        frozen_dates_val = "[]"

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO streak_state (
                id, current_streak, longest_streak, last_active_date, freezes_held, frozen_dates,
                prev_streak, prev_longest, prev_last_active_date, updated_at
            ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                state.get("current_streak", 0),
                state.get("longest_streak", 0),
                state.get("last_active_date"),
                state.get("freezes_held", 0),
                frozen_dates_val,
                state.get("prev_streak"),
                state.get("prev_longest"),
                state.get("prev_last_active_date"),
                now_iso,
            ),
        )
        conn.commit()

def get_completed_dates() -> Set[str]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT DISTINCT completed_date FROM tasks WHERE completed = 1 AND completed_date IS NOT NULL"
        )
        rows = cursor.fetchall()
        return {row[0] for row in rows if row[0]}

DEFAULT_SETTINGS = {
    "tone": "gentle",
    "reminders": {
        "daily": True,
        "preSession": True,
    },
    "slots": [
        {"id": "morning", "label": "Morning", "minutes": 20, "startTime": "8:15 AM"},
        {"id": "college", "label": "College", "minutes": 15, "startTime": "1:30 PM"},
        {"id": "evening", "label": "Evening", "minutes": 45, "startTime": "7:30 PM"},
        {"id": "night", "label": "Night", "minutes": 10, "startTime": "10:30 PM"},
    ],
}

def get_settings_from_db():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = 'user_preferences'")
        row = cursor.fetchone()
        if row:
            return json.loads(row["value"])
        return DEFAULT_SETTINGS

def save_settings_to_db(settings_data: dict):
    current = get_settings_from_db()
    merged = dict(current)
    for key, value in settings_data.items():
        if isinstance(value, dict) and isinstance(merged.get(key), dict):
            merged[key] = {**merged[key], **value}
        else:
            merged[key] = value

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ('user_preferences', ?)",
            (json.dumps(merged),),
        )
        conn.commit()
        return merged

def fetch_all_tasks():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks")
        rows = cursor.fetchall()
        result = []
        for row in rows:
            result.append({
                "id": row["id"],
                "title": row["title"],
                "source": row["source"],
                "sourceUrl": row["source_url"],
                "estimatedMinutes": row["estimated_minutes"],
                "slot": row["slot"],
                "timeLabel": row["time_label"],
                "completed": bool(row["completed"]),
                "completedDate": row["completed_date"] if "completed_date" in row.keys() else None,
                "optional": bool(row["optional"]),
                "tags": json.loads(row["tags"]) if row["tags"] else [],
            })
        return result

def complete_task_in_db(task_id: str, completion_date: Optional[str] = None):
    if completion_date is None:
        completion_date = get_effective_today()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE tasks SET completed = 1, completed_date = ? WHERE id = ?",
            (completion_date, task_id),
        )
        conn.commit()
        if cursor.rowcount == 0:
            return None
        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        row = cursor.fetchone()
        return {
            "id": row["id"],
            "title": row["title"],
            "source": row["source"],
            "sourceUrl": row["source_url"],
            "estimatedMinutes": row["estimated_minutes"],
            "slot": row["slot"],
            "timeLabel": row["time_label"],
            "completed": bool(row["completed"]),
            "completedDate": row["completed_date"] if "completed_date" in row.keys() else None,
            "optional": bool(row["optional"]),
            "tags": json.loads(row["tags"]) if row["tags"] else [],
        }

def create_task_in_db(data: dict):
    task_id = f"task-{uuid.uuid4().hex[:8]}"
    title = data.get("title", "Untitled Task")
    source = data.get("source", "Personal Practice")
    source_url = data.get("source_url", "https://python.org")
    estimated_minutes = int(data.get("estimated_minutes", 15))
    slot = data.get("slot", "evening")
    time_label = data.get("time_label", "Flexible")
    optional = bool(data.get("optional", False))
    tags = data.get("tags", ["Custom"])

    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO tasks (
                id, title, source, source_url, estimated_minutes, slot, time_label, completed, completed_date, optional, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
            """,
            (
                task_id,
                title,
                source,
                source_url,
                estimated_minutes,
                slot,
                time_label,
                0,
                1 if optional else 0,
                json.dumps(tags),
            ),
        )
        conn.commit()

        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        row = cursor.fetchone()
        return {
            "id": row["id"],
            "title": row["title"],
            "source": row["source"],
            "sourceUrl": row["source_url"],
            "estimatedMinutes": row["estimated_minutes"],
            "slot": row["slot"],
            "timeLabel": row["time_label"],
            "completed": bool(row["completed"]),
            "completedDate": row["completed_date"] if "completed_date" in row.keys() else None,
            "optional": bool(row["optional"]),
            "tags": json.loads(row["tags"]) if row["tags"] else [],
        }

def toggle_task_in_db(task_id: str, completion_date: Optional[str] = None):
    if completion_date is None:
        completion_date = get_effective_today()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT completed FROM tasks WHERE id = ?", (task_id,))
        row = cursor.fetchone()
        if not row:
            return None
        new_status = 0 if row["completed"] else 1
        new_date = completion_date if new_status == 1 else None
        cursor.execute(
            "UPDATE tasks SET completed = ?, completed_date = ? WHERE id = ?",
            (new_status, new_date, task_id),
        )
        conn.commit()

        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        updated_row = cursor.fetchone()
        return {
            "id": updated_row["id"],
            "title": updated_row["title"],
            "source": updated_row["source"],
            "sourceUrl": updated_row["source_url"],
            "estimatedMinutes": updated_row["estimated_minutes"],
            "slot": updated_row["slot"],
            "timeLabel": updated_row["time_label"],
            "completed": bool(updated_row["completed"]),
            "completedDate": updated_row["completed_date"] if "completed_date" in updated_row.keys() else None,
            "optional": bool(updated_row["optional"]),
            "tags": json.loads(updated_row["tags"]) if updated_row["tags"] else [],
        }

def delete_task_in_db(task_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
        return cursor.rowcount > 0
