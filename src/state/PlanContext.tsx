import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mockPlan } from "../data/mock";
import { getSettings, updateSettings } from "../services/api";
import type { TimeSlot } from "../types";
import type { LearnerLevel, OnboardingDraft, PlanDuration } from "../types/onboarding";

export type ToneId = "gentle" | "funny" | "savage";
export type ReminderId = "daily" | "preSession";
export type ReshuffleMode = "spread" | "extend";

export interface TimeSlotPreference {
  id: TimeSlot;
  label: string;
  detail: string;
  startTime: string;
  minutes: number;
}

const defaultSlots: TimeSlotPreference[] = [
  { id: "morning", label: "Morning", detail: "Theory and concepts", startTime: "7:30 AM", minutes: 30 },
  { id: "college", label: "Between classes", detail: "A short review between classes", startTime: "1:00 PM", minutes: 0 },
  { id: "evening", label: "Evening", detail: "Hands-on practice and coding", startTime: "7:30 PM", minutes: 20 },
  { id: "night", label: "Night", detail: "Flashcards and a quick recap", startTime: "9:30 PM", minutes: 10 },
];

export interface PlanContextValue {
  skill: string;
  setSkill: (skill: string) => void;
  level: LearnerLevel;
  setLevel: (level: LearnerLevel) => void;
  duration: PlanDuration;
  setDuration: (duration: PlanDuration) => void;
  currentDay: number;
  setCurrentDay: (day: number) => void;
  totalDays: number;
  slots: TimeSlotPreference[];
  minutes: Record<TimeSlot, number>;
  totalMinutes: number;
  updateSlotMinutes: (slotId: TimeSlot, minutes: number) => void;
  updateSlotStartTime: (slotId: TimeSlot, startTime: string) => void;
  setAllSlots: (slots: TimeSlotPreference[]) => void;
  tone: ToneId;
  setTone: (tone: ToneId) => void;
  reminders: Record<ReminderId, boolean>;
  toggleReminder: (reminderId: ReminderId) => void;
  reshufflePlan: (mode: ReshuffleMode) => void;
  asDraft: OnboardingDraft;
  applyDraft: (draft: Partial<OnboardingDraft>) => void;
}

// TODO(backend): PlanContext holds local active/draft plan state in React memory.
// In the future, this state will be synced with server persistence via src/services/api.ts.
const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [skill, setSkill] = useState<string>(mockPlan.skillName);
  const [level, setLevel] = useState<LearnerLevel>("Starting fresh");
  const [duration, setDuration] = useState<PlanDuration>(
    (mockPlan.totalDays as PlanDuration) || 90,
  );
  const [currentDay, setCurrentDay] = useState<number>(mockPlan.currentDay);
  const [slots, setSlots] = useState<TimeSlotPreference[]>(defaultSlots);
  const [tone, setTone] = useState<ToneId>("gentle");
  const [reminders, setReminders] = useState<Record<ReminderId, boolean>>({
    daily: true,
    preSession: true,
  });

  // Load preferences from backend on app startup
  useEffect(() => {
    let active = true;
    getSettings()
      .then((saved) => {
        if (!active) return;
        if (saved.tone) setTone(saved.tone);
        if (saved.reminders) setReminders(saved.reminders);
        if (saved.slots && Array.isArray(saved.slots)) {
          setSlots((current) =>
            current.map((c) => {
              const matching = saved.slots?.find((s) => s.id === c.id);
              return matching ? { ...c, minutes: matching.minutes, startTime: matching.startTime || c.startTime } : c;
            }),
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const setToneAndSave = useCallback((newTone: ToneId) => {
    setTone(newTone);
    void updateSettings({ tone: newTone });
  }, []);

  const updateSlotMinutes = useCallback((slotId: TimeSlot, minutes: number) => {
    const clamped = Math.max(0, Math.min(120, minutes));
    setSlots((current) => {
      const updated = current.map((slot) => (slot.id === slotId ? { ...slot, minutes: clamped } : slot));
      void updateSettings({ slots: updated });
      return updated;
    });
  }, []);

  const updateSlotStartTime = useCallback((slotId: TimeSlot, startTime: string) => {
    setSlots((current) => {
      const updated = current.map((slot) => (slot.id === slotId ? { ...slot, startTime } : slot));
      void updateSettings({ slots: updated });
      return updated;
    });
  }, []);

  const setAllSlots = useCallback((newSlots: TimeSlotPreference[]) => {
    setSlots(newSlots);
    void updateSettings({ slots: newSlots });
  }, []);

  const toggleReminder = useCallback((reminderId: ReminderId) => {
    setReminders((current) => {
      const updated = { ...current, [reminderId]: !current[reminderId] };
      void updateSettings({ reminders: updated });
      return updated;
    });
  }, []);

  const reshufflePlan = useCallback((mode: ReshuffleMode) => {
    if (mode === "spread") {
      setSlots((current) =>
        current.map((slot) => {
          if (slot.id === "morning") return { ...slot, minutes: slot.minutes + 5 };
          if (slot.id === "evening") return { ...slot, minutes: slot.minutes + 7 };
          return slot;
        }),
      );
    } else if (mode === "extend") {
      setDuration((prev) => (prev + 2) as PlanDuration);
    }
  }, []);

  const minutes = useMemo<Record<TimeSlot, number>>(() => {
    const map: Record<TimeSlot, number> = {
      morning: 0,
      college: 0,
      evening: 0,
      night: 0,
    };
    for (const slot of slots) {
      map[slot.id] = slot.minutes;
    }
    return map;
  }, [slots]);

  const totalMinutes = useMemo(() => {
    return slots.reduce((sum, slot) => sum + slot.minutes, 0);
  }, [slots]);

  const asDraft = useMemo<OnboardingDraft>(() => {
    return {
      skill,
      level,
      duration,
      minutes,
    };
  }, [skill, level, duration, minutes]);

  const applyDraft = useCallback((draft: Partial<OnboardingDraft>) => {
    if (draft.skill !== undefined) setSkill(draft.skill);
    if (draft.level !== undefined) setLevel(draft.level);
    if (draft.duration !== undefined) setDuration(draft.duration);
    if (draft.minutes !== undefined) {
      const draftMinutes = draft.minutes;
      setSlots((current) =>
        current.map((slot) => ({
          ...slot,
          minutes: draftMinutes[slot.id] !== undefined ? draftMinutes[slot.id] : slot.minutes,
        })),
      );
    }
  }, []);

  const contextValue = useMemo<PlanContextValue>(
    () => ({
      skill,
      setSkill,
      level,
      setLevel,
      duration,
      setDuration,
      currentDay,
      setCurrentDay,
      totalDays: duration,
      slots,
      minutes,
      totalMinutes,
      updateSlotMinutes,
      updateSlotStartTime,
      setAllSlots,
      tone,
      setTone: setToneAndSave,
      reminders,
      toggleReminder,
      reshufflePlan,
      asDraft,
      applyDraft,
    }),
    [
      skill,
      level,
      duration,
      currentDay,
      slots,
      minutes,
      totalMinutes,
      updateSlotMinutes,
      updateSlotStartTime,
      setAllSlots,
      tone,
      setToneAndSave,
      reminders,
      toggleReminder,
      reshufflePlan,
      asDraft,
      applyDraft,
    ],
  );

  return <PlanContext.Provider value={contextValue}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
}
