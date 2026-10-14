"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addMonths, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { PageHeader, PriorityBadge, StatusBadge, formatDate, isOpenTask, isOverdue } from "@/components/dashboard/ui";
import { OPEN_STATUSES, toDate } from "@/lib/firestore/types";
import { useDashboard } from "@/components/dashboard/DashboardProvider";

export default function CalendarPage() {
  const { tasks, projects } = useDashboard();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));

  const projectNames = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);

  const days = useMemo(() => {
    const start = startOfWeek(month, { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    const rows: Date[] = [];
    let cursor = start;
    while (cursor <= end) {
      rows.push(cursor);
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    }
    return rows;
  }, [month]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, typeof tasks>();
    for (const task of tasks) {
      const due = toDate(task.dueDate);
      if (!due) continue;
      const key = format(due, "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), task]);
    }
    return map;
  }, [tasks]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calendar"
        description="Tasks by due date. Overdue tasks are labelled in text."
        actions={
          <div className="flex items-center gap-1">
            <button onClick={() => setMonth((m) => addMonths(m, -1))} className="btn-secondary px-2 py-1.5" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-32 text-center text-sm font-semibold">{format(month, "MMMM yyyy")}</span>
            <button onClick={() => setMonth((m) => addMonths(m, 1))} className="btn-secondary px-2 py-1.5" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
            <button onClick={() => setMonth(startOfMonth(new Date()))} className="btn-secondary ml-1 text-xs">
              Today
            </button>
          </div>
        }
      />

      <div className="surface overflow-hidden rounded-xl" style={{ borderColor: "var(--color-border)" }}>
        <div className="grid grid-cols-7 border-b text-xs font-semibold uppercase tracking-wide" style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="px-2 py-2 text-center">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDay.get(key) ?? [];
            const muted = !isSameMonth(day, month);
            const today = isSameDay(day, new Date());

            return (
              <div
                key={key}
                className="min-h-24 border-b border-r p-2 last:border-r-0"
                style={{ borderColor: "var(--color-border)", opacity: muted ? 0.45 : 1 }}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium"
                    style={today ? { backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" } : undefined}
                  >
                    {format(day, "d")}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] tabular-nums" style={{ color: "var(--color-muted-foreground)" }}>
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                <ul className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <li key={task.id}>
                      <Link
                        href={`/dashboard/projects/${task.projectId}`}
                        className="block truncate rounded px-1 py-0.5 text-[11px] hover:opacity-70"
                        style={{ backgroundColor: "var(--color-muted)", color: "var(--color-foreground)" }}
                        title={`${task.title} — ${projectNames.get(task.projectId) ?? ""}`}
                      >
                        {task.title}
                      </Link>
                    </li>
                  ))}
                  {dayTasks.length > 3 && (
                    <li className="px-1 text-[10px]" style={{ color: "var(--color-muted-foreground)" }}>
                      +{dayTasks.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <div className="surface rounded-xl p-4">
        <h2 className="mb-3 text-sm font-semibold">Next deadlines</h2>
        <ul className="space-y-2">
          {tasks
            .filter((t) => t.dueDate && OPEN_STATUSES.includes(t.status))
            .sort((a, b) => toDate(a.dueDate)!.getTime() - toDate(b.dueDate)!.getTime())
            .slice(0, 5)
            .map((task) => (
              <li key={task.id} className="flex flex-wrap items-center gap-2 text-sm">
                <Link href={`/dashboard/projects/${task.projectId}`} className="min-w-0 flex-1 truncate font-medium hover:opacity-70">
                  {task.title}
                </Link>
                <span className="text-xs" style={{ color: isOpenTask(task.status) && isOverdue(task) ? "var(--color-danger)" : "var(--color-muted-foreground)" }}>
                  {formatDate(task.dueDate)}
                  {isOpenTask(task.status) && isOverdue(task) ? " · overdue" : ""}
                </span>
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </li>
            ))}
          {tasks.filter((t) => t.dueDate && OPEN_STATUSES.includes(t.status)).length === 0 && (
            <li className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              No scheduled tasks.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
