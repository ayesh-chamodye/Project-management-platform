"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, MoreVertical, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Column {
  id: string;
  name: string;
  color?: string;
  position: string;
  boardId: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  position: string;
  dueDate?: string;
  assigneeId?: string;
  columnId: string;
}

interface KanbanBoardProps {
  workspaceId: string;
  projectId: string;
  boardId: string;
}

export function KanbanBoard({ workspaceId, projectId, boardId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoardData = useCallback(async () => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/columns?boardId=${boardId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setColumns(data.columns || []);
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Failed to fetch board data:", error);
    } finally {
      setLoading(false);
    }
  }, [boardId, workspaceId]);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  function getTasksForColumn(columnId: string) {
    return tasks.filter((t) => t.columnId === columnId);
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {columns.map((column) => {
        const columnTasks = getTasksForColumn(column.id);

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 surface rounded-xl p-4"
            style={{ border: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold" style={{ color: "var(--color-foreground)" }}>
                  {column.name}
                </h3>
                <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>
                  {columnTasks.length} {columnTasks.length === 1 ? "task" : "tasks"}
                </p>
              </div>
              <button
                className="p-1 rounded hover:opacity-80"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} getPriorityColor={getPriorityColor} />
              ))}
            </div>

            <button
              className="w-full mt-3 py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 text-sm hover:opacity-80 transition-colors"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}
            >
              <Plus className="h-4 w-4" />
              Add task
            </button>
          </div>
        );
      })}
    </div>
  );
}

function TaskCard({ task, getPriorityColor }: { task: Task; getPriorityColor: (priority: string) => string }) {
  return (
    <div
      className="surface rounded-lg p-4 cursor-move"
      style={{ border: "1px solid var(--color-border)" }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
          {task.title}
        </h4>
        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--color-muted-foreground)" }}>
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-muted-foreground)" }}>
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(task.dueDate))}
            </span>
          )}
        </div>

        {task.assigneeId && (
          <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
            U
          </div>
        )}
      </div>
    </div>
  );
}
