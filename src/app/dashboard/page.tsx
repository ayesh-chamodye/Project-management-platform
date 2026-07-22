"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/check", { cache: "no-store" });
      if (!res.ok) {
        router.push("/login");
      }
    })();
  }, [router]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-foreground)" }}>Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            Welcome back
          </p>
        </div>
      </div>
    </AppShell>
  );
}
