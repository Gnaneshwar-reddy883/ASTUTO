# ASTUTO

ASTUTO turns any skill, daily routine, and deadline into a single, sequenced roadmap built from curated free resources. Daily to-dos map directly into the learner's actual time slots, supported by streaks, streak freezes, and funny nudges. It functions as a calm, personal learning coach that adapts to schedule interruptions without guilt or judgment. Today the app runs on demo data; the researched-roadmap pipeline is planned (see Current Status).

## Current Status

- **UI:** Built across all routes (`/`, `/onboarding`, `/roadmap-preview`, `/today`, `/roadmap`, `/progress`, `/settings`, `/missed-days`); some screens are still being polished and mobile review is in progress.
- **Backend:** A FastAPI + SQLite backend stores tasks and settings in SQLite (`backend/astuto.db`).
- **In-Memory State:** Plan, stats, streak, and reshuffle state are currently in memory.
- **AI Assistant:** The assistant is keyword-based, not a real AI.
- **Authentication:** No auth yet.
- **Future Pipeline:** The real research and consensus AI pipeline (web search, consensus ordering, and link checking) is planned for a later phase.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** FastAPI, SQLite

## Setup (Windows PowerShell)

### 1. Configure Environment

Copy `.env.example` to `.env` to set `VITE_API_BASE_URL`:

```powershell
Copy-Item .env.example .env
```

### 2. Backend Setup

From `/backend`, create and activate a Python virtual environment, install requirements, and run the Uvicorn server:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> **Note:** After opening a new terminal, the virtual environment must be activated again (`.\venv\Scripts\Activate.ps1`) before running `uvicorn main:app --reload --port 8000`.

### 3. Frontend Setup

From the project root, install dependencies and start the development server:

```powershell
npm install
npm run dev
```

The frontend runs on port 5000 (`http://localhost:5000`).

### Offline Fallback

When the backend is offline, the frontend falls back to demo data with a banner ("Showing demo data. Backend is offline.") without crashing or showing error screens.

## Project Structure

- `src/pages` — Application route pages
- `src/components` — Shared UI components
- `src/state` — Shared React context state (`PlanContext`)
- `src/services` — API client and offline fallback (`api.ts`)
- `src/data` — Fallback demo data (`mock.ts`)
- `src/types` — TypeScript data types and contracts
- `backend` — FastAPI app, SQLite database, and route endpoints
- `docs` — Project context, PRD, and UI specifications
- `designs` — Design mockups and reference assets

## Documentation

- [docs/UI_SPEC.md](docs/UI_SPEC.md)
- [docs/PRD.md](docs/PRD.md)
- [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md)

## Known Limitations

- **In-memory reshuffle:** Reshuffle state, streak counts, and schedule adjustments reset if the backend server restarts.
- **Keyword-based AI replies:** Assistant responses are matched using keywords rather than an actual LLM service.
- **npm audit vulnerabilities:** `npm audit` reports vulnerabilities; do not run `npm audit fix --force`.

## Credits

- Gnaneshwar (Gnaneshwar-reddy883): product, frontend, backend integration and fixes.
- sriharshanth2-hub: initial FastAPI + SQLite backend (PR #1).
