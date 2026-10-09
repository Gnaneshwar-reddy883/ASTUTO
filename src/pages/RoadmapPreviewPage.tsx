// Purpose: show a front-end-only roadmap summary and first-week plan before entering the learner app.
// Components used: lucide-react icons. API functions called: none. Real data needed: none.
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";
import { defaultOnboardingDraft, isOnboardingDraft, type OnboardingDraft, type OnboardingRouteState } from "../types/onboarding";

export function RoadmapPreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state as OnboardingRouteState | null;
  const draft: OnboardingDraft = isOnboardingDraft(routeState?.draft) ? routeState.draft : { ...defaultOnboardingDraft, skill: "Python for Data Science" };
  const skill = draft.skill || "your chosen skill";
  const dailyTotal = Object.values(draft.minutes).reduce((total, minutes) => total + minutes, 0);
  const activeSlots = Object.entries(draft.minutes).filter(([, minutes]) => minutes > 0);
  const weeks = Math.max(4, Math.round(draft.duration / 7));
  const sources = 6;
  const phaseBoundaries = [
    Math.max(1, Math.ceil(weeks * 0.25)),
    Math.max(2, Math.ceil(weeks * 0.5)),
    Math.max(3, Math.ceil(weeks * 0.75)),
    weeks,
  ];
  const phases = [
    { title: "Start with the essentials", weeks: `Weeks 1–${phaseBoundaries[0]}`, detail: `Core ideas, useful vocabulary, and your first small exercises in ${skill}.`, project: "A first-practice checkpoint" },
    { title: "Build a working foundation", weeks: `Weeks ${phaseBoundaries[0] + 1}–${phaseBoundaries[1]}`, detail: "Connect the building blocks through guided examples and short practice.", project: "A useful mini-project" },
    { title: "Practice with more independence", weeks: `Weeks ${phaseBoundaries[1] + 1}–${phaseBoundaries[2]}`, detail: "Use what you know to work through realistic, increasingly open challenges.", project: "A practical application" },
    { title: "Bring it together", weeks: `Weeks ${phaseBoundaries[2] + 1}–${phaseBoundaries[3]}`, detail: "Finish with a project that shows what you can do and what comes next.", project: "A finished capstone" },
  ];
  const firstWeek = [
    { day: "Day 01", title: "Set up your learning space", slot: activeSlots[0], detail: "Make the next session easy to start." },
    { day: "Day 02", title: `Meet the core ideas in ${skill}`, slot: activeSlots[1] ?? activeSlots[0], detail: "A short lesson, then a few notes." },
    { day: "Day 03", title: "Try a guided practice", slot: activeSlots[0], detail: "Use the idea while it's still fresh." },
    { day: "Day 04", title: "Pause and review", slot: activeSlots[1] ?? activeSlots[0], detail: "Return to anything that felt new." },
    { day: "Day 05", title: "Make a small thing", slot: activeSlots[0], detail: "Put one concept to work." },
    { day: "Day 06", title: "Practice at your own pace", slot: activeSlots[1] ?? activeSlots[0], detail: "Repeat a challenge or explore further." },
    { day: "Day 07", title: "Look back at your first week", slot: activeSlots[0], detail: "Notice what clicked. That's progress." },
  ];
  const slotName = (slot: [string, number] | undefined) => {
    if (!slot) return "Flexible session";
    const names: Record<string, string> = { morning: "Morning", college: "Between classes", evening: "Evening", night: "Night" };
    return `${names[slot[0]] ?? "Practice"} · ${slot[1]} min`;
  };

  return (
    <div className="min-h-[100dvh] bg-bg text-text">
      <header className="border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate("/onboarding", { state: { draft, step: 4 } })} aria-label="Edit plan" className="grid h-10 w-10 place-items-center rounded-xl text-muted transition-colors hover:bg-surface hover:text-text"><ArrowLeft size={19} /></button>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-extrabold tracking-[-0.06em]"><span className="grid h-8 w-8 place-items-center rounded-[10px] bg-primary text-primary-foreground"><Sparkles size={15} /></span>ASTUTO</Link>
          </div>
          <span className="hidden items-center gap-2 rounded-pill border border-border bg-surface px-3 py-2 text-xs font-medium text-muted sm:inline-flex"><CheckCircle2 size={14} className="text-progress-strong" /> Preview ready</span>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pb-12 pt-7 sm:px-8 sm:pt-10 lg:px-12 lg:pt-12">
        <div className="mx-auto max-w-[1180px]">
          <section className="relative mb-8 overflow-hidden rounded-[30px] border border-border bg-surface px-5 py-7 shadow-[0_18px_58px_rgba(38,62,45,0.06)] sm:px-8 sm:py-10 lg:px-12">
            <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-mint blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <span className="inline-flex items-center gap-2 rounded-pill bg-mint px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-progress-strong"><CheckCircle2 size={14} /> Your plan is taking shape</span>
                <h1 className="mt-5 max-w-[750px] font-serif text-4xl font-semibold leading-[1.02] tracking-[-0.065em] sm:text-6xl">
                  A {draft.duration}-day path to <span className="text-progress-strong">{skill}.</span>
                </h1>
                <p className="mt-4 max-w-[650px] text-sm leading-6 text-muted sm:text-base sm:leading-7">
                  A {draft.level.toLowerCase()} plan, paced for about {dailyTotal || 15} minutes a day. Clear milestones, free learning material, and a first week you can picture.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:min-w-[300px]">
                <Metric icon={<Clock3 size={17} />} value={`${dailyTotal || 15} min`} label="per day" />
                <Metric icon={<Layers3 size={17} />} value="4 phases" label="in your roadmap" />
                <Metric icon={<BookOpen size={17} />} value={`${weeks} weeks`} label="at your pace" />
                <Metric icon={<CheckCircle2 size={17} />} value="Free" label="resources only" />
              </div>
            </div>
            <div className="relative mt-7 flex flex-wrap items-center gap-2 border-t border-border pt-5 text-xs text-muted">
              <span className="inline-flex items-center gap-2 rounded-pill bg-bg px-3 py-2 font-semibold text-text"><Sparkles size={14} className="text-progress-strong" /> Sources compared: {sources}</span>
              <span className="rounded-pill bg-bg px-3 py-2">{draft.level}</span>
              <span className="rounded-pill bg-bg px-3 py-2">{activeSlots.length || 0} practice {activeSlots.length === 1 ? "window" : "windows"}</span>
              <button type="button" onClick={() => navigate("/onboarding", { state: { draft, step: 1 } })} className="ml-auto inline-flex items-center gap-1 rounded-pill px-3 py-2 font-semibold text-progress-strong transition-colors hover:bg-mint">Edit plan <ArrowRight size={14} /></button>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.86fr)] lg:items-start">
            <section className="rounded-[26px] border border-border bg-surface p-5 sm:p-7">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-progress-strong">The longer view</p><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Your learning roadmap</h2></div>
                <span className="rounded-pill bg-mint px-3 py-1.5 text-xs font-semibold text-progress-strong">4 phases · {weeks} weeks</span>
              </div>
              <div className="relative space-y-3">
                <span className="absolute bottom-8 left-[19px] top-6 w-px bg-border" />
                {phases.map((phase, index) => (
                  <article key={phase.title} className={`relative ml-0 rounded-2xl border p-4 pl-14 transition-colors sm:p-5 sm:pl-[68px] ${index === 0 ? "border-progress-strong/40 bg-mint/30" : "border-border bg-surface"}`}>
                    <span className={`absolute left-3 top-4 grid h-9 w-9 place-items-center rounded-xl text-xs font-bold ${index === 0 ? "bg-progress-strong text-white" : "bg-bg text-muted"}`}>0{index + 1}</span>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-[0.13em] ${index === 0 ? "text-progress-strong" : "text-muted"}`}>{index === 0 ? "First up" : `Phase ${index + 1}`}</span>
                      <span className="rounded-pill bg-bg px-2.5 py-1 text-[11px] font-medium text-muted">{phase.weeks}</span>
                    </div>
                    <h3 className="mt-1 text-base font-semibold tracking-tight sm:text-lg">{phase.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted">{phase.detail}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-bg px-3 py-2 text-xs font-medium text-muted"><Target size={14} className="text-progress-strong" />Milestone: <span className="font-semibold text-text">{phase.project}</span></div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[26px] border border-border bg-surface p-5 sm:p-7">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-progress-strong">Start small, start here</p><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Your first week</h2><p className="mt-1 text-sm text-muted">A gentle introduction to your new rhythm.</p></div>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint text-progress-strong"><BookOpen size={19} /></span>
              </div>
              <div className="mb-4 flex items-center justify-between rounded-2xl bg-primary px-4 py-3.5 text-primary-foreground">
                <div><p className="text-xs font-medium text-primary-foreground/70">Your daily commitment</p><p className="mt-0.5 text-lg font-semibold">{dailyTotal || 15} minutes</p></div>
                <div className="text-right"><p className="text-xs font-medium text-primary-foreground/70">Starting level</p><p className="mt-0.5 text-sm font-semibold">{draft.level}</p></div>
              </div>
              <ol className="space-y-2">
                {firstWeek.map((item, index) => (
                  <li key={item.day} className="flex items-start gap-3 rounded-xl bg-bg px-3 py-3">
                    <span className={`mt-0.5 grid h-7 w-[54px] shrink-0 place-items-center rounded-lg text-[10px] font-bold ${index === 0 ? "bg-mint text-progress-strong" : "bg-surface text-muted"}`}>{item.day}</span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs text-muted">{item.detail}</span></span>
                    <span className="hidden shrink-0 rounded-pill bg-surface px-2 py-1 text-[10px] font-medium text-muted sm:inline-flex">{slotName(item.slot)}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-border p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-peach text-streak"><Sparkles size={16} /></span>
                <p className="text-xs leading-5 text-muted"><span className="font-semibold text-text">Room for real life.</span> Your plan is a starting point. Adjust your rhythm whenever you need to.</p>
              </div>
            </section>
          </div>

          <section className="mt-6 flex flex-col gap-4 rounded-[26px] border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div><p className="text-lg font-semibold tracking-tight">Ready for your first small step?</p><p className="mt-1 text-sm text-muted">Your preview stays here for this session. Starting takes you to your Today view.</p></div>
            <div className="flex flex-col gap-2 sm:min-w-[240px]">
              <button type="button" onClick={() => navigate("/today", { state: { draft } })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Start my plan <ArrowRight size={16} /></button>
              <button type="button" onClick={() => navigate("/onboarding", { state: { draft, step: 4 } })} className="min-h-10 rounded-pill px-4 text-xs font-semibold text-muted transition-colors hover:bg-bg hover:text-text"><ArrowLeft size={13} className="mr-1 inline" />Make a change</button>
            </div>
          </section>
          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-muted"><Check size={14} className="text-progress-strong" />A clear sequence, compared across {sources} learning sources.</p>
        </div>
      </main>
    </div>
  );
}

function Metric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return <div className="min-w-[120px] rounded-2xl bg-bg px-3 py-3"><span className="mb-2 inline-flex text-progress-strong">{icon}</span><p className="text-sm font-semibold">{value}</p><p className="mt-0.5 text-[11px] text-muted">{label}</p></div>;
}
