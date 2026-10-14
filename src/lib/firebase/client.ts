import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

const googleProvider = new GoogleAuthProvider();

const firebaseAuth = auth!;
const firebaseDb = db!;

export async function signInWithGoogle() {
  console.log("Starting Google redirect sign-in...");
  await signInWithRedirect(firebaseAuth, googleProvider);
}

export async function establishSession(idToken: string): Promise<boolean> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) {
    console.error("Failed to create session:", res.status, await res.text());
  }

  return res.ok;
}

export async function completeRedirectSignIn(): Promise<boolean> {
  console.log("Checking for redirect result...");
  return new Promise<boolean>((resolve) => {
    let resolved = false;
    let timeout: ReturnType<typeof setTimeout>;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid}` : "No user");
      if (resolved) return;

      if (user) {
        resolved = true;
        clearTimeout(timeout);
        try {
          console.log("Creating session for user:", user.uid);
          const userRef = doc(firebaseDb, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            console.log("Creating new user document");
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }

          const idToken = await user.getIdToken();
          console.log("Got ID token, calling /api/auth/session");
          resolve(await establishSession(idToken));
        } catch (err) {
          console.error("Error completing redirect sign-in:", err);
          resolve(false);
        } finally {
          unsubscribe();
        }
      }
    });

    timeout = setTimeout(() => {
      console.log("Timeout waiting for auth state");
      resolved = true;
      unsubscribe();
      resolve(false);
    }, 8000);
  });
}

export async function signOut() {
  await firebaseSignOut(firebaseAuth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, callback);
}

export { auth, db };
