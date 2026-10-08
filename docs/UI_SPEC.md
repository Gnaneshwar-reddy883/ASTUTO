# ASTUTO UI specification

## Product (5 lines)
1. ASTUTO helps students turn a long-term learning goal into a steady daily practice.
2. The experience should feel like a calm, personal coach that respects a learner's real schedule.
3. A learner can see the next useful step without having to plan the whole day again.
4. Small completions build visible momentum toward practical project milestones.
5. A lightweight AI companion helps adjust a plan without judgment.

## Routes
- `/landing` — public product introduction (placeholder in this build).
- `/onboarding` — collect learning goals and availability (placeholder).
- `/roadmap-preview` — preview a generated plan (placeholder).
- `/today` — today's schedule, task completion, progress summary, resources, and mock AI drawer.
- `/roadmap` — full learning plan (placeholder).
- `/progress` — streak and learning history (placeholder).
- `/settings` — profile and timetable settings (placeholder).

## Components
- `AppShell`, `TaskCard`, `PhaseNode`, `StreakBadge`, `ProgressRing`, `MotivationCard`, `ResourcesPanel`, `AiDrawer`, `PlaceholderPage`.

## Data types
- `User`: id, name, avatar initials, skill name.
- `Plan`: skill, day count, phase, week, and learning resources.
- `Phase`: name, title, summary, progress, and next unlock.
- `Week` / `Day`: weekly target and daily completion state.
- `Task`: title, source, URL, estimated minutes, time slot, completion, optional status, and tags.
- `Streak`: current and best streak, weekly target, completed days, freezes, and cohort percentile.
- `Stats`: streak, predicted mastery, retention points, weekly minutes, and milestone progress.

## User flows
- Onboarding → roadmap preview → today.
- Today → check off a task → see local completion and progress feedback.
- Today → open ASTUTO AI → send a typed message or one of the suggested prompts → receive a mock reply.
- Brand menu → switch the displayed skill or edit the local timetable.

## Backend TODO
- `GET /api/plan` — return user, plan, phases, week, and resource data.
- `GET /api/plan/today/tasks` — return scheduled tasks for the current learner and date.
- `POST /api/tasks/:taskId/complete` — save task completion.
- `GET /api/stats` — return streak, retention, weekly cadence, and milestone progress.
- `POST /api/ai/messages` — send a learner message and return an assistant reply.
- Expected tables: `users`, `plans`, `phases`, `weeks`, `days`, `tasks`, `streaks`, `stats`, `ai_messages`.
