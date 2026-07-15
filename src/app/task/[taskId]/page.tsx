"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { ArrowLeft, Send, Paperclip, Activity, Plus, GripVertical, Clock, GitBranch, Flag, Tag, X } from "lucide-react";

export default function TaskPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [labels, setLabels] = useState<any[]>([]);
  const [taskLabels, setTaskLabels] = useState<any[]>([]);
  const [availableLabels, setAvailableLabels] = useState<any[]>([]);
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "attachments" | "activity" | "subtasks" | "time" | "dependencies">("details");
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((res) => res.json())
      .then((data) => setTask(data.task));
    fetch(`/api/comments?taskId=${taskId}`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []));
    fetch(`/api/attachments?taskId=${taskId}`)
      .then((res) => res.json())
      .then((data) => setAttachments(data.attachments || []));
    fetch(`/api/activity-logs?entityType=task&entityId=${taskId}`)
      .then((res) => res.json())
      .then((data) => setActivities(data.logs || []));
    fetch(`/api/subtasks?parentId=${taskId}`)
      .then((res) => res.json())
      .then((data) => setSubtasks(data.subtasks || []));
    fetch(`/api/time-entries?taskId=${taskId}`)
      .then((res) => res.json())
      .then((data) => setTimeEntries(data.timeEntries || []));
    fetch(`/api/task-dependencies?taskId=${taskId}`)
      .then((res) => res.json())
      .then((data) => setDependencies(data.dependencies || []));
    fetch(`/api/labels?taskId=${taskId}`)
      .then((res) => res.json())
      .then((data) => {
        setLabels(data.labels || []);
        setTaskLabels(data.labels || []);
      });
    if (task) {
      fetch(`/api/labels?workspaceId=${task.workspace_id}`)
        .then((res) => res.json())
        .then((data) => setAvailableLabels(data.labels || []));
    }
  }, [taskId, task]);

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSending(true);
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, message: newComment }),
    });
    setNewComment("");
    const res = await fetch(`/api/comments?taskId=${taskId}`);
    const data = await res.json();
    setComments(data.comments || []);
    setSending(false);
  }

  async function handleAddSubtask(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const res = await fetch("/api/subtasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: taskId, title: newSubtask }),
    });
    if (res.ok) {
      setNewSubtask("");
      const data = await res.json();
      setSubtasks([...subtasks, data.subtask]);
    }
  }

  async function handleAddLabel(labelId: string) {
    const res = await fetch("/api/task-labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, labelId }),
    });
    if (res.ok) {
      const label = availableLabels.find((l: any) => l.id === labelId);
      if (label) {
        setTaskLabels([...taskLabels, label]);
      }
      setShowAddLabel(false);
    }
  }

  async function handleRemoveLabel(labelId: string) {
    await fetch(`/api/task-labels?taskId=${taskId}&labelId=${labelId}`, { method: "DELETE" });
    setTaskLabels(taskLabels.filter((l: any) => l.id !== labelId));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("file", file);
    const res = await fetch("/api/attachments", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setAttachments([...attachments, data.attachment]);
    }
  }

  const tabs = [
    { key: "details", label: "Details", icon: Activity },
    { key: "comments", label: "Comments", icon: Send },
    { key: "attachments", label: "Attachments", icon: Paperclip },
    { key: "subtasks", label: "Subtasks", icon: Plus },
    { key: "time", label: "Time", icon: Clock },
    { key: "dependencies", label: "Dependencies", icon: GitBranch },
  ] as const;

  if (!task) return <AppShell><div className="p-8">Loading...</div></AppShell>;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/workspace/dashboard" className="btn-secondary">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-foreground)" }}>{task.title}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>{task.description || "No description provided."}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {taskLabels.map((label: any) => (
            <span key={label.id} className="text-xs px-2 py-1 rounded-md inline-flex items-center gap-1" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
              {label.name}
              <button onClick={() => handleRemoveLabel(label.id)} className="hover:opacity-75">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button onClick={() => setShowAddLabel(!showAddLabel)} className="text-xs px-2 py-1 rounded-md border border-dashed" style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}>
            <Plus className="h-3 w-3" />
          </button>
          {showAddLabel && (
            <div className="relative">
              <select
                onChange={(e) => { if (e.target.value) handleAddLabel(e.target.value); }}
                className="text-xs px-2 py-1 rounded-md"
                style={{ backgroundColor: "var(--color-background)", color: "var(--color-foreground)", border: "1px solid var(--color-border)" }}
                defaultValue=""
              >
                <option value="">Select label</option>
                {availableLabels.filter((l: any) => !taskLabels.find((tl: any) => tl.id === l.id)).map((label: any) => (
                  <option key={label.id} value={label.id}>{label.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="surface rounded-xl p-6">
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            <span className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)" }}>Priority: {task.priority}</span>
            <span className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)" }}>Status: {task.status}</span>
            {task.due_date && <span className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)" }}>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
            {task.assigneeName && <span className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)" }}>Assignee: {task.assigneeName}</span>}
            {task.estimate && <span className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)" }}>Estimate: {task.estimate}h</span>}
          </div>
        </div>

        <div className="surface rounded-xl p-6">
          <div className="flex gap-4 border-b mb-4" style={{ borderColor: "var(--color-border)" }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="pb-3 text-sm font-medium flex items-center gap-2 transition-colors"
                style={{ color: activeTab === tab.key ? "var(--color-primary)" : "var(--color-muted-foreground)", borderBottom: activeTab === tab.key ? "2px solid var(--color-primary)" : "none" }}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "details" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2" style={{ color: "var(--color-foreground)" }}>Description</h3>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>{task.description || "No description provided."}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2" style={{ color: "var(--color-foreground)" }}>Labels</h3>
                <div className="flex flex-wrap gap-2">
                  {taskLabels.length === 0 ? (
                    <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>No labels</p>
                  ) : (
                    taskLabels.map((label: any) => (
                      <span key={label.id} className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
                        {label.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              <form onSubmit={handleAddComment} className="mb-6">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="input-field mb-3" rows={3} required />
                <button type="submit" disabled={sending} className="btn-primary">
                  <Send className="h-4 w-4" />
                  {sending ? "Sending..." : "Add Comment"}
                </button>
              </form>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-4 rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
                    <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{comment.userName || "User"}</p>
                    <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>{comment.message}</p>
                    <p className="text-xs mt-2" style={{ color: "var(--color-muted-foreground)" }}>{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                ))}
                {comments.length === 0 && <p className="text-sm text-center py-6" style={{ color: "var(--color-muted-foreground)" }}>No comments yet.</p>}
              </div>
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="space-y-4">
              <div>
                <label className="btn-secondary cursor-pointer inline-flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Upload File
                  <input type="file" onChange={handleUpload} className="hidden" />
                </label>
              </div>
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
                      <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                        {attachment.fileName}
                      </a>
                    </div>
                    <button onClick={async () => { await fetch(`/api/attachments/${attachment.id}`, { method: "DELETE" }); setAttachments(attachments.filter((a) => a.id !== attachment.id)); }} className="text-xs px-2 py-1 rounded" style={{ color: "var(--color-danger)" }}>
                      Remove
                    </button>
                  </div>
                ))}
                {attachments.length === 0 && <p className="text-sm text-center py-6" style={{ color: "var(--color-muted-foreground)" }}>No attachments yet.</p>}
              </div>
            </div>
          )}

          {activeTab === "subtasks" && (
            <div className="space-y-4">
              <form onSubmit={handleAddSubtask} className="flex gap-3">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add subtask..."
                  className="input-field flex-1"
                  required
                />
                <button type="submit" className="btn-primary">
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </form>
              <div className="space-y-3">
                {subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center justify-between p-3 rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{subtask.title}</p>
                      <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Status: {subtask.status}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-md capitalize" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
                      {subtask.status}
                    </span>
                  </div>
                ))}
                {subtasks.length === 0 && <p className="text-sm text-center py-6" style={{ color: "var(--color-muted-foreground)" }}>No subtasks yet.</p>}
              </div>
            </div>
          )}

          {activeTab === "time" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-muted-foreground)" }}>Total Time</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--color-foreground)" }}>{timeEntries.reduce((sum, entry) => sum + (parseFloat(entry.duration || "0")), 0)}h</p>
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--color-muted-foreground)" }}>Estimate</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--color-foreground)" }}>{task.estimate || "0"}h</p>
                </div>
              </div>
              <div className="space-y-3">
                {timeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{entry.description || "Time entry"}</p>
                      <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{new Date(entry.startTime).toLocaleString()}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
                      {entry.duration}h
                    </span>
                  </div>
                ))}
                {timeEntries.length === 0 && <p className="text-sm text-center py-6" style={{ color: "var(--color-muted-foreground)" }}>No time entries yet.</p>}
              </div>
            </div>
          )}

          {activeTab === "dependencies" && (
            <div className="space-y-4">
              <div className="space-y-3">
                {dependencies.map((dep) => (
                  <div key={dep.id} className="flex items-center justify-between p-3 rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{dep.dependsOnTitle}</p>
                        <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{dep.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {dependencies.length === 0 && <p className="text-sm text-center py-6" style={{ color: "var(--color-muted-foreground)" }}>No dependencies yet.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
