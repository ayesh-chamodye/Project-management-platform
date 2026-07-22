"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderOpen, Settings, User, LogOut, ChevronDown } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/check", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user?.email) setEmail(data.user.email);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/set-session", { method: "DELETE" });
    router.push("/login");
  }

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projects", icon: FolderOpen },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-background)" }}>
      <aside className="w-64 surface border-r hidden md:flex flex-col" style={{ borderColor: "var(--color-border)" }}>
        <div className="p-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "var(--color-primary)" }}>
              <svg className="h-5 w-5" style={{ color: "var(--color-primary-foreground)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 4a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>ProjectFlow</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "" : "hover:opacity-80"
                }`}
                style={{
                  color: active ? "var(--color-primary-foreground)" : "var(--color-foreground)",
                  backgroundColor: active ? "var(--color-primary)" : "transparent",
                }}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium w-full px-3 py-2 rounded-lg transition-colors hover:opacity-80" style={{ color: "var(--color-danger)", backgroundColor: "transparent" }}>
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 surface border-b flex items-center justify-between px-4 md:hidden" style={{ borderColor: "var(--color-border)" }}>
          <Link href="/dashboard" className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>ProjectFlow</Link>
          <div className="relative">
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-1 text-sm" style={{ color: "var(--color-foreground)" }}>
              {email || "Menu"}
              <ChevronDown className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 surface rounded-lg shadow-lg z-50 py-2" style={{ border: "1px solid var(--color-border)" }}>
                {links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:opacity-80" style={{ color: "var(--color-foreground)" }}>
                    {link.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm" style={{ color: "var(--color-danger)" }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
