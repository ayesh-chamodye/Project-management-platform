"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { Spinner } from "./ui";
import { createProject } from "@/lib/firestore/projects";
import { useDashboard } from "./DashboardProvider";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "./Toast";

export function CreateProjectDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: (projectId: string) => void }) {
  const { workspace, refresh } = useDashboard();
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspace || !user || !name.trim()) return;

    setSaving(true);
    try {
      const id = await createProject(workspace.id, user.uid, {
        name: name.trim(),
        description: description.trim(),
        dueDate: dueDate ? new Date(dueDate) : null,
      });
      await refresh();
      toast("Project created");
      setName("");
      setDescription("");
      setDueDate("");
      onClose();
      onCreated?.(id);
    } catch (err) {
      console.error(err);
      toast("Failed to create project", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create project"
      description="Projects group tasks and track progress in this workspace."
      footer={
        <>
          <button onClick={onClose} className="btn-secondary text-sm" disabled={saving}>
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-primary text-sm" disabled={saving || !name.trim()}>
            {saving ? <Spinner className="h-3.5 w-3.5" /> : null}
            Create project
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="project-name">
            Name
          </label>
          <input
            id="project-name"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Website redesign"
            required
            autoFocus
          />
        </div>
        <div>
          <label className="label" htmlFor="project-description">
            Description
          </label>
          <textarea
            id="project-description"
            className="input-field min-h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
          />
        </div>
        <div>
          <label className="label" htmlFor="project-due">
            Due date
          </label>
          <input id="project-due" type="date" className="input-field" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
