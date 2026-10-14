import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { TASK_STATUSES, toDate, type Project, type Task, type TaskStatus } from "./types";

export interface DashboardMetrics {
  activeProjects: number;
  myOpenTasks: number;
  completedInPeriod: number;
  overdueTasks: number;
  statusBreakdown: Record<TaskStatus, number>;
  completionTrend: { date: string; completed: number }[];
}

export interface PeriodRange {
  from: Date;
  to: Date;
}

export function defaultPeriod(days = 7): PeriodRange {
  return { from: startOfDay(addDays(new Date(), -(days - 1))), to: new Date() };
}

// All metrics are derived from the workspace's real records.
export function computeMetrics(
  projects: Project[],
  tasks: Task[],
  userId: string,
  period: PeriodRange = defaultPeriod()
): DashboardMetrics {
  const statusBreakdown = TASK_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status]: 0 }),
    {} as Record<TaskStatus, number>
  );

  let myOpenTasks = 0;
  let overdueTasks = 0;
  let completedInPeriod = 0;

  for (const task of tasks) {
    statusBreakdown[task.status] += 1;

    const due = toDate(task.dueDate);
    const completedAt = toDate(task.completedAt);

    if (task.status !== "done" && task.assigneeId === userId) myOpenTasks += 1;

    if (task.status !== "done" && due && due.getTime() < Date.now()) overdueTasks += 1;

    if (task.status === "done" && completedAt && completedAt >= period.from && completedAt <= period.to) {
      completedInPeriod += 1;
    }
  }

  return {
    activeProjects: projects.filter((p) => p.status === "active").length,
    myOpenTasks,
    completedInPeriod,
    overdueTasks,
    statusBreakdown,
    completionTrend: buildCompletionTrend(tasks, period),
  };
}

function buildCompletionTrend(tasks: Task[], period: PeriodRange) {
  const days = Math.max(1, differenceInCalendarDays(period.to, period.from) + 1);
  const buckets: { date: string; completed: number }[] = [];

  for (let i = 0; i < days; i += 1) {
    const day = startOfDay(addDays(period.from, i));
    buckets.push({ date: day.toISOString().slice(0, 10), completed: 0 });
  }

  const index = new Map(buckets.map((b, i) => [b.date, i]));

  for (const task of tasks) {
    const completedAt = toDate(task.completedAt);
    if (!completedAt) continue;
    const key = startOfDay(completedAt).toISOString().slice(0, 10);
    const position = index.get(key);
    if (position !== undefined) buckets[position].completed += 1;
  }

  return buckets;
}

export function projectProgress(tasks: Task[], projectId: string) {
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const done = projectTasks.filter((t) => t.status === "done").length;
  return {
    total: projectTasks.length,
    done,
    percent: projectTasks.length === 0 ? 0 : Math.round((done / projectTasks.length) * 100),
  };
}

export function myTasks(tasks: Task[], userId: string) {
  return tasks.filter((t) => t.assigneeId === userId);
}

export type MyTaskFilter = "all" | "today" | "upcoming" | "overdue" | "completed";

export function filterMyTasks(tasks: Task[], filter: MyTaskFilter) {
  const today = startOfDay(new Date());

  return tasks.filter((task) => {
    const due = toDate(task.dueDate);

    switch (filter) {
      case "completed":
        return task.status === "done";
      case "overdue":
        return task.status !== "done" && !!due && due.getTime() < Date.now();
      case "today":
        return task.status !== "done" && !!due && differenceInCalendarDays(due, today) === 0;
      case "upcoming":
        return task.status !== "done" && !!due && due.getTime() > Date.now();
      default:
        return task.status !== "done";
    }
  });
}
