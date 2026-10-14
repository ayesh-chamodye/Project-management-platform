"use client";

import { type ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeRedirectSignIn, resolveNextPath } from "@/lib/firebase/client";

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

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

function isAuthPage(pathname: string): boolean {
  return AUTH_PATHS.includes(pathname);
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
        const result = await completeRedirectSignIn();
        sessionEstablished = result.sessionEstablished;
        if (result.error) {
          console.error("Sign-in could not be completed:", result.error);
        }
      } catch (err) {
        console.error("Redirect sign-in error:", err);
      }
      await refresh();
      if (sessionEstablished && isAuthPage(window.location.pathname)) {
        router.replace(resolveNextPath());
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
