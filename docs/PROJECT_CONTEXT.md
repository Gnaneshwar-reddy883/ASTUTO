# ASTUTO Project Context

## 1. Product Summary
- **Product Name:** ASTUTO (Never refer to the product as "Roadie").
- **Core Value Proposition:** A learner enters any skill, their real daily routine (morning, between classes/college, evening, night), and a deadline. ASTUTO generates a single, clear, sequenced roadmap (phases > weeks > days) built from curated, free resources. Daily to-do items map directly into the learner's actual time slots, supported by Duolingo-style streaks, streak freeze tokens, and customizable coach notifications.
- **Problems Solved:** Overcomes roadmap confusion, conflicting YouTube tutorials, planning friction, fading motivation, and rigid study schedules.
- **Philosophy:** A calm, personal coach that adapts to schedule interruptions without guilt or judgment.

## 2. Key Product Decisions
- **Open-Ended Scope:** Any skill is supported from day 1.
- **Researched Roadmaps (Not Invented):** Clarify (3–4 questions) > web search existing roadmaps > consensus ordering across 4–6 sources ("Sources compared: N") > find verified free resources > link check > schedule into the user's daily slots > Week 1 detailed, later weeks outlined and expanded just-in-time.
- **Trust & Verification:** Trust badges (New / Community-tested / Reviewed), user flags, weekly automated link checker, and roadmap caching by skill + level as the primary cost saver.
- **Product Moat:** Consensus sequencing + verified free resources + schedule fitted to routine + streak/nudge loop.
- **Guilt-Free Recovery:** Missed days = "reshuffle" (spread tasks across upcoming days or extend target completion date), never a failure screen. Never guilt-trip about health or family.
- **Backend Architecture (Later Phase):** Real backend will be built LATER, after the frontend UI is completely solid. All AI and web search operations will run server-side.
  - Pipeline flow: prompt > cache lookup > search API (Tavily/Brave/Serper) > fetch/extract > LLM returns strict JSON schema > validate > link check > save.
  - YouTube content fetched via the official YouTube Data API.
- **Cost Control Strategy:** Roadmap caching, exactly one AI call per plan generation, just-in-time week task expansion, cheap small model for schedule reshuffling, ~200 pre-templated funny notifications, per-user rate limits, and a swappable LLM provider wrapper.
- **AI Model Realism:** No unlimited free AI exists; free tiers are rate-limited, so current documentation must be verified before choosing an AI provider.
- **Full PRD:** https://claude.ai/artifact/4Mb6SkF3LYLRFp4MDQev2m (not directly accessible; user will provide if needed).

### Streak Freeze
- **Status:** Confirmed feature. Its exact rules are NOT yet defined; do not invent them or build logic for them yet.
- **Open Questions to Settle Before Building:** How a freeze is earned, maximum number that can be held, whether it applies automatically on a missed day or the user chooses to activate it, and how it interacts with the reshuffle mechanism.
- **Design Constraint:** The freeze indicator must NOT use the orange streak-flame color (`#F97316`); use an existing neutral or soft pastel token instead.
- **Tone Constraint:** A freeze is presented as a kind safety net, never as a penalty or guilt-inducing message.
- **Current Repository Footprint (Audit):**
  - `src/types/index.ts` (L146): Data contract (`Streak.freezeCount: number`) — (c) real logic / type contract.
  - `src/data/mock.ts` (L260): Default mock value (`freezeCount: 2`) — (b) mock data.
  - `src/state/PlanContext.tsx` (L54-56, 79, 139-141, 218-219, 239): React state `freezeCount` (defaults to 2) and `reshufflePlan` deducting 2 freezes — (c) real logic.
  - `src/services/api.ts` (L276-277, 284, 292, 306-307): `ReshuffleResponse`, `reshufflePlanApi` parameter, and mock fallback deduction — (c) real logic / API contract.
  - `src/pages/MissedDaysPage.tsx` (L1-2, 24, 26, 32, 36, 87, 89, 100, 103, 110, 119, 123, 125-126, 130, 135, 138): Headings, description copy, shield labels — (a) text/copy; toggle switch and conditional deduction trigger — (c) real logic.
  - `src/pages/ProgressPage.tsx` (L3, 101, 129, 130, 136, 137, 141): Labels and token counter — (a) text/copy; token rendering loop — (c) real logic.
  - `backend/plan_data.py` (L205, 209-213, 221-222): In-memory `STREAK_STATE["freezeCount"]` — (b) mock data; deduction in `reshuffle_plan` — (c) real logic.
  - `backend/main.py` (L40, 131): `ReshuffleRequest.use_freezes` parameter routing to `reshuffle_plan` — (c) real logic.
  - `docs/UI_SPEC.md` (L16, 18, 42, 55, 72, 74): Route and data specifications — (a) text/copy.
  - `designs/**`: Prototype HTML mockups — (a) text/copy & static prototypes.

## 3. Design Rules
- **Color Palette (Light Theme Tokens):**
  - Background: `#F7F6F2` (off-white)
  - Surface: `#FFFFFF` (white)
  - Border: `#E7E5E0`
  - Text: `#111111`
  - Muted Text & Labels: `#6B6B6B`
  - Progress Accent: Soft green
  - Streak Flame: `#F97316` (orange is reserved EXCLUSIVELY for the streak flame)
  - Secondary accents: Pastel accents used sparingly.
- **Typography:** Inter font ONLY.
- **Card Styling:** White surfaces, 1px border (`#E7E5E0`), 16px border-radius, no heavy drop-shadows. Small muted uppercase labels (minimum 12px).
- **Buttons:** Black rounded pill for primary actions; white pill with thin border for secondary actions.
- **Icons:** Thin-line icons (Lucide).
- **Responsive Layout:**
  - Desktop (1440px): Persistent left navigation sidebar.
  - Mobile (390px): Bottom navigation bar.
  - Top Bar: ASTUTO logo, active skill + day indicator, streak flame, notification bell, round (~40px) AI companion button, and user avatar.
- **Legacy Design Reference:** Files in `/designs/**/DESIGN.md` and screenshot assets represent the OLD DARK THEME. Use them solely for component layout and information architecture; apply the light theme design tokens exclusively.

## 4. Current State
- **Repository:** https://github.com/Gnaneshwar-reddy883/ASTUTO
- **Local Environment:** `D:\ASTUTO-main\ASTUTO-main` (Windows, PowerShell).
- **Frontend Stack:** React, Vite, TypeScript, Tailwind CSS (running on dev port 5000).
  - Routes: `/`, `/onboarding`, `/roadmap-preview`, `/today`, `/roadmap`, `/progress`, `/settings`, `/missed-days`.
  - State Management: `src/state/PlanContext.tsx` handles active/draft plan state in React context.
  - API Gateway: `src/services/api.ts` centralizes all backend requests with graceful fallback to `src/data/mock.ts` when offline.
- **Backend:** FastAPI + SQLite in `/backend`, initial version by sriharshanth2-hub (PR #1); integration fixes and later changes by Gnaneshwar.
  - Persistence: Only `tasks` and `settings` are saved in SQLite (`astuto.db`); plans, stats, and streaks are in-memory.
  - AI Assistant: Keyword-matched mock responses in `/backend/main.py`.
- Work happens on short feature branches created from main. PRs #1 (initial FastAPI + SQLite backend by sriharshanth2-hub), #2 (backend integration fixes) and #3 (Today page cleanup) are merged into main.

## 5. Working Rules
- **Incremental Delivery:** Tackle one screen or concern at a time, followed by user review before moving forward.
- **Git Discipline:** Always work on a feature/fix branch; never force push; leave uncommitted files clean when handing off.
- **Ignored / Protected Files:** NEVER commit `astuto.db`, `venv/`, `__pycache__`, `node_modules`, or `.env` files.
- **Change Transparency:** Explicitly state what is NOT being changed during each iteration.
- **Build Verification:** Run `npm run build` after changes and report the build output.
- **Code Reviews:** Audit code additions or PRs from collaborators in a read-only pass before execution.
- **Terminal Python Environment:** After opening a new terminal, activate the Python venv before running uvicorn: `cd backend; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload --port 8000`.
- **Layout Drift Policy:** If UI layout drifts from specifications, match `/designs/<desktop|mobile>/<screen>/screen.png` precisely for layout while strictly enforcing the light design tokens.

## 6. Known Limitations
- Reshuffle state is in-memory; server restarts reset `STREAK_STATE` and adjustments to `DEFAULT_PLAN["totalDays"]`.
- The AI companion endpoint is simulated via keyword matching without an external LLM integration.
- 9 npm audit vulnerabilities exist in the dependency tree; never run `npm audit fix --force`.

## 7. Open Items
- Verify: add a task, reload, confirm it persists; change slot minutes then tone in /settings, reload, confirm minutes stay.
- Review mobile (390px) for /roadmap, /progress, /settings, /onboarding (/today is done).
- Greeting on /today is hardcoded to "Good morning"; it should depend on the time of day.
- /missed-days polish: the checkbox uses the browser's default blue (not a design token); the "+12 mins / Morn +5m / Eve +7m" numbers are hardcoded.
- Define streak freeze rules (see Streak Freeze).
- Ask the collaborator to review the merged backend and integration changes (settings merge, CORS).

## 8. FUTURE PLANS (Not Current Scope): Exam Mode
> [!IMPORTANT]
> Exam Mode (GRE, JEE, GATE, NEET) is a future initiative and is NOT part of current scope. Do NOT implement, stub, or prepare for it in current code or types. Do NOT add `goalType`, `examDate`, exam types, or new resource kinds. All immediate work is strictly focused on Skill mode UI and backend integration.

- **Authoritative Syllabus:** The exam syllabus is fixed and official; it must never be invented or reordered by web consensus.
- **Catalog Architecture:** Exam syllabi will live in a curated, versioned catalog (data/JSON, not code) containing official source URLs and "last verified" timestamps. Syllabi are never generated by an LLM at runtime.
- **Target Dates:**
  - JEE, NEET, and GATE have fixed external exam sessions set by governing bodies.
  - GRE allows user-chosen test dates.
- **Reshuffling Rules:** Missed-day recovery for fixed-date exams must NEVER offer "extend end date". Reshuffling must instead rebalance daily minutes, compress revision buffers, or prioritize high-weightage topics.
- **Study Structure:** Requires cyclical revision phases, Previous Year Questions (PYQs), and full mock test milestones.
- **Notification Tone:** Default to Gentle or Funny. Savage tone must remain an explicit user opt-in to avoid guilt or burnout in high-stakes environments (future decision).
- **Resource Scope:** Free resources are limited for certain exams; never promise 100% free coverage where verified materials do not exist.
- **Initial Exam Selection:** The first entrance exam to be supported is undecided.

### Reference: Skill-Only Assumptions in Current Codebase (DO NOT CHANGE NOW)
These references are documented for future architecture planning only. Do not modify or refactor them in current tasks:
- `src/types/index.ts`:
  - `User.skillName` and `Plan.skillName` (assumes single string skill name).
  - `RoadmapStats.skillLevel` (assumes beginner/intermediate/advanced skill progression).
  - `ProgressBadgeIcon` (includes coding-specific icons like `"code"` and `"terminal"`).
  - `Resource.kind` (limited to `"GitHub repo" | "YouTube" | "Article"`).
- `src/types/onboarding.ts`:
  - `LearnerLevel` (`"Starting fresh" | "Know a little" | "Comfortable"`).
  - `PlanDuration` (fixed buckets: `30 | 60 | 90 | 180` days).
  - `OnboardingDraft` (tracks `skill`, `level`, and `duration`).
- `src/state/PlanContext.tsx`:
  - Context state tracks `skill`, `level`, and `duration`.
  - `reshufflePlan` allows extending duration (`prev + 2`).
- `src/services/api.ts`:
  - Fallback tasks default to `source: "Personal Practice"` and `sourceUrl: "https://python.org"`.
  - Reshuffle mock sets `totalDays: 92`.
- `backend/plan_data.py` & `backend/database.py`:
  - `DEFAULT_PLAN` and initial database tasks hardcode "Python for Data Science" and programming tasks.
- `backend/main.py`:
  - `CreateTaskRequest` default URL is `https://python.org`.
  - AI responses specifically reference Python programming drills.
