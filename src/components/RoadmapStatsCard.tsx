import { Compass, Heart, Lightbulb, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import type { RoadmapStats } from "../types";

interface RoadmapStatsCardProps {
  stats: RoadmapStats;
}

const swotSections = [
  { key: "strengths", label: "Strengths", icon: Heart, tone: "bg-mint" },
  { key: "weaknesses", label: "Worth practicing", icon: Compass, tone: "bg-lavender" },
  { key: "opportunities", label: "Opportunities", icon: Lightbulb, tone: "bg-peach" },
  { key: "threats", label: "Things to plan for", icon: ShieldAlert, tone: "bg-bg" },
] as const;

function Meter({ label, value, color, caption, icon: Icon }: {
  label: string;
  value: number;
  color: "bg-progress-strong" | "bg-muted";
  caption: string;
  icon: typeof Heart;
}) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="rounded-card border border-border bg-bg p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon size={16} className="text-muted" aria-hidden="true" />
            {label}
          </div>
          <p className="mt-1 text-xs leading-5 text-muted">{caption}</p>
        </div>
        <span className="text-sm font-semibold tabular-nums text-text">{safeValue}%</span>
      </div>
      <div
        className="mt-4 h-2 overflow-hidden rounded-pill bg-surface"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <div className={`h-full rounded-pill ${color}`} style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}

export function RoadmapStatsCard({ stats }: RoadmapStatsCardProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-surface shadow-sm">
      <div className="grid lg:grid-cols-[0.8fr_1.6fr]">
        <div className="flex flex-col justify-between border-b border-border bg-mint p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Time invested</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-sans text-5xl font-semibold tracking-tight tabular-nums">{stats.hoursLearned}</span>
              <span className="text-sm font-medium text-muted">hours learned</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
              Each focused session adds up. This time is yours to build on.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs font-medium text-muted">
            <TrendingUp size={15} aria-hidden="true" />
            Progress made one session at a time
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Your learning snapshot</h3>
              <p className="mt-1 text-xs text-muted">A balanced view of what can help you keep moving.</p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender text-muted">
              <Sparkles size={16} aria-hidden="true" />
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {swotSections.map(({ key, label, icon: Icon, tone }) => (
              <section key={key} className={`min-w-0 rounded-card border border-border/70 ${tone} p-3.5 sm:p-4`}>
                <h4 className="flex items-center gap-2 text-xs font-semibold">
                  <Icon size={14} aria-hidden="true" />
                  {label}
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {stats.swot[key].map((item, index) => (
                    <li key={`${key}-${index}`} className="break-words text-xs leading-5 text-muted">
                      {item}
                    </li>
                  ))}
                  {stats.swot[key].length === 0 && (
                    <li className="text-xs leading-5 text-muted">Nothing to add yet.</li>
                  )}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 border-t border-border p-5 sm:grid-cols-2 sm:p-7">
        <Meter
          label="Motivation"
          value={stats.motivation}
          color="bg-progress-strong"
          caption="Your momentum is building."
          icon={Heart}
        />
        <div className="rounded-card border border-border bg-bg p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Compass size={16} className="text-muted" aria-hidden="true" />
                Skill level
              </div>
              <p className="mt-1 text-xs leading-5 text-muted">
                {stats.skillLevel.label} <span aria-hidden="true">·</span> next: {stats.skillLevel.nextLevel}
              </p>
            </div>
            <span className="text-sm font-semibold tabular-nums text-text">
              {Math.max(0, Math.min(100, stats.skillLevel.progress))}%
            </span>
          </div>
          <div
            className="mt-4 h-2 overflow-hidden rounded-pill bg-surface"
            role="progressbar"
            aria-label="Skill level"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.max(0, Math.min(100, stats.skillLevel.progress))}
          >
            <div
              className="h-full rounded-pill bg-progress-strong"
              style={{ width: `${Math.max(0, Math.min(100, stats.skillLevel.progress))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
