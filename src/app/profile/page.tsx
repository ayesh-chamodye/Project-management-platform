"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { User } from "lucide-react";

export default function ProfileClient() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; user_metadata?: { name?: string; avatar_url?: string } } | null>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
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
      const u = user;
      setUser({
        email: u.email || undefined,
        user_metadata: u.user_metadata as { name?: string; avatar_url?: string } | undefined,
      });
      setName((u.user_metadata as { name?: string } | undefined)?.name || "");
      setAvatarUrl((u.user_metadata as { avatar_url?: string } | undefined)?.avatar_url || "");
    };
    fetchUser();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const { error } = await supabase.auth.updateUser({
      data: { name, avatar_url: avatarUrl },
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Profile updated successfully");
    }
    setSaving(false);
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>Profile</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Manage your account details</p>
        </div>

        <div className="surface rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary)" }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                <User className="h-7 w-7" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: "var(--color-foreground)" }}>{user?.user_metadata?.name || "User"}</h2>
              <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
            <div>
              <label className="label">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="label">Avatar URL</label>
              <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="input-field" placeholder="https://example.com/avatar.png" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            {message && <p className="text-sm" style={{ color: "var(--color-success)" }}>{message}</p>}
            {error && <p className="text-sm" style={{ color: "var(--color-danger)" }}>{error}</p>}
          </form>
        </div>
      </div>
    </AppShell>
  );
}
