"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Plus, Search } from "lucide-react";
import { Avatar } from "./ui";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationMenu } from "./NotificationMenu";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { useAuth } from "@/components/AuthProvider";
import { useDashboard } from "./DashboardProvider";

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/tasks": "My Tasks",
  "/dashboard/projects": "Projects",
  "/dashboard/calendar": "Calendar",
  "/dashboard/team": "Team",
  "/dashboard/inbox": "Inbox",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { workspace, projects } = useDashboard();
  const [searchOpen, setSearchOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);

  const title =
    Object.entries(TITLES).find(([path]) => pathname === path || pathname.startsWith(path + "/"))?.[1] ??
    (pathname.startsWith("/dashboard/projects/") ? "Project" : workspace?.name ?? "Overview");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
        <button onClick={onMenuClick} className="rounded p-2 hover:opacity-70 md:hidden" aria-label="Open navigation">
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>{title}</p>
          <p className="hidden truncate text-xs sm:block" style={{ color: "var(--color-muted-foreground)" }}>
            {workspace?.name}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:opacity-80 sm:flex"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Search…</span>
            <kbd className="hidden rounded border px-1.5 text-[10px] font-medium lg:inline" style={{ borderColor: "var(--color-border)" }}>⌘K</kbd>
          </button>
          <button onClick={() => setSearchOpen(true)} className="rounded p-2 hover:opacity-70 sm:hidden" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>

          <button
            onClick={() => setTaskOpen(true)}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90 md:flex"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <Plus className="h-3.5 w-3.5" />
            Quick create
          </button>

          <NotificationMenu />

          {user && (
            <div className="ml-1 flex items-center gap-2 border-l pl-2" style={{ borderColor: "var(--color-border)" }}>
              <Avatar name={user.displayName} photoURL={user.photoURL} size={28} />
              <span className="hidden text-sm font-medium lg:inline">{user.displayName ?? user.email}</span>
            </div>
          )}
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <CreateTaskDialog
        open={taskOpen}
        onClose={() => setTaskOpen(false)}
        defaultProjectId={projects[0]?.id}
      />
    </>
  );
}
