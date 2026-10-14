"use client";

import { type ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/firebase/client";
import { ensureUserProfile, getUserProfile } from "@/lib/firebase/users";

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
    return onAuthChange((firebaseUser) => {
      setLoading(false);

      if (!firebaseUser) {
        setUser(null);
        return;
      }

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      });

      // Firestore holds the user profile; create it on first sign-in, then read it.
      ensureUserProfile(firebaseUser).catch(() => {});
      getUserProfile(firebaseUser.uid)
        .then((profile) => {
          if (!profile) return;
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: profile.displayName ?? firebaseUser.displayName,
            photoURL: profile.photoURL ?? firebaseUser.photoURL,
          });
        })
        .catch(() => {});

      if (AUTH_PATHS.includes(window.location.pathname)) {
        router.replace("/dashboard");
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
