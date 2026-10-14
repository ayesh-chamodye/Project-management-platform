"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Calendar,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Plus,
  Settings,
  Users,
  X,
} from "lucide-react";
import { Avatar } from "./ui";
import { signOut } from "@/lib/firebase/client";
import { useAuth } from "@/components/AuthProvider";
import { useDashboard } from "./DashboardProvider";
import { CreateProjectDialog } from "./CreateProjectDialog";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "My Tasks", icon: ListChecks },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/team", label: "Team", icon: Users },
  { href: "/dashboard/inbox", label: "Inbox", icon: Inbox },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
  onCreateProject,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onCreateProject: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { workspace, members, memberProfiles } = useDashboard();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  const width = collapsed ? "md:w-16" : "md:w-64";

  return (
    <>
      {/* Mobile drawer */}
      {mobileOpen && <div className="fixed inset-0 z-40 bg-slate-900/50 md:hidden" onClick={onMobileClose} aria-hidden />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex ${width} w-64 -translate-x-full flex-col border-r transition-transform md:static md:translate-x-0 ${mobileOpen ? "translate-x-0" : ""}`}
        style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
        aria-label="Main navigation"
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b px-3" style={{ borderColor: "var(--color-border)" }}>
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onMobileClose}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "var(--color-primary)" }}>
              <FolderKanban className="h-4 w-4 text-white" />
            </div>
            {!collapsed && <span className="font-bold tracking-tight">ProjectFlow</span>}
          </Link>
          <button onClick={onMobileClose} className="rounded p-1 hover:opacity-70 md:hidden" aria-label="Close navigation">
            <X className="h-4 w-4" style={{ color: "var(--color-muted-foreground)" }} />
          </button>
        </div>

        <div className="px-3 py-3" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left hover:opacity-80"
            style={{ backgroundColor: "var(--color-muted)" }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-bold text-white">
              {(workspace?.name ?? "W")[0].toUpperCase()}
            </div>
            {!collapsed && (
              <>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{workspace?.name ?? "Loading…"}</span>
                <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  {members.length} {members.length === 1 ? "member" : "members"}
                </span>
              </>
            )}
          </button>
          {menuOpen && !collapsed && (
            <div className="mt-1 rounded-lg border p-1 shadow-lg" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }} role="menu">
              <p className="px-2 py-1 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                {workspace?.slug ?? ""}
              </p>
              <Link href="/dashboard/settings" className="block rounded px-2 py-1.5 text-sm hover:opacity-70" onClick={() => setMenuOpen(false)} role="menuitem">
                Workspace settings
              </Link>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 px-2">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors ${collapsed ? "md:justify-center" : ""}`}
                style={{
                  backgroundColor: active ? "var(--color-primary)" : "transparent",
                  color: active ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t p-3" style={{ borderColor: "var(--color-border)" }}>
          <button
            onClick={onCreateProject}
            className={`btn-primary w-full text-sm ${collapsed ? "md:px-0" : ""}`}
            title="Create project"
          >
            <Plus className="h-4 w-4" />
            {!collapsed && "Create Project"}
          </button>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex w-full items-center gap-2 rounded-lg px-1 py-1.5 hover:opacity-80"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <Avatar name={user?.displayName ?? null} photoURL={user?.photoURL} size={collapsed ? 28 : 28} />
              {!collapsed && (
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-medium">{user?.displayName ?? "User"}</span>
                  <span className="block truncate text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                    {user?.email}
                  </span>
                </span>
              )}
            </button>
            {userMenuOpen && (
              <div
                className="absolute bottom-12 left-0 z-50 w-56 rounded-lg border p-1 shadow-lg"
                style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}
                role="menu"
              >
                <p className="px-2 py-1.5 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                  Signed in as {user?.email}
                </p>
                <Link href="/dashboard/settings" className="block rounded px-2 py-1.5 text-sm hover:opacity-70" onClick={() => setUserMenuOpen(false)} role="menuitem">
                  <Settings className="mr-2 inline h-3.5 w-3.5" />
                  Settings
                </Link>
                <button onClick={handleLogout} className="block w-full rounded px-2 py-1.5 text-left text-sm hover:opacity-70" style={{ color: "var(--color-danger)" }} role="menuitem">
                  <LogOut className="mr-2 inline h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export { NAV_ITEMS };
export function SidebarCreateProjectButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn-primary text-sm">
      <Plus className="h-4 w-4" />
      Create Project
    </button>
  );
}
