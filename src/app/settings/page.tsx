"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

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
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>Settings</h1>

      <div className="surface rounded-xl p-8" style={{ border: "1px solid var(--color-border)" }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5" style={{ color: "var(--color-muted-foreground)" }} />
              <div>
                <p className="font-medium" style={{ color: "var(--color-foreground)" }}>Email Notifications</p>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Receive email updates about your projects</p>
              </div>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
