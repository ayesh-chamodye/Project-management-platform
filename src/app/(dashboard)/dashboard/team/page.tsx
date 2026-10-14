"use client";

import { useMemo, useState } from "react";
import { Mail, Trash2, UserPlus } from "lucide-react";
import { PageHeader, Avatar, EmptyState, Spinner } from "@/components/dashboard/ui";
import { ConfirmDialog } from "@/components/dashboard/Modal";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/dashboard/Toast";
import { addWorkspaceMember, findUserByEmail, removeWorkspaceMember } from "@/lib/firestore/workspaces";
import { WORKSPACE_ROLE_LABELS } from "@/lib/constants";

export default function TeamPage() {
  const { workspace, members, memberProfiles, projects, tasks, refresh } = useDashboard();
  const { user } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const stats = useMemo(() => {
    const map = new Map<string, { assigned: number; completed: number }>();
    for (const member of members) {
      map.set(member.userId, { assigned: 0, completed: 0 });
    }
    for (const task of tasks) {
      if (!task.assigneeId || !map.has(task.assigneeId)) continue;
      const entry = map.get(task.assigneeId)!;
      entry.assigned += 1;
      if (task.status === "done") entry.completed += 1;
    }
    return map;
  }, [members, tasks]);

  const removalTarget = members.find((m) => m.id === removing) ?? null;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!workspace || !user || !email.trim()) return;

    setInviting(true);
    try {
      const userId = await findUserByEmail(email.trim());
      if (!userId) {
        toast("No ProjectFlow account found for that email. They need to sign up first.", "error");
        return;
      }
      await addWorkspaceMember(workspace.id, userId, user.uid, role);
      await refresh();
      setEmail("");
      toast("Member added");
    } catch (err) {
      console.error(err);
      toast("Failed to add member", "error");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove() {
    if (!workspace || !user || !removalTarget) return;
    setBusy(true);
    try {
      await removeWorkspaceMember(workspace.id, removalTarget.id, removalTarget.userId, user.uid);
      await refresh();
      setRemoving(null);
      toast("Member removed");
    } catch (err) {
      console.error(err);
      toast("Failed to remove member", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Team" description="Members of this workspace and their open workload." />

      <form onSubmit={handleInvite} className="surface flex flex-wrap items-end gap-3 rounded-xl p-4" style={{ borderColor: "var(--color-border)" }}>
        <div className="min-w-56 flex-1">
          <label className="label" htmlFor="invite-email">
            Invite by email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--color-muted-foreground)" }} />
            <input
              id="invite-email"
              type="email"
              className="input-field pl-9"
              placeholder="teammate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="invite-role">
            Role
          </label>
          <select id="invite-role" className="input-field w-32" value={role} onChange={(e) => setRole(e.target.value as "admin" | "member")}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="btn-primary text-sm" disabled={inviting || !email.trim()}>
          {inviting ? <Spinner className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
          Add member
        </button>
      </form>

      <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
        Members must already have a ProjectFlow account. {projects.length} projects and {tasks.length} tasks in this workspace.
      </p>

      {members.length === 0 ? (
        <EmptyState title="No members" description="Add teammates by email to collaborate on projects." />
      ) : (
        <div className="surface overflow-hidden rounded-xl" style={{ borderColor: "var(--color-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide" style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}>
                <th className="px-4 py-2.5 font-medium">Member</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Assigned</th>
                <th className="px-4 py-2.5 font-medium">Completed</th>
                <th className="px-4 py-2.5 font-medium">Joined</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => {
                const profile = memberProfiles[member.userId];
                const stat = stats.get(member.userId) ?? { assigned: 0, completed: 0 };

                return (
                  <tr key={member.id} className="border-b last:border-b-0" style={{ borderColor: "var(--color-border)" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={profile?.displayName ?? null} photoURL={profile?.photoURL} size={28} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {profile?.displayName ?? "User"}
                            {member.userId === user?.uid && <span className="ml-1.5 text-xs" style={{ color: "var(--color-muted-foreground)" }}>(you)</span>}
                          </p>
                          <p className="truncate text-xs" style={{ color: "var(--color-muted-foreground)" }}>{profile?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: "var(--color-border)" }}>
                        {WORKSPACE_ROLE_LABELS[member.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{stat.assigned}</td>
                    <td className="px-4 py-3 tabular-nums">{stat.completed}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                      {member.joinedAt ? new Date(member.joinedAt.toMillis()).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {member.userId !== workspace?.ownerId && (
                        <button
                          onClick={() => setRemoving(member.id)}
                          className="rounded p-1.5 hover:opacity-70"
                          style={{ color: "var(--color-danger)" }}
                          aria-label={`Remove ${profile?.displayName ?? profile?.email ?? "member"}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!removalTarget}
        title="Remove member"
        description={`${memberProfiles[removalTarget?.userId ?? ""]?.displayName ?? memberProfiles[removalTarget?.userId ?? ""]?.email ?? "This member"} will lose access to this workspace. Their tasks stay assigned but become uneditable.`}
        confirmLabel="Remove member"
        destructive
        busy={busy}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
