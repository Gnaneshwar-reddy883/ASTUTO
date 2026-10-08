// Purpose: make the learner's Python journey feel visible, steady, and manageable.
// Components used: RoadmapFlow and RoadmapStatsCard. API functions called: getPlan and getStats.
// Real data needed: six roadmap phases with month/week task counts and milestones, plus roadmap hours, SWOT, motivation, and skill-level stats.
import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { RoadmapFlow } from "../components/RoadmapFlow";
import { RoadmapStatsCard } from "../components/RoadmapStatsCard";
import { getPlan, getStats } from "../services/api";
import type { Plan, Stats } from "../types";

export function RoadmapPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setError(null);
    Promise.all([getPlan(), getStats()])
      .then(([nextPlan, nextStats]) => {
        if (!active) return;
        setPlan(nextPlan);
        setStats(nextStats);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Please try again in a moment.");
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  if (error) {
    return (
      <main className="min-h-[100dvh] bg-bg px-4 py-10 text-text sm:px-6 lg:px-10">
        <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center rounded-card border border-border bg-surface p-8 text-center shadow-sm">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-peach text-muted">
            <AlertCircle aria-hidden="true" size={22} />
          </span>
          <h1 className="font-sans text-2xl font-semibold tracking-tight">Your roadmap is taking a breather</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-muted">{error}</p>
          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!plan || !stats) {
    return (
      <main aria-label="Loading your roadmap" className="min-h-[100dvh] bg-bg px-4 py-8 text-text sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="h-3 w-24 rounded-pill bg-progress" />
          <div className="mt-4 h-9 w-64 max-w-full rounded-pill bg-progress" />
          <div className="mt-3 h-5 w-96 max-w-full rounded-pill bg-progress" />
          <div className="mt-10 rounded-card border border-border bg-surface p-5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="h-36 rounded-card bg-bg" />
              ))}
            </div>
          </div>
          <div className="mt-8 h-72 rounded-card border border-border bg-surface" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-bg px-4 py-8 pb-16 text-text sm:px-6 sm:py-10 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="animate-slide-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Your learning path</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-sans text-3xl font-semibold tracking-tight sm:text-4xl">A path you can see.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                Keep showing up for the next small step. The bigger picture is already taking shape.
              </p>
            </div>
            <div className="mb-1 flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-2 text-xs font-medium text-muted">
              <span className="h-2 w-2 rounded-full bg-progress-strong" />
              {plan.skillName}
              <ArrowRight size={14} aria-hidden="true" />
            </div>
          </div>
        </header>

        <section aria-labelledby="roadmap-heading" className="mt-8 animate-slide-up sm:mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="roadmap-heading" className="text-lg font-semibold tracking-tight">Your roadmap</h2>
              <p className="mt-1 text-sm text-muted">Tap a phase to see what’s inside.</p>
            </div>
            <span className="hidden rounded-pill bg-lavender px-3 py-1.5 text-xs font-medium text-muted sm:inline-flex">
              One step at a time
            </span>
          </div>
          <RoadmapFlow phases={plan.roadmap} />
        </section>

        <section aria-labelledby="progress-heading" className="mt-8 animate-slide-up sm:mt-10">
          <div className="mb-4">
            <h2 id="progress-heading" className="text-lg font-semibold tracking-tight">Your learning, so far</h2>
            <p className="mt-1 text-sm text-muted">A little perspective on how far you’ve come.</p>
          </div>
          <RoadmapStatsCard stats={stats.roadmap} />
        </section>
      </div>
    </main>
  );
}
