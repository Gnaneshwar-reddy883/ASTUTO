import { Flame, Snowflake } from "lucide-react";
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
        {streak.currentDays > 0 && (
          <span className="inline-flex items-center gap-1 rounded-pill bg-peach px-2.5 py-1 text-xs font-semibold">
            <Flame size={14} className="text-streak" fill="currentColor" />
            On a roll
          </span>
        )}
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-[42px] font-semibold leading-none tracking-[-0.07em]">{streak.currentDays}</span>
        <span className="pb-1 text-sm text-muted">{streak.currentDays === 1 ? "day in a row" : "days in a row"}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {streak.currentDays === 0
          ? "Complete a practice today to start your streak."
          : `You’re showing up consistently. ${
              streak.personalBest - streak.currentDays > 0
                ? `${streak.personalBest - streak.currentDays} more ${
                    streak.personalBest - streak.currentDays === 1 ? "day" : "days"
                  } to your personal best.`
                : "This is your personal best."
            }`}
      </p>

      {streak.freezeCap > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50/50 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-blue-700">
            <Snowflake className="text-blue-500" fill="currentColor" size={16} />
            Streak Freezes
          </div>
          <div className="flex gap-1">
            {Array.from({ length: streak.freezeCap }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full ${i < streak.freezeCount ? "bg-blue-500" : "bg-blue-200"}`}
              />
            ))}
          </div>
        </div>
      )}
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
