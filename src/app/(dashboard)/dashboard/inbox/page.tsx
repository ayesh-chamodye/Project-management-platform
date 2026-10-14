"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/dashboard/ui";
import { ActivityFeed } from "@/components/dashboard/UpcomingDeadlines";
import { useDashboard } from "@/components/dashboard/DashboardProvider";

const FILTERS = [
  { id: "all", label: "All activity" },
  { id: "project", label: "Projects" },
  { id: "task", label: "Tasks" },
  { id: "member", label: "Members" },
] as const;

export default function InboxPage() {
  const { activity, workspace } = useDashboard();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  const items = useMemo(
    () => (filter === "all" ? activity : activity.filter((a) => a.entityType === filter)),
    [activity, filter]
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Inbox" description={`Every event in ${workspace?.name ?? "your workspace"}, newest first.`} />

      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="rounded-full border px-3 py-1 text-xs font-medium"
              style={{
                borderColor: active ? "var(--color-primary)" : "var(--color-border)",
                backgroundColor: active ? "var(--color-primary)" : "transparent",
                color: active ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <section className="surface rounded-xl p-4" style={{ borderColor: "var(--color-border)" }}>
        <ActivityFeed items={items} showAll />
      </section>
    </div>
  );
}
