import type { AiReply, Plan, ProgressActivityDay, Stats, Task } from "../types";

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
  roadmap: [
    {
      id: "plan-setup",
      name: "Getting started",
      title: "Learning setup",
      subtitle: "Your goal and weekly rhythm are in place.",
      status: "completed",
      months: [
        {
          title: "Getting started",
          weeks: [{ label: "Week 1", taskCount: 4 }],
        },
      ],
      milestoneAfter: "First script written",
    },
    {
      id: "phase-foundations",
      name: "Phase 1",
      title: "Foundations & Core Logic",
      subtitle: "Build strong Python habits and core problem-solving skills.",
      status: "current",
      progress: 65,
      months: [
        {
          title: "Month 1: Basics",
          weeks: [
            { label: "Week 1", taskCount: 5 },
            { label: "Week 2", taskCount: 6 },
            { label: "Week 3", taskCount: 5 },
            { label: "Week 4", taskCount: 4 },
          ],
        },
        {
          title: "Month 2: Core logic",
          weeks: [
            { label: "Week 5", taskCount: 5 },
            { label: "Week 6", taskCount: 6 },
            { label: "Week 7", taskCount: 4 },
          ],
        },
      ],
      milestoneAfter: "Foundations complete",
    },
    {
      id: "phase-apis",
      name: "Phase 2",
      title: "Web Scraping & APIs",
      subtitle: "Collect real information and work with useful data sources.",
      status: "upcoming",
      months: [
        {
          title: "Month 3: Data collection",
          weeks: [
            { label: "Week 8", taskCount: 5 },
            { label: "Week 9", taskCount: 5 },
            { label: "Week 10", taskCount: 4 },
          ],
        },
      ],
      milestoneAfter: "First API project",
    },
    {
      id: "phase-analysis",
      name: "Phase 3",
      title: "Data Analysis & Visualization",
      subtitle: "Turn raw datasets into clear, useful insights.",
      status: "upcoming",
      months: [
        {
          title: "Month 4: Find the story",
          weeks: [
            { label: "Week 11", taskCount: 5 },
            { label: "Week 12", taskCount: 6 },
            { label: "Week 13", taskCount: 4 },
          ],
        },
      ],
      milestoneAfter: "Insights shared",
    },
    {
      id: "phase-portfolio",
      name: "Phase 4",
      title: "Portfolio Projects",
      subtitle: "Bring your skills together in practical work you can show.",
      status: "upcoming",
      months: [
        {
          title: "Month 5: Build and share",
          weeks: [
            { label: "Week 14", taskCount: 4 },
            { label: "Week 15", taskCount: 5 },
            { label: "Week 16", taskCount: 3 },
          ],
        },
      ],
      milestoneAfter: "Portfolio ready",
    },
    {
      id: "goal-independent",
      name: "Your goal",
      title: "Independent Python learner",
      subtitle: "Keep building, exploring, and solving real problems.",
      status: "goal",
      months: [],
    },
  ],
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

const activityMinutesPattern = [0, 30, 45, 0, 20, 50, 0, 35, 25, 60, 15, 0, 40, 55];
const recentStreakMinutes = [20, 35, 30, 50, 25, 45, 60, 30, 40, 25, 55, 35, 45, 30];
const mockProgressActivity: ProgressActivityDay[] = Array.from({ length: 91 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 6, 13 + index)).toISOString().slice(0, 10);
  const isToday = date === "2026-10-08";
  const minutes = index > 87
    ? 0
    : index >= 74
      ? (isToday ? 35 : recentStreakMinutes[index - 74])
      : activityMinutesPattern[index % activityMinutesPattern.length];

  return { date, minutes, isToday };
});

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
  roadmap: {
    hoursLearned: 34,
    swot: {
      strengths: ["Consistent 14-day streak", "Strong pattern spotting"],
      weaknesses: ["More debugging practice", "Reviewing before rushing"],
      opportunities: ["Build small data projects", "Practice with real APIs"],
      threats: ["Busy college weeks", "Long sessions crowding evenings"],
    },
    motivation: 78,
    skillLevel: {
      label: "Curious learner",
      progress: 42,
      nextLevel: "Confident builder",
    },
  },
  learningProgress: {
    tasksCompleted: 28,
    taskGoal: 180,
    activity: mockProgressActivity,
    badges: [
      {
        id: "first-spark",
        title: "First Spark",
        description: "Completed the first focused learning session.",
        icon: "sparkles",
        status: "earned",
        unlockedLabel: "Day 1",
      },
      {
        id: "fortnight-warrior",
        title: "Fortnight Warrior",
        description: "Kept a 14-day learning streak going.",
        icon: "flame",
        status: "earned",
        unlockedLabel: "Today",
      },
      {
        id: "syntax-sorcerer",
        title: "Syntax Sorcerer",
        description: "Practiced Python syntax across the first week.",
        icon: "code",
        status: "earned",
        unlockedLabel: "Week 1",
      },
      {
        id: "cli-master",
        title: "CLI Master",
        description: "Create five useful command-line scripts.",
        icon: "terminal",
        status: "in-progress",
        progress: 3,
        target: 5,
      },
      {
        id: "thirty-day-rhythm",
        title: "30-Day Rhythm",
        description: "Maintain a steady practice habit for 30 days.",
        icon: "calendar",
        status: "in-progress",
        progress: 14,
        target: 30,
      },
      {
        id: "halfway-mark",
        title: "Halfway Mark",
        description: "Reach the midpoint of the 90-day learning plan.",
        icon: "target",
        status: "upcoming",
        progress: 14,
        target: 45,
      },
      {
        id: "ninety-day-finish",
        title: "90-Day Finisher",
        description: "Complete the full learning plan and project work.",
        icon: "trophy",
        status: "upcoming",
        progress: 14,
        target: 90,
      },
    ],
    shareQuote: "Day 14 in the books. One small practice at a time.",
  },
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
