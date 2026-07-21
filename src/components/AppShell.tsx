"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/check", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUserEmail(data.user?.email || null);
        }
      } catch {}
    };
    loadUser();
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <header className="surface sticky top-0 z-30" style={{ borderBottom: "1px solid var(--color-border)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)" }}>
                  <svg className="h-5 w-5" style={{ color: "var(--color-primary-foreground)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 4a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <span className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>ProjectFlow</span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-colors relative"
                    style={{
                      color: isActive(item.href) ? "var(--color-primary)" : "var(--color-muted-foreground)",
                      backgroundColor: isActive(item.href) ? "var(--color-accent)" : "transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                {userEmail || "Loading..."}
              </span>
              <button onClick={async () => { await fetch("/api/auth/set-session", { method: "DELETE" }); window.location.href = "/login"; }} className="btn-secondary text-sm">Logout</button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}

