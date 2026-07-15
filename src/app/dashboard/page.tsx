"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Inbox,
  ListTodo,
  ArrowUpRight,
} from "lucide-react";

const statsCards = [
  { label: "Total Projects", key: "projects", icon: FolderKanban },
  { label: "Completed Tasks", key: "completed", icon: CheckCircle2 },
  { label: "In Progress", key: "inProgress", icon: Clock },
  { label: "Upcoming Deadlines", key: "upcoming", icon: AlertTriangle },
];

export const dynamic = 'force-dynamic';

export default function DashboardClient() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [stats, setStats] = useState({ projects: 0, completed: 0, inProgress: 0, upcoming: 0 });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push("/login");
          return;
        }

        const u = session.user;
        setUser({
          email: u.email || undefined,
          name: (u.user_metadata as any)?.name || u.email?.split("@")[0] || "User",
        });

        const [
          projectsRes,
          completedRes,
          inProgressRes,
          upcomingRes,
          projectsListRes,
          tasksListRes,
          activityRes,
          notificationsRes,
        ] = await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "done"),
          supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
          supabase.from("tasks").select("*").gte("due_date", new Date().toISOString()).lte("due_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
          fetch("/api/projects").then((res) => res.json().then((data) => ({ ok: res.ok, status: res.status, data }))).catch((e) => ({ ok: false, status: 0, data: null, error: String(e) })),
          fetch("/api/dashboard/tasks").then((res) => res.json().then((data) => ({ ok: res.ok, status: res.status, data }))).catch((e) => ({ ok: false, status: 0, data: null, error: String(e) })),
          fetch("/api/activity-logs").then((res) => res.json().then((data) => ({ ok: res.ok, status: res.status, data }))).catch((e) => ({ ok: false, status: 0, data: null, error: String(e) })),
          fetch("/api/notifications").then((res) => res.json().then((data) => ({ ok: res.ok, status: res.status, data }))).catch((e) => ({ ok: false, status: 0, data: null, error: String(e) })),
        ]);

        setStats({
          projects: projectsRes.count || 0,
          completed: completedRes.count || 0,
          inProgress: inProgressRes.count || 0,
          upcoming: upcomingRes.data?.length || 0,
        });

        const apiErrors: string[] = [];
        if (!projectsListRes.ok) apiErrors.push(`projects ${projectsListRes.status}`);
        if (!tasksListRes.ok) apiErrors.push(`tasks ${tasksListRes.status}`);
        if (!activityRes.ok) apiErrors.push(`activity ${activityRes.status}`);
        if (!notificationsRes.ok) apiErrors.push(`notifications ${notificationsRes.status}`);
        if (apiErrors.length) {
          setError(`Dashboard data error: ${apiErrors.join(", ")}`);
          console.error("[dashboard] api errors", apiErrors, { projectsListRes, tasksListRes, activityRes, notificationsRes });
        }

        setRecentProjects((projectsListRes.data?.projects || []).slice(0, 5));
        setRecentTasks((tasksListRes.data?.tasks || []).slice(0, 5));
        setRecentActivity((activityRes.data?.logs || []).slice(0, 5));
        setNotifications((notificationsRes.data?.notifications || []).slice(0, 5));
      } catch (e) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router, supabase]);

  const unreadNotifications = notifications.filter((n) => !n.isRead).length;

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>
              Welcome back, {user?.name || "User"}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              Here's what's happening with your projects today.
            </p>
          </div>
          <Link href="/workspace/dashboard" className="btn-primary">
            View Workspace
          </Link>
        </div>

        {error && (
          <div className="surface rounded-xl p-4 text-sm" style={{ color: "var(--color-danger)" }}>
            {error}
          </div>
        )}

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 surface rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--color-foreground)" }}>Recent Projects</h2>
              <Link href="/workspace/dashboard" className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--color-primary)" }}>
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            {loading ? (
              <p style={{ color: "var(--color-muted-foreground)" }}>Loading...</p>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-muted-foreground)" }} />
                <p style={{ color: "var(--color-muted-foreground)" }}>No projects yet.</p>
                <Link href="/workspace/dashboard" className="btn-primary mt-4 inline-flex">Create Workspace</Link>
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

          <div className="space-y-6">
            <div className="surface rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold" style={{ color: "var(--color-foreground)" }}>Notifications</h2>
                {unreadNotifications > 0 && (
                  <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: "var(--color-danger)", color: "var(--color-primary-foreground)" }}>
                    {unreadNotifications} new
                  </span>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="text-center py-6">
                  <Inbox className="h-8 w-8 mx-auto mb-2" style={{ color: "var(--color-muted-foreground)" }} />
                  <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>No notifications yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 rounded-lg" style={{ border: "1px solid var(--color-border)", backgroundColor: notification.isRead ? "transparent" : "var(--color-accent)" }}>
                      <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{notification.title}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>{notification.message}</p>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/notifications" className="text-sm font-medium mt-4 inline-flex items-center gap-1" style={{ color: "var(--color-primary)" }}>
                View all notifications <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="surface rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--color-foreground)" }}>Recent Tasks</h2>
              <Link href="/workspace/dashboard" className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--color-primary)" }}>
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <ListTodo className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-muted-foreground)" }} />
                <p style={{ color: "var(--color-muted-foreground)" }}>No tasks yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <Link key={task.id} href={`/task/${task.id}`} className="flex items-center justify-between p-4 rounded-lg hover:shadow-md transition-shadow" style={{ border: "1px solid var(--color-border)" }}>
                    <div className="flex-1">
                      <h3 className="font-medium" style={{ color: "var(--color-foreground)" }}>{task.title}</h3>
                      <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>{task.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-md capitalize" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
                        {task.priority}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-md capitalize" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
                        {task.status?.replace("_", " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="surface rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--color-foreground)" }}>Recent Activity</h2>
              <TrendingUp className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
            </div>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-muted-foreground)" }} />
                <p style={{ color: "var(--color-muted-foreground)" }}>No activity yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full mt-2" style={{ backgroundColor: "var(--color-primary)" }} />
                    <div>
                      <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
                        <span className="font-medium">{log.userName}</span> {log.action} task
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="surface rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/workspace/dashboard" className="btn-secondary">Create Workspace</Link>
            <Link href="/task/new" className="btn-secondary">New Task</Link>
            <Link href="/profile" className="btn-secondary">Edit Profile</Link>
            <Link href="/settings" className="btn-secondary">Settings</Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
