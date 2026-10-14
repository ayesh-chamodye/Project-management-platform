"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, Inbox } from "lucide-react";
import { Avatar, relativeTime } from "./ui";
import { useDashboard } from "./DashboardProvider";

const LAST_SEEN_KEY = "projectflow:notifications:last-seen";

export function activityLabel(action: string): string {
  const map: Record<string, string> = {
    created_workspace: "created the workspace",
    updated_workspace: "updated the workspace",
    created_project: "created project",
    updated_project: "updated project",
    archived_project: "archived project",
    deleted_project: "deleted project",
    created_task: "created task",
    updated_task: "updated task",
    completed_task: "completed task",
    deleted_task: "deleted task",
    added_member: "added a member",
    removed_member: "removed a member",
    joined_workspace: "joined the workspace",
  };
  return map[action] ?? action.replace(/_/g, " ");
}

export function NotificationMenu() {
  const { activity, memberProfiles } = useDashboard();
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState<number>(() => {
    if (typeof window === "undefined") return Date.now();
    const stored = window.localStorage.getItem(LAST_SEEN_KEY);
    return stored ? Number(stored) : Date.now();
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Unread = activity newer than the last time the inbox was opened.
  const unread = useMemo(
    () => activity.filter((a) => (a.createdAt?.toMillis() ?? 0) > lastSeen).length,
    [activity, lastSeen]
  );

  function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      const now = Date.now();
      window.localStorage.setItem(LAST_SEEN_KEY, String(now));
      setLastSeen(now);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative rounded-lg p-2 hover:opacity-70"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" style={{ color: "var(--color-foreground)" }} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ backgroundColor: "var(--color-danger)" }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-1 w-80 rounded-lg border shadow-lg"
          style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
          role="menu"
        >
          <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: "var(--color-border)" }}>
            <p className="text-sm font-semibold">Notifications</p>
            <Link href="/dashboard/inbox" className="inline-flex items-center gap-1 text-xs hover:opacity-70" style={{ color: "var(--color-primary)" }} onClick={() => setOpen(false)}>
              <Inbox className="h-3 w-3" />
              View inbox
            </Link>
          </div>
          <ul className="max-h-80 divide-y overflow-y-auto" style={{ borderColor: "var(--color-border)" }}>
            {activity.slice(0, 8).map((item) => {
              const actor = memberProfiles[item.actorId];
              return (
                <li key={item.id} className="flex gap-3 px-4 py-3">
                  <Avatar name={actor?.displayName ?? null} photoURL={actor?.photoURL} size={24} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{actor?.displayName ?? actor?.email ?? "Someone"}</span>{" "}
                      <span style={{ color: "var(--color-muted-foreground)" }}>{activityLabel(item.action)}</span>{" "}
                      <Link href={`/dashboard/projects/${item.entityId}`} className="font-medium hover:opacity-70" style={{ color: "var(--color-primary)" }} onClick={() => setOpen(false)}>
                        {item.entityName}
                      </Link>
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted-foreground)" }}>{relativeTime(item.createdAt)}</p>
                  </div>
                </li>
              );
            })}
            {activity.length === 0 && (
              <li className="px-4 py-8 text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                <Check className="mx-auto mb-2 h-5 w-5" />
                You are all caught up
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
