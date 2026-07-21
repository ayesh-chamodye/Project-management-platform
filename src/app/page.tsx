"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BarChart3, Users, FolderOpen } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const hash = window.location.hash;

    if (hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token, refresh_token }),
        }).then(() => {
          window.location.href = "/dashboard";
        });
        return;
      }
    }

    (async () => {
      let user = null;
      try {
        const res = await fetch("/api/auth/check", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          user = data.user;
        }
      } catch {}
      if (user) {
        router.push("/dashboard");
      }
      setUser({ email: user.email });
    })();
  }, [router]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <header className="px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)" }}>
              <svg className="h-6 w-6" style={{ color: "var(--color-primary-foreground)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 4a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-foreground)" }}>ProjectFlow</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium" style={{ color: "var(--color-muted-foreground)" }}>
              Sign in
            </Link>
            <Link href="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-5xl font-bold tracking-tight mb-6" style={{ color: "var(--color-foreground)" }}>
              Manage projects with ease
            </h2>
            <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: "var(--color-muted-foreground)" }}>
              ProjectFlow helps teams organize, track, and manage their work with intuitive tools and powerful collaboration.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-base px-8 py-3">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="btn-secondary text-base px-8 py-3">
                Sign in
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FolderOpen,
                title: "Project Management",
                description: "Organize and track your projects with a clean, intuitive interface.",
                accent: "var(--color-primary)",
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Collaborate with your team in real-time and stay aligned on goals.",
                accent: "var(--color-success)",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                description: "Get insights into your workflow and track progress over time.",
                accent: "var(--color-warning)",
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="surface rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "var(--color-accent)", color: feature.accent }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-foreground)" }}>{feature.title}</h3>
                  <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="px-6" style={{ borderTop: "1px solid var(--color-border)" }}>
        <div className="max-w-7xl mx-auto py-8">
          <p className="text-center text-sm" style={{ color: "var(--color-muted-foreground)" }}> ProjectFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
