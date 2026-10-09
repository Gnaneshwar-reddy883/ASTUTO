// Purpose: provide a warm, guilt-free recovery flow for missed study days with streak-freeze preservation and flexible schedule reshuffle options.
// Components used: lucide-react icons, Link, useNavigate. API functions called: none; state managed through PlanContext. Real data needed: active streak, streak freezes, plan duration, daily time slots.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Moon,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Sunrise,
} from "lucide-react";
import { usePlan, type ReshuffleMode } from "../state/PlanContext";

export function MissedDaysPage() {
  const navigate = useNavigate();
  const { duration, freezeCount, reshufflePlan } = usePlan();
  const [selectedOption, setSelectedOption] = useState<ReshuffleMode>("spread");
  const [useFreezes, setUseFreezes] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleApply = () => {
    setSubmitting(true);
    reshufflePlan(selectedOption, useFreezes && freezeCount >= 2);
    setTimeout(() => {
      navigate("/today");
    }, 400);
  };

  return (
    <div className="mx-auto max-w-4xl animate-slide-up pb-12">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/today"
          className="inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:bg-surface hover:text-text"
        >
          <ArrowLeft size={15} /> Back to Today
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-mint px-3 py-1.5 text-xs font-semibold text-progress-strong">
          <span className="h-2 w-2 rounded-full bg-progress-strong animate-pulse" />
          Pitstop Mode · 2 days offline
        </span>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-[28px] border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-peach/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-mint/80 blur-3xl" />

        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-peach text-streak shadow-sm">
              <Flame size={24} fill="currentColor" />
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-surface text-xs shadow-sm">
                ❄️
              </span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-streak">
                Safe Return
              </p>
              <p className="text-xs text-muted">Zero penalty · Your momentum is safe</p>
            </div>
          </div>

          <h1 className="font-sans text-3xl font-semibold leading-tight tracking-[-0.055em] text-text sm:text-4xl">
            Life happens. <br />
            <span className="text-progress-strong">Let’s reshuffle.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Zero guilt. You didn’t fail — you just took an unscheduled pitstop. Health, family, and
            rest always come first. Your hard-earned momentum and progress are completely intact.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {freezeCount > 0 && (
          <section
            aria-labelledby="freeze-protection-heading"
            className="relative overflow-hidden rounded-2xl border border-progress-strong/30 bg-mint/35 p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-progress-strong shadow-sm">
                  <Snowflake size={20} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      id="freeze-protection-heading"
                      className="font-sans text-base font-semibold text-text"
                    >
                      Streak Freeze Protection
                    </h2>
                    <span className="rounded-pill bg-surface px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-progress-strong">
                      Ready
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">
                    You have {freezeCount} Streak Freezes available ❄️❄️. We can automatically
                    shield your 14-day streak flame so not a single spark is lost.
                  </p>
                </div>
              </div>
            </div>

            <label
              className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-border/80 bg-surface/80 p-3.5 transition-colors hover:bg-surface"
              htmlFor="freeze-toggle"
            >
              <div className="flex items-center gap-3">
                <input
                  id="freeze-toggle"
                  type="checkbox"
                  checked={useFreezes}
                  onChange={(e) => setUseFreezes(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-progress-strong focus:ring-progress-strong"
                />
                <span className="text-xs font-semibold text-text sm:text-sm">
                  Use 2 Streak Freezes to preserve your 14-day flame
                </span>
              </div>
              <span
                className={`text-xs font-bold ${
                  useFreezes ? "text-progress-strong" : "text-muted"
                }`}
              >
                {useFreezes ? "Shield Active" : "Off"}
              </span>
            </label>
          </section>
        )}

        <section aria-labelledby="reshuffle-pace-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2
              id="reshuffle-pace-heading"
              className="text-xs font-bold uppercase tracking-[0.14em] text-muted"
            >
              Choose your reshuffle pace
            </h2>
            <span className="text-xs font-medium text-muted">Auto-calculated</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div
              onClick={() => setSelectedOption("spread")}
              role="radio"
              aria-checked={selectedOption === "spread"}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") setSelectedOption("spread");
              }}
              className={`group relative cursor-pointer rounded-2xl border p-5 transition-all focus-visible:outline ${
                selectedOption === "spread"
                  ? "border-progress-strong bg-mint/40 shadow-sm ring-1 ring-progress-strong"
                  : "border-border bg-surface hover:border-progress-strong/40"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="rounded-pill bg-surface px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-progress-strong">
                  Popular · Maintain end date
                </span>
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border ${
                    selectedOption === "spread"
                      ? "border-progress-strong bg-progress-strong text-white"
                      : "border-border bg-surface"
                  }`}
                >
                  {selectedOption === "spread" && <Check size={12} strokeWidth={3} />}
                </span>
              </div>
              <h3 className="font-sans text-base font-semibold text-text">
                Spread tasks across the next days
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                Adds just <strong className="text-text font-semibold">+12 mins</strong> to daily
                study windows over the next 7 days. Your target end date ({duration} days) remains
                unchanged.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-bg p-2.5 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-progress-strong">
                  <Sunrise size={13} /> Morn: +5m
                </span>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-progress-strong">
                  <Moon size={13} /> Eve: +7m
                </span>
                <span className="ml-auto inline-flex items-center gap-1 text-muted">
                  <ShieldCheck size={13} className="text-progress-strong" /> End date kept
                </span>
              </div>
            </div>

            <div
              onClick={() => setSelectedOption("extend")}
              role="radio"
              aria-checked={selectedOption === "extend"}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") setSelectedOption("extend");
              }}
              className={`group relative cursor-pointer rounded-2xl border p-5 transition-all focus-visible:outline ${
                selectedOption === "extend"
                  ? "border-progress-strong bg-mint/40 shadow-sm ring-1 ring-progress-strong"
                  : "border-border bg-surface hover:border-progress-strong/40"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="rounded-pill bg-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                  Zero extra daily effort
                </span>
                <span
                  className={`grid h-5 w-5 place-items-center rounded-full border ${
                    selectedOption === "extend"
                      ? "border-progress-strong bg-progress-strong text-white"
                      : "border-border bg-surface"
                  }`}
                >
                  {selectedOption === "extend" && <Check size={12} strokeWidth={3} />}
                </span>
              </div>
              <h3 className="font-sans text-base font-semibold text-text">
                Extend my end date
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
                Keep your standard daily minutes unchanged. We gently shift your completion date
                from day {duration} to day {duration + 2}.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-bg p-2.5 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-text">
                  <Clock3 size={13} className="text-progress-strong" /> Daily minutes unchanged
                </span>
                <span className="ml-auto inline-flex items-center gap-1 font-semibold text-muted">
                  <CalendarDays size={13} /> +2 days added
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-border bg-lavender/60 p-4 sm:p-5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-progress-strong">
            <Sparkles size={18} />
          </span>
          <div>
            <p className="text-sm italic leading-relaxed text-text">
              “Consistency isn’t never missing a day — it’s always coming back. You’re already
              showing up today, and that is what builds mastery.”
            </p>
            <p className="mt-1 text-xs font-semibold text-progress-strong">— Coach ASTUTO 💚</p>
          </div>
        </section>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleApply}
            disabled={submitting}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-pill bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <CheckCircle2 size={16} /> Applying reshuffle…
              </>
            ) : (
              <>
                Apply Reshuffle &amp; Jump to Today <ArrowRight size={16} />
              </>
            )}
          </button>
          <Link
            to="/today"
            className="inline-flex min-h-12 items-center justify-center rounded-pill border border-border bg-surface px-6 text-sm font-semibold text-text transition-colors hover:bg-bg"
          >
            Review today's schedule first
          </Link>
        </div>

        <p className="text-center text-xs text-muted">
          You can reschedule or pause anytime in Settings with zero streak penalties.
        </p>
      </div>
    </div>
  );
}
