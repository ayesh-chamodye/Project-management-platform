"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { FolderKanban } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardClient() {
  const router = useRouter();
  const [stats, setStats] = useState({ projects: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        let user = null;
        try {
          const res = await fetch("/api/auth/check", { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            user = data.user;
          }
        } catch {}
        if (!user) {
          router.push("/login");
          return;
        }

        setUser({
          email: user.email || undefined,
          name: user.email?.split("@")[0] || "User",
        });

        const projectsRes = await fetch("/api/projects", { cache: "no-store" });

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setStats({ projects: (data.projects || []).length });
          setRecentProjects((data.projects || []).slice(0, 5));
        }
      } catch (e) {
        console.error("[dashboard] load error", e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            Here's an overview of your projects.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="surface rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-muted-foreground)" }}>Total Projects</p>
                <p className="text-3xl font-bold mt-2" style={{ color: "var(--color-foreground)" }}>
                  {loading ? "..." : stats.projects}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Recent Projects</h2>
          {loading ? (
            <p style={{ color: "var(--color-muted-foreground)" }}>Loading...</p>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <FolderKanban className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-muted-foreground)" }} />
              <p style={{ color: "var(--color-muted-foreground)" }}>No projects yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link key={project.id} href={`/project/${project.id}`} className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow" style={{ border: "1px solid var(--color-border)" }}>
                  <div>
                    <h3 className="font-medium" style={{ color: "var(--color-foreground)" }}>{project.name}</h3>
                    <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>{project.description || "No description"}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-md capitalize" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
                    {project.status || "active"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
