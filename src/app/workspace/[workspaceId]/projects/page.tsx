"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban, Users, ArrowRight } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
  isOwner: boolean;
  projectCount?: number;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
  createdAt: string;
}

export default function WorkspaceProjectsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");

  useEffect(() => {
    params.then((p) => setWorkspaceId(p.workspaceId));
  }, [params]);

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await fetch("/api/workspaces", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.workspaces) {
          const found = data.workspaces.find((w: Workspace) => w.id === workspaceId);
          setWorkspace(found || null);
        }
      }
    } catch {}
  }, [workspaceId]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.projects) setProjects(data.projects);
      }
    } catch {}
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspace();
      fetchProjects();
    }
  }, [workspaceId, fetchWorkspace, fetchProjects]);

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const res = await fetch(`/api/workspaces/${workspaceId}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newProjectName.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/workspace/${workspaceId}/projects/${data.project.id}`);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
              {workspace?.name || "Workspace"} Projects
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              Manage projects in this workspace
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateProject} className="surface rounded-xl p-6" style={{ border: "1px solid var(--color-border)" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>
              Create New Project
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-foreground)" }}>
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Project"
                  required
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border rounded-lg hover:opacity-80"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-16 surface rounded-xl" style={{ border: "1px solid var(--color-border)" }}>
            <FolderKanban className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--color-muted-foreground)" }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: "var(--color-foreground)" }}>
              No projects yet
            </h3>
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              Create your first project to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/workspace/${workspaceId}/projects/${project.id}`)}
                className="surface rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all"
                style={{ border: "1px solid var(--color-border)" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="h-3 w-3 rounded-full mt-1.5"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                      {project.name}
                    </h3>
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--color-muted-foreground)" }}>
                      {project.description || "No description"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
