"use client";

import { type ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange, drainRedirectError, syncServerSession } from "@/lib/firebase/client";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    drainRedirectError();

    return onAuthChange((firebaseUser) => {
      setUser(
        firebaseUser
          ? {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            }
          : null
      );
      setLoading(false);

      if (firebaseUser) {
        syncServerSession(firebaseUser);
        if (AUTH_PATHS.includes(window.location.pathname)) {
          router.replace("/dashboard");
        }
      }
    });
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
