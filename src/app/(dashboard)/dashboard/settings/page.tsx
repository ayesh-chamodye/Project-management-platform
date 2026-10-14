"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Save } from "lucide-react";
import { PageHeader, Spinner } from "@/components/dashboard/ui";
import { useAuth } from "@/components/AuthProvider";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useToast } from "@/components/dashboard/Toast";
import { signOut } from "@/lib/firebase/client";
import { updateUserProfile } from "@/lib/firebase/users";
import { updateWorkspace } from "@/lib/firestore/workspaces";
import { auth } from "@/lib/firebase/config";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { workspace, members, refresh } = useDashboard();
  const { toast } = useToast();

  // The shell only renders children after auth and workspace data resolve,
  // so the current user/workspace are available on first render.
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [workspaceName, setWorkspaceName] = useState(workspace?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingWorkspace, setSavingWorkspace] = useState(false);

  const isOwner = !!workspace && !!user && workspace.ownerId === user.uid;

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !displayName.trim()) return;

    setSavingProfile(true);
    try {
      await updateUserProfile(user.uid, { displayName: displayName.trim() });
      if (auth?.currentUser) {
        const { updateProfile } = await import("firebase/auth");
        await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      }
      toast("Profile updated");
    } catch (err) {
      console.error(err);
      toast("Failed to update profile", "error");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveWorkspace(e: React.FormEvent) {
    e.preventDefault();
    if (!workspace || !workspaceName.trim()) return;

    setSavingWorkspace(true);
    try {
      await updateWorkspace(workspace.id, { name: workspaceName.trim() });
      await refresh();
      toast("Workspace updated");
    } catch (err) {
      console.error(err);
      toast("Failed to update workspace", "error");
    } finally {
      setSavingWorkspace(false);
    }
  }

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader title="Settings" description="Your profile and workspace preferences." />

      <form onSubmit={handleSaveProfile} className="surface space-y-4 rounded-xl p-6" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="text-sm font-semibold">Profile</h2>
        <div>
          <label className="label" htmlFor="settings-email">
            Email
          </label>
          <input id="settings-email" className="input-field opacity-60" value={user?.email ?? ""} disabled />
        </div>
        <div>
          <label className="label" htmlFor="settings-name">
            Display name
          </label>
          <input
            id="settings-name"
            className="input-field"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <button type="submit" className="btn-primary text-sm" disabled={savingProfile || !displayName.trim()}>
          {savingProfile ? <Spinner className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          Save profile
        </button>
      </form>

      <form onSubmit={handleSaveWorkspace} className="surface space-y-4 rounded-xl p-6" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="text-sm font-semibold">Workspace</h2>
        <div>
          <label className="label" htmlFor="settings-workspace">
            Workspace name
          </label>
          <input
            id="settings-workspace"
            className="input-field"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            disabled={!isOwner}
          />
          {!isOwner && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              Only the workspace owner can rename this workspace.
            </p>
          )}
        </div>
        <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          {members.length} {members.length === 1 ? "member" : "members"} · slug: {workspace?.slug ?? "—"}
        </p>
        {isOwner && (
          <button type="submit" className="btn-primary text-sm" disabled={savingWorkspace || !workspaceName.trim()}>
            {savingWorkspace ? <Spinner className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            Save workspace
          </button>
        )}
      </form>

      <div className="surface rounded-xl p-6" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="mb-2 text-sm font-semibold">Account</h2>
        <p className="mb-4 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          Signing out clears your Firebase session on this device.
        </p>
        <button onClick={handleLogout} className="btn-secondary text-sm" style={{ color: "var(--color-danger)" }}>
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}
