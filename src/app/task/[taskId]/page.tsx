"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { ArrowLeft, Send, Paperclip, Activity } from "lucide-react";

export default function TaskPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"comments" | "attachments" | "activity">("comments");
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
  }, [taskId]);

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
    { key: "comments", label: "Comments", icon: Send },
    { key: "attachments", label: "Attachments", icon: Paperclip },
    { key: "activity", label: "Activity", icon: Activity },
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

        <div className="surface rounded-xl p-6">
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            <span className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)" }}>Priority: {task.priority}</span>
            <span className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)" }}>Status: {task.status}</span>
            {task.due_date && <span className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)" }}>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
            {task.assigneeName && <span className="px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)" }}>Assignee: {task.assigneeName}</span>}
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

          {activeTab === "activity" && (
            <div className="space-y-4">
              {activities.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
                  <Activity className="h-4 w-4 mt-0.5" style={{ color: "var(--color-muted-foreground)" }} />
                  <div>
                    <p className="text-sm" style={{ color: "var(--color-foreground)" }}>{log.userName} {log.action} this task</p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-muted-foreground)" }}>{new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && <p className="text-sm text-center py-6" style={{ color: "var(--color-muted-foreground)" }}>No activity yet.</p>}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
