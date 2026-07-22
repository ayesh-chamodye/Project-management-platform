"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, X, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type Priority = "low" | "medium" | "high" | "urgent";

interface Column {
  id: string;
  name: string;
  color?: string;
  position: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: string;
  position: number;
  dueDate?: string;
  assigneeId?: string;
  columnId: string;
  assigneeName?: string;
}

interface Member {
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  role: string;
}

export default function BoardPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;

  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskComments, setTaskComments] = useState<Array<{ id: string; content: string; author?: { name?: string }; created_at: string }>>([]);
  const [taskAttachments, setTaskAttachments] = useState<Array<{ id: string; name: string; url: string }>>([]);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newComment, setNewComment] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getTasksByColumn = (columnId: string) => {
    return tasks.filter((t) => t.columnId === columnId).sort((a, b) => a.position - b.position);
  };

  useEffect(() => {
    fetchBoardData();
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, projectId]);

  async function fetchBoardData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}`);
      const data = await res.json();
      if (data.boards && data.boards.length > 0) {
        const boardId = data.boards[0].id;
        const boardRes = await fetch(`/api/workspaces/${workspaceId}/columns?boardId=${boardId}`);
        const boardData = await boardRes.json();
        setColumns(boardData.columns || []);
        setTasks(boardData.tasks || []);
      }
    } catch {}
    setLoading(false);
  }

  async function fetchMembers() {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`);
      const data = await res.json();
      if (data.members) setMembers(data.members);
    } catch {}
  }

  async function fetchTaskDetails(taskId: string) {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}`);
      const data = await res.json();
      setTaskComments(data.comments || []);
      setTaskAttachments(data.attachments || []);
    } catch {}
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskData = tasks.find((t) => t.id === active.id);
    if (!activeTaskData) return;

    let targetColumnId: string;
    let targetPosition: number;

    const overColumn = columns.find((c) => c.id === over.id);
    if (overColumn) {
      targetColumnId = overColumn.id;
      const columnTasks = getTasksByColumn(targetColumnId);
      targetPosition = columnTasks.length;
    } else {
      const overTask = tasks.find((t) => t.id === over.id);
      if (!overTask) return;
      targetColumnId = overTask.columnId;
      const columnTasks = getTasksByColumn(targetColumnId);
      const overIndex = columnTasks.findIndex((t) => t.id === over.id);
      targetPosition = overIndex;
    }

    setTasks((prev) => {
      const newTasks = prev.map((t) => {
        if (t.id === active.id) return { ...t, columnId: targetColumnId, position: targetPosition };
        return t;
      });
      return newTasks;
    });

    try {
      await fetch(`/api/workspaces/${workspaceId}/tasks/${active}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: targetColumnId, position: targetPosition }),
      });
    } catch {}
  };

  async function addTask(columnId: string) {
    const title = prompt("Task title:");
    if (!title) return;

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, columnId }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [...prev, data.task]);
      }
    } catch {}
  }

  async function addColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!newColumnName.trim()) return;

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newColumnName }),
      });

      if (res.ok) {
        setNewColumnName("");
        setShowAddColumn(false);
        fetchBoardData();
      }
    } catch {}
  }

  async function deleteColumn(columnId: string) {
    if (!confirm("Delete this column and all its tasks?")) return;

    try {
      await fetch(`/api/workspaces/${workspaceId}/columns/${columnId}`, { method: "DELETE" });
      fetchBoardData();
    } catch {}
  }

  async function openTask(task: Task) {
    setSelectedTask(task);
    setShowTaskModal(true);
    await fetchTaskDetails(task.id);
  }

  async function updateTask(taskId: string, updates: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...data.task } : t)));
        if (selectedTask?.id === taskId) {
          setSelectedTask({ ...selectedTask, ...data.task } as Task);
        }
      }
    } catch {}
  }

  async function deleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;

    try {
      await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch {}
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${selectedTask.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const data = await res.json();
        setTaskComments((prev) => [data.comment, ...prev]);
        setNewComment("");
      }
    } catch {}
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "high": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      case "medium": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-4">
          <Link href={`/workspace/${workspaceId}/projects`} className="text-sm text-gray-500 hover:text-gray-700">
            ← Projects
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Project: {projectId}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMembers(true)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Members
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 p-6 h-full">
            {columns.map((column) => {
              const columnTasks = getTasksByColumn(column.id);
              return (
                <div
                  key={column.id}
                  className="flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col max-h-full"
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color || "#6366f1" }}
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">{column.name}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({columnTasks.length})
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => addTask(column.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteColumn(column.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <SortableContext
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-3">
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => setActiveTask(task)}
                          onClick={() => openTask(task)}
                          className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex-1">
                              {task.title}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          {task.dueDate && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </div>
                          )}
                          {task.assigneeName && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-medium">
                                {task.assigneeName[0]}
                              </div>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {task.assigneeName}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </SortableContext>

                  <div className="p-3">
                    <button
                      onClick={() => addTask(column.id)}
                      className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      + Add task
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="flex-shrink-0 w-80">
              {showAddColumn ? (
                <form onSubmit={addColumn} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    placeholder="Column name..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    autoFocus
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddColumn(false); setNewColumnName(""); }}
                      className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddColumn(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                >
                  <Plus className="h-5 w-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Add Column</span>
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-lg border-2 border-indigo-500 opacity-90 w-80">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">{activeTask.title}</h4>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(activeTask.priority)}`}>
                  {activeTask.priority}
                </span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Task Details</h2>
              <button
                onClick={() => { setShowTaskModal(false); setSelectedTask(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={selectedTask.title}
                      onChange={(e) => updateTask(selectedTask.id, { title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={selectedTask.description || ""}
                      onChange={(e) => updateTask(selectedTask.id, { description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Comments ({taskComments.length})
                    </h3>
                    <div className="space-y-3 mb-4">
                      {taskComments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="h-6 w-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">
                              {comment.author?.name?.[0] || "U"}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {comment.author?.name || "Unknown"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(comment.created_at))} ago
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 ml-8">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={addComment} className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                      >
                        Post
                      </button>
                    </form>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={selectedTask.priority}
                      onChange={(e) => updateTask(selectedTask.id, { priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedTask.status}
                      onChange={(e) => updateTask(selectedTask.id, { status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assignee
                    </label>
                    <select
                      value={selectedTask.assigneeId || ""}
                      onChange={(e) => updateTask(selectedTask.id, { assigneeId: e.target.value || null })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Unassigned</option>
                      {members.map((member) => (
                        <option key={member.userId} value={member.userId}>
                          {member.userName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split("T")[0] : ""}
                      onChange={(e) => updateTask(selectedTask.id, { dueDate: e.target.value || null })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Attachments ({taskAttachments.length})
                    </h3>
                    <div className="space-y-2">
                      {taskAttachments.map((att) => (
                        <a
                          key={att.id}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-indigo-600 hover:underline"
                        >
                          📎 {att.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(selectedTask.id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Delete Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMembers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h2>
              <button onClick={() => setShowMembers(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                      {member.userName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.userName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{member.userEmail}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
