"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarCheck2, CheckCircle2, FolderKanban, ListChecks, Plus } from "lucide-react";
import { SectionCard, StatCard } from "@/components/dashboard/StatCard";
import { MyTasksList } from "@/components/dashboard/MyTasksList";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { UpcomingDeadlines, ActivityFeed } from "@/components/dashboard/UpcomingDeadlines";
import { CompletionTrendChart, StatusDonutChart } from "@/components/dashboard/charts";
import { EmptyState } from "@/components/dashboard/ui";
import { CreateProjectDialog } from "@/components/dashboard/CreateProjectDialog";
import { ConfirmDialog, Modal } from "@/components/dashboard/Modal";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAuth } from "@/components/AuthProvider";
import { computeMetrics, defaultPeriod, projectProgress } from "@/lib/firestore/metrics";
import { archiveProject, deleteProject, updateProject } from "@/lib/firestore/projects";
import { useToast } from "@/components/dashboard/Toast";

const PERIODS = [
  { days: 7, label: "7 days" },
  { days: 14, label: "14 days" },
  { days: 30, label: "30 days" },
];

export default function OverviewPage() {
  const { workspace, projects, tasks, memberProfiles, refresh } = useDashboard();
  const { user } = useAuth();
  const { toast } = useToast();
  const [periodDays, setPeriodDays] = useState(7);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [archivingProject, setArchivingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const activeProjects = useMemo(() => projects.filter((p) => p.status !== "archived"), [projects]);

  const metrics = useMemo(
    () => (user ? computeMetrics(projects, tasks, user.uid, defaultPeriod(periodDays)) : null),
    [projects, tasks, user, periodDays]
  );

  if (!metrics) return null;

  const editTarget = projects.find((p) => p.id === editingProject) ?? null;
  const deleteTarget = projects.find((p) => p.id === deletingProject) ?? null;
  const archiveTarget = projects.find((p) => p.id === archivingProject) ?? null;

  function openEdit(projectId: string) {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    setEditName(project.name);
    setEditDescription(project.description);
    setEditingProject(projectId);
  }

  async function handleSaveEdit() {
    if (!workspace || !user || !editingProject) return;
    setBusy(true);
    try {
      await updateProject(editingProject, workspace.id, user.uid, { name: editName.trim(), description: editDescription.trim() });
      await refresh();
      setEditingProject(null);
      toast("Project updated");
    } catch (err) {
      console.error(err);
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
      setArchivingProject(null);
      toast(archiveTarget.status === "archived" ? "Project restored" : "Project archived");
    } catch (err) {
      console.error(err);
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
      setDeletingProject(null);
      toast("Project deleted");
    } catch (err) {
      console.error(err);
      toast("Failed to delete project", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active Projects" value={metrics.activeProjects} icon={FolderKanban} hint="In progress or completed" />
        <StatCard label="My Open Tasks" value={metrics.myOpenTasks} icon={ListChecks} hint="Assigned to you" />
        <StatCard
          label={`Completed · ${periodDays}d`}
          value={metrics.completedInPeriod}
          icon={CheckCircle2}
          hint={`Last ${periodDays} days`}
        />
        <StatCard label="Overdue Tasks" value={metrics.overdueTasks} icon={AlertTriangle} hint="Past their due date" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="My Tasks"
            description="Tasks assigned to you across all projects"
            action={
              <Link href="/dashboard/tasks" className="text-xs font-medium hover:opacity-70" style={{ color: "var(--color-primary)" }}>
                View all
              </Link>
            }
          >
            <MyTasksList limit={6} showCreate={false} />
          </SectionCard>
        </div>

        <SectionCard
          title="Upcoming Deadlines"
          description="Soonest first, overdue flagged"
          action={
            <Link href="/dashboard/calendar" className="text-xs font-medium hover:opacity-70" style={{ color: "var(--color-primary)" }}>
              Calendar
            </Link>
          }
        >
          <UpcomingDeadlines />
        </SectionCard>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
            Projects
          </h2>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/projects" className="text-xs font-medium hover:opacity-70" style={{ color: "var(--color-primary)" }}>
              View all
            </Link>
            <button onClick={() => setCreateOpen(true)} className="btn-secondary text-xs">
              <Plus className="h-3.5 w-3.5" />
              New project
            </button>
          </div>
        </div>

        {activeProjects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban className="h-5 w-5" style={{ color: "var(--color-muted-foreground)" }} />}
            title="No projects yet"
            description="Create your first project to start tracking tasks and deadlines."
            action={
              <button onClick={() => setCreateOpen(true)} className="btn-primary text-sm">
                <Plus className="h-4 w-4" />
                Create project
              </button>
            }
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {activeProjects.slice(0, 6).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                tasks={tasks}
                onEdit={() => openEdit(project.id)}
                onArchive={() => setArchivingProject(project.id)}
                onDelete={() => setDeletingProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Recent Activity" description="Latest events in this workspace" action={
          <Link href="/dashboard/inbox" className="text-xs font-medium hover:opacity-70" style={{ color: "var(--color-primary)" }}>
            View all
          </Link>
        }>
          <ActivityFeed />
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="Task Status"
            description="Breakdown across the workspace"
            action={
              <select
                className="input-field w-28 py-1 text-xs"
                value={periodDays}
                onChange={(e) => setPeriodDays(Number(e.target.value))}
                aria-label="Reporting period"
              >
                {PERIODS.map((p) => (
                  <option key={p.days} value={p.days}>
                    {p.label}
                  </option>
                ))}
              </select>
            }
          >
            <StatusDonutChart data={metrics.statusBreakdown} />
          </SectionCard>

          <SectionCard title="Completion Trend" description={`Tasks completed in the last ${periodDays} days`}>
            <CompletionTrendChart data={metrics.completionTrend} />
          </SectionCard>
        </div>
      </div>

      <CreateProjectDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refresh} />

      <Modal
        open={!!editTarget}
        onClose={() => setEditingProject(null)}
        title="Edit project"
        footer={
          <>
            <button onClick={() => setEditingProject(null)} className="btn-secondary text-sm" disabled={busy}>
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
            <label className="label" htmlFor="edit-project-name">
              Name
            </label>
            <input id="edit-project-name" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="edit-project-description">
              Description
            </label>
            <textarea
              id="edit-project-description"
              className="input-field min-h-20"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!archiveTarget}
        title={archiveTarget?.status === "archived" ? "Restore project" : "Archive project"}
        description={
          archiveTarget?.status === "archived"
            ? `“${archiveTarget?.name}” will be marked as active again.`
            : `“${archiveTarget?.name}” will be archived and hidden from the default list. Tasks are kept.`
        }
        confirmLabel={archiveTarget?.status === "archived" ? "Restore" : "Archive"}
        busy={busy}
        onConfirm={handleArchive}
        onCancel={() => setArchivingProject(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete project"
        description={`“${deleteTarget?.name}” and all ${deleteTarget ? projectProgress(tasks, deleteTarget.id).total : 0} of its tasks will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete project"
        destructive
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeletingProject(null)}
      />

      <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
        <CalendarCheck2 className="mr-1 inline h-3 w-3" />
        {memberProfiles && workspace ? `All figures are calculated from ${workspace.name} data.` : ""}
      </p>
    </div>
  );
}
