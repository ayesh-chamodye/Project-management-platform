import type { Timestamp } from "firebase/firestore";

export type WorkspaceRole = "owner" | "admin" | "member";
export type ProjectStatus = "active" | "completed" | "archived";
export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  memberIds: string[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt?: Timestamp | null;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate?: Timestamp | null;
  dueDate?: Timestamp | null;
  ownerId: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate?: Timestamp | null;
  position: number;
  createdBy: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
  completedAt?: Timestamp | null;
}

export interface Activity {
  id: string;
  workspaceId: string;
  actorId: string;
  action: string;
  entityType: "project" | "task" | "member";
  entityId: string;
  entityName: string;
  createdAt?: Timestamp | null;
}

export const TASK_STATUSES: TaskStatus[] = ["backlog", "todo", "in_progress", "in_review", "done"];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const OPEN_STATUSES: TaskStatus[] = ["backlog", "todo", "in_progress", "in_review"];

export function toDate(value?: Timestamp | null): Date | null {
  return value ? value.toDate() : null;
}
