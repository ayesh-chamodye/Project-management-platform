"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Search, FolderOpen, ListTodo } from "lucide-react";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<{ tasks: any[]; projects: any[] }>({ tasks: [], projects: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => setResults(data))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>Search</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Results for &quot;{query}&quot;</p>
      </div>

      {loading && <p style={{ color: "var(--color-muted-foreground)" }}>Searching...</p>}

      {!loading && results.projects.length === 0 && results.tasks.length === 0 && (
        <div className="surface rounded-xl p-8 text-center">
          <Search className="h-10 w-10 mx-auto mb-3" style={{ color: "var(--color-muted-foreground)" }} />
          <p style={{ color: "var(--color-muted-foreground)" }}>No results found.</p>
        </div>
      )}

      {results.projects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.projects.map((project) => (
              <a key={project.id} href={`/project/${project.id}`} className="surface rounded-xl p-6 hover:shadow-md transition-shadow block">
                <div className="flex items-center gap-3 mb-2">
                  <FolderOpen className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
                  <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>{project.name}</h3>
                </div>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>{project.description || "No description"}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {results.tasks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Tasks</h2>
          <div className="space-y-3">
            {results.tasks.map((task) => (
              <a key={task.id} href={`/task/${task.id}`} className="surface rounded-xl p-4 hover:shadow-md transition-shadow block">
                <div className="flex items-center gap-3">
                  <ListTodo className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>{task.title}</h3>
                    <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>{task.description || "No description"}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <SearchResults />
      </Suspense>
    </AppShell>
  );
}
