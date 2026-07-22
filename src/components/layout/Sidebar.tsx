"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  ChevronDown,
  Plus,
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  ownerId: string;
}

interface SidebarProps {
  workspace: Workspace;
}

export default function Sidebar({ workspace }: SidebarProps) {
  const pathname = usePathname();
  const [showWorkspaceSwitcher, setShowWorkspaceSwitcher] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  const navigation = [
    { name: "Dashboard", href: `/workspace/${workspace.id}/dashboard`, icon: LayoutDashboard },
    { name: "Projects", href: `/workspace/${workspace.id}/projects`, icon: FolderKanban },
  ];

  async function fetchWorkspaces() {
    try {
      const res = await fetch("/api/workspaces");
      const data = await res.json();
      if (data.workspaces) setWorkspaces(data.workspaces);
    } catch {}
  }

  async function handleLogout() {
    await fetch("/api/auth/set-session", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4">
        <button
          onClick={() => {
            fetchWorkspaces();
            setShowWorkspaceSwitcher(!showWorkspaceSwitcher);
          }}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {workspace.name[0]}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {workspace.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Free Plan</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {showWorkspaceSwitcher && (
          <div className="mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            {workspaces.length === 0 ? (
              <p className="p-3 text-sm text-gray-500">No other workspaces</p>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {workspaces.map((ws) => ws.id !== workspace.id && (
                  <Link
                    key={ws.id}
                    href={`/workspace/${ws.id}/dashboard`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-600"
                    onClick={() => setShowWorkspaceSwitcher(false)}
                  >
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {ws.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {ws.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-600 p-2">
              <button
                onClick={async () => {
                  const name = prompt("Workspace name:");
                  if (!name) return;
                  await fetch("/api/workspaces", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name }),
                  });
                  fetchWorkspaces();
                }}
                className="flex items-center gap-2 p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg w-full"
              >
                <Plus className="h-4 w-4" />
                Create Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
