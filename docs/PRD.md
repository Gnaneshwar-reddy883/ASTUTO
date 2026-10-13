# PRD: ASTUTO (AI Daily Learning Planner)

Status: updated to the current project state (October 2026). Product name is ASTUTO. The UI uses the light theme. Tech choices not yet made are listed under Open Questions, not assumed.

## 1. Vision

Tell ASTUTO a skill, a deadline and your daily routine. It gives you one trusted sequence of free resources, split into a small daily to-do list mapped to your real time slots, and keeps you showing up with streaks and funny nudges.

## 2. Problem

- Learners don't know the correct order to learn a skill, so they start randomly.
- YouTube and blog roadmaps contradict each other, which causes confusion and quitting.
- They don't know when in the day to learn, so initial resistance wins and motivation fades.
- Finding free resources and breaking them into daily chunks takes hours of planning (the founder spent a full day on this for himself).

## 3. Target Users

- Primary: students and early-career people (18-28) learning tech and career skills (Python, DSA, ML, web dev, design, and similar), especially in India, who prefer free resources.
- Secondary: working professionals upskilling in 30-60 minutes a day.

## 4. Goals and Non-Goals

Goals: a user gets a personalized plan in under 3 minutes; completes Day 1 the same day; 7-day retention above 35%.
Non-goals (v1): hosting video content, a paid courses marketplace, social feeds, live mentors, entrance exam mode (see Future Plans).

## 5. Core User Flow

1. Onboard: skill or goal, current level, target duration, daily time slots (morning / college / evening / night, with minutes), preferred style (video / reading / practice).
2. Generate roadmap: phases, weeks, daily tasks, milestones.
3. Preview and edit: the user can shift slots, swap a resource, change pace.
4. Today screen: 1-3 tasks mapped to the user's time slots, each with a resource link and a "mark done" control.
5. Nudge, streak, review: reminders at the chosen slot; weekly recap.

## 6. Features and Current Status

| Feature | Details | Current status |
| --- | --- | --- |
| Auth | Google sign-in | Not built |
| Onboarding | Skill, level, duration, daily slots, preferred style | UI built (4 steps); whether preferred style is captured is to verify |
| Roadmap generator | Phases, weeks, days from researched sources (see section 7) | Not built; backend returns fixed sample plan data |
| Roadmap preview and edit | Shift slots, swap a resource, change pace | Preview screen built; edit actions to verify |
| Today view | Tasks per time slot, resource link, estimated minutes, done checkbox | Built; tasks saved in the backend |
| Full roadmap view | Zigzag flowchart of phases plus stats | Built (UI) |
| Streak | Daily streak, longest streak, streak freeze | UI built with sample data |
| Notifications | At the user's slot, with comedic copy | Tone setting exists; real delivery not built (to verify) |
| Reschedule | "I missed days" reshuffle instead of a failure state | Built; state is in memory only |
| AI assistant | Right drawer on desktop, bottom sheet on mobile, chips | UI built; replies are keyword-based, not a real AI |
| Settings | Slots, reminders, tone | Built; saved to the backend |
| Progress | Stats, badges, activity | Built (UI) |

### P1

- Weekly milestones and mini-projects with proof-of-work (GitHub link or note)
- Daily "log" note (what confused me), used to adapt the next days
- Share card of streak and progress
- Adaptive difficulty: skip or add revision days based on completion

### P2

- Community-vetted roadmaps, accountability buddy, paid "Pro" (more plans, AI tutor Q&A per task)

## 7. The Key Differentiator: Any Skill, Consensus Sequencing

The user can type any skill. The roadmap is never invented from AI memory; it is researched, compared and verified.

Generation pipeline (to be built in the backend phase):

1. Clarify: ask 3-4 questions (goal, level, deadline, daily time).
2. Research: search the web for existing roadmaps and syllabi for the skill (roadmap.sh, university outlines, top free courses).
3. Consensus ordering: compare 4-6 sources and build one sequence from what they agree on. Show "Sources compared: N".
4. Find and verify resources: search free resources per topic; check each link is alive (HTTP check) before showing it.
5. Schedule: fit topics into the user's slots and duration.
6. Just-in-time detail: generate Week 1 in full; later weeks as outline only; expand each week as the user progresses (fresher links, adapts to pace, lower AI cost).

Quality without limiting skills:

- Trust badges: New (AI-built), Community-tested (N completions), Reviewed (human-checked).
- Users can flag a bad step or resource; flags go to a review queue and update the plan.
- Roadmap cache: every generated roadmap is stored by skill and level. The next user asking for the same skill gets the cached version instantly (no AI cost), then personalized scheduling is applied.

## 8. Gamification and Nudges

- Streak flame, XP per task, weekly league optional (P2).
- Milestone badges matching roadmap milestones.
- Notification tone presets: Gentle, Funny, Savage.
- Rule: never guilt-trip about health or family; users can mute or change tone at any time.
- Smart timing: send at the user's chosen slot, plus one gentle follow-up about 2 hours later if not done.

### Missed days

A missed day triggers a "reshuffle" (spread tasks across remaining days, or extend the end date for skill plans). It never shows a failure screen.

### Streak freeze

- Rules source of truth: All freeze rules live in ONE config constant (`FREEZE_CONFIG` in `backend/streak_rules.py`), containing `freezeStartCount` (1), `freezeCap` (2), `freezeMilestoneEvery` (7), and `freezeCostPerDay` (1).
- Active day: Completing at least 1 task that day.
- Day boundary: User's local midnight.
- Starting & Cap: A new user starts with 1 freeze (`freezeStartCount = 1`). Maximum capacity is 2 freezes (`freezeCap = 2`).
- Earning: +1 freeze at every 7-day streak milestone (7, 14, 21...) up to the cap of 2 (`freezeMilestoneEvery = 7`).
- Auto-applied: Freezes are automatically applied (cost of 1 freeze per missed day), never manual.
- Preserved streak: A frozen day preserves the streak but does not increase it and does not count as progress.
- Consumption on completion: Freezes are consumed and recorded in `frozen_dates` ONLY when the user completes a task that day. On plain app open, the streak is displayed as preserved but no freezes are spent and no dates are written.
- All-or-nothing rule: If missed days exceed freezes held, the streak resets to 0 (and upon next completion starts at 1); no freezes are spent. When the streak resets, the longest streak is kept and shown, and there is no failure screen.
- Undo support: Unchecking/undoing a task restores all five streak snapshot fields (`current_streak`, `longest_streak`, `last_active_date`, `freezes_held`, `frozen_dates`).
- Pruning: Frozen dates are retained for up to 30 days and pruned on save.
- Reshuffle: Reshuffle is independent; a missed day always offers reshuffle, whether or not a freeze was used.
- UI & Copy constraints: The `/missed-days` copy must not claim the streak is "saved" until a task is completed. Freeze pills use muted or soft-blue tokens, never orange. Orange stays on the streak flame only. A freeze is presented as a kind safety net, never as a penalty.

## 9. Data Model (target, simplified)

- users: id, name, timezone, notification_prefs, tone
- skills (library): id, name, topics graph
- topics: id, skill_id, title, prereq_ids, est_minutes
- resources: id, topic_id, url, type, source, cost=free, last_checked, quality_score
- plans: id, user_id, skill_id, start_date, duration_days, daily_minutes, status
- plan_days: id, plan_id, date, slot, topic_id, resource_id, status (todo / done / skipped)
- streaks: user_id, current, longest, freezes_left
- notes/logs: plan_day_id, text

Current implementation: only tasks and settings are stored in the database. Plan, stats and streak data are in memory in the backend.

## 10. Current Build

- Frontend: React + Vite + TypeScript + Tailwind (dev port 5000). Routes: / , /onboarding, /roadmap-preview, /today, /roadmap, /progress, /settings, /missed-days. Shared state in src/state/PlanContext.tsx. All data access goes through src/services/api.ts, with an offline fallback to demo data.
- Backend: FastAPI + SQLite in /backend (port 8000), contributed by a collaborator. Endpoints for plan, stats, settings, tasks, AI messages (keyword-based) and reshuffle. No real AI pipeline, no auth, no environment-based secrets yet.
- Design: light theme. Background #F7F6F2, white surfaces, 1px #E7E5E0 borders, 16px card radius, text #111111, muted #6B6B6B. Black pill primary buttons, white pill secondary buttons. Inter font only. Thin line icons. Soft green for progress. Orange (#F97316) only for the streak flame. All colors defined as design tokens so a dark theme can be added later. Mobile 390px with bottom navigation; desktop 1440px with a left sidebar.

## 11. Target Backend Architecture (later phase)

All AI and web calls happen on the server, never in the browser, so API keys stay secret.

`User prompt -> backend -> (1) cache lookup -> (2) search API -> (3) fetch pages -> (4) LLM -> (5) validate -> (6) link check -> save plan`

- Search: a web search API (for example Tavily, Brave Search API, Serper, or Google Programmable Search) returns links and snippets for "X learning roadmap" and "free X course".
- Page content: fetch pages server-side and extract the text. Respect site rules; prefer official APIs where they exist.
- YouTube: use the official YouTube Data API to find playlists and video lengths; link out, never re-host.
- LLM: receives cleaned snippets and returns strict JSON (topics in order, one resource per topic). Validate against a schema before saving.
- Link checker: a scheduled job re-checks resource URLs weekly.
- The LLM sits behind a thin provider wrapper so the provider can be swapped without rewriting code.

## 12. AI Cost and Token Control

1. Cache first: same skill and level reuses the stored roadmap (biggest saving).
2. Generate once per plan, not per visit: daily screens read from the database.
3. Just-in-time weeks: expand one week at a time.
4. Cheap, fast models for routine work (scheduling, rescheduling, nudge text); a stronger model only for the initial consensus roadmap.
5. Trim input: send extracted key text, not whole pages.
6. Limits: free users get N new roadmaps per month; per-user daily AI caps and a global budget alarm.
7. Templated nudges: about 200 funny notification lines written once and randomized; no AI call per notification.

Provider choice: not decided. Free tiers exist but are rate-limited and their terms and limits change often, so check each provider's current documentation before relying on any of them. No option gives unlimited free tokens for real users, so caching and caps are what keep costs low. Local models can be used for development only.

## 13. Success Metrics

- Activation: % who finish onboarding and complete Day 1
- D7 and D30 retention
- Average streak length
- Plan completion rate
- Notification open rate by tone
- % of roadmap steps flagged as bad

## 14. Risks

| Risk | Mitigation |
| --- | --- |
| "ChatGPT can do this" | Win on verified sequences, scheduling and the streak habit loop, not generation |
| Dead or low-quality links | Automated link checks, user flags, trust badges |
| Users quit after missing days | Reshuffle instead of punishing; streak freeze; comeback nudge |
| Notification fatigue | Tone and frequency controls |
| Quality varies on niche skills | Consensus from multiple sources, trust badges, flags, a cache that improves with use |
| AI cost and rate limits | Caching, just-in-time weeks, cheap models, per-user caps, provider wrapper |

## 15. Phases

1. UI solid: all screens working on mobile and desktop, cleanup done, current backend integration merged.
2. Real backend: data model, search + fetch + LLM pipeline, validation, link checker, roadmap cache, auth.
3. Beta and launch: notifications, private beta, fix drop-off points, public launch.

## 16. Future Plans (not current scope): Exam Mode

Entrance exam preparation (for example GRE, JEE, GATE, NEET) is a future initiative. Do not implement, stub or prepare for it in current work.

- The exam syllabus is official and fixed; it must never be invented or reordered by web consensus.
- Syllabi will live in a curated, versioned catalog (data, not code) with source URLs and "last verified" dates; never generated by an LLM at runtime.
- Exam dates are fixed by the exam body for JEE, NEET and GATE, and chosen by the user for GRE.
- Reshuffle for fixed-date exams must never offer "extend end date".
- Needs revision cycles, previous-year questions and mock tests.
- Notification tone defaults to Gentle or Funny; Savage stays opt-in.
- Free resources are limited for some exams; never promise full free coverage.
- The first exam to support is undecided.

## 17. Open Questions

- Production database and hosting (the current SQLite backend is a development setup).
- Auth provider for Google sign-in.
-
