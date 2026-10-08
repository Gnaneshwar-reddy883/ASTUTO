export type TimeSlot = "morning" | "college" | "evening" | "night";

export interface User {
  id: string;
  name: string;
  avatarInitials: string;
  skillName: string;
}

export interface Resource {
  id: string;
  title: string;
  source: string;
  kind: "GitHub repo" | "YouTube" | "Article";
  url: string;
  duration?: string;
}

export interface Phase {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  progress: number;
  nextUnlock: string;
  nextUnlockInDays: number;
}

export interface RoadmapWeek {
  label: string;
  taskCount: number;
}

export interface RoadmapMonth {
  title: string;
  weeks: RoadmapWeek[];
}

export interface RoadmapPhase {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  status: "completed" | "current" | "upcoming" | "goal";
  progress?: number;
  months: RoadmapMonth[];
  milestoneAfter?: string;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface RoadmapStats {
  hoursLearned: number;
  swot: SwotAnalysis;
  motivation: number;
  skillLevel: {
    label: string;
    progress: number;
    nextLevel: string;
  };
}

export interface Day {
  id: string;
  label: string;
  date: string;
  status: "complete" | "today" | "upcoming";
}

export interface Week {
  label: string;
  completedMinutes: number;
  goalMinutes: number;
  days: Day[];
}

export interface Plan {
  id: string;
  user: User;
  skillName: string;
  currentDay: number;
  totalDays: number;
  currentPhase: Phase;
  roadmap: RoadmapPhase[];
  week: Week;
  resources: Resource[];
}

export interface Task {
  id: string;
  title: string;
  source: string;
  sourceUrl: string;
  estimatedMinutes: number;
  slot: TimeSlot;
  timeLabel: string;
  completed: boolean;
  optional: boolean;
  tags: string[];
}

export interface Streak {
  currentDays: number;
  personalBest: number;
  weeklyTargetDays: number;
  completedDays: number;
  freezeCount: number;
  topPercent: number;
}

export interface Stats {
  streak: Streak;
  predictedMastery: number;
  dailyRetention: number[];
  weeklyMinutes: number;
  weeklyGoalMinutes: number;
  milestoneTitle: string;
  milestoneProgress: number;
  roadmap: RoadmapStats;
}

export interface AiReply {
  reply: string;
}
