// Purpose: make a learner's steady practice, momentum, and milestones visible without pressure.
// Components used: ProgressActivityHeatmap, ProgressBadges, ProgressShareCard, and ProgressIcon.
// API function called: getStats(). Real data needed: the Stats fields returned by getStats, including streak, weekly metrics, roadmap.hoursLearned, and learningProgress.
import { useCallback, useEffect, useState } from "react";
import { ProgressActivityHeatmap } from "../components/ProgressActivityHeatmap";
import { ProgressBadges } from "../components/ProgressBadges";
import { ProgressIcon } from "../components/ProgressIcon";
import { ProgressShareCard } from "../components/ProgressShareCard";
import { getStats } from "../services/api";
import type { Stats } from "../types";

export function ProgressPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStats();
      setStats(result);
    } catch {
      setError("We couldn’t load your progress just now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <main className="mx-auto min-h-[100dvh] w-full max-w-6xl px-4 py-8 sm:px-7 sm:py-10 lg:px-10">
        <div className="animate-pulse">
          <div className="h-3 w-28 rounded-full bg-border" />
          <div className="mt-3 h-9 w-64 max-w-full rounded-lg bg-border" />
          <div className="mt-3 h-4 w-80 max-w-full rounded bg-border" />
          <div className="mt-8 grid gap-4 md:grid-cols-12">
            <div className="h-40 rounded-card bg-mint md:col-span-7" />
            <div className="h-40 rounded-card bg-lavender md:col-span-5" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => <div className="h-28 rounded-card bg-surface" key={item} />)}
          </div>
          <div className="mt-5 h-64 rounded-card bg-surface" />
        </div>
        <p className="sr-only">Loading your progress</p>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="mx-auto flex min-h-[72dvh] w-full max-w-6xl items-center px-4 py-10 sm:px-7 lg:px-10">
        <section className="w-full rounded-card border border-border bg-surface p-7 text-center sm:mx-auto sm:max-w-md sm:p-9">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lavender text-muted">
            <ProgressIcon name="sparkles" className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-[-0.04em] text-text">Your progress is taking a pause</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">{error ?? "We couldn’t find your progress data."}</p>
          <button
            className="mt-5 rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-surface transition-transform duration-150 hover:-translate-y-0.5"
            onClick={() => void loadStats()}
            type="button"
          >
            Try again
          </button>
        </section>
      </main>
    );
  }

  const { streak, learningProgress } = stats;
  const weeklyPercent = stats.weeklyGoalMinutes > 0
    ? Math.min(100, Math.round((stats.weeklyMinutes / stats.weeklyGoalMinutes) * 100))
    : 0;
  const taskPercent = learningProgress.taskGoal > 0
    ? Math.min(100, Math.round((learningProgress.tasksCompleted / learningProgress.taskGoal) * 100))
    : 0;

  return (
    <main className="mx-auto min-h-[100dvh] w-full max-w-6xl px-4 pb-12 pt-8 sm:px-7 sm:pb-16 sm:pt-10 lg:px-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-progress-strong">Your practice, adding up</p>
          <h1 className="mt-2 font-display text-[2.15rem] font-semibold leading-tight tracking-[-0.055em] text-text sm:text-5xl">
            Progress <span className="text-muted">&amp;</span> momentum
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Consistency is built one kind, manageable session at a time.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-muted sm:flex">
          <span className="h-2 w-2 rounded-full bg-progress-strong" />
          Your learning journey
        </div>
      </header>

      <section aria-label="Streak and freeze tokens" className="grid gap-4 md:grid-cols-12">
        <article className="relative min-w-0 overflow-hidden rounded-card border border-progress bg-progress p-5 sm:p-6 md:col-span-7">
          <div aria-hidden="true" className="pointer-events-none absolute -right-5 -top-9 h-44 w-44 rounded-full border border-progress-strong/10" />
          <div aria-hidden="true" className="pointer-events-none absolute right-6 top-7 h-24 w-24 rounded-full border border-progress-strong/10" />
          <div className="relative flex h-full flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-progress-strong">
                <ProgressIcon name="flame" className="h-[19px] w-[19px] text-streak" />
                Current streak
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-6xl font-semibold leading-none tracking-[-0.075em] text-text sm:text-7xl">{streak.currentDays}</span>
                <span className="text-base font-medium text-muted">days</span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
                You’ve kept showing up. That’s something to feel good about.
              </p>
            </div>
            <div className="rounded-xl border border-progress-strong/10 bg-surface/55 px-4 py-3 sm:min-w-[150px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Personal best</p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-[-0.04em] text-text">{streak.personalBest}<span className="ml-1 text-xs font-medium text-muted">days</span></p>
              <p className="mt-0.5 text-xs text-muted">A rhythm you’ve already made.</p>
            </div>
          </div>
        </article>

        <article className="flex min-w-0 items-center justify-between gap-4 rounded-card border border-border bg-lavender p-5 sm:p-6 md:col-span-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Streak freezes</p>
            <p className="mt-2 font-display text-4xl font-semibold leading-none tracking-[-0.06em] text-text">{streak.freezeCount}</p>
            <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-muted">
              Tokens set aside for a day life gets in the way.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {Array.from({ length: Math.min(streak.freezeCount, 4) }, (_, index) => (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-surface bg-surface text-progress-strong shadow-[0_3px_12px_rgba(85,91,120,0.06)]" key={index} title="Streak freeze token">
                <ProgressIcon name="snowflake" className="h-5 w-5" />
              </div>
            ))}
            {streak.freezeCount === 0 && (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-surface bg-surface text-muted">
                <ProgressIcon name="snowflake" className="h-5 w-5" />
              </div>
            )}
          </div>
        </article>
      </section>

      <section aria-label="Progress summary" className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-card border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted">This week</p>
            <ProgressIcon name="calendar" className="h-4 w-4 text-progress-strong" />
          </div>
          <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.045em] text-text">{stats.weeklyMinutes}<span className="ml-1.5 text-sm font-medium text-muted">min</span></p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg">
            <div className="h-full rounded-full bg-progress-strong" style={{ width: `${weeklyPercent}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-muted">{weeklyPercent}% of {stats.weeklyGoalMinutes} min weekly goal</p>
        </article>

        <article className="rounded-card border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted">Time invested</p>
            <ProgressIcon name="clock" className="h-4 w-4 text-progress-strong" />
          </div>
          <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.045em] text-text">{stats.roadmap.hoursLearned}<span className="ml-1.5 text-sm font-medium text-muted">hours</span></p>
          <p className="mt-2 text-[11px] text-muted">Every hour is a step forward.</p>
        </article>

        <article className="rounded-card border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted">Tasks completed</p>
            <ProgressIcon name="check" className="h-4 w-4 text-progress-strong" />
          </div>
          <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.045em] text-text">{learningProgress.tasksCompleted}<span className="ml-1.5 text-sm font-medium text-muted">/ {learningProgress.taskGoal}</span></p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg">
            <div className="h-full rounded-full bg-progress-strong" style={{ width: `${taskPercent}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-muted">Learning plan progress</p>
        </article>

        <article className="rounded-card border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted">Predicted mastery</p>
            <ProgressIcon name="target" className="h-4 w-4 text-progress-strong" />
          </div>
          <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.045em] text-text">{stats.predictedMastery}<span className="ml-0.5 text-sm font-medium text-muted">%</span></p>
          <p className="mt-2 text-[11px] text-muted">A forecast, not a finish line.</p>
        </article>
      </section>

      <div className="mt-4">
        <ProgressActivityHeatmap activity={learningProgress.activity} />
      </div>

      <div className="mt-4">
        <ProgressBadges badges={learningProgress.badges} />
      </div>

      <div className="mt-4">
        <ProgressShareCard stats={stats} learningProgress={learningProgress} />
      </div>
    </main>
  );
}
