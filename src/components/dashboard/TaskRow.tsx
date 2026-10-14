"use client";

import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { Avatar, PriorityBadge, StatusBadge, formatDate, isOverdue, isOpenTask } from "./ui";
import { moveTask, updateTask } from "@/lib/firestore/tasks";
import { TASK_STATUSES, TASK_STATUS_LABELS, type Task } from "@/lib/firestore/types";
import { useDashboard } from "./DashboardProvider";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "./Toast";

interface TaskRowProps {
  task: Task;
  projectName?: string;
  showProject?: boolean;
  onChanged?: () => void;
}

export function TaskRow({ task, projectName, showProject = true, onChanged }: TaskRowProps) {
  const { workspace, memberProfiles, refresh } = useDashboard();
  const { user } = useAuth();
  const { toast } = useToast();

  const overdue = isOpenTask(task.status) && isOverdue(task);
  const assignee = task.assigneeId ? memberProfiles[task.assigneeId] : null;

  async function handleStatusChange(status: Task["status"]) {
    if (!workspace || !user) return;
    try {
      await updateTask(task.id, workspace.id, user.uid, { status }, task.title);
      await refresh();
      toast("Task updated");
      onChanged?.();
    } catch (err) {
      console.error(err);
      toast("Failed to update task", "error");
    }
  }

  async function handleComplete() {
    if (!workspace || !user) return;
    try {
      await moveTask(task.id, workspace.id, user.uid, "done", task.position, task.title);
      await refresh();
      toast("Task completed");
      onChanged?.();
    } catch (err) {
      console.error(err);
      toast("Failed to complete task", "error");
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-3 border-b px-4 py-3 last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
      <button
        onClick={handleComplete}
        disabled={task.status === "done"}
        className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-60"
        style={{
          borderColor: task.status === "done" ? "var(--color-success)" : "var(--color-border)",
          backgroundColor: task.status === "done" ? "var(--color-success)" : "transparent",
        }}
        aria-label={task.status === "done" ? "Task completed" : `Mark "${task.title}" as complete`}
        title={task.status === "done" ? "Completed" : "Mark complete"}
      >
        {task.status === "done" && (
          <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} aria-hidden>
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <Link href={`/dashboard/projects/${task.projectId}`} className="block truncate text-sm font-medium hover:opacity-70">
          {task.title}
        </Link>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          {showProject && projectName && <span>{projectName}</span>}
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3 w-3" aria-hidden />
            <span style={overdue ? { color: "var(--color-danger)", fontWeight: 600 } : undefined}>
              {formatDate(task.dueDate)}
              {overdue && " · overdue"}
            </span>
          </span>
          {task.assigneeId && (
            <span className="inline-flex items-center gap-1.5">
              <Avatar name={assignee?.displayName ?? null} photoURL={assignee?.photoURL} size={16} />
              {assignee?.displayName ?? assignee?.email ?? "Assigned"}
            </span>
          )}
        </div>
      </div>

      <PriorityBadge priority={task.priority} />
      <StatusBadge status={task.status} />

      <label className="sr-only" htmlFor={`status-${task.id}`}>
        Change status for {task.title}
      </label>
      <select
        id={`status-${task.id}`}
        className="input-field w-32 shrink-0 py-1 text-xs"
        value={task.status}
        onChange={(e) => handleStatusChange(e.target.value as Task["status"])}
      >
        {TASK_STATUSES.map((s) => (
          <option key={s} value={s}>
            {TASK_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
    </li>
  );
}
