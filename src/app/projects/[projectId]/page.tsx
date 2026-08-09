"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import AppShell from "@/components/AppShell";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter();
  const { projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/check", { cache: "no-store" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const pr = await fetch(`/api/projects/${projectId}`);
        if (pr.ok) {
          const data = await pr.json();
          setProject(data.project);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, router]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-64">
          <p style={{ color: "var(--color-muted-foreground)" }}>Loading...</p>
        </div>
      </AppShell>
    );
  }

  if (!project) {
    return (
      <AppShell>
        <div className="text-center py-20">
          <p className="text-lg" style={{ color: "var(--color-muted-foreground)" }}>Project not found</p>
          <Link href="/projects" className="btn-secondary mt-4 inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Link href="/projects" className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-80" style={{ color: "var(--color-primary)" }}>
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="surface rounded-xl p-8 space-y-6" style={{ border: "1px solid var(--color-border)" }}>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>{project.name}</h1>
            <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "var(--color-muted)", color: "var(--color-muted-foreground)" }}>
              {project.status}
            </span>
          </div>

          {project.description && (
            <div>
              <h2 className="label">Description</h2>
              <p className="text-sm mt-1" style={{ color: "var(--color-foreground)" }}>{project.description}</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            <Calendar className="h-4 w-4" />
            Created {new Date(project.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
