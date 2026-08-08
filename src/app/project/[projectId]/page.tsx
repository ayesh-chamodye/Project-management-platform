"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchProject();
  }, [params.projectId]);

  async function fetchProject() {
    try {
      const res = await fetch(`/api/projects/${params.projectId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch {}
    setLoading(false);
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Project not found</p>
        <Link href="/projects" className="text-indigo-600 hover:underline mt-2 inline-block">Back to projects</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects" className="p-2 rounded-lg hover:opacity-80" style={{ color: "var(--color-muted-foreground)" }}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>{project.name}</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>{project.description || "No description"}</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:opacity-90">
          <Plus className="h-4 w-4" /> New Board
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="surface rounded-xl p-6 text-center" style={{ border: "1px solid var(--color-border)" }}>
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>No boards yet</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>Create a board to start organizing tasks</p>
        </div>
      </div>
    </div>
  );
}
