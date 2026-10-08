import { Flame } from "lucide-react";
import type { Streak } from "../types";

interface StreakBadgeProps {
  streak: Streak;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <section className="rounded-card border border-border bg-surface p-5" aria-labelledby="streak-heading">
      <div className="flex items-center justify-between">
        <h2 id="streak-heading" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Your streak
        </h2>
        <span className="inline-flex items-center gap-1 rounded-pill bg-peach px-2.5 py-1 text-xs font-semibold">
          <Flame size={14} className="text-streak" fill="currentColor" />
          On a roll
        </span>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-[42px] font-semibold leading-none tracking-[-0.07em]">{streak.currentDays}</span>
        <span className="pb-1 text-sm text-muted">days in a row</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        You’re showing up consistently. {streak.personalBest - streak.currentDays > 0
          ? `${streak.personalBest - streak.currentDays} more days to your personal best.`
          : "This is your personal best."}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
        <span className="text-muted">This week</span>
        <span className="font-semibold">{streak.completedDays} of {streak.weeklyTargetDays} days</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-pill bg-bg" aria-label={`${streak.completedDays} of ${streak.weeklyTargetDays} days completed`}>
        <div
          className="h-full rounded-pill bg-progress-strong transition-[width]"
          style={{ width: `${Math.min(100, (streak.completedDays / Math.max(1, streak.weeklyTargetDays)) * 100)}%` }}
        />
      </div>
    </section>
  );
}
