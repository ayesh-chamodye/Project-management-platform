"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarRange, FolderKanban, MoreHorizontal, Trash2 } from "lucide-react";
import { ProjectStatusBadge, ProgressBar, formatDate, relativeTime } from "./ui";
import { projectProgress } from "@/lib/firestore/metrics";
import { useDashboard } from "./DashboardProvider";
import type { Project, Task } from "@/lib/firestore/types";

export function ProjectCard({
  project,
  tasks,
  onEdit,
  onArchive,
  onDelete,
}: {
  project: Project;
  tasks: Task[];
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const { memberProfiles } = useDashboard();
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = projectProgress(tasks, project.id);
  const owner = memberProfiles[project.ownerId];

  return (
    <div className="surface relative flex flex-col rounded-xl p-4 transition-shadow hover:shadow-md" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/dashboard/projects/${project.id}`} className="block truncate text-sm font-semibold hover:opacity-70">
            {project.name}
          </Link>
          <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            {project.description || "No description"}
          </p>
        </div>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded p-1 hover:opacity-70"
          aria-label={`Actions for ${project.name}`}
          aria-expanded={menuOpen}
        >
          <MoreHorizontal className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
        </button>
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden />
          <div
            className="absolute right-3 top-12 z-50 w-44 rounded-lg border p-1 shadow-lg"
            style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
            role="menu"
          >
            <Link href={`/dashboard/projects/${project.id}`} className="block rounded px-2 py-1.5 text-sm hover:opacity-70" onClick={() => setMenuOpen(false)} role="menuitem">
              Open project
            </Link>
            <button
              className="block w-full rounded px-2 py-1.5 text-left text-sm hover:opacity-70"
              onClick={() => {
                setMenuOpen(false);
                onEdit();
              }}
              role="menuitem"
            >
              Edit details
            </button>
            <button
              className="block w-full rounded px-2 py-1.5 text-left text-sm hover:opacity-70"
              onClick={() => {
                setMenuOpen(false);
                onArchive();
              }}
              role="menuitem"
            >
              {project.status === "archived" ? "Unarchive" : "Archive"}
            </button>
            <button
              className="block w-full rounded px-2 py-1.5 text-left text-sm hover:opacity-70"
              style={{ color: "var(--color-danger)" }}
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              role="menuitem"
            >
              <Trash2 className="mr-1.5 inline h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
        <ProjectStatusBadge status={project.status} />
        <span className="inline-flex items-center gap-1">
          <FolderKanban className="h-3 w-3" aria-hidden />
          {progress.done}/{progress.total} tasks
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarRange className="h-3 w-3" aria-hidden />
          {formatDate(project.dueDate)}
        </span>
      </div>

      <div className="mt-3">
        <ProgressBar value={progress.percent} label={`${project.name} progress`} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs" style={{ color: "var(--color-muted-foreground)" }}>
        <span>Owner: {owner?.displayName ?? owner?.email ?? "Unassigned"}</span>
        <span>Updated {relativeTime(project.updatedAt)}</span>
      </div>
    </div>
  );
}
