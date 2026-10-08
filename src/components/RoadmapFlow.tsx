import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Check, ChevronDown, Flag, Trophy } from "lucide-react";
import type { RoadmapPhase } from "../types";

interface RoadmapFlowProps {
  phases: RoadmapPhase[];
}

function PhaseDetails({ phase }: { phase: RoadmapPhase }) {
  if (phase.months.length === 0) {
    return (
      <div className="border-t border-border px-4 py-3">
        <p className="text-xs leading-5 text-muted">A destination to grow into, one project at a time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t border-border px-4 py-4">
      {phase.months.map((month) => (
        <div key={month.title}>
          <h4 className="text-xs font-semibold text-text">{month.title}</h4>
          <ul className="mt-2 space-y-1.5">
            {month.weeks.map((week) => (
              <li key={`${month.title}-${week.label}`} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-muted">{week.label}</span>
                <span className="rounded-pill bg-bg px-2 py-1 font-medium text-muted">
                  {week.taskCount} {week.taskCount === 1 ? "task" : "tasks"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function PhaseNode({ phase, index, expanded, onToggle }: {
  phase: RoadmapPhase;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isCompleted = phase.status === "completed";
  const isCurrent = phase.status === "current";
  const isGoal = phase.status === "goal";
  const id = `roadmap-phase-${phase.id}`;

  return (
    <article
      className={[
        "min-w-0 overflow-hidden rounded-card border transition-colors",
        isCompleted ? "border-progress-strong/30 bg-mint" : "",
        isCurrent ? "border-progress-strong/50 bg-surface shadow-sm" : "",
        !isCompleted && !isCurrent ? "border-border bg-surface/75" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`${id}-details`}
        className="group block w-full min-w-0 p-4 text-left focus-visible:outline-offset-[-3px] sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={[
                "text-[10px] font-semibold uppercase tracking-[0.16em]",
                isCompleted ? "text-progress-strong" : "text-muted",
              ].join(" ")}>
                {phase.name}
              </span>
              {isCurrent && (
                <span className="rounded-pill bg-progress px-2 py-1 text-[10px] font-semibold text-progress-strong">
                  You are here
                </span>
              )}
            </div>
            <h3 className={[
              "mt-2 break-words text-sm font-semibold leading-5",
              !isCompleted && !isCurrent && !isGoal ? "text-muted" : "text-text",
            ].join(" ")}>
              {phase.title}
            </h3>
          </div>
          <span className={[
            "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            isCompleted ? "bg-surface text-progress-strong" : "",
            isCurrent ? "bg-progress text-progress-strong" : "",
            !isCompleted && !isCurrent && !isGoal ? "bg-bg text-muted" : "",
            isGoal ? "bg-peach text-muted" : "",
          ].join(" ")}>
            {isCurrent && (
              <svg className="absolute inset-0 h-9 w-9 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                <circle className="fill-none stroke-progress" strokeWidth="2.5" cx="18" cy="18" r="15" />
                <circle
                  className="fill-none stroke-progress-strong"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  cx="18"
                  cy="18"
                  r="15"
                  strokeDasharray={`${Math.max(0, Math.min(100, phase.progress ?? 0)) * 0.942} 100`}
                />
              </svg>
            )}
            {isCompleted && <Check size={18} strokeWidth={2.5} aria-label="Completed" />}
            {isCurrent && <span className="text-[9px] font-bold">{phase.progress ?? 0}</span>}
            {!isCompleted && !isCurrent && !isGoal && (
              <span className="text-xs font-semibold">{String(index + 1).padStart(2, "0")}</span>
            )}
            {isGoal && <Trophy size={17} aria-label="Goal" />}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted">{phase.subtitle}</p>
        <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3 text-[11px] font-medium text-muted">
          <span>{expanded ? "Hide details" : "Explore phase"}</span>
          <ChevronDown className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} size={15} aria-hidden="true" />
        </div>
      </button>
      {expanded && (
        <div id={`${id}-details`}>
          <PhaseDetails phase={phase} />
        </div>
      )}
    </article>
  );
}

function MilestoneArrow({ label, direction = "right" }: { label?: string; direction?: "right" | "left" }) {
  const Icon = direction === "right" ? ArrowRight : ArrowLeft;
  return (
    <div className="flex w-[4.1rem] shrink-0 flex-col items-center justify-center gap-1.5 px-1 text-muted sm:w-[4.6rem]">
      <Icon size={19} aria-hidden="true" />
      {label && (
        <span className="flex max-w-full items-start justify-center gap-1 text-center text-[9px] leading-3 text-muted" title={label}>
          <Flag className="mt-px shrink-0" size={10} aria-hidden="true" />
          <span className="break-words">{label}</span>
        </span>
      )}
    </div>
  );
}

function MobileMilestone({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[4.25rem] w-full flex-col items-center justify-center gap-1 text-muted">
      <ArrowDown size={17} aria-hidden="true" />
      {label && (
        <span className="inline-flex max-w-[13rem] items-center justify-center gap-1 rounded-pill border border-border bg-bg px-2.5 py-1 text-center text-[10px] leading-4">
          <Flag className="shrink-0" size={11} aria-hidden="true" />
          <span>{label}</span>
        </span>
      )}
    </div>
  );
}

export function RoadmapFlow({ phases }: RoadmapFlowProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggle = (phase: RoadmapPhase) => setExpandedId((current) => current === phase.id ? null : phase.id);
  const renderNode = (phase: RoadmapPhase, index: number) => (
    <PhaseNode
      key={phase.id}
      phase={phase}
      index={index}
      expanded={expandedId === phase.id}
      onToggle={() => toggle(phase)}
    />
  );

  if (phases.length !== 6) {
    return (
      <div className="rounded-card border border-border bg-surface p-5 text-sm leading-6 text-muted">
        The six-step roadmap isn’t available right now. Please refresh to try again.
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4 shadow-sm sm:p-6 lg:p-8">
      <div className="space-y-0 lg:hidden">
        {phases.map((phase, index) => (
          <div key={phase.id}>
            <div className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
              <div className="w-[88%] min-w-0">
                {renderNode(phase, index)}
              </div>
            </div>
            {index < phases.length - 1 && <MobileMilestone label={phase.milestoneAfter} />}
          </div>
        ))}
      </div>

      <div className="hidden lg:block">
        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1">{renderNode(phases[0], 0)}</div>
          <MilestoneArrow label={phases[0].milestoneAfter} />
          <div className="min-w-0 flex-1">{renderNode(phases[1], 1)}</div>
          <MilestoneArrow label={phases[1].milestoneAfter} />
          <div className="min-w-0 flex-1">{renderNode(phases[2], 2)}</div>
        </div>
        <div className="mr-[1.8rem] flex justify-end pr-2">
          <div className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 text-muted">
            <ArrowDown size={18} aria-hidden="true" />
            <span className="inline-flex max-w-32 items-center gap-1 rounded-pill border border-border bg-bg px-2 py-1 text-center text-[9px] leading-3">
              <Flag className="shrink-0" size={10} aria-hidden="true" />
              <span>{phases[2].milestoneAfter}</span>
            </span>
          </div>
        </div>
        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1">{renderNode(phases[5], 5)}</div>
          <MilestoneArrow direction="left" label={phases[4].milestoneAfter} />
          <div className="min-w-0 flex-1">{renderNode(phases[4], 4)}</div>
          <MilestoneArrow direction="left" label={phases[3].milestoneAfter} />
          <div className="min-w-0 flex-1">{renderNode(phases[3], 3)}</div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-muted">
          <span className="h-px w-10 bg-border" />
          A steady route from first steps to your goal
          <span className="h-px w-10 bg-border" />
        </div>
      </div>
    </div>
  );
}
