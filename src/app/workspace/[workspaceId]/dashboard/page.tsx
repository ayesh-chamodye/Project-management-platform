"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Users, ArrowRight } from "lucide-react";
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

interface Member {
  id: string;
  userId: string;
  role: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export default function WorkspaceDashboardPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState("");

  useEffect(() => {
    params.then((p) => setWorkspaceId(p.workspaceId));
  }, [params]);

  const fetchWorkspaceData = useCallback(async () => {
    try {
      const [wsRes, projectsRes, membersRes] = await Promise.all([
        fetch("/api/workspaces", { cache: "no-store" }),
        fetch(`/api/workspaces/${workspaceId}/projects`, { cache: "no-store" }),
        fetch(`/api/workspaces/${workspaceId}/members`, { cache: "no-store" }),
      ]);

      if (wsRes.ok) {
        const wsData = await wsRes.json();
        const found = wsData.workspaces?.find((w: Workspace) => w.id === workspaceId);
        setWorkspace(found || null);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || []);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }
    } catch (error) {
      console.error("Failed to fetch workspace data:", error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceData();
    }
  }, [workspaceId, fetchWorkspaceData]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Workspace not found</h2>
          <p className="text-gray-600">The workspace you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
            {workspace.name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            /{workspace.slug}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => router.push(`/workspace/${workspaceId}/projects`)}
            className="surface rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <FolderKanban className="h-8 w-8" style={{ color: "var(--color-primary)" }} />
              <ArrowRight className="h-5 w-5" style={{ color: "var(--color-muted-foreground)" }} />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: "var(--color-foreground)" }}>
              {projects.length}
            </h3>
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              Projects
            </p>
          </div>

          <div
            className="surface rounded-xl p-6"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8" style={{ color: "var(--color-primary)" }} />
            </div>
            <h3 className="text-2xl font-bold" style={{ color: "var(--color-foreground)" }}>
              {members.length}
            </h3>
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              Members
            </p>
          </div>
        </div>

        <div className="surface rounded-xl p-6" style={{ border: "1px solid var(--color-border)" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>
            Recent Projects
          </h2>
          {projects.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              No projects yet. Create your first project to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/workspace/${workspaceId}/projects/${project.id}`)}
                  className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors"
                  style={{ backgroundColor: "var(--color-muted)" }}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                      {project.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                      {project.description || "No description"}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
