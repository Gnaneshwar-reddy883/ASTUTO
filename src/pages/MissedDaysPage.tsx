// Purpose: provide a warm, guilt-free recovery flow for missed study days with streak-freeze preservation and flexible schedule reshuffle options.
// Components used: lucide-react icons, Link, useNavigate. API functions called: none; state managed through PlanContext. Real data needed: active streak, streak freezes, plan duration, daily time slots.
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Flame,
  Snowflake,
  Sparkles,
} from "lucide-react";
import { usePlan, type ReshuffleMode } from "../state/PlanContext";
import { getMissedDays, getStats, reshufflePlanApi, useBackendOffline } from "../services/api";
import type { Stats } from "../types";

// Matches the fixed +2 days that PlanContext and plan_data.py add in extend mode. TODO(backend): make this depend on missed days once the reshuffle rules are decided.
const EXTEND_DAYS = 2;

type PageState = "loading" | "unavailable" | "caughtUp" | "covered" | "reset";

interface HeroContent {
  badge: string;
  eyebrow: string;
  smallLine: string | null;
  heading: string;
  body: string;
}

function getHeroContent(
  state: PageState,
  missedDays: number,
  freezeCount: number,
  currentStreak: number,
): HeroContent {
  const dayPlural = missedDays === 1 ? "1 day" : `${missedDays} days`;
  const freezePlural = freezeCount === 1 ? "1 streak freeze" : `${freezeCount} streak freezes`;

  switch (state) {
    case "caughtUp":
      return {
        badge: "Up to date",
        eyebrow: "Pacing check",
        smallLine: "No missed days",
        heading: "You're all caught up.",
        body: "You haven't missed a day. If you'd like a lighter pace anyway, you can reshuffle below.",
      };
    case "covered": {
      const coveredSentence =
        missedDays === freezeCount && freezeCount === 1
          ? "If you complete a task today, your streak freeze will be used to keep your streak going."
          : missedDays === freezeCount && freezeCount > 1
            ? `If you complete a task today, all ${freezeCount} of your streak freezes will be used to keep your streak going.`
            : `If you complete a task today, ${missedDays} of your ${freezeCount} streak freezes will be used to keep your streak going.`;
      return {
        badge: `Pitstop mode · ${dayPlural} offline`,
        eyebrow: "Welcome back",
        smallLine: `${freezePlural} held`,
        heading: "Life happens. Let's reshuffle.",
        body: `${coveredSentence} Just opening the app costs nothing.`,
      };
    }
    case "reset": {
      const smallLine = freezeCount === 0 ? "No streak freezes held" : `${freezePlural} held`;
      const freezeCountText = freezeCount === 1 ? "1 freeze" : `${freezeCount} freezes`;
      const streakSentence =
        currentStreak > 0
          ? `With ${dayPlural} missed and ${freezeCountText} held, your streak will restart at day 1 when you complete your next task.`
          : "Your next completed task starts a new streak.";
      const freezeRetention = freezeCount > 0 ? " Your freezes won't be spent." : "";
      return {
        badge: `Pitstop mode · ${dayPlural} offline`,
        eyebrow: "Fresh start",
        smallLine,
        heading: "Life happens. Ready for a fresh start?",
        body: `Your plan and progress are still here. ${streakSentence}${freezeRetention} Reshuffle below to set a comfortable pace.`,
      };
    }
    case "loading":
      return {
        badge: "Pitstop mode",
        eyebrow: "Pacing check",
        smallLine: null,
        heading: "Take your time. Let's reshuffle.",
        body: "Reshuffle below to adjust your pace, or head back to Today whenever you're ready.",
      };
    case "unavailable":
    default:
      return {
        badge: "Pitstop mode",
        eyebrow: "Pacing check",
        smallLine: "Streak status unavailable",
        heading: "Take your time. Let's reshuffle.",
        body: "We can't check your streak right now. Reshuffle below to adjust your pace, or head back to Today whenever you're ready.",
      };
  }
}

export function MissedDaysPage() {
  const navigate = useNavigate();
  const isOffline = useBackendOffline();
  const { duration, reshufflePlan } = usePlan();
  const [selectedOption, setSelectedOption] = useState<ReshuffleMode>("spread");
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsFailed, setStatsFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getStats()
      .then((st) => {
        if (!active) return;
        setStats(st);
      })
      .catch(() => {
        if (!active) return;
        setStatsFailed(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleApply = async () => {
    setSubmitting(true);
    try {
      await reshufflePlanApi(selectedOption);
    } catch (err) {
      console.error("Backend reshuffle failed:", err);
    }
    reshufflePlan(selectedOption);
    navigate("/today");
  };

  let pageState: PageState = "loading";
  let missedDays = 0;
  let freezeCount = 0;

  if (statsFailed || isOffline) {
    pageState = "unavailable";
  } else if (!stats) {
    pageState = "loading";
  } else if (stats.streak?.freezeCount === undefined) {
    pageState = "unavailable";
  } else {
    freezeCount = stats.streak.freezeCount;
    missedDays = getMissedDays(stats.streak.lastActiveDate);
    if (missedDays === 0) {
      pageState = "caughtUp";
    } else if (missedDays >= 1 && missedDays <= freezeCount) {
      pageState = "covered";
    } else {
      pageState = "reset";
    }
  }

  const currentStreak = stats?.streak?.currentDays ?? 0;
  const heroContent = getHeroContent(pageState, missedDays, freezeCount, currentStreak);

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
          {heroContent.badge}
        </span>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-[28px] border border-border bg-surface p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-peach/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-mint/80 blur-3xl" />

        <div className="relative">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-peach text-streak shadow-sm">
              <Flame size={24} fill="currentColor" />
              <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-surface text-progress-strong shadow-sm">
                <Snowflake className="h-3 w-3" />
              </span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-progress-strong">
                {heroContent.eyebrow}
              </p>
              {heroContent.smallLine && (
                <p className="text-xs text-muted">{heroContent.smallLine}</p>
              )}
            </div>
          </div>

          <h1 className="font-sans text-3xl font-semibold leading-tight tracking-[-0.055em] text-text sm:text-4xl">
            {heroContent.heading}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {heroContent.body}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <section
          aria-labelledby="freeze-card-heading"
          className="relative overflow-hidden rounded-2xl border border-progress-strong/30 bg-mint/35 p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-progress-strong shadow-sm">
                <Snowflake className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    id="freeze-card-heading"
                    className="font-sans text-base font-semibold text-text"
                  >
                    Streak freezes
                  </h2>
                  {(pageState === "caughtUp" || pageState === "covered" || pageState === "reset") &&
                    stats &&
                    stats.streak?.freezeCount !== undefined &&
                    stats.streak?.freezeCap !== undefined && (
                    <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface px-2.5 py-0.5 text-xs font-semibold text-progress-strong">
                      <Snowflake className="h-3.5 w-3.5" />
                      {stats.streak.freezeCount} / {stats.streak.freezeCap} streak freezes held
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">
                  Freezes are used automatically, one per missed day, when you complete a task after a gap.
                </p>
              </div>
            </div>
          </div>
        </section>

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
                Adds a few extra minutes to your morning and evening sessions so you can catch up. Your target end date ({duration} days) remains
                unchanged.
              </p>
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
                from day {duration} to day {duration + EXTEND_DAYS}.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-bg p-2.5 text-xs">
                <span className="inline-flex items-center gap-1 font-semibold text-text">
                  <Clock3 size={13} className="text-progress-strong" /> Daily minutes unchanged
                </span>
                <span className="ml-auto inline-flex items-center gap-1 font-semibold text-muted">
                  <CalendarDays size={13} /> +{EXTEND_DAYS} days added
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
          You can adjust your plan anytime in Settings.
        </p>
      </div>
    </div>
  );
}
