"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--color-primary)" }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>Profile</h1>

      <div className="surface rounded-xl p-8" style={{ border: "1px solid var(--color-border)" }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
             {user?.displayName?.[0] || user?.email?.[0] || "U"}
          </div>
          <div>
              <h2 className="text-xl font-semibold" style={{ color: "var(--color-foreground)" }}>{user?.displayName || "User"}</h2>
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2 rounded-lg border opacity-60"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}
            />
          </div>
          <button disabled={saving} className="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
