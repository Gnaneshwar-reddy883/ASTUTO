import sqlite3
import json
import uuid
from pathlib import Path

# Path to the SQLite database file (stored in the backend folder)
DB_PATH = Path(__file__).parent / "astuto.db"

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
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Access columns by name like a dictionary
    return conn

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
                optional INTEGER DEFAULT 0,
                tags TEXT
            )
            """
        )
        # If the table is empty, seed it with initial tasks
        cursor.execute("SELECT COUNT(*) FROM tasks")
        count = cursor.fetchone()[0]
        if count == 0:
            for task in INITIAL_TASKS:
                cursor.execute(
                    """
                    INSERT INTO tasks (
                        id, title, source, source_url, estimated_minutes, slot, time_label, completed, optional, tags
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        conn.commit()

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
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ('user_preferences', ?)",
            (json.dumps(settings_data),),
        )
        conn.commit()
        return settings_data

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
                "optional": bool(row["optional"]),
                "tags": json.loads(row["tags"]) if row["tags"] else [],
            })
        return result

def complete_task_in_db(task_id: str):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE tasks SET completed = 1 WHERE id = ?", (task_id,))
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
                id, title, source, source_url, estimated_minutes, slot, time_label, completed, optional, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            "optional": bool(row["optional"]),
            "tags": json.loads(row["tags"]) if row["tags"] else [],
        }

def toggle_task_in_db(task_id: str):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT completed FROM tasks WHERE id = ?", (task_id,))
        row = cursor.fetchone()
        if not row:
            return None
        new_status = 0 if row["completed"] else 1
        cursor.execute("UPDATE tasks SET completed = ? WHERE id = ?", (new_status, task_id))
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
            "optional": bool(updated_row["optional"]),
            "tags": json.loads(updated_row["tags"]) if updated_row["tags"] else [],
        }

def delete_task_in_db(task_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
        return cursor.rowcount > 0
