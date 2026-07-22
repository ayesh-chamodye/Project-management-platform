"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export default function WorkspaceSelectPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; image?: string } | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const authRes = await fetch("/api/auth/check", { cache: "no-store" });
        if (!authRes.ok) {
          router.push("/login");
          return;
        }
        const authData = await authRes.json();
        setUser(authData.user || null);

        const wsRes = await fetch("/api/workspaces", { cache: "no-store" });
        if (wsRes.ok) {
          const data = await wsRes.json();
          if (data.workspaces) setWorkspaces(data.workspaces);
        }
      } catch {}
    })();
  }, [router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmed = name.trim();
    if (!trimmed) return;

    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/workspace/${data.workspace.id}/dashboard`);
    } else {
      const body = await res.json().catch(() => ({ error: "Failed to create workspace" }));
      setError(body.error || "Failed to create workspace");
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 4a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold">ProjectFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.name || user?.email}</span>
            {user?.image && (
              <div
                className="h-8 w-8 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${user.image})` }}
              />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">
              Welcome back, {user?.name || user?.email}!
            </h2>
            <p className="text-lg">Select a workspace to get started</p>
          </div>

          {workspaces.length === 0 ? (
            <div className="text-center py-16 border rounded-2xl">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium">No workspaces yet</h3>
              <p className="mt-2 text-sm">Create your first workspace to start managing projects</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {workspaces.map((ws) => (
                <a
                  key={ws.id}
                  href={`/workspace/${ws.id}/dashboard`}
                  className="block border rounded-2xl p-6 hover:shadow-md hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {ws.name[0]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{ws.name}</h3>
                        <p className="text-sm text-gray-500">/{ws.slug}</p>
                      </div>
                    </div>
                    {ws.role === "owner" && (
                      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">Owner</span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}

          <form onSubmit={handleCreate} className="mt-12">
            {error && (
              <div className="mb-3 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "var(--color-danger)", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
                {error}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name"
                required
                className="px-4 py-2 border rounded-lg"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-indigo-400 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Workspace
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
