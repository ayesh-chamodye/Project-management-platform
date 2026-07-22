"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";

export default function SettingsPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/auth/check", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.email) setEmail(data.user.email);
      })
      .catch(() => {});
  }, []);

  return (
    <AppShell>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>Settings</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Manage your account settings</p>
        </div>
        <div className="surface rounded-xl p-8 space-y-4" style={{ border: "1px solid var(--color-border)" }}>
          <div>
            <label className="label">Email</label>
            <p className="text-sm mt-1" style={{ color: "var(--color-foreground)" }}>{email || "Loading..."}</p>
          </div>
          <div className="rounded-lg p-4" style={{ backgroundColor: "var(--color-muted)" }}>
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              More settings coming soon. You can update your profile on the Profile page.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
