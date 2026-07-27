"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/components/AuthProvider";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
  isOwner: boolean;
}

export default function WorkspaceSelectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await fetch("/api/workspaces", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.workspaces) setWorkspaces(data.workspaces);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newWorkspaceName.trim() }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/workspace/${data.workspace.id}/dashboard`);
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
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>
            Welcome back, {user?.name || user?.email}!
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            Select a workspace to get started
          </p>
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-16 surface rounded-xl" style={{ border: "1px solid var(--color-border)" }}>
            <FolderKanban className="h-12 w-12 mx-auto mb-4" style={{ color: "var(--color-muted-foreground)" }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: "var(--color-foreground)" }}>
              No workspaces yet
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--color-muted-foreground)" }}>
              Create your first workspace to start managing projects
            </p>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                onClick={() => router.push(`/workspace/${workspace.id}/dashboard`)}
                className="surface rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all"
                style={{ border: "1px solid var(--color-border)" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {workspace.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                        {workspace.name}
                      </h3>
                      <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                        /{workspace.slug}
                      </p>
                    </div>
                  </div>
                  {workspace.isOwner && (
                    <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                      Owner
                    </span>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="surface rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-dashed flex flex-col items-center justify-center gap-3 min-h-[160px]"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Plus className="h-8 w-8" style={{ color: "var(--color-muted-foreground)" }} />
              <span className="font-medium" style={{ color: "var(--color-muted-foreground)" }}>
                Create Workspace
              </span>
            </button>
          </div>
        )}

        {showCreateForm && (
          <form onSubmit={handleCreateWorkspace} className="surface rounded-xl p-6 max-w-md" style={{ border: "1px solid var(--color-border)" }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>
              Create New Workspace
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-foreground)" }}>
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                  required
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Create Workspace
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
      </div>
    </AppShell>
  );
}
