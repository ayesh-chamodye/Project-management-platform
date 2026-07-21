"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";

export default function SettingsClient() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>Settings</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>Manage your preferences</p>
        </div>
        <div className="surface rounded-xl p-6">
          <p style={{ color: "var(--color-muted-foreground)" }}>Workspace settings are not available in this minimal version.</p>
        </div>
      </div>
    </AppShell>
  );
}
