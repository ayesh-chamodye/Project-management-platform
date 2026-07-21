"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { UserPlus, Trash2 } from "lucide-react";

export default function SettingsClient() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      let user = null;
      try {
        const res = await fetch("/api/auth/check", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          user = data.user;
        }
      } catch {}
      if (!user) {
        router.push("/login");
        return;
      }
      setUser({ email: user.email });
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const data = await res.json();
        const ws = (data.workspaces || []).find((w: any) => w.memberRole === "owner");
        if (ws) {
          setWorkspace(ws);
          fetchMembers(ws.id);
        }
      }
    };
    init();
  }, []);

  const fetchMembers = async (workspaceId: string) => {
    const res = await fetch(`/api/workspaces/${workspaceId}/members`);
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members || []);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;
    setSaving(true);
    setMessage("");
    setError("");

    const res = await fetch(`/api/workspaces/${workspace.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: workspace.name }),
    });

    if (res.ok) {
      setMessage("Workspace updated");
    } else {
      setError("Failed to update workspace");
    }
    setSaving(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !inviteEmail) return;
    const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: "member" }),
    });
    if (res.ok) {
      setInviteEmail("");
      fetchMembers(workspace.id);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!workspace) return;
    await fetch(`/api/workspaces/${workspace.id}/members/${memberId}`, { method: "DELETE" });
    setMembers(members.filter((m) => m.id !== memberId));
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>Settings</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Manage workspace preferences and team members</p>
        </div>

        {workspace && (
          <div className="surface rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Workspace</h2>
            <form onSubmit={handleSave} className="space-y-4 max-w-xl">
              <div>
                <label className="label">Workspace Name</label>
                <input type="text" value={workspace.name} onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })} className="input-field" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {message && <p className="text-sm" style={{ color: "var(--color-success)" }}>{message}</p>}
              {error && <p className="text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>}
            </form>
          </div>
        )}

        {workspace && (
          <div className="surface rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Invite Member</h2>
            <form onSubmit={handleInvite} className="flex gap-3 max-w-xl">
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="input-field flex-1" placeholder="colleague@example.com" required />
              <button type="submit" className="btn-primary">
                <UserPlus className="h-4 w-4" />
                Invite
              </button>
            </form>
          </div>
        )}

        <div className="surface rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Members</h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
                <div>
                  <p className="font-medium text-sm" style={{ color: "var(--color-foreground)" }}>{member.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{member.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-1 rounded-md capitalize" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
                    {member.role}
                  </span>
                  {member.role !== "owner" && (
                    <button onClick={() => handleRemoveMember(member.id)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Trash2 className="h-4 w-4" style={{ color: "var(--color-danger)" }} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>No members yet.</p>}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
