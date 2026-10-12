import os
import json
from typing import Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import (
    init_db,
    fetch_all_tasks,
    complete_task_in_db,
    create_task_in_db,
    toggle_task_in_db,
    delete_task_in_db,
    get_settings_from_db,
    save_settings_to_db,
    get_streak_state,
    save_streak_state,
    get_completed_dates,
    get_effective_today,
)
from streak_rules import evaluate_streak
from plan_data import DEFAULT_PLAN, get_stats_data, reshuffle_plan

app = FastAPI()

# Allow requests from the Vite frontend running on port 5000 or 5173
origins = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas
class AiMessageRequest(BaseModel):
    message: str

class ReshuffleRequest(BaseModel):
    mode: str = "spread"  # "spread" or "extend"
    use_freezes: bool = True

class CreateTaskRequest(BaseModel):
    title: str
    estimated_minutes: int = 15
    slot: str = "evening"  # "morning", "college", "evening", "night"
    source: str = "Personal Practice"
    source_url: str = "https://python.org"
    time_label: str = "Flexible"
    optional: bool = False
    tags: list[str] = ["Custom"]

def sync_streak_state(client_date: Optional[str] = None) -> dict:
    effective_today = get_effective_today(client_date)
    state = get_streak_state()
    if state is None:
        init_db()
        state = get_streak_state()
    completed_dates = get_completed_dates()
    new_state = evaluate_streak(state, effective_today, completed_dates)
    save_streak_state(new_state)
    return new_state

# Initialize SQLite database on startup
@app.on_event("startup")
def startup_event():
    init_db()
    if os.getenv("ASTUTO_OVERRIDE_TODAY"):
        print("WARNING: ASTUTO_OVERRIDE_TODAY is set (dev only)")

@app.get("/")
def read_root():
    return {"message": "Welcome to the ASTUTO API!"}

@app.get("/health")
def get_health():
    return {"status": "ok"}

@app.get("/api/plan")
def get_plan():
    return DEFAULT_PLAN

@app.get("/api/stats")
def get_stats(client_date: Optional[str] = None):
    try:
        new_state = sync_streak_state(client_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    stats = get_stats_data()
    stats["streak"]["currentDays"] = new_state["current_streak"]
    stats["streak"]["personalBest"] = new_state["longest_streak"]
    stats["streak"]["freezeCount"] = new_state["freezes_held"]
    stats["streak"]["lastActiveDate"] = new_state["last_active_date"]

    frozen_dates_raw = new_state.get("frozen_dates", "[]")
    if isinstance(frozen_dates_raw, str):
        try:
            stats["streak"]["frozenDates"] = json.loads(frozen_dates_raw)
        except Exception:
            stats["streak"]["frozenDates"] = []
    elif isinstance(frozen_dates_raw, (list, set)):
        stats["streak"]["frozenDates"] = list(frozen_dates_raw)
    else:
        stats["streak"]["frozenDates"] = []

    return stats

@app.get("/api/settings")
def get_settings():
    return get_settings_from_db()

@app.put("/api/settings")
def put_settings(body: dict):
    return save_settings_to_db(body)

@app.get("/api/plan/today/tasks")
def get_today_tasks():
    return fetch_all_tasks()

@app.post("/api/tasks", status_code=201)
def post_create_task(body: CreateTaskRequest):
    return create_task_in_db(body.dict())

@app.post("/api/tasks/{task_id}/toggle")
async def post_toggle_task(
    task_id: str,
    request: Request,
    client_date: Optional[str] = None,
):
    effective_client_date = client_date
    if effective_client_date is None:
        try:
            body = await request.json()
            if isinstance(body, dict) and "client_date" in body:
                effective_client_date = body["client_date"]
        except Exception:
            pass

    try:
        effective_today = get_effective_today(effective_client_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    task = toggle_task_in_db(task_id, completion_date=effective_today)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")

    sync_streak_state(effective_client_date)
    return task

@app.post("/api/tasks/{task_id}/complete")
async def complete_task(
    task_id: str,
    request: Request,
    client_date: Optional[str] = None,
):
    effective_client_date = client_date
    if effective_client_date is None:
        try:
            body = await request.json()
            if isinstance(body, dict) and "client_date" in body:
                effective_client_date = body["client_date"]
        except Exception:
            pass

    try:
        effective_today = get_effective_today(effective_client_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    task = complete_task_in_db(task_id, completion_date=effective_today)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")

    sync_streak_state(effective_client_date)
    return task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str):
    success = delete_task_in_db(task_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Task '{task_id}' not found")
    return {"success": True, "deleted_id": task_id}

@app.post("/api/ai/messages")
def post_ai_message(body: AiMessageRequest):
    user_text = body.message.lower()

    if "reschedule" in user_text:
        reply = "I can help make today lighter. Move the 40-minute practice to tomorrow evening, and keep the 15-minute lecture review for today?"
    elif "pause" in user_text:
        reply = "A short pause is okay. Your plan stays here; when you return, we can shift the next few sessions without losing your progress."
    elif "swap" in user_text or "resource" in user_text:
        reply = "Try the 12-minute walkthrough from Real Python instead of the longer reading. You can keep the same practice drills afterward."
    elif "hello" in user_text or "hi" in user_text:
        reply = "Hello Alex! I'm your ASTUTO learning companion. How is your Python practice going today?"
    elif "help" in user_text:
        reply = "I can help you reschedule busy days, swap out difficult study materials, or break big projects into quick daily drills."
    else:
        reply = f"Got it! You asked: \"{body.message}\". Let's keep your momentum going—focus on completing one small step at a time today."

    return {"reply": reply}

@app.post("/api/plan/reshuffle")
def post_plan_reshuffle(body: ReshuffleRequest):
    streak_state = get_streak_state()
    freezes_held = streak_state["freezes_held"] if streak_state else 0
    return reshuffle_plan(mode=body.mode, use_freezes=body.use_freezes, freezes_held=freezes_held)
