"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Plus, FolderOpen, FolderKanban } from "lucide-react";

export default function WorkspaceDashboard() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      }
    } catch (e) {
      setError("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        setNewName("");
        fetchWorkspaces();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create workspace");
      }
    } catch (e) {
      setError("Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>Workspaces</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Select a workspace to manage projects</p>
          </div>
        </div>

        <div className="surface rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Create Workspace</h2>
          {error && <div className="mb-4 text-sm" style={{ color: "var(--color-danger)" }}>{error}</div>}
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Workspace name"
              className="input-field flex-1"
              required
            />
            <button type="submit" disabled={creating} className="btn-primary">
              <Plus className="h-4 w-4" />
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Your Workspaces</h2>
          {loading ? (
            <p style={{ color: "var(--color-muted-foreground)" }}>Loading...</p>
          ) : workspaces.length === 0 ? (
            <div className="surface rounded-xl p-8 text-center">
              <FolderOpen className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-muted-foreground)" }} />
              <p style={{ color: "var(--color-muted-foreground)" }}>No workspaces yet. Create one above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="surface rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary)" }}>
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>{workspace.name}</h3>
                      <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{workspace.memberRole || "Owner"}</p>
                    </div>
                  </div>
                  <button onClick={() => router.push(`/workspace/${workspace.id}`)} className="btn-secondary w-full">
                    Open Workspace
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
