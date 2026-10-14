"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarClock, Clock, Flag } from "lucide-react";
import { PriorityBadge, StatusBadge, formatDate, isOverdue, relativeTime } from "./ui";
import { activityLabel } from "./NotificationMenu";
import { TASK_PRIORITY_LABELS, OPEN_STATUSES, toDate, type Activity, type Task } from "@/lib/firestore/types";
import { useDashboard } from "./DashboardProvider";

export function UpcomingDeadlines() {
  const { tasks, projects } = useDashboard();

  const deadlines = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate && OPEN_STATUSES.includes(t.status))
      .sort((a, b) => toDate(a.dueDate)!.getTime() - toDate(b.dueDate)!.getTime())
      .slice(0, 8);
  }, [tasks]);

  const projectNames = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);

  if (deadlines.length === 0) {
    return <p className="py-6 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>No upcoming deadlines.</p>;
  }
  return (
    <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
      {deadlines.map((task) => {
        const overdue = isOverdue(task);

        return (
          <li key={task.id} className="flex flex-wrap items-center gap-3 py-2.5 first:pt-0">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: "var(--color-muted)" }}
              aria-hidden
            >
              {overdue ? (
                <Flag className="h-3.5 w-3.5" style={{ color: "var(--color-danger)" }} />
              ) : (
                <Clock className="h-3.5 w-3.5" style={{ color: "var(--color-muted-foreground)" }} />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <Link href={`/dashboard/projects/${task.projectId}`} className="block truncate text-sm font-medium hover:opacity-70">
                {task.title}
              </Link>
              <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                {projectNames.get(task.projectId) ?? "Project"}
              </p>
            </div>

            {/* Overdue is labelled in text, not color alone. */}
            <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: overdue ? "var(--color-danger)" : "var(--color-muted-foreground)" }}>
              <CalendarClock className="h-3 w-3" aria-hidden />
              {formatDate(task.dueDate)}
              {overdue ? " · overdue" : ""}
            </span>

            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </li>
        );
      })}
    </ul>
  );
}

export function ActivityFeed({ items, showAll = false }: { items?: Activity[]; showAll?: boolean }) {
  const { activity, memberProfiles, projects } = useDashboard();
  const rows = items ?? activity;
  const visible = showAll ? rows : rows.slice(0, 10);
  const projectNames = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);

  if (visible.length === 0) {
    return <p className="py-6 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>No activity yet. Actions you take will appear here.</p>;
  }

  return (
    <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
      {visible.map((item) => {
        const actor = memberProfiles[item.actorId];
        const isTask = item.entityType === "task";

        return (
          <li key={item.id} className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-2.5 first:pt-0 text-sm">
            <span className="font-medium">{actor?.displayName ?? actor?.email ?? "Someone"}</span>
            <span style={{ color: "var(--color-muted-foreground)" }}>{activityLabel(item.action)}</span>
            {isTask ? (
              <span className="font-medium">{item.entityName}</span>
            ) : (
              <Link
                href={`/dashboard/projects/${item.entityId}`}
                className="font-medium hover:opacity-70"
                style={{ color: "var(--color-primary)" }}
              >
                {item.entityName}
              </Link>
            )}
            {projectNames.has(item.entityId) && !isTask && (
              <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                {projectNames.get(item.entityId)}
              </span>
            )}
            <span className="ml-auto shrink-0 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              {relativeTime(item.createdAt)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function TaskFilterHint({ tasks }: { tasks: Task[] }) {
  const urgent = tasks.filter((t) => t.priority === "urgent" && OPEN_STATUSES.includes(t.status)).length;
  return (
    <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
      {urgent > 0 ? `${urgent} urgent ${urgent === 1 ? "task" : "tasks"} (${TASK_PRIORITY_LABELS.urgent})` : "No urgent tasks"}
    </p>
  );
}
