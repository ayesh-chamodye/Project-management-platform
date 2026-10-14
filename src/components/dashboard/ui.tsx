"use client";

import type { ReactNode } from "react";
import { Loader2, AlertTriangle, Inbox } from "lucide-react";
import {
  OPEN_STATUSES,
  PROJECT_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  toDate,
  type ProjectStatus,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/firestore/types";

export function LoadingSkeleton({ rows = 3, className = "" }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-lg" style={{ backgroundColor: "var(--color-muted)" }} />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center" style={{ borderColor: "var(--color-border)" }}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-muted)" }}>
        {icon ?? <Inbox className="h-5 w-5" style={{ color: "var(--color-muted-foreground)" }} />}
      </div>
      <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>{title}</h3>
      <p className="mt-1 max-w-sm text-sm" style={{ color: "var(--color-muted-foreground)" }}>{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center" style={{ borderColor: "var(--color-border)" }}>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: "var(--color-muted)" }}>
        <AlertTriangle className="h-5 w-5" style={{ color: "var(--color-danger)" }} />
      </div>
      <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>Something went wrong</h3>
      <p className="mt-1 max-w-sm text-sm" style={{ color: "var(--color-muted-foreground)" }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4 text-sm">
          Try again
        </button>
      )}
    </div>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin`} style={{ color: "var(--color-primary)" }} />;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>{title}</h1>
        {description && <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<TaskStatus, { dot: string; label: string }> = {
  backlog: { dot: "bg-slate-400", label: TASK_STATUS_LABELS.backlog },
  todo: { dot: "bg-slate-500", label: TASK_STATUS_LABELS.todo },
  in_progress: { dot: "bg-blue-500", label: TASK_STATUS_LABELS.in_progress },
  in_review: { dot: "bg-amber-500", label: TASK_STATUS_LABELS.in_review },
  done: { dot: "bg-emerald-500", label: TASK_STATUS_LABELS.done },
};

// Status is signalled by text + a dot, never by color alone.
export function StatusBadge({ status }: { status: TaskStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium" style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden />
      {style.label}
    </span>
  );
}

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600",
  medium: "text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
  high: "text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700",
  urgent: "text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}>
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}>
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full">
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "var(--color-muted)" }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: "var(--color-primary)" }} />
      </div>
      <span className="mt-1 block text-xs" style={{ color: "var(--color-muted-foreground)" }}>{pct}%</span>
    </div>
  );
}

export function Avatar({
  name,
  photoURL,
  size = 28,
}: {
  name: string | null;
  photoURL?: string | null;
  size?: number;
}) {
  const initials = (name?.trim()?.[0] ?? "U").toUpperCase();
  const dimension = { width: size, height: size };

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name ?? "User"}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={dimension}
      />
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
      style={{ ...dimension, backgroundColor: "var(--color-primary)" }}
      title={name ?? "User"}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function formatDate(value?: Parameters<typeof toDate>[0], withTime = false) {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function relativeTime(value?: Parameters<typeof toDate>[0]) {
  const date = toDate(value);
  if (!date) return "";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
}

export function isOverdue(task: { dueDate?: Parameters<typeof toDate>[0] }) {
  const due = toDate(task.dueDate);
  return !!due && due.getTime() < Date.now();
}

export function isOpenTask(status: TaskStatus) {
  return OPEN_STATUSES.includes(status);
}

export { STATUS_STYLES };
