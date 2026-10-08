import type { ProgressBadge } from "../types";
import { ProgressIcon, type ProgressIconName } from "./ProgressIcon";

type ProgressBadgesProps = {
  badges: ProgressBadge[];
};

const badgeIconNames: Record<ProgressBadge["icon"], ProgressIconName> = {
  sparkles: "sparkles",
  flame: "flame",
  code: "code",
  terminal: "terminal",
  calendar: "calendar",
  target: "target",
  trophy: "trophy",
};

function badgeProgress(badge: ProgressBadge) {
  if (!badge.target || badge.target <= 0) return 0;
  return Math.min(100, Math.round(((badge.progress ?? 0) / badge.target) * 100));
}

export function ProgressBadges({ badges }: ProgressBadgesProps) {
  const earnedCount = badges.filter((badge) => badge.status === "earned").length;

  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-[0_10px_30px_rgba(43,71,55,0.04)] sm:p-7">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Milestones</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em] text-text sm:text-[1.7rem]">
            Little wins, collected
          </h2>
        </div>
        <p className="shrink-0 pb-1 text-xs font-medium text-progress-strong">
          {earnedCount} of {badges.length} earned
        </p>
      </div>

      {badges.length ? (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {badges.map((badge) => {
            const earned = badge.status === "earned";
            const inProgress = badge.status === "in-progress";
            const percent = badgeProgress(badge);
            return (
              <article
                className={`min-w-0 rounded-xl border p-4 ${earned ? "border-progress bg-progress/40" : "border-border bg-bg"}`}
                key={badge.id}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] ${earned ? "bg-mint text-progress-strong" : "bg-surface text-muted"}`}>
                    <ProgressIcon name={badgeIconNames[badge.icon]} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                      <h3 className="text-sm font-semibold leading-snug text-text">{badge.title}</h3>
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.08em] ${earned ? "text-progress-strong" : "text-muted"}`}>
                        {earned ? "Earned" : inProgress ? "In progress" : "Up next"}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted">{badge.description}</p>
                  </div>
                </div>
                {earned ? (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-progress-strong">
                    <ProgressIcon name="check" className="h-3.5 w-3.5" />
                    {badge.unlockedLabel ? `Unlocked ${badge.unlockedLabel}` : "Unlocked"}
                  </p>
                ) : badge.target ? (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <span>{badge.progress ?? 0} / {badge.target}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-progress-strong transition-[width] duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-[11px] text-muted">A future milestone</p>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-border bg-bg px-5 py-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-lavender text-muted">
            <ProgressIcon name="sparkles" className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-text">Your first milestone is waiting.</p>
          <p className="mt-1 text-xs text-muted">Keep practicing and your wins will appear here.</p>
        </div>
      )}
    </section>
  );
}
