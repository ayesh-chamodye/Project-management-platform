"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

export default function TaskPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetch(`/api/tasks/${taskId}`)
      .then((res) => res.json())
      .then((data) => setTask(data.task));
  }, [taskId]);

  useEffect(() => {
    if (!taskId) return;
    fetch(`/api/comments?taskId=${taskId}`)
      .then((res) => res.json())
      .then((data) => setComments(data.comments || []));
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
          </div>
        </div>

        <div className="surface rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Comments</h3>
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="input-field mb-3"
              rows={3}
              required
            />
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
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-center py-6" style={{ color: "var(--color-muted-foreground)" }}>No comments yet.</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
