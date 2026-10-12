from datetime import datetime, timezone, timedelta

def get_progress_activity():
    activity_pattern = [0, 16, 24, 0, 12, 30, 0, 20, 15, 35, 10, 0, 22, 28]
    recent_streak = [45, 60, 55, 75, 40, 65, 80, 45, 60, 50, 75, 55, 70, 60]

    now = datetime.now(timezone.utc)
    today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    days_since_monday = today.weekday()
    first_day = today - timedelta(days=84 + days_since_monday)

    activity = []
    for i in range(91):
        day_date = first_day + timedelta(days=i)
        date_str = day_date.strftime("%Y-%m-%d")
        days_before_today = (today - day_date).days
        is_today = (days_before_today == 0)

        if days_before_today < 0:
            minutes = 0
        elif days_before_today < 14:
            minutes = recent_streak[13 - days_before_today]
        else:
            minutes = activity_pattern[i % len(activity_pattern)]

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
    "currentDays": 14,
    "personalBest": 18,
    "weeklyTargetDays": 7,
    "completedDays": 5,
    "freezeCount": 2,
    "topPercent": 4,
}

def reshuffle_plan(mode: str, use_freezes: bool = True):
    freezes_used = 0
    if use_freezes and STREAK_STATE["freezeCount"] >= 2:
        STREAK_STATE["freezeCount"] -= 2
        freezes_used = 2

    if mode == "extend":
        DEFAULT_PLAN["totalDays"] += 2

    DEFAULT_PLAN["missedDays"] = 0

    return {
        "success": True,
        "mode": mode,
        "freezesUsed": freezes_used,
        "remainingFreezes": STREAK_STATE["freezeCount"],
        "totalDays": DEFAULT_PLAN["totalDays"],
    }

def get_stats_data():
    streak_info = dict(STREAK_STATE)
    try:
        from database import get_streak_state
        db_state = get_streak_state()
        if db_state:
            streak_info["currentDays"] = db_state["current_streak"]
            streak_info["personalBest"] = db_state["longest_streak"]
            streak_info["freezeCount"] = db_state["freezes_held"]
            streak_info["lastActiveDate"] = db_state["last_active_date"]
    except Exception:
        pass

    return {
        "streak": streak_info,
        "predictedMastery": 94,
        "dailyRetention": [32, 41, 52, 48, 59, 72, 94],
        "weeklyMinutes": 420,
        "weeklyGoalMinutes": 600,
        "milestoneTitle": "CLIBudget Engine",
        "milestoneProgress": 65,
        "roadmap": {
            "hoursLearned": 34,
            "swot": {
                "strengths": ["Consistent 14-day streak", "Strong pattern spotting"],
                "weaknesses": ["More debugging practice", "Reviewing before rushing"],
                "opportunities": ["Build small data projects", "Practice with real APIs"],
                "threats": ["Busy college weeks", "Long sessions crowding evenings"],
            },
            "motivation": 78,
            "skillLevel": {
                "label": "Curious learner",
                "progress": 42,
                "nextLevel": "Confident builder",
            },
        },
        "learningProgress": {
            "tasksCompleted": 28,
            "taskGoal": 180,
            "activity": get_progress_activity(),
            "badges": [
                {
                    "id": "first-spark",
                    "title": "First Spark",
                    "description": "Completed the first focused learning session.",
                    "icon": "sparkles",
                    "status": "earned",
                    "unlockedLabel": "Day 1",
                },
                {
                    "id": "fortnight-warrior",
                    "title": "Fortnight Warrior",
                    "description": "Kept a 14-day learning streak going.",
                    "icon": "flame",
                    "status": "earned",
                    "unlockedLabel": "Today",
                },
                {
                    "id": "syntax-sorcerer",
                    "title": "Syntax Sorcerer",
                    "description": "Practiced Python syntax across the first week.",
                    "icon": "code",
                    "status": "earned",
                    "unlockedLabel": "Week 1",
                },
                {
                    "id": "cli-master",
                    "title": "CLI Master",
                    "description": "Create five useful command-line scripts.",
                    "icon": "terminal",
                    "status": "in-progress",
                    "progress": 3,
                    "target": 5,
                },
                {
                    "id": "thirty-day-rhythm",
                    "title": "30-Day Rhythm",
                    "description": "Maintain a steady practice habit for 30 days.",
                    "icon": "calendar",
                    "status": "in-progress",
                    "progress": 14,
                    "target": 30,
                },
                {
                    "id": "halfway-mark",
                    "title": "Halfway Mark",
                    "description": "Reach the midpoint of the 90-day learning plan.",
                    "icon": "target",
                    "status": "upcoming",
                    "progress": 14,
                    "target": 45,
                },
                {
                    "id": "ninety-day-finish",
                    "title": "90-Day Finisher",
                    "description": "Complete the full learning plan and project work.",
                    "icon": "trophy",
                    "status": "upcoming",
                    "progress": 14,
                    "target": 90,
                },
            ],
            "shareQuote": "Day 14 in the books. One small practice at a time.",
        },
    }
