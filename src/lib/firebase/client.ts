import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithRedirect, signOut as firebaseSignOut, onAuthStateChanged, getRedirectResult, User, UserCredential } from "firebase/auth";
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

async function createSessionForUser(user: User): Promise<boolean> {
  const userRef = doc(firebaseDb, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
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
  return establishSession(idToken);
}

function waitForAuthState(timeoutMs: number): Promise<User | null> {
  return new Promise((resolve) => {
    let settled = false;
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve(user);
    });
    setTimeout(() => {
      if (settled) return;
      settled = true;
      unsubscribe();
      resolve(null);
    }, timeoutMs);
  });
}

export async function completeRedirectSignIn(): Promise<{ sessionEstablished: boolean; error?: unknown }> {
  console.log("Checking for redirect result...");

  try {
    // getRedirectResult is the only API that surfaces redirect failures; without it
    // a failed Google redirect throws an unhandled promise rejection on page load.
    const result: UserCredential | null = await getRedirectResult(firebaseAuth);
    if (result?.user) {
      console.log("Redirect sign-in completed for:", result.user.uid);
      return { sessionEstablished: await createSessionForUser(result.user) };
    }
  } catch (err) {
    console.error("Redirect sign-in failed:", err);
    return { sessionEstablished: false, error: err };
  }

  // No redirect in flight: adopt an already signed-in client session so the
  // server session cookie is restored (e.g. cookie expired or was cleared).
  const user = await waitForAuthState(5000);
  if (!user) {
    console.log("No signed-in user");
    return { sessionEstablished: false };
  }

  console.log("Restoring server session for user:", user.uid);
  try {
    return { sessionEstablished: await createSessionForUser(user) };
  } catch (err) {
    console.error("Session restoration failed:", err);
    return { sessionEstablished: false, error: err };
  }
}

export function resolveNextPath(fallback = "/dashboard"): string {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export async function signOut() {
  await firebaseSignOut(firebaseAuth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, callback);
}

export { auth, db };
