"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function TeamPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) fetchMembers();
  }, [selectedWorkspace]);

  async function fetchWorkspaces() {
    try {
      const res = await fetch("/api/workspaces", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
        if (data.workspaces?.length > 0) setSelectedWorkspace(data.workspaces[0].id);
      }
    } catch {}
    setLoading(false);
  }

  async function fetchMembers() {
    try {
      const res = await fetch(`/api/workspaces/${selectedWorkspace}/members`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {}
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>Team</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Manage your team members</p>
      </div>

      {workspaces.length > 0 && (
        <div className="surface rounded-xl p-6" style={{ border: "1px solid var(--color-border)" }}>
          <div className="flex items-center gap-4 mb-4">
            <label className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>Select Workspace:</label>
            <select
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="px-4 py-2 rounded-lg border"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>

          {members.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--color-muted-foreground)" }}>No members yet</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: "var(--color-muted)" }}>
                  <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                    {member.user?.displayName?.[0] || member.user?.email?.[0] || "U"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{member.user?.displayName || member.user?.email}</p>
                    <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
