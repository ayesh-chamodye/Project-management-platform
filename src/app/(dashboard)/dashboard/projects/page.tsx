"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { CreateProjectDialog } from "@/components/dashboard/CreateProjectDialog";
import { ConfirmDialog, Modal } from "@/components/dashboard/Modal";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/dashboard/Toast";
import { archiveProject, deleteProject, updateProject } from "@/lib/firestore/projects";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/firestore/types";
import { projectProgress } from "@/lib/firestore/metrics";

type SortKey = "recent" | "deadline" | "name";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, tasks, refresh } = useDashboard();
  const { user } = useAuth();
  const { workspace } = useDashboard();
  const { toast } = useToast();

  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("recent");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const visible = useMemo(() => {
    const filtered = statusFilter === "all" ? projects : projects.filter((p) => p.status === statusFilter);

    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "deadline") return (a.dueDate?.toMillis() ?? Infinity) - (b.dueDate?.toMillis() ?? Infinity);
      return (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0);
    });
  }, [projects, statusFilter, sort]);

  const editTarget = projects.find((p) => p.id === editing) ?? null;
  const deleteTarget = projects.find((p) => p.id === deleting) ?? null;
  const archiveTarget = projects.find((p) => p.id === archiving) ?? null;

  async function handleSaveEdit() {
    if (!workspace || !user || !editing) return;
    setBusy(true);
    try {
      await updateProject(editing, workspace.id, user.uid, { name: editName.trim(), description: editDescription.trim() });
      await refresh();
      setEditing(null);
      toast("Project updated");
    } catch {
      toast("Failed to update project", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleArchive() {
    if (!workspace || !user || !archiveTarget) return;
    setBusy(true);
    try {
      await archiveProject(archiveTarget.id, workspace.id, user.uid, archiveTarget.name);
      await refresh();
      setArchiving(null);
      toast(archiveTarget.status === "archived" ? "Project restored" : "Project archived");
    } catch {
      toast("Failed to update project", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!workspace || !user || !deleteTarget) return;
    setBusy(true);
    try {
      await deleteProject(deleteTarget.id, workspace.id, user.uid, deleteTarget.name);
      await refresh();
      setDeleting(null);
      toast("Project deleted");
    } catch {
      toast("Failed to delete project", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Projects"
        description="Track progress, deadlines, and tasks for every project in this workspace."
        actions={
          <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm">
            <Plus className="h-4 w-4" />
            Create project
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {(["all", "active", "completed", "archived"] as const).map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{
                  borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                  backgroundColor: active ? "var(--color-primary)" : "transparent",
                  color: active ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
                }}
              >
                {status === "all" ? "All" : PROJECT_STATUS_LABELS[status]}
              </button>
            );
          })}
        </div>

        <label className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          Sort by
          <select className="input-field w-40 py-1 text-xs" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="recent">Recent activity</option>
            <option value="deadline">Deadline</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-5 w-5" style={{ color: "var(--color-muted-foreground)" }} />}
          title={statusFilter === "all" ? "No projects yet" : `No ${PROJECT_STATUS_LABELS[statusFilter as ProjectStatus].toLowerCase()} projects`}
          description="Projects group your tasks and track completion. Create one to get started."
          action={
            <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm">
              <Plus className="h-4 w-4" />
              Create project
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasks}
              onEdit={() => {
                setEditName(project.name);
                setEditDescription(project.description);
                setEditing(project.id);
              }}
              onArchive={() => setArchiving(project.id)}
              onDelete={() => setDeleting(project.id)}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => {
          refresh();
          router.push(`/dashboard/projects/${id}`);
        }}
      />

      <Modal
        open={!!editTarget}
        onClose={() => setEditing(null)}
        title="Edit project"
        footer={
          <>
            <button onClick={() => setEditing(null)} className="btn-secondary text-sm" disabled={busy}>
              Cancel
            </button>
            <button onClick={handleSaveEdit} className="btn-primary text-sm" disabled={busy || !editName.trim()}>
              Save changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="edit-name">
              Name
            </label>
            <input id="edit-name" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="edit-description">
              Description
            </label>
            <textarea id="edit-description" className="input-field min-h-20" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!archiveTarget}
        title={archiveTarget?.status === "archived" ? "Restore project" : "Archive project"}
        description={`“${archiveTarget?.name}” will be ${archiveTarget?.status === "archived" ? "marked active" : "archived and hidden from the default list"}. Tasks are kept.`}
        confirmLabel={archiveTarget?.status === "archived" ? "Restore" : "Archive"}
        busy={busy}
        onConfirm={handleArchive}
        onCancel={() => setArchiving(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project"
        description={`“${deleteTarget?.name}” and its ${deleteTarget ? projectProgress(tasks, deleteTarget.id).total : 0} tasks will be permanently deleted.`}
        confirmLabel="Delete project"
        destructive
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
