// Purpose: let learners adjust their plan view, daily study slots, reminders, and coach tone.
// Components used: SettingsPlanCard, TimeSlotEditor, SettingSwitch, and CoachToneCard (page-local UI components).
// API functions called: none; all edits use React local state. Real data needed: a persisted learning-plan summary and saved preferences.
import {
  Bell,
  BookOpen,
  Check,
  Clock3,
  Code2,
  GraduationCap,
  Heart,
  Moon,
  Smile,
  Sunrise,
  Zap,
} from "lucide-react";
import { usePlan, type TimeSlotPreference, type ToneId } from "../state/PlanContext";
import type { TimeSlot } from "../types";

const slotIcons = {
  morning: Sunrise,
  college: GraduationCap,
  evening: Code2,
  night: Moon,
};

const toneOptions = [
  {
    id: "gentle" as ToneId,
    title: "Gentle",
    descriptor: "Encouraging and patient",
    detail: "A calm reminder that makes room for real life.",
    sample: "Your morning practice is coming up. Even a small start counts toward your goal.",
    Icon: Heart,
  },
  {
    id: "funny" as ToneId,
    title: "Funny",
    descriptor: "Playful and relatable",
    detail: "A light nudge to help you reset and get started.",
    sample: "Your Python lesson is waiting. It promises fewer autoplay videos than that open tab.",
    Icon: Smile,
  },
  {
    id: "savage" as ToneId,
    title: "Savage",
    descriptor: "Direct and focused",
    detail: "Straight to the next action, without the extra pep talk.",
    sample: "Open the editor. Give the next 20 minutes to the problem in front of you.",
    Icon: Zap,
  },
] as const;

const settingsRangeStyles = `
  .settings-time-range {
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    height: 16px;
  }
  .settings-time-range::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 9999px;
    background: var(--color-progress);
  }
  .settings-time-range::-moz-range-track {
    height: 6px;
    border-radius: 9999px;
    background: var(--color-progress);
  }
  .settings-time-range::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    margin-top: -5px;
    border: 2px solid var(--color-surface);
    border-radius: 9999px;
    background: var(--color-progress-strong);
  }
  .settings-time-range::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border: 2px solid var(--color-surface);
    border-radius: 9999px;
    background: var(--color-progress-strong);
  }
`;

type SettingsPlanCardProps = {
  skill: string;
  duration: number;
  currentDay: number;
  dailyMinutes: number;
};

function SettingsPlanCard({ skill, duration, currentDay, dailyMinutes }: SettingsPlanCardProps) {
  const planProgress = Math.round((currentDay / duration) * 100);

  return (
    <section aria-labelledby="plan-heading" className="overflow-hidden rounded-card border border-border bg-surface">
      <div className="grid md:grid-cols-[minmax(0,1.25fr)_minmax(250px,0.75fr)]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              <BookOpen aria-hidden="true" className="h-4 w-4 text-progress-strong" />
              Your active plan
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-progress px-3 py-1.5 text-xs font-semibold text-progress-strong">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-progress-strong" />
              Active
            </span>
          </div>
          <h2 id="plan-heading" className="mt-4 font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
            {skill}
          </h2>
          <p className="mt-1 text-sm text-muted">A {duration}-day plan paced around your daily routine.</p>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <p className="text-sm font-medium text-text">
              Day {currentDay} <span className="font-normal text-muted">of {duration}</span>
            </p>
            <p className="text-xs text-muted">{dailyMinutes} min planned each day</p>
          </div>
          <div
            aria-label="Learning plan progress"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={planProgress}
            className="mt-2 h-2 overflow-hidden rounded-pill bg-bg"
            role="progressbar"
          >
            <div className="h-full rounded-pill bg-progress-strong" style={{ width: `${planProgress}%` }} />
          </div>
        </div>

        <div className="border-t border-border bg-mint p-5 md:border-l md:border-t-0 sm:p-7">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
            <Clock3 aria-hidden="true" className="h-4 w-4 text-progress-strong" />
            Next milestone
          </div>
          <p className="mt-4 font-sans text-lg font-semibold leading-snug text-text">
            Web Scraping &amp; APIs
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Your next phase opens in 7 days. Keep the rhythm that works for you.
          </p>
        </div>
      </div>
    </section>
  );
}

type TimeSlotEditorProps = {
  slots: TimeSlotPreference[];
  onChange: (slotId: TimeSlot, minutes: number) => void;
};

function TimeSlotEditor({ slots, onChange }: TimeSlotEditorProps) {
  const totalMinutes = slots.reduce((sum, slot) => sum + slot.minutes, 0);

  return (
    <section aria-labelledby="slots-heading" className="rounded-card border border-border bg-surface p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Make it fit your day</p>
          <h2 id="slots-heading" className="mt-2 font-sans text-xl font-semibold tracking-tight sm:text-2xl">
            Daily time slots
          </h2>
          <p className="mt-1 text-sm text-muted">Set the minutes you want to leave for each part of your day.</p>
        </div>
        <div className="rounded-xl bg-mint px-3 py-2 text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Daily total</p>
          <p className="mt-0.5 text-lg font-semibold leading-none text-text">{totalMinutes} <span className="text-xs font-medium text-muted">min</span></p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-border">
        {slots.map((slot) => {
          const Icon = slotIcons[slot.id];
          const isOff = slot.minutes === 0;

          return (
            <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[2.75rem_minmax(0,1fr)_auto]" key={slot.id}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg text-muted">
                <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="text-sm font-semibold text-text">{slot.label}</h3>
                  <span className="text-[11px] text-muted">Starts around {slot.startTime}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{slot.detail}</p>
              </div>
              <p className={`min-w-[4.25rem] text-right text-sm font-semibold ${isOff ? "text-muted" : "text-text"}`}>
                {isOff ? "Off" : `${slot.minutes} min`}
              </p>
              <label className="sr-only" htmlFor={`slot-${slot.id}`}>
                {slot.label} minutes
              </label>
              <input
                aria-valuetext={isOff ? "Off" : `${slot.minutes} minutes`}
                className="settings-time-range col-span-3 h-4 w-full cursor-pointer sm:col-start-2 sm:col-span-2"
                id={`slot-${slot.id}`}
                max={90}
                min={0}
                onChange={(event) => onChange(slot.id, event.currentTarget.valueAsNumber)}
                step={5}
                type="range"
                value={slot.minutes}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

type SettingSwitchProps = {
  checked: boolean;
  description: string;
  label: string;
  onChange: () => void;
};

function SettingSwitch({ checked, description, label, onChange }: SettingSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">{description}</p>
      </div>
      <button
        aria-checked={checked}
        aria-label={label}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-pill transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-progress-strong ${checked ? "bg-progress-strong" : "bg-border"}`}
        onClick={onChange}
        role="switch"
        type="button"
      >
        <span className={`h-5 w-5 rounded-full bg-surface shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

type CoachToneCardProps = {
  selectedTone: ToneId;
  onSelect: (tone: ToneId) => void;
};

function CoachToneCard({ selectedTone, onSelect }: CoachToneCardProps) {
  return (
    <fieldset className="mt-5">
      <legend className="sr-only">Choose a coach notification tone</legend>
      <div className="grid gap-3 md:grid-cols-3">
        {toneOptions.map(({ id, title, descriptor, detail, sample, Icon }) => {
          const selected = selectedTone === id;
          const sampleId = `sample-${id}`;

          return (
            <label
              className={`relative flex min-w-0 cursor-pointer flex-col rounded-card border p-4 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-progress-strong sm:p-5 ${selected ? "border-progress-strong bg-progress/40" : "border-border bg-surface hover:border-muted"}`}
              key={id}
            >
              <input
                checked={selected}
                className="sr-only"
                name="coach-tone"
                onChange={() => onSelect(id)}
                type="radio"
                value={id}
              />
              <span className="flex items-start justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-mint text-progress-strong" : "bg-bg text-muted"}`}>
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-text">{title}</span>
                    <span className="mt-0.5 block text-xs text-muted">{descriptor}</span>
                  </span>
                </span>
                <span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-progress-strong bg-progress-strong text-surface" : "border-border bg-surface text-transparent"}`}>
                  {selected && <Check aria-hidden="true" className="h-3.5 w-3.5" />}
                </span>
              </span>

              <p className="mt-4 min-h-[2.5rem] text-xs leading-relaxed text-muted">{detail}</p>
              <div aria-describedby={sampleId} className="mt-4 rounded-xl border border-border bg-bg p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Sample notification</p>
                <p className="mt-2 text-sm leading-relaxed text-text" id={sampleId}>
                  “{sample}”
                </p>
              </div>
              <span className={`mt-4 text-xs font-semibold ${selected ? "text-progress-strong" : "text-muted"}`}>
                {selected ? "Selected" : "Choose this tone"}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SettingsPage() {
  const {
    skill,
    duration,
    currentDay,
    slots,
    totalMinutes,
    updateSlotMinutes,
    tone,
    setTone,
    reminders,
    toggleReminder,
  } = usePlan();

  return (
    <main className="min-h-[100dvh] bg-bg px-4 pb-20 pt-8 text-text sm:px-6 sm:pt-10 lg:px-10">
      <style>{settingsRangeStyles}</style>
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Your preferences</p>
            <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight sm:text-4xl">Settings &amp; preferences</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Make your learning routine feel like it fits you.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-pill border border-[#c4e6d2] bg-mint px-3 py-2 text-xs font-semibold text-[#2a6847]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-progress-strong animate-pulse" />
            Saved to SQLite
          </div>
        </header>

        <SettingsPlanCard
          skill={skill}
          duration={duration}
          currentDay={currentDay}
          dailyMinutes={totalMinutes}
        />

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
          <TimeSlotEditor slots={slots} onChange={updateSlotMinutes} />

          <section aria-labelledby="reminders-heading" className="rounded-card border border-border bg-surface p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lavender text-muted">
                <Bell aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Gentle nudges</p>
                <h2 id="reminders-heading" className="mt-1 font-sans text-xl font-semibold tracking-tight sm:text-2xl">
                  Reminders
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">Choose when ASTUTO should give you a heads-up.</p>
              </div>
            </div>
            <div className="mt-4 divide-y divide-border">
              <SettingSwitch
                checked={reminders.daily}
                description="A nudge when one of your study slots is about to begin."
                label="Daily session reminders"
                onChange={() => toggleReminder("daily")}
              />
              <SettingSwitch
                checked={reminders.preSession}
                description="A 10-minute warning so you can get your materials ready."
                label="Pre-session alert"
                onChange={() => toggleReminder("preSession")}
              />
            </div>
            <p className="mt-3 rounded-xl bg-bg p-3.5 text-xs leading-relaxed text-muted">
              Reminders follow the times in your daily slots. You can switch either one off whenever you need a quieter day.
            </p>
          </section>
        </div>

        <section aria-labelledby="tone-heading" className="mt-4 rounded-card border border-border bg-surface p-5 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">A voice that works for you</p>
              <h2 id="tone-heading" className="mt-2 font-sans text-xl font-semibold tracking-tight sm:text-2xl">
                Motivational nudge tone
              </h2>
              <p className="mt-1 text-sm text-muted">Choose how your practice reminders sound. You can change it any time.</p>
            </div>
            <span className="rounded-pill bg-lavender px-3 py-1.5 text-xs font-medium text-muted">
              {toneOptions.find((toneItem) => toneItem.id === tone)?.title} tone selected
            </span>
          </div>
          <CoachToneCard selectedTone={tone} onSelect={setTone} />
          <p aria-live="polite" className="sr-only">
            {toneOptions.find((toneItem) => toneItem.id === tone)?.title} tone selected. Changes are local to this session.
          </p>
        </section>

        <p className="mt-5 text-center text-xs text-muted">
          Changes are kept in this page session only. Nothing is saved or sent.
        </p>
      </div>
    </main>
  );
}
