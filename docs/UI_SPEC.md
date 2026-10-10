# ASTUTO UI specification

## Product (5 lines)
1. ASTUTO helps students turn a long-term learning goal into a steady daily practice.
2. The experience should feel like a calm, personal coach that respects a learner's real schedule.
3. A learner can see the next useful step without having to plan the whole day again.
4. Small completions build visible momentum toward practical project milestones.
5. A lightweight AI companion helps adjust a plan without judgment.

## Routes
- `/` — public ASTUTO landing page with an interactive skill prompt and product overview; outside `AppShell`.
- `/onboarding` — four local-state steps for skill, current level, target duration, and morning/college/evening/night minutes; finish passes the draft through router state.
- `/roadmap-preview` — front-end-only roadmap phases, source comparison count, first-week preview, and navigation to `/today`; outside `AppShell`.
- `/today` — today's schedule, task completion, progress summary, resources, and mock AI drawer.
- `/roadmap` — six-phase zigzag learning flowchart, expandable month/week plan, and learning statistics.
- `/progress` — streak and freeze tokens, summary metrics, a soft-green activity heatmap, earned/upcoming badges, and a local-only mock share card.
- `/settings` — active plan summary, daily minutes for morning/college/evening/night, reminder switches, and selectable coach tones with sample notifications; all edits stay in local page state.
- `/missed-days` — warm, guilt-free recovery flow offering streak freeze protection, schedule reshuffle options ("Spread tasks across the next days" vs "Extend my end date"), and return to `/today`; inside `AppShell`.

## Components
- `AppShell`, `TaskCard`, `PhaseNode`, `StreakBadge`, `ProgressRing`, `RoadmapFlow`, `RoadmapStatsCard`, `ProgressActivityHeatmap`, `ProgressBadges`, `ProgressShareCard`, `ProgressIcon`, `SettingsPlanCard`, `TimeSlotEditor`, `SettingSwitch`, `CoachToneCard`, `MotivationCard`, `ResourcesPanel`, `AiDrawer`, `PlanProvider`.

## Shared state (PlanContext)
- `PlanContext` (`src/state/PlanContext.tsx`) manages the user's active/draft plan across routes in local React state:
  - `skill`: skill name (e.g., "Python for Data Science").
  - `level`: starting level ("Starting fresh", "Know a little", "Comfortable").
  - `duration`: target plan duration in days (30, 60, 90, 180).
  - `currentDay`: active day progress count.
  - `slots`: the 4 daily time slots (`morning`, `college`, `evening`, `night`) with minutes and start times.
  - `tone`: coach notification tone (`gentle`, `funny`, `savage`).
  - `reminders`: reminder switches (`daily`, `preSession`).
- `/onboarding` writes to `PlanContext`; `/roadmap-preview` reads from `PlanContext`; `/today`, `/settings`, and the `AppShell` header (skill name, day indicator, timetable edit dropdown) all read from and write to this shared context.

## Data types
- `User`: id, name, avatar initials, skill name.
- `Plan`: skill, day count, current phase, six roadmap nodes with milestones and expandable month/week task counts, week, and learning resources.
- `Phase`: name, title, summary, progress, and next unlock.
- `RoadmapPhase`: name, title, subtitle, completion state, optional progress, months, and the milestone before the next node.
- `RoadmapMonth` / `RoadmapWeek`: month heading and week labels with task counts.
- `Week` / `Day`: weekly target and daily completion state.
- `Task`: title, source, URL, estimated minutes, time slot, completion, optional status, and tags.
- `Streak`: current and best streak, weekly target, completed days, freezes, and cohort percentile.
- `Stats`: streak, predicted mastery, retention points, weekly minutes, milestone progress, and roadmap insights.
- `RoadmapStats`: hours learned, 2×2 SWOT lists, motivation score, and skill-level progress.
- `ProgressActivityDay`: date, focused minutes, and an optional today marker for the activity heatmap.
- `ProgressBadge`: title, description, icon, earned/in-progress/upcoming state, and optional progress toward a target.
- `LearningProgress`: completed-task count and goal, activity history, badges, and the share-card quote.
- `Stats.learningProgress`: progress-page activity and achievement data returned with the existing stats response.

## User flows
- Landing → onboarding → roadmap preview → today. Onboarding data updates `PlanContext` and passes draft through router location state to preview before entering Today.
- Today → check off a task → see local completion and progress feedback.
- Today → open ASTUTO AI → send a typed message or one of the suggested prompts → receive a mock reply.
- Roadmap → select a phase → expand its months and weekly task counts inline.
- Progress → view streak/freezes, activity, milestones, and summary stats; the mock Share action only confirms a share preview locally.
- Settings → adjust daily slot durations, toggle reminders, and select coach tone; updates sync with `PlanContext`.
- Brand menu → switch the displayed skill or edit the local timetable; updates sync with `PlanContext`.

## Backend integration & API
- Base URL configured via `VITE_API_BASE_URL` (defaults to `http://localhost:8000`).
- CORS allows `http://localhost:5000`, `http://127.0.0.1:5000`, `http://localhost:5173`, and `http://127.0.0.1:5173`.

### Endpoints
- `GET /` — API greeting.
- `GET /health` — health check endpoint (`{"status": "ok"}`).
- `GET /api/plan` — return user, plan, six roadmap phases, milestones, month/week task counts, week, and resource data.
- `GET /api/plan/today/tasks` — return scheduled tasks for the current learner and date.
- `POST /api/tasks` — create a new scheduled practice task.
- `POST /api/tasks/:taskId/toggle` — toggle task completion state.
- `POST /api/tasks/:taskId/complete` — mark task as completed.
- `DELETE /api/tasks/:taskId` — remove a practice task.
- `GET /api/stats` — return streak/freezes, retention, weekly cadence, milestone progress, hours learned, SWOT lists, motivation, skill level, progress activity, task totals, and badge states.
- `POST /api/ai/messages` — send a learner message and return an assistant reply.
- `POST /api/plan/reshuffle` — save learner reshuffle choice (distribute minutes across upcoming days or extend target completion date) and apply streak freezes.
- `GET /api/settings` — retrieve saved learner preferences (tone, reminders, slot minutes and start times).
- `PUT /api/settings` — persist updated learner preferences, merging partial edits with existing preferences.

### Offline fallback behavior
- If any backend fetch fails or the server is unreachable, `src/services/api.ts` gracefully falls back to mock data from `src/data/mock.ts`.
- The UI shows one small, calm status banner: "Showing demo data. Backend is offline." without displaying error screens or crashing.
- Task additions, completions, and setting edits apply locally to offline mock state during the session.

### Known limitations
- Reshuffle state is in-memory: updates to `STREAK_STATE` and `DEFAULT_PLAN["totalDays"]` reset if the backend server restarts.
- Only the `tasks` and `settings` tables are in SQLite: user profiles, roadmap phases, and stats are served from in-memory objects.
- The AI replies are keyword-based: assistant replies are determined by keyword matching without an external LLM service.
