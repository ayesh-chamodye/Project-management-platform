"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Users,
  Plus,
  ArrowRight,
} from "lucide-react";
import AppShell from "@/components/AppShell";

interface Stats {
  workspaceCount: number;
  projectCount: number;
  boardCount: number;
  taskCount: number;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
  updatedAt?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  workspaceId: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ workspaceCount: 0, projectCount: 0, boardCount: 0, taskCount: 0 });
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const authRes = await fetch("/api/auth/check", { cache: "no-store" });
        if (!authRes.ok) {
          router.push("/login");
          return;
        }

        await Promise.all([fetchStats(), fetchWorkspaces(), fetchRecentProjects()]);
      } catch {}
      setLoading(false);
    })();
  }, [router]);

  async function fetchStats() {
    try {
      const res = await fetch("/api/dashboard/summary", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      }
    } catch {}
  }

  async function fetchWorkspaces() {
    try {
      const res = await fetch("/api/workspaces", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.workspaces) setWorkspaces(data.workspaces.slice(0, 5));
      }
    } catch {}
  }

  async function fetchRecentProjects() {
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

      allProjects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setProjects(allProjects.slice(0, 8));
    } catch {}
  }

  const statCards = [
    { label: "Workspaces", value: stats.workspaceCount, icon: Users, color: "bg-indigo-500" },
    { label: "Projects", value: stats.projectCount, icon: FolderKanban, color: "bg-blue-500" },
    { label: "Boards", value: stats.boardCount, icon: ClipboardList, color: "bg-green-500" },
    { label: "Tasks", value: stats.taskCount, icon: LayoutDashboard, color: "bg-purple-500" },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            Welcome back! Here&apos;s what&apos;s happening across your workspaces.
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
                Recent Projects
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
              {projects.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  No projects yet. Create a workspace first, then add projects.
                </p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/workspace/${project.workspaceId}/projects/${project.id}`)}
                    className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors"
                    style={{ backgroundColor: "var(--color-muted)" }}
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color || "#6366f1" }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                        {project.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                        {project.created_at ? formatDistanceToNow(new Date(project.created_at)) + " ago" : "Recently"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
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
