"use client";

import { useMemo, useState } from "react";
import { ListChecks, Plus } from "lucide-react";
import { TaskRow } from "./TaskRow";
import { EmptyState } from "./ui";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { filterMyTasks, myTasks, type MyTaskFilter } from "@/lib/firestore/metrics";
import { TASK_PRIORITY_LABELS, type TaskPriority } from "@/lib/firestore/types";
import { useAuth } from "@/components/AuthProvider";
import { useDashboard } from "./DashboardProvider";

const FILTERS: { id: MyTaskFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

const SORTS = [
  { id: "due", label: "Due date" },
  { id: "priority", label: "Priority" },
  { id: "recent", label: "Recently updated" },
] as const;

const PRIORITY_ORDER: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

export function MyTasksList({ showCreate = true, limit }: { showCreate?: boolean; limit?: number }) {
  const { tasks, projects, refresh } = useDashboard();
  const { user } = useAuth();
  const [filter, setFilter] = useState<MyTaskFilter>("all");
  const [sort, setSort] = useState<(typeof SORTS)[number]["id"]>("due");
  const [createOpen, setCreateOpen] = useState(false);

  const mine = useMemo(() => (user ? myTasks(tasks, user.uid) : []), [tasks, user]);

  const visible = useMemo(() => {
    const filtered = filterMyTasks(mine, filter);

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sort === "recent") return (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0);
      return (a.dueDate?.toMillis() ?? Infinity) - (b.dueDate?.toMillis() ?? Infinity);
    });

    return limit ? sorted.slice(0, limit) : sorted;
  }, [mine, filter, sort, limit]);

  const projectNames = useMemo(() => new Map(projects.map((p) => [p.id, p.name])), [projects]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Task filters">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.id)}
                className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                  backgroundColor: active ? "var(--color-primary)" : "transparent",
                  color: active ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <label className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          Sort
          <select className="input-field w-36 py-1 text-xs" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {showCreate && (
          <button onClick={() => setCreateOpen(true)} className="btn-secondary text-xs">
            <Plus className="h-3.5 w-3.5" />
            New task
          </button>
        )}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-5 w-5" style={{ color: "var(--color-muted-foreground)" }} />}
          title="No tasks here"
          description={
            filter === "all"
              ? "Tasks assigned to you will appear here once your team creates them."
              : `No tasks match the "${FILTERS.find((f) => f.id === filter)?.label}" filter.`
          }
          action={
            showCreate ? (
              <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm">
                <Plus className="h-4 w-4" />
                Create task
              </button>
            ) : undefined
          }
        />
      ) : (
        <ul className="surface divide-y overflow-hidden rounded-xl" style={{ borderColor: "var(--color-border)" }}>
          {visible.map((task) => (
            <TaskRow key={task.id} task={task} projectName={projectNames.get(task.projectId)} onChanged={refresh} />
          ))}
        </ul>
      )}

      <CreateTaskDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refresh} />
    </div>
  );
}
