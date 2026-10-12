from datetime import date
from typing import Any, Dict, Optional, Set

FREEZE_CONFIG = {
    "freezeStartCount": 1,
    "freezeCap": 2,
    "freezeMilestoneEvery": 7,
    "freezeCostPerDay": 1,
}

def evaluate_streak(
    state: Dict[str, Any],
    today_local_date: str,
    completed_dates: Set[str],
    config: Dict[str, Any] = FREEZE_CONFIG,
) -> Dict[str, Any]:
    """
    Pure streak evaluation function for Branch A.
    Returns a new state dict and never mutates its input.
    """
    new_state = dict(state)
    today_is_active = today_local_date in completed_dates

    last_active_str = state.get("last_active_date")
    if last_active_str is None:
        # Rule c: If last_active is None
        if today_is_active:
            new_state["current_streak"] = 1
            new_state["longest_streak"] = max(new_state.get("longest_streak", 0), 1)
            new_state["last_active_date"] = today_local_date
            # Branch B: Milestone freeze check will go here
        return new_state

    today = date.fromisoformat(today_local_date)
    last_active = date.fromisoformat(last_active_str)
    days_diff = (today - last_active).days

    # Rule b: If days_diff < 0: return state unchanged
    if days_diff < 0:
        return new_state

    # Rule d: If days_diff == 0 (today is the last active date)
    if days_diff == 0:
        if not today_is_active:
            # If today is NOT active and a snapshot exists, restore from snapshot
            if state.get("prev_last_active_date") is not None:
                new_state["current_streak"] = state["prev_streak"]
                new_state["longest_streak"] = state["prev_longest"]
                new_state["last_active_date"] = state["prev_last_active_date"]
                new_state["prev_streak"] = None
                new_state["prev_longest"] = None
                new_state["prev_last_active_date"] = None
            # If no snapshot exists, leave unchanged
        # If active, leave unchanged (no double increment)
        return new_state

    # Rule e: If days_diff == 1 (consecutive day)
    elif days_diff == 1:
        if today_is_active:
            # Save snapshot of current state before incrementing
            new_state["prev_streak"] = state["current_streak"]
            new_state["prev_longest"] = state["longest_streak"]
            new_state["prev_last_active_date"] = state["last_active_date"]

            new_state["current_streak"] = state["current_streak"] + 1
            new_state["longest_streak"] = max(state["longest_streak"], new_state["current_streak"])
            new_state["last_active_date"] = today_local_date
            # Branch B: Milestone freeze check (+1 freeze every 7 days) will go here
        # If not active, unchanged (user still has time today)
        return new_state

    # Rule f: If days_diff >= 2 (one or more full days were missed)
    else:
        # Branch B: Check freezes_held and auto-consume freezes / record frozen_dates here
        if today_is_active:
            # Active today after a gap: start a new streak of 1
            new_state["prev_streak"] = state["current_streak"]
            new_state["prev_longest"] = state["longest_streak"]
            new_state["prev_last_active_date"] = state["last_active_date"]

            new_state["current_streak"] = 1
            new_state["last_active_date"] = today_local_date
            # longest_streak is preserved
        else:
            # Missed days and not active today: streak resets to 0
            new_state["current_streak"] = 0
            # longest_streak and last_active_date remain unchanged

        return new_state
