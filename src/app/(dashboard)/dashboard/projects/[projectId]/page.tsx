"use client";

import { useEffect, useMemo, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KanbanSquare, List, Trash2 } from "lucide-react";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { TaskRow } from "@/components/dashboard/TaskRow";
import { CreateTaskDialog } from "@/components/dashboard/CreateTaskDialog";
import { ConfirmDialog, Modal } from "@/components/dashboard/Modal";
import { EmptyState, ErrorState, LoadingSkeleton, PageHeader, PriorityBadge, ProjectStatusBadge, ProgressBar, Spinner } from "@/components/dashboard/ui";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/dashboard/Toast";
import { getProject, archiveProject, deleteProject, updateProject } from "@/lib/firestore/projects";
import { deleteTask, updateTask } from "@/lib/firestore/tasks";
import { projectProgress } from "@/lib/firestore/metrics";
import { TASK_PRIORITY_LABELS, TASK_STATUSES, TASK_STATUS_LABELS, type Task, type TaskPriority, type TaskStatus } from "@/lib/firestore/types";

export default function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const router = useRouter();
  const { workspace, tasks, projects, memberProfiles, members, refresh, loading, error } = useDashboard();
  const { user } = useAuth();
  const { toast } = useToast();

  const [view, setView] = useState<"board" | "list">("board");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const project = useMemo(() => {
    const fromList = projects.find((p) => p.id === projectId);
    return fromList ?? null;
  }, [projects, projectId]);

  const projectTasks = useMemo(
    () => tasks.filter((t) => t.projectId === projectId).sort((a, b) => a.position - b.position),
    [tasks, projectId]
  );

  const progress = useMemo(() => projectProgress(tasks, projectId), [tasks, projectId]);

  // Fall back to a direct fetch for projects not in the loaded list (e.g. deep link).
  useEffect(() => {
    if (!project && !loading && projectId) {
      getProject(projectId).then((p) => {
        if (p && !projects.some((existing) => existing.id === p.id)) {
          refresh();
        }
      });
    }
  }, [project, loading, projectId, projects, refresh]);

  function openTask(task: Task) {
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeId(task.assigneeId ?? "");
    setDueDate(task.dueDate ? new Date(task.dueDate.toMillis()).toISOString().slice(0, 10) : "");
    setEditingTask(task);
  }

  async function handleSaveTask() {
    if (!workspace || !user || !editingTask) return;
    setBusy(true);
    try {
      await updateTask(
        editingTask.id,
        workspace.id,
        user.uid,
        {
          title: title.trim(),
          description,
          status,
          priority,
          assigneeId: assigneeId || null,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
        editingTask.title
      );
      await refresh();
      setEditingTask(null);
      toast("Task updated");
    } catch {
      toast("Failed to update task", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteTask() {
    if (!workspace || !user || !deletingTask) return;
    setBusy(true);
    try {
      await deleteTask(deletingTask.id, workspace.id, user.uid, deletingTask.title);
      await refresh();
      setDeletingTask(null);
      toast("Task deleted");
    } catch {
      toast("Failed to delete task", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    if (!workspace || !user || !project) return;
    setBusy(true);
    try {
      await archiveProject(project.id, workspace.id, user.uid, project.name);
      await refresh();
      setArchiving(false);
      toast(project.status === "archived" ? "Project restored" : "Project archived");
    } catch {
      toast("Failed to update project", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteProject() {
    if (!workspace || !user || !project) return;
    setBusy(true);
    try {
      await deleteProject(project.id, workspace.id, user.uid, project.name);
      await refresh();
      toast("Project deleted");
      router.push("/dashboard/projects");
    } catch {
      toast("Failed to delete project", "error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={2} />
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={refresh} />;

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="This project may have been deleted, or you may not have access to it."
        action={
          <Link href="/dashboard/projects" className="btn-secondary text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        }
      />
    );
  }

  const owner = memberProfiles[project.ownerId];

  return (
    <div className="space-y-5">
      <Link href="/dashboard/projects" className="inline-flex items-center gap-1.5 text-sm hover:opacity-70" style={{ color: "var(--color-muted-foreground)" }}>
        <ArrowLeft className="h-3.5 w-3.5" />
        Projects
      </Link>

      <PageHeader
        title={project.name}
        description={project.description || "No description"}
        actions={
          <>
            <div className="flex overflow-hidden rounded-lg border" style={{ borderColor: "var(--color-border)" }}>
              <button
                onClick={() => setView("board")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: view === "board" ? "var(--color-primary)" : "transparent",
                  color: view === "board" ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
                }}
              >
                <KanbanSquare className="h-3.5 w-3.5" />
                Board
              </button>
              <button
                onClick={() => setView("list")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: view === "list" ? "var(--color-primary)" : "transparent",
                  color: view === "list" ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
                }}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
            </div>

            <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm">
              Add task
            </button>

            <button onClick={() => setArchiving(true)} className="btn-secondary text-sm">
              {project.status === "archived" ? "Restore" : "Archive"}
            </button>

            <button
              onClick={handleDeleteProject}
              className="btn-secondary text-sm"
              style={{ color: "var(--color-danger)" }}
              aria-label={`Delete ${project.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        }
      />

      <div className="surface flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2">
          <ProjectStatusBadge status={project.status} />
          <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            {progress.done}/{progress.total} tasks done
          </span>
        </div>
        <div className="w-40">
          <ProgressBar value={progress.percent} label="Project progress" />
        </div>
        <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          Owner: {owner?.displayName ?? owner?.email ?? "Unassigned"}
        </span>
        <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          Members: {members.length}
        </span>
      </div>

      {projectTasks.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Add the first task to this project to start tracking work."
          action={
            <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm">
              Add task
            </button>
          }
        />
      ) : view === "board" ? (
        <KanbanBoard projectId={projectId} onEditTask={openTask} />
      ) : (
        <ul className="surface divide-y overflow-hidden rounded-xl" style={{ borderColor: "var(--color-border)" }}>
          {projectTasks.map((task) => (
            <TaskRow key={task.id} task={task} showProject={false} onChanged={refresh} />
          ))}
        </ul>
      )}

      <CreateTaskDialog open={createOpen} onClose={() => setCreateOpen(false)} defaultProjectId={projectId} onCreated={refresh} />

      <Modal
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit task"
        footer={
          <>
            <button onClick={() => setDeletingTask(editingTask)} className="mr-auto text-sm hover:opacity-70" style={{ color: "var(--color-danger)" }}>
              <Trash2 className="mr-1 inline h-3.5 w-3.5" />
              Delete
            </button>
            <button onClick={() => setEditingTask(null)} className="btn-secondary text-sm" disabled={busy}>
              Cancel
            </button>
            <button onClick={handleSaveTask} className="btn-primary text-sm" disabled={busy || !title.trim()}>
              {busy ? <Spinner className="h-3.5 w-3.5" /> : null}
              Save changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="edit-task-title">
              Title
            </label>
            <input id="edit-task-title" className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="edit-task-description">
              Description
            </label>
            <textarea id="edit-task-description" className="input-field min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="edit-task-status">
                Status
              </label>
              <select id="edit-task-status" className="input-field" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {TASK_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="edit-task-priority">
                Priority
              </label>
              <select id="edit-task-priority" className="input-field" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
                {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {TASK_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="edit-task-due">
                Due date
              </label>
              <input id="edit-task-due" type="date" className="input-field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="edit-task-assignee">
                Assignee
              </label>
              <select id="edit-task-assignee" className="input-field" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.userId}>
                    {memberProfiles[m.userId]?.displayName ?? memberProfiles[m.userId]?.email ?? m.userId}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <PriorityBadge priority={priority} />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deletingTask}
        title="Delete task"
        description={`“${deletingTask?.title}” will be permanently deleted.`}
        confirmLabel="Delete task"
        destructive
        busy={busy}
        onConfirm={handleDeleteTask}
        onCancel={() => setDeletingTask(null)}
      />

      <ConfirmDialog
        open={archiving}
        title={project.status === "archived" ? "Restore project" : "Archive project"}
        description={`“${project.name}” will be ${project.status === "archived" ? "marked active" : "archived"}. Tasks are kept.`}
        confirmLabel={project.status === "archived" ? "Restore" : "Archive"}
        busy={busy}
        onConfirm={handleArchive}
        onCancel={() => setArchiving(false)}
      />
    </div>
  );
}
