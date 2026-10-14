"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Modal } from "./Modal";
import { StatusBadge } from "./ui";
import { useDashboard } from "./DashboardProvider";
import type { Project, Task } from "@/lib/firestore/types";

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { projects, tasks, memberProfiles } = useDashboard();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { projects: [] as Project[], tasks: [] as Task[] };

    return {
      projects: projects.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)).slice(0, 5),
      tasks: tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)).slice(0, 8),
    };
  }, [query, projects, tasks]);

  return (
    <Modal open={open} onClose={onClose} title="Search" description="Find projects and tasks in this workspace." wide>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-muted-foreground)" }} />
          <input
            className="input-field pl-9"
            placeholder="Search projects and tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Search query"
          />
        </div>

        {query.trim().length >= 2 && results.projects.length === 0 && results.tasks.length === 0 && (
          <p className="py-6 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            No results for “{query}”
          </p>
        )}

        {results.projects.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
              Projects
            </p>
            <ul className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {results.projects.map((p) => (
                <li key={p.id}>
                  <Link href={`/dashboard/projects/${p.id}`} onClick={onClose} className="block rounded px-2 py-2 text-sm hover:opacity-70">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.tasks.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>
              Tasks
            </p>
            <ul className="space-y-1">
              {results.tasks.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/projects/${t.projectId}`}
                    onClick={onClose}
                    className="flex items-center justify-between gap-3 rounded px-2 py-2 text-sm hover:opacity-70"
                  >
                    <span className="min-w-0 flex-1 truncate">{t.title}</span>
                    <StatusBadge status={t.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {memberProfiles && query.trim().length < 2 && (
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            Type at least 2 characters to search.
          </p>
        )}
      </div>
    </Modal>
  );
}
