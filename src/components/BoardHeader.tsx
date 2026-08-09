"use client";

import { MoreVertical, Users, Calendar, Trash2 } from "lucide-react";

interface BoardHeaderProps {
  project: any;
  board: any;
}

export function BoardHeader({ project, board }: BoardHeaderProps) {
  return (
    <header className="h-16 surface border-b flex items-center justify-between px-6" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-center gap-4">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: project.color || "#6366f1" }}
        />
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--color-foreground)" }}>
            {project.name}
          </h1>
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            {board.name}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg hover:opacity-80"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <Users className="h-5 w-5" />
        </button>
        <button
          className="p-2 rounded-lg hover:opacity-80"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <Calendar className="h-5 w-5" />
        </button>
        <button
          className="p-2 rounded-lg hover:opacity-80"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
