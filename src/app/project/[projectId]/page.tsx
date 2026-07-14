"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    params.then((resolved) => setProjectId(resolved.projectId));
  }, [params]);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/tasks?projectId=${projectId}`)
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []));
  }, [projectId]);

  if (!projectId) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <nav className="bg-white dark:bg-zinc-900 shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Project</h1>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Dashboard</Link>
          <Link href="/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Profile</Link>
        </div>
      </nav>
      <main className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{project?.name || "Project"}</h2>
          <button onClick={() => router.push(`/task/new?projectId=${projectId}`)} className="bg-indigo-600 text-white px-4 py-2 rounded">New Task</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["todo", "in_progress", "done"].map((status) => (
            <div key={status} className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-4 capitalize">{status.replace("_", " ")}</h3>
              <div className="space-y-3">
                {tasks.filter((t) => t.status === status).map((task) => (
                  <Link key={task.id} href={`/task/${task.id}`} className="block p-3 border rounded hover:border-indigo-500 transition-colors">
                    <p className="font-medium text-sm">{task.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{task.priority}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
