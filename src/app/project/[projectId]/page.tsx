"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Plus, ListTodo, GripVertical } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";

const columns = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

function SortableTask({ task, href }: { task: any; href: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = { transform: `translateY(${transform?.y ?? 0}px)`, transition };

  return (
    <Link ref={setNodeRef} href={href} style={{ ...style, transform: style.transform || undefined }} className="block p-4 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="mt-0.5 cursor-grab active:cursor-grabbing" style={{ color: "var(--color-muted-foreground)" }}>
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <p className="font-medium text-sm" style={{ color: "var(--color-foreground)" }}>{task.title}</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>{task.description || "No description"}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs px-2 py-1 rounded-md capitalize" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
              {task.priority}
            </span>
            {task.due_date && (
              <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                Due {new Date(task.due_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<any | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    params.then((resolved) => setProjectId(resolved.projectId));
  }, [params]);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`/api/tasks?projectId=${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
        setLoading(false);
      });
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => setProject(data.project));
  }, [projectId]);

  const tasksByStatus = (status: string) => tasks.filter((t) => t.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const updated = { ...task, status: newStatus };
    setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));

    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>{project?.name || "Project"}</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Drag and drop tasks to update status</p>
          </div>
          <Link href={`/task/new?projectId=${projectId}`} className="btn-primary">
            <Plus className="h-4 w-4" />
            New Task
          </Link>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-muted-foreground)" }}>Loading tasks...</p>
        ) : (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {columns.map((col) => (
                <div key={col.key} className="surface rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: col.key === "done" ? "var(--color-success)" : col.key === "in_progress" ? "var(--color-warning)" : "var(--color-muted-foreground)" }} />
                    <h3 className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>{col.label}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full ml-auto" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-muted-foreground)" }}>
                      {tasksByStatus(col.key).length}
                    </span>
                  </div>
                  <SortableContext items={tasksByStatus(col.key).map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3 min-h-[100px]">
                      {tasksByStatus(col.key).map((task) => (
                        <SortableTask key={task.id} task={task} href={`/task/${task.id}`} />
                      ))}
                      {tasksByStatus(col.key).length === 0 && (
                        <p className="text-xs text-center py-6" style={{ color: "var(--color-muted-foreground)" }}>
                          <ListTodo className="h-5 w-5 mx-auto mb-2 opacity-50" />
                          No tasks
                        </p>
                      )}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>
            <DragOverlay>
              {activeTask ? (
                <div className="p-4 rounded-lg shadow-lg opacity-80" style={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}>
                  <p className="font-medium text-sm" style={{ color: "var(--color-foreground)" }}>{activeTask.title}</p>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </AppShell>
  );
}
