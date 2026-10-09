import { createMockAiReply, mockPlan, mockStats, mockTodayTasks } from "../data/mock";
import type { AiReply, Plan, Stats, Task } from "../types";

// TODO(backend): PlanContext local state currently manages active client plan state; replace mock data access here with real API endpoints and server persistence.
// TODO(backend): replace with real API call
export async function getPlan(): Promise<Plan> {
  return structuredClone(mockPlan);
}

// TODO(backend): replace with real API call
export async function getTodayTasks(): Promise<Task[]> {
  return structuredClone(mockTodayTasks);
}

// TODO(backend): replace with real API call
export async function completeTask(id: string): Promise<Task> {
  const task = mockTodayTasks.find((item) => item.id === id);
  if (!task) {
    throw new Error(`Task "${id}" was not found.`);
  }
  return { ...task, completed: true };
}

// TODO(backend): replace with real API call
export async function getStats(): Promise<Stats> {
  return structuredClone(mockStats);
}

// TODO(backend): replace with real API call
export async function sendAiMessage(text: string): Promise<AiReply> {
  return createMockAiReply(text);
}
