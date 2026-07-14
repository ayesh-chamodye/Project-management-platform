"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function TaskPage() {
  const params = useParams();
  const taskId = params.taskId as string;
  const [task, setTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
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
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, message: newComment }),
    });
    setNewComment("");
    const res = await fetch(`/api/comments?taskId=${taskId}`);
    const data = await res.json();
    setComments(data.comments || []);
  }

  if (!task) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <nav className="bg-white dark:bg-zinc-900 shadow p-4">
        <h1 className="text-xl font-bold">Task Details</h1>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-4">{task.title}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{task.description}</p>
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Priority: {task.priority}</span>
            <span>Status: {task.status}</span>
            {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
          </div>
        </div>
        <div className="mt-8 bg-white dark:bg-zinc-900 rounded-lg shadow p-8">
          <h3 className="text-lg font-semibold mb-4">Comments</h3>
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" rows={3} placeholder="Add a comment..." />
            <button type="submit" className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded">Add Comment</button>
          </form>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <p className="text-sm text-gray-500">{comment.userName}</p>
                <p className="text-gray-900 dark:text-white">{comment.message}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
