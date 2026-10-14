"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, GripVertical, Plus } from "lucide-react";
import { PriorityBadge, StatusBadge, formatDate, isOverdue, isOpenTask } from "./ui";
import { TASK_STATUSES, TASK_STATUS_LABELS, type Task, type TaskStatus } from "@/lib/firestore/types";
import { persistTaskOrder } from "@/lib/firestore/tasks";
import { useAuth } from "@/components/AuthProvider";
import { useDashboard } from "./DashboardProvider";
import { useToast } from "./Toast";

interface KanbanBoardProps {
  projectId: string;
  onEditTask: (task: Task) => void;
}

export function KanbanBoard({ projectId, onEditTask }: KanbanBoardProps) {
  const { workspace, tasks, refresh } = useDashboard();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const columns = useMemo(() => {
    const board: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    for (const task of tasks.filter((t) => t.projectId === projectId)) {
      board[task.status] = [...(board[task.status] ?? []), task];
    }
    for (const status of TASK_STATUSES) {
      board[status].sort((a, b) => a.position - b.position);
    }
    return board;
  }, [tasks, projectId]);

  function findContainer(id: string): TaskStatus | null {
    if (TASK_STATUSES.includes(id as TaskStatus)) return id as TaskStatus;
    for (const status of TASK_STATUSES) {
      if (columns[status].some((t) => t.id === id)) return status;
    }
    return null;
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || !workspace || !user) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const from = findContainer(activeId);
    const to = findContainer(overId);
    if (!from || !to || activeId === overId) return;

    const moving = columns[from].find((t) => t.id === activeId);
    if (!moving) return;

    const sourceList = columns[from].filter((t) => t.id !== activeId);
    const overTask = columns[to].find((t) => t.id === overId);

    let destinationList: Task[];
    if (from === to) {
      const targetIndex = overTask ? columns[to].findIndex((t) => t.id === overId) : columns[to].length - 1;
      destinationList = sourceList.filter((t) => t.id !== activeId);
      destinationList.splice(targetIndex, 0, moving);
    } else {
      destinationList = [...sourceList.filter((t) => t.status === to), moving];
    }

    const updates = [
      ...sourceList.map((t, i) => ({ id: t.id, status: from, position: i })),
      ...destinationList.map((t, i) => ({ id: t.id, status: to, position: i })),
    ];

    try {
      await persistTaskOrder(updates);
      await refresh();
      if (moving.status !== to) {
        toast(to === "done" ? "Task completed" : `Moved to ${TASK_STATUS_LABELS[to]}`);
      }
    } catch (err) {
      console.error(err);
      toast("Failed to move task", "error");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(event: DragStartEvent) => {
        const task = tasks.find((t) => t.id === String(event.active.id));
        setActiveTask(task ?? null);
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {TASK_STATUSES.map((status) => (
          <section key={status} className="surface flex min-h-32 flex-col rounded-xl" style={{ borderColor: "var(--color-border)" }}>
            <header className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2">
                <StatusBadge status={status} />
                <span className="text-xs tabular-nums" style={{ color: "var(--color-muted-foreground)" }}>
                  {columns[status].length}
                </span>
              </div>
            </header>

            <SortableContext items={columns[status].map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <ul className="flex-1 space-y-2 p-2">
                {columns[status].map((task) => (
                  <SortableTaskCard key={task.id} task={task} onEdit={() => onEditTask(task)} />
                ))}
                {columns[status].length === 0 && (
                  <li className="rounded-lg border border-dashed px-2 py-4 text-center text-xs" style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}>
                    Drop tasks here
                  </li>
                )}
              </ul>
            </SortableContext>
          </section>
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="surface w-64 rotate-2 rounded-lg p-3 shadow-xl" style={{ borderColor: "var(--color-border)" }}>
            <p className="text-sm font-medium">{activeTask.title}</p>
            <p className="mt-1 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              {TASK_STATUS_LABELS[activeTask.status]}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function SortableTaskCard({ task, onEdit }: { task: Task; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <div className="surface group rounded-lg p-2.5" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-start gap-1.5">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab rounded p-0.5 hover:opacity-70 active:cursor-grabbing"
            aria-label={`Drag ${task.title}`}
          >
            <GripVertical className="h-3.5 w-3.5" style={{ color: "var(--color-muted-foreground)" }} />
          </button>
          <button onClick={onEdit} className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium hover:opacity-70">{task.title}</p>
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span
              className="inline-flex items-center gap-1 text-xs"
              style={{ color: isOpenTask(task.status) && isOverdue(task) ? "var(--color-danger)" : "var(--color-muted-foreground)" }}
            >
              <CalendarClock className="h-3 w-3" aria-hidden />
              {formatDate(task.dueDate)}
              {isOpenTask(task.status) && isOverdue(task) ? " · overdue" : ""}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export function AddTaskButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn-secondary text-xs">
      <Plus className="h-3.5 w-3.5" />
      Add task
    </button>
  );
}
