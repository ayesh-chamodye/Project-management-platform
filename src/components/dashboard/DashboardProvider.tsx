"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ensureWorkspace, listWorkspaceMembers } from "@/lib/firestore/workspaces";
import { listProjects } from "@/lib/firestore/projects";
import { listWorkspaceTasks } from "@/lib/firestore/tasks";
import { listRecentActivity } from "@/lib/firestore/activity";
import type { Activity, Project, Task, Workspace, WorkspaceMember } from "@/lib/firestore/types";

interface DashboardContextValue {
  workspace: Workspace | null;
  members: WorkspaceMember[];
  memberProfiles: Record<string, { displayName: string | null; email: string | null; photoURL: string | null }>;
  projects: Project[];
  tasks: Task[];
  activity: Activity[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextValue>({
  workspace: null,
  members: [],
  memberProfiles: {},
  projects: [],
  tasks: [],
  activity: [],
  loading: true,
  error: null,
  refresh: async () => {},
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<DashboardContextValue["memberProfiles"]>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = authLoading || dataLoading;

  const refresh = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setError(null);
    try {
      const ws = await ensureWorkspace(user.uid);
      setWorkspace(ws);

      const [memberRows, projectRows, taskRows, activityRows] = await Promise.all([
        listWorkspaceMembers(ws.id),
        listProjects(ws.id),
        listWorkspaceTasks(ws.id),
        listRecentActivity(ws.id),
      ]);
      setMembers(memberRows);
      setProjects(projectRows);
      setTasks(taskRows);
      setActivity(activityRows);

      const profiles: DashboardContextValue["memberProfiles"] = {};
      await Promise.all(
        memberRows.map(async (m) => {
          const { getUserProfile } = await import("@/lib/firebase/users");
          const profile = await getUserProfile(m.userId);
          if (profile) {
            profiles[m.userId] = {
              displayName: profile.displayName,
              email: profile.email,
              photoURL: profile.photoURL,
            };
          }
        })
      );
      setMemberProfiles(profiles);
    } catch (err) {
      console.error("Failed to load workspace data:", err);
      setError("Failed to load workspace data. Check your connection and try again.");
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading || !user) return;
    // Deferred so the loader's state updates do not run synchronously inside this effect.
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, [authLoading, user, refresh]);

  return (
    <DashboardContext.Provider
      value={{ workspace, members, memberProfiles, projects, tasks, activity, loading, error, refresh }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
