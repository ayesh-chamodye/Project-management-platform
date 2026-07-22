"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    fetch("/api/auth/check", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) {
          setEmail(data.user.email);
          setName(data.user.name || "");
        }
      })
      .catch(() => {});
  }, []);

  return (
    <AppShell>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>Profile</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Your account information</p>
        </div>
        <form className="surface rounded-xl p-8 space-y-6" style={{ border: "1px solid var(--color-border)" }}>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" value={email} readOnly className="input-field opacity-60" />
          </div>
          <div>
            <label htmlFor="name" className="label">Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="avatarUrl" className="label">Avatar URL</label>
            <input id="avatarUrl" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="input-field" placeholder="https://example.com/avatar.png" />
          </div>
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            Profile changes are not yet persisted.
          </p>
        </form>
      </div>
    </AppShell>
  );
}
