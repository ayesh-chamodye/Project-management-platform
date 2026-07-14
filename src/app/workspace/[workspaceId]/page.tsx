"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface WorkspaceClientProps {
  user: any;
  params: Promise<{ workspaceId: string }>;
}

export default function WorkspaceClient({ user, params }: WorkspaceClientProps) {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    params.then((resolved) => setWorkspaceId(resolved.workspaceId));
  }, [params]);

  useEffect(() => {
    if (!workspaceId) return;
    const fetchProjects = async () => {
      const { data } = await supabase.from("projects").select("*").eq("workspace_id", workspaceId);
      setProjects(data || []);
    };
    fetchProjects();
  }, [supabase, workspaceId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (!workspaceId) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <nav className="bg-white dark:bg-zinc-900 shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Workspace</h1>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Dashboard</Link>
          <Link href="/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Profile</Link>
          <button onClick={handleLogout} className="text-sm border px-3 py-1 rounded">Logout</button>
        </div>
      </nav>
      <main className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Projects</h2>
          <button onClick={() => router.push(`/project/new?workspaceId=${workspaceId}`)} className="bg-indigo-600 text-white px-4 py-2 rounded">New Project</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} href={`/project/${project.id}`} className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">{project.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
              <span className="mt-4 inline-block text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{project.status}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
