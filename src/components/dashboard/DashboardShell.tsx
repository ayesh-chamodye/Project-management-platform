"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { DashboardProvider, useDashboard } from "./DashboardProvider";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { ToastProvider } from "./Toast";
import { ErrorState, Spinner } from "./ui";

export function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.localStorage.getItem("projectflow:sidebar:collapsed") === "1"
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  // Unauthenticated users go through the existing login flow.
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  function toggleCollapsed() {
    setCollapsed((v) => {
      window.localStorage.setItem("projectflow:sidebar:collapsed", v ? "0" : "1");
      return !v;
    });
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <ToastProvider>
      <DashboardProvider>
        <div className="flex min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
          <AppSidebar
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
            onCreateProject={() => setCreateProjectOpen(true)}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar onMenuClick={() => setMobileOpen(true)} />
            <div className="flex items-center gap-2 border-b px-4 py-1.5" style={{ borderColor: "var(--color-border)" }}>
              <button
                onClick={toggleCollapsed}
                className="hidden items-center gap-1.5 text-xs hover:opacity-70 md:flex"
                style={{ color: "var(--color-muted-foreground)" }}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
                {collapsed ? "Expand" : "Collapse"}
              </button>
              <ShellStatus />
            </div>
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <DashboardContent>{children}</DashboardContent>
            </main>
          </div>
        </div>
        <CreateProjectDialog open={createProjectOpen} onClose={() => setCreateProjectOpen(false)} />
      </DashboardProvider>
    </ToastProvider>
  );
}

function ShellStatus() {
  const { loading, error, workspace } = useDashboard();

  if (error) {
    return <span className="text-xs" style={{ color: "var(--color-danger)" }}>{error}</span>;
  }
  if (loading) return <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>Loading workspace…</span>;
  return <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{workspace?.name}</span>;
}

function DashboardContent({ children }: { children: ReactNode }) {
  const { loading, error, refresh } = useDashboard();

  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }
  return <>{children}</>;
}
