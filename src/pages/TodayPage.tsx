import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CalendarDays, Check, Clock3, Plus, RotateCw, Sparkles, X } from "lucide-react";
import { completeTask, createTask, getPlan, getStats, getTodayTasks, toggleTaskApi } from "../services/api";
import type { Plan, Stats, Task, TimeSlot } from "../types";
import { MotivationCard } from "../components/MotivationCard";
import { PhaseNode } from "../components/PhaseNode";
import { ResourcesPanel } from "../components/ResourcesPanel";
import { StreakBadge } from "../components/StreakBadge";
import { TaskCard } from "../components/TaskCard";
import { usePlan } from "../state/PlanContext";

const slots: { id: TimeSlot; label: string; note: string }[] = [
  { id: "morning", label: "Morning", note: "A gentle start" },
  { id: "college", label: "College", note: "Between classes" },
  { id: "evening", label: "Evening", note: "Your focused practice" },
  { id: "night", label: "Night", note: "Close the loop" },
];

export function TodayPage() {
  const { currentDay } = usePlan();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlot, setNewSlot] = useState<TimeSlot>("evening");
  const [newMinutes, setNewMinutes] = useState(20);
  const [addingTask, setAddingTask] = useState(false);

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || addingTask) return;
    setAddingTask(true);
    setActionError("");
    try {
      const created = await createTask({
        title: newTitle.trim(),
        slot: newSlot,
        estimatedMinutes: Number(newMinutes) || 15,
      });
      setTasks((curr) => [...curr, created]);
      setNewTitle("");
      setShowAddForm(false);
    } catch {
      setActionError("Could not save the new task. Please try again.");
    } finally {
      setAddingTask(false);
    }
  }

  async function loadToday() {
    setLoading(true);
    setError("");
    try {
      const [nextPlan, nextTasks, nextStats] = await Promise.all([getPlan(), getTodayTasks(), getStats()]);
      setPlan(nextPlan);
      setTasks(nextTasks);
      setStats(nextStats);
    } catch {
      setError("We couldn’t load your plan right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadToday();
  }, []);

  const groupedTasks = useMemo(
    () => slots.map((slot) => ({ ...slot, tasks: tasks.filter((task) => task.slot === slot.id) })),
    [tasks],
  );
  const completedCount = tasks.filter((task) => task.completed).length;
  const remainingMinutes = tasks
    .filter((task) => !task.completed)
    .reduce((total, task) => total + task.estimatedMinutes, 0);
  const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const firstName = plan?.user.name.split(" ")[0] ?? "there";

  async function toggleTask(id: string) {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;

    setActionError("");
    try {
      if (task.completed) {
        const updated = await toggleTaskApi(id);
        setTasks((current) =>
          current.map((item) => (item.id === id ? { ...item, completed: updated.completed } : item)),
        );
      } else {
        const completedTask = await completeTask(id);
        setTasks((current) =>
          current.map((item) => (item.id === id ? { ...item, completed: completedTask.completed } : item)),
        );
      }
    } catch {
      setActionError("That task could not be updated. Please try again.");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl animate-pulse" aria-label="Loading today" aria-busy="true">
        <div className="h-4 w-36 rounded-pill bg-border" />
        <div className="mt-4 h-10 max-w-md rounded-xl bg-border" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {[0, 1, 2].map((item) => <div key={item} className="h-28 rounded-card border border-border bg-surface" />)}
          </div>
          <div className="space-y-4">
            <div className="h-44 rounded-card border border-border bg-surface" />
            <div className="h-56 rounded-card border border-border bg-surface" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !plan || !stats) {
    return (
      <div className="mx-auto max-w-xl rounded-card border border-border bg-surface p-6 text-center sm:p-9">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-peach">
          <AlertCircle size={20} />
        </span>
        <h1 className="mt-4 text-lg font-semibold">Your day is still here</h1>
        <p className="mt-2 text-sm text-muted">{error || "Your learning plan could not be loaded."}</p>
        <button type="button" onClick={() => void loadToday()} className="mt-5 inline-flex items-center gap-2 rounded-pill bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
          <RotateCw size={15} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1240px] animate-slide-up">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
        <div>
          <p className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted">
            <CalendarDays size={15} />
            {dateLabel}
            <span aria-hidden="true">·</span>
            <span>Good morning, {firstName}</span>
          </p>
          <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-semibold leading-tight tracking-[-0.055em]">
            Ready for day {currentDay || plan.currentDay}, {firstName}?
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            A steady little session adds up. Here’s a plan that fits into your day.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-pill border border-border bg-surface px-3.5 py-2 text-sm">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-progress text-progress-strong">
            <Check size={14} strokeWidth={2.5} />
          </span>
          <span className="font-semibold">{completedCount} of {tasks.length} done</span>
          {remainingMinutes > 0 && <span className="hidden text-muted sm:inline">· {remainingMinutes} min left</span>}
        </div>
      </div>

      {/* Missed days recovery banner */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-peach/70 p-4 shadow-sm sm:px-5 sm:py-3.5">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface text-streak shadow-xs">
            <Sparkles size={17} />
          </span>
          <div>
            <p className="text-sm font-semibold text-text">You missed 2 days. Want to reshuffle?</p>
            <p className="text-xs text-muted">A gentle readjustment to protect your rhythm and streak.</p>
          </div>
        </div>
        <Link
          to="/missed-days"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-pill bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
        >
          Reshuffle plan <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:gap-8">
        <section aria-labelledby="today-plan-heading" className="min-w-0">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Small steps, real progress</p>
              <h2 id="today-plan-heading" className="mt-1 text-xl font-semibold tracking-[-0.035em]">Today’s practice</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 pb-1 text-xs text-muted sm:inline-flex">
                <Clock3 size={14} /> {remainingMinutes} min left
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm((v) => !v)}
                className="inline-flex items-center gap-1 rounded-pill bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              >
                {showAddForm ? <X size={14} /> : <Plus size={14} />}
                {showAddForm ? "Cancel" : "Add Task"}
              </button>
            </div>
          </div>

          {showAddForm && (
            <form onSubmit={handleCreateTask} className="mb-5 rounded-2xl border border-border bg-surface p-4 shadow-sm animate-slide-up">
              <h3 className="mb-3 text-sm font-semibold">Add a new practice task</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="task-title" className="mb-1 block text-xs font-medium text-muted">
                    Task Title
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    required
                    placeholder="e.g. Build a mini calculator script"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="task-slot" className="mb-1 block text-xs font-medium text-muted">
                      Time Slot
                    </label>
                    <select
                      id="task-slot"
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value as TimeSlot)}
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="morning">Morning</option>
                      <option value="college">College</option>
                      <option value="evening">Evening</option>
                      <option value="night">Night</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="task-minutes" className="mb-1 block text-xs font-medium text-muted">
                      Minutes
                    </label>
                    <input
                      id="task-minutes"
                      type="number"
                      min={5}
                      max={180}
                      step={5}
                      value={newMinutes}
                      onChange={(e) => setNewMinutes(Number(e.target.value))}
                      className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="rounded-pill px-3 py-1.5 text-xs font-medium text-muted hover:bg-bg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingTask}
                    className="rounded-pill bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    {addingTask ? "Saving..." : "Save task"}
                  </button>
                </div>
              </div>
            </form>
          )}
          {actionError && <p role="alert" className="mb-3 text-sm text-muted">{actionError}</p>}
          <div className="space-y-5">
            {groupedTasks.map((group) => group.tasks.length > 0 && (
              <section key={group.id} aria-labelledby={`slot-${group.id}`}>
                <div className="mb-2.5 flex items-center justify-between">
                  <h3 id={`slot-${group.id}`} className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{group.label}</h3>
                  <span className="text-xs text-muted">{group.note}</span>
                </div>
                <div className="space-y-2.5">
                  {group.tasks.map((task) => <TaskCard key={task.id} task={task} onToggle={toggleTask} />)}
                </div>
              </section>
            ))}
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-[88px]">
          <StreakBadge streak={stats.streak} />
          <ResourcesPanel resources={plan.resources} />
            <PhaseNode
              phase={plan.currentPhase}
              milestoneTitle={stats.milestoneTitle}
              milestoneProgress={stats.milestoneProgress}
            />
          <MotivationCard completedCount={completedCount} totalCount={tasks.length} />
        </aside>
      </div>
    </div>
  );
}
