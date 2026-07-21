"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((resolved) => setProjectId(resolved.projectId));
  }, [params]);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`/api/projects/${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        setProject(data.project);
        setLoading(false);
      });
  }, [projectId]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>{project?.name || "Project"}</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>{project?.description || "No description"}</p>
        </div>

        {loading ? (
          <p style={{ color: "var(--color-muted-foreground)" }}>Loading...</p>
        ) : (
          <div className="surface rounded-xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Status</p>
                <p className="font-medium capitalize" style={{ color: "var(--color-foreground)" }}>{project?.status || "active"}</p>
              </div>
              <div>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Created</p>
                <p className="font-medium" style={{ color: "var(--color-foreground)" }}>{project?.created_at ? new Date(project.created_at).toLocaleDateString() : "-"}</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/dashboard" className="btn-secondary">Back to Dashboard</Link>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
