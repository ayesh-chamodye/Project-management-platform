"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TASK_STATUS_LABELS, TASK_STATUSES, type TaskStatus } from "@/lib/firestore/types";

const COLORS: Record<TaskStatus, string> = {
  backlog: "#94a3b8",
  todo: "#64748b",
  in_progress: "#3b82f6",
  in_review: "#f59e0b",
  done: "#10b981",
};

export function StatusDonutChart({ data }: { data: Record<TaskStatus, number> }) {
  const rows = TASK_STATUSES.map((status) => ({
    name: TASK_STATUS_LABELS[status],
    status,
    value: data[status] ?? 0,
  })).filter((row) => row.value > 0);

  if (rows.length === 0) {
    return <p className="py-10 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>No tasks yet — the breakdown appears once tasks are created.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2} strokeWidth={0}>
              {rows.map((row) => (
                <Cell key={row.status} fill={COLORS[row.status]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                fontSize: "0.8rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-1.5 text-sm">
        {rows.map((row) => (
          <li key={row.status} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[row.status] }} aria-hidden />
            <span style={{ color: "var(--color-foreground)" }}>{row.name}</span>
            <span className="font-semibold tabular-nums" style={{ color: "var(--color-muted-foreground)" }}>{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompletionTrendChart({ data }: { data: { date: string; completed: number }[] }) {
  if (data.every((point) => point.completed === 0)) {
    return (
      <p className="py-10 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>
        No completions in this period yet.
      </p>
    );
  }

  const rows = data.map((point) => ({
    ...point,
    label: new Date(point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} stroke="var(--color-border)" />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} stroke="var(--color-border)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
            }}
          />
          <Bar dataKey="completed" name="Completed" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
