"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Plus, FolderOpen } from "lucide-react";

export default function WorkspaceClient({ params }: { params: Promise<{ workspaceId: string }> }) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    params.then((resolved) => setWorkspaceId(resolved.workspaceId));
  }, [params]);

  useEffect(() => {
    if (!workspaceId) return;
    const fetchProjects = async () => {
      const { data } = await supabase.from("projects").select("*").eq("workspace_id", workspaceId);
      setProjects(data || []);
      setLoading(false);
    };
    fetchProjects();
  }, [supabase, workspaceId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !workspaceId) return;
    setCreating(true);
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, name: newName, description: "", status: "active" }),
    });
    setNewName("");
    setCreating(false);
    const { data } = await supabase.from("projects").select("*").eq("workspace_id", workspaceId);
    setProjects(data || []);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>Workspace</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Manage projects in this workspace</p>
          </div>
        </div>

        <div className="surface rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>New Project</h2>
          <form onSubmit={handleCreateProject} className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name"
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
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Projects</h2>
          {loading ? (
            <p style={{ color: "var(--color-muted-foreground)" }}>Loading projects...</p>
          ) : projects.length === 0 ? (
            <div className="surface rounded-xl p-8 text-center">
              <FolderOpen className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-muted-foreground)" }} />
              <p style={{ color: "var(--color-muted-foreground)" }}>No projects yet. Create one above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Link key={project.id} href={`/project/${project.id}`} className="surface rounded-xl p-6 hover:shadow-md transition-shadow block">
                  <h3 className="font-semibold text-lg mb-2" style={{ color: "var(--color-foreground)" }}>{project.name}</h3>
                  <p className="text-sm mb-4" style={{ color: "var(--color-muted-foreground)" }}>{project.description || "No description"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
                      {project.status || "active"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
