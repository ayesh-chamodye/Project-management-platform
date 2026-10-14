"use client";

import { useMemo, useState } from "react";
import { ProgressBar } from "@/components/dashboard/ui";
import { SectionCard } from "@/components/dashboard/StatCard";
import { CompletionTrendChart, StatusDonutChart } from "@/components/dashboard/charts";
import { PageHeader } from "@/components/dashboard/ui";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAuth } from "@/components/AuthProvider";
import { computeMetrics, defaultPeriod, projectProgress } from "@/lib/firestore/metrics";

const PERIODS = [
  { days: 7, label: "Last 7 days" },
  { days: 14, label: "Last 14 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
];

export default function ReportsPage() {
  const { projects, tasks, workspace } = useDashboard();
  const { user } = useAuth();
  const [periodDays, setPeriodDays] = useState(30);

  const metrics = useMemo(
    () => (user ? computeMetrics(projects, tasks, user.uid, defaultPeriod(periodDays)) : null),
    [projects, tasks, user, periodDays]
  );

  const progressRows = useMemo(
    () =>
      projects
        .filter((p) => p.status !== "archived")
        .map((p) => ({ project: p, progress: projectProgress(tasks, p.id) }))
        .sort((a, b) => b.progress.percent - a.progress.percent),
    [projects, tasks]
  );

  if (!metrics) return null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description={`Analytics for ${workspace?.name ?? "this workspace"}. All figures come from real task records.`}
        actions={
          <select
            className="input-field w-40 py-1.5 text-sm"
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
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>Active projects</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{metrics.activeProjects}</p>
        </div>
        <div className="surface rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>Open tasks</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{metrics.myOpenTasks}</p>
        </div>
        <div className="surface rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>Completed in period</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{metrics.completedInPeriod}</p>
        </div>
        <div className="surface rounded-xl p-4">
          <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--color-muted-foreground)" }}>Overdue</p>
          <p className="mt-1 text-2xl font-bold tabular-nums">{metrics.overdueTasks}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Task status breakdown" description="Current distribution across all statuses">
          <StatusDonutChart data={metrics.statusBreakdown} />
        </SectionCard>

        <SectionCard title="Completion trend" description={`Tasks completed per day in the last ${periodDays} days`}>
          <CompletionTrendChart data={metrics.completionTrend} />
        </SectionCard>
      </div>

      <SectionCard title="Project progress" description="Completion based on each project's task records">
        {progressRows.length === 0 ? (
          <p className="py-6 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            No active projects to compare.
          </p>
        ) : (
          <ul className="space-y-3">
            {progressRows.map(({ project, progress }) => (
              <li key={project.id} className="flex items-center gap-4">
                <span className="w-44 truncate text-sm font-medium">{project.name}</span>
                <div className="flex-1">
                  <ProgressBar value={progress.percent} label={`${project.name} progress`} />
                </div>
                <span className="w-24 text-right text-xs tabular-nums" style={{ color: "var(--color-muted-foreground)" }}>
                  {progress.done}/{progress.total} tasks
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
