"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { UserPlus } from "lucide-react";

export default function SettingsClient() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    await new Promise((resolve) => setTimeout(resolve, 500));
    setMessage("Settings saved");
    setSaving(false);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>Settings</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Manage workspace preferences and team members</p>
        </div>

        <div className="surface rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Workspace</h2>
          <form onSubmit={handleSave} className="space-y-4 max-w-xl">
            <div>
              <label className="label">Workspace Name</label>
              <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="input-field" placeholder="My Workspace" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {message && <p className="text-sm" style={{ color: "var(--color-success)" }}>{message}</p>}
          </form>
        </div>

        <div className="surface rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Invite Member</h2>
          <form onSubmit={async (e) => { e.preventDefault(); setInviteEmail(""); }} className="flex gap-3 max-w-xl">
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="input-field flex-1" placeholder="colleague@example.com" required />
            <button type="submit" className="btn-primary">
              <UserPlus className="h-4 w-4" />
              Invite
            </button>
          </form>
        </div>

        <div className="surface rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Members</h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
                <div>
                  <p className="font-medium text-sm" style={{ color: "var(--color-foreground)" }}>{member.name}</p>
                  <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{member.email}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-foreground)" }}>
                  {member.role}
                </span>
              </div>
            ))}
            {members.length === 0 && (
              <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>No members yet.</p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
