"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  slug: string;
}

export default function WorkspaceLayout({ children, workspace }: { children: React.ReactNode; workspace: Workspace }) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: `/workspace/${workspace.id}`, label: "Overview", icon: LayoutDashboard },
    { href: `/workspace/${workspace.id}/projects`, label: "Projects", icon: FolderKanban },
    { href: `/workspace/${workspace.id}/team`, label: "Team", icon: Users },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-background)" }}>
      <aside className="w-64 surface border-r hidden md:flex flex-col" style={{ borderColor: "var(--color-border)" }}>
        <div className="p-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)" }}>
              <svg className="h-5 w-5" style={{ color: "var(--color-primary-foreground)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 4a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>FlowBoard</span>
          </Link>
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {workspace.name[0]}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{workspace.name}</p>
              <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>/{workspace.slug}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors`}
                style={{
                  color: active ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                  backgroundColor: active ? "var(--color-primary)" : "transparent",
                }}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-muted-foreground)" }}>
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to dashboard
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 surface border-b flex items-center justify-between px-4 md:hidden" style={{ borderColor: "var(--color-border)" }}>
          <Link href="/dashboard" className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>FlowBoard</Link>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
