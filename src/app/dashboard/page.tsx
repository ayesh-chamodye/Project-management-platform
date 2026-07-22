"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderOpen, ArrowRight, Plus } from "lucide-react";
import AppShell from "@/components/AppShell";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/check", { cache: "no-store" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const pr = await fetch("/api/projects");
        if (pr.ok) {
          const data = await pr.json();
          setProjects(data.projects || []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p style={{ color: "var(--color-muted-foreground)" }}>Loading...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            {projects.length} {projects.length === 1 ? "project" : "projects"} total
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="surface rounded-xl p-12 text-center space-y-4" style={{ border: "1px solid var(--color-border)" }}>
            <FolderOpen className="h-12 w-12 mx-auto" style={{ color: "var(--color-muted-foreground)" }} />
            <h2 className="text-xl font-semibold" style={{ color: "var(--color-foreground)" }}>No projects yet</h2>
            <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--color-muted-foreground)" }}>
              Get started by creating your first project.
            </p>
            <Link href="/projects/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-medium uppercase tracking-wider" style={{ color: "var(--color-muted-foreground)" }}>Recent Projects</h2>
            <div className="space-y-2">
              {projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="surface rounded-lg px-4 py-3 flex items-center justify-between hover:shadow-sm transition-shadow"
                  style={{ border: "1px solid var(--color-border)" }}
                >
                  <div>
                    <p className="font-medium text-sm" style={{ color: "var(--color-foreground)" }}>{project.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                      {project.status} &middot; {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
