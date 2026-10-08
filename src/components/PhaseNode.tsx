import { ArrowRight, LockKeyhole } from "lucide-react";
import type { Phase } from "../types";
import { ProgressRing } from "./ProgressRing";

interface PhaseNodeProps {
  phase: Phase;
  milestoneTitle: string;
  milestoneProgress: number;
}

export function PhaseNode({ phase, milestoneTitle, milestoneProgress }: PhaseNodeProps) {
  return (
    <section className="rounded-card border border-border bg-surface p-5" aria-labelledby="phase-title">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{phase.name} · Current milestone</p>
      <div className="mt-4 flex items-center gap-4">
        <ProgressRing value={milestoneProgress} label="milestone progress" size={68} />
        <div className="min-w-0">
          <h2 id="phase-title" className="text-base font-semibold leading-snug tracking-[-0.02em]">{milestoneTitle}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{phase.title}</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-bg p-3.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted">
          <LockKeyhole size={14} />
          Unlocks in {phase.nextUnlockInDays} days
        </div>
        <p className="mt-1.5 flex items-center justify-between gap-2 text-sm font-semibold">
          <span>{phase.nextUnlock}</span>
          <ArrowRight size={15} className="shrink-0 text-muted" />
        </p>
      </div>
    </section>
  );
}
