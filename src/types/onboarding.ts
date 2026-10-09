import type { TimeSlot } from "./index";

export type LearnerLevel = "Starting fresh" | "Know a little" | "Comfortable";
export type PlanDuration = 30 | 60 | 90 | 180;

export interface OnboardingDraft {
  skill: string;
  level: LearnerLevel;
  duration: PlanDuration;
  minutes: Record<TimeSlot, number>;
}

export interface OnboardingRouteState {
  draft?: OnboardingDraft;
  step?: number;
}

export const defaultOnboardingDraft: OnboardingDraft = {
  skill: "",
  level: "Starting fresh",
  duration: 90,
  minutes: {
    morning: 20,
    college: 0,
    evening: 25,
    night: 10,
  },
};

export function isOnboardingDraft(value: unknown): value is OnboardingDraft {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<OnboardingDraft>;
  return (
    typeof candidate.skill === "string" &&
    typeof candidate.level === "string" &&
    typeof candidate.duration === "number" &&
    !!candidate.minutes &&
    ["morning", "college", "evening", "night"].every((slot) => {
      const minutes = candidate.minutes?.[slot as keyof OnboardingDraft["minutes"]];
      return typeof minutes === "number" && Number.isFinite(minutes);
    })
  );
}
