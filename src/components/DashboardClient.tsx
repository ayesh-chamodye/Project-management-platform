"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  ClipboardList,
  FolderKanban,
  Users,
  Plus,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";

interface Stats {
  workspaceCount: number;
  projectCount: number;
  taskCount: number;
  completedCount: number;
  overdueCount: number;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  workspaceId: string;
  created_at?: string;
}

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate?: string;
  projectName?: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface DashboardUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export function DashboardClient({ user }: { user: DashboardUser }) {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({ workspaceCount: 0, projectCount: 0, taskCount: 0, completedCount: 0, overdueCount: 0 });
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/summary", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      }
    } catch {}
  }, []);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await fetch("/api/workspaces", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.workspaces) setWorkspaces(data.workspaces.slice(0, 5));
      }
    } catch {}
  }, []);

  const fetchRecentProjects = useCallback(async () => {
    try {
      const workspaceIds = workspaces.map((w) => w.id);
      if (workspaceIds.length === 0) return;

      const projectPromises = workspaceIds.map((id) =>
        fetch(`/api/workspaces/${id}/projects`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null))
      );

      const results = await Promise.all(projectPromises);
      const allProjects: Project[] = [];
      results.forEach((data) => {
        if (data?.projects) allProjects.push(...data.projects);
      });

      allProjects.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      setProjects(allProjects.slice(0, 8));
    } catch {}
  }, [workspaces]);

  const fetchMyTasks = useCallback(async () => {
    try {
      const workspaceIds = workspaces.map((w) => w.id);
      if (workspaceIds.length === 0) return;

      const taskPromises = workspaceIds.map((id) =>
        fetch(`/api/workspaces/${id}/tasks?assignedToMe=true`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null))
      );

      const results = await Promise.all(taskPromises);
      const allTasks: Task[] = [];
      results.forEach((data) => {
        if (data?.tasks) allTasks.push(...data.tasks);
      });

      allTasks.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      });

      setTasks(allTasks.slice(0, 10));
    } catch {}
  }, [workspaces]);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push("/login");
      return;
    }
    (async () => {
      try {
        await Promise.all([fetchStats(), fetchWorkspaces(), fetchRecentProjects(), fetchMyTasks()]);
      } catch {}
      setLoading(false);
    })();
  }, [authUser, authLoading, fetchStats, fetchWorkspaces, fetchRecentProjects, fetchMyTasks, router]);

  const statCards = [
    { label: "Workspaces", value: stats.workspaceCount, icon: Users, color: "bg-indigo-500" },
    { label: "Projects", value: stats.projectCount, icon: FolderKanban, color: "bg-blue-500" },
    { label: "Tasks", value: stats.taskCount, icon: ClipboardList, color: "bg-green-500" },
    { label: "Completed", value: stats.completedCount, icon: CheckCircle2, color: "bg-emerald-500" },
  ];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Welcome back, {authUser?.displayName || authUser?.email || "User"}!
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            Here&apos;s what&apos;s happening across your workspaces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="surface rounded-xl p-6"
                style={{ border: "1px solid var(--color-border)" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-muted-foreground)" }}>
                      {card.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
                      {loading ? "..." : card.value}
                    </p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg ${card.color} bg-opacity-10 flex items-center justify-center`}>
                    <Icon className="h-6 w-6" style={{ color: card.color.replace("bg-", "text-") }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="surface rounded-xl p-6" style={{ border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--color-foreground)" }}>
                Your Workspaces
              </h2>
              <button
                onClick={async () => {
                  const name = prompt("Workspace name:");
                  if (!name) return;
                  await fetch("/api/workspaces", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                  });
                  fetchWorkspaces();
                  fetchStats();
                }}
                className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "var(--color-primary)", backgroundColor: "transparent" }}
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>
            <div className="space-y-3">
              {workspaces.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  No workspaces yet. Create your first workspace to get started.
                </p>
              ) : (
                workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    onClick={() => router.push(`/workspace/${workspace.id}/projects`)}
                    className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors"
                    style={{ backgroundColor: "var(--color-muted)" }}
                  >
                    <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                      {workspace.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                        {workspace.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                        /{workspace.slug}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "var(--color-card)", color: "var(--color-muted-foreground)" }}>
                      {workspace.role}
                    </span>
                    <ArrowRight className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="surface rounded-xl p-6" style={{ border: "1px solid var(--color-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--color-foreground)" }}>
                My Tasks
              </h2>
              {workspaces.length > 0 && (
                <button
                  onClick={() => router.push(`/workspace/${workspaces[0].id}/projects`)}
                  className="text-sm font-medium flex items-center gap-1"
                  style={{ color: "var(--color-primary)" }}
                >
                  View all <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  No tasks assigned to you yet.
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => task.projectName && router.push(`/project/${task.projectName}`)}
                    className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors"
                    style={{ backgroundColor: "var(--color-muted)" }}
                  >
                    {getPriorityIcon(task.priority)}
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--color-card)", color: "var(--color-muted-foreground)" }}>
                          {task.status.replace("_", " ")}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {formatDistanceToNow(new Date(task.dueDate))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
