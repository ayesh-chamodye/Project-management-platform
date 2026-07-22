"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import AppShell from "@/components/AppShell";

export default function ProjectsPage() {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>Projects</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </p>
          </div>
          <Link href="/projects/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="surface rounded-xl p-12 text-center space-y-4" style={{ border: "1px solid var(--color-border)" }}>
            <p style={{ color: "var(--color-muted-foreground)" }}>No projects yet.</p>
            <Link href="/projects/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="surface rounded-xl p-5 hover:shadow-sm transition-shadow block"
                style={{ border: "1px solid var(--color-border)" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-base" style={{ color: "var(--color-foreground)" }}>{project.name}</h3>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "var(--color-muted)", color: "var(--color-muted-foreground)" }}>
                    {project.status}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm line-clamp-2 mb-3" style={{ color: "var(--color-muted-foreground)" }}>{project.description}</p>
                )}
                <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  Created {new Date(project.created_at).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
