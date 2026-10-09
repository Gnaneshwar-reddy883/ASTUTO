import { useMemo } from "react";
import type { ProgressActivityDay } from "../types";
import { ProgressIcon } from "./ProgressIcon";

type ProgressActivityHeatmapProps = {
  activity: ProgressActivityDay[];
};

type HeatmapCell = ProgressActivityDay | null;

function parseDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function intensityClass(minutes: number) {
  if (minutes <= 0) return "border border-border bg-bg";
  if (minutes < 20) return "bg-progress";
  if (minutes < 40) return "bg-mint";
  if (minutes < 60) return "bg-progress-strong/55";
  return "bg-progress-strong";
}

export function ProgressActivityHeatmap({ activity }: ProgressActivityHeatmapProps) {
  const { weeks, monthLabels, activeDays, totalMinutes, bestDay } = useMemo(() => {
    const recent = [...activity]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-84);
    const leadingBlanks = recent.length ? (parseDate(recent[0].date).getUTCDay() + 6) % 7 : 0;
    const cells: HeatmapCell[] = [...Array<null>(leadingBlanks).fill(null), ...recent];
    while (cells.length % 7 !== 0) cells.push(null);
    const grouped: HeatmapCell[][] = [];
    for (let index = 0; index < cells.length; index += 7) {
      grouped.push(cells.slice(index, index + 7));
    }
    const padded = grouped.slice(-12);
    while (padded.length < 12) padded.unshift(Array<null>(7).fill(null));
    const labels = padded.map((week, index) => {
      const firstDate = week.find((day): day is ProgressActivityDay => day !== null);
      if (!firstDate) return "";
      const month = parseDate(firstDate.date).getUTCMonth();
      const previousDate = padded[index - 1]?.find(
        (day): day is ProgressActivityDay => day !== null,
      );
      return !previousDate || parseDate(previousDate.date).getUTCMonth() !== month
        ? new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" }).format(parseDate(firstDate.date))
        : "";
    });
    const validDays = padded.flat().filter((day): day is ProgressActivityDay => day !== null);
    const mostActive = validDays.reduce<ProgressActivityDay | null>(
      (current, day) => (!current || day.minutes > current.minutes ? day : current),
      null,
    );
    return {
      weeks: padded,
      monthLabels: labels,
      activeDays: validDays.filter((day) => day.minutes > 0).length,
      totalMinutes: validDays.reduce((sum, day) => sum + day.minutes, 0),
      bestDay: mostActive,
    };
  }, [activity]);

  return (
    <section className="rounded-card border border-border bg-surface p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Practice history</p>
          <h2 className="mt-2 font-sans text-2xl font-semibold tracking-[-0.04em] text-text sm:text-[1.7rem]">
            Activity &amp; cadence heatmap
          </h2>
          <p className="mt-1.5 text-sm text-muted">A little practice leaves a mark.</p>
        </div>
        <div className="rounded-full bg-bg px-3.5 py-2 text-xs font-medium text-muted">
          Last 12 weeks
        </div>
      </div>

      <div className="mt-7 grid grid-cols-[22px_minmax(0,1fr)] gap-x-2 sm:gap-x-3">
        <div aria-hidden="true" className="grid grid-rows-7 gap-[5px] pt-5 text-[10px] text-muted">
          <span className="flex items-center">M</span>
          <span />
          <span className="flex items-center">W</span>
          <span />
          <span className="flex items-center">F</span>
          <span />
          <span />
        </div>
        <div className="min-w-0">
          <div
            className="mb-2 grid text-[10px] text-muted"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
          >
            {monthLabels.map((label, index) => (
              <span className="min-w-0" key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
          <div
            aria-label={`Calendar heatmap of practice over the last twelve weeks: ${activeDays} active days and ${totalMinutes} minutes practiced`}
            className="grid grid-flow-col grid-rows-7 gap-[5px]"
            role="img"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
          >
            {weeks.flatMap((week, weekIndex) =>
              week.map((day, dayIndex) => (
                <div
                  aria-hidden="true"
                  className={`aspect-square w-full max-w-[17px] justify-self-center rounded-sm transition-transform duration-150 hover:scale-110 ${day ? intensityClass(day.minutes) : "bg-bg"}`}
                  key={`${weekIndex}-${dayIndex}`}
                  title={day ? `${day.date} · ${day.minutes} min` : "No activity recorded"}
                />
              )),
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-border pt-4">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <span>Less</span>
          <span className="h-3 w-3 rounded-sm border border-border bg-bg" />
          <span className="h-3 w-3 rounded-sm bg-progress" />
          <span className="h-3 w-3 rounded-sm bg-mint" />
          <span className="h-3 w-3 rounded-sm bg-progress-strong/55" />
          <span className="h-3 w-3 rounded-sm bg-progress-strong" />
          <span>More</span>
        </div>
        <p className="text-xs text-muted">{activeDays} practice days · {totalMinutes} minutes</p>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-xl bg-bg px-4 py-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint text-progress-strong">
          <ProgressIcon name="sparkles" className="h-[18px] w-[18px]" />
        </div>
        <p className="min-w-0 text-sm leading-relaxed text-muted">
          {bestDay && bestDay.minutes > 0 ? (
            <>Your longest session was <span className="font-semibold text-text">{bestDay.minutes} minutes</span> on {parseDate(bestDay.date).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" })}.</>
          ) : (
            <>Every session counts. Your next practice will add the first mark.</>
          )}
        </p>
        <ProgressIcon name="clock" className="ml-auto hidden h-4 w-4 shrink-0 text-muted sm:block" />
      </div>
    </section>
  );
}
