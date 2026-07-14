"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email?: string;
  user_metadata?: { name?: string; avatar_url?: string };
}

export default function DashboardClient({ user }: { user: User }) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [stats, setStats] = useState({ projects: 0, completed: 0, inProgress: 0, upcoming: 0 });

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
    };
    fetchStats();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <nav className="bg-white dark:bg-zinc-900 shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex gap-4 items-center">
          <Link href="/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Profile</Link>
          <span className="text-sm text-gray-600 dark:text-gray-400">{user.email}</span>
          <button onClick={handleLogout} className="text-sm border px-3 py-1 rounded">Logout</button>
        </div>
      </nav>
      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm">Total Projects</h2>
            <p className="text-3xl font-bold">{stats.projects}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm">Tasks Completed</h2>
            <p className="text-3xl font-bold">{stats.completed}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm">Tasks In Progress</h2>
            <p className="text-3xl font-bold">{stats.inProgress}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
            <h2 className="text-gray-500 text-sm">Upcoming Deadlines</h2>
            <p className="text-3xl font-bold">{stats.upcoming}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
