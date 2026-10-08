import { useState } from "react";
import type { LearningProgress, Stats } from "../types";
import { ProgressIcon } from "./ProgressIcon";

type ProgressShareCardProps = {
  stats: Stats;
  learningProgress: LearningProgress;
};

export function ProgressShareCard({ stats, learningProgress }: ProgressShareCardProps) {
  const [previewReady, setPreviewReady] = useState(false);

  return (
    <section className="relative overflow-hidden rounded-card border border-border bg-lavender p-5 sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border border-progress-strong/10" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-1 -top-5 h-28 w-28 rounded-full border border-progress-strong/10" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">A moment worth keeping</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-text sm:text-[1.7rem]">
            Your progress, in a card
          </h2>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">
            A small snapshot of the work you’ve put in—ready when you are.
          </p>
          <button
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-text px-5 text-sm font-semibold text-surface transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-progress-strong"
            onClick={() => setPreviewReady(true)}
            type="button"
          >
            <span>Share</span>
            <ProgressIcon name="arrow" className="h-4 w-4" />
          </button>
          {previewReady && (
            <p aria-live="polite" className="mt-3 max-w-md text-xs leading-relaxed text-muted">
              Your progress card is preview-ready. Sharing will be available when connected.
            </p>
          )}
        </div>

        <div className="relative overflow-hidden rounded-[18px] border border-surface/70 bg-surface p-5 shadow-[0_14px_36px_rgba(76,81,102,0.08)] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-progress-strong" />
              <span className="text-xs font-semibold tracking-[0.12em] text-text">ASTUTO</span>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted">My learning note</span>
          </div>
          <p className="mt-5 font-display text-xl font-medium leading-snug tracking-[-0.025em] text-text sm:text-2xl">
            “{learningProgress.shareQuote || "One small practice at a time."}”
          </p>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
            <div>
              <p className="font-display text-xl font-semibold tracking-[-0.04em] text-text">{stats.streak.currentDays}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-muted">day streak</p>
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-[-0.04em] text-text">{stats.roadmap.hoursLearned}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-muted">hours learned</p>
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-[-0.04em] text-text">{learningProgress.tasksCompleted}</p>
              <p className="mt-0.5 text-[10px] leading-tight text-muted">tasks done</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
