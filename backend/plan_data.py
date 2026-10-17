from datetime import datetime, timezone, timedelta, date
from typing import Optional, Dict

def get_progress_activity(effective_today: str, activity_by_date: Optional[dict] = None) -> list:
    if activity_by_date is None:
        activity_by_date = {}

    today = date.fromisoformat(effective_today)
    days_since_monday = today.weekday()
    first_day = today - timedelta(days=84 + days_since_monday)

    activity = []
    for i in range(91):
        day_date = first_day + timedelta(days=i)
        date_str = day_date.isoformat()
        days_before_today = (today - day_date).days
        is_today = (days_before_today == 0)

        if days_before_today < 0:
            minutes = 0
        else:
            minutes = activity_by_date.get(date_str, 0)

        activity.append({
            "date": date_str,
            "minutes": minutes,
            "isToday": is_today,
        })
    return activity

DEFAULT_PLAN = {
    "id": "plan-python-foundations",
    "user": {
        "id": "user-alex",
        "name": "Alex Kumar",
        "avatarInitials": "AK",
        "skillName": "Python for Data Science",
    },
    "skillName": "Python for Data Science",
    "currentDay": 14,
    "totalDays": 90,
    "missedDays": 0,
    "currentPhase": {
        "id": "phase-foundations",
        "name": "Phase 1",
        "title": "Foundations & Core Logic",
        "subtitle": "Build the habits and Python fundamentals that make everything else easier.",
        "progress": 65,
        "nextUnlock": "Phase 2: Web Scraping & APIs",
        "nextUnlockInDays": 7,
    },
    "roadmap": [
        {
            "id": "plan-setup",
            "name": "Getting started",
            "title": "Learning setup",
            "subtitle": "Your goal and weekly rhythm are in place.",
            "status": "completed",
            "months": [
                {
                    "title": "Getting started",
                    "weeks": [{"label": "Week 1", "taskCount": 4}],
                },
            ],
            "milestoneAfter": "First script written",
        },
        {
            "id": "phase-foundations",
            "name": "Phase 1",
            "title": "Foundations & Core Logic",
            "subtitle": "Build strong Python habits and core problem-solving skills.",
            "status": "current",
            "progress": 65,
            "months": [
                {
                    "title": "Month 1: Basics",
                    "weeks": [
                        {"label": "Week 1", "taskCount": 5},
                        {"label": "Week 2", "taskCount": 6},
                        {"label": "Week 3", "taskCount": 5},
                        {"label": "Week 4", "taskCount": 4},
                    ],
                },
                {
                    "title": "Month 2: Core logic",
                    "weeks": [
                        {"label": "Week 5", "taskCount": 5},
                        {"label": "Week 6", "taskCount": 6},
                        {"label": "Week 7", "taskCount": 4},
                    ],
                },
            ],
            "milestoneAfter": "Foundations complete",
        },
        {
            "id": "phase-apis",
            "name": "Phase 2",
            "title": "Web Scraping & APIs",
            "subtitle": "Collect real information and work with useful data sources.",
            "status": "upcoming",
            "months": [
                {
                    "title": "Month 3: Data collection",
                    "weeks": [
                        {"label": "Week 8", "taskCount": 5},
                        {"label": "Week 9", "taskCount": 5},
                        {"label": "Week 10", "taskCount": 4},
                    ],
                },
            ],
            "milestoneAfter": "First API project",
        },
        {
            "id": "phase-analysis",
            "name": "Phase 3",
            "title": "Data Analysis & Visualization",
            "subtitle": "Turn raw datasets into clear, useful insights.",
            "status": "upcoming",
            "months": [
                {
                    "title": "Month 4: Find the story",
                    "weeks": [
                        {"label": "Week 11", "taskCount": 5},
                        {"label": "Week 12", "taskCount": 6},
                        {"label": "Week 13", "taskCount": 4},
                    ],
                },
            ],
            "milestoneAfter": "Insights shared",
        },
        {
            "id": "phase-portfolio",
            "name": "Phase 4",
            "title": "Portfolio Projects",
            "subtitle": "Bring your skills together in practical work you can show.",
            "status": "upcoming",
            "months": [
                {
                    "title": "Month 5: Build and share",
                    "weeks": [
                        {"label": "Week 14", "taskCount": 4},
                        {"label": "Week 15", "taskCount": 5},
                        {"label": "Week 16", "taskCount": 3},
                    ],
                },
            ],
            "milestoneAfter": "Portfolio ready",
        },
        {
            "id": "goal-independent",
            "name": "Your goal",
            "title": "Independent Python learner",
            "subtitle": "Keep building, exploring, and solving real problems.",
            "status": "goal",
            "months": [],
        },
    ],
    "week": {
        "label": "This week",
        "completedMinutes": 420,
        "goalMinutes": 600,
        "days": [
            {"id": "mon", "label": "M", "date": "Mon", "status": "complete"},
            {"id": "tue", "label": "T", "date": "Tue", "status": "complete"},
            {"id": "wed", "label": "W", "date": "Wed", "status": "complete"},
            {"id": "thu", "label": "T", "date": "Thu", "status": "today"},
            {"id": "fri", "label": "F", "date": "Fri", "status": "upcoming"},
            {"id": "sat", "label": "S", "date": "Sat", "status": "upcoming"},
            {"id": "sun", "label": "S", "date": "Sun", "status": "upcoming"},
        ],
    },
    "resources": [
        {
            "id": "github-roadmap",
            "title": "Python learning roadmap",
            "source": "GitHub",
            "kind": "GitHub repo",
            "url": "https://github.com/",
        },
        {
            "id": "video-comprehensions",
            "title": "List comprehensions, explained",
            "source": "Real Python",
            "kind": "YouTube",
            "url": "https://www.youtube.com/",
            "duration": "12 min",
        },
        {
            "id": "article-complexity",
            "title": "A quick guide to time complexity",
            "source": "Python Morsels",
            "kind": "Article",
            "url": "https://www.pythonmorsels.com/",
            "duration": "8 min",
        },
    ],
}

STREAK_STATE = {
    "currentDays": 0,
    "personalBest": 0,
    "weeklyTargetDays": 7,
    "completedDays": 0,
    "freezeCount": 1,
    "topPercent": 0,
}

def reshuffle_plan(mode: str, use_freezes: bool = True, freezes_held: Optional[int] = None):
    # Reshuffle never changes freezes; freezes are auto-managed exclusively by the streak engine
    remaining = freezes_held if freezes_held is not None else STREAK_STATE.get("freezeCount", 0)

    if mode == "extend":
        DEFAULT_PLAN["totalDays"] += 2

    DEFAULT_PLAN["missedDays"] = 0

    return {
        "success": True,
        "mode": mode,
        "freezesUsed": 0,
        "remainingFreezes": remaining,
        "totalDays": DEFAULT_PLAN["totalDays"],
    }

def get_stats_data(
    tasks_completed: int,
    weekly_minutes: int,
    hours_learned: float,
    completed_days: int,
    activity: list,
    longest_streak: int,
):
    streak_info = dict(STREAK_STATE)
    streak_info["completedDays"] = completed_days
    streak_info["topPercent"] = 0

    fs_progress = min(tasks_completed, 1)
    fw_progress = min(longest_streak, 14)
    tdr_progress = min(longest_streak, 30)

    badges = [
        {
            "id": "first-spark",
            "title": "First Spark",
            "description": "Completed the first focused learning session.",
            "icon": "sparkles",
            "status": "earned" if fs_progress >= 1 else ("in-progress" if fs_progress > 0 else "upcoming"),
            "progress": fs_progress,
            "target": 1,
        },
        {
            "id": "fortnight-warrior",
            "title": "Fortnight Warrior",
            "description": "Keep a 14-day learning streak going.",
            "icon": "flame",
            "status": "earned" if fw_progress >= 14 else ("in-progress" if fw_progress > 0 else "upcoming"),
            "progress": fw_progress,
            "target": 14,
        },
        {
            "id": "thirty-day-rhythm",
            "title": "30-Day Rhythm",
            "description": "Maintain a steady practice habit for 30 days.",
            "icon": "calendar",
            "status": "earned" if tdr_progress >= 30 else ("in-progress" if tdr_progress > 0 else "upcoming"),
            "progress": tdr_progress,
            "target": 30,
        },
    ]

    return {
        "streak": streak_info,
        "predictedMastery": 0,
        "dailyRetention": [],
        "weeklyMinutes": weekly_minutes,
        "weeklyGoalMinutes": 600,
        "milestoneTitle": "CLIBudget Engine",
        "milestoneProgress": 0,
        "roadmap": {
            "hoursLearned": hours_learned,
            "swot": {
                "strengths": [],
                "weaknesses": [],
                "opportunities": [],
                "threats": [],
            },
            "motivation": 0,
            "skillLevel": {
                "label": "Curious learner",
                "progress": 0,
                "nextLevel": "Confident builder",
            },
        },
        "learningProgress": {
            "tasksCompleted": tasks_completed,
            "taskGoal": 180,
            "activity": activity,
            "badges": badges,
            "shareQuote": "One small practice at a time.",
        },
    }
