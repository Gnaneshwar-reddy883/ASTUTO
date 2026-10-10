import type { AiReply, Plan, Stats, Task } from "../types";

export const API_BASE_URL = "http://localhost:8000";

export async function checkBackendHealth(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function getPlan(): Promise<Plan> {
  const response = await fetch(`${API_BASE_URL}/api/plan`);
  if (!response.ok) {
    throw new Error(`Failed to fetch learning plan: ${response.status}`);
  }
  return response.json();
}

export async function getTodayTasks(): Promise<Task[]> {
  const response = await fetch(`${API_BASE_URL}/api/plan/today/tasks`);
  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.status}`);
  }
  return response.json();
}

export async function completeTask(id: string): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/complete`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Failed to complete task: ${response.status}`);
  }
  return response.json();
}

export interface CreateTaskInput {
  title: string;
  estimatedMinutes?: number;
  slot?: "morning" | "college" | "evening" | "night";
  source?: string;
  sourceUrl?: string;
  timeLabel?: string;
  tags?: string[];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: input.title,
      estimated_minutes: input.estimatedMinutes ?? 15,
      slot: input.slot ?? "evening",
      source: input.source ?? "Personal Practice",
      source_url: input.sourceUrl ?? "https://python.org",
      time_label: input.timeLabel ?? "Flexible",
      tags: input.tags ?? ["Custom"],
    }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create task: ${response.status}`);
  }
  return response.json();
}

export async function getStats(): Promise<Stats> {
  const response = await fetch(`${API_BASE_URL}/api/stats`);
  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.status}`);
  }
  return response.json();
}

export async function sendAiMessage(text: string): Promise<AiReply> {
  const response = await fetch(`${API_BASE_URL}/api/ai/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: text }),
  });
  if (!response.ok) {
    throw new Error(`Failed to send AI message: ${response.status}`);
  }
  return response.json();
}

export interface ReshuffleResponse {
  success: boolean;
  mode: string;
  freezesUsed: number;
  remainingFreezes: number;
  totalDays: number;
}

export async function reshufflePlanApi(
  mode: "spread" | "extend",
  useFreezes: boolean,
): Promise<ReshuffleResponse> {
  const response = await fetch(`${API_BASE_URL}/api/plan/reshuffle`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mode, use_freezes: useFreezes }),
  });
  if (!response.ok) {
    throw new Error(`Failed to reshuffle plan: ${response.status}`);
  }
  return response.json();
}

export interface UserSettings {
  tone: "gentle" | "funny" | "savage";
  reminders: {
    daily: boolean;
    preSession: boolean;
  };
  slots?: {
    id: "morning" | "college" | "evening" | "night";
    label: string;
    minutes: number;
    startTime: string;
  }[];
}

export async function getSettings(): Promise<UserSettings> {
  const response = await fetch(`${API_BASE_URL}/api/settings`);
  if (!response.ok) {
    throw new Error(`Failed to fetch settings: ${response.status}`);
  }
  return response.json();
}

export async function updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const response = await fetch(`${API_BASE_URL}/api/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error(`Failed to update settings: ${response.status}`);
  }
  return response.json();
}
