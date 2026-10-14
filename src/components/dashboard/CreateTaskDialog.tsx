"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Spinner } from "./ui";
import { createTask } from "@/lib/firestore/tasks";
import { useDashboard } from "./DashboardProvider";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "./Toast";
import { TASK_PRIORITY_LABELS, TASK_STATUSES, TASK_STATUS_LABELS, type TaskPriority, type TaskStatus } from "@/lib/firestore/types";

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultStatus?: TaskStatus;
  onCreated?: (taskId: string) => void;
}

export function CreateTaskDialog({ open, onClose, defaultProjectId, defaultStatus = "todo", onCreated }: CreateTaskDialogProps) {
  const { workspace, projects, members, memberProfiles, refresh } = useDashboard();
  const { user } = useAuth();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  const memberOptions = members.filter((m) => m.userId !== user?.uid);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspace || !user || !title.trim()) return;

    const targetProjectId = projectId || defaultProjectId || projects[0]?.id;
    if (!targetProjectId) {
      toast("Create a project first", "error");
      return;
    }

    setSaving(true);
    try {
      const id = await createTask({
        workspaceId: workspace.id,
        projectId: targetProjectId,
        userId: user.uid,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      });
      await refresh();
      toast("Task created");
      setTitle("");
      setDescription("");
      setDueDate("");
      onClose();
      onCreated?.(id);
    } catch (err) {
      console.error(err);
      toast("Failed to create task", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create task"
      description="Add a task to one of your projects."
      wide
      footer={
        <>
          <button onClick={onClose} className="btn-secondary text-sm" disabled={saving}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary text-sm" disabled={saving || !title.trim() || !projectId}>
            {saving ? <Spinner className="h-3.5 w-3.5" /> : null}
            Create task
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="task-title">
            Title
          </label>
          <input
            id="task-title"
            className="input-field"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Fix login redirect bug"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="label" htmlFor="task-description">
            Description
          </label>
          <textarea
            id="task-description"
            className="input-field min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional details"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="task-project">
              Project
            </label>
            <select id="task-project" className="input-field" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="task-status">
              Status
            </label>
            <select id="task-status" className="input-field" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {TASK_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="task-priority">
              Priority
            </label>
            <select id="task-priority" className="input-field" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="task-due">
              Due date
            </label>
            <input id="task-due" type="date" className="input-field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="task-assignee">
              Assignee
            </label>
            <select id="task-assignee" className="input-field" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {user && <option value={user.uid}>{memberProfiles[user.uid]?.displayName ?? "Me"} ({user.email})</option>}
              {memberOptions.map((m) => (
                <option key={m.id} value={m.userId}>
                  {memberProfiles[m.userId]?.displayName ?? memberProfiles[m.userId]?.email ?? m.userId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
