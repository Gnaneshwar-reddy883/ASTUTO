// Purpose: collect a learner's skill, current level, timeline, and daily windows in four local-only steps.
// Components used: lucide-react icons. API functions called: none. Real data needed: none.
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Moon,
  Sparkles,
  Sun,
  Sunset,
  X,
} from "lucide-react";
import type { TimeSlot } from "../types";
import {
  defaultOnboardingDraft,
  isOnboardingDraft,
  type LearnerLevel,
  type OnboardingDraft,
  type OnboardingRouteState,
  type PlanDuration,
} from "../types/onboarding";
import { usePlan } from "../state/PlanContext";

export function OnboardingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { asDraft, applyDraft } = usePlan();
  const routeState = location.state as OnboardingRouteState | null;
  const initialDraft = isOnboardingDraft(routeState?.draft) ? routeState.draft : asDraft || defaultOnboardingDraft;
  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    ...initialDraft,
    minutes: { ...initialDraft.minutes },
  }));
  const [step, setStep] = useState(() => Math.min(4, Math.max(1, routeState?.step ?? 1)));
  const totalMinutes = Object.values(draft.minutes).reduce((sum, value) => sum + value, 0);
  const stepTitles = ["Choose your skill", "Where are you starting?", "Choose your timeline", "Find your daily rhythm"];
  const skillSuggestions = ["Python", "UX design", "Spanish", "Data analysis", "Guitar", "Public speaking"];
  const levels: { title: LearnerLevel; description: string; tag: string }[] = [
    { title: "Starting fresh", description: "I'm new to this and want a clear place to begin.", tag: "Beginner" },
    { title: "Know a little", description: "I've tried a few things, but need the pieces to connect.", tag: "Some experience" },
    { title: "Comfortable", description: "I know the foundations and want to go further.", tag: "Building on basics" },
  ];
  const durations: { value: PlanDuration; pace: string; note: string }[] = [
    { value: 30, pace: "Focused", note: "A quick, concentrated sprint" },
    { value: 60, pace: "Steady", note: "A balanced learning arc" },
    { value: 90, pace: "Sustainable", note: "Room to practice and revisit" },
    { value: 180, pace: "In depth", note: "A slower, thorough journey" },
  ];
  const slots: { key: TimeSlot; label: string; hint: string; Icon: typeof Sun }[] = [
    { key: "morning", label: "Morning", hint: "A clear start to the day", Icon: Sun },
    { key: "college", label: "Between classes", hint: "A pocket in your day", Icon: BookOpen },
    { key: "evening", label: "Evening", hint: "After the day settles", Icon: Sunset },
    { key: "night", label: "Night", hint: "A quiet end-of-day moment", Icon: Moon },
  ];

  const updateDraft = (update: Partial<OnboardingDraft>) => {
    const nextDraft = { ...draft, ...update };
    setDraft(nextDraft);
    applyDraft(nextDraft);
  };
  const changeMinutes = (slot: TimeSlot, value: number) => {
    const nextMinutes = { ...draft.minutes, [slot]: Math.max(0, Math.min(120, value)) };
    const nextDraft = { ...draft, minutes: nextMinutes };
    setDraft(nextDraft);
    applyDraft(nextDraft);
  };
  const next = () => {
    applyDraft(draft);
    if (step < 4) setStep((current) => current + 1);
    else navigate("/roadmap-preview", { state: { draft } });
  };

  return (
    <div className="min-h-[100dvh] bg-bg text-text">
      <header className="border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <Link to="/" aria-label="Back to ASTUTO home" className="grid h-10 w-10 place-items-center rounded-xl text-muted transition-colors hover:bg-surface hover:text-text"><ArrowLeft size={19} /></Link>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-extrabold tracking-[-0.06em]"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-primary-foreground"><Sparkles size={15} /></span>ASTUTO</Link>
            <span className="hidden text-muted/60 sm:inline">/</span>
            <span className="hidden text-sm font-medium text-muted sm:inline">Plan setup</span>
          </div>
          <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-2 text-xs font-medium text-muted"><Clock3 size={14} className="text-progress-strong" /> About 2 minutes</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pb-10 pt-6 sm:px-8 sm:pt-10 lg:px-12 lg:pt-12">
        <div className="mx-auto grid max-w-[1180px] gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)] lg:items-start">
          <section className="min-w-0">
            <div className="mb-5 flex items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-progress-strong">A plan that fits you</p>
                <p className="mt-1 text-sm font-semibold">Step {step} of 4 <span className="px-1 text-muted/60">·</span><span className="font-medium text-muted">{stepTitles[step - 1]}</span></p>
              </div>
              <span className="text-xs font-medium text-muted">{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="mb-6 flex gap-1.5" aria-label={`Step ${step} of 4`}>
              {[1, 2, 3, 4].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-pill transition-colors ${item <= step ? "bg-progress-strong" : "bg-border"}`} />)}
            </div>

            <div className="rounded-[26px] border border-border bg-surface p-5 shadow-[0_16px_55px_rgba(38,62,45,0.06)] sm:p-8">
              <div className="mb-7 flex items-start justify-between gap-4">
                <div>
                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-pill bg-mint px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-progress-strong"><Sparkles size={13} /> Your learning direction</span>
                  <h1 className="font-sans text-3xl font-semibold leading-tight tracking-[-0.055em] sm:text-4xl">{stepTitles[step - 1]}</h1>
                  <p className="mt-2 max-w-[560px] text-sm leading-6 text-muted">
                    {step === 1 && "One skill is enough to begin. You can make the goal more specific whenever you're ready."}
                    {step === 2 && "Your starting point helps us keep the first steps useful, not overwhelming."}
                    {step === 3 && "Pick a horizon that gives you space to learn around the rest of your life."}
                    {step === 4 && "Choose the windows that feel realistic. Any slot can be left at zero."}
                  </p>
                </div>
                <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-bg text-progress-strong sm:grid"><span className="font-sans text-xl">{String(step).padStart(2, "0")}</span></span>
              </div>

              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label htmlFor="onboarding-skill" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-muted">I want to learn</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg px-4 py-3.5 transition-colors focus-within:border-progress-strong">
                      <CompassIcon />
                      <input
                        id="onboarding-skill"
                        autoFocus
                        value={draft.skill}
                        onChange={(event) => updateDraft({ skill: event.target.value })}
                        onKeyDown={(event) => { if (event.key === "Enter" && draft.skill.trim()) next(); }}
                        placeholder="e.g. Python for Data Science"
                        className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:font-normal placeholder:text-muted/60"
                      />
                      {draft.skill && <button type="button" onClick={() => updateDraft({ skill: "" })} aria-label="Clear skill" className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-surface hover:text-text"><X size={15} /></button>}
                    </div>
                  </div>
                  <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">A few places to start</p>
                    <div className="flex flex-wrap gap-2">
                      {skillSuggestions.map((skill) => (
                        <button key={skill} type="button" onClick={() => updateDraft({ skill })} className={`rounded-pill border px-3.5 py-2 text-sm font-medium transition-colors ${draft.skill === skill ? "border-progress-strong bg-mint text-progress-strong" : "border-border bg-surface hover:border-progress-strong/50 hover:bg-bg"}`}>{skill}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-bg px-4 py-3.5 text-sm leading-6 text-muted">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface text-progress-strong"><CheckCircle2 size={16} /></span>
                    Keep the goal simple. You can focus it down to a project, exam, or practical outcome later.
                  </div>
                </div>
              )}

              {step === 2 && (
                <fieldset>
                  <legend className="sr-only">Choose your current level</legend>
                  <div className="space-y-3">
                    {levels.map(({ title, description, tag }) => (
                      <button key={title} type="button" onClick={() => updateDraft({ level: title })} aria-pressed={draft.level === title} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors sm:p-5 ${draft.level === title ? "border-progress-strong bg-mint/50" : "border-border bg-surface hover:bg-bg"}`}>
                        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${draft.level === title ? "border-progress-strong bg-progress-strong text-white" : "border-border bg-surface"}`}>{draft.level === title && <Check size={14} strokeWidth={3} />}</span>
                        <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="font-semibold">{title}</span><span className="rounded-pill bg-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">{tag}</span></span><span className="mt-1 block text-sm leading-5 text-muted">{description}</span></span>
                        <ArrowRight size={16} className={draft.level === title ? "text-progress-strong" : "text-muted/50"} />
                      </button>
                    ))}
                  </div>
                  <p className="mt-5 rounded-xl bg-bg p-4 text-sm leading-6 text-muted">There is no wrong answer. We'll start with the ideas you need and let practice build from there.</p>
                </fieldset>
              )}

              {step === 3 && (
                <fieldset>
                  <legend className="sr-only">Choose your target duration</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {durations.map(({ value, pace, note }) => (
                      <button key={value} type="button" onClick={() => updateDraft({ duration: value })} aria-pressed={draft.duration === value} className={`relative flex min-h-[142px] flex-col rounded-2xl border p-4 text-left transition-colors sm:p-5 ${draft.duration === value ? "border-progress-strong bg-mint/50" : "border-border bg-surface hover:bg-bg"}`}>
                        {value === 90 && <span className="absolute right-3 top-3 rounded-pill bg-surface px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-progress-strong">A gentle pace</span>}
                        <span className={`text-[11px] font-bold uppercase tracking-[0.14em] ${draft.duration === value ? "text-progress-strong" : "text-muted"}`}>{pace}</span>
                        <span className="mt-5 text-2xl font-semibold tracking-tight">{value} <span className="text-sm font-medium text-muted">days</span></span>
                        <span className="mt-1 text-xs text-muted">{note}</span>
                        {draft.duration === value && <span className="absolute bottom-4 right-4 grid h-6 w-6 place-items-center rounded-full bg-progress-strong text-white"><Check size={13} /></span>}
                      </button>
                    ))}
                  </div>
                  <p className="mt-5 flex items-center gap-2 text-sm text-muted"><Clock3 size={16} className="text-progress-strong" />A longer timeline leaves more room for repetition and rest.</p>
                </fieldset>
              )}

              {step === 4 && (
                <div>
                  <div className="mb-4 flex items-center justify-between rounded-2xl bg-primary px-4 py-4 text-primary-foreground sm:px-5">
                    <div><p className="text-xs font-medium text-primary-foreground/70">Daily practice budget</p><p className="mt-0.5 text-xl font-semibold tracking-tight">{totalMinutes} minutes <span className="text-sm font-medium text-primary-foreground/70">a day</span></p></div>
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-foreground/10"><Clock3 size={20} /></span>
                  </div>
                  <div className="space-y-2.5">
                    {slots.map(({ key, label, hint, Icon }) => (
                      <div key={key} className={`flex flex-wrap items-center gap-3 rounded-2xl border px-3.5 py-3.5 transition-colors sm:flex-nowrap sm:px-4 ${draft.minutes[key] > 0 ? "border-progress-strong/40 bg-mint/35" : "border-border bg-surface"}`}>
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${draft.minutes[key] > 0 ? "bg-surface text-progress-strong" : "bg-bg text-muted"}`}><Icon size={18} /></span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{label}</span><span className="mt-0.5 block text-xs text-muted">{hint}</span></span>
                        <div className="ml-auto flex items-center gap-2.5">
                          <button type="button" onClick={() => changeMinutes(key, draft.minutes[key] - 5)} aria-label={`Subtract 5 minutes from ${label}`} disabled={draft.minutes[key] === 0} className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted transition-colors hover:bg-surface disabled:opacity-40">−</button>
                          <label className="sr-only" htmlFor={`minutes-${key}`}>{label} minutes per day</label>
                          <input id={`minutes-${key}`} type="number" min="0" max="120" step="5" value={draft.minutes[key]} onChange={(event) => changeMinutes(key, Number(event.target.value) || 0)} className="w-12 border-0 bg-transparent text-center text-sm font-bold tabular-nums outline-none" />
                          <span className="w-8 text-xs text-muted">min</span>
                          <button type="button" onClick={() => changeMinutes(key, draft.minutes[key] + 5)} aria-label={`Add 5 minutes to ${label}`} className="grid h-8 w-8 place-items-center rounded-full border border-border text-muted transition-colors hover:bg-surface">+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs leading-5 text-muted">
                    {totalMinutes === 0
                      ? "Choose at least one practice window to preview a plan."
                      : "Your sessions can be as short as 5 minutes. Add only the time you want to protect."}
                  </p>
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                {step > 1 ? (
                  <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-4 text-sm font-semibold text-muted transition-colors hover:bg-bg hover:text-text"><ArrowLeft size={16} /> Back</button>
                ) : <Link to="/" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-4 text-sm font-semibold text-muted transition-colors hover:bg-bg hover:text-text"><ArrowLeft size={16} /> Back to home</Link>}
                <button type="button" onClick={next} disabled={(step === 1 && !draft.skill.trim()) || (step === 4 && totalMinutes === 0)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50">
                  {step === 4 ? "Preview my plan" : "Continue"} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-8 rounded-[26px] border border-border bg-surface p-6">
              <div className="mb-6 flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-progress-strong">Your plan taking shape</p><h2 className="mt-1 text-lg font-semibold">A little more you, each step</h2></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-progress-strong"><BookOpen size={18} /></span></div>
              <div className="space-y-3">
                <SummaryLine number="01" title="Skill" value={draft.skill || "Not chosen yet"} active={step === 1} />
                <SummaryLine number="02" title="Starting point" value={draft.level} active={step === 2} />
                <SummaryLine number="03" title="Time horizon" value={`${draft.duration} days`} active={step === 3} />
                <SummaryLine number="04" title="Your rhythm" value={totalMinutes ? `${totalMinutes} min / day` : "Not set yet"} active={step === 4} />
              </div>
              <div className="mt-6 rounded-2xl bg-bg p-4">
                <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-7 w-7 place-items-center rounded-lg bg-surface text-progress-strong"><CheckCircle2 size={16} /></span>Built around your real life</div>
                <p className="mt-2 text-xs leading-5 text-muted">Your plan starts with what you can make room for—not with a perfect week.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function CompassIcon() {
  return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-mint text-progress-strong"><Sparkles size={17} /></span>;
}

function SummaryLine({ number, title, value, active }: { number: string; title: string; value: string; active: boolean }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl px-3 py-3 ${active ? "bg-mint/50" : "bg-bg"}`}>
      <span className={`mt-0.5 text-[10px] font-bold tracking-wide ${active ? "text-progress-strong" : "text-muted"}`}>{number}</span>
      <div className="min-w-0 flex-1"><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{title}</p><p className={`mt-1 truncate text-sm font-semibold ${active ? "text-progress-strong" : "text-text"}`}>{value}</p></div>
      {active && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-progress-strong" />}
    </div>
  );
}
