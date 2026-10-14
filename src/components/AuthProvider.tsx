"use client";

import { type ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeRedirectSignIn } from "@/lib/firebase/client";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
});

function resolveNextPath(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function refresh() {
    try {
      const res = await fetch("/api/auth/check", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      let sessionEstablished = false;
      try {
        sessionEstablished = await completeRedirectSignIn();
      } catch (err) {
        console.error("Redirect sign-in error:", err);
      }
      await refresh();
      if (sessionEstablished) {
        router.replace(resolveNextPath("/dashboard"));
      }
    }
    init();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
