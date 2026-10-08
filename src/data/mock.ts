import type { AiReply, Plan, Stats, Task } from "../types";

export const mockPlan: Plan = {
  id: "plan-python-foundations",
  user: {
    id: "user-alex",
    name: "Alex Kumar",
    avatarInitials: "AK",
    skillName: "Python for Data Science",
  },
  skillName: "Python for Data Science",
  currentDay: 14,
  totalDays: 90,
  currentPhase: {
    id: "phase-foundations",
    name: "Phase 1",
    title: "Foundations & Core Logic",
    subtitle: "Build the habits and Python fundamentals that make everything else easier.",
    progress: 65,
    nextUnlock: "Phase 2: Web Scraping & APIs",
    nextUnlockInDays: 7,
  },
  week: {
    label: "This week",
    completedMinutes: 420,
    goalMinutes: 600,
    days: [
      { id: "mon", label: "M", date: "Mon", status: "complete" },
      { id: "tue", label: "T", date: "Tue", status: "complete" },
      { id: "wed", label: "W", date: "Wed", status: "complete" },
      { id: "thu", label: "T", date: "Thu", status: "today" },
      { id: "fri", label: "F", date: "Fri", status: "upcoming" },
      { id: "sat", label: "S", date: "Sat", status: "upcoming" },
      { id: "sun", label: "S", date: "Sun", status: "upcoming" },
    ],
  },
  resources: [
    {
      id: "github-roadmap",
      title: "Python learning roadmap",
      source: "GitHub",
      kind: "GitHub repo",
      url: "https://github.com/",
    },
    {
      id: "video-comprehensions",
      title: "List comprehensions, explained",
      source: "Real Python",
      kind: "YouTube",
      url: "https://www.youtube.com/",
      duration: "12 min",
    },
    {
      id: "article-complexity",
      title: "A quick guide to time complexity",
      source: "Python Morsels",
      kind: "Article",
      url: "https://www.pythonmorsels.com/",
      duration: "8 min",
    },
  ],
};

export const mockTodayTasks: Task[] = [
  {
    id: "variables-refresher",
    title: "Variables & Scope Refresher",
    source: "freeCodeCamp · Python",
    sourceUrl: "https://www.freecodecamp.org/",
    estimatedMinutes: 20,
    slot: "morning",
    timeLabel: "8:15 AM",
    completed: true,
    optional: false,
    tags: ["Global vs local", "Closures"],
  },
  {
    id: "lecture-review",
    title: "Review today's lecture notes",
    source: "Your study notes",
    sourceUrl: "https://www.notion.so/",
    estimatedMinutes: 15,
    slot: "college",
    timeLabel: "1:30 PM",
    completed: false,
    optional: false,
    tags: ["Quick recall"],
  },
  {
    id: "list-comprehensions",
    title: "List Comprehensions & 4 Practice Drills",
    source: "Real Python · Practice",
    sourceUrl: "https://realpython.com/",
    estimatedMinutes: 40,
    slot: "evening",
    timeLabel: "7:30 PM",
    completed: false,
    optional: false,
    tags: ["Matrix flattening", "Filtered key-value maps", "Performance profiling"],
  },
  {
    id: "flashcard-recall",
    title: "Flashcard Recall",
    source: "Anki deck · 15 data structure cards",
    sourceUrl: "https://apps.ankiweb.net/",
    estimatedMinutes: 10,
    slot: "evening",
    timeLabel: "After practice",
    completed: false,
    optional: true,
    tags: ["Optional"],
  },
  {
    id: "daily-review",
    title: "Write one takeaway from today",
    source: "Daily reflection",
    sourceUrl: "https://www.notion.so/",
    estimatedMinutes: 5,
    slot: "night",
    timeLabel: "Before bed",
    completed: false,
    optional: true,
    tags: ["Reflection"],
  },
];

export const mockStats: Stats = {
  streak: {
    currentDays: 14,
    personalBest: 18,
    weeklyTargetDays: 7,
    completedDays: 5,
    freezeCount: 2,
    topPercent: 4,
  },
  predictedMastery: 94,
  dailyRetention: [32, 41, 52, 48, 59, 72, 94],
  weeklyMinutes: 420,
  weeklyGoalMinutes: 600,
  milestoneTitle: "CLIBudget Engine",
  milestoneProgress: 65,
};

export const mockAiReplies: Record<string, string> = {
  reschedule:
    "I can help make today lighter. Move the 40-minute practice to tomorrow evening, and keep the 15-minute lecture review for today?",
  pause:
    "A short pause is okay. Your plan stays here; when you return, we can shift the next few sessions without losing your progress.",
  swap:
    "Try the 12-minute walkthrough from Real Python instead of the longer reading. You can keep the same practice drills afterward.",
  default:
    "Let’s make your next step manageable. You have one focused practice session planned for today; I can help you adjust it around your schedule.",
};

export function createMockAiReply(message: string): AiReply {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("reschedule")) {
    return { reply: mockAiReplies.reschedule };
  }
  if (normalizedMessage.includes("pause")) {
    return { reply: mockAiReplies.pause };
  }
  if (normalizedMessage.includes("swap") || normalizedMessage.includes("resource")) {
    return { reply: mockAiReplies.swap };
  }
  return { reply: mockAiReplies.default };
}
