"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create project");
        return;
      }

      const data = await res.json();
      router.push(`/projects/${data.project.id}`);
    } catch {
      setError("Failed to create project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>New Project</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Create a new project</p>
        </div>

        <form onSubmit={handleSubmit} className="surface rounded-xl p-8 space-y-6" style={{ border: "1px solid var(--color-border)" }}>
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(220, 38, 38, 0.1)", color: "var(--color-danger)", border: "1px solid rgba(220, 38, 38, 0.2)" }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="label">Name</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="My Project" />
          </div>

          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" rows={4} placeholder="A brief description of the project..." />
          </div>

          <div>
            <label htmlFor="status" className="label">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value as "active" | "archived")} className="input-field">
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Creating..." : "Create Project"}
            </button>
            <Link href="/projects" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
