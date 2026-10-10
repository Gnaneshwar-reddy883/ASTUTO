import { useEffect, useState } from "react";
import { createMockAiReply, mockPlan, mockStats, mockTodayTasks } from "../data/mock";
import type { AiReply, Plan, Stats, Task } from "../types";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8000";

let isBackendOfflineState = false;
const offlineListeners = new Set<(offline: boolean) => void>();

export function getIsBackendOffline(): boolean {
  return isBackendOfflineState;
}

export function setBackendOffline(offline: boolean) {
  if (isBackendOfflineState !== offline) {
    isBackendOfflineState = offline;
    offlineListeners.forEach((listener) => listener(offline));
  }
}

export function useBackendOffline(): boolean {
  const [offline, setOffline] = useState(isBackendOfflineState);

  useEffect(() => {
    const handleChange = (status: boolean) => setOffline(status);
    offlineListeners.add(handleChange);
    return () => {
      offlineListeners.delete(handleChange);
    };
  }, []);

  return offline;
}

let offlineTasks: Task[] = structuredClone(mockTodayTasks);

const defaultMockSettings: UserSettings = {
  tone: "gentle",
  reminders: {
    daily: true,
    preSession: true,
  },
  slots: [
    { id: "morning", label: "Morning", minutes: 20, startTime: "8:15 AM" },
    { id: "college", label: "College", minutes: 15, startTime: "1:30 PM" },
    { id: "evening", label: "Evening", minutes: 45, startTime: "7:30 PM" },
    { id: "night", label: "Night", minutes: 10, startTime: "10:30 PM" },
  ],
};

let offlineSettings: UserSettings = structuredClone(defaultMockSettings);

// TODO(backend): replace with real API call
export async function checkBackendHealth(): Promise<{ status: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setBackendOffline(false);
    return data;
  } catch {
    setBackendOffline(true);
    // TODO(backend): fallback to mock health status when backend is unreachable
    return { status: "offline" };
  }
}

// TODO(backend): replace with real API call
export async function getPlan(): Promise<Plan> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/plan`);
    if (!response.ok) {
      throw new Error(`Failed to fetch learning plan: ${response.status}`);
    }
    const data = await response.json();
    setBackendOffline(false);
    return data;
  } catch {
    setBackendOffline(true);
    // TODO(backend): fallback to mock data when backend is unreachable
    return structuredClone(mockPlan);
  }
}

// TODO(backend): replace with real API call
export async function getTodayTasks(): Promise<Task[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/plan/today/tasks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.status}`);
    }
    const data = await response.json();
    setBackendOffline(false);
    return data;
  } catch {
    setBackendOffline(true);
    // TODO(backend): fallback to mock data when backend is unreachable
    return structuredClone(offlineTasks);
  }
}

// TODO(backend): replace with real API call
export async function completeTask(id: string): Promise<Task> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/complete`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Failed to complete task: ${response.status}`);
    }
    const data = await response.json();
    setBackendOffline(false);
    return data;
  } catch {
    setBackendOffline(true);
    // TODO(backend): fallback to mock data when backend is unreachable
    const task = offlineTasks.find((item) => item.id === id);
    if (!task) {
      const fallbackTask: Task = {
        id,
        title: "Task",
        source: "Personal Practice",
        sourceUrl: "https://python.org",
        estimatedMinutes: 15,
        slot: "evening",
        timeLabel: "Flexible",
        completed: true,
        optional: false,
        tags: [],
      };
      offlineTasks.push(fallbackTask);
      return fallbackTask;
    }
    task.completed = true;
    return { ...task };
  }
}

// TODO(backend): replace with real API call
export async function toggleTaskApi(id: string): Promise<Task> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}/toggle`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Failed to toggle task: ${response.status}`);
    }
    const data = await response.json();
    setBackendOffline(false);
    return data;
  } catch {
    setBackendOffline(true);
    // TODO(backend): fallback to mock data when backend is unreachable
    const task = offlineTasks.find((item) => item.id === id);
    if (!task) {
      const fallbackTask: Task = {
        id,
        title: "Task",
        source: "Personal Practice",
        sourceUrl: "https://python.org",
        estimatedMinutes: 15,
        slot: "evening",
        timeLabel: "Flexible",
        completed: false,
        optional: false,
        tags: [],
      };
      offlineTasks.push(fallbackTask);
      return fallbackTask;
    }
    task.completed = !task.completed;
    return { ...task };
  }
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

// TODO(backend): replace with real API call
export async function createTask(input: CreateTaskInput): Promise<Task> {
  try {
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
    const data = await response.json();
    setBackendOffline(false);
    return data;
  } catch {
    setBackendOffline(true);
    // TODO(backend): fallback to mock data when backend is unreachable
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: input.title,
      source: input.source ?? "Personal Practice",
      sourceUrl: input.sourceUrl ?? "https://python.org",
      estimatedMinutes: input.estimatedMinutes ?? 15,
      slot: input.slot ?? "evening",
      timeLabel: input.timeLabel ?? "Flexible",
      completed: false,
      optional: false,
      tags: input.tags ?? ["Custom"],
    };
    offlineTasks.push(newTask);
    return newTask;
  }
}

// TODO(backend): replace with real API call
export async function getStats(): Promise<Stats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.status}`);
    }
    const data = await response.json();
    setBackendOffline(false);
    return data;
  } catch {
    setBackendOffline(true);
    // TODO(backend): fallback to mock data when backend is unreachable
    return structuredClone(mockStats);
  }
}

// TODO(backend): replace with real API call
export async function sendAiMessage(text: string): Promise<AiReply> {
  try {
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
    const data = await response.json();
    setBackendOffline(false);
    return data;
  } catch {
    setBackendOffline(true);
    // TODO(backend): fallback to mock data when backend is unreachable
    return createMockAiReply(text);
  }
}

export interface ReshuffleResponse {
  success: boolean;
  mode: string;
  freezesUsed: number;
  remainingFreezes: number;
  totalDays: number;
}

// TODO(backend): replace with real API call
export async function reshufflePlanApi(
  mode: "spread" | "extend",
  useFreezes: boolean,
): Promise<ReshuffleResponse> {
  try {
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
    const data = await response.json();
    setBackendOffline(false);
    return data;
  } catch {
    setBackendOffline(true);
    // TODO(backend): fallback to mock data when backend is unreachable
    return {
      success: true,
      mode,
      freezesUsed: useFreezes ? 2 : 0,
      remainingFreezes: 0,
      totalDays: mode === "extend" ? 92 : 90,
    };
  }
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

// TODO(backend): replace with real API call
export async function getSettings(): Promise<UserSettings> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/settings`);
    if (!response.ok) {
      throw new Error(`Failed to fetch settings: ${response.status}`);
    }
    const data = await response.json();
    setBackendOffline(false);
    return data;
  } catch {
    setBackendOffline(true);
    // TODO(backend): fallback to mock data when backend is unreachable
    return structuredClone(offlineSettings);
  }
}

// TODO(backend): replace with real API call
export async function updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  try {
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
    const data = await response.json();
    setBackendOffline(false);
    return data;
  } catch {
    setBackendOffline(true);
    // TODO(backend): fallback to mock data when backend is unreachable
    offlineSettings = {
      ...offlineSettings,
      ...settings,
      reminders: {
        ...offlineSettings.reminders,
        ...(settings.reminders || {}),
      },
    };
    return structuredClone(offlineSettings);
  }
}
