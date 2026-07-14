"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { FolderKanban, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const statsCards = [
  { label: "Total Projects", key: "projects", icon: FolderKanban },
  { label: "Completed Tasks", key: "completed", icon: CheckCircle2 },
  { label: "In Progress", key: "inProgress", icon: Clock },
  { label: "Upcoming Deadlines", key: "upcoming", icon: AlertTriangle },
];

export default function DashboardClient() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [stats, setStats] = useState({ projects: 0, completed: 0, inProgress: 0, upcoming: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: projectsCount }, { count: completedCount }, { count: inProgressCount }, { data: upcomingTasks }] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "done"),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
        supabase.from("tasks").select("*").gte("due_date", new Date().toISOString()).lte("due_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
      ]);
      setStats({
        projects: projectsCount || 0,
        completed: completedCount || 0,
        inProgress: inProgressCount || 0,
        upcoming: upcomingTasks?.length || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, [supabase]);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>Dashboard</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Overview of your projects and tasks</p>
          </div>
          <Link href="/workspace/dashboard" className="btn-primary">
            View Workspace
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.key} className="surface rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "var(--color-muted-foreground)" }}>{card.label}</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "var(--color-foreground)" }}>
                      {loading ? "..." : stats[card.key as keyof typeof stats]}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary)" }}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="surface rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/workspace/dashboard" className="btn-secondary">Create Workspace</Link>
            <Link href="/workspace/dashboard" className="btn-secondary">New Project</Link>
            <Link href="/profile" className="btn-secondary">Edit Profile</Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
