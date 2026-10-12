import json
from datetime import date, timedelta
from typing import Any, Dict, List, Optional, Set

FREEZE_CONFIG = {
    "freezeStartCount": 1,
    "freezeCap": 2,
    "freezeMilestoneEvery": 7,
    "freezeCostPerDay": 1,
}

def prune_frozen_dates(
    frozen_dates: Any,
    reference_date: str,
    max_age_days: int = 30,
) -> List[str]:
    """
    Prune a list/set/JSON-string of frozen dates to only those within max_age_days
    of reference_date (inclusive). Returns a sorted list of ISO date strings.
    """
    if isinstance(frozen_dates, str):
        try:
            dates_list = json.loads(frozen_dates)
        except Exception:
            dates_list = []
    elif isinstance(frozen_dates, (list, set)):
        dates_list = list(frozen_dates)
    else:
        dates_list = []

    ref_d = date.fromisoformat(reference_date)
    cutoff = ref_d - timedelta(days=max_age_days)

    pruned = []
    for d_str in dates_list:
        try:
            d = date.fromisoformat(d_str)
            if d >= cutoff:
                pruned.append(d_str)
        except Exception:
            continue
    return sorted(list(set(pruned)))

def evaluate_streak(
    state: Dict[str, Any],
    today_local_date: str,
    completed_dates: Set[str],
    config: Dict[str, Any] = FREEZE_CONFIG,
) -> Dict[str, Any]:
    """
    Pure streak evaluation function for Branch B.
    Returns a new state dict and never mutates its input.
    """
    new_state = dict(state)
    today_is_active = today_local_date in completed_dates

    # Parse frozen dates from state into a set
    raw_frozen = state.get("frozen_dates", "[]")
    if isinstance(raw_frozen, str):
        try:
            frozen_set = set(json.loads(raw_frozen))
        except Exception:
            frozen_set = set()
    elif isinstance(raw_frozen, (list, set)):
        frozen_set = set(raw_frozen)
    else:
        frozen_set = set()

    last_active_str = state.get("last_active_date")
    if last_active_str is None:
        # Rule c: If last_active is None
        if today_is_active:
            # Snapshot before changes (Amendment 2)
            new_state["prev_streak"] = state.get("current_streak")
            new_state["prev_longest"] = state.get("longest_streak")
            new_state["prev_last_active_date"] = None
            new_state["prev_freezes_held"] = state.get("freezes_held")
            new_state["prev_frozen_dates"] = state.get("frozen_dates")

            new_state["current_streak"] = 1
            new_state["longest_streak"] = max(new_state.get("longest_streak", 0) or 0, 1)
            new_state["last_active_date"] = today_local_date
            # Check milestone: 1 % 7 != 0
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
            # If today is NOT active and a snapshot exists, restore all five fields (Amendment 2)
            if state.get("prev_last_active_date") is not None or state.get("prev_streak") is not None:
                new_state["current_streak"] = state["prev_streak"]
                new_state["longest_streak"] = state["prev_longest"]
                new_state["last_active_date"] = state["prev_last_active_date"]
                if "prev_freezes_held" in state and state["prev_freezes_held"] is not None:
                    new_state["freezes_held"] = state["prev_freezes_held"]
                if "prev_frozen_dates" in state and state["prev_frozen_dates"] is not None:
                    new_state["frozen_dates"] = state["prev_frozen_dates"]
                new_state["prev_streak"] = None
                new_state["prev_longest"] = None
                new_state["prev_last_active_date"] = None
                new_state["prev_freezes_held"] = None
                new_state["prev_frozen_dates"] = None
            # If no snapshot exists, leave unchanged
        # If active, leave unchanged (no double increment)
        return new_state

    # Rule e: If days_diff == 1 (consecutive day)
    elif days_diff == 1:
        if today_is_active:
            # Save snapshot of all five fields before incrementing (Amendment 2)
            new_state["prev_streak"] = state["current_streak"]
            new_state["prev_longest"] = state["longest_streak"]
            new_state["prev_last_active_date"] = state["last_active_date"]
            new_state["prev_freezes_held"] = state.get("freezes_held")
            new_state["prev_frozen_dates"] = state.get("frozen_dates")

            new_streak = state["current_streak"] + 1
            new_state["current_streak"] = new_streak
            new_state["longest_streak"] = max(state["longest_streak"], new_streak)
            new_state["last_active_date"] = today_local_date

            # Milestone freeze check (+1 freeze every 7 days, up to cap)
            if new_streak > 0 and new_streak % config["freezeMilestoneEvery"] == 0:
                current_freezes = new_state.get("freezes_held", 0)
                if current_freezes < config["freezeCap"]:
                    new_state["freezes_held"] = current_freezes + 1
        # If not active, unchanged (user still has time today)
        return new_state

    # Rule f: If days_diff >= 2 (one or more full days were missed)
    else:
        # Candidate missed calendar dates strictly between last_active and today
        candidate_missed = [
            (last_active + timedelta(days=k)).isoformat()
            for k in range(1, days_diff)
        ]
        # Intermediate gap dates that are not yet frozen
        unprotected_missed = [d for d in candidate_missed if d not in frozen_set]
        needed_freezes = len(unprotected_missed) * config["freezeCostPerDay"]
        available_freezes = state.get("freezes_held", 0)
        can_cover_gap = (available_freezes >= needed_freezes)

        if not today_is_active:
            # Amendment 1: Plain app open with no completion
            # Return displayed streak (preserved if enough freezes cover the gap, else 0)
            # WITHOUT writing frozen_dates or deducting freezes.
            if can_cover_gap:
                new_state["current_streak"] = state["current_streak"]
            else:
                new_state["current_streak"] = 0
            # freezes_held, frozen_dates, and last_active_date remain unchanged
            return new_state

        else:
            # User completed a task today (today_is_active == True)
            # Snapshot all five fields before any change (Amendment 2)
            new_state["prev_streak"] = state["current_streak"]
            new_state["prev_longest"] = state["longest_streak"]
            new_state["prev_last_active_date"] = state["last_active_date"]
            new_state["prev_freezes_held"] = state.get("freezes_held")
            new_state["prev_frozen_dates"] = state.get("frozen_dates")

            if can_cover_gap:
                # Deduct freezes and persist frozen_dates
                updated_frozen_set = set(frozen_set)
                for d in unprotected_missed:
                    updated_frozen_set.add(d)

                new_state["freezes_held"] = available_freezes - needed_freezes
                # Preserve representation type (list or JSON str)
                if isinstance(raw_frozen, list):
                    new_state["frozen_dates"] = sorted(list(updated_frozen_set))
                else:
                    new_state["frozen_dates"] = json.dumps(sorted(list(updated_frozen_set)))

                # Streak continues across the frozen gap and increments by 1 for today
                new_streak = state["current_streak"] + 1
                new_state["current_streak"] = new_streak
                new_state["longest_streak"] = max(state["longest_streak"], new_streak)
                new_state["last_active_date"] = today_local_date

                # Milestone check (+1 freeze every 7 days, up to cap)
                if new_streak > 0 and new_streak % config["freezeMilestoneEvery"] == 0:
                    current_freezes = new_state.get("freezes_held", 0)
                    if current_freezes < config["freezeCap"]:
                        new_state["freezes_held"] = current_freezes + 1
            else:
                # Gap is larger than freezes held:
                # When the gap is larger than freezes held, consume nothing, and on the next completion start at 1.
                new_state["current_streak"] = 1
                new_state["last_active_date"] = today_local_date
                new_state["longest_streak"] = max(state["longest_streak"], 1)
                # freezes_held and frozen_dates are unchanged

            return new_state
