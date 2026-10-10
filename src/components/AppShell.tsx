import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Bell,
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  Flame,
  Map,
  Settings2,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { getPlan, getStats, useBackendOffline } from "../services/api";
import type { Plan, Stats } from "../types";
import { usePlan } from "../state/PlanContext";
import { AiDrawer } from "./AiDrawer";

const navigation = [
  { label: "Today", to: "/today", icon: BookOpen },
  { label: "Roadmap", to: "/roadmap", icon: Map },
  { label: "Progress", to: "/progress", icon: ChartNoAxesColumnIncreasing },
  { label: "Settings", to: "/settings", icon: Settings2 },
];

export function AppShell() {
  const isOffline = useBackendOffline();
  const { skill, setSkill, currentDay, totalDays, slots, updateSlotStartTime } = usePlan();
  const morningStart = slots.find((s) => s.id === "morning")?.startTime || "8:15 AM";
  const [plan, setPlan] = useState<Plan | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(false);
  const [timetable, setTimetable] = useState(morningStart);
  const [noticeOpen, setNoticeOpen] = useState(false);

  useEffect(() => {
    setTimetable(morningStart);
  }, [morningStart]);

  useEffect(() => {
    let active = true;
    Promise.all([getPlan(), getStats()])
      .then(([value, nextStats]) => {
        if (active) {
          setPlan(value);
          setStats(nextStats);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!brandOpen && !noticeOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setBrandOpen(false);
        setNoticeOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [brandOpen, noticeOpen]);

  const displaySkill = skill || "Your learning plan";
  const activeNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive ? "bg-mint text-text" : "text-muted hover:bg-bg hover:text-text"
    }`;
  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors ${
      isActive ? "text-text" : "text-muted"
    }`;

  return (
    <div className="min-h-[100dvh] bg-bg text-text">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-surface px-5 py-6 lg:flex">
        <div className="mb-10 inline-flex w-fit items-center gap-2.5 rounded-lg text-[19px] font-bold tracking-[-0.04em]">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles size={16} strokeWidth={2.2} />
          </span>
          ASTUTO
        </div>
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Your space
        </p>
        <nav aria-label="Main navigation" className="space-y-1">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={activeNavClass}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-card border border-border bg-bg p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Flame size={17} className="text-streak" fill="currentColor" />
            {stats ? `${stats.streak.currentDays}-day streak` : "Your streak"}
          </div>
          <p className="text-xs leading-relaxed text-muted">
            {stats ? `${stats.streak.currentDays} days of showing up. Keep your rhythm.` : "A little practice, often."}
          </p>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur">
          <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:px-10">
            <div className="relative">
              <button
                type="button"
                aria-expanded={brandOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setBrandOpen((value) => !value);
                  setNoticeOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl px-1 py-1 text-left hover:bg-surface focus-visible:outline"
              >
                <span className="hidden h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground sm:grid lg:hidden">
                  <Sparkles size={16} />
                </span>
                <span className="text-base font-bold tracking-[-0.04em] lg:hidden">ASTUTO</span>
                <span className="hidden text-sm font-bold tracking-[-0.04em] lg:inline">ASTUTO</span>
                <span className="hidden max-w-[280px] items-center gap-1.5 truncate rounded-pill border border-border bg-surface px-3 py-2 text-xs font-medium sm:inline-flex">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-progress-strong" />
                  <span className="max-w-[190px] truncate">{displaySkill}</span>
                  <span className="text-muted">·</span>
                  Day {currentDay} of {totalDays}
                  <ChevronDown size={14} className="ml-0.5 text-muted" />
                </span>
                <span className="inline-flex max-w-[120px] shrink-0 items-center gap-1 whitespace-nowrap rounded-pill border border-border bg-surface px-2 py-1.5 text-[11px] font-medium sm:hidden">
                  <span className="max-w-[48px] shrink-0 truncate">{displaySkill.split(" ")[0]}</span>
                  <span className="text-muted">·</span>
                  D{currentDay}
                  <ChevronDown size={12} className="shrink-0 text-muted" />
                </span>
              </button>
              {brandOpen && (
                <div
                  role="menu"
                  aria-label="ASTUTO options"
                  className="absolute left-0 top-full mt-2 w-[min(300px,calc(100vw-32px))] rounded-card border border-border bg-surface p-2"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setSkill(
                        skill === "Python for Data Science"
                          ? "Data Structures & Algorithms"
                          : "Python for Data Science",
                      );
                      setBrandOpen(false);
                    }}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-bg"
                  >
                    <span className="block font-semibold">Switch displayed skill</span>
                    <span className="mt-0.5 block text-xs text-muted">{displaySkill}</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setEditingTimetable((value) => !value)}
                    className="w-full rounded-xl px-3 py-2.5 text-left text-sm hover:bg-bg"
                  >
                    <span className="block font-semibold">Edit timetable</span>
                    <span className="mt-0.5 block text-xs text-muted">Adjust your morning start time</span>
                  </button>
                  {editingTimetable && (
                    <form
                      className="mt-1 border-t border-border p-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        updateSlotStartTime("morning", timetable.trim() || morningStart);
                        setEditingTimetable(false);
                        setBrandOpen(false);
                      }}
                    >
                      <label htmlFor="timetable-start" className="mb-1.5 block text-xs font-medium text-muted">
                        Morning start
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="timetable-start"
                          value={timetable}
                          onChange={(event) => setTimetable(event.target.value)}
                          className="min-w-0 flex-1 rounded-xl border border-border bg-bg px-3 py-2 text-sm"
                        />
                        <button type="submit" className="rounded-pill bg-primary px-3 text-xs font-semibold text-primary-foreground">
                          Save
                        </button>
                      </div>
                      <span className="sr-only">Saved time is {morningStart}</span>
                    </form>
                  )}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <span className="inline-flex items-center gap-1 rounded-pill bg-peach px-2 py-1.5 text-xs font-semibold sm:gap-1.5 sm:px-2.5">
                <Flame size={15} className="text-streak" fill="currentColor" />
                <span className="sm:hidden">{stats?.streak.currentDays ?? "—"}</span>
                <span className="hidden sm:inline">{stats?.streak.currentDays ?? "—"} day streak</span>
              </span>
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={noticeOpen}
                onClick={() => {
                  setNoticeOpen((value) => !value);
                  setBrandOpen(false);
                }}
                className="relative grid h-8 w-8 place-items-center rounded-full hover:bg-surface sm:h-9 sm:w-9"
              >
                <Bell size={18} strokeWidth={1.8} />
              </button>
              {noticeOpen && (
                <div className="absolute right-4 top-[60px] w-[min(280px,calc(100vw-32px))] rounded-card border border-border bg-surface p-4 sm:right-16">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-semibold">A gentle nudge</p>
                    <button type="button" aria-label="Close notifications" onClick={() => setNoticeOpen(false)}>
                      <X size={16} className="text-muted" />
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-muted">Your next practice is ready whenever you are.</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setAiOpen(true)}
                aria-label="Open ASTUTO AI"
                className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-[1.03]"
              >
                <Sparkles size={17} />
              </button>
              <button
                type="button"
                aria-label={`Profile: ${plan?.user.name ?? "Student"}`}
                className="grid h-8 w-8 place-items-center rounded-full border border-border bg-surface text-xs font-semibold sm:h-9 sm:w-9"
              >
                {plan?.user.avatarInitials ?? <UserRound size={16} />}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100dvh-68px)] max-w-[1440px] px-4 pb-24 pt-7 sm:px-6 sm:pt-9 lg:px-10 lg:pb-12">
          {isOffline && (
            <div
              role="status"
              className="mb-6 flex items-center gap-2.5 rounded-2xl border border-border bg-peach/60 px-4 py-2.5 text-xs text-text shadow-xs"
            >
              <span className="h-2 w-2 rounded-full bg-streak" />
              <span className="font-medium">Showing demo data. Backend is offline.</span>
            </div>
          )}
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Main navigation"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface px-3 pb-[max(8px,env(safe-area-inset-bottom))] pt-1.5 lg:hidden"
      >
        {navigation.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={mobileNavClass}>
            <Icon size={19} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <AiDrawer open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}
