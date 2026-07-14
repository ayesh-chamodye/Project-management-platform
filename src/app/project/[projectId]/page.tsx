"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Plus, ListTodo } from "lucide-react";

const columns = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((resolved) => setProjectId(resolved.projectId));
  }, [params]);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/tasks?projectId=${projectId}`).then((res) => res.json()),
      fetch(`/api/projects?workspaceId=`).then(() => null),
    ]).then(([tasksData]) => {
      setTasks(tasksData.tasks || []);
      setLoading(false);
    });
  }, [projectId]);

  const tasksByStatus = (status: string) => tasks.filter((t) => t.status === status);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>{project?.name || "Project"}</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Track and manage tasks</p>
          </div>
          <Link href={`/task/new?projectId=${projectId}`} className="btn-primary">
            <Plus className="h-4 w-4" />
            New Task
          </Link>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-muted-foreground)" }}>Loading tasks...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => (
              <div key={col.key} className="surface rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: col.key === "done" ? "var(--color-success)" : col.key === "in_progress" ? "var(--color-warning)" : "var(--color-muted-foreground)" }} />
                  <h3 className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>{col.label}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-muted-foreground)" }}>
                    {tasksByStatus(col.key).length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasksByStatus(col.key).map((task) => (
                    <Link key={task.id} href={`/task/${task.id}`} className="block p-4 rounded-lg transition-colors" style={{ backgroundColor: "var(--color-background)", border: "1px solid var(--color-border)" }}>
                      <p className="font-medium text-sm" style={{ color: "var(--color-foreground)" }}>{task.title}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>{task.description || "No description"}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                            Due {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                  {tasksByStatus(col.key).length === 0 && (
                    <p className="text-xs text-center py-6" style={{ color: "var(--color-muted-foreground)" }}>
                      <ListTodo className="h-5 w-5 mx-auto mb-2 opacity-50" />
                      No tasks
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
