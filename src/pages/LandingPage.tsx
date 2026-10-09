// Purpose: introduce ASTUTO and guide self-directed learners into a local onboarding flow.
// Components used: lucide-react icons. API functions called: none. Real data needed: none.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  Layers3,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { defaultOnboardingDraft } from "../types/onboarding";

export function LandingPage() {
  const [skill, setSkill] = useState("Python for Data Science");
  const navigate = useNavigate();
  const suggestions = ["Python", "UX design", "Spanish", "Data analysis"];

  const startSetup = () => {
    navigate("/onboarding", {
      state: { draft: { ...defaultOnboardingDraft, skill: skill.trim() } },
    });
  };

  return (
    <div className="min-h-[100dvh] overflow-hidden bg-bg text-text">
      <header className="relative z-10 border-b border-border/80 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" aria-label="ASTUTO home" className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles size={18} strokeWidth={2} />
            </span>
            <span className="text-[18px] font-extrabold tracking-[-0.07em]">ASTUTO</span>
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
            <a href="#approach" className="transition-colors hover:text-text">How it works</a>
            <a href="#daily-practice" className="transition-colors hover:text-text">Your daily plan</a>
            <a href="#why-astuto" className="transition-colors hover:text-text">Why ASTUTO</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={startSetup}
              className="inline-flex min-h-10 items-center gap-2 rounded-pill bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              Get started <ArrowRight size={15} />
            </button>
            <a className="grid h-10 w-10 place-items-center rounded-xl text-muted md:hidden" href="#approach" aria-label="Explore how it works">
              <Menu size={19} />
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:px-12 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute -left-44 top-0 h-[480px] w-[480px] rounded-full bg-mint/70 blur-3xl" />
          <div className="relative max-w-[680px] animate-slide-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-muted shadow-sm">
              <span className="h-2 w-2 rounded-full bg-progress-strong" />
              A better rhythm for learning anything
            </div>
            <h1 className="max-w-[720px] font-sans text-[clamp(3.2rem,7.2vw,6.25rem)] font-semibold leading-[0.98] tracking-[-0.075em]">
              Make room for the skill you{" "}
              <span className="relative inline-block text-progress-strong">
                really want.
                <span className="absolute -bottom-1 left-1 right-0 h-[9px] -rotate-1 rounded-[50%] border-b-[3px] border-progress-strong/40" />
              </span>
            </h1>
            <p className="mt-7 max-w-[560px] text-base leading-7 text-muted sm:text-lg sm:leading-8">
              ASTUTO turns a big learning goal into a small, steady practice plan shaped around the time you actually have.
            </p>

            <form
              className="mt-8 max-w-[600px] rounded-[24px] border border-border bg-surface p-2.5 shadow-[0_18px_60px_rgba(38,62,45,0.09)]"
              onSubmit={(event) => {
                event.preventDefault();
                startSetup();
              }}
            >
              <label htmlFor="landing-skill" className="sr-only">What do you want to learn?</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex min-h-[54px] min-w-0 flex-1 items-center gap-3 rounded-2xl bg-bg px-4">
                  <Compass size={19} className="shrink-0 text-progress-strong" />
                  <input
                    id="landing-skill"
                    value={skill}
                    onChange={(event) => setSkill(event.target.value)}
                    placeholder="What do you want to learn?"
                    className="w-full min-w-0 bg-transparent text-sm font-medium outline-none placeholder:text-muted/70 sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!skill.trim()}
                  className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Build my plan <ArrowRight size={17} />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 px-2 pb-1 pt-3">
                <span className="mr-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Try</span>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setSkill(suggestion)}
                    className={`rounded-pill px-3 py-1.5 text-xs font-medium transition-colors ${
                      skill.toLowerCase() === suggestion.toLowerCase()
                        ? "bg-mint text-progress-strong"
                        : "bg-bg text-muted hover:bg-mint hover:text-text"
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} className="text-progress-strong" /> Free resources only</span>
              <span className="inline-flex items-center gap-1.5"><Clock3 size={15} className="text-progress-strong" /> Starts with your schedule</span>
              <span>2 minutes to set up</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[620px] animate-slide-up [animation-delay:100ms]">
            <div className="absolute -right-6 top-3 h-32 w-32 rounded-full bg-peach/80 blur-2xl" />
            <div className="relative rounded-[30px] border border-border bg-surface p-4 shadow-[0_28px_90px_rgba(42,56,45,0.12)] sm:p-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">A Tuesday, made manageable</p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">Your practice, in its place</h2>
                </div>
                <span className="rounded-pill bg-mint px-3 py-1.5 text-xs font-semibold text-progress-strong">Day 12</span>
              </div>
              <div className="my-5 flex items-center justify-between rounded-2xl bg-bg p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface text-progress-strong"><Target size={20} /></span>
                  <div><p className="text-sm font-semibold">Python for Data Science</p><p className="mt-0.5 text-xs text-muted">Week 2 · Building foundations</p></div>
                </div>
                <div className="text-right"><p className="text-sm font-semibold">45 min</p><p className="mt-0.5 text-xs text-muted">today</p></div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-mint text-progress-strong"><Check size={16} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-muted line-through">Variables &amp; data types</p><p className="mt-0.5 text-xs text-muted">Morning · 20 min</p></div>
                  <span className="text-[11px] font-medium text-progress-strong">Done</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-progress-strong/30 bg-mint/40 px-4 py-3.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-surface text-progress-strong"><BookOpen size={16} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Practice with lists</p><p className="mt-0.5 text-xs text-muted">Evening · 25 min</p></div>
                  <ArrowUpRight size={16} className="text-progress-strong" />
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-bg text-muted"><Clock3 size={16} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Review your notes</p><p className="mt-0.5 text-xs text-muted">Night · 10 min</p></div>
                  <span className="text-[11px] text-muted">Later</span>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-bg px-4 py-3">
                <span className="text-xs font-medium text-muted">Small steps add up</span>
                <div className="flex items-center gap-1.5" aria-label="4 of 7 days practiced">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => <span key={day} className={`h-2 w-5 rounded-pill ${day <= 4 ? "bg-progress-strong" : "bg-border"}`} />)}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-lg sm:flex">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-peach text-streak"><Layers3 size={18} /></span>
              <div><p className="text-xs font-semibold">One clear next step</p><p className="mt-0.5 text-[11px] text-muted">No more syllabus spirals</p></div>
            </div>
          </div>
        </section>

        <section id="why-astuto" className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:px-12 lg:py-24">
            <div className="max-w-[470px]">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-progress-strong">The self-study loop</p>
              <h2 className="font-sans text-4xl font-semibold leading-[1.05] tracking-[-0.06em] sm:text-5xl">You don't need more motivation. You need less guesswork.</h2>
              <p className="mt-5 leading-7 text-muted">A skill is a long road. ASTUTO makes the next few steps feel clear, useful, and possible to fit in.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { index: "01", title: "Too many starting points", copy: "Every tab promises the perfect curriculum. None tells you what to do first.", icon: Compass },
                { index: "02", title: "A schedule built on hope", copy: "“Sometime tonight” is easy to skip. Real windows make practice happen.", icon: Clock3 },
                { index: "03", title: "Progress feels invisible", copy: "Without small milestones, a big goal can feel like standing still.", icon: Layers3 },
              ].map(({ index, title, copy, icon: Icon }) => (
                <article key={index} className="rounded-[22px] border border-border bg-bg p-5 sm:p-6">
                  <div className="mb-7 flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.12em] text-muted">{index}</span><Icon size={19} className="text-progress-strong" /></div>
                  <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="approach" className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div className="max-w-[650px]">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-progress-strong">A thoughtful sequence</p>
              <h2 className="font-sans text-4xl font-semibold leading-[1.05] tracking-[-0.06em] sm:text-5xl">From “one day” to a good first week.</h2>
            </div>
            <p className="max-w-[340px] text-sm leading-6 text-muted">No giant commitment up front. Just a plan with a sensible order and room for real life.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              { number: "01", title: "Name your direction", desc: "Choose one skill, tell us where you're starting, and pick a time horizon that feels kind.", detail: "Your goal, in your words", icon: Target },
              { number: "02", title: "Shape a realistic rhythm", desc: "Split practice across the parts of the day that actually work for you.", detail: "Built around your availability", icon: Clock3 },
              { number: "03", title: "See the next steps", desc: "Get a clear first week and a longer arc, so you can focus on today's work.", detail: "One useful task at a time", icon: BookOpen },
            ].map(({ number, title, desc, detail, icon: Icon }) => (
              <article key={number} className="group relative min-h-[250px] overflow-hidden rounded-[26px] bg-primary p-6 text-primary-foreground sm:p-8">
                <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full border border-primary-foreground/10 transition-transform duration-500 group-hover:scale-110" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between"><span className="text-xs font-semibold tracking-[0.14em] text-primary-foreground/60">STEP {number}</span><Icon size={20} /></div>
                  <div className="mt-9"><h3 className="text-xl font-semibold tracking-tight">{title}</h3><p className="mt-2 max-w-[350px] text-sm leading-6 text-primary-foreground/75">{desc}</p></div>
                  <div className="mt-auto flex items-center gap-2 pt-7 text-xs font-semibold"><CheckCircle2 size={15} /> {detail}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="daily-practice" className="bg-mint/55">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-12 lg:py-24">
            <div className="max-w-[520px]">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-progress-strong">Progress without the pressure</p>
              <h2 className="font-sans text-4xl font-semibold leading-[1.05] tracking-[-0.06em] sm:text-5xl">Your plan should fit your life. Not the other way around.</h2>
              <p className="mt-5 text-base leading-7 text-muted">Set short sessions for mornings, between classes, evenings, or whenever you have a pocket of focus. The plan meets you there.</p>
              <div className="mt-7 space-y-3">
                {["Free learning resources, picked for the next step", "A steady sequence instead of another open tab", "A daily plan that respects your energy"].map((text) => <p key={text} className="flex items-center gap-2.5 text-sm font-medium"><CheckCircle2 size={17} className="shrink-0 text-progress-strong" />{text}</p>)}
              </div>
            </div>
            <div className="rounded-[28px] border border-border bg-surface p-5 shadow-[0_22px_75px_rgba(38,62,45,0.08)] sm:p-8">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div><span className="text-xs font-bold uppercase tracking-[0.13em] text-muted">A week with a little shape</span><h3 className="mt-1 text-xl font-semibold tracking-tight">Python foundations</h3></div>
                <span className="rounded-pill bg-mint px-3 py-1.5 text-xs font-semibold text-progress-strong">45 min / day</span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-[100px_1fr]">
                <div className="flex items-center gap-2 rounded-xl bg-bg px-3 py-3 text-xs font-semibold text-muted sm:flex-col sm:items-start sm:justify-center"><span className="text-progress-strong">MON</span> 20 min</div>
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-border px-3 py-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-mint text-progress-strong"><BookOpen size={16} /></span><div><p className="text-sm font-semibold">Meet the tools &amp; core ideas</p><p className="mt-0.5 text-xs text-muted">Short lesson · beginner friendly</p></div></div>
                <div className="flex items-center gap-2 rounded-xl bg-bg px-3 py-3 text-xs font-semibold text-muted sm:flex-col sm:items-start sm:justify-center"><span className="text-progress-strong">TUE</span> 25 min</div>
                <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-peach text-streak"><Target size={16} /></span><div><p className="text-sm font-semibold">Try your first guided exercise</p><p className="mt-0.5 text-xs text-muted">Practice turns ideas into instinct</p></div></div>
                <div className="flex items-center gap-2 rounded-xl bg-bg px-3 py-3 text-xs font-semibold text-muted sm:flex-col sm:items-start sm:justify-center"><span className="text-progress-strong">WED</span> 10 min</div>
                <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-mint text-progress-strong"><Check size={16} /></span><div><p className="text-sm font-semibold">Review and connect the dots</p><p className="mt-0.5 text-xs text-muted">A small session still counts</p></div></div>
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-xs leading-5 text-muted"><ShieldCheck size={16} className="shrink-0 text-progress-strong" />Miss a day? Your plan can move with you. No guilt attached.</div>
            </div>
          </div>
        </section>

        <section className="mx-auto flex max-w-[1440px] flex-col items-center px-5 py-20 text-center sm:px-8 lg:px-12 lg:py-28">
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-mint text-progress-strong"><Sparkles size={22} /></span>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-progress-strong">Your next chapter, in small steps</p>
          <h2 className="mt-3 max-w-[720px] font-sans text-4xl font-semibold leading-[1.03] tracking-[-0.06em] sm:text-6xl">Start with the time you have.</h2>
          <p className="mt-5 max-w-[500px] text-base leading-7 text-muted">Set up your first plan in about two minutes. Change the rhythm whenever life changes.</p>
          <button type="button" onClick={startSetup} className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-pill bg-primary px-6 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">Build my learning plan <ArrowRight size={17} /></button>
          <p className="mt-4 text-xs text-muted">Free to start · No account required for this preview</p>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <Link to="/" className="inline-flex items-center gap-2 font-bold tracking-[-0.05em] text-text"><span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-primary-foreground"><Sparkles size={14} /></span>ASTUTO</Link>
          <p>Learn at your pace. Keep your plans human.</p>
          <a href="#approach" className="inline-flex items-center gap-1 font-semibold text-text hover:text-progress-strong">Back to the approach <ArrowUpRight size={13} /></a>
        </div>
      </footer>
    </div>
  );
}
